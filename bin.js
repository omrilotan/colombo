#!/usr/bin/env node

const { prompt } = require('inquirer');
const axios = require('axios');
const { red } = require('chalk');
const { getSourceCodeMapUrl } = require('./lib/getSourceCodeMapUrl');
const { loader } = require('./lib/loader');
const { update } = require('./lib/update');
const {
	version,
	homepage,
	dependencies: { axios: axiosVersion },
} = require('./package.json');
const colombo = require('.');


Object.assign(
	axios.defaults.headers.common,
	{ 'User-Agent': `axios/${axiosVersion.replace(/\W/, '')}; (compatible; Colombo/${version}; bot; +${homepage})` },
);

start().then(console.log).catch(error => {
	console.log('\n');
	if (typeof error.toJSON === 'function') {
		console.error(error.toJSON());
		return;
	}
	error.message = red(error.message);
	console.error(error);
});

let updateMessage;

async function start() {
	try {
		update().then(message => {
			updateMessage = message;
		}).catch(() => null);

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
		loader.start('Load file');
		const { data: code } = await axios({ method: 'get', url: clean });
		loader.end();
		const mapUrl = await getSourceCodeMapUrl(code, clean);

		const { url, column, line } = await prompt(
			[
				{
					name: 'url',
					message: mapUrl ? 'Source map (found)' : 'Source map (assumed)',
					type: 'input',
					default: mapUrl || (clean + '.map'),
				},
				{
					name: 'line',
					message: 'Line number',
					type: 'number',
					default: groups.line,
				},
				{
					name: 'column',
					message: 'Column number',
					type: 'number',
					default: groups.column,
				},
			],
		);

		loader.start('Load source map');
		const result = await colombo({ url, line, column });
		loader.end();

		return [ result, updateMessage ].filter(Boolean).join('\n');
	} catch (error) {
		loader.end();
		throw error;
	}
}
