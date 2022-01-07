const router = require('@koa/router')()
const config = require('../../config/config')
const MIME = require('../../config/MIME.js')
const { formatDate } = require('../../util')
const fs = require('fs')
const path = require('path')
const { GetRouterPath } = require('../../util')
const getRouterPath = new GetRouterPath('API_STATIC')

// 处理文件名 log
function transformFilename (fn) {
  const date = formatDate(new Date(fn.slice(fn.indexOf('.') + 1, fn.lastIndexOf('.'))).getTime(), 'transform', '-')
  return fn.replace(fn.slice(fn.indexOf('.') + 1, fn.lastIndexOf('.')), date)
}

/**
 * @api {get} /assets assets - 获取静态资源
 * @apiVersion 1.0.0
 * @apiName 获取静态资源
 *
 * @apiParam (必须) {String} filename             文件名，带后缀
 * @apiParam (必须) {String} [raw]                内容
 * @apiParam (必须) {String} [type]               log/blog
 *
 * @apiGroup adminRouter
 * @apiSampleRequest off
 */
router.get(getRouterPath.rRoot('GET_STATIC'), async (ctx) => {
  let data
  const {
    filename,
    raw,
    type
  } = ctx.query
  try {
    const extname = path.extname(filename).toLowerCase() // 获取文件后缀
    let staticPath = type === 'blog' ? config.fastPath.assetsBlog : config.fastPath.assets // 静态文件夹路径
    let finalFilename = filename
    if (extname === '.log') { // 当静态文件是日志时,处理一下filename中的时间格式 yyyy-MM-dd
      finalFilename = transformFilename(filename)
      staticPath = config.fastPath.logs
    }
    const filePath = path.join(staticPath, finalFilename) // 文件路径 + 文件名 = 完整路径
    const dispositionFilename = raw || finalFilename // 响应头中的描述filename
    const dispositionFilenameEncode = encodeURIComponent(dispositionFilename) // Content-Disposition 需要转换
    ctx.set({
      'Content-Type': `${MIME[extname]}`,
      'Content-Disposition': `attachment; filename=${dispositionFilenameEncode}`
    })
    data = await fs.readFileSync(filePath)
  } catch (e) {
    data = e
    console.log('staticRouter Error', e)
  }
  ctx.body = data
})

module.exports = router
