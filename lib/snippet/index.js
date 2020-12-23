const { bold, dim, yellow } = require('chalk');
const { listIndex } = require('../listIndex');

exports.snippet = function snippet({
	content,
	source: { line, column },
}) {
	const index = line - 1;
	const start = Math.max(index - 5, 0);
	const end = Math.min(index + 5, content.length);
	const width = end.toString().length;

	return content
		.slice(start, end)
		.map(
			(code, index) => {
				const num = index + start + 1;
				const prefix = listIndex(num, width);
				const print = [];

				if (num === line) {
					const pad = prefix.length + column + 1;

					// Add code line
					print.push(yellow(prefix), bold(code));

					// Add column marker
					print.push('\n', '^'.padStart(pad, ' '));
				} else {
					print.push(dim(prefix), code);
				}

				return print.join('');
			},
		)
		.join('\n');
};
