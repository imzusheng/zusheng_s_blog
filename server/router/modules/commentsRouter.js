const router = require('@koa/router')()
const ObjectId = require('mongodb').ObjectId
const config = require('../../config/config')
const { GetRouterPath } = require('../../util')
const getRouterPath = new GetRouterPath('API_COMMENTS')

/**
 * @api {get} /api/comments comments - 获取审核评论
 * @apiVersion 1.0.0
 * @apiName 获取审核评论
 * @apiGroup commentsRouter
 * @apiSampleRequest off
 */
router.get(getRouterPath.r('GET_COMMENTS'), async ctx => {
  const {
    link,
    linkId
  } = ctx.query
  const query = {
    link,
    verify: true
  }
  if (linkId) {
    query.linkId = ObjectId(linkId)
  }
  const {
    result,
    error
  } = await config.mongoDB.queryData('comments', query, { _id: -1 }, null, ctx)
  ctx.body = {
    result,
    error
  }
})

/**
 * @api {post} /api/commentsAdd commentsAdd - 新增
 * @apiVersion 1.0.0
 * @apiName 新增评论
 *
 * @apiParam (必须) {Number} day                      查询条件 当天零点时间戳
 * @apiParam (必须) {String} avatar                   头像链接
 * @apiParam (必须) {Number} time                     时间戳
 * @apiParam (必须) {String} content                  评论内容
 * @apiParam (必须) {String} link                     链接模板
 * @apiParam (必须) {String}  linkId=null             链接文章 _id
 * @apiParam (作者信息) {Object} [author=null]         作者信息
 * @apiParam (作者信息) {String} [author[IPAddress]]   作者 ip
 * @apiParam (作者信息) {Object} [author[position]]    作者位置
 * @apiParam (可选) {Boolean} [verify=false]          审核状态
 * @apiParam (可选) {Object}  [like={}]               赞同数量
 * @apiParam (可选) {Object}  [dislike={}]            反对数量
 *
 * @apiGroup commentsRouter
 * @apiSampleRequest off
 */
router.post(getRouterPath.r('POST_ADD_COMMENTS'), async ctx => {
  const data = ctx.request.body
  data.like = { sum: 0 }
  data.dislike = { sum: 0 }
  data.verify = false
  if (data.linkId) {
    data.linkId = ObjectId(data.linkId)
  }
  const argDay = data.day
  delete data.day
  const { error: err1 } = await config.mongoDB.insertOneData('comments', data) // 插入新评论
  const { error: err2 } = await config.mongoDB.updateOneData( // 更新每日记录
    'admin',
    { day: argDay.toString() },
    { $inc: { 'comments.sum': +1 } },
    { upsert: true },
    ctx)
  const { error: err3 } = await config.mongoDB.updateOneData( // 更新总记录
    'admin',
    { day: 'forever' },
    { $inc: { commentsQuantity: +1 } },
    { upsert: true },
    ctx)
  ctx.body = {
    error: [err1, err2, err3].includes(true),
    result: '评价成功'
  }
})

/**
 * @api {post} /api/commentsLike commentsLike - 赞和踩
 * @apiVersion 1.0.0
 * @apiName 赞和踩
 *
 * @apiParam (必须) {String} _id                      评论 _id
 * @apiParam (必须) {String} type                     like或dislike
 * @apiParam (必须) {Number} day                      查询条件 当天零点时间戳
 * @apiParam (必须) {Number} time                     时间戳
 * @apiParam (必须) {String} IPAddress                发出者 ip
 * @apiParam (必须) {Object} position                 位置
 *
 * @apiGroup commentsRouter
 * @apiSampleRequest off
 */
router.post(getRouterPath.r('POST_LIKE_COMMENTS'), async ctx => {
  const {
    _id,
    type,
    day,
    time,
    IPAddress,
    position
  } = ctx.request.body
  /**
   * # example
   * commentsUpdate: {
   *   $inc: {
   *     'like.sum': +1
   *   },
   *   $push: {
   *     'like.userList': [
   *       {
   *         ip: ...,
   *         position: ...,
   *         time: ...
   *       }
   *     ]
   *   }
   * }
   */
  const commentsUpdate = {
    $inc: {},
    $push: {}
  }
  const commentsUpdatePushKey = `${type}.userList`
  const commentsUpdateIncKey = `${type}.sum`
  commentsUpdate.$push[commentsUpdatePushKey] = {
    IPAddress,
    position,
    time
  }
  commentsUpdate.$inc[commentsUpdateIncKey] = +1
  const { error: err1 } = await config.mongoDB.updateOneData( // 更新 comments
    'comments',
    { _id: ObjectId(_id) },
    commentsUpdate,
    { upsert: true },
    ctx
  )
  // -- comments 集合操作完成,以下修改 admin 每日记录 -- //
  const adminCommentsUpdate = {
    $inc: {},
    $push: {}
  }
  const adminCommentsPushKey = `comments.${type}.userList`
  const adminCommentsIncKey = `comments.${type}.sum`
  adminCommentsUpdate.$push[adminCommentsPushKey] = {
    IPAddress,
    position,
    time
  }
  adminCommentsUpdate.$inc[adminCommentsIncKey] = +1
  const { error: err2 } = await config.mongoDB.updateOneData( // 更新 admin 每日记录
    'admin',
    { day: day.toString() },
    adminCommentsUpdate,
    { upsert: true },
    ctx)
  ctx.body = {
    error: [err1, err2].includes(true),
    result: [err1, err2].includes(true) ? null : '评价成功'
  }
})

