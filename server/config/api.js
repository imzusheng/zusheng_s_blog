// const config = require('./config')

const API_ARTICLES = {
  /** 获取文章 */
  GET_ARTICLES: '/articles',
  /** 获取文章详情 */
  GET_ARTICLE_DETAIL: '/articleDetail',
  /** 增加文章热度 */
  PUT_ADD_HOT: '/addHot'
}

const API_COMMENTS = {
  /** 获取审核通过的评论 */
  GET_COMMENTS: '/comments',
  /** 赞同评论 */
  POST_LIKE_COMMENTS: '/commentsLike',
  /** 新增评论 */
  POST_ADD_COMMENTS: '/commentsAdd',
  /** 反悔 */
  POST_BACK_COMMENTS: '/commentsLikeBack'
}

const API_ADMIN = {
  /** 发布博客 */
  POST_ADD_ARTICLE: '/addArticle',
  /** 修改博客 */
  PUT_MODIFY_ARTICLE: '/modifyArticle',
  /** 审核通过 */
  PUT_VERIFY_ARTICLE: '/verifyArticle',
  /** 删除文章 */
  DELETE_ARTICLE: '/deleteArticle',
  /** 获取所有文章 */
  GET_ALL_ARTICLES: '/allArticle',
  /** 获取统计 */
  GET_OVERVIEW: '/overview',
  /** 获取所有统计 */
  GET_ALL_OVERVIEW: '/allOverview',
  /** 获取所有评论 */
  GET_ALL_COMMENTS: '/allComments',
  /** 审核评论 */
  PUT_VERIFY_COMMENTS: '/commentsVerify',
  /** 删除评论 */
  DELETE_COMMENTS: '/commentsDelete',
  /** reset */
  SET_WELCOME: '/setWelcome',
  /** 获取日志logs */
  GET_LOGS: '/logs',
  /** 修复单一错误 */
  PUT_REPAIR_ERROR: '/repairError',
  /** 修复一天错误 */
  PUT_REPAIR_DAY_ERROR: '/repairDayError',
  /** 重新获取token */
  GET_TOKEN_RENEW: '/tokenRenew',
  /** 获取登录历史位置 */
  GET_LOGIN_RECORDS: '/loginRecords',
  /** 修改密码 */
  PUT_UPDATE_PWD: '/updatePwd',
  /** 发布作品集 */
  POST_ADD_WORKS: '/addWorks',
  /** 修改作品集 */
  PUT_MODIFY_WORKS: '/modifyWorks',
  /** 删除作品集 */
  DELETE_WORKS: '/deleteWorks'
}

const API_COMMON = {
  /** 菜单搜索框 */
  GET_SEARCH: '/search',
  /** 获取用户IP, 位置信息 */
  GET_USER_ORIGIN: '/userOrigin',
  /** 提交用户IP， 位置信息入库 */
  PUT_WELCOME: '/welcome',
  /** 提交用户浏览器信息， 访问记录和路径 */
  PUT_BROWSE_STEP: '/browseStep',
  /** 登录 */
  POST_LOGIN: '/login',
  /** 获取作品集(爬虫动态更新) */
  GET_WORKS: '/getWorks',
  /** 获取作品集(静态) */
  GET_WORKS_STATIC: '/getWorksStatic',
  /** 查询是否需要初始化数据库 */
  GET_INIT_DATABASE: '/initDatabase',
  /** ECharts 百度指数 */
  GET_BAIDU_INDEX: '/baiduIndex',
  /** 获取外部文件 */
  GET_EXTERNAL_FILE: '/externalFile'
}

const API_UPLOAD = {
  /** 单次上传文件 */
  POST_COMMON_UPLOAD: '/upload/once',
  /** 上传前检查文件是否存在 */
  POST_COMMON_BEFORE_UPLOAD: '/upload/beforeUpload',
  /** 分片上传 */
  POST_COMMON_UPLOAD_V2: '/upload/chunks',
  /** 分片合并 */
  POST_COMMON_UPLOAD_MERGE: '/upload/merge'
}

const API_STATIC = {
  /** 静态目录 */
  GET_STATIC: '/assets'
}

const API_ROOT = {
  // BASE_URL: process.env.NODE_ENV === 'development' ? `http://localhost:${config.serverPort}` : 'https://blog.zusheng.club',
  BASE_URL: 'https://blog.zusheng.club',
  BASE_URL_PREFIX: '/api'
}

module.exports = {
  API_ADMIN,
  API_ROOT,
  API_UPLOAD,
  API_STATIC,
  API_ARTICLES,
  API_COMMON,
  API_COMMENTS
}
