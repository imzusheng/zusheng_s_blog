<template>
  <div id="wrap" ref="wrap" :class="{'blog-dark': store.state.g.menuConfig.theme}">
    <router-view v-if="router.currentRoute.value.meta.keepalive" v-slot="{ Component }">
      <keep-alive>
        <component :is="Component"/>
      </keep-alive>
    </router-view>
    <router-view v-if="!router.currentRoute.value.meta.keepalive" v-slot="{ Component }">
      <!-- 这里是不被缓存的视图组件 -->
      <component :is="Component"/>
    </router-view>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { mapActionsHelper } from '@/util'
import { BgColorsOutlined, SettingOutlined } from '@ant-design/icons-vue'

// 拖动不打开新窗口
document.documentElement.addEventListener('drop', evt => {
  evt.stopPropagation()
  evt.preventDefault()
})

export default {
  components: {
    SettingOutlined,
    BgColorsOutlined
  },
  setup () {
    const { initLogin } = mapActionsHelper(['initLogin'])
    initLogin()
    /**
     * emmmm....
     * 这么调用炫技
     * 编辑器还无法识别在何处调用, 老老实实用 dispatch
     * 记住这种方法
     */
    return {
      store: useStore(),
      router: useRouter()
    }
  }
}
</script>

<style lang="less">
</style>
