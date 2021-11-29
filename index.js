const { SourceMapConsumer } = require('source-map');
const axios = require('axios');
const { yellow, red } = require('chalk');
const { snippet } = require('./lib/snippet');

/**
 * @param {string}  o.url    Sourcemap URL
 * @param {number}  o.line   Error Line
 * @param {number}  o.column Error column
 * @returns {string} Source code visualisation
 */
module.exports = async function colombo({ url, column, line }) {
	try {
		column = Number(column);
		line = Number(line);

		if (Number.isNaN(column) || Number.isNaN(line)) {
			return '"column" and "line" must be numbers';
		}

		const data = await getData(url);
		if (data instanceof Error) {
			throw red(`Could not find file at ${url}:\n${data.message}`);
		}

		const consumer = await new SourceMapConsumer(data);
		const source = consumer.originalPositionFor({ line, column });
		if (!source.source) {
			throw red(`Could not find source code from original position line ${line}, column ${column}`);
		}
		const sourceContent = consumer.sourceContentFor(source.source);
		if (!sourceContent) {
			throw red(`Could not find source code for ${source.source.split('\n').pop()} position line ${line}, column ${column}`);
		}
		const content = sourceContent.split('\n');
		consumer.destroy();

		return [
			yellow([
				source.source,
				source.line,
				source.column,
			].join(':')),
			'\n------\n',
			snippet({ content, source }),
			'\n------',
		].join('');
	} catch (error) {
		if (error.response) {
			error.message = `Request map file at ${url} resulted in ${error.response.status} ${error.response.statusText}`;
		}

		throw error;
	}
};


async function getData(url) {
	try {
		const result = await axios({ method: 'get', url });
		if (!result.status.toString().startsWith('2')) {
			throw new Error(`${url} returned status ${result.status}`);
		}
		if (typeof result.data === 'string' && result.data?.startsWith('<') && result.headers['content-type'].includes('html')) {
			throw new Error(`${url} returns an HTML document with the title "${result.data.match(/<title>(.*)<\/title>/)?.pop()}"`);
		}
		const { data } = result;
		return data;
	} catch (error) {
		return error;
	}
}
