import { NextRequest, NextResponse } from 'next/server'

// https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  const cspHeader = `
    default-src 'self';
    script-src 'self' https: 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval' 'unsafe-eval';
    style-src 'self' https: 'unsafe-inline';
    img-src 'self' blob: data: https://avatars.githubusercontent.com https://github.com https://cdn.buymeacoffee.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    frame-src ${process.env.NEXT_PUBLIC_PREVIEW_URL};
    connect-src 'self' https://esm.sh https://api-gateway.umami.dev/api/send;
    ${process.env.NEXT_PUBLIC_NODE_ENV === 'production' /* https://stackoverflow.com/a/71109928 */ ? 'upgrade-insecure-requests;' : ''}
  `

  const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)

  return response
}

// https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
