import { ReplAliases } from '.'
import dedent from 'string-dedent'
import * as ReplFS from '@/lib/repl-fs'
import { ReplStoredState } from '@/types'
import { defaultDocsMdFileContent } from '../defaults'

export default {
  id: ReplAliases.react,
  created_at: '2024-12-08T10:48:11.318Z',
  updated_at: '2024-12-08T10:48:11.318Z',
  fs: {
    root: {
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
    },
  },
  openedModels: ['/index.tsx', '/index.html', '/index.css'],
  activeModel: '/index.tsx',
  showPreview: true,
} satisfies ReplStoredState
