const { SourceMapConsumer } = require('source-map');
const axios = require('axios');
const { yellow } = require('chalk');
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

		const { data } = await axios({ method: 'get', url });
		const consumer = await new SourceMapConsumer(data);
		const source = consumer.originalPositionFor({ line, column });
		const content = consumer.sourceContentFor(source.source).split('\n');
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
			return `Request map file at ${url} resulted in ${error.response.status} ${error.response.statusText}`;
		}

		return error;
	}
};
