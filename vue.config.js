// const { defineConfig } = require('@vue/cli-service')
module.exports = {
  devServer: {
    port: 8087,
    proxy: {
      '/api': {
        target: 'http://localhost:8093',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      },'/edit': {
        target: 'http://localhost:8094',
        changeOrigin: true,
        pathRewrite: { '^/edit': '' }
      },'/kg': {
        target: 'http://localhost:8095',
        changeOrigin: true,
        pathRewrite: { '^/kg': '' }
      },
    }
  }
}
