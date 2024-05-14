#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import inquirer from "inquirer";
import chalk from "chalk";
import semver from "semver";
import { config } from "./lib/config/index.js";
import { getSourceCodeMapUrl } from "./lib/getSourceCodeMapUrl/index.js";
import { loader } from "./lib/loader/index.js";
import { update } from "./lib/update/index.js";

const { satisfies } = semver;
const { bold, red } = chalk;
const { prompt } = inquirer;

start();

async function start() {
	const packageJson = await readFile(
		new URL("./package.json", import.meta.url),
		"utf8",
	);
	const {
		name,
		version,
		homepage,
		dependencies: {},
		engines: { node },
		bugs: { url: bugUrl },
	} = JSON.parse(packageJson);

	if (!satisfies(process.version, node)) {
		console.error(
			new Error(
				`This node version (${process.version}) is not supported (${node}).`,
			),
		);
		process.exit(1);
	}

	try {
		const { colombo } = await import("./index.js");

		// Lazy call to update. Intentional race condition.
		update({ name, version })
			.then(
				(message) => message && process.on("exit", () => console.log(message)),
			)
			.catch(() => null);

		const { headers, help, showVersion, arg, configured } = await config(
			process.argv,
		);

		if (help) {
			console.log(await readFile(new URL("./man", import.meta.url), "utf8"));
		}
		if (showVersion) {
			console.log([name, version].join("@"));
		}
		if (configured || help || showVersion) {
			process.exit(0);
		}

		const { file } = await prompt([
			{
				name: "file",
				message: "File URL (optional)",
				type: "input",
				default: arg,
			},
		]);

		const match = file.match(/:(?<line>\d+):(?<column>\d+)$/);
		const { groups = { line: undefined, column: undefined, file } } =
			match || {};
		const clean = file.replace(/:\d+:\d+$/, "").replace(/\?.*/, "");
		let url;
		if (!headers.has("User-Agent")) {
			headers.set(
				"User-Agent",
				`node (compatible; Colombo/${version}; bot; +${homepage})`,
			);
		}
		if (clean) {
			loader.start("Load file");
			const response = await fetch(clean, { headers });
			if (!response.ok) {
				throw new Error(
					`Failed to load file ${clean}: ${response.status} ${response.statusText}`,
				);
			}
			const code = await response.text();
			loader.end();
			const mapUrl = getSourceCodeMapUrl(code, clean);

			if (mapUrl) {
				({ url } = await prompt([
					{
						name: "url",
						message: "Source map (found)",
						type: "input",
						default: mapUrl,
						validate: Boolean,
					},
				]));
			} else {
				({ url } = await prompt([
					{
						name: "url",
						message: "Source map (assumed)",
						type: "input",
						default: clean + ".map",
						validate: Boolean,
					},
				]));
			}
		} else {
			({ url } = await prompt([
				{
					name: "url",
					message: "Source map",
					type: "input",
					validate: Boolean,
				},
			]));
		}

		if (!url) {
			throw new Error("Source-map is a must");
		}

		const { column, line } = await prompt([
			{
				name: "line",
				message: "Line number",
				type: "number",
				default: groups.line || 1,
			},
			{
				name: "column",
				message: "Column number",
				type: "number",
				default: groups.column || 1,
			},
		]);

		loader.start("Load source map");
		const result = await colombo({ url, line, column });
		loader.end();
		console.log(result);
		process.exit(0);
	} catch (error) {
		loader.end();
		console.log("\n");
		if (typeof error.toJSON === "function") {
			console.error(error.toJSON());
			process.exit(1);
		}
		error.message = red(error.message);
		console.error(error);

		console.log(`
I can see you were not successful. Feel free to ${bold("submit an issue")}
${bugUrl}`);
		process.exit(1);
	}
}
