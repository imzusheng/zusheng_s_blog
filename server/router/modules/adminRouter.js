const router = require('@koa/router')()
const ObjectId = require('mongodb').ObjectId
const config = require('../../config/config')
const { GetRouterPath } = require('../../util')
const getRouterPath = new GetRouterPath('API_ADMIN')
const jwt = require('../../util/jwt')

/**
 * @api {put} /api/modifyArticle modifyArticle - 修改文章
 * @apiVersion 1.0.0
 * @apiName 修改文章
 * @apiHeader {String} token 用户令牌
 *
 * @apiParam (必须) {String} title                  标题
 * @apiParam (必须) {String} content                内容
 * @apiParam (必须) {String} poster                 封面
 * @apiParam (必须) {Boolean} markdown[md]          是否引入markdown
 * @apiParam (必须) {String} markdown[filename]     markdown文件名
 * @apiParam (必须) {String} operate[fire]          热度
 * @apiParam (必须) {String} operate[releaseTime]   发布时间
 * @apiParam (必须) {String} operate[category]      分类
 * @apiParam (必须) {Object} operate[discuss]       评论
 * @apiParam (必须) {Boolean} verify                审核
 * @apiParam (必须) {Array} tags                    标签
 *
 * @apiGroup adminRouter
 * @apiSampleRequest off
 */
router.put(getRouterPath.r('PUT_MODIFY_ARTICLE'), async (ctx) => {
  const data = ctx.request.body
  const _id = ObjectId(data._id)
  delete data._id
  const {
          error,
          result
        } = await config.mongoDB.updateManyData('articles', { _id }, { $set: data }, {}, ctx)
  ctx.body = {
    error,
    result
  }
})

/**
 * @api {post} /api/addArticle addArticle - 添加文章
 * @apiVersion 1.0.0
 * @apiName 添加文章
 * @apiHeader {String} token 用户令牌
 *
 * @apiParam (必须) {String} title                  标题
 * @apiParam (必须) {String} content                内容
 * @apiParam (必须) {String} poster                 封面
 * @apiParam (必须) {Boolean} markdown[md]          是否引入markdown
 * @apiParam (必须) {String} markdown[filename]     markdown文件名
 * @apiParam (必须) {String} operate[fire]          热度
 * @apiParam (必须) {String} operate[releaseTime]   发布时间
 * @apiParam (必须) {String} operate[category]      分类
 * @apiParam (必须) {Object} operate[discuss]       评论
 * @apiParam (必须) {Boolean} verify                审核
 * @apiParam (必须) {Array} tags                    标签
 *
 * @apiGroup adminRouter
 * @apiSampleRequest off
 */
router.post(getRouterPath.r('POST_ADD_ARTICLE'), async (ctx) => {
  const data = ctx.request.body
  const {
          result,
          error
        } = await config.mongoDB.insertOneData('articles', data, ctx)
  ctx.body = {
    result,
    error
  }
})

/**
 * @api {put} /api/verifyArticle verifyArticle - 审核文章
 * @apiVersion 1.0.0
 * @apiName 审核
 * @apiHeader {String} token 用户令牌
 *
 * @apiParam (必须) {String} _id     文章_id
 * @apiParam (必须) {Boolean} verify 审核状态
 *
 * @apiGroup adminRouter
 * @apiSampleRequest off
 */
router.put(getRouterPath.r('PUT_VERIFY_ARTICLE'), async ctx => {
  const {
          _id,
          verify
        } = ctx.request.body
  const {
          result,
          error
        } = await config.mongoDB.updateOneData('articles', { _id: ObjectId(_id) }, { $set: { verify } }, { upsert: false }, ctx)
  ctx.body = {
    result,
    error
  }
})

/**
 * @api {delete} /api/deleteArticle deleteArticle - 删除文章
 * @apiVersion 1.0.0
 * @apiName 删除文章
 * @apiHeader {String} token 用户令牌
 *
 * @apiParam (必须) {String} _id      id
 *
 * @apiGroup adminRouter
 * @apiSampleRequest off
 */
router.delete(getRouterPath.r('DELETE_ARTICLE'), async ctx => {
  const { _id } = ctx.request.body
  const {
          result,
          error
        } = await config.mongoDB.deleteOneData('articles', { _id: ObjectId(_id) }, ctx)
  ctx.body = {
    result,
    error
  }
})

