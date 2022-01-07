<template>
  <div id="logs">

    <!--  日志详情 modal s  -->
    <gModal :visible="visible" :container="getContainer" title="日志详情" @close="visible = false">
      <template #modal-content>
        <h3 style="font-size: 28px; font-weight: 600">Error Message</h3>
        <pre style="word-wrap: break-word; white-space: pre-wrap;">{{ detail?.error.message || '' }}</pre>
        <h3 style="font-size: 28px; font-weight: 600">Ctx</h3>
        <pre style="word-wrap: break-word; white-space: pre-wrap;">{{ detail?.ctx || '' }}</pre>
        <br>
        <h3 style="font-size: 28px; font-weight: 600">Stack</h3>
        <pre style="word-wrap: break-word; white-space: pre-wrap;">{{ detail?.error.stack || '' }}</pre>
        <h3 style="font-size: 28px; font-weight: 600">Log Filename</h3>
        <pre style="word-wrap: break-word; white-space: pre-wrap;">{{ detail?.logFilename || '' }}</pre>
      </template>
    </gModal>
    <!--  日志详情 modal e  -->

    <a-row :gutter="24">
      <a-col :xs="24" :sm="16" :md="16" :lg="16" :xl="6">
        <widgetStatistic title="七日内捕获" :value="logs.aWeekSum" type="default"/>
      </a-col>
      <a-col :xs="24" :sm="8" :md="8" :lg="8" :xl="6">
        <widgetStatistic title="未解决" :value="logs.unRepair" type="default"/>
      </a-col>
      <a-col :xs="24" :sm="8" :md="8" :lg="8" :xl="6">
        <widgetStatistic title="今日捕获" :value="logs.today?.sum" type="default"/>
      </a-col>
      <a-col :xs="24" :sm="16" :md="16" :lg="16" :xl="6">
        <widgetStatistic title="今日未解决" :value="logs.today?.unRepair" type="default"/>
      </a-col>
    </a-row>

    <!--  日志list s -->
    <template v-for="(errItem, index) in logs.data" :key="index">
      <h2>
        {{ errItem.day === today ? '今日' : '历史' }}捕获
        &nbsp;&nbsp;
        {{ formatDate(errItem.day, 'transform') }}
        &nbsp;&nbsp;
        <a style="font-size: 14px" @click="repairDayError(errItem.day)" v-if="errItem.unRepair">解决所有</a>
      </h2>
      <a-list
        :data-source="errItem.ErrorList"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta :description="item.message">
              <template #title>
                <span style="font-weight: 600">{{ item.type }}</span>
                &nbsp;&nbsp;
                <span style="font-size: 13px">{{ formatDate(item.time) }}</span>
              </template>
            </a-list-item-meta>
            <template #actions>
              <a @click="errorDetail(item)">详情</a>
              <a v-if="!item.repair" @click="repairError(errItem.day, item.time)">标记解决</a>
              <a @click="downloadLogs(item.logFilename)">下载logs</a>
            </template>
            {{ textClip(item.error.message, 200) }}
          </a-list-item>
        </template>
      </a-list>
    </template>
    <!--  日志list e -->

  </div>
</template>

<script>
import widgetStatistic from '@/components/widget-statistic'
import gModal from '@/components/g-modal'
import { formatDate, getBeforeDate, textClip } from '@/util'
import { message } from 'ant-design-vue'
import { onMounted, reactive, ref } from 'vue'
import { useStore } from 'vuex'

export default {
  components: {
    widgetStatistic,
    gModal
  },
  name: 'AdminLogs',
  setup () {
    const today = getBeforeDate(0)
    const store = useStore()
    const api = store.state.api
    const visible = ref(false)
    const detail = ref(null)
    const logs = reactive({
      data: [], // 所有数据
      today: {},
      unRepair: 0,  // 七日内未解决错误总数
      aWeekSum: 0 // 七日内总和
    })

    // 加载
    onMounted(() => {
      getLogs()
    })

    function getLogs () {
      store.dispatch('getLogs', { today, weekAgo: getBeforeDate(-7) }).then(result => {
        if (result && result?.length > 0) {
          if (result?.length > 500) {
            return alert('捕获错误超过500条!')
          }
          const data = result
          logs.data = data
          logs.today = data[0]
          repairAdd(data)
        }
      })
    }

    /**
     * 计算统计数据
     * @param {Array} data 所有数据
     */
    function repairAdd (data) {
      logs.aWeekSum = logs.unRepair = 0
      data.forEach(onceLogs => {
        if (onceLogs?.ErrorList && onceLogs.ErrorList.length > 0) onceLogs.ErrorList.reverse()
        logs.aWeekSum += Number(onceLogs.sum) // 累加总数
        logs.unRepair += Number(onceLogs.unRepair) || 0
      })
    }

    // 弹出错误详情
    const errorDetail = (data) => {
      visible.value = true
      detail.value = data
    }

    // 修复单个错误
    const repairError = (day, time) => {
      store.dispatch('putRepairError', { day, time }).then(() => getLogs())
    }

    // 修复一天的错误
    const repairDayError = (day) => {
      store.dispatch('putRepairDayError', { day }).then(() => getLogs())
    }

    // 下载logs文件
    const downloadLogs = (logFilename) => {
      if (logFilename) {
        window.open(api.API_ROOT.BASE_URL + api.API_STATIC.GET_STATIC + '?filename=' + logFilename, '_blank')
      } else {
        message.info('文件似乎已丢失~')
      }
    }
    return {
      logs,
      visible,
      detail,
      today,
      errorDetail,
      formatDate,
      textClip,
      getBeforeDate,
      repairError,
      repairDayError,
      downloadLogs,
      getContainer: () => document.getElementById('admin-wrap')
    }
  }
}
</script>

<style lang="less">
</style>
