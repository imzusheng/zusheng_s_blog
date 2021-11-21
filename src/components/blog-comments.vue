<template>
  <div class="comments" id="comments">
    <div :class="{'comments-common': mode !== 'demo'}">
      <span v-if="mode === 'default'">
        <h2>留言</h2>
        <p>留言审核后将会公开，不要直接留下个人隐私信息</p>
        <p style="display: flex; align-items: center; justify-content: center">
          头像随机生成&nbsp;&nbsp;<i class="em em-hear_no_evil" aria-role="presentation" aria-label="HEAR-NO-EVIL MONKEY"></i>
        </p>
        <p class="user-select-not" style="color: rgb(30,127,255); cursor: pointer; font-weight: 600"
           @click="changeAvatar">点我更换</p>
        <!-- textarea s -->
        <a-comment :class="'comments-discuss'">
          <template #avatar>
            <a-avatar
              :src="checkedAvatarSrc"
              alt="avatar"
            />
          </template>
          <template #content>
            <a-form-item>
              <a-textarea
                :style="{'border-radius': '16px',resize: 'none', border: 'none', 'box-shadow': '1px 2px 10px rgb(0 0 0 / 10%), -1px -2px 10px #ffffff', padding: '12px 16px'}"
                :placeholder="'想说些什么吗？就在这里发表留言吧'"
                v-model:value.trim.lazy="commentVal"
                :rows="4"/>
            </a-form-item>
            <a-form-item>
              <a-button html-type="submit" type="primary" :loading="false" @click="handleSubmit">
                发送
              </a-button>
            </a-form-item>
          </template>
        </a-comment>
        <!-- textarea e -->
      </span>
      <a-comment
        :class="'commentEl'"
        v-for="(item, i) in curComment"
        :key="item._id"
      >
        <template #actions>
          <span key="comment-basic-like">
            <a-tooltip title="赞同">
              <template v-if="item.action === 'liked'">
                <LikeFilled/>
              </template>
              <template v-else>
                <LikeOutlined @click="like(i, item._id)"/>
              </template>
            </a-tooltip>
            <span style="padding-left: 8px; cursor: auto">
              {{ item.like?.sum }}
            </span>
          </span>
          <span key="comment-basic-dislike">
            <a-tooltip title="反对">
              <template v-if="item.action === 'disliked'">
                <DislikeFilled/>
              </template>
              <template v-else>
                <DislikeOutlined @click="dislike(i, item._id)"/>
              </template>
            </a-tooltip>
            <span style="padding-left: 8px; cursor: auto">
              {{ item.dislike?.sum }}
            </span>
          </span>
        </template>
        <template #author><a>{{ i + 1 }} L</a></template>
        <template #avatar>
          <a-avatar
            :src="item.avatar"
            alt="Avatar"
          />
        </template>
        <template #content>
          <p>
            {{ item.content }}
          </p>
        </template>
        <template #datetime>
          <a-tooltip :title="formatDate(item.time)">
            <span>{{ afterConvert(item.time) }}</span>
          </a-tooltip>
        </template>
      </a-comment>
    </div>
    <a-empty description="没有更多数据" v-show="mode === 'demo' && curComment?.length === 0"/>
  </div>
</template>

<script>
import { DislikeFilled, DislikeOutlined, LikeFilled, LikeOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { dateConvert, formatDate, getBeforeDate } from '@/util'
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'blogComments',
  props: ['mode'], // 如果是demo则为展示模式，仅显示评论列表
  components: {
    DislikeFilled,
    DislikeOutlined,
    LikeFilled,
    LikeOutlined
  },
  setup (props) {
    const store = useStore()
    const router = useRouter()
    // 转换发布时间格式
    const afterConvert = computed(() => {
      return function (val) {
        return `${dateConvert(val)}前发布`
      }
    })
    /**
     * 以下选择头像相关
     */
    const commentVal = ref('') // v-model 评论内容
    const checkedAvatarSrc = ref('') // 当前的头像src
    const changeAvatar = () => {
      checkedAvatarSrc.value = require(`@/assets/img/ginger-cat/ginger-cat-${711 + Math.floor(Math.random() * (760 - 711)) + 1}.png`)
    }
    // 换头像
    changeAvatar()
    /**
     * 以下评论区相关
     */
    const curComment = computed(() => {
      if (props.mode === 'default') {
        return store.state.g.indexComments
      } else if (props.mode === 'demo') {
        return store.state.g.searchListComments
      } else {
        return store.state.g.comments
      }
    })
    // 赞同评论
    const like = (i, _id) => {
      curComment.value[i].like.sum++
      if (curComment.value[i].action === 'disliked') { // 如果原来是反对状态
        curComment.value[i].dislike.sum--
        // 发送评论反悔请求
        store.dispatch('postCommentsBack', {
          position: store.state.g.ip.position,
          IPAddress: store.state.g.ip.IPAddress,
          _id,
          befTime: curComment.value[i].actionTime,
          type: 'dislikeToLike',
          day: getBeforeDate(0),
          time: new Date().getTime()
        })
      } else {
        likeOrDisLike(_id, 'like', i)
      }
      curComment.value[i].action = 'liked' // 活动状态改为 点赞过
    }
    // 反对评论
    const dislike = (i, _id) => {
      curComment.value[i].dislike.sum++
      if (curComment.value[i].action === 'liked') { // 如果原来是点赞状态
        curComment.value[i].like.sum--
        store.dispatch('postCommentsBack', {
          position: store.state.g.ip.position,
          IPAddress: store.state.g.ip.IPAddress,
          befTime: curComment.value[i].actionTime,
          _id,
          type: 'likeToDislike',
          day: getBeforeDate(0),
          time: new Date().getTime()
        })
      } else {
        likeOrDisLike(_id, 'dislike', i)
      }
      curComment.value[i].action = 'disliked'
    }
    // 赞同和反对统一处理
    const likeOrDisLike = (_id, type, i) => {
      const time = Date.now()
      store.dispatch('postCommentsLike', {
        position: store.state.g.ip.position,
        IPAddress: store.state.g.ip.IPAddress,
        _id,
        type,
        day: getBeforeDate(0),
        time
      })
      curComment.value[i].actionTime = time
    }
    // 提交评论
    const handleSubmit = () => {
      if (commentVal.value) {
        store.dispatch('postCommentsAdd', {
          day: getBeforeDate(0),
          avatar: checkedAvatarSrc.value,
          time: new Date().getTime(),
          content: commentVal.value,
          link: router.currentRoute.value.name,
          linkId: router.currentRoute.value.query?._id || null,
          author: store.state.g.ip
        }).then(result => {
          commentVal.value = ''
          message.success(result)
        })
      }
    }
    // 获取评论数据
    onMounted(() => {
      store.dispatch('getComments', {
        link: router.currentRoute.value.name,
        linkId: router.currentRoute.value.query?._id || null
      })
    })
    return {
      store,
      curComment,
      commentVal,
      afterConvert,
      checkedAvatarSrc,
      changeAvatar,
      like,
      dislike,
      handleSubmit,
      formatDate
    }
  }
}
</script>

<style lang="less">
</style>
