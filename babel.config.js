module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    ['import',
      {
        libraryName: 'ant-design-vue',
        libraryDirectory: 'es',
        style: true // `style: true` 会加载 less 文件
      }
    ],
    '@vue/babel-plugin-jsx'
  ]
}
