// import hljs from 'highlight.js'
import { exposeStore } from '@/store'
import hljs from 'highlight.js/lib/core'
// import hljs from 'highlight.js'

hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'))
hljs.registerLanguage('shell', require('highlight.js/lib/languages/shell'))
hljs.registerLanguage('bash', require('highlight.js/lib/languages/bash'))
hljs.registerLanguage('html', require('highlight.js/lib/languages/xml'))

const store = exposeStore()

export default {
  install (app, options) {
    app.directive('highlight', (el) => {
      const blocks = el.querySelectorAll('pre code')
      blocks.forEach(block => {
        if (block.offsetHeight > 300) { // 当代码块高度大于300, 添加一个class将其隐藏
          block.classList.add('code-hidden')
          block.parentElement.addEventListener('click', (evt) => {
            if ([...evt.target.classList].includes('code-hidden')) { // 如果原先存在 .code-hidden 将他移除
              evt.target.classList.remove('code-hidden')
            }
            evt.target.classList.add('code-show')
          }) // 点击被隐藏的代码块查看全部
        }
        block.classList.add(`${store.state.g.menuConfig.codeTheme}`)
        hljs.highlightElement(block)
      })
    })
  }
}
