/* eslint-disable no-console */
import 'dotenv/config'
import { createServerAdminClient } from '@/lib/supabase/serverAdmin'

seedSystemRepls()

async function seedSystemRepls() {
  const systemRepls = await Promise.all([
    import('./system-repls/demo-browser-env'),
    import('./system-repls/demo-live-feedback'),
    import('./system-repls/demo-npm-packages'),
    import('./system-repls/demo-react'),
    import('./system-repls/demo-tailwindcss'),
    import('./system-repls/demo-typescript'),
    import('./system-repls/demo'),
    import('./system-repls/html-css-js'),
    import('./system-repls/html-css-ts'),
    import('./system-repls/js-empty'),
    import('./system-repls/js'),
    import('./system-repls/react'),
    import('./system-repls/tailwindcss'),
    import('./system-repls/ts-empty'),
    import('./system-repls/ts'),
  ]).then((modules) => modules.map((m) => m.default))

  const supabase = createServerAdminClient()
  const { error, status, statusText } = await supabase.from('repls').upsert(systemRepls)

  console.log(status, statusText)

  if (error) {
    console.error(error)
  } else {
    console.log(`Done.`)
  }
}
