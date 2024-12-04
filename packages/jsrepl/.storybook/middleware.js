const { createProxyMiddleware } = require('http-proxy-middleware')

const simpleRequestLogger = (proxyServer, options) => {
  proxyServer.on('proxyReq', (proxyReq, req, res) => {
    console.log(`PROXY [${req.method}] ${req.originalUrl}`)
  })
}

module.exports = function expressMiddleware(router) {
  router.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3000/api',
      changeOrigin: true,
      plugins: [simpleRequestLogger],
    })
  )
}
