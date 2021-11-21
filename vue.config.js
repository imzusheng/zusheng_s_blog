const path = require('path')
const Timestamp = new Date().getTime()
const webpack = require('webpack')
const CompressionPlugin = require('compression-webpack-plugin')
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
// const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [
        path.resolve(__dirname, './src/less/variable/index.less')
      ]
    }
  },
  lintOnSave: false,
  chainWebpack: config => {
    config.plugin('compressionPlugin')
          .use(new CompressionPlugin({
            // test: new RegExp(`/.(${['js', 'css'].join('|')})$/`), // 匹配文件名
            test: /\.(js|css)(\?.*)?$/i,
            filename: '[path].gz[query]', // 压缩后的文件名(保持原文件名，后缀加.gz)
            algorithm: 'gzip', // 使用gzip压缩
            threshold: 10240, // 对超过10k的数据压缩
            minRatio: 0.8 // 压缩率小于0.8才会压缩
          }))
    // .use(new BundleAnalyzerPlugin())
    config.resolve.alias.set('assets', '@/assets')
    config.plugins.delete('prefetch')
  },
  configureWebpack: {
    plugins: [
      new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/)
    ],
    optimization: {
      // 模块在代码中被复用或者来自 node_modules 文件夹
      // 模块的体积大于等于30kb（压缩之前）
      // 当按需加载 chunks 时，并行请求的最大数量不能超过5
      // 初始页面加载时，并行请求的最大数量不能超过将3
      splitChunks: {
        // // 表示选择哪些 chunks 进行分割，可选值有：async，initial和all
        // chunks: 'all',
        // // 表示新分离出的chunk必须大于等于minSize，默认为30000，约30kb。
        minSize: 30000,
        // // 表示一个模块至少应被minChunks个chunk所包含才能分割。默认为1。
        // minChunks: 1,
        // // 表示按需加载文件时，并行请求的最大数目。默认为5。
        // maxAsyncRequests: 5,
        // // 表示加载入口文件时，并行请求的最大数目。默认为3。
        // maxInitialRequests: 3,
        // // 表示拆分出的chunk的名称连接符。默认为~。如chunk~vendors.js
        // automaticNameDelimiter: '~',
        // // 设置chunk的文件名。默认为true。当为true时，splitChunks基于chunk和cacheGroups的key自动命名。
        // name: true,
        // // cacheGroups 下可以可以配置多个组，每个组根据test设置条件，符合test条件的模块，就分配到该组。模块可以被多个组引用，但最终会根据priority来决定打包到哪个组中。默认将所有来自 node_modules目录的模块打包至vendors组，将两个以上的chunk所共享的模块打包至default组。
        cacheGroups: {
          default: {
            name: 'common',
            chunks: 'all',
            minChunks: 2,
            priority: -11
          },
          node_modules: {
            test: /[\\/]node_modules[\\/]/,
            chunks: 'initial',
            priority: -10
          },
          ant_design: {
            test: /[\\/]node_modules\\ant-design-vue[\\/]/,
            chunks: 'initial',
            reuseExistingChunk: true,
            priority: -9
          },
          ant_design_lib: {
            test: /[\\/]node_modules\\@ant-design[\\/]/,
            chunks: 'initial',
            reuseExistingChunk: true,
            priority: -8
          }
          // util: {
          //   test: /src\\util/,
          //   chunks: 'all',
          //   priority: -9
          // }
        }
      }
    }
  },
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          'primary-color': '#007AFF'
          // 'primary-color': '#666666'
        },
        javascriptEnabled: true
      }
    },
    // 每次打包后生成的css携带时间戳
    extract: {
      filename: `css/[name].${Timestamp}.css`,
      chunkFilename: `css/[name].${Timestamp}.css`
    }
  },
  productionSourceMap: false
}
