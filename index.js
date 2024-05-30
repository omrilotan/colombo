import { SourceMapConsumer } from "source-map";
import chalk from "chalk";
import { snippet } from "./lib/snippet/index.js";

const { yellow, red } = chalk;

/**
 * @param {string}  o.url     Sourcemap URL
 * @param {number}  o.line    Error Line
 * @param {number}  o.column  Error column
 * @param {Headers} o.headers Request Headers
 * @returns {string} Source code visualisation
 */
export async function colombo({ url, column, line, headers }) {
	try {
		column = Number(column);
		line = Number(line);

		if (Number.isNaN(column) || Number.isNaN(line)) {
			return '"column" and "line" must be numbers';
		}

		const data = await getData(url, { headers });
		if (data instanceof Error) {
			throw red(`Could not find file at ${url}:\n${data.message}`);
		}

		const consumer = await new SourceMapConsumer(data);
		const source = consumer.originalPositionFor({ line, column });
		if (!source.source) {
			throw red(
				`Could not find source code from original position line ${line}, column ${column}`,
			);
		}
		const sourceContent = consumer.sourceContentFor(source.source);
		if (!sourceContent) {
			throw red(
				`Could not find source code for ${source.source.split("\n").pop()} position line ${line}, column ${column}`,
			);
		}
		const content = sourceContent.split("\n");
		consumer.destroy();

		return [
			yellow([source.source, source.line, source.column].join(":")),
			"\n------\n",
			snippet({ content, source }),
			"\n------",
		].join("");
	} catch (error) {
		if (error.response) {
			error.message = `Request map file at ${url} resulted in ${error.response.status} ${error.response.statusText}`;
		}

		throw error;
	}
}

/**
 * Retrieve source map data from a remote URL
 */
async function getData(url, { headers } = {}) {
	try {
		const response = await fetch(url, { headers });
		if (!response.ok) {
			throw new Error(
				`Failed to load file ${url}: ${response.status} ${response.statusText}`,
			);
		}
		const data = await response.text();

		if (
			typeof data === "string" &&
			data?.startsWith("<") &&
			response.headers["content-type"].includes("html")
		) {
			throw new Error(
				`${url} returns an HTML document with the title "${result.data.match(/<title>(.*)<\/title>/)?.pop()}"`,
			);
		}
		try {
			return JSON.parse(data);
		} catch (error) {
			return error;
		}
	} catch (error) {
		return error;
	}
}
