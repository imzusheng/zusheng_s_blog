<template>
  <div id="blog" @dragstart.stop.prevent>
    <div class="skeleton" v-if="loading">
      <a-skeleton active/>
    </div>
    <blogList :box-shadow="true" mode="default" v-else/>
  </div>
  <blogComments mode="default"/>
</template>

<script>
import { onActivated, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useStore } from 'vuex'
import blogComments from '@/components/blog-comments'
import blogList from '@/components/blog-list'

export default {
  name: 'BlogHome',
  components: {
    blogComments,
    blogList
  },
  setup () {
    const store = useStore()
    const loading = ref(true)
    // 离开主页时记录高度
    onBeforeRouteLeave((to, from) => {
      store.commit('recordScrollTop', document.documentElement.scrollTop || document.body.scrollTop)
    })
    onActivated(() => {
      store.dispatch('getArticles').then(() => {
        loading.value = false
      })
    })
    return {
      loading,
      store
    }
  }
}
</script>

<style lang="less">
</style>
