<!--
  这是全局抽屉组件
-->

<template>
  <a-drawer
    placement="left"
    :closable="true"
    :mask="true"
    :class="'g-drawer'"
    :get-container="false"
    :visible="store.state.g.menuActive"
    @close="store.state.g.menuActive = false"
  >
    <template #title>
      选项
    </template>
    <ul>
      <li>
        <span data-title>
          <BgColorsOutlined/>&nbsp;主题
        </span>
        <a-switch checked-children="默认主题" un-checked-children="暗黑主题" v-model:checked="store.state.g.menuConfig.theme"/>
      </li>
      <li>
        <span data-title>
          <UpSquareOutlined/>&nbsp;返回顶部按钮
        </span>
        <a-switch v-model:checked="store.state.g.menuConfig.toTop"/>
      </li>
      <li>
        <span data-title>
          <OrderedListOutlined/>&nbsp;文章目录
        </span>
        <a-switch :disabled="true" v-model:checked="store.state.g.menuConfig.anchor"/>
      </li>
      <li>
        <span data-title>
          <BorderlessTableOutlined/>&nbsp;代码风格
        </span>
        <a-select
          v-model:value="store.state.g.menuConfig.codeTheme"
          size="default"
          style="width: 140px"
          :options="store.state.g.menuConfig.codeThemeList"
        ></a-select>
      </li>
    </ul>
  </a-drawer>
</template>

<script>
import { useStore } from 'vuex'
import { onMounted, watchEffect } from 'vue'
import { BgColorsOutlined, BorderlessTableOutlined, OrderedListOutlined, UpSquareOutlined } from '@ant-design/icons-vue'

export default {
  components: {
    BgColorsOutlined,
    OrderedListOutlined,
    UpSquareOutlined,
    BorderlessTableOutlined
  },
  setup () {
    const store = useStore()
    const themeList = []
    store.state.g.menuConfig.codeThemeList.forEach(item => {
      themeList.push(item.value)
    })
    watchEffect(() => {
      localStorage.setItem('theme', String(store.state.g.menuConfig.theme))
    })
    watchEffect(() => {
      localStorage.setItem('toTop', String(store.state.g.menuConfig.toTop))
    })
    watchEffect(() => {
      localStorage.setItem('anchor', String(store.state.g.menuConfig.anchor))
    })
    // onMounted(() => {
    //   watchEffect(() => {
    //     const app = document.getElementById('app')
    //     const style = `calc(100% - ${document.body.offsetWidth - document.getElementById('wrap').offsetWidth}px)`
    //     if (store.state.g.menuActive) {
    //       app.style.overflow = 'hidden'
    //       app.style.width = style
    //     } else {
    //       app.style.overflow = 'auto'
    //       app.style.width = '100%'
    //     }
    //   })
    // })
    onMounted(() => {
      watchEffect(() => {
        const root = document.documentElement
        const style = `calc(100% - ${store.state.g.scrollWidth()}px)`
        if (store.state.g.menuActive) {
          root.style.overflow = 'hidden'
          root.style.width = style
        } else {
          root.style.overflow = 'auto'
          root.style.width = '100%'
        }
      })
    })
    watchEffect(() => {
      localStorage.setItem('codeTheme', store.state.g.menuConfig.codeTheme)
      if (store.state.g.blocks) {
        store.state.g.blocks.forEach(el => {
          el.classList.remove(...themeList)
          el.classList.add(store.state.g.menuConfig.codeTheme)
        })
      }
    })
    return {
      store
    }
  }
}
</script>

<style lang="less">
</style>
