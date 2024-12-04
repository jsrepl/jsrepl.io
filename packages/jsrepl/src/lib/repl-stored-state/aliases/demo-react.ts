import { ReplAliases } from '.'
import dedent from 'string-dedent'
import * as ReplFS from '@/lib/repl-fs'
import { ReplStoredState } from '@/types'
import { defaultDocsMdFileContent } from '../defaults'

export default {
  id: ReplAliases.demoReact,
  activeModel: '/index.tsx',
  openedModels: ['/index.tsx', '/index.html', '/index.css'],
  showPreview: true,
  fs: {
    root: {
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
    },
  },
} satisfies ReplStoredState
