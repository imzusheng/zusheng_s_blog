<template>
  <ul id="blog-list" v-show="data.length > 0">
    <li
      :class="{'article': true, 'article-box-shadow': boxShadow}"
      v-for="(item,i) in data"
      :key="i" @click="toDetail(item._id)">
      <div class="article-container">
        <div class="article-topic">
          <span>{{ dateConvert(item.operate.releaseTime) }}前</span>
          <span data-type="divider">|</span>
          <span>{{ item.operate.category }}</span>
          <span data-type="divider">|</span>
          <span>
            <div v-for="(tag, tabIndex) in item.tags" :key="tabIndex">
              {{ tag }}<span v-if="tabIndex !== item.tags.length - 1" data-type="divider-point">·</span>
            </div>
          </span>
        </div>
        <div class="article-content">
          <div class="article-content-left">
            <div class="article-content-title">
              {{ item.title }}
            </div>
            <div class="article-content-describe">
              {{ item.content }}
            </div>
            <div class="article-content-operate user-select-not">
              <span>
                <FireFilled/>{{ item.operate.fire }}
              </span>
              <!--              <span>-->
              <!--                <LikeFilled/>{{ item.like?.sum ? item.like.sum : 0 }}-->
              <!--              </span>-->
              <span data-type="discuss">
                <MessageFilled/>{{ item?.comments.length || 0 }}
              </span>
            </div>
          </div>
          <div class="article-content-right" v-if="item.poster">
            <img :src="store.state.api.API_ROOT.BASE_URL + '/assets?filename=' + item.poster" alt="poster">
          </div>
        </div>
      </div>
    </li>
  </ul>
  <a-empty description="没有更多数据" v-show="mode === 'demo' && data.length === 0"/>
</template>

<script>
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { dateConvert, formatDate, showEl, textClip } from '@/util'
import { FireFilled, MessageFilled } from '@ant-design/icons-vue'
import { computed } from 'vue'

export default {
  name: 'blog-list',
  components: {
    FireFilled,
    MessageFilled
  },
  props: ['boxShadow', 'mode'],
  setup (props) {
    const router = useRouter()
    const store = useStore()
    const data = computed(() => {
      if (props.mode === 'demo') {
        return store.state.g.searchListArticles
      } else {
        return store.state.g.articles
      }
    })
    const toDetail = _id => {
      router.push({
        name: 'BlogDetail',
        query: {
          _id
        }
      })
    }
    return {
      data,
      store,
      toDetail,
      formatDate,
      textClip,
      showEl,
      dateConvert
    }
  }
}
</script>

<style lang="less">
</style>
