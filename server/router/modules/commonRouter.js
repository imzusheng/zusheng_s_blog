const router = require('@koa/router')()
const config = require('../../config/config')
const API = require('../../config/api')
const { GetRouterPath } = require('../../util')
const getRouterPath = new GetRouterPath('API_COMMON')
const jwt = require('../../util/jwt')
const axios = require('axios')

/**
 * @param ctx ctx
 * @returns {Promise<void>}
 */
async function writeUserInfo (ctx) {
  const { uid, IPAddress, position, time } = ctx.request.body
  const { error, result } = await config.mongoDB.updateOneData(
    'user',
    { uid },
    {
      $push: {
        LoginRecords: {
          IPAddress,
          position,
          time
        }
      }
    },
    { upsert: true },
    ctx)
  ctx.body = {
    error,
    result
  }
}

router.post(getRouterPath.r('POST_LOGIN'), async ctx => {
  const {
          uid,
          pwd
        } = ctx.request.body
  const {
          result,
          error
        } = await config.mongoDB.queryData('user', {
    uid,
    pwd
  }, null, ctx)
  if (result.length > 0 && !error) {
    writeUserInfo(ctx).then()
    ctx.body = {
      result: {
        uid,
        pwd,
        data: jwt.getToken(uid + pwd)
      },
      error
    }
  } else {
    ctx.body = {
      result: null,
      error: '登录失败'
    }
  }
})

router.get('/reset', async ctx => {
  const {
          result,
          error
        } = await config.mongoDB.resetDataBase(ctx)
  ctx.body = {
    error,
    result
  }
})

/**
 * @api {get} /config config - API 配置文件
 * @apiVersion 1.0.0
 * @apiName API 配置文件
 *
 * @apiGroup commonRouter
 * @apiSampleRequest off
 */
router.get('/config', async ctx => {
  ctx.body = {
    error: null,
    result: API
  }
})

/**
 * @api {get} /api/search search - 搜索
 * @apiVersion 1.0.0
 * @apiName 搜索文章或评论
 *
 * @apiParam (必须) {String} content         搜索内容
 *
 * @apiGroup commonRouter
 * @apiSampleRequest off
 */
router.get(getRouterPath.r('GET_SEARCH'), async ctx => {
  const { content } = ctx.query
  // if (!content) {
  //   ctx.body = {
  //     result: {
  //       articles: [],
  //       comments: []
  //     },
  //     error: null
  //   }
  //   return
  // }
  const {
          result: res1,
          error: err1
        } = await config.mongoDB.aggregateData('articles', [{
    $match: {
      $or: [
        { title: { $regex: new RegExp(content) } },
        { content: { $regex: new RegExp(content) } },
        { tags: { $regex: new RegExp(content) } }
      ]
    }
  }, {
    $lookup: {
      from: 'comments',
      // localField: '_id', 这种方法也行
      // foreignField: 'linkId',
      let: {
        id: '$_id'
      },
      pipeline: [ // 管道
        {
          $match:
            {
              $expr: { // 使用let中的变量
                $eq: ['$linkId', '$$id'] // $eq 相等
              }
            }
        }
      ],
      as: 'comments'
    }
  }])
  const {
          result: res2,
          error: err2
        } = await config.mongoDB.aggregateData('comments', [{
    $match: {
      $or: [
        { content: { $regex: new RegExp(content) } }
      ]
    }
  }])
  ctx.body = {
    result: {
      articles: res1,
      comments: res2
    },
    error: err1 || err2 ? '发生错误' : null
  }
})

/**
 * @api {get} /api/userOrigin userOrigin - 获取用户IP等
 * @apiVersion 1.0.0
 * @apiName 获取用户IP等
 *
 * @apiGroup commonRouter
 * @apiSampleRequest off
 */
router.get(getRouterPath.r('GET_USER_ORIGIN'), async (ctx) => {
  let IPAddress = ''
  let result = null
  let error = null
  if (ctx.request.header.origin || ctx.request.header['x-real-ip']) {
    IPAddress =
      ctx.request.header['x-real-ip'] ||
      ctx.request.header.origin.slice(
        ctx.request.header.origin.indexOf('://') + 3,
        ctx.request.header.origin.lastIndexOf(':')
      )
  }
  if (!(/localhost|127.0.0.1/.test(IPAddress))) {
    const { data } = await axios({
      url: 'https://zusheng.club/api/userOrigin',
      // url: 'http://localhost:3900/api/userOrigin',
      method: 'get',
      params: {
        IPAddress: IPAddress
      }
    })
    result = data.result
    error = data.error
  }
  ctx.body = {
    error,
    result: {
      IPAddress: IPAddress,
      position: result ? result.result : null
    }
  }
})

/**
 * @api {put} /api/welcome welcome - 写入访客信息
 * @apiVersion 1.0.0
 * @apiName 写入访客信息
 *
 * @apiParam (必须) {String} IPAddress                IP地址
 * @apiParam (必须) {Object} position                 位置
 * @apiParam (必须) {Number} time                     时间
 * @apiParam (必须) {Number} day                      查询条件 当天零点时间戳
 * @apiParam (必须) {String} [browser]                浏览器版本、类型
 *
 * @apiGroup commonRouter
 * @apiSampleRequest off
 */
