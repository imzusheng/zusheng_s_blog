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
      更多
    </template>
    <h3 style="text-align: center" data-title>
      <span>菜单</span>
    </h3>
    <ul @click="store.state.g.menuActive = false">
      <li data-index="BlogHome" data-selected="true">
        <router-link :to="{name: 'BlogHome'}">
          <span data-title><HomeOutlined/>&nbsp;主页</span>
        </router-link>
      </li>
      <li data-index="BlogWorks">
        <router-link :to="{name: 'BlogWorks'}">
          <span data-title><TrophyOutlined/>&nbsp;作品集</span>
        </router-link>
      </li>
      <li data-index="BlogSource">
        <router-link :to="{name: 'BlogSource'}">
          <span data-title><UsbOutlined/>&nbsp;实验室</span>
        </router-link>
      </li>
      <li data-index="me">
        <a href="https://zusheng.club" target="_blank">
          <span data-title><UserOutlined/>&nbsp;关于</span>
        </a>
      </li>
    </ul>
    <br>
    <h3 style="text-align: center" data-title>
      <span>设置</span>
    </h3>
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
import { onMounted, ref, watchEffect } from 'vue'
import { BgColorsOutlined, BorderlessTableOutlined, HomeOutlined, OrderedListOutlined, TrophyOutlined, UpSquareOutlined, UsbOutlined, UserOutlined } from '@ant-design/icons-vue'

export default {
  components: {
    BgColorsOutlined,
    OrderedListOutlined,
    UpSquareOutlined,
    BorderlessTableOutlined,
    HomeOutlined,
    TrophyOutlined,
    UsbOutlined,
    UserOutlined
  },
  setup () {
    const store = useStore()
    const themeList = []
    const menuPlacement = ref('left')
    store.state.g.menuConfig.codeThemeList.forEach(item => {
      themeList.push(item.value)
    })
    // 设置-改变主题
    watchEffect(() => {
      localStorage.setItem('theme', String(store.state.g.menuConfig.theme))
    })
    // 设置-置顶按钮
    watchEffect(() => {
      localStorage.setItem('toTop', String(store.state.g.menuConfig.toTop))
    })
    // 设置-文章菜单栏
    watchEffect(() => {
      localStorage.setItem('anchor', String(store.state.g.menuConfig.anchor))
    })
    // 设置-切换代码主题
    watchEffect(() => {
      localStorage.setItem('codeTheme', store.state.g.menuConfig.codeTheme)
      if (store.state.g.blocks) {
        store.state.g.blocks.forEach(el => {
          el.classList.remove(...themeList)
          el.classList.add(store.state.g.menuConfig.codeTheme)
        })
      }
    })
    // 侧边栏打开/关闭时触发
    onMounted(() => {
      watchEffect(() => {
        const root = document.documentElement
        const style = `calc(100% - ${store.state.g.scrollWidth()}px)`
        if (store.state.g.menuActive) {
          root.style.overflowY = 'hidden'
          root.style.width = style
        } else {
          root.style.overflowY = 'auto'
          root.style.width = '100%'
        }
      })
    })
    return {
      store,
      menuPlacement
    }
  }
}
</script>

<style lang="less">
</style>
