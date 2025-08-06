#!/usr/bin/env node

import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const root = join(new URL(".", import.meta.url).pathname, "..");
const manFile = await readFile(join(root, "man"), "utf8");
const readmeFile = await readFile(join(root, "README.md"), "utf8");
const updatedReadmeFile = readmeFile.replace(
	/(<!-- MAN START -->)([\s\S]*?)(<!-- MAN END -->)/gim,
	["$1", "", "```man", manFile.trim(), "```", "", "$3"].join("\n"),
);

await writeFile(join(root, "README.md"), updatedReadmeFile);
