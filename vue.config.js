const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const packageInfo = require('./package.json')

const resolve = (dir) => path.join(__dirname, dir)

module.exports = {
  productionSourceMap: false,
  publicPath: './',
  css: {
    loaderOptions: {
      less: {
        lessOptions: {},
      },
    },
  },
  configureWebpack(config) {
    // 生产时再解开注释
    const plugins = [
      new TerserPlugin({
        terserOptions: {
          compress: {
            warnings: false,
            // eslint-disable-next-line camelcase
            drop_debugger: true,
            // eslint-disable-next-line camelcase
            drop_console: false,
          },
        },
        sourceMap: true,
        parallel: true,
      }),
    ]
    if (process.env.NODE_ENV !== 'development') {
      config.plugins = [...config.plugins, ...plugins]
    }

  },
  devServer: {
    host: '0.0.0.0',
    disableHostCheck: true,
    historyApiFallback: true,
  },
}
