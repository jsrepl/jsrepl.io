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
  id: SystemRepls.demoBrowserEnv,
  created_at: systemReplsCreatedAt,
  user_id: systemReplsUserId,
  title: 'Demo Browser Environment',
  description: 'Demo REPL with Geolocation Web API and <select> control',
  active_model: '/index.ts',
  opened_models: ['/index.ts', '/index.html', '/index.css'],
  show_preview: true,
  fs: {
    root: {
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
    },
  },
} satisfies ReplUpdatePayload
