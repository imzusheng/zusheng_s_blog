const fs = require('fs')
const request = require('request')
const querystring = require('querystring')
const { loggerRouter } = require('../util/log4js')
const path = require('path')
const config = require('../config/config')
const API = require('../config/api')
const jwt = require('./jwt')
const filePath = path.resolve(__dirname, __filename)

// 检查文件是否存在, 存在返回true
exports.fileExist = filePath => {
  // fs.constants.F_OK    path对调用进程是可见的，既存在
  // fs.constants.R_OK    path是可读的
  // fs.constants.W_OK    path是可写的
  // fs.constants.X_OK    path是可执行的
  return new Promise(resolve => {
    fs.access(filePath, fs.constants.F_OK, error => {
      // 文件存在时 error = null
      // 文件不存在时 error 如下
      // [Error: ENOENT: no such file or directory, access 'C:\Users\Yello\Desktop\website\server\assets\file_53f2cc693260a2e7ed3b4ea6f7889f4b.MD'] {
      //   errno: -4058,
      //     code: 'ENOENT',
      //     syscall: 'access',
      //     path: 'C:\\Users\\Yello\\Desktop\\website\\server\\assets\\file_53f2cc693260a2e7ed3b4ea6f7889f4b.MD'
      // }
      if (!error) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

// 传入 ip地址, 返回城市等地理位置信息
exports.getCity = ip => {
  return new Promise(resolve => {
    const queryData = querystring.stringify({
      ip,
      key: '3fc70466cf3f14c1908d58252f8c9f3c' // 申请的接口请求key
    })
    const queryUrl = 'http://apis.juhe.cn/ip/ipNew?' + queryData
    request(queryUrl, (error, response, body) => {
      resolve({
        error: error ? this.errorHandle(error, filePath, 'getCity') : null,
        result: JSON.parse(body) // 插入新数据时返回_id
      })
    })
  })
}

/**
 * 处理错误信息
 * @param error 错误
 * @param filePath 出错文件路径
 * @param target 出问题的地方
 * @param ctx   路由参数
 * @returns error 处理完毕的错误信息
 */
exports.errorHandle = (error, filePath, target, ctx) => {
  const { message, stack, name } = error
  config.mongoDB.updateOneData(
    'logs',
    { day: this.getBeforeDate(0) },
    {
      $push: {
        ErrorList: {
          logFilename: `routerLog.${this.formatDate(new Date(), 'transform', '-')}.log`,
          ctx: JSON.parse(JSON.stringify(ctx, null, 4)),
          error: { message, stack },
          type: name,
          time: Date.now(),
          repair: false
        }
      },
      $inc: {
        sum: +1,
        unRepair: +1
      }
    },
    { upsert: true }
  ).then()
  const nativeError = error
  error.filePath = filePath
  error.function = target
  error.ctx = ctx ? JSON.stringify(ctx, null, 4) : null
  loggerRouter.error(error)
  return nativeError.toString()
}

// 返回 n 天前时间戳, 以零点为基准
exports.getBeforeDate = day => {
  if (!day && day !== 0) {
    console.log('未接收到参数@getBeforeDate')
    return
  }
  const format = this.formatDate(new Date(), 'transform', '/')
  return new Date(format).getTime() + 24 * 60 * 60 * 1000 * day
}

// 格式化时间
exports.formatDate = (date, type, s) => {
  const dateObj = date ? new Date(date) : new Date()
  const symbol = s || '/' // 分隔符
  if (type === 'transform') { // yyyy symbol MM symbol dd
    return `${dateObj.getFullYear()}${symbol}${dateObj.getMonth() + 1}${symbol}${(dateObj.getDate() <= 10 ? '0' : '') + dateObj.getDate()}`
  } else if (type === 'chinese') {
    return `${dateObj.getMonth() > 0 ? dateObj.getMonth() + 1 + ' 月 ' : ''}${dateObj.getDate()} 天 ${dateObj.getHours()} 时 ${dateObj.getMinutes()} 分`
  } else {
    return `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()} ${(dateObj.getHours() <= 10 ? '0' : '') + dateObj.getHours()}:${(dateObj.getMinutes() <= 10 ? '0' : '') + dateObj.getMinutes()}`
  }
}

// 获取完整路由路径
exports.GetRouterPath = class GetRouterPath {
  constructor (routerClass) {
    this.routerClass = routerClass
  }

  r (routerName) {
    return API.API_ROOT.BASE_URL_PREFIX + API[this.routerClass][routerName]
  }

  rRoot (routerName) {
    return API[this.routerClass][routerName]
  }
}

// token验证和获取
exports.verifyToken = async (ctx, next) => {
  const verifyResult = await jwt.tokenVerify(ctx)
  // /(login|sign|static)/g.test(ctx.url)
  if (verifyResult) {
    await next()
  } else {
    // ctx.status = 401
    ctx.body = {
      error: '未经授权！',
      result: null,
      status: 401
    }
  }
}
