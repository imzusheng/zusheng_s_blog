/**
 * util 常用的工具函数
 */
import SparkMD5 from 'spark-md5'
import { mapActions, useStore } from 'vuex'
import attrs from 'markdown-it-attrs'

const md = require('markdown-it')({
  html: true, // 在源码中启用 HTML 标签
  xhtmlOut: true, // 使用 '/' 来闭合单标签 （比如 <br />）。
  // 这个选项只对完全的 CommonMark 模式兼容。
  breaks: true, // 转换段落里的 '\n' 到 <br>。
  langPrefix: '', // 给围栏代码块的 CSS 语言前缀。对于额外的高亮代码非常有用。
  linkify: true, // 将类似 URL 的文本自动转换为链接。
  // 启用一些语言中立的替换 + 引号美化
  typographer: false,
  // 双 + 单引号替换对，当 typographer 启用时。
  // 或者智能引号等，可以是 String 或 Array。
  //
  // 比方说，你可以支持 '«»„“' 给俄罗斯人使用， '„“‚‘'  给德国人使用。
  // 还有 ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] 给法国人使用（包括 nbsp）。
  quotes: '“”‘’',
  // 高亮函数，会返回转义的HTML。
  // 或 '' 如果源字符串未更改，则应在外部进行转义。
  // 如果结果以 <pre ... 开头，内部包装器则会跳过。
  highlight: function (str, lang) {
    if (lang) {
      return `<pre><code class="${lang}">${str}</code></pre>`
    } else {
      return `<pre><code class="code">${str}</code></pre>`
    }
  }
}).use(attrs, {
  allowedAttributes: ['id', 'class', /^regex.*$/]
})

/**
 * 渲染 markdown 文档为 html
 * @param {string} context markdown 文件
 * @returns {string}
 */
export const markdownRender = context => {
  return md.render(context)
}

const eventLoop = {}
window.addEventListener('scroll', function () {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  scrollOnce(scrollTop)
})
export const scrollOnce = function (scrollTop) {
  Object.values(eventLoop).forEach(action => {
    //
    if (scrollTop > action.min && scrollTop < action.max) {
      //
      action.els.forEach(elsObj => {
        //
        Object.keys(elsObj.actions).forEach(attr => {
          // (scrollTop - action.min) / (action.max - action.min) 取值为 0 ~ 1
          const rate = (scrollTop - action.min) / (action.max - action.min)
          elsObj.el.style[attr] = elsObj.actions[attr].start + (elsObj.actions[attr].end - elsObj.actions[attr].start) * rate
        })
        //
      })
      //
    } else {
      action.els.forEach(elsObj => {
        Object.keys(elsObj.actions).forEach(attr => {
          elsObj.el.style[attr] = scrollTop >= action.max ? elsObj.actions[attr].end : elsObj.actions[attr].start
        })
      })
    }
    //
  })
}
/**
 *  {
 *    min: 0,
 *    max: 380 - 52,
 *    els: [{
 *      el: toTopBtn.value,
 *      actions: {
 *        opacity: {
 *          start: 0,
 *          end: 1
 *        }
 *      }
 *    }]
 *  }
 *
 */
export const addScrollEvent = (cbName, action) => {
  eventLoop[cbName] = action
}
export const delScrollEvent = (cbName) => {
  delete eventLoop[cbName]
}

/**
 * 返回顶部
 */
let beforeTop = 999999999999
export const toTop = function () {
  const top = document.body.scrollTop || document.documentElement.scrollTop
  const speed = top / 10
  if (document.body.scrollTop !== 0) {
    document.body.scrollTop -= speed
  } else {
    document.documentElement.scrollTop -= speed
  }
  if (top > 0 && beforeTop > top) {
    beforeTop = top
    requestAnimationFrame(toTop)
  } else {
    beforeTop = 999999999999
  }
}

// 内容裁剪 替换汉字为两个字符串
export const textClip = (context, num) => {
  if (!context) return ''
  return context.replace(/[\u0391-\uFFE5]/g, 'aa').length > num ? context.slice(0, num) + '...' : context
}

