import { dirname, join } from "node:path";
import { URL } from "node:url";
import sourceMappingURL from "source-map-url";

export function getSourceCodeMapUrl(source, url) {
	const file = sourceMappingURL.getFrom(source);

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
		return join(origin, file);
	}

	return [dirname(url), file].join("/");
}
