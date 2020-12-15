const { SourceMapConsumer } = require('source-map');
const axios = require('axios');
const { bold, dim, yellow } = require('chalk');

/**
 * List index
 * @param {number} num
 * @param {number} width
 * @returns {string}
 */
const li = (num, width) => num.toString().padStart(width, ' ') + '. ';

/**
 * @param {string}  o.url    Sourcemap URL
 * @param {number}  o.line   Error Line
 * @param {number}  o.column Error column
 * @returns {string} Source code visualisation
 */
module.exports = async function colombo({ url, column, line }) {
	try {
		const { data } = await axios({ method: 'get', url });
		const consumer = await new SourceMapConsumer(data);
		const source = consumer.originalPositionFor({ line, column });
		const index = source.line - 1;
		const content = consumer.sourceContentFor(source.source).split('\n');
		const start = Math.max(index - 5, 0);
		const end = Math.min(index + 5, content.length);
		const width = end.toString().length;
		consumer.destroy();

		const snippet = content
			.slice(start, end)
			.map(
				(line, i) => {
					const num = i + start + 1;
					const prefix = li(num, width);

					if (num === source.line) {
						const pad = prefix.length + source.column;
						return [
							yellow(prefix),
							bold(line),
							'\n',
							'^'.padStart(pad, ' '),
						].join('');
					} else {
						return dim(prefix) + line;
					}
				},
			)
			.join('\n');

		return [
			yellow([
				source.source,
				source.line,
				source.column,
			].join(':')),
			'\n------\n',
			snippet,
			'\n------',
		].join('');
	} catch (error) {
		if (error.response) {
			return `Request map file at ${url} resulted in ${error.response.status} ${error.response.statusText}`;
		}

		return error;
	}
};
