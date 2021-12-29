<!--
  作品列表
-->
<template>
  <div id="blog-works">
    <main style="display: flex; flex-direction: column;">
      <section
        class="blog-works-container"
        v-for="(item, index) in source.v"
        :style="{order: item.category==='CINEMA 4D' ? 0 : (item.category==='Photo' ? 2 : 1 )}"
        :key="index">
        <div class="works-item-header">
          <div class="item-header-title">{{ item.category }}</div>
        </div>

        <!-- CINEMA 4D 容器 s -->
        <ul class="works-item-list" v-if="item.category === 'CINEMA 4D'">
          <li class="works-list-item"
              @click=toSource(work.src)
              v-for="(work, key) in item.data"
              :title="`源地址: ${work.src}`"
              :key="key">

            <figure>
              <img :src="work.poster" alt="poster">
            </figure>

            <!--   作品信息 s   -->
            <div class="list-item-describe">
              <div class="item-describe-title">{{ textClip(work.describeTitle, 13) }}</div>
              <div class="item-describe-content">{{ work.describeContent }}</div>
              <div class="item-describe-tag">
                <div class="describe-tag-content">
                  <EyeOutlined v-if="work.hot"/>&nbsp;{{ work.hot }}
                  <span v-if="work.hot">&nbsp;&nbsp;</span>
                  <LikeOutlined v-if="work.like"/>&nbsp;{{ work.like }}
                </div>
                <div class="describe-tag-date">
                  {{ work.describeDate }}
                </div>
              </div>
            </div>
            <!--   作品信息 e   -->
          </li>
        </ul>
        <!-- CINEMA 4D 容器 e -->

        <!-- photo 容器 s -->
        <div class="photo-container" v-else-if="item.category === 'Photo'">
          <div class="photo-row" v-for="(photoV, photoK) in new Array(Math.ceil(item.data.length / 3))" :key="photoK">
            <img
              :style="{width: addWidth(
                  item.data[(photoK * 3)]?.width,
                  item.data[(photoK * 3) + 1]?.width,
                  item.data[(photoK * 3) + 2]?.width
                  ,0)}"
              v-if="item.data[photoK * 3]?.poster"
              :src="item.data[photoK * 3]?.poster"
              alt="poster">
            <img
              :style="{width: addWidth(
                  item.data[(photoK * 3)]?.width,
                  item.data[(photoK * 3) + 1]?.width,
                  item.data[(photoK * 3) + 2]?.width
                  ,1)}"
              v-if="item.data[(photoK * 3) + 1]?.poster"
              :src="item.data[(photoK * 3) + 1]?.poster"
              alt="poster">
            <img
              :style="{width: addWidth(
                  item.data[(photoK * 3)]?.width,
                  item.data[(photoK * 3) + 1]?.width,
                  item.data[(photoK * 3) + 2]?.width
                  ,2)}"
              v-if="item.data[(photoK * 3) + 2]?.poster"
              :src="item.data[(photoK * 3) + 2]?.poster"
              alt="poster">
          </div>
        </div>
        <!-- photo 容器 s -->

      </section>
    </main>
    <div class="space" style="height: 52px"></div>
    <blogComments mode="default"/>
  </div>
</template>

<script>
import { EyeOutlined, LikeOutlined } from '@ant-design/icons-vue'
import blogComments from '@/components/blog-comments'
import { dateConvert, textClip } from '@/util'
import { onMounted, reactive } from 'vue'
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
    const source = reactive({
      v: []
    })
    onMounted(() => {
      store.dispatch('getWorks').then(res => {
        source.v = res
      })
    })
    // 跳转到源地址
    const toSource = (src) => {
      window.open(src, '_blank')
    }
    // 加法
    const addWidth = (a, b, c, index) => {
      const args = [a, b, c].map(v => parseInt(v) || 0)
      const ratio = (args[index] / (args[0] + args[1] + args[2]) * 100).toFixed(0)
      return `${ratio}%`
    }
    return {
      dateConvert,
      toSource,
      textClip,
      addWidth,
      source
    }
  }
}
</script>

<style lang="less">
</style>
