const path = require('path')

module.exports = {
  mongoDB: {},
  serverPort: 3000,
  // 自定义路径别名
  fastPath: {
    root: path.resolve('.'),
    assets: path.resolve('./assets'),
    assetsBlog: path.resolve('./assets/blog'),
    logs: path.resolve('./logs')
  },
  koaBodyOpt: { // 用koaBody接收文件，koa-multer我有洁癖受不了
    multipart: true,
    parsedMethods: ['POST', 'PUT', 'PATCH', 'GET', 'HEAD', 'DELETE'],
    // strict: false,
    formidable: {
      // uploadDir: Config.staticPath, // 设置文件上传目录
      // name = `${file.name}-${Date.now()}-${file.originalname}`
      // maxFieldsSize: 1000 * 1024 * 1024, // 文件上传大小
      multipart: true,
      keepExtensions: true, // 保持文件的后缀
      onFileBegin: (name, file) => { // 文件上传前的设置
      }
    }
  },
  mongodb: {
    url: 'mongodb://localhost:27017/blog?authSource=admin',
    dbName: 'blog'
  },
  jwtOpt: {
    key: 'shhhhhhh'
  }
}
