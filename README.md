# colombo [![](https://img.shields.io/npm/v/colombo.svg)](https://www.npmjs.com/package/colombo)

## 🕵️‍♂️ Use source-map to view Javascript source code from CLI

Run and follow instructions:

```bash
npx colombo
```

![](https://user-images.githubusercontent.com/516342/103102893-ef27da00-4626-11eb-928a-9c67c077520d.gif)

```bash
$ colombo [file[:line[:column]]] [options]

Examples:

$ colombo --help
$ colombo https://cdn.example.com/app.d0892a20d266460d6c63.js
$ colombo https://cdn.example.com/app.d0892a20d266460d6c63.js:1:9694
$ colombo https://cdn.example.com/app.d0892a20d266460d6c63.js:1:9694 -H "Access-Token: 1234"

Options:
  --header, -H "key: value" Add a header to the request
  --version, -V             Show version number
  --help                    Show help
```
