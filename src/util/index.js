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
      return `<pre><code class="javascript">${str}</code></pre>`
    }
  }
})
  .use(attrs, {
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
