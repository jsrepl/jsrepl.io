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
      modulePreload: false,
      assetsDir: '.',
      rollupOptions: {
        external: ['https://__JSREPL_ORIGIN__/e.js'],
      },
    },

    server: {
      port: 5199,
    },

    preview: {
      port: 5199,
    },

    plugins: [
      {
        name: 'index-html-transform',
        transformIndexHtml(html) {
          html = html.replace(/https:\/\/__JSREPL_ORIGIN__/g, jsreplOrigin)
          return html
        },
      },
    ],
  }

  function getJSReplOrigin() {
    if (
      ['production', 'development', undefined, ''].includes(env.VERCEL_ENV) &&
      env.JSREPL_ORIGIN
    ) {
      return env.JSREPL_ORIGIN
    }

    if (env.VERCEL_ENV === 'preview' && env.VERCEL_BRANCH_URL?.includes('jsrepl-preview')) {
      return 'https://' + env.VERCEL_BRANCH_URL.replace('jsrepl-preview', 'jsrepl')
    }

    const info = {
      VITE_VERCEL_ENV: env.VITE_VERCEL_ENV,
      VITE_VERCEL_BRANCH_URL: env.VITE_VERCEL_BRANCH_URL,
      VERCEL_ENV: env.VERCEL_ENV,
      VERCEL_BRANCH_URL: env.VERCEL_BRANCH_URL,
      JSREPL_ORIGIN: env.JSREPL_ORIGIN,
    }

    throw new Error(`getJSReplOrigin error. Invalid configuration. ${JSON.stringify(info)}`)
  }
})
