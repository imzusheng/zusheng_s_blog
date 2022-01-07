const config = require('./config/config')
const Koa = require('koa')
const koaBody = require('koa-body')
const cors = require('koa2-cors')
const app = new Koa()
const { router, authorizationRouter } = require('./router/app')
const { getBeforeDate, verifyToken, formatDate } = require('./util')
const { loggerRouter, loggerUncaught, loggerAll } = require('./util/log4js')
const MongoDB = require('./util/mongodb')
config.mongoDB = new MongoDB(config)

// 捕获nodejs中未被catch的错误
process.on('uncaughtException', error => catchError(error))
process.on('unhandledRejection', error => catchError(error))

// 捕获 koa中的错误
// app.on('error', error => catchError(error, 'koa'))

// router 日志
app.use(async (ctx, next) => {
  if (ctx.request.method !== 'OPTIONS') {
    const ipStrOri = ctx.request.header['x-real-ip'] || ctx.request.header?.origin || ctx.request.header?.referer
    const ipStr = ipStrOri ? ipStrOri.slice(ipStrOri.indexOf('://') + 3, ipStrOri.lastIndexOf(':')) : '无法获取'
    const info = `method=${ctx.request.method}; ip=${ipStr}; url=${ctx.request.url}`
    if (process.env.NODE_ENV === 'development') loggerAll.info(info)
    loggerRouter.info(info)
  }
  try {
    await next()
  } catch (error) {
    const { message, stack } = error
    loggerRouter.error(error)
    ctx.body = {
      result: stack,
      error: message
    }
  }
})

app
  .use(koaBody(config.koaBodyOpt)) /// /////////////////////////////////// 接收文件配置
  .use(cors())
  .use(router.routes())
  .use(router.allowedMethods())
  .use((ctx, next) => verifyToken(ctx, next))
  .use(authorizationRouter.routes())
  .use(authorizationRouter.allowedMethods())
  .listen(config.serverPort, () => {
    console.log(`server running at http://localhost:${config.serverPort}`)
  })

function catchError (error) {
  const { message, stack, name } = error
  if (process.env.NODE_ENV === 'development') loggerAll.error(error)
  loggerUncaught.error(error)
  const update = {
    $push: {},
    $inc: {}
  }
  update.$push.ErrorList = {
    logFilename: `uncaughtLog.${formatDate(new Date(), 'transform', '-')}.log`,
    stack: JSON.parse(JSON.stringify(error.stack)),
    time: Date.now(),
    type: name,
    repair: false,
    error: { message, stack },
    ctx: null
  }
  update.$inc = {
    sum: +1,
    unRepair: +1
  }
  config.mongoDB.updateOneData('logs', { day: getBeforeDate(0) }, update, { upsert: true }).then()
}