// 格式化时间
export const formatDate = (date, type) => {
  if (!date) return ''
  const dateObj = new Date(date)
  if (type === 'transform') {
    return `${dateObj.getFullYear()}/${dateObj.getMonth() + 1}/${dateObj.getDate()}`
  } else {
    return `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${(dateObj.getDate() < 10 ? '0' : '') + dateObj.getDate()} ${(dateObj.getHours() < 10 ? '0' : '') + dateObj.getHours()}:${(dateObj.getMinutes() < 10 ? '0' : '') + dateObj.getMinutes()}`
  }
}

// 时间转换为如 “一天前”, 传入时间戳
export const dateConvert = (date) => {
  if (!date) return ''
  const curTime = new Date()
  const argTime = new Date(date)
  const gapTime = curTime - date
  const oneHour = 60 * 60 * 1000
  const oneDay = 60 * 60 * 1000 * 24
  const curDateResolve = {
    fullYear: curTime.getFullYear(),
    month: curTime.getMonth() + 1,
    day: curTime.getDate()
  }
  const argDateResolve = {
    fullYear: argTime.getFullYear(),
    month: argTime.getMonth() + 1,
    day: argTime.getDate()
  }
  if (gapTime < oneHour) {
    // 一小时内
    return `${(gapTime / 60 / 1000).toFixed(0)}分钟`
  } else if (gapTime < oneDay) {
    // 一天内
    return `${(gapTime / 3600 / 1000).toFixed(0)}小时`
  } else if (curDateResolve.fullYear === argDateResolve.fullYear && curDateResolve.month === argDateResolve.month && curDateResolve.day !== argDateResolve.day) {
    // 同一个月，但不在同一天
    return `${curDateResolve.day - argDateResolve.day}天`
  } else if (curDateResolve.fullYear === argDateResolve.fullYear && curDateResolve.month !== argDateResolve.month) {
    // 不在同一个月
    return `${curDateResolve.month - argDateResolve.month}月`
  } else if (curDateResolve.fullYear !== argDateResolve.fullYear) {
    // 不在同一年
    return `${curDateResolve.fullYear - argDateResolve.fullYear}年`
  }
}

// 返回 n 天前时间戳, 以零点为基准
export const getBeforeDate = day => {
  if (!day && day !== 0) {
    console.log('未接收到参数@getBeforeDate')
    return
  }
  const format = formatDate(new Date(), 'transform')
  return new Date(format).getTime() + 24 * 60 * 60 * 1000 * day
}

// display 修改为 block
export const showEl = (el) => {
  const img = el.target
  img.style.opacity = '1'
}

// 字符串生成 Hash
export const stringToHash = (str) => {
  if (typeof str !== 'string') {
    console.error('请传入字符串')
    return
  }
  const spark = new SparkMD5()
  spark.append(str)
  return spark.end()
}

// 文件返回 文件后缀名
export const fileToPostfix = file => {
  return file.name.slice(file.name.indexOf('.') + 1, file.name.length)
}

// 上传前文件处理
export const fileToFormData = (file) => {
  const str = file.name + file.lastModified + file.size
  const postfix = fileToPostfix(file)
  const formData = new FormData()
  formData.append('file', file)
  formData.append('uid', file.uid)
  formData.append('postfix', postfix)
  formData.append('hash', stringToHash(str))
  formData.append('filename', file.name)
  return formData
}

// file 转 url
export const fileToUrl = file => {
  return new Promise(resolve => {
    const reader = new FileReader()
    // onload是指readAsDataURL处理完后
    reader.onload = evt => resolve(evt.target.result)
    reader.readAsDataURL(file)
  })
}

// string 转 blob
export const stringToBlob = (str, MIME) => {
  return new Blob([str], {
    type: MIME
  })
}

// blob 转 file
export const blobToFile = (blob, filename, opt) => {
  const options = opt || {}
  return new File([blob], filename, options)
}

// file 转 blob
export const fileToBlob = (file) => {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (typeof e.target.result === 'object') {
        resolve(new Blob([e.target.result]))
      } else {
        resolve(e.target.result)
      }
    }
    reader.readAsArrayBuffer(file)
  })
}

// file 转 blob
export const blobToString = (blob) => {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(reader.result)
    }
    reader.readAsText(blob)
  })
}

