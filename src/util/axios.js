import axios from 'axios'
import { message } from 'ant-design-vue'
// import { h } from 'vue'
// import { StopOutlined } from '@ant-design/icons-vue'
import router from '@/router'

// const baseURL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://blog.zusheng.club'
const baseURL = 'https://blog.zusheng.club'
// const baseApiURL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : 'https://blog.zusheng.club/api'
const baseApiURL = 'https://blog.zusheng.club/api'

axios.defaults.baseURL = baseApiURL
axios.defaults.headers['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.headers.post['Content-Type'] = 'application/json'
// axios.defaults.headers.token = localStorage.getItem('token') || ''
// axios.defaults.withCredentials = true

// 请求拦截
axios.interceptors.request.use(config => {
  config.headers.Authorization = localStorage.getItem('token')
  return config
})

// 响应拦截器
axios.interceptors.response.use(async function (response) {
  // 响应消息中tips存在时弹出消息提示
  if (response.data?.tips) message.success(response.data?.tips)

  // 没有token或token已过期时,跳到登录页面
  if (response.data?.status && response.data.status === 401) {
    console.log('@axiosCatch[401]')
    localStorage.removeItem('token')
    localStorage.removeItem('tokenExp')
    localStorage.removeItem('apiRecord')
    router.replace({
      path: '/login'
    }).then()
  }

  if (response.config.baseURL === axios.defaults.baseURL) {
    // 只有访问路径前是api时才会拦截, 全局提示错误
    const { data } = response
    if (data.error) console.error(`@axiosCatch[api]: ${data.error}`)
    return data.result
  } else {
    return response
  }
}, error => {
  console.error(`@axiosCatch[default]: ${error}`)
  return Promise.reject(error)
})

export const apiService = {
  get (url, params) {
    return axios({
      method: 'get',
      url,
      params
    })
  },
  post (url, params) {
    return axios({
      method: 'post',
      url,
      data: params
    })
  },
  put (url, params) {
    return axios({
      method: 'put',
      url: url,
      data: params
    })
  },
  delete (url, params) {
    return axios({
      method: 'delete',
      url,
      data: params
    })
  },
  upload (url, params, cb) {
    return axios({
      method: 'post',
      url,
      data: params,
      headers: { 'Content-type': 'multipart/form-data;' },
      onUploadProgress: function (progressEvent) {
        if (cb) cb(progressEvent)
      }
    })
  },
  getBaseURL (url, params) {
    return axios({
      baseURL,
      method: 'get',
      url,
      params
    })
  },
  getAssets (url, params) {
    return axios({
      baseURL,
      method: 'get',
      url: url,
      params
    })
  }
}

/**
 * 没有token访问后台时,弹窗提示并阻塞进程
 * 确认提示后跳转到登录页
 * @returns {Promise<unknown>}
 */
// function authErr () {
//   function jump () {
//     localStorage.removeItem('token')
//     localStorage.removeItem('apiRecord')
//     router.replace({
//       path: '/login'
//     }).then()
//   }
//   return new Promise(resolve => {
//     Modal.confirm({
//       title: () => '你不该出现在这里',
//       icon: () => h(StopOutlined),
//       okText: '跳转到登录页',
//       cancelText: '你没得选',
//       onOk () {
//         jump()
//         resolve()
//       },
//       onCancel () {
//         jump()
//         resolve()
//       }
//     })
//   })
// }
