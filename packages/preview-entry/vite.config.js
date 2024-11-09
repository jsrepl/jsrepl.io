import { URL, fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // eslint-disable-next-line no-console
  console.log('Vite mode', mode)

  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  const jsreplOrigin = getJSReplOrigin()

  return {
    define: {
      __JSREPL_ORIGIN__: JSON.stringify(jsreplOrigin),
    },

    build: {
      outDir: '../jsrepl/public',
      emptyOutDir: false,
      assetsDir: '.',
      rollupOptions: {
        input: {
          e: fileURLToPath(new URL('./src/main.ts', import.meta.url)),
        },
        output: {
          entryFileNames: '[name].js',
        },
      },
    },
  }

  function getJSReplOrigin() {
    if (env.VERCEL_ENV === 'production') {
      const urlWoProtocol = env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL
      if (urlWoProtocol) {
        return 'https://' + urlWoProtocol
      }
    }

    if (env.VERCEL_ENV === 'preview' && env.VERCEL_BRANCH_URL) {
      return 'https://' + env.VERCEL_BRANCH_URL
    }

    if (['development', undefined, ''].includes(env.VERCEL_ENV) && env.JSREPL_ORIGIN) {
      return env.JSREPL_ORIGIN
    }

    const info = {
      VERCEL_ENV: env.VERCEL_ENV,
      VERCEL_BRANCH_URL: env.VERCEL_BRANCH_URL,
      VERCEL_PROJECT_PRODUCTION_URL: env.VERCEL_PROJECT_PRODUCTION_URL,
      VERCEL_URL: env.VERCEL_URL,
      JSREPL_ORIGIN: env.JSREPL_ORIGIN,
    }

    throw new Error(
      `preview-entry: getJSReplOrigin error. Invalid configuration. ${JSON.stringify(info)}`
    )
  }
})
