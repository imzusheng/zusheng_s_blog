<!--
  博客默认顶部菜单栏
-->

<template>
  <div class="blog-header user-select-not">
    <div>
      <div class="blog-header-action-menu" @click="store.state.g.menuActive = !store.state.g.menuActive">
        <BarsOutlined/>
      </div>
      <div class="blog-logo" ref="logo" @click="toHome"></div>
      <div class="blog-header-action-search" @click="toSearch">
        <SearchOutlined/>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { BarsOutlined, SearchOutlined } from '@ant-design/icons-vue'

export default {
  components: {
    BarsOutlined,
    SearchOutlined
  },
  setup () {
    const router = useRouter()
    const toSearch = () => {
      router.push({
        name: 'BlogSearch'
      })
    }
    const toHome = () => {
      router.push({
        name: 'BlogHome'
      })
    }
    return {
      toHome,
      toSearch,
      store: useStore()
    }
  }
}
</script>

<style lang="less">
</style>
