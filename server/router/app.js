const router = require('@koa/router')()// koa 路由中间件
const staticRouter = require('./modules/staticRouter')
const commonRouter = require('./modules/commonRouter')
const commentsRouter = require('./modules/commentsRouter')
const articlesRouter = require('./modules/articlesRouter')
router
  .use(articlesRouter.routes())
  .use(commentsRouter.routes())
  .use(staticRouter.routes())
  .use(commonRouter.routes())
// 无需权限
const authorizationRouter = require('@koa/router')()
const adminRouter = require('./modules/adminRouter')
const uploadRouter = require('./modules/uploadRouter')
authorizationRouter
  .use(adminRouter.routes())
  .use(uploadRouter.routes())
// 需要权限的路由
module.exports = {
  router,
  authorizationRouter
}