/**
 * @api {get} /api/allArticle allArticle - 获取所有文章
 * @apiVersion 1.0.0
 * @apiName 获取所有文章
 * @apiHeader {String} token 用户令牌
 *
 * @apiGroup adminRouter
 * @apiSampleRequest off
 */
router.get(getRouterPath.r('GET_ALL_ARTICLES'), async (ctx) => {
  const {
          result,
          error
        } = await config.mongoDB.queryData('articles', {}, {
    'operate.releaseTime': -1
  }, ctx)
  ctx.body = {
    result,
    error
  }
})

/**
 * @api {get} /api/overview overview - 区间分析数据
 * @apiVersion 1.0.0
 * @apiName 区间分析数据
 * @apiHeader {String} token 用户令牌
 *
 * @apiParam (必须) {Number} today                  时间区间-开始
 * @apiParam (必须) {Number} weekAgo                时间区间-结束
 *
 * @apiGroup adminRouter
 * @apiSampleRequest off
 */
router.get(getRouterPath.r('GET_OVERVIEW'), async (ctx) => {
  const {
          today,
          weekAgo
        } = ctx.query
  const {
          result,
          error
        } = await config.mongoDB.aggregateData(
    'admin',
    [{
      $match: {
        day: {
          $gt: weekAgo,
          $lte: today
          // $in: data['args[]'] // $in 包含
          // $gt:大于
          // $lt:小于
          // $gte:大于或等于
          // $lte:小于或等于
        }
      }
    }, {
      $sort: { // 排序 小到大
        day: 1
      }
    }], ctx)
  const resultObj = {}
  result.forEach(val => {
    resultObj[val.day] = val
  })
  ctx.body = {
    result: resultObj,
    error
  }
})

/**
 * @api {get} /api/allOverview allOverview - 历史分析数据
 * @apiVersion 1.0.0
 * @apiName 历史分析数据
 * @apiHeader {String} token 用户令牌
 *
 * @apiGroup adminRouter
 * @apiSampleRequest off
 */
router.get(getRouterPath.r('GET_ALL_OVERVIEW'), async (ctx) => {
  const {
          result,
          error
        } = await config.mongoDB.queryData('admin', { day: 'forever' }, null, ctx)
  ctx.body = {
    result,
    error
  }
})

/**
 * @api {put} /api/verifyComments verifyComments - 审核评论
 * @apiVersion 1.0.0
 * @apiName 审核
 * @apiHeader {String} token 用户令牌
 *
 * @apiParam (必须) {String} _id     _id
 * @apiParam (必须) {Boolean} verify 审核状态
 *
 * @apiGroup adminRouter
 * @apiSampleRequest off
 */
router.put(getRouterPath.r('PUT_VERIFY_COMMENTS'), async ctx => {
  const {
          _id,
          verify
        } = ctx.request.body
  const {
          result,
          error
        } = await config.mongoDB.updateOneData('comments', { _id: ObjectId(_id) }, { $set: { verify } }, { upsert: false }, ctx)
  ctx.body = {
    result,
    error
  }
})

/**
 * @api {delete} /api/deleteComments deleteComments - 删除评论
 * @apiVersion 1.0.0
 * @apiName 删除文章
 * @apiHeader {String} token 用户令牌
 *
 * @apiParam (必须) {String} _id      id
 *
 * @apiGroup adminRouter
 * @apiSampleRequest off
 */
router.delete(getRouterPath.r('DELETE_COMMENTS'), async ctx => {
  const { _id } = ctx.request.body
  const {
          result,
          error
        } = await config.mongoDB.deleteOneData('comments', { _id: ObjectId(_id) }, ctx)
  ctx.body = {
    result,
    error
  }
})

/**
 * @api {get} /api/allComments allComments - 获取所有评论
 * @apiVersion 1.0.0
 * @apiName 获取所有评论
 * @apiHeader {String} token 用户令牌
 *
 * @apiGroup adminRouter
 * @apiSampleRequest off
 */
