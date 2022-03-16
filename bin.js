#!/usr/bin/env node

const { prompt } = require('inquirer');
const axios = require('axios');
const { bold, red } = require('chalk');
const { satisfies } = require('semver');
const { getSourceCodeMapUrl } = require('./lib/getSourceCodeMapUrl');
const { loader } = require('./lib/loader');
const { update } = require('./lib/update');
const {
	version,
	homepage,
	dependencies: { axios: axiosVersion },
	engines: { node },
	bugs: { url: bugUrl },
} = require('./package.json');

if (!satisfies(process.version, node)) {
	console.error(new Error(`This node version (${process.version}) is not supported (${node}).`));
	process.exit(1);
}

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

	console.log(`
I can see you were not successful. Feel free to ${bold('submit an issue')}
${bugUrl}`);
});

let updateMessage;

async function start() {
	try {
		update().then(message => {
			updateMessage = message;
		}).catch(() => null);

		const [ arg = '' ] = process.argv.slice(2);

		const { file } = await prompt(
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
		let url;

		if (clean) {
			loader.start('Load file');
			const { data: code } = await axios({ method: 'get', url: clean });
			loader.end();
			const mapUrl = getSourceCodeMapUrl(code, clean);

			if (mapUrl) {
				({ url } = await prompt([ {
					name: 'url',
					message: 'Source map (found)',
					type: 'input',
					default: mapUrl,
					validate: Boolean,
				} ])
				);
			} else {
				({ url } = await prompt([ {
					name: 'url',
					message: 'Source map (assumed)',
					type: 'input',
					default: clean + '.map',
					validate: Boolean,
				} ])
				);
			}
		} else {
			({ url } = await prompt([ {
				name: 'url',
				message: 'Source map',
				type: 'input',
				validate: Boolean,
			} ])
			);
		}

		if (!url) {
			throw new Error('Source-map is a must');
		}

		const { column, line } = await prompt(
			[
				{
					name: 'line',
					message: 'Line number',
					type: 'number',
					default: groups.line || 1,
				},
				{
					name: 'column',
					message: 'Column number',
					type: 'number',
					default: groups.column || 1,
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
