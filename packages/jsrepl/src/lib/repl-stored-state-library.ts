import dedent from 'string-dedent'
import * as ReplFS from '@/lib/repl-fs'
import { ReplStoredState } from '@/types'

export const defaultTailwindConfigTs = dedent`
  import type { Config } from 'tailwindcss';

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

export const defaultHtmlFileContent = dedent`
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
    </head>
    <body></body>
  </html>
`

export const defaultReadmeMdFileContent = '# New REPL\n'

export const defaultDocsMdFileContent = 'virtual:///DOCS.md'

export const demoStarter: ReplStoredState = {
  fs: new ReplFS.FS({
    kind: ReplFS.Kind.Directory,
    children: {
      'index.ts': {
        content: dedent`
          import { format } from 'date-fns';
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
        `,
        kind: ReplFS.Kind.File,
      },
      'index.html': {
        content: dedent`
          <div class="flex items-center justify-center h-full dark:text-stone-100">
            <time id="clock" class="text-5xl font-bold"></time>
          </div>

          <script type="module" src="/index.ts"></script>
        `,
        kind: ReplFS.Kind.File,
      },
      'index.css': {
        content: dedent`
          @tailwind base;
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
        `,
        kind: ReplFS.Kind.File,
      },
      'tailwind.config.ts': {
        content: defaultTailwindConfigTs,
        kind: ReplFS.Kind.File,
      },
      'DOCS.md': {
        content: defaultDocsMdFileContent,
        kind: ReplFS.Kind.File,
      },
    },
  }),
  openedModels: ['/index.ts', '/index.html', '/index.css'],
  activeModel: '/index.ts',
  showPreview: true,
}

export const reactStarter: ReplStoredState = {
  fs: new ReplFS.FS({
    kind: ReplFS.Kind.Directory,
    children: {
      'index.tsx': {
        content: dedent`
          import './index.css';
          import { createRoot } from 'react-dom/client?dev';
          import { useState } from 'react?dev';

          const root = createRoot(document.getElementById('root'));
          root.render(<App />);

          function App() {
            const [counter, setCounter] = useState(0);

            return (
              <>
                <h1 className="italic">Hello, world!</h1>
                <p className="space-x-1">
                  <button onClick={() => setCounter((x) => x - 1)}>-</button>
                  <span>Counter: {counter}</span>
                  <button onClick={() => setCounter((x) => x + 1)}>+</button>
                </p>
              </>
            );
          }
        `,
        kind: ReplFS.Kind.File,
      },
      'index.html': {
        content: dedent`
          <div id="root"></div>

          <script type="module" src="/index.tsx"></script>
        `,
        kind: ReplFS.Kind.File,
      },
      'index.css': {
        content: dedent`
          @tailwind base;
          @tailwind components;
          @tailwind utilities;
        `,
        kind: ReplFS.Kind.File,
      },
      'DOCS.md': {
        content: defaultDocsMdFileContent,
        kind: ReplFS.Kind.File,
      },
    },
  }),
  openedModels: ['/index.tsx', '/index.html', '/index.css'],
  activeModel: '/index.tsx',
  showPreview: true,
}

export const tailwindcssStarter: ReplStoredState = {
  fs: new ReplFS.FS({
    kind: ReplFS.Kind.Directory,
    children: {
      'index.html': {
        content: dedent`
          <!doctype html>
          <html lang="en">
            <head>
              <meta charset="utf-8" />
              <link rel="stylesheet" href="/index.css" />
            </head>
            <body>
              <span class="text-4xl font-bold dark:text-stone-100">Hello, world!</span>
            </body>
          </html>
        `,
        kind: ReplFS.Kind.File,
      },
      'index.css': {
        content: dedent`
          @tailwind base;
          @tailwind components;
          @tailwind utilities;
        `,
        kind: ReplFS.Kind.File,
      },
      'tailwind.config.ts': {
        content: defaultTailwindConfigTs,
        kind: ReplFS.Kind.File,
      },
      'DOCS.md': {
        content: defaultDocsMdFileContent,
        kind: ReplFS.Kind.File,
      },
    },
  }),
  openedModels: ['/index.html', '/index.css'],
  activeModel: '/index.html',
  showPreview: true,
}

export const tsStarter: ReplStoredState = {
  fs: new ReplFS.FS({
    kind: ReplFS.Kind.Directory,
    children: {
      'index.ts': {
        content: dedent`
          import { format } from 'date-fns';

          const now = new Date();
          const formatted = formatTime(now);

          function formatTime(date: Date) {
            return format(date, 'HH:mm:ss');
          }
        `,
        kind: ReplFS.Kind.File,
      },
      'DOCS.md': {
        content: defaultDocsMdFileContent,
        kind: ReplFS.Kind.File,
      },
    },
  }),
  openedModels: ['/index.ts'],
  activeModel: '/index.ts',
  showPreview: false,
}

export const jsStarter: ReplStoredState = {
  fs: new ReplFS.FS({
    kind: ReplFS.Kind.Directory,
    children: {
      'index.js': {
        content: dedent`
          import { format } from 'date-fns';

          const now = new Date();
          const formatted = formatTime(now);

          function formatTime(date) {
            return format(date, 'HH:mm:ss');
          }
        `,
        kind: ReplFS.Kind.File,
      },
      'DOCS.md': {
        content: defaultDocsMdFileContent,
        kind: ReplFS.Kind.File,
      },
    },
  }),
  openedModels: ['/index.js'],
  activeModel: '/index.js',
  showPreview: false,
}

export const htmlCssTsStarter: ReplStoredState = {
  fs: new ReplFS.FS({
    kind: ReplFS.Kind.Directory,
    children: {
      'index.ts': {
        content: dedent`
          import './index.css';

          console.log('Hello, world!');
        `,
        kind: ReplFS.Kind.File,
      },
      'index.html': {
        content: dedent`
          <!doctype html>
          <html lang="en">
            <head>
              <meta charset="utf-8" />
              <script type="module" src="/index.ts"></script>
            </head>
            <body>
              <span class="text-4xl font-bold dark:text-stone-100">Hello, world!</span>
            </body>
          </html>
        `,
        kind: ReplFS.Kind.File,
      },
      'index.css': {
        content: dedent`
          @tailwind base;
          @tailwind components;
          @tailwind utilities;
        `,
        kind: ReplFS.Kind.File,
      },
      'DOCS.md': {
        content: defaultDocsMdFileContent,
        kind: ReplFS.Kind.File,
      },
    },
  }),
  openedModels: ['/index.ts', '/index.html', '/index.css'],
  activeModel: '/index.ts',
  showPreview: true,
}

export const htmlCssJsStarter: ReplStoredState = {
  fs: new ReplFS.FS({
    kind: ReplFS.Kind.Directory,
    children: {
      'index.js': {
        content: dedent`
          import './index.css';

          console.log('Hello, world!');
        `,
        kind: ReplFS.Kind.File,
      },
      'index.html': {
        content: dedent`
          <!doctype html>
          <html lang="en">
            <head>
              <meta charset="utf-8" />
              <script type="module" src="/index.js"></script>
            </head>
            <body>
              <span class="text-4xl font-bold dark:text-stone-100">Hello, world!</span>
            </body>
          </html>
        `,
        kind: ReplFS.Kind.File,
      },
      'index.css': {
        content: dedent`
          @tailwind base;
          @tailwind components;
          @tailwind utilities;
        `,
        kind: ReplFS.Kind.File,
      },
      'DOCS.md': {
        content: defaultDocsMdFileContent,
        kind: ReplFS.Kind.File,
      },
    },
  }),
  openedModels: ['/index.js', '/index.html', '/index.css'],
  activeModel: '/index.js',
  showPreview: true,
}

export const demoRepls = {
  liveFeedback: {
    activeModel: '/index.ts',
    openedModels: ['/index.ts'],
    showPreview: false,
    fs: new ReplFS.FS({
      kind: ReplFS.Kind.Directory,
      children: {
        'index.ts': {
          content: dedent`
            setInterval(() => {
              const now = new Date();
              now.toTimeString();
            }, 100);

            const p = new Promise((res) => {
              setTimeout(() => res('JSREPL'), 2000);
            });

            const site = await p;
          `,
          kind: ReplFS.Kind.File,
        },
        'DOCS.md': {
          content: defaultDocsMdFileContent,
          kind: ReplFS.Kind.File,
        },
      },
    }),
  },

  npmPackages: {
    activeModel: '/index.ts',
    openedModels: ['/index.ts'],
    showPreview: false,
    fs: new ReplFS.FS({
      kind: ReplFS.Kind.Directory,
      children: {
        'index.ts': {
          content: dedent`
            import { format } from 'date-fns';

            const now = new Date();
            format(now, 'dd-MM-yyyy');
          `,
          kind: ReplFS.Kind.File,
        },
        'DOCS.md': {
          content: defaultDocsMdFileContent,
          kind: ReplFS.Kind.File,
        },
      },
    }),
  },

  browserEnv: {
    activeModel: '/index.ts',
    openedModels: ['/index.ts', '/index.html', '/index.css'],
    showPreview: true,
    fs: new ReplFS.FS({
      kind: ReplFS.Kind.Directory,
      children: {
        'index.ts': {
          content: dedent`
            import './index.css'

            const el = document.querySelector('select');
            el.addEventListener('change', () => {
              document.body.style.backgroundColor = el.value;
            });
          `,
          kind: ReplFS.Kind.File,
        },
        'index.html': {
          content: dedent`
            <select>
              <option selected disabled>Select color...</option>
              <option value="red">Red</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="yellow">Yellow</option>
            </select>

            <script type="module" src="/index.ts"></script>
          `,
          kind: ReplFS.Kind.File,
        },
        'index.css': {
          content: dedent`
            html {
              zoom: 1.3;
            }
          `,
          kind: ReplFS.Kind.File,
        },
        'DOCS.md': {
          content: defaultDocsMdFileContent,
          kind: ReplFS.Kind.File,
        },
      },
    }),
  },

  typescript: {
    activeModel: '/index.ts',
    openedModels: ['/index.ts'],
    showPreview: false,
    fs: new ReplFS.FS({
      kind: ReplFS.Kind.Directory,
      children: {
        'index.ts': {
          content: dedent`
            let date = new Date();
            date = 0;

            enum Color {
              Red = 'red',
              Yellow = 'yellow',
              Blue = 'blue',
              Green = 'green',
            }

            const color: Color = Color.Green;
          `,
          kind: ReplFS.Kind.File,
        },
        'DOCS.md': {
          content: defaultDocsMdFileContent,
          kind: ReplFS.Kind.File,
        },
      },
    }),
  },

  tailwindcss: {
    activeModel: '/index.html',
    openedModels: ['/index.html', '/index.css', '/tailwind.config.ts'],
    showPreview: true,
    fs: new ReplFS.FS({
      kind: ReplFS.Kind.Directory,
      children: {
        'index.html': {
          content: dedent`
            <link rel="stylesheet" href="/index.css" />
            <div class="text-2xl underline underline-offset-4">Hello, world!</div>
          `,
          kind: ReplFS.Kind.File,
        },
        'index.css': {
          content: dedent`
            @tailwind base;
            @tailwind components;
            @tailwind utilities;

            body {
              @apply dark:text-lime-500;
            }
          `,
          kind: ReplFS.Kind.File,
        },
        'tailwind.config.ts': {
          content: defaultTailwindConfigTs,
          kind: ReplFS.Kind.File,
        },
        'DOCS.md': {
          content: defaultDocsMdFileContent,
          kind: ReplFS.Kind.File,
        },
      },
    }),
  },

  jsx: {
    activeModel: '/index.tsx',
    openedModels: ['/index.tsx', '/index.html', '/index.css'],
    showPreview: true,
    fs: new ReplFS.FS({
      kind: ReplFS.Kind.Directory,
      children: {
        'index.tsx': {
          content: dedent`
            import './index.css'
            import { createRoot } from 'react-dom/client?dev';

            const root = createRoot(document.getElementById('root'));
            root.render(<App />);

            function App() {
              return <h1 className="italic">Hello, world!</h1>;
            }
          `,
          kind: ReplFS.Kind.File,
        },
        'index.html': {
          content: dedent`
            <div id="root"></div>

            <script type="module" src="/index.tsx"></script>
          `,
          kind: ReplFS.Kind.File,
        },
        'index.css': {
          content: dedent`
            @tailwind base;
            @tailwind components;
            @tailwind utilities;
          `,
          kind: ReplFS.Kind.File,
        },
        'DOCS.md': {
          content: defaultDocsMdFileContent,
          kind: ReplFS.Kind.File,
        },
      },
    }),
  },

  prettier: {
    activeModel: '/index.ts',
    openedModels: ['/index.ts'],
    showPreview: false,
    fs: new ReplFS.FS({
      kind: ReplFS.Kind.Directory,
      children: {
        'index.ts': {
          content: dedent`
            const arr = [
              1, 2, 3, 
              4, 5]

            function getRandom (arr: number[]){
            return 4
            }

            if(getRandom(arr) === 4) {
                console.log('How lucky!')
            } 

            // Press ⌘+S to format the code with Prettier.
          `,
          kind: ReplFS.Kind.File,
        },
        'DOCS.md': {
          content: defaultDocsMdFileContent,
          kind: ReplFS.Kind.File,
        },
      },
    }),
  },
} satisfies Record<string, ReplStoredState>