router.get(getRouterPath.r('GET_ALL_COMMENTS'), async ctx => {
  const queryLookup = {
    $lookup: {
      from: 'articles',
      let: {
        linkId: '$linkId'
      },
      pipeline: [ // 管道
        {
          $match:
            {
              $expr: { // 使用let中的变量
                $eq: ['$_id', '$$linkId'] // $eq 相等
              }
            }
        },
        {
          $project: {
            markdown: 0,
            operate: 0,
            verify: 0,
            tags: 0,
            poster: 0
          }
        }
      ],
      as: 'articleInfo'
    }
  }

  const queryUnwind = {
    $unwind: {
      path: '$articleInfo',
      preserveNullAndEmptyArrays: true
    }
  }
  const {
          result,
          error
        } = await config.mongoDB.aggregateData('comments', [queryLookup, queryUnwind, { $sort: { _id: -1 } }], ctx)
  ctx.body = {
    result,
    error
  }
})

/**
 * @api {get} /api/logs logs - 获取日志
 * @apiVersion 1.0.0
 * @apiName 获取日志
 * @apiHeader {String} token 用户令牌
 *
 * @apiGroup adminRouter
 * @apiSampleRequest off
 */
router.get(getRouterPath.r('GET_LOGS'), async ctx => {
  const { today, weekAgo } = ctx.query
  const match = {
    $match: {
      day: {
        $gt: Number(weekAgo),
        $lte: Number(today)
      }
    }
  }
  const opt = {
    $sort: {
      day: -1
    }
  }
  const { result, error } = await config.mongoDB.aggregateData(
    'logs',
    [match, opt],
    ctx
  )
  ctx.body = {
    result,
    error
  }
})

/**
 * @api {put} /api/repairError repairError - 修复一个错误
 * @apiVersion 1.0.0
 * @apiName 修复一个错误
 * @apiHeader {String} token 用户令牌
 *
 * @apiGroup adminRouter
 * @apiSampleRequest off
 */
router.put(getRouterPath.r('PUT_REPAIR_ERROR'), async ctx => {
  const {
          day,
          time
        } = ctx.request.body
  const queryParams = {
    day,
    'ErrorList.time': Number(time)
  }
  const update = {
    $set: {
      'ErrorList.$.repair': true
    },
    $inc: {
      unRepair: -1
    }
  }
  const {
          result,
          error
        } = await config.mongoDB.updateOneData('logs', queryParams, update, { upsert: false }, ctx)
  ctx.body = {
    result,
    error,
    tips: error ? null : '修复成功'
  }
})

/**
 * @api {put} /api/repairDayError repairDayError - 修复一天错误
 * @apiVersion 1.0.0
 * @apiName 修复一天错误
 * @apiHeader {String} token 用户令牌
 *
 * @apiGroup adminRouter
 * @apiSampleRequest off
 */
router.put(getRouterPath.r('PUT_REPAIR_DAY_ERROR'), async ctx => {
  const { day } = ctx.request.body
  const queryParams = {
    day
  }
  // https://www.cnblogs.com/dengquan/articles/15070752.html
  // mongodb $,$[]占位符
  const update = {
    $set: {
      'ErrorList.$[].repair': true,
      unRepair: 0
    }
  }
  const {
          result,
          error
        } = await config.mongoDB.updateManyData('logs', queryParams, update, { upsert: false }, ctx)
  ctx.body = {
    result,
    error,
    tips: error ? null : '修复成功'
  }
})

/**
 * @api {get} /api/tokenRenew tokenRenew - 重新获取token
 * @apiVersion 1.0.0
 * @apiName 重新获取token
 * @apiHeader {String} token 用户令牌
 *
 * @apiGroup adminRouter
 * @apiSampleRequest off
 */
router.get(getRouterPath.r('GET_TOKEN_RENEW'), async ctx => {
  const { uid, pwd } = ctx.query
  ctx.body = {
    result: {
      data: jwt.getToken(uid + pwd),
      uid,
      pwd
    },
    error: null
  }
})

/**
 * @api {get} /api/loginRecords loginRecords - 获取登录历史位置
 * @apiVersion 1.0.0
 * @apiName 获取登录历史位置
 * @apiHeader {String} token 用户令牌
 *
 * @apiGroup adminRouter
 * @apiSampleRequest off
 */
