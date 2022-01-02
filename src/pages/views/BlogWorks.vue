<!--
  作品列表
-->
<template>
  <div id="blog-works">
    <main style="display: flex; flex-direction: column;">
      <section
        class="blog-works-container"
        v-for="(item, index) in source"
        :style="{order: orderComputed(item.category)}"
        :key="index">
        <div class="works-item-header">
          <div class="item-header-title">{{ item.category }}</div>
        </div>

        <!-- photo 容器 s -->
        <div class="photo-container" v-if="item.category === 'Photo'">
          <div class="photo-row" v-for="(photoV, photoK) in new Array(Math.ceil(item.data.length / 3))" :key="photoK">
            <div
              class="photo-col"
              v-for="(photoItem, photoKey) in photoComputed(item, photoK)"
              :style="{width: photoItem.width}" :key="`photoKey${photoKey}`">
              <img
                :src="photoItem.poster"
                :style="{ visibility: posterLoaded.includes('photo' + photoItem.poster) ? 'visible': 'hidden'}"
                @load="posterLoad('photo',photoItem.poster)"
                alt="poster">
            </div>
          </div>
        </div>
        <!-- photo 容器 s -->

        <!-- 默认卡片容器 s -->
        <ul class="works-item-list" v-else>
          <li class="works-list-item"
              v-for="work in item.data"
              :title="`源地址: ${work.src}`"
              :key="work._id">
            <a :href="work.src" target="_blank">

              <!-- 作品封面 -->
              <figure>
                <a-skeleton
                  :class="'photo-skeleton'"
                  :paragraph="{rows: 3}"
                  :title="false" active
                  v-if="!posterLoaded.includes(work._id)"/>
                <img
                  :src="work.poster" alt="poster"
                  :style="{ visibility: posterLoaded.includes(work._id) ? 'visible': 'hidden'}"
                  @load="posterLoad(work._id, '')">
              </figure>

              <!--   作品信息 s   -->
              <div class="list-item-describe">
                <div class="item-describe-title">{{ textClip(work.describeTitle, 15) }}</div>
                <div class="item-describe-content">{{ work.describeContent }}</div>
                <div class="item-describe-tag">
                  <div class="describe-tag-content">
                    <span v-if="item.category === 'CINEMA 4D'">
                      <EyeOutlined v-if="work.hot"/>&nbsp;{{ work.hot }}
                      <span v-if="work.hot">&nbsp;&nbsp;</span>
                      <LikeOutlined v-if="work.like"/>&nbsp;{{ work.like }}
                    </span>
                    <span v-else>
                      修改日期
                    </span>
                  </div>
                  <div class="describe-tag-date">
                  <span v-if="item.category === 'CINEMA 4D'">
                    {{ work.describeDate }}
                  </span>
                    <span v-else>
                    {{ dateConvert(work.describeDate) }}前
                  </span>
                  </div>
                </div>
              </div>
              <!--   作品信息 e   -->
            </a>
          </li>
        </ul>
        <!-- 默认卡片容器 e -->

      </section>
    </main>
    <div class="space" style="height: 52px"></div>
    <blogComments mode="default"/>
  </div>
</template>

<script>
import { EyeOutlined, LikeOutlined } from '@ant-design/icons-vue'
import blogComments from '@/components/blog-comments'
import { dateConvert, formatDate, textClip } from '@/util'
import { computed, onMounted, reactive } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'BlogWorks',
  components: {
    blogComments,
    EyeOutlined,
    LikeOutlined
  },
  setup () {
    const store = useStore()
    const source = reactive([])
    onMounted(() => {
      store.dispatch('getWorks').then(res => source.push(...res))
      store.dispatch('getWorksStatic').then(res => source.push(...res))
    })
    // 图片加载完成标记
    const posterLoaded = reactive([])
    // 图片加载完成
    const posterLoad = (type, key) => {
      posterLoaded.push(type + key)
    }
    // photo-container 计算
    const photoComputed = computed(() => {
      return function (item, photoK) {
        const rWidths = [
          item.data[(photoK * 3)]?.width,
          item.data[(photoK * 3) + 1]?.width,
          item.data[(photoK * 3) + 2]?.width
        ].map(v => parseInt(v) || 0)
        const rWidth = index => (rWidths[index] / (rWidths[0] + rWidths[1] + rWidths[2]) * 100).toFixed(0) + '%'
        const height = item.data[(photoK * 3)]?.height + 'px'
        const cPoster = index => item.data[(photoK * 3) + index]?.poster
        const item1 = {
          width: rWidth(0),
          poster: cPoster(0),
          height
        }
        const item2 = {
          width: rWidth(1),
          poster: cPoster(1),
          height
        }
        const item3 = {
          width: rWidth(2),
          poster: cPoster(2),
          height
        }
        return [item1, item2, item3].filter(v => !!v.poster)
      }
    })
    // order 排序计算
    const orderComputed = (category) => {
      let order
      switch (category) {
        case 'CINEMA 4D':
          order = 0
          break
        case '网页':
          order = 1
          break
        case 'npm Packages':
          order = 2
          break
        case '浏览器插件':
          order = 2
          break
        case 'Photo':
          order = 3
          break
        default:
          order = 1
          break
      }
      return order
    }

    return {
      dateConvert,
      textClip,
      posterLoad,
      formatDate,
      orderComputed,
      photoComputed,
      posterLoaded,
      source
    }
  }
}
</script>

<style lang="less">
</style>
