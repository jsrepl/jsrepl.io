import dedent from 'string-dedent'
import * as ReplFS from '@/lib/repl-fs'
import {
  defaultDocsMdFileContent,
  systemReplsCreatedAt,
  systemReplsUserId,
} from '@/lib/repl-stored-state/defaults'
import { SystemRepls } from '@/lib/repl-stored-state/system-repls'
import { ReplUpdatePayload } from '@/types'

export default {
  id: SystemRepls.demoReact,
  created_at: systemReplsCreatedAt,
  user_id: systemReplsUserId,
  title: 'Demo React',
  description: 'Demo REPL with React, TSX, and TailwindCSS',
  active_model: '/index.tsx',
  opened_models: ['/index.tsx', '/index.html', '/index.css'],
  show_preview: true,
  fs: {
    root: {
      kind: ReplFS.Kind.Directory,
      children: {
        'index.tsx': {
          content: dedent`
            import './index.css'
            import { createRoot } from 'react-dom/client?dev';
            import { useState } from 'react?dev';

            const root = createRoot(document.getElementById('root'));
            root.render(<App />);

            function App() {
              const [counter, setCounter] = useState(0);

              function decrement() {
                setCounter((x) => x - 1);
              }

              function increment() {
                setCounter((x) => x + 1);
              }

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
    },
  },
} satisfies ReplUpdatePayload
