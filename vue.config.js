// const path = require('path')

module.exports = {
  publicPath: './', // ./相对路径
  // configureWebpack 传递一个对象，对象内部属性和 webpack 属性完全一致，最后使用webpack-merge进行合并
  // 参考: https://cli.vuejs.org/zh/config/#configurewebpack
  configureWebpack: {
    entry: './examples/main',
    output: {
      // filename: 'vue-better-tree.min.js',
      // library: 'vue-better-tree',
      // libraryTarget: 'umd',
      // umdNamedDefine: true
    }
    // externals: {
    //   vue: {
    //     root: 'Vue',
    //     commonjs: 'vue',
    //     commonjs2: 'vue',
    //     amd: 'vue'
    //   }
    // },
    // resolve: {
    //   extensions: ['.js', '.vue']
    // }
  },
  // 输出只能用此目录,否则报错(https://cli.vuejs.org/zh/guide/webpack.html#%E7%AE%80%E5%8D%95%E7%9A%84%E9%85%8D%E7%BD%AE%E6%96%B9%E5%BC%8F)
  outputDir: './dist'
}
