<template>
  <a-statistic
    v-if="type === 'default'"
    :title="title"
    :value="value"
    :precision="0"
  >
    <!--  #3f8600  #cf1322-->
    <template #suffix v-if="ratio">
      <span :style="{color: ratio > 0 ? '#cf1322':'#3f8600'}">
      &nbsp;&nbsp;&nbsp;&nbsp;较昨日
      {{ ratio > 0 ? '+' : '' }}{{ ratio }}
      </span>
    </template>
  </a-statistic>
  <a-statistic
    v-else
    :title="title"
    :value="lastReleaseTime"
  >
  </a-statistic>
</template>

<script>

import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'widgetStatistic',
  props: ['title', 'value', 'ratio', 'type'],
  setup () {
    const store = useStore()
    const dateNow = ref(Date.now())
    let timer = null
    onMounted(() => {
      // 每秒更新时间
      timer = setInterval(() => {
        dateNow.value = Date.now()
      }, 1000)
    })
    onUnmounted(() => {
      clearInterval(timer)
    })
    // 计算上次发布时间
    const lastReleaseTime = computed(() => {
      if (store.state.g.articles && store.state.g.articles.length > 0) {
        const show = {
          seconds: 0,
          minutes: 0,
          hours: 0,
          day: 0
        }
        // 最近文章的发布时间
        const befTime = store.state.g.articles[0].operate.releaseTime
        // 当前时间
        const curTime = dateNow.value
        // 时间差
        const space = curTime - befTime
        // 秒 向下取整
        const seconds = (space / 1000) < 1 ? 0 : Math.floor(space / 1000)
        // 分钟
        const minutes = (space / 1000 / 60) < 1 ? 0 : Math.floor(space / 1000 / 60)
        // 小时
        const hours = (space / 1000 / 60 / 60) < 1 ? 0 : Math.floor(space / 1000 / 60 / 60)
        // 天
        show.day = (space / 1000 / 60 / 60 / 24) < 1 ? 0 : Math.floor(space / 1000 / 60 / 60 / 24)
        show.hours = hours >= 24 ? hours % 24 : hours
        show.minutes = minutes >= 60 ? minutes % 60 : minutes
        show.seconds = seconds % 60
        return `${show.day}天 ${show.hours}小时 ${show.minutes}分钟 ${show.seconds}秒`
      }
      return '近期未发布文章'
    })
    return {
      lastReleaseTime
    }
  }
}
</script>

<style lang="less" scoped>
.ant-statistic::v-deep {
  background: #ffffff;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 1px 2px 10px rgba(0, 0, 0, 0.1), -1px -2px 10px #ffffff;

  .ant-statistic-content-suffix {
    font-size: 12px;
    color: rgba(0, 0, 0, .6);
  }
}
</style>
