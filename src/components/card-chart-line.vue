<!--
  chart.js line组件
-->
<template>
  <a-card :bordered="false">
    <template #title>
      <h6>访问量统计</h6>
      <p>
        访客数量
        <span class="text-success" :style="{color: visitorsShow.ratio > 0 ? '#cf1322':'#3f8600'}">
          {{ visitorsShow.ratio }}%
        </span>
        &nbsp;
        文章点击量
        <span class="text-success" :style="{color: articleShow.ratio > 0 ?  '#cf1322':'#3f8600'}">
          {{ articleShow.ratio }}%
        </span>
      </p>
    </template>
    <div class="chart">
      <canvas ref="chartCanvas" style="height: 300px"></canvas>
    </div>
  </a-card>
</template>

<script>
import Chart from 'chart.js/dist/chart.min'
import { onBeforeUnmount, onMounted, reactive, ref, watchEffect } from 'vue'

export default {
  name: 'cardChartLine',
  props: ['overviewData'],
  setup (props) {
    let chart = null
    const chartCanvas = ref(null)
    const visitorsShow = reactive({})
    const articleShow = reactive({})
    let labels = [] // x轴
    let datasets = [
      {
        type: 'line',
        label: '近七日访客数量',
        data: [],
        borderColor: 'rgb(240,117,80)'
      },
      {
        type: 'line',
        label: '文章点击量',
        data: [],
        borderColor: 'rgba(255,193,0,1)'
      }
    ]
    const config = {
      type: 'line',
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
        responsive: true,
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
    // 昨日变化率
    const computedRatio = (dataArr, obj) => {
      obj.today = dataArr[dataArr.length - 1] || 1
      obj.yesterday = dataArr[dataArr.length - 2] || 1
      obj.change = obj.today - obj.yesterday
      obj.ratio = ((obj.change / obj.yesterday) * 100).toFixed(2)
    }
    watchEffect(() => {
      if (!props.overviewData) return
      labels = []
      datasets = [
        {
          type: 'line',
          label: '近七日访客数量',
          data: [],
          borderColor: 'rgb(240,117,80)'
        },
        {
          type: 'line',
          label: '文章点击量',
          data: [],
          borderColor: 'rgba(255,193,0,1)'
        }
      ]
      Object.keys(props.overviewData).forEach(val => {
        labels.push(new Date(parseFloat(val)).getDate() + '(th)')
      })
      Object.values(props.overviewData).forEach(val => {
        datasets[0].data.push(val.visitors?.sum || 0)
        datasets[1].data.push(val.article?.sum || 0)
      })
      computedRatio(datasets[0].data, visitorsShow)
      computedRatio(datasets[1].data, articleShow)
      config.data.labels = labels
      config.data.datasets = datasets
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
      chartCanvas,
      visitorsShow,
      articleShow
    }
  }
}
</script>

<style lang="less" scoped>
.ant-card::v-deep {
  position: relative;
  height: 100%;
  border-radius: 16px;
  box-shadow: 1px 2px 10px rgba(0, 0, 0, .1),
    -1px -2px 10px #ffffff;

  > .ant-card-head {
    border-bottom: none;

    .ant-card-head-title {
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
  }

  > .ant-card-body {
    width: 100%;
    padding: 0 16px 16px !important;

    .chart {
      padding: 8px;
      border-radius: 16px;
      position: relative;
    }
  }
}
</style>
