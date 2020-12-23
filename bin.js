#!/usr/bin/env node

const { prompt } = require('inquirer');
const { clear, update, end } = require('stdline');
const axios = require('axios');
const { getSourceCodeMapUrl } = require('./lib/getSourceCodeMapUrl');
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
				default: arg,
			},
		],
	);

	const match = file.match(/:(?<line>\d+):(?<column>\d+)$/);
	const { groups = { line: undefined, column: undefined, file } } = match || {};
	const clean = file.replace(/:\d+:\d+$/, '').replace(/\?.*/, '');
	update('Load remote file');
	const { data: code } = await axios({ method: 'get', url: clean });
	clear();
	const mapUrl = await getSourceCodeMapUrl(code, clean);

	const { url, column, line } = await prompt(
		[
			{
				name: 'url',
				message: 'Source map',
				type: 'input',
				default: mapUrl || (clean + '.map'),
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

	update('Load source map');
	const result = await colombo({ url, line, column });
	end();

	return result;
}