// 获取浏览器名
export const getBrowser = () => {
  let browserName = ''
  const { userAgent } = navigator
  const browser = {
    Opera: userAgent.indexOf('Opera') > -1, // 判断是否Opera浏览器
    IE: userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 && !this.Opera, // 判断是否IE浏览器
    Edge: userAgent.indexOf('Edg') > -1, // 判断是否IE的Edge浏览器
    Firefox: userAgent.indexOf('Firefox') > -1, // 判断是否Firefox浏览器
    Safari: userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1, // 判断是否Safari浏览器
    Chrome: userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Safari') > -1 // 判断Chrome浏览器
  }
  // every在碰到return false的时候，中止循环。some在碰到return ture的时候，中止循环
  Object.keys(browser).some((val) => {
    if (browser[val]) {
      browserName = val
      return val
    }
  })
  return browserName
}

// 改造mapActions
export const mapActionsHelper = (mapActionsArr) => {
  const store = useStore()
  const bindStore = { $store: store }
  const actionsObj = mapActions(mapActionsArr)
  Object.keys(actionsObj).forEach(val => {
    actionsObj[val] = actionsObj[val].bind(bindStore)
  })
  return actionsObj
}

// 获取滚动条宽度
export const getScrollWidth = () => {
  const html = document.documentElement
  html.style.overflowY = 'hidden'
  const outWidth = html.offsetWidth
  html.style.overflowY = 'scroll'
  const inWidth = html.offsetWidth
  html.style.overflowY = 'visible'
  return outWidth - inWidth
}

// 删除token相关的localStorage
export const deleteTokenStorage = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('tokenExp')
  localStorage.removeItem('uid')
  localStorage.removeItem('pwd')
}

// 图片测网速
// window创建一个250kb大小的文件 fsutil file createnew speed.jpeg 256000
export const getSpeed = () => {
  return new Promise(resolve => {
    const speeds = []

    function makeRangeIterator (start = 0, end = Infinity, step = 1) {
      let nextIndex = start
      return {
        next: () => {
          return new Promise(resolve => {
            if (nextIndex < end) {
              let start = null
              const imgUrl = 'http://cdn.zusheng.club/images/speed_250kb.jpeg'
              const xhr = new XMLHttpRequest()
              xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                  const end = Date.now()
                  const size = xhr.getResponseHeader('Content-Length') / 1024
                  const speed = size * 1000 / (end - start)
                  speeds.push(speed)
                  resolve({ speed, done: false })
                } else if (xhr.readyState === 4) {
                  const speed = navigator?.connection?.downlink || 0
                  speeds.push(speed)
                  resolve({ speed, done: true })
                }
              }
              xhr.open('GET', imgUrl, true)
              start = Date.now()
              xhr.send()
              nextIndex += 1
            } else {
              resolve({ done: true })
            }
          })
        }
      }
    }

    const it = makeRangeIterator(1, 4, 1)

    async function init () {
      let result = await it.next()
      while (!result.done) {
        result = await it.next()
      }
      const res = `${speeds.length > 1 ? ((speeds.reduce((a, b) => a + b) / speeds.length) / 1024).toFixed(2) : speeds[0]} M/s`
      resolve(res)
    }

    init().catch()
  })
}

// 图片测延迟
export const getDelay = async () => {
  return new Promise(resolve => {
    const delayList = []

    function makeRangeIterator (start = 0, end = Infinity, step = 1) {
      let nextIndex = start
      return {
        next: () => {
          return new Promise(resolve => {
            if (nextIndex < end) {
              let startTime = null
              let endTime = null
              let delay = null
              const img = document.createElement('img')
              img.onerror = () => {
                endTime = Date.now()
                delay = endTime - startTime
                delayList.push(delay)
                resolve({ delay, done: false })
              }
              startTime = Date.now()
              img.src = `www.baidu.com?t=${Date.now()}`
              nextIndex += 1
            } else {
              resolve({ done: true })
            }
          })
        }
      }
    }

    const it = makeRangeIterator(1, 4, 1)

    async function init () {
      let result = await it.next()
      while (!result.done) {
        result = await it.next()
      }
      resolve(`${(delayList.reduce((a, b) => a + b) / delayList.length).toFixed(2)} ms`)
    }

    init().catch()
  })
}

