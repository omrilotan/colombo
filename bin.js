#!/usr/bin/env node

const { prompt } = require('inquirer');
const { update, end } = require('stdline');
const colombo = require('.');

start().then(console.log);

async function start() {
	const [ arg ] = process.argv.slice(2);

	const { file = '' } = await prompt(
		[
			{
				name: 'file',
				message: 'File URL (optional)',
				type: 'input',
				default: arg
			},
		],
	);

	const match = file.match(/:(?<line>\d+):(?<column>\d+)$/);
	const { groups = { line: undefined, column: undefined, file } } = match || {};

	const { url, column, line } = await prompt(
		[
			{
				name: 'url',
				message: 'Source map',
				type: 'input',
				default: file.replace(/:\d+:\d+$/, '').replace(/\?.*/, '') + '.map',
			},
			{
				name: 'column',
				message: 'Column number',
				type: 'number',
				default: groups.column,
			},
			{
				name: 'line',
				message: 'Line number',
				type: 'number',
				default: groups.line,
			},
		],
	);

	update('Loading...');
	const result = await colombo({ url, line, column });
	end();

	return result;
}
