import createMDX from '@next/mdx'
import Icons from 'unplugin-icons/webpack'

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
