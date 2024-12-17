import dedent from 'string-dedent'
import * as ReplFS from '@/lib/repl-fs'
import {
  defaultDocsMdFileContent,
  defaultTailwindConfigTs,
  systemReplsCreatedAt,
  systemReplsUserId,
} from '@/lib/repl-stored-state/defaults'
import { SystemRepls } from '@/lib/repl-stored-state/system-repls'
import { ReplUpdatePayload } from '@/types'

export default {
  id: SystemRepls.demo,
  created_at: systemReplsCreatedAt,
  user_id: systemReplsUserId,
  title: 'Demo',
  description: 'Demo REPL',
  active_model: '/index.ts',
  opened_models: ['/index.ts', '/index.html', '/index.css'],
  show_preview: true,
  fs: {
    root: {
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
    },
  },
} satisfies ReplUpdatePayload
