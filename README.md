# colombo [![](https://img.shields.io/npm/v/colombo.svg)](https://www.npmjs.com/package/colombo)

## 🕵️‍♂️ Use remote source-map to view Javascript source code from CLI

Run and follow instructions:

```bash
npx colombo
```

![](https://user-images.githubusercontent.com/516342/103102893-ef27da00-4626-11eb-928a-9c67c077520d.gif)

## Features

- Interactive
- Supports reading sourcemap location from [SourceMap header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/SourceMap)
- Tries to figure out the source-map location from the source file content
- Tries to figure out line and column from stack trace style input
- Configure custom headers (one-time or persistant) †

> † Persistant configuration is stored in `~/.colomborc`.

## Manual

<!-- Edit man file to change the following content>
<!-- MAN START -->

```txt
NAME
	colombo - Read source code from sourcemap location

SYNOPSIS
	colombo [file[:line[:column]]] [options]

DESCRIPTION
	Use remote source-map to view Javascript source code from CLI

EXAMPLES
	$ colombo https://cdn.example.com/app.d0892a2.js:1:9694
	$ colombo https://cdn.example.com/app.d0892a2.js

OPTIONS
	--help										Show help
	--version, -V							Show version number
	--config									Read / Add persistant configuration
	--header, -H "key: value"	Add a header to the request


EXAMPLES
	$ colombo --help
	$ colombo https://cdn.example.com/app.d0892a2.js:1:9694 -H "Access-Token: 1234"
	$ colombo --config
	$ colombo --config -H "access-token: 1234"
```

<!-- MAN END -->