/**
 * @api {post} /api/commentsLike commentsLikeBack - 反悔
 * @apiVersion 1.0.0
 * @apiName 反悔
 *
 * @apiParam (必须) {String} _id                      评论 _id
 * @apiParam (必须) {String} type                     liked或disliked
 * @apiParam (必须) {Number} day                      查询条件 当天零点时间戳
 * @apiParam (必须) {Number} befTime                  查询条件 上一次评价的时间
 * @apiParam (必须) {Number} time                     时间戳
 * @apiParam (必须) {String} IPAddress                发出者 ip
 * @apiParam (必须) {Object} position                 位置
 *
 * @apiGroup commentsRouter
 * @apiSampleRequest off
 */
router.post(getRouterPath.r('POST_BACK_COMMENTS'), async ctx => {
  const {
    _id,
    type,
    day,
    time,
    befTime,
    IPAddress,
    position
  } = ctx.request.body
  /**
   * # example
   * commentsUpdate: {
   *   $inc: {
   *     'like.sum': +1,
   *     'dislike.sum': -1
   *   },
   *   $pull: {
   *     'like.userList: {
   *       IPAddress: ...
   *     }
   *   },
   *   $push: {
   *     'like.userList': [
   *       {
   *         IPAddress: ...,
   *         position: ...,
   *         time: ...
   *       }
   *     ]
   *   }
   * }
   */
  const pushJudgement = type === 'likeToDislike' ? 'dislike' : 'like' // dislike 加一票
  const pullJudgement = type !== 'likeToDislike' ? 'dislike' : 'like' // like 减一票
  const commentsUpdatePushIncKey = `${pushJudgement}.sum` // comments集合的路径
  const commentsUpdatePullIncKey = `${pullJudgement}.sum`
  const adminUpdatePushIncKey = `comments.${pushJudgement}.sum` // admin集合的路径
  const adminUpdatePullIncKey = `comments.${pullJudgement}.sum`
  const commentsUpdate = {
    $inc: {},
    $push: {},
    $pull: {}
  }
  const adminUpdate = {
    $inc: {},
    $push: {},
    $pull: {}
  }
  commentsUpdate.$inc[commentsUpdatePushIncKey] = +1
  commentsUpdate.$inc[commentsUpdatePullIncKey] = -1
  adminUpdate.$inc[adminUpdatePushIncKey] = +1
  adminUpdate.$inc[adminUpdatePullIncKey] = -1
  // $inc 完成
  const commentsPushKey = `${pushJudgement}.userList`
  const commentsPullKey = `${pullJudgement}.userList`
  const adminCommentsPushKey = `comments.${pushJudgement}.userList`
  const adminCommentsPullKey = `comments.${pullJudgement}.userList`
  commentsUpdate.$push[commentsPushKey] = {
    IPAddress,
    position,
    time
  }
  adminUpdate.$push[adminCommentsPushKey] = {
    IPAddress,
    position,
    time,
    _id
  }
  // $push 完成
  // TODO 无法实现只删除单个元素,考虑使用mongoose
  commentsUpdate.$pull[commentsPullKey] = {
    IPAddress,
    time: befTime
  }
  adminUpdate.$pull[adminCommentsPullKey] = {
    IPAddress,
    time: befTime
  }
  // $pull 完成
  const { error: err1 } = await config.mongoDB.updateManyData(
    'comments',
    { _id: ObjectId(_id) },
    commentsUpdate,
    {
      upsert: true
    },
    ctx
  )
  // -- comments 集合操作完成,以下修改 admin 每日记录 -- //
  const { error: err2 } = await config.mongoDB.updateOneData(
    'admin',
    { day: day.toString() },
    adminUpdate,
    {
      upsert: true
    },
    ctx
  )
  ctx.body = {
    error: [err1, err2].includes(true),
    result: '评价成功'
  }
})

module.exports = router
