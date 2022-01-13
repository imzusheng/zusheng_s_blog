import { createApp, readonly } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// plugins
import hljsDirective from './plugins/hljsDirective'

// style
import '@/assets/css/emoji.css'
import '@/less/style/index.less'

// component
// import defaultLayout from '@/layouts/default'
// import adminLayout from '@/layouts/admin'
// ant-design-vue 按需引入
import {
  BackTop,
  Anchor,
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Col,
  Comment,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Image,
  Input,
  Layout,
  List,
  Menu,
  message,
  Modal,
  PageHeader,
  Popconfirm,
  Result,
  Row,
  Select,
  Skeleton,
  Statistic,
  Steps,
  Switch,
  Table,
  Tabs,
  Tag,
  Timeline,
  Tooltip,
  Upload
} from 'ant-design-vue'

message.config({
  duration: 3,
  maxCount: 3
})

const app = createApp(App)
  .use(Breadcrumb)
  .use(Button)
  .use(Layout)
  .use(Menu)
  .use(Input)
  .use(Form)
  .use(Modal)
  .use(Row)
  .use(Col)
  .use(Upload)
  .use(Result)
  .use(Skeleton)
  .use(PageHeader)
  .use(Switch)
  .use(Tag)
  .use(Tabs)
  .use(List)
  .use(Image)
  .use(Card)
  .use(Avatar)
  .use(Statistic)
  .use(Comment)
  .use(Tooltip)
  .use(Table)
  .use(Dropdown)
  .use(Steps)
  .use(Select)
  .use(Empty)
  .use(Drawer)
  .use(Anchor)
  .use(Popconfirm)
  .use(Timeline)
  .use(BackTop)
  .use(hljsDirective)
  .use(store)
  .use(router)
// .component('layout-default', defaultLayout)
// .component('layout-admin', adminLayout)

/**
 * 以下初始化API配置文档， 失败无法渲染页面
 */
const apiRecord = localStorage.getItem('apiRecord')
if (apiRecord) { // 如果本地存在apiConfig，则本地初始化
  const {
    api,
    time
  } = JSON.parse(apiRecord)
  if (Date.now() - time <= 1000 * 60 * 60) { // 保质期没过，则继续使用
    store.commit('recordApi', Object.freeze(api))
    app.mount('#app')
  } else { // 本地apiConfig已经过期，远程获取
    remoteInit()
  }
} else { // 本地不存在apiConfig，远程获取
  remoteInit()
}

// 从服务器获取api配置信息
function remoteInit () {
  store.dispatch('initConfig').then(({
                                       data: {
                                         result,
                                         error
                                       }
                                     }) => {
    // 获取 api 配置文件
    // app.config.globalProperties.$api =
    // 配置文件无误
    if (!error && result?.API_COMMON) {
      // 存储到localStorage
      localStorage.setItem('apiRecord', JSON.stringify({
        api: result,
        time: Date.now()
      }))
      // 存储到vuex
      store.commit('recordApi', readonly(result))
      app.mount('#app')
    } else {
      alert('正在调试，请稍后访问')
    }
  })
}
