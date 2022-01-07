import { exposeStore } from '@/store'
import { message } from 'ant-design-vue'
// import hljs from 'highlight.js'

// 按需引入
import hljs from 'highlight.js/lib/core'

hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'))
hljs.registerLanguage('shell', require('highlight.js/lib/languages/shell'))
hljs.registerLanguage('bash', require('highlight.js/lib/languages/bash'))
hljs.registerLanguage('html', require('highlight.js/lib/languages/xml'))
// TODO markdown中左括号用&lt右括号;&gt;替换，不然会被转换成html
const store = exposeStore()

export default {
  install (app, options) {
    app.directive('highlight', (el) => {
      // 获取所有代码块元素
      const blocks = el.querySelectorAll('pre code')
      blocks.forEach(block => {
        // 当代码块高度大于300, 添加一个class将其隐藏
        if (block.offsetHeight > 300) {
          block.classList.add('code-hidden')
          // 添加点击事件，点击显示显示完整代码，切换class为code-show
          block.parentElement.addEventListener('click', (evt) => {
            if ([...evt.target.classList].includes('code-hidden')) { // 如果原先存在 .code-hidden 则先移除
              evt.target.classList.remove('code-hidden')
            }
            evt.target.classList.add('code-show')
          })
        }
        // 添加代码顶部的mac窗口装饰等工具栏, 插入到父元素block.parentElement中，且插入位置是block前面
        block.parentElement.insertBefore(createTopBar(block.classList[0]), block)
        // 添加当前主题的类名, store中定义, 用户设置菜单中更改
        block.classList.add(`${store.state.g.menuConfig.codeTheme}`)
        hljs.highlightElement(block)
      })
    })
  }
}

// 添加代码顶部的mac窗口装饰等工具栏
function createTopBar (title) {
  // 最外层div
  const divElement = document.createElement('div')
  divElement.className = 'code-top-bar'

  // 左div
  const divElementLeft = document.createElement('div')
  const ulEl = document.createElement('ul')
  ulEl.append(document.createElement('li'))
  ulEl.append(document.createElement('li'))
  ulEl.append(document.createElement('li'))
  divElementLeft.append(ulEl)

  // 中间div
  const divElementCenter = document.createElement('div')
  divElementCenter.innerText = title.toUpperCase()

  // 右div
  const divElementRight = document.createElement('div')
  divElementRight.innerText = 'COPY'
  divElementRight.addEventListener('click', e => {
    const clipboardObj = navigator.clipboard
    if (clipboardObj) {
      const codeText = e.target.parentElement.parentElement.querySelector('code').innerText
      clipboardObj.writeText(codeText).then(() => {
        message.success('复制成功！')
      }).catch(e => {
        message.error(`复制失败，${e}`)
      })
    } else {
      message.info('当前浏览器不支持（Clipboard API）一键复制！')
    }
  })

  divElement.append(divElementLeft)
  divElement.append(divElementCenter)
  divElement.append(divElementRight)
  return divElement
}
