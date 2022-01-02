<template>
  <div id="lab">
    <div class="lab-title"><h2>正在开发或探索的新玩法！</h2></div>
    <div class="lab-content">

      <div class="lab-user-info lab-content-section">
        <div class="content-section-title">用户信息<span data-reget @click="getUserInfo">重新获取</span></div>
        <div class="content-section-panel">
          <div class="info-panel-left">
            <div v-for="(item, key) in Object.keys(userInfoList)" :key="key">
              <span data-title>{{ userInfoList[item].name }}：</span>
              <span data-content>{{ userInfoList[item].value || '正在获取...' }}</span>
            </div>
          </div>
          <div class="info-panel-right">
            <div id="map"></div>
          </div>
        </div>
      </div>

      <div class="lab-content-section">
        <div class="content-section-title">
          <span data-lab-title>ECharts - 百度指数抓包</span>
          <span data-lab-content>
            <div>
              <span data-title>切换图形：</span>
              <span data-content>
                <a-switch checked-children="柱状图" un-checked-children="地理图" v-model:checked="eChartSwitch"/>
              </span>
            </div>
            <div>
              <span data-title>关键词：</span>
              <span data-content data-input>
                <input type="text" name="search-idx" v-model="eChartIndex">
                <button data-echart-idx @click="getEChartsData">确定</button>
              </span>
            </div>
          </span>
        </div>
        <div class="content-section-panel" :style="{ opacity: eChartLoading ? 0.2 : 1 }">
          <div id="eMap" ref="eMap" style="height: 80vh; width: 100%; max-height: 400px"/>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import regionMatch from '@/assets/json/region-match.json'
import { BaiduMap, getBrowser, getDelay, getGeoPosition, getSpeed } from '@/util'
import { onMounted, reactive, ref, watchEffect, toRaw } from 'vue'
import { message } from 'ant-design-vue'
import * as echarts from 'echarts/core'
// 引入图表，图表后缀都为 Chart
import { MapChart, BarChart, LineChart } from 'echarts/charts'
import { VisualMapComponent, ToolboxComponent, GridComponent } from 'echarts/components'
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from 'echarts/renderers'// 标签自动布局，全局过渡动画等特性
import { UniversalTransition } from 'echarts/features'
import { useStore } from 'vuex'
// 注册必须的组件
echarts.use([
  CanvasRenderer,
  VisualMapComponent,
  GridComponent,
  ToolboxComponent,
  MapChart,
  BarChart,
  UniversalTransition,
  LineChart
])

