publishing to npm
=================

The JavaScript runtime is published on npm.
There is nothing to build since JavaScript is based on source code only.
The JavaScript itself is tested using npm, so assumption is npm is already installed.
The publishing itself relies on the information in src/antlr4/package.json.

## Publishing

To publish from the shell navigate to the src/ directory.

You may need to login to npm if you're not already.
```bash
npm login
```

Once authenticated publishing can be done with:
```bash
npm publish
```
