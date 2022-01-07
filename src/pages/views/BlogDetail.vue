<template>
  <div id="blog-detail">
    <div class="skeleton" v-if="loading">
      <a-skeleton active/>
    </div>
    <div v-else>
      <blogAnchor/>
      <main class="blog-detail-content">
        <h1>{{ article.title }}</h1>
        <div class="blog-detail-time">{{
            formatDate(article.operate?.releaseTime)
          }}&nbsp;&nbsp;&nbsp;&nbsp;阅读&nbsp;{{
            article?.operate?.fire
          }}
        </div>
        <div class="blog-detail-poster">
          <img v-if="posterUrl" :src="posterUrl" style="max-width: 100%; padding: 0; border-radius: 6px" alt="poster"/>
        </div>
        <div class="codeView">
          <div v-html="content" v-highlight></div>
        </div>
      </main>
    </div>
  </div>
  <blogComments mode="default"/>
</template>

<script>
import { useRoute } from 'vue-router'
import { nextTick, onMounted, ref } from 'vue'
import { formatDate, markdownRender } from '@/util'
import blogComments from '@/components/blog-comments'
import blogAnchor from '@/components/blog-anchor'
import { useStore } from 'vuex'

export default {
  name: 'BlogDetail',
  components: {
    blogComments,
    blogAnchor
  },
  setup () {
    const store = useStore()
    const route = useRoute()
    const article = ref('')
    const content = ref('')
    const loading = ref(true)
    const posterUrl = ref(null)

    onMounted(() => {
      loading.value = true
      // 获取文章详情数据
      store.dispatch('getBlogDetail', { _id: route.query._id }).then(result => {
        // 增加文章热度
        store.dispatch('addBlogHot', { _id: route.query._id })
        article.value = result
        // 替换封面url
        posterUrl.value = result.poster ? `${store.state.api.API_ROOT.BASE_URL}/assets?filename=${result.poster}` : null
        mdJudge(result)
      })
    })

    // 判断是否需要引入 markdown
    function mdJudge (data) {
      if (data.markdown.md && data.markdown.filename) {
        // 获取 markdown 文件
        store.dispatch('getGlobalAssets', { filename: data.markdown.filename })
             .then(async ({ data: result }) => {
               // markdownRender -> string转为html
               content.value = result ? markdownRender(result) : data.content
               loading.value = false
               await nextTick()
               store.commit('saveElement', [{
                 type: 'blocks',
                 el: document.querySelectorAll('.codeView pre code')
               }, {
                 type: 'title',
                 el: document.querySelectorAll('.codeView .blog-title')
               }])
             })
      } else {
        loading.value = false
        content.value = data.content
      }
    }

    return {
      article,
      content,
      loading,
      posterUrl,
      formatDate
    }
  }
}
</script>

<style lang="less">
</style>
