<!--
  这是默认布局
  主要用于博客前台页面
-->

<template>
  <a-back-top v-show="store.state.g.menuConfig.toTop"/>
  <BlogHeader/>
  <router-view v-if="router.currentRoute.value.meta.keepalive" v-slot="{ Component }">
    <keep-alive>
      <component :is="Component"/>
    </keep-alive>
  </router-view>
  <router-view v-if="!router.currentRoute.value.meta.keepalive" v-slot="{ Component }">
    <!-- 这里是不被缓存的视图组件 -->
    <component :is="Component"/>
  </router-view>
  <BlogFooter/>
  <gDrawer/>
</template>

<script>
import gDrawer from '@/components/g-drawer'
import BlogHeader from '@/components/blog-header'
import BlogFooter from '@/components/blog-footer'
// import ToTopBtn from '@/components/toTopBtn'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'default',
  components: {
    gDrawer,
    BlogHeader,
    BlogFooter
    // ToTopBtn
  },
  setup () {
    const store = useStore()
    const router = useRouter()
    return {
      router,
      store
    }
  }
}
</script>

<style lang="less">
</style>
