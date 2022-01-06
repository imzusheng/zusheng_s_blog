import { createStore } from 'vuex'
import { getBeforeDate, getBrowser, getScrollWidth } from '@/util'
import { message } from 'ant-design-vue'
import { apiService } from '@/util/axios'
import router from '@/router'

const store = createStore({
  state: {
    api: null,
    g: {
      // 头部
      header: {
        curSelected: '' // 菜单选中项目
      },
      scrollWidth: getScrollWidth, // 滚动条宽度
      menuConfig: {
        anchor: localStorage.getItem('anchor') !== null ? JSON.parse(localStorage.getItem('anchor')) : true, // 开启
        theme: localStorage.getItem('theme') !== null ? JSON.parse(localStorage.getItem('theme')) : false, // 默认关闭
        toTop: localStorage.getItem('toTop') !== null ? JSON.parse(localStorage.getItem('toTop')) : true, // 默认打开
        codeTheme: localStorage.getItem('codeTheme') ?? 'hljs-agate',
        codeThemeList: [
          {
            value: 'hljs-agate',
            label: 'agate'
          }, {
            value: 'hljs-an-old-hope',
            label: 'an-old-hope'
          }, {
            value: 'hljs-vs2015',
            label: 'vs2015'
          }, {
            value: 'hljs-gradient-dark',
            label: 'gradient-dark'
          }, {
            value: 'hljs-gradient-light',
            label: 'gradient-light'
          }, {
            value: 'hljs-tomorrow',
            label: 'tomorrow'
          }, {
            value: 'hljs-tomorrow-night',
            label: 'tomorrow-night'
          }, {
            value: 'hljs-tomorrow-night-blue',
            label: 'tomorrow-night-blue'
          }, {
            value: 'hljs-tomorrow-night-bright',
            label: 'tomorrow-night-bright'
          }, {
            value: 'hljs-tomorrow-night-eighties',
            label: 'tomorrow-night-eighties'
          }
        ],
        adminTheme: localStorage.getItem('adminTheme') !== null ? (localStorage.getItem('adminTheme') !== 'false') : false // 默认关闭
      },
      blocks: null, // 文章详情中所有的 pre > code HTMLElement
      title: null, // 文章详情中所有的 标题 HTMLElement
      menuActive: false, // 侧边菜单活动状态
      beforeReadScrollTop: 0,
      articles: [], // 所有文章 admin
      comments: [], // 所有评论 admin
      indexComments: [], // 当前版块评论
      searchListComments: [], // 搜索栏展示的评论
      searchListArticles: [], // 搜索栏展示的文章
      ip: sessionStorage.getItem('ip') ? JSON.parse(sessionStorage.getItem('ip')) : {
        IPAddress: '127.0.0.1',
        position: null
      },
      reg: {
        Pro: new RegExp(/\/Pro/)
      },
      searchActiveKey: '1'
    },
    el: {
      wrap: ''
    },
    admin: {
      menu: {
        curSelectedKeys: [] // 菜单选中项
      },
      LoginRecords: [], // 登录历史记录
      header: {
        title: '',
        routes: [{ // 面包屑
          icon: 'HomeFilled',
          name: 'Home'
        }]
      }
    }
  },
  mutations: {
    // 登录成功
    loginSuccess (state, result) {
      const { data: { exp, token }, uid, pwd } = result
      localStorage.setItem('uid', uid)
      localStorage.setItem('pwd', pwd)
      localStorage.setItem('token', token)
      localStorage.setItem('tokenExp', exp)
      router.replace({
        path: '/Pro'
      }).then()
    },
    // 赋值Storage
    storageAssignment (state) {
      ['anchor', 'theme', 'toTop', 'codeTheme', 'adminTheme'].map(index => {
        const storageRaw = localStorage.getItem(index)
        state.g.menuConfig[index] = ['true', 'false'].includes(storageRaw) ? Boolean(storageRaw) : storageRaw
      })
    },
    // 保存api
    recordApi (state, api) {
      state.api = api
    },
    // 保存登录历史记录
    recordLoginRecords (state, payLoad) {
      if (payLoad && payLoad?.length > 0) {
        if (payLoad[0].LoginRecords) state.admin.LoginRecords = payLoad.map(item => item.LoginRecords).reverse()
      }
    },
    // 保存HTMLElement, state.g.blocks 和 state.g.title
    saveElement (state, elementCollections) {
      elementCollections.forEach(item => {
        state.g[item.type] = item.el
      })
    },
    // 清理HTMLElement
    deleteElement (state) {
      state.g.blocks = null
      state.g.title = null
    },
    // 保存上次浏览位置
    recordScrollTop (state, scrollTop) {
      state.g.beforeReadScrollTop = scrollTop
    },
    // 保存传入的HTMLElement
    changeDomEl (state, el) {
      state.el[el.name] = el.dom
    },
    // 全局前置路由卫士触发
    routerBeforeEachAdmin (state, to) {
      state.admin.menu.curSelectedKeys = [to.meta.title] // 记录当前选中的菜单
      const tempArr = []
      to.matched.forEach(item => {
        tempArr.push({
          name: item.name,
          icon: item.meta.icon
        })
      })
      state.admin.header.routes = tempArr
    },
    // 全局前置路由卫士触发
    routerBeforeEachDefault (state, to) {
      state.g.header.curSelected = to.name
    },
    // 记录用户IP
    recordIP (state, data) {
      const {
              IPAddress,
              position
            } = data
      state.g.ip = {
        IPAddress,
        position
      }
      sessionStorage.setItem('ip', JSON.stringify({
        IPAddress,
        position
      }))
    },
    // 保存文章
    recordArticles (state, data) {
      state.g.articles = data
    },
    // 保存搜索栏展示的文章列表数据
    recordSearchListArticles (state, data) {
      state.g.searchListArticles = data
    },
    // 保存搜索栏展示的评论列表数据
    recordSearchListComments (state, data) {
      state.g.searchListComments = data
    },
    // 保存主站展示的评论列表数据
    recordIndexComments (state, data) {
      state.g.indexComments = data
    },
    // admin
    recordComments (state, data) {
      state.g.comments = data
    },
    // 保存新密码
    recordNewPwd (state, result) {
      localStorage.removeItem('pwd')
      localStorage.removeItem('apiRecord')
      localStorage.removeItem('token')
      window.location.reload()
    }
  },
  actions: {
    // 获取 api 配置文件
    initConfig () {
      return new Promise(resolve => apiService.getBaseURL('config').then(result => resolve(result)))
    },
    // 登录初始化, 获取用户位置IP信息 - 保存到 sessionStorage - 后台入库
    initLogin ({ commit, state: { api } }) {
      apiService.get(api.API_COMMON.GET_USER_ORIGIN)
                .then(result => {
                  const {
                          IPAddress,
                          position
                        } = result
                  // 保存到 sessionStorage
                  commit('recordIP', result)
                  // 后台入库
                  apiService.put(api.API_COMMON.PUT_WELCOME, {
                    IPAddress,
                    position,
                    time: new Date().getTime(),
                    day: getBeforeDate(0),
                    browser: getBrowser()
                  })
                })
    },
    // 登录
    login ({ commit, state }, payLoad) {
      apiService
        .post(state.api.API_COMMON.POST_LOGIN, Object.assign(payLoad, ...[state.g.ip, { time: Date.now() }]))
        .then(result => { if (result) commit('loginSuccess', result) })
    },
    // 登陆前查询是否需要初始化数据库, 第一次登陆时需要
    getInitDatabase ({ state: { api } }) {
      return new Promise(resolve => apiService.get(api.API_COMMON.GET_INIT_DATABASE).then(result => resolve(result)))
    },
    // 获取文章
    getArticles ({ commit, state: { api } }, payLoad) {
      return new Promise(resolve => {
        const curApi = payLoad === 'all' ? api.API_ADMIN.GET_ALL_ARTICLES : api.API_ARTICLES.GET_ARTICLES
        apiService.get(curApi).then(result => {
          commit('recordArticles', result)
          resolve()
        })
      })
    },
    // 搜索
    getSearch ({ commit, state: { api } }, payLoad) {
      return new Promise(resolve => {
        if (!payLoad.content) {
          commit('recordSearchListArticles', [])
          commit('recordSearchListComments', [])
          resolve()
        } else {
          apiService.get(api.API_COMMON.GET_SEARCH, payLoad).then(result => {
            commit('recordSearchListArticles', result.articles)
            commit('recordSearchListComments', result.comments)
            resolve()
          })
        }
      })
    },
    // 获取文章详情
    getBlogDetail ({ state: { api } }, payLoad) {
      return new Promise(resolve => apiService.get(api.API_ARTICLES.GET_ARTICLE_DETAIL, payLoad).then(result => resolve(result ? result[0] : [])))
    },
    // 增加文章热度
    addBlogHot ({ state: { api } }, payLoad) {
      apiService.put(api.API_ARTICLES.PUT_ADD_HOT, payLoad)
    },
    // 获取静态文件资源
    getGlobalAssets ({ state: { api } }, payLoad) {
      return new Promise(resolve => {
        apiService.getAssets(api.API_STATIC.GET_STATIC, payLoad).then(result => resolve(result)).catch(() => resolve(null))
      })
    },
    // 添加新博客
    addNewBlog ({ state: { api } }, payLoad) {
      return new Promise(resolve =>
        apiService.post(api.API_ADMIN.POST_ADD_ARTICLE, payLoad)
                  .then(result => resolve(result))
                  .catch(() => resolve(null))
      )
    },
    // 修改博客内容
    modifyBlog ({ state: { api } }, payLoad) {
      return new Promise(resolve =>
        apiService.put(api.API_ADMIN.PUT_MODIFY_ARTICLE, payLoad)
                  .then(result => resolve(result))
                  .catch(() => resolve(null))
      )
    },
    // 删除博客
    deleteArticles ({ state: { api } }, payLoad) {
      return new Promise(resolve => {
        apiService.delete(api.API_ADMIN.DELETE_ARTICLE, payLoad).then(result => resolve(result))
      })
    },
    // 获取时间区间内的后台数据
    getOverview ({ state: { api } }, payLoad) {
      return new Promise(resolve => apiService.get(api.API_ADMIN.GET_OVERVIEW, payLoad).then(result => resolve(result)))
    },
    // 获取历史总数据
    getHistoryOverview ({ state: { api } }) {
      return new Promise(resolve => apiService.get(api.API_ADMIN.GET_ALL_OVERVIEW).then(result => resolve(result ? result[0] : [])))
    },
    // 获取已审核评论
    getComments ({ commit, state: { api } }, payLoad) {
      apiService.get(api.API_COMMENTS.GET_COMMENTS, payLoad).then(result => commit('recordIndexComments', result))
    },
    // 获取所有评论
    getAllComments ({ commit, state: { api } }) {
      return new Promise(resolve =>
        apiService.get(api.API_ADMIN.GET_ALL_COMMENTS).then(result => {
          commit('recordComments', result)
          resolve(result)
        })
      )
    },
    // 审核文章
    putVerifyArticle ({ state: { api } }, payLoad) {
      return new Promise(resolve => apiService.put(api.API_ADMIN.PUT_VERIFY_ARTICLE, payLoad).then(result => resolve(result)))
    },
    // 记录浏览的文章
    putBrowseStep ({ state: { api } }, payLoad) {
      return new Promise(resolve => {
        if (api?.API_COMMON) {
          apiService.put(api.API_COMMON.PUT_BROWSE_STEP, payLoad).then(result => resolve(result))
        } else {
          resolve('Error: recordBrowseStep')
        }
      })
    },
    // 提交新评论
    postCommentsAdd ({ state: { api } }, payLoad) {
      return new Promise(resolve => apiService.post(api.API_COMMENTS.POST_ADD_COMMENTS, payLoad).then(result => resolve(result)))
    },
    // 喜欢/反对评论
    postCommentsLike ({ state: { api } }, payLoad) {
      apiService.post(api.API_COMMENTS.POST_LIKE_COMMENTS, payLoad).then(result => {
        if (result) message.success(result)
      })
    },
    // 反悔
    postCommentsBack ({ state: { api } }, payLoad) {
      apiService.post(api.API_COMMENTS.POST_BACK_COMMENTS, payLoad).then(result => {
        if (result) message.success(result)
      })
    },
    // 审核评论
    putVerifyComments ({ state: { api } }, payLoad) {
      return new Promise(resolve => apiService.put(api.API_ADMIN.PUT_VERIFY_COMMENTS, payLoad).then(result => resolve(result)))
    },
    // 删除评论
    deleteComments ({ state: { api } }, payLoad) {
      return new Promise(resolve => {
        apiService.delete(api.API_ADMIN.DELETE_COMMENTS, payLoad).then(result => resolve(result))
      })
    },
    // 获取logs
    getLogs ({ state: { api } }, payLoad) {
      return new Promise(resolve => {
        apiService.get(api.API_ADMIN.GET_LOGS, payLoad).then(result => resolve(result))
      })
    },
    // 修复单个错误
    putRepairError ({ state: { api } }, payLoad) {
      return new Promise(resolve => {
        apiService.put(api.API_ADMIN.PUT_REPAIR_ERROR, payLoad).then(result => {
          resolve(result)
        })
      })
    },
    // 修复一天错误
    putRepairDayError ({ state: { api } }, payLoad) {
      return new Promise(resolve => {
        apiService.put(api.API_ADMIN.PUT_REPAIR_DAY_ERROR, payLoad).then(result => {
          resolve(result)
        })
      })
    },
    // 重新获取token
    getTokenRenew ({ commit, state: { api } }, payLoad) {
      return new Promise(resolve => {
        apiService.get(api.API_ADMIN.GET_TOKEN_RENEW, payLoad).then(result => {
          resolve(result)
        })
      })
    },
    // 获取登录位置历史信息
    getLoginRecords ({ commit, state: { api } }, payLoad) {
      apiService.get(api.API_ADMIN.GET_LOGIN_RECORDS, payLoad).then(result => {
        commit('recordLoginRecords', result)
      })
    },
    // 修改密码
    putUpdatePwd ({ commit, state: { api } }, payLoad) {
      apiService.put(api.API_ADMIN.PUT_UPDATE_PWD, payLoad).then(result => {
        commit('recordNewPwd', result)
      })
    },
    // 重置数据库
    resetDatabase ({ state: { api } }) {
      apiService.get(api.API_ADMIN.SET_WELCOME).then(({ error }) => {
        error ? message.error('出现错误') : message.success('格式化成功')
      })
    },
    // 获取作品集
    getWorks ({ state: { api } }) {
      return new Promise(resolve => apiService.get(api.API_COMMON.GET_WORKS).then(result => resolve(result)))
    },
    // 获取作品集(静态)
    getWorksStatic ({ state: { api } }) {
      return new Promise(resolve => apiService.get(api.API_COMMON.GET_WORKS_STATIC).then(result => resolve(result)))
    },
    // 添加新作品集
    addNewWorks ({ state: { api } }, payLoad) {
      return new Promise(resolve =>
        apiService.post(api.API_ADMIN.POST_ADD_WORKS, payLoad)
                  .then(result => resolve(result))
                  .catch(() => resolve(null))
      )
    },
    // 获取ECharts数据
    getECharts ({ state: { api } }, payLoad) {
      return new Promise(resolve => apiService.get(api.API_COMMON.GET_BAIDU_INDEX, payLoad).then(result => resolve(result)))
    },
    // 获取外部文件
    getExternalFile ({ state: { api } }, payLoad) {
      payLoad.header = payLoad?.header || null
      return new Promise(resolve => apiService.get(api.API_COMMON.GET_EXTERNAL_FILE, payLoad).then(result => resolve(result)))
    }
  },
  modules: {}
})

export default store

export const exposeStore = function () {
  return store
}
