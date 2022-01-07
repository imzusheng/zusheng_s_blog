<template>
  <div id="search">
    <div class="search-container">
      <div class="blog-search-bar">
        <input
          type="text"
          name="search"
          v-model.trim="searchValue"
          placeholder="搜索任何内容"
          @input="searchChange">
      </div>
      <div class="blog-search-cancel user-select-not" @click="toHome">取消</div>
    </div>
    <div class="search-list-container">
      <a-skeleton active v-if="loading"/>
      <a-tabs size="small" v-model:activeKey="store.state.g.searchActiveKey" v-else>
        <a-tab-pane key="1" :tab="`博客 (${store.state.g.searchListArticles.length})`">
          <BlogList :boxShadow="false" mode="demo"/>
        </a-tab-pane>
        <a-tab-pane key="2" :tab="`评论 (${store.state.g.searchListComments.length})`">
          <BlogComments mode="demo"/>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import BlogList from '@/components/blog-list'
import BlogComments from '@/components/blog-comments'

export default {
  name: 'BlogSearch',
  components: {
    BlogList,
    BlogComments
    // BlogList: () => import(/* webpackChunkName: "list" */ '@/components/blog-list'),
    // BlogComments: () => import(/* webpackChunkName: "comments" */ '@/components/blog-comments')
  },
  setup () {
    const router = useRouter()
    const store = useStore()
    const searchValue = ref('')
    const loading = ref(false)
    let searchDelay = null
    const searchChange = () => {
      loading.value = true
      clearTimeout(searchDelay)
      searchDelay = setTimeout(() => {
        store.dispatch('getSearch', { content: searchValue.value }).then(() => {
          loading.value = false
        })
        // if (searchValue.value) {
        //   store.dispatch('getSearch', { content: searchValue.value }).then(() => {
        //     loading.value = false
        //   })
        // } else {
        //   loading.value = false
        // }
      }, 500)
    }
    const toHome = () => {
      router.push({
        path: '/Blog'
      })
    }
    return {
      store,
      loading,
      searchValue,
      searchChange,
      toHome
    }
  }
}
</script>

<style lang="less">
</style>
