import { readFileSync } from 'fs'

const isDev = process.env.NODE_ENV === 'development'
const publicRuntimeConfig = getPublicRuntimeConfig()

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-07-12',

  devtools: {
    enabled: true,

    // Tmp disabled due to https://github.com/nuxt/devtools/issues/722
    componentInspector: false,
  },

  runtimeConfig: {
    public: {
      ...publicRuntimeConfig,
    },
  },

  routeRules: {
    '/': { prerender: true },
    '/contact': { prerender: true },
    '/terms': { prerender: true },
    '/privacy': { prerender: true },

    // Note: routeRules do not work in DEV mode for static files
    // https://github.com/nuxt/nuxt/issues/26740
    // In dev mode `vite.server.cors = true` is used as a workaround.
    '/e.js': {
      headers: {
        'Access-Control-Allow-Origin': publicRuntimeConfig.previewUrl,
      },
    },
  },

  vite: {
    server: {
      // Allow all methods from any origin, for dev only.
      cors: true,
    },
  },

  modules: [
    '@nuxt/eslint',
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@nuxt/test-utils/module',
    '@nuxtjs/supabase',
    'shadcn-nuxt',
    'nuxt-security',
    '@nuxt/content',
    '@nuxt/icon',
  ],

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      cookieRedirect: true,
      // Routes to include in the redirect to the `login` if the user is not authenticated.
      include: undefined,
      // Routes to exclude from the redirect to the `login` if the user is not authenticated.
      exclude: ['*'],
    },
  },

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui',
  },

  // TODO: fix Safari in dev: Failed to load resource: An SSL error has occurred and a secure connection to the server cannot be made.
  security: {
    enabled: true,

    // corsHandler: {
    //   origin: '*',
    //   allowHeaders: '*',
    //   exposeHeaders: '*',
    // },

    headers: {
      crossOriginEmbedderPolicy: 'unsafe-none',
      contentSecurityPolicy: {
        'frame-src': [
          publicRuntimeConfig.previewUrl,
          // Allow Nuxt devtools in dev mode.
          isDev && "'self'",
        ].filter((x) => typeof x === 'string'),

        // Defaults, plus wasm-unsafe-eval.
        'script-src': [
          "'self'", // Fallback value, will be ignored by most modern browsers (level 3)
          'https:', // Fallback value, will be ignored by most modern browsers (level 3)
          "'unsafe-inline'", // Fallback value, will be ignored by almost any browser (level 2)
          "'strict-dynamic'", // Strict CSP via 'strict-dynamic', supported by most modern browsers (level 3)
          "'nonce-{{nonce}}'", // Enables CSP nonce support for scripts in SSR mode, supported by almost any browser (level 2)
          "'wasm-unsafe-eval'",
        ],

        // Defaults, plus
        // - avatars.githubusercontent.com and github.com (user avatars)
        // - cdn.buymeacoffee.com (buymeacoffee.com donation button)
        'img-src': [
          "'self'",
          'data:',
          'https://avatars.githubusercontent.com',
          'https://github.com',
          'https://cdn.buymeacoffee.com',
        ],
      },
    },
  },

  $development: {
    hooks: {
      'pages:extend'(pages) {
        pages.push({
          name: 'storybook',
          path: '/storybook',
          file: '@/storybook/index.vue',
        })
      },
    },
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        types: [
          // means including @types/dom-view-transitions
          'dom-view-transitions',
        ],
      },
    },
  },

  content: {
    markdown: {
      anchorLinks: false,
    },
  },
})

function getPreviewUrl() {
  if (
    ['production', 'development', undefined, ''].includes(process.env.VERCEL_ENV) &&
    process.env.JSREPL_PREVIEW_URL
  ) {
    return process.env.JSREPL_PREVIEW_URL
  }

  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_BRANCH_URL?.includes('jsrepl')) {
    return 'https://' + process.env.VERCEL_BRANCH_URL.replace('jsrepl', 'jsrepl-preview')
  }

  const info = {
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
    NUXT_ENV_VERCEL_ENV: process.env.NUXT_ENV_VERCEL_ENV,
    NUXT_ENV_VERCEL_BRANCH_URL: process.env.NUXT_ENV_VERCEL_BRANCH_URL,
    JSREPL_PREVIEW_URL: process.env.JSREPL_PREVIEW_URL,
    // Normally should be unset:
    NUXT_PUBLIC_PREVIEW_URL: process.env.NUXT_PUBLIC_PREVIEW_URL,
  }

  throw new Error(`getPreviewUrl error. Invalid configuration. ${JSON.stringify(info)}`)
}

function getAppVersion() {
  if (process.env.JSREPL_CUSTOM_APP_VERSION) {
    return process.env.JSREPL_CUSTOM_APP_VERSION
  }

  const version = readFileSync('./version', 'utf8').trim()
  if (!version) {
    throw new Error('getAppVersion: no version')
  }

  return version
}

function getPublicRuntimeConfig() {
  // Workaround for Vercel CI: deploying the project `packages/preview` triggers "postinstall: nuxt prepare"
  // in package.json in `packages/jsrepl`, even if `pnpm install` called with `-F !jsrepl`
  // (I can't reproduce it locally). So `nuxt prepare` calls `defineNuxtConfig` here, but `getPreviewUrl()`
  // is not intended to be called during deploy of the `packages/preview`.
  if (process.env.NUXT_PREPARE === '1') {
    return {
      appVersion: undefined,
      previewUrl: undefined,
    }
  }

  const appVersion = getAppVersion()
  const previewUrl = getPreviewUrl()

  console.log('APP VERSION', appVersion)

  return { appVersion, previewUrl }
}
