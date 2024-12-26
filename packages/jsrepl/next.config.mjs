/* eslint-disable no-console */
import createMDX from '@next/mdx'
import { readFileSync } from 'fs'
import Icons from 'unplugin-icons/webpack'

envVars()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],

  images: {
    formats: ['image/avif', 'image/webp'],
  },

  headers() {
    return [
      {
        source: '/e.js',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_PREVIEW_URL,
          },
        ],
      },
    ]
  },

  rewrites() {
    return [
      {
        source: '/a.js',
        destination: 'https://cloud.umami.is/script.js',
      },
    ]
  },

  webpack(config) {
    config.plugins.push(
      Icons({
        compiler: 'jsx',
        jsx: 'react',
      })
    )

    return config
  },
}

const withMDX = createMDX({
  extension: /\.mdx?$/,
  // Add markdown plugins here, as desired
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig)

function envVars() {
  console.log('NODE_ENV', process.env.NODE_ENV)
  process.env.NEXT_PUBLIC_NODE_ENV = process.env.NODE_ENV

  if (!process.env.NEXT_PUBLIC_APP_VERSION) {
    // Root package.json
    const packageJson = readFileSync('../../package.json', 'utf8')
    const packageJsonData = JSON.parse(packageJson)
    process.env.NEXT_PUBLIC_APP_VERSION = packageJsonData.version
  }

  console.log('APP VERSION', process.env.NEXT_PUBLIC_APP_VERSION)

  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_BRANCH_URL?.includes('jsrepl')) {
    process.env.NEXT_PUBLIC_PREVIEW_URL =
      'https://' + process.env.VERCEL_BRANCH_URL.replace('jsrepl', 'jsrepl-preview')
  }

  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://' + process.env.NEXT_PUBLIC_VERCEL_URL
    } else {
      throw new Error('NEXT_PUBLIC_SITE_URL is not set')
    }
  }

  console.log('SITE URL', process.env.NEXT_PUBLIC_SITE_URL)
}
