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
              <span>{{ item.title }}</span>
            </div>
            <div class="article-content-describe">
              <span>{{ item.content }}</span>
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
          <div class="article-content-right"
               v-if="item.poster"
               :style="{visibility: imgOnLoadList.includes(item.poster + i) ? 'visible' : 'hidden'}">
            <img
              :src="store.state.api.API_ROOT.BASE_URL + '/assets?filename=' + item.poster"
              @load="imgOnLoad(item.poster + i)"
              alt="poster">
          </div>
        </div>

      </div>
    </li>
  </ul>
  <a-empty description="没有更多数据" v-show="mode === 'demo' && data.length === 0"/>
  <div data-break style="height: 64px"></div>
  <p style="text-align: center; font-size: 16px; color: #999">迁移中...</p>
  <p style="display: flex; justify-content: center; align-items: center; color: #999">
    <img src="../assets/img/icon/wordpress.svg" alt="wordpress" style="height: 24px; width: 24px">
    &nbsp;
    &nbsp;
    <span style="color: #777">></span><span style="color: #888">></span><span style="color: #999">></span>
    &nbsp;
    &nbsp;
    <img src="../assets/img/icon/home.svg" alt="home" style="height: 24px; width: 24px">
  </p>
  <div data-break style="height: 64px"></div>
</template>

<script>
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { dateConvert, formatDate, showEl, textClip } from '@/util'
import { FireFilled, MessageFilled } from '@ant-design/icons-vue'
import { computed, reactive } from 'vue'

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
    // 已加载完成的图片列表
    const imgOnLoadList = reactive([])
    const imgOnLoad = poster => imgOnLoadList.push(poster)
    return {
      data,
      store,
      toDetail,
      formatDate,
      textClip,
      showEl,
      dateConvert,
      imgOnLoadList,
      imgOnLoad
    }
  }
}
</script>

<style lang="less">
</style>
