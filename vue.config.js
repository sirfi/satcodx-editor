module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'SatcoDX Editor'
    }
  }
}