import { defaultTailwindConfigJson } from './repl-stored-state/defaults'

const virtualDocsMdFileContent = `# Welcome to https://jsrepl.io

Here is a brief documentation on how to cook REPLs.

## Entrypoint

### With index.html

The default entrypoint is \`index.html\` in the root of the REPL. 
It can be defined as a complete HTML5 template or just as a \`<body>\` contents.
Include your scripts in \`index.html\` using \`<script>\` tags:

\`\`\`html
<script type="module" src="/path/to/your/script.ts"></script>
\`\`\`

### Without index.html

If there is no \`index.html\` in the root of the REPL, the REPL will treat
all JS/TS files as entrypoints.
By default, they will be executed in the order they are found in the REPL,
but it depends on cross-file dependencies between them.

## CSS

You can add your CSS files to \`index.html\` using \`<link>\` tags:

\`\`\`html
<link rel="stylesheet" href="/path/to/your/style.css">
\`\`\`

or import them in your scripts:

\`\`\`js
import './path/to/your/style.css';
\`\`\`

## NPM Packages

Just import them in your scripts:

\`\`\`js
import { somePackage } from 'some-package';
\`\`\`

If you would like to use a specific version of the package, specify the version
in the import name:

\`\`\`js
import { somePackage } from 'some-package@1.2.3';
\`\`\`

\`package.json\` is not supported at the moment.

## TailwindCSS

To use TailwindCSS in your REPL, the only thing you need to do is to add
tailwind directives to one of your CSS entrypoints:

\`\`\`css
@tailwind base;
@tailwind components;
@tailwind utilities;
\`\`\`

Here is the default Tailwind config:

\`\`\`json
${JSON.stringify(defaultTailwindConfigJson, null, 2)}
\`\`\`

Optionally, you can add your custom Tailwind config in a \`tailwind.config.ts\`
or \`tailwind.config.js\` file in the root of the REPL.

## React

React JSX & TSX is supported out of the box.

## Prettier

Press \`CMD+S\` or \`Ctrl+S\` to format your code with Prettier and save changes.

## Have fun! 🎉
`

export const virtualFilesStorage = new Map<string, string>([
  ['virtual:///DOCS.md', virtualDocsMdFileContent],
])
