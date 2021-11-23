import { createRouter, createWebHistory } from 'vue-router'
import { exposeStore } from '@/store'
import { deleteTokenStorage, getBeforeDate } from '@/util'
import { message, Modal } from 'ant-design-vue'

const store = exposeStore()

/**
 * @example
 * meta: {
 *   icon: 'AreaChartOutlined',  // 侧边菜单的icon图标
 *   title: '统计',               // 菜单显示名称
 *   keepalive: false,           //  组件是否缓存
 *   searchBar: false            // 该页面是否显示搜索栏
 * }
 *
 */
const routes = [
  {
    path: '/',
    redirect: '/Blog'
  },
  {
    path: '/Search',
    name: 'BlogSearch',
    meta: {
      keepalive: true
    },
    component: () => import(/* webpackChunkName: "blog" */ '@/pages/views/BlogSearch')
  },
  {
    path: '/Login',
    name: 'Login',
    meta: {
      keepalive: false
    },
    component: () => import(/* webpackChunkName: "pro" */ '@/pages/views/Login')
  },
  {
    path: '/Blog',
    meta: {
      keepalive: true
    },
    // webpackPrefetch: true,
    component: () => import(/* webpackChunkName: "blog" */ '@//pages/layouts/default'),
    children: [
      {
        path: '',
        name: 'BlogHome',
        meta: {
          keepalive: true
        },
        component: () => import(/* webpackChunkName: "blog" */ '@/pages/views/BlogHome')
      },
      {
        path: 'Detail',
        name: 'BlogDetail',
        meta: {
          keepalive: false
        },
        component: () => import(/* webpackChunkName: "blog" */ '@/pages/views/BlogDetail')
      }
    ]
  },
  // 后台
  {
    path: '/Pro',
    name: 'Home',
    meta: {
      keepalive: false,
      icon: 'HomeFilled'
    },
    component: () => import(/* webpackChunkName: "pro" */ '@/pages/layouts/admin'),
    children: [
      {
        path: '',
        name: 'Overview',
        meta: {
          icon: 'AreaChartOutlined',
          title: '统计',
          keepalive: false,
          searchBar: false
        },
        component: () => import(/* webpackChunkName: "pro" */ '@/pages/views/AdminOverview')
      },
      {
        path: 'Articles',
        name: 'Articles',
        meta: {
          icon: 'CopyOutlined',
          title: '文章',
          keepalive: false,
          searchBar: true
        },
        component: () => import(/* webpackChunkName: "pro" */ '@/pages/views/AdminArticles')
      },
      {
        path: 'ArticleEdit',
        name: 'ArticleEdit',
        meta: {
          icon: 'EditOutlined',
          query: {
            type: 'add'
          },
          title: '编辑',
          keepalive: false,
          searchBar: false
        },
        component: () => import(/* webpackChunkName: "pro" */ '@/pages/views/AdminArticlesEdit')
      },
      {
        path: 'Comments',
        name: 'Comments',
        meta: {
          icon: 'MessageOutlined',
          title: '评论',
          keepalive: false,
          searchBar: true
        },
        component: () => import(/* webpackChunkName: "pro" */ '@/pages/views/AdminComments')
      },
      {
        path: 'Works',
        name: 'Works',
        meta: {
          icon: 'StarOutlined',
          title: '作品集',
          keepalive: false,
          searchBar: false
        },
        component: () => import(/* webpackChunkName: "pro" */ '@/pages/views/AdminWorks')
      },
      {
        path: 'Logs',
        name: 'Logs',
        meta: {
          icon: 'BugOutlined',
          title: '日志',
          keepalive: false,
          searchBar: false
        },
        component: () => import(/* webpackChunkName: "pro" */ '@/pages/views/AdminLogs')
      },
      {
        path: 'Setting',
        name: 'Setting',
        meta: {
          icon: 'SettingOutlined',
          title: '设置',
          keepalive: false,
          searchBar: false
        },
        component: () => import(/* webpackChunkName: "pro" */ '@/pages/views/AdminSetting')
      }
    ]
  },
  {
    // 所有未匹配成功的都跳转到404
    path: '/:catchAll(.*)',
    component: () => import(/* webpackChunkName: "blog" */ '@/pages/views/404')
  }
]

// routes = routes.map((route) => addLayoutToRoute(route))
// function addLayoutToRoute (route) {
//   route.meta = route.meta || {}
//   route.meta.layout = route.layout || 'default'
//
//   if (route.children) {
//     route.children = route.children.map((childRoute) => addLayoutToRoute(childRoute, route.meta.layout))
//   }
//   return route
// }

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior (to, from, savedPosition) {
    const position = { top: 0, left: 0 }
    if (to.name === 'BlogDetail') {
      position.top = 0
    } else if (to.name === 'BlogHome') {
      position.top = store.state.g.beforeReadScrollTop
    }
    return position
  }
})

router.beforeEach((to, from, next) => {
  // 销毁modal
  Modal.destroyAll()
  if (['BlogDetail'].includes(to.name)) { // 进入详情页时,记录下浏览记录
    const { IPAddress } = store.state.g.ip
    if (IPAddress) {
      const { fullPath, query: { _id }, name } = to
      store.dispatch('putBrowseStep', {
        step: { fullPath, _id, name },
        IPAddress,
        time: new Date().getTime(),
        day: getBeforeDate(0)
      }).then(result => {
        console.log(result)
      })
    }
    next()
  } else if (store.state.g.reg.pattern1.test(to.path)) { // 访问管理员界面时拦截
    const token = localStorage.getItem('token')
    if (!token) {
      message.error('@routerCatch: token无效')
      deleteTokenStorage()
      console.log('@@@router-next(login)')
      next('/login')
    } else {
      store.commit('routerBeforeEachTo', to)
      next()
    }
  } else {
    next()
  }
})

// 暴露routes
export function exportRoutes () {
  return routes
}

export default router