router.put(getRouterPath.r('PUT_WELCOME'), async (ctx) => {
  const {
          IPAddress,
          position,
          time,
          day,
          browser
        } = ctx.request.body
  // 使用$set 存在则更新，不存在则新增
  // 使用$setOnInsert 存在则不操作，不存在则新增
  const update = {
    $set: {},
    $inc: { 'visitors.sum': +1 }
  }
  const setKey = `visitors.userList.${IPAddress.toString().replace(/\./g, '-')}`
  update.$set[setKey] = {
    position,
    time,
    browser
  }
  const { error: err1 } = await config.mongoDB.updateManyData( // 更新 visitors
    'admin',
    {
      day: day.toString()
    },
    update,
    { upsert: true },
    ctx)
  const { error: err2 } = await config.mongoDB.updateManyData( // 更新 主站总访问数量
    'admin',
    {
      day: 'forever'
    },
    {
      $inc: {
        visitorsSum: +1
      }
    },
    { upsert: true },
    ctx)
  const error = err1 && err2
  ctx.body = {
    error,
    result: error ? 'error' : 'welcome'
  }
})

/**
 * @api {put} /api/browseStep browseStep - 浏览路径
 * @apiVersion 1.0.0
 * @apiName 浏览路径
 *
 * @apiParam (必须) {String} IPAddress                IP地址
 * @apiParam (必须) {String} time                     时间
 * @apiParam (必须) {Number} day                      查询条件 当天零点时间戳
 * @apiParam (必须) {Number} step                     时间戳
 *
 * @apiGroup commonRouter
 * @apiSampleRequest off
 */
router.put(getRouterPath.r('PUT_BROWSE_STEP'), async (ctx) => {
  const {
          IPAddress,
          time,
          day,
          step
        } = ctx.request.body
  const updateManySetKey = `action.${IPAddress.toString().replace(/\./g, '-')}`
  const updateMany = { $push: {} }
  updateMany.$push[updateManySetKey] = {
    time,
    step
  }
  const { error: err1 } = await config.mongoDB.updateManyData( // 更新 action
    'admin',
    { day: day.toString() },
    updateMany,
    { upsert: true },
    ctx)
  const updateOneSetKey = `article.${step._id}`
  const updateOne = { $inc: { 'article.sum': +1 } }
  updateOne.$inc[updateOneSetKey] = +1
  const { error: err2 } = await config.mongoDB.updateOneData( // 更新 article
    'admin',
    { day: day.toString() },
    updateOne,
    { upsert: true },
    ctx)
  const { error: err3 } = await config.mongoDB.updateOneData( // 更新总记录
    'admin',
    { day: 'forever' },
    { $inc: { ReadingQuantity: +1 } },
    { upsert: true },
    ctx)
  const error = [err1, err2, err3].includes(true)
  ctx.body = {
    error,
    result: error ? 'error' : 'stepRecord'
  }
})

/**
 * @api {get} /api/getWorks getWorks - 获取作品集
 * @apiVersion 1.0.0
 * @apiName 获取作品集
 *
 * @apiGroup commonRouter
 * @apiSampleRequest off
 */
router.get(getRouterPath.r('GET_WORKS'), async ctx => {
  const queryGroup = {
    $group: {
      // 根据category字段分组
      _id: '$category',
      // $$ROOT表示把所有属性都push到data中
      data: { $push: '$$ROOT' }
    }
  }

  const queryProject = {
    $project: {
      _id: 0,
      data: 1,
      // _id改名为category
      category: '$_id'
    }
  }

  const {
          result,
          error
        } = await config.mongoDB.aggregateData(
    'works',
    [queryGroup, queryProject],
    ctx)
  ctx.body = {
    result,
    error
  }
})

/**
 * @api {get} /api/getWorksStatic - 获取作品集(静态)
 * @apiVersion 1.0.0
 * @apiName 获取作品集
 *
 * @apiGroup commonRouter
 * @apiSampleRequest off
 */
router.get(getRouterPath.r('GET_WORKS_STATIC'), async ctx => {
  const queryGroup = {
    $group: {
      // 根据category字段分组
      _id: '$category',
      // $$ROOT表示把所有属性都push到data中
      data: { $push: '$$ROOT' }
    }
  }

  const queryProject = {
    $project: {
      _id: 0,
      data: 1,
      // _id改名为category
      category: '$_id'
    }
  }

  const {
          result,
          error
        } = await config.mongoDB.aggregateData(
    'worksStatic',
    [{
      $sort: {
        describeDate: -1
      }
    }, queryGroup, queryProject],
    ctx)
  ctx.body = {
    result,
    error
  }
})

// 查询是否需要初始化数据库, true则需要
router.get(getRouterPath.r('GET_INIT_DATABASE'), async ctx => {
  const { error, result } = await config.mongoDB.queryData('user', {}, null, ctx)
  ctx.body = {
    error,
    result: {
      init: result?.length === 0,
      token: result?.length === 0 ? jwt.getToken('init') : null
    }
  }
})

module.exports = router
