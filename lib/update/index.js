import semver from "semver";
const { gt } = semver;

export async function update({ name, version }) {
	const response = await fetch(
		`https://registry.npmjs.com/-/package/${name}/dist-tags`,
	);
	const { latest } = await response.json();
	return gt(latest, version)
		? [
				"📦",
				`I can see you're running ${name} ${version}. Version ${latest} is available.`,
				'Install the latest version: "npm i colombo@latest -g"',
			].join("\n")
		: "";
}
