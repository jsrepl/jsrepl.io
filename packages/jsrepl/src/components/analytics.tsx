'use client'

import Script from 'next/script'

export default function Analytics() {
  return (
    <>
      {process.env.NEXT_PUBLIC_NODE_ENV === 'production' && (
        <Script
          src="/a.js"
          data-website-id="23c57346-41a9-4b0f-a07a-76f8bf7c4ff3"
          data-exclude-search="true"
          strategy="afterInteractive"
          onLoad={() => {
            umami.identify({
              userAgent: navigator.userAgent,
            })
          }}
        />
      )}
    </>
  )
}
