# Eliza: Implementation for JavaScript

[![NPM version](https://badge.fury.io/js/eliza-core.svg)](http://badge.fury.io/js/eliza-core)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)

A JavaScript(TypeScript) code version of Eliza ported from
Charles Hayden's Java implementation: <http://chayden.net/eliza/Eliza.html>.

This rendition of ELIZA in TypeScript/JavaScript is designed as a complete and faithful
implementation of the original design that was described by Joseph Weizenbaum:
<https://doi.org/10.1145/365153.365168>.
The psychologist script that was attached on that paper is included as well, though the format
is a little revised for clarity and the possibility in other languages that is not segmented
with spaces in design, such as Japanese and Chinese.
Additionally, a Japanese script package as a deliberate example for this interpreter
has been released as well:
<https://www.npmjs.com/package/eliza-jp>

## Usage

```javascript
const eliza = require('eliza-core');
const util = require('eliza-util');
loadEliza(util.fromFile(util.SCRIPT_PATH + '/eliza.script')).then(eliza => {
  console.log(eliza.processInput('Hello, Eliza'));
});
```