// geo获取位置，需要浏览器权限
export const getGeoPosition = () => {
  return new Promise(resolve => {
    const successCb = ({ coords }) => {
      // longitude 经度, latitude  纬度
      resolve({
        error: false,
        longitude: coords.longitude,
        latitude: coords.latitude,
        position: `${coords.longitude.toFixed(6)}，${coords.latitude.toFixed(6)}`
      })
    }
    const errorCb = error => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          resolve({ error: true, info: '用户拒绝对获取地理位置的请求(User denied the request for Geolocation.)' })
          console.error('用户拒绝对获取地理位置的请求(User denied the request for Geolocation.)')
          break
        case error.POSITION_UNAVAILABLE:
          resolve({ error: true, info: '位置信息是不可用(Location information is unavailable.)' })
          console.error('位置信息是不可用(Location information is unavailable.)')
          break
        case error.TIMEOUT:
          resolve({ error: true, info: '用户的请求超时(The request to get user location timed out.)' })
          console.error('用户的请求超时(The request to get user location timed out.)')
          break
        default:
          resolve({ error: true, info: '未知错误(An unknown error occurred.)' })
          console.error('未知错误(An unknown error occurred.)')
          break
      }
    }
    navigator.geolocation.getCurrentPosition(successCb, errorCb, {
      // 指示浏览器获取高精度的位置
      enableHighAccuracy: true,
      // 指定获取地理位置的超时时间，默认不限时，单位为毫秒
      timeout: 5000,
      // 最长有效期,即位置缓存
      maximumAge: 3000
    })
  })
}

window.BMap = undefined

// 百度地图类
export class BaiduMap {
  /**
   * 加载百度地图
   * @return {Promise<BMap>}
   * @constructor
   */
  loadBaiduMap () {
    const AK = 'DLWqQ24VEBSyrWHOEKZ1Giy2CeROkhR3'
    const BMapURL = `https://api.map.baidu.com/api?v=3.0&ak=${AK}&s=1&callback=onBMapCallback`
    return new Promise(resolve => {
      // 如果已加载直接返回
      if (typeof window.BMap !== 'undefined') {
        resolve(window.BMap)
      } else {
        // 百度地图异步加载回调处理
        window.onBMapCallback = function () {
          console.log('百度地图初始化成功...')
          resolve(window.BMap)
        }
        // 插入script脚本
        const scriptNode = document.createElement('script')
        scriptNode.setAttribute('type', 'text/javascript')
        scriptNode.setAttribute('src', BMapURL)
        document.body.appendChild(scriptNode)
      }
    })
  }

  /**
   * 绘制地图
   */
  drawMap (elId, longitude, latitude) {
    this.loadBaiduMap().then(BMap => {
      // 实例化Map
      const map = new BMap.Map(elId)
      // 创建坐标
      const point = new BMap.Point(longitude, latitude)
      // 绘制
      map.centerAndZoom(point, 16)
      // 开启鼠标滚轮缩放
      map.enableScrollWheelZoom(true)
      // 地图样式
      map.setMapStyleV2({
        styleId: 'ebc672b1ba810f859edc9477fd661e78'
      })
      // 创建标注
      const marker = new BMap.Marker(point)
      // 将标注添加到地图中
      map.addOverlay(marker)
      // 添加控件
      map.addControl(new BMap.NavigationControl())
      map.addControl(new BMap.MapTypeControl())
      map.addControl(new BMap.GeolocationControl())
    })
  }

  /**
   * 获取IP地址
   * @return {Promise<{}>}
   */
  getCurrentPosition () {
    return new Promise(resolve => {
      //
      this.loadBaiduMap().then(BMap => {
        const geolocation = new BMap.Geolocation()
        geolocation.getCurrentPosition(r => {
          if (geolocation.getStatus() === window.BMAP_STATUS_SUCCESS) {
            resolve({
              error: false,
              value: {
                position: `${r.longitude.toFixed(6)}，${r.latitude.toFixed(6)}`,
                r
              }
            })
          } else {
            resolve({
              error: true
            })
          }
        })
      })
      //
    })
  }

  /**
   * 根据坐标得到地址描述
   */
  getLocationCN (longitude, latitude) {
    return new Promise(resolve => {
      //
      if (!longitude || !latitude) resolve('获取失败...')
      this.loadBaiduMap().then(BMap => {
        const myGeo = new BMap.Geocoder({ extensions_town: true })
        myGeo.getLocation(new BMap.Point(longitude, latitude), result => {
          resolve(result.address)
        })
      })
      //
    })
  }
}
