const { dirname, join } = require('path');
const { URL } = require('url');

const pattern = /sourceMappingURL=(?<file>.*)/;

exports.getSourceCodeMapUrl = function (source, url) {
	const match = source.match(pattern);
	const file = match && match.groups && match.groups.file;

	if (!file) {
		return;
	}

	if (/^https?:\/\//.test(file)) {
		// Absolute
		return file;
	}

	if (/^\/\//.test(file)) {
		// Base of protocol
		return `https:${file}`;
	}

	if (/^\/\w/.test(file)) {
		// Base of domain
		const { origin } = new URL(url);
		return join( origin, file );
	}

	return [ dirname(url), file ].join('/');
};
