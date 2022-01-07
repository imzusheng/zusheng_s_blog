const router = require('@koa/router')()
const config = require('../../config/config')
const API = require('../../config/api')
const { GetRouterPath, getBeforeDate, formatDate } = require('../../util')
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
  let res
  if (ctx.request.header.origin || ctx.request.header['x-real-ip']) {
    IPAddress =
      ctx.request.header['x-real-ip'] ||
      ctx.request.header.origin.slice(
        ctx.request.header.origin.indexOf('://') + 3,
        ctx.request.header.origin.lastIndexOf(':')
      )
  }
  if (!(/localhost/.test(IPAddress))) {
    const { data } = await axios({
      url: 'https://zusheng.club/api/userOrigin',
      method: 'get',
      params: { IPAddress }
    })
    res = data
  }
  ctx.body = {
    error: res?.error,
    result: {
      IPAddress,
      position: res?.error ? null : res?.result
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
  // ip地址中的'.'需要转换一下 不然会识别成对象的属性访问
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
  const { error: err2 } = await config.mongoDB.updateOneData( // 更新 article 访问记录+1
    'admin',
    { day: day.toString() },
    updateOne,
    { upsert: true },
    ctx)
  const { error: err3 } = await config.mongoDB.updateOneData( // 更新网站访问量总记录
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

/**
 * @api {get} /api/baiduIndex - 获取百度指数
 * @apiVersion 1.0.0
 * @apiName 获取百度指数
 *
 * @apiGroup commonRouter
 * @apiSampleRequest off
 */
router.get(getRouterPath.r('GET_BAIDU_INDEX'), async ctx => {
  const { value } = ctx.query
  const { data } = await axios({
    url: 'http://index.baidu.com/api/SearchApi/region',
    method: 'get',
    params: {
      region: 0,
      word: value,
      startDate: formatDate(getBeforeDate(-30), 'transform', '-'),
      endDate: formatDate(null, 'transform', '-')
    },
    headers: { Cookie: 'BAIDUID=9956616CC3043E0889FB2F4F7F4A3EFF:FG=1; BIDUPSID=9956616CC3043E086EA9A6048F7E8DB6; PSTM=1637923173; BDUSS=UVYV2J1TX5NT3BXMmlUd3J5ZXVLUDB-RHJpOE5oZWZRaENWa1dPaWdqZEVvZFpoSVFBQUFBJCQAAAAAAAAAAAEAAAD9Gb20yNXJ~dGns6S1xNGns6QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEQUr2FEFK9hM; BDORZ=FFFB88E999055A3F8A630C64834BD6D0; BA_HECTOR=00ah8l0l85ag8h24r41gt2c8n0q; BDRCVFR[gltLrB7qNCt]=mk3SLVN4HKm; delPer=1; PSINO=6; H_PS_PSSID=35638_35105_31254_35629_35489_35457_34584_35490_35316_26350_35610; BCLID=11590000010128874477; BDSFRCVID=EIuOJexroG04RNRHFHAxUmwzwQpWxY5TDYrELPfiaimDVu-VJeC6EG0Pts1-dEu-EHtdogKK3gOTHxtF_2uxOjjg8UtVJeC6EG0Ptf8g0M5; H_BDCLCKID_SF=tJ48_CLMfC_3fP36q4rMM-LthfLX5-RLf5v4Lp7F5l8-hxc3-PJrXUkzbH_HL4rfMjkjKnOetJrxOKQphT5deMDp5a3W-l5bter4hprN3KJmqtP9bT3v5tD35pbK2-biWb7M2MbdMPbP_IoG2Mn8M4bb3qOpBtQmJeTxoUJ25DnJhhCGe6L3MtCObqAX5to05TIX3b7Efh5zfq7_bJ7KhUbQjb5wQfvlWg6O-R65Mt3GqM39WjoxQhFXQtvTKtcK2CjR-tKEQqcqEIQHQT3m5bJLqfO4-Cr4WTnbWb3cWKOJ8UbS2bOPBTD02-nBat-OQ6npaJ5nJq5nhMJmb67JDMr0exbH55ueJR4H_M5; Hm_lvt_d101ea4d2a5c67dab98251f0b5de24dc=1641099537,1641099555; Hm_lpvt_d101ea4d2a5c67dab98251f0b5de24dc=1641099910; RT="z=1&dm=baidu.com&si=308emylrqos&ss=kxwsak3i&sl=h&tt=tcr&bcn=https%3A%2F%2Ffclog.baidu.com%2Flog%2Fweirwood%3Ftype%3Dperf&ld=81wt"; __yjs_st=2_MDA5ODViMjE5MDQ5OGQwNGFmMmNiNTQ1ZTk2Y2ViYzlhMDAwZWU2NmNlNTM2NDg2MGNjZTAzMDc3ODU2N2ZkZjM2YTFhNDY5ZjU2NDYyYzMwNDU3NmViNGVhMjNlNTFlZTk0M2U5MzFjYjZhMWExOTRiNzkwMGNmNTZkMDBkM2NlYTFjZTJjODI2YWZiNzZjZWI4ZGQ3ZWQ5ZTAwNjkzMTVlM2JmODA4OWE4MjQ4ZDViOGE5OTEwNzMzMDk1ZmFhYWFiMmZlYThiMTcyODg5YjdmYTQyYTUzYzA5MjA1YzhlZjg4NDIyMzllOTkwYWUwOTY0MDM1NjhlOTcwMDY5Nl83XzgxZjdkYTI5; bdindexid=c0eaar0mbli5l6tu5ergcalj22' }
  })
  ctx.body = {
    result: data,
    error: false
  }
})

/**
 * @api {get} /api/externalFile externalFile - 请求外部文件
 * @apiVersion 1.0.0
 * @apiName 请求外部文件
 *
 * @apiGroup commonRouter
 * @apiSampleRequest off
 */
router.get(getRouterPath.r('GET_EXTERNAL_FILE'), async (ctx) => {
  const { data } = await axios({
    method: 'get',
    url: 'https://zusheng.club/api/externalFile',
    params: ctx.query
  })
  ctx.body = {
    error: null,
    result: data
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
