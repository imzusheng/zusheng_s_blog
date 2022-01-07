const router = require('@koa/router')()
const ObjectId = require('mongodb').ObjectId
const config = require('../../config/config')
const { GetRouterPath } = require('../../util')
const getRouterPath = new GetRouterPath('API_ARTICLES')

/**
 * @api {get} /api/articleDetail articleDetail - 文章详情
 * @apiVersion 1.0.0
 * @apiName 文章详情
 *
 * @apiParam (必须) {String} _id         _id
 *
 * @apiGroup commonRouter
 * @apiSampleRequest off
 */
router.get(getRouterPath.r('GET_ARTICLE_DETAIL'), async (ctx, next) => {
  const { _id } = ctx.query
  // const queryMatch = {
  //   $match: {
  //     _id
  //   }
  // }
  // const queryProject = {
  //   $project: {
  //     _id: 0
  //   }
  // }
  const {
    result,
    error
  } = await config.mongoDB.queryData('articles', { _id: ObjectId(_id) }, null, ctx)
  ctx.body = {
    result,
    error
  }
})

/**
 * @api {get} /api/articles articles - 已审核文章
 * @apiVersion 1.0.0
 * @apiName 已审核文章
 *
 * @apiGroup commonRouter
 * @apiSampleRequest off
 */
router.get(getRouterPath.r('GET_ARTICLES'), async (ctx, next) => {
  const queryMatch = { $match: { verify: true } }

  const queryLookup = {
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
  }
  // const queryUnwind = {
  //   $unwind: {
  //     path: '$articlesComments',
  //     preserveNullAndEmptyArrays: true
  //   }
  // }

  const {
    result,
    error
  } = await config.mongoDB.aggregateData('articles', [queryMatch, queryLookup, { $sort: { _id: -1 } }], ctx)
  // await config.mongoDB.queryData('articles', { verify: true }, null, ctx)
  ctx.body = {
    result,
    error
  }
})

/**
 * @api {put} /api/addHot addHot - 添加文章热度
 * @apiVersion 1.0.0
 * @apiName 添加文章热度
 *
 * @apiParam (必须) {String} _id        _id
 *
 * @apiGroup commonRouter
 * @apiSampleRequest off
 */
router.put(getRouterPath.r('PUT_ADD_HOT'), async (ctx, next) => {
  const { _id } = ctx.request.body
  const {
    error,
    result
  } = await config.mongoDB.updateOneData('articles', { _id: ObjectId(_id) }, { $inc: { 'operate.fire': 1 } }, { upsert: false }, ctx)
  ctx.body = {
    error,
    result
  }
})

module.exports = router
