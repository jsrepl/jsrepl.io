export const starterHtml = `<div class="flex items-center justify-center h-full dark:text-stone-100">
  <time id="clock" class="text-5xl font-bold"></time>
</div>

<script type="module" src="/index.ts"></script>
`

export const starterCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
  height: 100%;
}

body {
  margin: 0;
  padding: 1rem;
}

*,
::before,
::after {
  box-sizing: border-box;
}
`

export const starterTs = `import { format } from 'date-fns';
import './index.css';

let now = new Date();

const clock = document.getElementById('clock') as HTMLTimeElement;
clock.dateTime = now.toISOString();
clock.textContent = formatTime(now);

setInterval(() => {
  now = new Date();
  clock.dateTime = now.toISOString();
  clock.textContent = formatTime(now);
}, 1000);

function formatTime(date: Date) {
  return format(date, 'HH:mm:ss');
}
`

export const defaultTailwindConfigTs = `import type { Config } from 'tailwindcss';

export default {
  content: ['**/*'],
  corePlugins: {
    preflight: false,
  },
  darkMode: 'class',
} satisfies Config;
`

export const defaultTailwindConfigJson = {
  corePlugins: {
    preflight: false,
  },
  darkMode: 'class',
}

export const defaultHtmlFileContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
  </head>
  <body></body>
</html>
`

export const defaultReadmeMdFileContent = '# New REPL\n'

export const defaultDocsMdFileContent = 'virtual:///DOCS.md'

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

Press \`CMD+S\` to format your code with Prettier.

## README.md

You can add a \`README.md\` file to the root of the REPL to describe your REPL.
The title of the REPL will be taken from the \`README.md\` file and rendered
into the \`<title>\` tag of the page.

## Have fun! 🎉

The main goal of the https://jsrepl.io is to make it easier and faster to experiment
with JavaScript/TypeScript snippets, considering today's needs including NPM packages,
React, TailwindCSS, Prettier, etc.

I hope you will enjoy using it! 🚀

https://jsrepl.io is free and open source ✨. If you have any ideas on how to improve it,
please let me know by opening an issue on GitHub: https://github.com/jsrepl/jsrepl.io/issues.
I would really appreciate your feedback and suggestions. 

If you like the project, consider giving it a ⭐️ on GitHub https://github.com/jsrepl/jsrepl.io
or make a small donation 💖 to support the development and cover some of the costs
of the domain and running the service:
https://github.com/sponsors/nag5000 or https://buymeacoffee.com/nag5000.

With 🧡, Alexey.
`

/**
 * Array of file paths relative to the root of the REPL, starting with `/`.
 */
export const readOnlyFiles = new Set(['/DOCS.md'])

export const virtualFilesStorage = new Map<string, string>([
  ['virtual:///DOCS.md', virtualDocsMdFileContent],
])
