<!--
  这是AdminLogs页面下的一个"函数式组件"
  用来遍历render所有的settingCard

  基本无法维护
  非常不建议使用

  睡醒觉就忘了自己写的是什么
-->

<script>
import { h, resolveComponent } from 'vue'

export default {
  name: 'setting-card',
  props: ['vnode'],
  setup (props, { slots }) {
    const antForm = resolveComponent('a-form')
    const antRow = resolveComponent('a-row')
    const antCol = resolveComponent('a-col')
    const renderList = []
    // TODO 也许用JSX是更好的写法，
    if (props.vnode) renderList.push(h(props.vnode))
    if (slots?.settingContent) {
      renderList.push(h(
        antForm,
        { layout: 'vertical' },
        {
          default: () => [
            h(
              antRow,
              { gutter: 24 },
              { default: () => [slots?.settingContent()] }
            )
          ]
        }
      ))
    }
    if (slots?.settingButton) {
      renderList.push(h(
        antForm,
        { layout: 'vertical' },
        {
          default: () => [
            h(
              antRow,
              { gutter: 24 },
              {
                default: () => [
                  h(
                    antCol,
                    {
                      xs: 24,
                      xl: 24,
                      style: { 'text-align': 'right' }
                    },
                    { default: () => [slots?.settingButton()] }
                  )
                ]
              }
            )
          ]
        }
      ))
    }
    return () => renderList // 相当于 render()
  }
}
</script>
