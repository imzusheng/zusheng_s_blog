<!--
  chart.js bar组件
-->
<template>
  <a-card :bordered="false">
    <div class="chart">
      <canvas ref="chartCanvas" style="min-height: 180px"></canvas>
    </div>
    <div class="card-title">
      <h6>当日评论数</h6>
      <p>
        较昨日{{ commentsSource.ratio > 0 ? '上涨' : '下降' }}
        <span class="text-success" :style="{color: commentsSource.ratio > 0 ?  '#cf1322':'#3f8600'}">
          {{ commentsSource.ratio || 0 }}%
        </span>
      </p>
    </div>
    <div class="card-content">
      <p>以上数据包含未审核的评论，请及时处理.</p>
    </div>
    <a-row class="card-footer" type="flex" justify="center" align="top">
      <a-col :span="6">
        <h4>{{ todayCommentsSum }}</h4>
        <span>今日评论</span>
      </a-col>
      <a-col :span="6">
        <h4>{{ todayCommentsLike }}</h4>
        <span>赞同</span>
      </a-col>
      <a-col :span="6">
        <h4>{{ todayCommentsDislike }}</h4>
        <span>反对</span>
      </a-col>
      <a-col :span="6">
        <h4>{{ commentsUnDisposed }}</h4>
        <span>未处理</span>
      </a-col>
    </a-row>
  </a-card>
</template>

<script>
import Chart from 'chart.js/dist/chart.min'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watchEffect } from 'vue'
import { getBeforeDate } from '@/util'

export default {
  name: 'cardChartBar',
  props: ['overviewData', 'commentsData'],
  setup (props) {
    let chart = null
    const chartCanvas = ref(null)
    let labels = []
    let datasets = [
      {
        label: '近七日评论数',
        data: [],
        backgroundColor: 'rgb(240,120,80)'
      }
    ]
    const commentsSource = reactive({
      ratio: '',
      keys: [],
      values: [],
      today: null
    })

    const todayCommentsSum = computed(() => {
      return commentsSource.today?.comments?.sum || 0
    })

    const todayCommentsLike = computed(() => {
      return commentsSource.today?.comments?.like?.sum || 0
    })

    const todayCommentsDislike = computed(() => {
      return commentsSource.today?.comments?.dislike?.sum || 0
    })

    const commentsUnDisposed = computed(() => {
      if (!props.commentsData || props.commentsData.length < 0) {
        return 0
      } else {
        let unDisposed = 0
        props.commentsData.forEach(item => {
          if (!item.verify) unDisposed++
        })
        return unDisposed
      }
    })

    const config = {
      type: 'bar',
      data: {
        labels: [],
        datasets: []
      },
      options: {
        layout: {
          padding: {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }
        },
        interaction: { // 交互
          intersect: false
        },
        radius: 0, // 折线圆点大小
        maintainAspectRatio: false, // 调整画布时保持原来的宽高比例
        elements: {
          line: {
            capBezierPoints: true,
            tension: 0.4 // 直线圆滑度
          },
          point: {
            style: 'rectRounded'
          },
          bar: {
            borderColor: 'rgba(50,151,200,.5)',
            borderWidth: 0,
            borderRadius: 10,
            borderSkipped: false
          }
        },
        responsive: true,
        plugins: {
          legend: {
            onClick: (e, legendItem, legend) => {
              const index = legendItem.datasetIndex
              const ci = legend.chart
              if (ci.isDatasetVisible(index)) {
                ci.hide(index)
                legendItem.hidden = true
              } else {
                ci.show(index)
                legendItem.hidden = false
              }
            },
            labels: {
              usePointStyle: false,
              textAlign: 'center',
              padding: 10,
              // font:
              // color
              pointStyle: 'rectRounded'
              // pointStyle: 以下
              // 'circle'
              // 'cross'
              // 'crossRot'
              // 'dash'
              // 'line'
              // 'rect'
              // 'rectRounded'
              // 'rectRot'
              // 'star'
              // 'triangle'
            },
            display: true,
            align: 'end',
            position: 'top'
          },
          title: {
            display: false,
            align: 'start',
            position: 'top',
            text: '访问数量',
            color: '#666',
            font: {
              size: 18,
              lineHeight: 1.6,
              weight: '600',
              family: 'Helvetica'
            }
          }
        },
        scales: {
          y: {
            min: 0,
            grid: {
              drawBorder: false, // 坐标轴描边
              display: true,
              color: 'rgba(0, 0, 0, .2)',
              borderDash: [6], // 创建虚线 https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/setLineDash
              borderDashOffset: [6]
            },
            ticks: {
              // suggestedMin: 0,
              // suggestedMax: 1000,
              display: true,
              color: '#8C8C8C',
              font: {
                size: 14,
                lineHeight: 1.6,
                weight: '400'
              }
            }
          },
          x: {
            // 网格配置 https://www.chartjs.org/docs/latest/samples/scale-options/grid.html
            grid: {
              drawBorder: false, // 坐标轴描边
              display: false
            },
            // x轴参数 https://www.chartjs.org/docs/latest/samples/scale-options/ticks.html
            ticks: {
              display: true,
              color: '#8C8C8C',
              font: {
                size: 14,
                lineHeight: 1.5,
                weight: '400'
              }
            }
          }
        }
      }
    }
    watchEffect(() => {
      if (!props.overviewData) return
      labels = []
      datasets = [
        {
          label: '近七日评论数',
          data: [],
          backgroundColor: 'rgb(240,120,80)'
        }
      ]
      commentsSource.today = props.overviewData[getBeforeDate(0)]
      commentsSource.values = Object.values(props.overviewData)
      commentsSource.keys = Object.keys(props.overviewData)
      commentsSource.keys.forEach(val => {
        labels.push(new Date(parseFloat(val)).getDate() + '(th)')
      })
      commentsSource.values.forEach(val => {
        datasets[0].data.push(val.comments?.sum || 0)
      })
      config.data.labels = labels
      config.data.datasets = datasets
      const today = datasets[0].data[datasets[0].data.length - 1]
      const yesterday = datasets[0].data[datasets[0].data.length - 2] || 1
      commentsSource.ratio = (today / yesterday * 100).toFixed(2)
      if (chart) {
        chart.update()
      } else if (!chart && chartCanvas.value) {
        chart = new Chart(chartCanvas.value.getContext('2d'), config)
      }
    })

    onMounted(() => {
      chart = new Chart(chartCanvas.value.getContext('2d'), config)
    })
    onBeforeUnmount(() => {
      chart.destroy()
    })
    return {
      commentsSource,
      chartCanvas,
      todayCommentsSum,
      todayCommentsLike,
      todayCommentsDislike,
      commentsUnDisposed
    }
  }
}
</script>

<style lang="less" scoped>
.ant-card::v-deep {
  height: 100%;
  display: flex;
  border-radius: 16px;
  box-shadow: 1px 2px 10px rgba(0, 0, 0, .1),
    -1px -2px 10px #ffffff;

  > .ant-card-body {
    width: 100%;
    height: 100%;
    padding: 16px !important;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .chart {
      margin-bottom: 16px;
      padding: 8px;
      border-radius: 16px;
      position: relative;
    }

    > .card-title {
      > h6 {
        font-size: 20px;
        font-weight: 600;
        color: rgba(0, 0, 0, .7);
      }

      > p {
        font-size: 14px;
        font-weight: 600;
        color: rgba(0, 0, 0, .6);
      }
    }

    > .card-content {
      > p {
        font-size: 14px;
        color: rgba(0, 0, 0, .6);
      }
    }
  }
}
</style>
