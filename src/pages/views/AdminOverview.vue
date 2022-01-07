<template>
  <div id="overView">
    <!--    -->
    <a-row :gutter="24">
      <a-col :xs="24" :sm="16" :md="16" :lg="16" :xl="6">
        <widgetStatistic title="主站总访问量" :value="websiteVisitorSum" :ratio="websiteVisitorRatio" type="default"/>
      </a-col>
      <a-col :xs="24" :sm="8" :md="8" :lg="8" :xl="6">
        <widgetStatistic title="文章浏览总量" :value="readingQuantitySum" :ratio="readingQuantityRatio" type="default"/>
      </a-col>
      <a-col :xs="24" :sm="8" :md="8" :lg="8" :xl="6">
        <widgetStatistic title="评论总量" :value="commentsQuantitySum" :ratio="commentsQuantityRatio" type="default"/>
      </a-col>
      <a-col :xs="24" :sm="16" :md="16" :lg="16" :xl="6">
        <widgetStatistic title="距离上次发布" type="rel"/>
      </a-col>
    </a-row>
    <!--    -->
    <!--    -->
    <a-row :gutter="24">
      <a-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
        <cardChartBar :overviewData="overviewData" :commentsData="commentsData"/>
      </a-col>
      <a-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <cardChartLine :overviewData="overviewData"/>
      </a-col>
    </a-row>
    <!--    -->
  </div>
</template>
<script>
import cardChartLine from '@/components/card-chart-line'
import cardChartBar from '@/components/card-chart-bar'
import widgetStatistic from '@/components/widget-statistic'
import { getBeforeDate } from '@/util'
import { useStore } from 'vuex'
import { computed, ref } from 'vue'

export default {
  name: 'AdminOverview',
  components: {
    cardChartLine,
    cardChartBar,
    widgetStatistic
  },
  setup () {
    const store = useStore()
    const overviewData = ref(null)
    const commentsData = ref(null)
    const AllOverview = ref(null)
    // 总访问量
    const websiteVisitorSum = computed(() => {
      return AllOverview.value?.visitorsSum || 0
    })
    // 文章阅读量
    const readingQuantitySum = computed(() => {
      return AllOverview.value?.ReadingQuantity || 0
    })
    // 评论数量
    const commentsQuantitySum = computed(() => {
      return AllOverview.value?.commentsQuantity || 0
    })
    // 总访问量-昨日变化率
    const websiteVisitorRatio = computed(() => {
      if (overviewData.value) {
        return overviewData.value[getBeforeDate(0)]?.visitors?.sum || 0
      } else {
        return 0
      }
    })
    // 文章阅读量-昨日变化率
    const readingQuantityRatio = computed(() => {
      if (overviewData.value) {
        return overviewData.value[getBeforeDate(0)]?.article?.sum || 0
      } else {
        return 0
      }
    })
    // 评论数量-昨日变化率
    const commentsQuantityRatio = computed(() => {
      if (overviewData.value) {
        return overviewData.value[getBeforeDate(0)]?.comments?.sum || 0
      } else {
        return 0
      }
    })
    // 总历史数据
    store.dispatch('getHistoryOverview')
         .then(result => {
           AllOverview.value = result
         })
    // 获取七日数据
    store.dispatch('getOverview', { today: getBeforeDate(0), weekAgo: getBeforeDate(-7) })
         .then(result => {
           overviewData.value = result
         })
    // 所有评论数据
    store.dispatch('getAllComments')
         .then(result => {
           commentsData.value = result
         })
    return {
      overviewData,
      commentsData,
      websiteVisitorSum,
      readingQuantitySum,
      commentsQuantitySum,
      websiteVisitorRatio,
      readingQuantityRatio,
      commentsQuantityRatio
    }
  }
}
</script>

<style lang="less">
</style>
