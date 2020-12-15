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

	const [ , , l, c ] = file.split(':');
	const { url, column, line } = await prompt(
		[
			{
				name: 'url',
				message: 'Source map',
				type: 'input',
				default: file.replace(/\?.*/, '') + '.map',
			},
			{
				name: 'column',
				message: 'Column number',
				type: 'number',
				default: c,
			},
			{
				name: 'line',
				message: 'Line number',
				type: 'number',
				default: l,
			},
		],
	);

	update('Loading...');
	const result = await colombo({ url, line, column });
	end();

	return result;
}
