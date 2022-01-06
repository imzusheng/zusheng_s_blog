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
        path: '/Works',
        name: 'BlogWorks',
        meta: {
          keepalive: true
        },
        component: () => import(/* webpackChunkName: "blog" */ '@/pages/views/BlogWorks')
      },
      {
        path: '/Source',
        name: 'BlogSource',
        meta: {
          keepalive: true
        },
        component: () => import(/* webpackChunkName: "blogLabs" */ '@/pages/views/BlogSource')
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
          title: '发布博客',
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

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  // 重置滚动条到顶部
  scrollBehavior (to) {
    return new Promise(resolve => {
      const position = { top: 0, left: 0 }
      if (to.name === 'BlogHome') {
        position.top = store.state.g.beforeReadScrollTop
      }
      resolve(position)
    })
  }
})

router.beforeEach((to, from, next) => {
  // 销毁modal
  Modal.destroyAll()

  // 访问管理员界面时拦截, 需要token
  if (store.state.g.reg.Pro.test(to.path)) {
    const token = localStorage.getItem('token')
    if (!token) {
      message.error('@routerCatch: token无效')
      deleteTokenStorage()
      next('/login')
    } else {
      // 记录当前选中的菜单，以及更新面包屑数据
      store.commit('routerBeforeEachAdmin', to)
      next()
    }
  } else {
    // 记录下浏览记录
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
    store.commit('routerBeforeEachDefault', to)
    next()
  }
})

// 暴露routes
export function exportRoutes () {
  return routes
}

export default router
