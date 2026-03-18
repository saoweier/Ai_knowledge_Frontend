module.exports = {
  devServer: {
    port: 8087,
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: (error) => {
          const message = String(error?.message || error || '')
          return !message.includes('ResizeObserver loop')
        }
      }
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8093',
        changeOrigin: true,
      }
    }
  }
}
