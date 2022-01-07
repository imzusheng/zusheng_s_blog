const router = require('@koa/router')()
const path = require('path')
const fs = require('fs')
const config = require('../../config/config')
const {
        API_ROOT
      } = require('../../config/api')
const { fileExist } = require('../../util')
const { GetRouterPath } = require('../../util')
const getRouterPath = new GetRouterPath('API_UPLOAD')

/**
 * @api {post} /api/upload/once upload/once - 单次上传文件
 * @apiVersion 1.0.0
 * @apiName 修改文章
 * @apiHeader {String} token 用户令牌
 *
 * @apiParam (必须) {String} uid                    文件uid
 * @apiParam (必须) {String} filename               文件名
 * @apiParam (必须) {String} hash                   hash
 * @apiParam (可选) {String} [postfix]              文件名后缀
 *
 * @apiGroup adminRouter
 * @apiSampleRequest off
 */
router.post(getRouterPath.r('POST_COMMON_UPLOAD'), async (ctx) => {
  const {
          uid,
          filename,
          hash,
          postfix
        } = ctx.request.body
  const file = ctx.request.files.file
  const extname = path.extname(filename).toLowerCase() // 获取文件后缀
  const writeFileName = `file_${hash}${extname}` // 文件名字
  const writeFilePath = path.join(config.fastPath.assets, writeFileName)
  const exist = await fileExist(writeFilePath)
  let error = null
  if (!exist) {
    try {
      const reader = fs.readFileSync(file.path)
      fs.writeFileSync(writeFilePath, reader)
    } catch (e) {
      error = e
    }
  }
  ctx.body = {
    error,
    result: {
      uid,
      hash,
      postfix: '.' + postfix || extname,
      writeFileName,
      filename,
      status: 'done',
      url: `${API_ROOT.BASE_URL + getRouterPath.r('POST_COMMON_UPLOAD')}?filename=${writeFileName}`
    }
  }
})
// const fp = path.resolve(config.fastPath.root, 'config', 'test.js')
// fs.writeFile(
//   fp,
//   ''
//   'utf-8',
//   error => {
//     console.log(error)
//   })

module.exports = router