router.get(getRouterPath.r('GET_LOGIN_RECORDS'), async ctx => {
  const { uid } = ctx.query
  const queryMatch = {
    $match: {
      uid
    }
  }
  const queryProject = {
    $project: {
      uid: 0,
      pwd: 0
    }
  }
  const queryUnwind = {
    $unwind: {
      path: '$LoginRecords',
      preserveNullAndEmptyArrays: true
    }
  }

  const queryLimit = {
    $limit: 5
  }

  const querySort = {
    $sort: {
      'LoginRecords.time': -1
    }
  }
  const { result, error } = await config.mongoDB.aggregateData(
    'user',
    [queryMatch, queryProject, queryUnwind, querySort, queryLimit],
    ctx
  )
  ctx.body = {
    result,
    error
  }
})

/**
 * @api {put} /api/updatePwd updatePwd - 修改密码
 * @apiVersion 1.0.0
 * @apiName 修改密码
 * @apiHeader {String} token 用户令牌
 *
 * @apiGroup adminRouter
 * @apiSampleRequest off
 */
router.put(getRouterPath.r('PUT_UPDATE_PWD'), async ctx => {
  const { uid, pwd, newUid } = ctx.request.body
  const {
          result,
          error
        } = await config.mongoDB.updateOneData('user', { uid }, { $set: { pwd, uid: newUid } }, { upsert: false }, ctx)
  ctx.body = {
    result,
    error,
    tips: error ? null : '修改成功'
  }
})

/**
 * @api {post} /api/addWorks addWorks - 添加作品集
 * @apiVersion 1.0.0
 * @apiName 添加作品集
 * @apiHeader {String} token 用户令牌
 *
 * @apiParam (必须) {String} describeTitle          标题
 * @apiParam (必须) {String} describeContent        内容
 * @apiParam (必须) {String} poster                 封面
 * @apiParam (必须) {String} describeTag            标签
 * @apiParam (必须) {String} describeDate           发布时间
 * @apiParam (必须) {String} src                    源链接
 * @apiParam (必须) {String} category               分类
 *
 * @apiGroup adminRouter
 * @apiSampleRequest off
 */
router.post(getRouterPath.r('POST_ADD_WORKS'), async ctx => {
  const data = ctx.request.body
  const {
          result,
          error
        } = await config.mongoDB.insertOneData('works', data, ctx)
  ctx.body = {
    result,
    error
  }
})

