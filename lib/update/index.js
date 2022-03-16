const axios = require('axios');
const { gt } = require('semver');
const { name, version } = require('../../package.json');

module.exports.update = async function update() {
	const { data: { latest } } = await axios({ method: 'get', url: `https://registry.npmjs.com/-/package/${name}/dist-tags` });
	return gt(latest, version)
		? [
			'📦',
			`I can see you're running ${name} ${version}. Version ${latest} is available.`,
			'Install the latest version: "npm i colombo@latest -g"',
		].join('\n')
		: ''
	;
};
