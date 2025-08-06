# Changelog

## [2.2.3](https://github.com/omrilotan/isbot/compare/v2.2.2...v2.2.3)

- Replace internal dependency

## [2.2.2](https://github.com/omrilotan/isbot/compare/v2.2.1...v2.2.2)

- Tiny overlook

## [2.2.1](https://github.com/omrilotan/isbot/compare/v2.2.0...v2.2.1)

- Allow to throw strings as errors in `colombo` (useful for custom error messages)

## [2.2.0](https://github.com/omrilotan/isbot/compare/v2.1.0...v2.2.0)

- Support reading sourcemap location from [SourceMap header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/SourceMap)

## [2.1.0](https://github.com/omrilotan/isbot/compare/v2.0.0...v2.1.0)

- Support reading and creating a config file (`colombo --config`)

## [2.0.0](https://github.com/omrilotan/isbot/compare/v1.3.7...v2.0.0)

- Support adding custom headers to HTTP requests (see help)
- Drop support for EOL Node.js engines
- Change import to named (consuming as a module is now `import { colombo } from 'colombo'`)