// 初始化数据库
router.get(getRouterPath.r('SET_WELCOME'), async ctx => {
  const { error: err1 } = await config.mongoDB.resetDataBase(ctx)
  const { error: err2 } = await config.mongoDB.insertOneData('articles', {
    title: 'test',
    tags: ['test'],
    content: 'test',
    poster: 'file_1d0da18662ec1575fbc05e3da3513b42.png',
    markdown: {
      md: false,
      filename: ''
    },
    operate: {
      fire: 1,
      releaseTime: 1637311137177,
      category: '笔记'
    },
    verify: false
  }, ctx)
  const { error: err3 } = await config.mongoDB.insertManyData('logs', [
    {
      day: 1637337600000,
      ErrorList: [{
        logFilename: 'uncaughtLog.2021-11-20.log',
        stack: 'ReferenceError: day is not defined\n    at writeUserInfo (C:\\Users\\Yello\\Desktop\\website\\server\\router\\modules\\commonRouter.js:23:12)\n    at C:\\Users\\Yello\\Desktop\\website\\server\\router\\modules\\commonRouter.js:43:5\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\n    at async cors (C:\\Users\\Yello\\Desktop\\website\\server\\node_modules\\koa2-cors\\dist\\index.js:91:9)\n    at async C:\\Users\\Yello\\Desktop\\website\\server\\index.js:29:5',
        time: 1637407189190,
        type: 'ReferenceError',
        repair: false,
        error: {
          message: 'day is not defined',
          stack: 'ReferenceError: day is not defined\n    at writeUserInfo (C:\\Users\\Yello\\Desktop\\website\\server\\router\\modules\\commonRouter.js:23:12)\n    at C:\\Users\\Yello\\Desktop\\website\\server\\router\\modules\\commonRouter.js:43:5\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\n    at async cors (C:\\Users\\Yello\\Desktop\\website\\server\\node_modules\\koa2-cors\\dist\\index.js:91:9)\n    at async C:\\Users\\Yello\\Desktop\\website\\server\\index.js:29:5'
        },
        ctx: null
      }, {
        logFilename: 'routerLog.2021-11-20.log',
        ctx: {
          request: {
            method: 'GET',
            url: '/api/loginRecords?uid=imzusheng%40163.com',
            header: {
              host: 'localhost:3000',
              'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0',
              accept: 'application/json, text/plain, */*',
              'accept-language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
              'accept-encoding': 'gzip, deflate',
              'x-requested-with': 'XMLHttpRequest',
              authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2Mzc0MjIzOTksImRhdGEiOiJpbXp1c2hlbmdAMTYzLmNvbWx6czYyOTA5OTMiLCJpYXQiOjE2Mzc0MTg3OTl9.a6UviqMqYuebwCv-ES7l4i2GwUkz-89e1-DAIOqJnBI',
              origin: 'http://localhost:8080',
              connection: 'keep-alive',
              referer: 'http://localhost:8080/',
              'sec-fetch-dest': 'empty',
              'sec-fetch-mode': 'cors',
              'sec-fetch-site': 'cross-site',
              pragma: 'no-cache',
              'cache-control': 'no-cache'
            }
          },
          response: {
            status: 404,
            message: 'Not Found',
            header: {
              vary: 'Origin',
              'access-control-allow-origin': 'http://localhost:8080'
            }
          },
          app: {
            subdomainOffset: 2,
            proxy: false,
            env: 'development'
          },
          originalUrl: '/api/loginRecords?uid=imzusheng%40163.com',
          req: '<original node req>',
          res: '<original node res>',
          socket: '<original node socket>'
        },
        error: {
          message: "The field 'LoginRecords' must be an accumulator object",
          stack: "MongoServerError: The field 'LoginRecords' must be an accumulator object\n    at MessageStream.messageHandler (C:\\Users\\Yello\\Desktop\\website\\server\\node_modules\\mongodb\\lib\\cmap\\connection.js:467:30)\n    at MessageStream.emit (events.js:315:20)\n    at processIncomingData (C:\\Users\\Yello\\Desktop\\website\\server\\node_modules\\mongodb\\lib\\cmap\\message_stream.js:108:16)\n    at MessageStream._write (C:\\Users\\Yello\\Desktop\\website\\server\\node_modules\\mongodb\\lib\\cmap\\message_stream.js:28:9)\n    at writeOrBuffer (internal/streams/writable.js:358:12)\n    at MessageStream.Writable.write (internal/streams/writable.js:303:10)\n    at Socket.ondata (internal/streams/readable.js:719:22)\n    at Socket.emit (events.js:315:20)\n    at addChunk (internal/streams/readable.js:309:12)\n    at readableAddChunk (internal/streams/readable.js:284:9)"
        },
        type: 'MongoServerError',
        time: 1637419883139,
        repair: false
      }, {
        logFilename: 'routerLog.2021-11-20.log',
        ctx: {
          request: {
            method: 'GET',
            url: '/api/loginRecords?uid=imzusheng%40163.com',
            header: {
              host: 'localhost:3000',
              'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0',
              accept: 'application/json, text/plain, */*',
              'accept-language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
              'accept-encoding': 'gzip, deflate',
              'x-requested-with': 'XMLHttpRequest',
              authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2Mzc0MjIzOTksImRhdGEiOiJpbXp1c2hlbmdAMTYzLmNvbWx6czYyOTA5OTMiLCJpYXQiOjE2Mzc0MTg3OTl9.a6UviqMqYuebwCv-ES7l4i2GwUkz-89e1-DAIOqJnBI',
              origin: 'http://localhost:8080',
              connection: 'keep-alive',
              referer: 'http://localhost:8080/',
              'sec-fetch-dest': 'empty',
              'sec-fetch-mode': 'cors',
              'sec-fetch-site': 'cross-site',
              pragma: 'no-cache',
              'cache-control': 'no-cache'
            }
          },
          response: {
            status: 404,
            message: 'Not Found',
            header: {
              vary: 'Origin',
              'access-control-allow-origin': 'http://localhost:8080'
            }
          },
          app: {
            subdomainOffset: 2,
            proxy: false,
            env: 'development'
          },
          originalUrl: '/api/loginRecords?uid=imzusheng%40163.com',
          req: '<original node req>',
          res: '<original node res>',
          socket: '<original node socket>'
        },
        error: {
          message: "path option to $unwind stage should be prefixed with a '$': LoginRecords",
          stack: "MongoServerError: path option to $unwind stage should be prefixed with a '$': LoginRecords\n    at MessageStream.messageHandler (C:\\Users\\Yello\\Desktop\\website\\server\\node_modules\\mongodb\\lib\\cmap\\connection.js:467:30)\n    at MessageStream.emit (events.js:315:20)\n    at processIncomingData (C:\\Users\\Yello\\Desktop\\website\\server\\node_modules\\mongodb\\lib\\cmap\\message_stream.js:108:16)\n    at MessageStream._write (C:\\Users\\Yello\\Desktop\\website\\server\\node_modules\\mongodb\\lib\\cmap\\message_stream.js:28:9)\n    at writeOrBuffer (internal/streams/writable.js:358:12)\n    at MessageStream.Writable.write (internal/streams/writable.js:303:10)\n    at Socket.ondata (internal/streams/readable.js:719:22)\n    at Socket.emit (events.js:315:20)\n    at addChunk (internal/streams/readable.js:309:12)\n    at readableAddChunk (internal/streams/readable.js:284:9)"
        },
        type: 'MongoServerError',
        time: 1637420270785,
        repair: false
      }, {
        logFilename: 'routerLog.2021-11-20.log',
        ctx: {
          request: {
            method: 'GET',
            url: '/api/loginRecords?uid=imzusheng%40163.com',
            header: {
              host: 'localhost:3000',
              connection: 'keep-alive',
              'sec-ch-ua': '"Microsoft Edge";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
              accept: 'application/json, text/plain, */*',
              'x-requested-with': 'XMLHttpRequest',
              'sec-ch-ua-mobile': '?0',
              authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2Mzc0MjYwNDksImRhdGEiOiJpbXp1c2hlbmdAMTYzLmNvbWx6czYyOTA5OTMiLCJpYXQiOjE2Mzc0MjI0NDl9.cID-0cY_15cedRCPMjhCSlxQ9DA6VnHQHqs49a_cgXY',
              'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36 Edg/95.0.1020.53',
              'sec-ch-ua-platform': '"Windows"',
              origin: 'http://10.70.19.184:8080',
              'sec-fetch-site': 'cross-site',
              'sec-fetch-mode': 'cors',
              'sec-fetch-dest': 'empty',
              referer: 'http://10.70.19.184:8080/',
              'accept-encoding': 'gzip, deflate, br',
              'accept-language': 'zh-CN,zh;q=0.9'
            }
          },
          response: {
            status: 404,
            message: 'Not Found',
            header: {
              vary: 'Origin',
              'access-control-allow-origin': 'http://10.70.19.184:8080'
            }
          },
          app: {
            subdomainOffset: 2,
            proxy: false,
            env: 'development'
          },
          originalUrl: '/api/loginRecords?uid=imzusheng%40163.com',
          req: '<original node req>',
          res: '<original node res>',
          socket: '<original node socket>'
        },
        error: {
          message: 'the $sort key specification must be an object',
          stack: 'MongoServerError: the $sort key specification must be an object\n    at MessageStream.messageHandler (C:\\Users\\Yello\\Desktop\\website\\server\\node_modules\\mongodb\\lib\\cmap\\connection.js:467:30)\n    at MessageStream.emit (events.js:315:20)\n    at processIncomingData (C:\\Users\\Yello\\Desktop\\website\\server\\node_modules\\mongodb\\lib\\cmap\\message_stream.js:108:16)\n    at MessageStream._write (C:\\Users\\Yello\\Desktop\\website\\server\\node_modules\\mongodb\\lib\\cmap\\message_stream.js:28:9)\n    at writeOrBuffer (internal/streams/writable.js:358:12)\n    at MessageStream.Writable.write (internal/streams/writable.js:303:10)\n    at Socket.ondata (internal/streams/readable.js:719:22)\n    at Socket.emit (events.js:315:20)\n    at addChunk (internal/streams/readable.js:309:12)\n    at readableAddChunk (internal/streams/readable.js:284:9)'
        },
        type: 'MongoServerError',
        time: 1637422518642,
        repair: true
      }, {
        logFilename: 'routerLog.2021-11-20.log',
        ctx: {
          request: {
            method: 'GET',
            url: '/api/loginRecords?uid=imzusheng%40163.com',
            header: {
              host: 'localhost:3000',
              connection: 'keep-alive',
              'sec-ch-ua': '"Microsoft Edge";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
              accept: 'application/json, text/plain, */*',
              'x-requested-with': 'XMLHttpRequest',
              'sec-ch-ua-mobile': '?0',
              authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2Mzc0MjYwNDksImRhdGEiOiJpbXp1c2hlbmdAMTYzLmNvbWx6czYyOTA5OTMiLCJpYXQiOjE2Mzc0MjI0NDl9.cID-0cY_15cedRCPMjhCSlxQ9DA6VnHQHqs49a_cgXY',
              'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36 Edg/95.0.1020.53',
              'sec-ch-ua-platform': '"Windows"',
              origin: 'http://10.70.19.184:8080',
              'sec-fetch-site': 'cross-site',
              'sec-fetch-mode': 'cors',
              'sec-fetch-dest': 'empty',
              referer: 'http://10.70.19.184:8080/',
              'accept-encoding': 'gzip, deflate, br',
              'accept-language': 'zh-CN,zh;q=0.9'
            }
          },
          response: {
            status: 404,
            message: 'Not Found',
            header: {
              vary: 'Origin',
              'access-control-allow-origin': 'http://10.70.19.184:8080'
            }
          },
          app: {
            subdomainOffset: 2,
            proxy: false,
            env: 'development'
          },
          originalUrl: '/api/loginRecords?uid=imzusheng%40163.com',
          req: '<original node req>',
          res: '<original node res>',
          socket: '<original node socket>'
        },
        error: {
          message: 'the $sort key specification must be an object',
          stack: 'MongoServerError: the $sort key specification must be an object\n    at MessageStream.messageHandler (C:\\Users\\Yello\\Desktop\\website\\server\\node_modules\\mongodb\\lib\\cmap\\connection.js:467:30)\n    at MessageStream.emit (events.js:315:20)\n    at processIncomingData (C:\\Users\\Yello\\Desktop\\website\\server\\node_modules\\mongodb\\lib\\cmap\\message_stream.js:108:16)\n    at MessageStream._write (C:\\Users\\Yello\\Desktop\\website\\server\\node_modules\\mongodb\\lib\\cmap\\message_stream.js:28:9)\n    at writeOrBuffer (internal/streams/writable.js:358:12)\n    at MessageStream.Writable.write (internal/streams/writable.js:303:10)\n    at Socket.ondata (internal/streams/readable.js:719:22)\n    at Socket.emit (events.js:315:20)\n    at addChunk (internal/streams/readable.js:309:12)\n    at readableAddChunk (internal/streams/readable.js:284:9)'
        },
        type: 'MongoServerError',
        time: 1637422539386,
        repair: true
      }],
      sum: 5,
      unRepair: 3
    }
  ], ctx)
  const { error: err4 } = await config.mongoDB.insertOneData('user', {
    uid: 'admin',
    pwd: '123456'
  }, ctx)
  const { error: err5 } = await config.mongoDB.insertOneData('comments', {
    avatar: '/img/ginger-cat-756.8e9105f0.png',
    time: 1637132609861,
    content: '哈哈哈',
    link: 'BlogHome',
    linkId: null,
    author: {
      IPAddress: 'localhost',
      position: null
    },
    like: {
      sum: 1,
      userList: [{
        IPAddress: 'localhost',
        position: null,
        time: 1637132627524
      }]
    },
    dislike: {
      sum: 0
    },
    verify: true
  }, ctx)
  const { error: err6 } = await config.mongoDB.insertManyData('admin', [{
    day: 'forever',
    visitorsSum: 1,
    ReadingQuantity: 1,
    commentsQuantity: 1
  }], ctx)
  let errFlag = false
  const errLists = [err1, err2, err3, err4, err5, err6]
  errLists.forEach(item => {
      if (item) errFlag = true
    }
  )
  ctx.body = {
    result: { ...errLists },
    error: errFlag
  }
})

module.exports = router
