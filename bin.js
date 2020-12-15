#!/usr/bin/env node

const { prompt } = require('inquirer');
const { update, end } = require('stdline');
const colombo = require('.');


start().then(console.log);

async function start() {
	const { file } = await prompt(
		[
			{
				name: 'file',
				message: 'File URL (optional)',
				type: 'input',
			},
		],
	);
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
				type: 'numebr',
			},
			{
				name: 'line',
				message: 'Line number',
				type: 'numebr',
			},
		],
	);

	update('Loading...');
	const result = await colombo({ url, line, column });
	end();

	return result;
}
