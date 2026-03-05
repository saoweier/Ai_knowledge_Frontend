module.exports = {
  devServer: {
    port: 8087,
    proxy: {
      '/api': {
        target: 'http://localhost:8093',
        changeOrigin: true,
      }
    }
  }
}
