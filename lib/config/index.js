import { parseArgs } from "node:util";
import { homedir } from "node:os";
import { join } from "node:path";
import fs, { readFile, writeFile } from "node:fs/promises";
import inquirer from "inquirer";
import chalk from "chalk";

const { prompt } = inquirer;
const { green: add, red: remove, white: same } = chalk;

export async function config(argv) {
	const configPath = join(homedir(), ".colomborc");
	const fileExsits = await fs.stat(configPath).catch(() => false);
	const configContent = fileExsits ? await readFile(configPath, "utf8") : "";

	const configurations = configContent ? JSON.parse(configContent) : {};

	const {
		values: {
			header = [],
			help = false,
			version: showVersion = false,
			config = false,
		},
		positionals: [arg = ""],
	} = parseArgs({
		args: argv.slice(2),
		options: {
			header: {
				type: "string",
				short: "H",
				multiple: true,
			},
			version: {
				type: "boolean",
				short: "V",
			},
			help: {
				type: "boolean",
			},
			config: {
				type: "boolean",
			},
		},
		allowPositionals: true,
		strict: false,
	});

	const headerEntries = [
		...(configurations.headers || []).map((header) =>
			Object.entries(header).at(0),
		),
		...header
			.map((header) => header.split(":").map((value) => value.trim()))
			.map(([key, value]) => [key.toLowerCase(), value]),
	];

	if (config) {
		const newConfig = {};
		if (headerEntries) {
			newConfig.headers = headerEntries.map(([key, value]) => ({
				[key]: value,
			}));
		}
		const newConfigString = JSON.stringify(newConfig, null, 2);
		if (
			configContent &&
			newConfigString &&
			configContent.trim() !== newConfigString
		) {
			console.log(compare(configContent, newConfigString));
			const { overwrite } = await prompt([
				{
					name: "overwrite",
					message: "Overwrite existing configuration (Y/n)?",
					type: "string",
					default: "Yes",
				},
			]);
			if (/^y/i.test(overwrite)) {
				await writeFile(configPath, JSON.stringify(newConfig, null, 2));
			}
		} else if (configContent) {
			console.log("Config:", "\n", configContent);
		} else if (newConfigString) {
			await writeFile(configPath, newConfigString);
			console.log("New config:", "\n", newConfigString);
		}
	}

	return {
		arg,
		configured: config,
		headers: new Headers(headerEntries),
		help,
		showVersion,
	};
}

function compare(before, after) {
	const linesBefore = before.trim().split("\n");
	const linesAfter = after.split("\n");
	const linesCount = Math.max(linesBefore.length, linesAfter.length);
	const output = ["Changes to config:"];
	for (let index = 0; index < linesCount; index++) {
		const lineBefore = linesBefore.at(index);
		const lineAfter = linesAfter.at(index);
		if (lineBefore === lineAfter) {
			output.push(same(lineBefore || lineAfter));
		} else {
			lineBefore && output.push(remove(`- ${lineBefore}`));
			lineAfter && output.push(add(`+ ${lineAfter}`));
		}
	}
	return output.join("\n");
}
