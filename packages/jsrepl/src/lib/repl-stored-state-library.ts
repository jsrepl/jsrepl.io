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
            const now = new Date();
            now.toTimeString();

            setTimeout(() => {
              console.log('a');
            }, 0);

            Promise.resolve().then(() => {
              console.log('b');
            });

            function foo(a: number) {
              try {
                return a;
              } finally {
                return a * 2;
              }
            }

            foo(1);
            foo(2);
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
            import confetti from 'canvas-confetti';

            const now = new Date();
            format(now, 'dd-MM-yyyy');

            confetti({
              particleCount: 400,
              origin: {
                y: 1
              }
            });
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

            const options = {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            };

            function success(pos) {
              const crd = pos.coords;

              console.log("Your current position is:");
              console.log(\`Latitude : \${crd.latitude}\`);
              console.log(\`Longitude: \${crd.longitude}\`);
              console.log(\`More or less \${crd.accuracy} meters.\`);
            }

            function error(err) {
              console.warn(\`ERROR(\${err.code}): \${err.message}\`);
            }

            navigator.geolocation.getCurrentPosition(success, error, options);
          `,
          kind: ReplFS.Kind.File,
        },
        'index.html': {
          content: dedent`
            <select>
              <option selected disabled>Select color...</option>
              <option value="indianred">Indian Red</option>
              <option value="cornflowerblue">Cornflower Blue</option>
              <option value="lime">Lime</option>
              <option value="gold">Gold</option>
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

            <div class="p-4 prose dark:prose-invert">
              <h1 class="text-4xl italic">Hello, world!</h1>
            </div>
          `,
          kind: ReplFS.Kind.File,
        },
        'index.css': {
          content: dedent`
            @tailwind base;
            @tailwind components;
            @tailwind utilities;

            body {
              @apply text-stone-800 dark:text-stone-100;
            }
          `,
          kind: ReplFS.Kind.File,
        },
        'tailwind.config.ts': {
          content: dedent`
            import type { Config } from 'tailwindcss';
            import typography from '@tailwindcss/typography';

            export default {
              content: ['**/*'],
              corePlugins: {
                preflight: true,
              },
              plugins: [typography],
              darkMode: 'class',
            } satisfies Config;
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

  react: {
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
            import { useState, useCallback } from 'react?dev';

            const root = createRoot(document.getElementById('root'));
            root.render(<App />);

            function App() {
              const [counter, setCounter] = useState(0);

              const decrement = useCallback(() => {
                setCounter((x) => x - 1)
              }, [])

              const increment = useCallback(() => {
                setCounter((x) => x + 1)
              }, [])

              return (
                <>
                  <h1 className="m-0 italic">Hello, world!</h1>
                  <p className="space-x-2">
                    <button onClick={decrement}>-</button>
                    <span>Counter: {counter}</span>
                    <button onClick={increment}>+</button>
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
  },
} satisfies Record<string, ReplStoredState>