export default {
  name: 'BlogSource',
  setup () {
    const store = useStore()
    const userInfoList = reactive({
      ip: {
        name: 'IP 地址',
        value: ''
      },
      ipPosition: {
        name: 'IP 定位',
        value: ''
      },
      speed: {
        name: '网速',
        value: ''
      },
      delay: {
        name: '延迟',
        value: ''
      },
      isp: {
        name: '运营商',
        value: ''
      },
      browser: {
        name: '浏览器名称',
        value: ''
      },
      os: {
        name: '操作系统',
        value: ''
      },
      geo: {
        name: 'Geo 定位',
        value: ''
      },
      bMap: {
        name: '百度地图定位',
        value: ''
      },
      bMapPosition: {
        name: '位置',
        value: ''
      }
    })
    const baiduMap = new BaiduMap()
    // 获取信息
    const getUserInfo = async () => {
      // sessionStorage.setItem('ip', '{"IPAddress":"59.39.131.151","position":{"Country":"中国","Province":"广东省","City":"惠州市","Isp":"电信"}}')
      const ip = JSON.parse(sessionStorage.getItem('ip'))
      userInfoList.ip.value = ip?.IPAddress
      userInfoList.ipPosition.value = ip?.position ? `${ip?.position?.Country} - ${ip?.position?.Province} - ${ip?.position?.City}` : '获取失败...'
      userInfoList.isp.value = ip?.position?.Isp || '获取失败...'
      userInfoList.os.value = navigator.oscpu ||
        navigator.userAgent.substring(navigator.userAgent.indexOf('(') + 1, navigator.userAgent.indexOf(')'))
      userInfoList.browser.value = getBrowser()
      getSpeed().then(speed => { userInfoList.speed.value = speed })
      getDelay().then(delay => { userInfoList.delay.value = delay })
      getGeoPosition().then(geoRes => { userInfoList.geo.value = geoRes.error ? geoRes.info : geoRes.position })
      const positionRes = await baiduMap.getCurrentPosition()
      if (!positionRes.error) { userInfoList.bMap.value = positionRes.value.position }
      baiduMap.getLocationCN(positionRes.value?.r.longitude, positionRes.value?.r.latitude)
              .then(res => { userInfoList.bMapPosition.value = res })
      baiduMap.drawMap('map', positionRes.value?.r.longitude, positionRes.value?.r.latitude)
    }
    // EChart
    const eMap = ref(HTMLElement)
    const eChartSwitch = ref(false)
    const eChartIndex = ref('大数据')
    const eChartData = reactive({})
    const eChartLoading = ref(false)
    let mapData = null
    // 请求地图数据
    const getMapData = () => {
      return new Promise(resolve => {
        if (!mapData) {
          store.dispatch('getExternalFile', {
            url: 'http://cdn.zusheng.club/json/data-china.json'
          }).then(({ result }) => {
            mapData = result
            resolve(mapData)
          })
        } else {
          resolve(mapData)
        }
      })
    }
    // 加载EChart
    const initECharts = async (type) => {
      if (!eChartData?.region) return
      const dataSource = toRaw(eChartData.region.prov)
      // 键值对转换数组,排序
      const data = Object.keys(dataSource).sort((a, b) => dataSource[a] - dataSource[b]).map(v => {
        return {
          name: regionMatch[v],
          value: dataSource[v] === '1000' ? dataSource[v] - 1 : (dataSource[v] === 0 ? dataSource[v] + 1 : dataSource[v])
        }
      })
      // 配置
      const options = {
        mapOption: {
          visualMap: {
            left: 'right',
            min: 0,
            max: 1000,
            inRange: {
              // prettier-ignore
              color: ['#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027']
            },
            text: ['High', 'Low'],
            calculable: true
          },
          series: [
            {
              id: 'baiduIndex',
              type: 'map',
              map: 'china',
              roam: false, // 鼠标缩放
              scaleLimit: { // 最大和最小缩放值
                min: 0.5,
                max: 20
              },
              label: {
                show: false
              },
              animationDurationUpdate: 1000, // 可以通过每个数据返回不同的时长实现更戏剧的更新动画效果
              universalTransition: true, // 每次setOption，相同id的系列之间会自动关联进行动画的过渡
              data
            }
          ],
          toolbox: {
            show: true,
            feature: {
              saveAsImage: {}
            }
          }
        },
        barOption: {
          xAxis: {
            type: 'value'
          },
          yAxis: {
            type: 'category',
            axisLabel: {
              rotate: 30
            },
            data: data.map(item => item.name).slice(-10)
          },
          series: {
            type: 'bar',
            id: 'baiduIndex',
            data: data.map(item => item.value).slice(-10),
            universalTransition: true
          },
          toolbox: {
            show: true,
            feature: {
              magicType: { type: ['line', 'bar'] },
              restore: {},
              saveAsImage: {}
            }
          },
          animationDurationUpdate: 1000
        }
      }
      // 初始化
      const myChart = echarts.init(eMap.value, null, { renderer: 'canvas' })
      // 隐藏加载提示
      myChart.hideLoading()
      const geoJson = await getMapData()
      // 注册地图
      echarts.registerMap('china', geoJson)
      // 开始加载
      myChart.setOption(options[type], true)
    }
    // 获取数据-百度指数
    const getEChartsData = () => {
      if (eChartData?.region?.key === eChartIndex.value) {
        message.info('换一个关键词试试吧！')
      } else {
        eChartLoading.value = true
        store.dispatch('getECharts', {
          value: eChartIndex.value,
          time: Date.now()
        }).then(res => {
          eChartLoading.value = false
          eChartData.region = res.data.region[0]
          initECharts((!eChartSwitch.value ? 'mapOption' : 'barOption'))
        })
      }
    }

    onMounted(() => {
      getUserInfo()
      getEChartsData()
      watchEffect(() => {
        initECharts((!eChartSwitch.value ? 'mapOption' : 'barOption'))
      })
    })

    return {
      getUserInfo,
      getEChartsData,
      userInfoList,
      eChartSwitch,
      eChartIndex,
      eChartLoading,
      eMap
    }
  }
}
</script>

<style lang="less">
</style>
