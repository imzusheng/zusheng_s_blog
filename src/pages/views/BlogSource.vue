<template>
  <div id="lab">
    <div class="lab-title"><h2>正在开发或探索的新玩法！</h2></div>

    <div class="lab-content">

      <div class="lab-user-info lab-content-section">
        <div class="content-section-title">您的信息<span data-reget @click="getUserInfo">重新获取</span></div>
        <div class="content-section-panel">
          <div class="info-panel-left">
            <div v-for="(item, key) in Object.keys(userInfoList)" :key="key">
              <span data-title>{{ userInfoList[item].name }}：</span>
              <span data-content :title="userInfoList[item].value || '正在获取...'">
                <osIcon v-if="userInfoList[item].icon" :os="userInfoList[item].icon" :type="item" size="16"/>
                {{ userInfoList[item].value || '正在获取...' }}
              </span>
            </div>
          </div>
          <div class="info-panel-right">
            <a-skeleton
              v-if="!baiduMapLoading"
              :paragraph="{rows: 3}"
              :title="false" active/>
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
                <button data-echart-idx @click="searchEChartsData">确定</button>
              </span>
            </div>
          </span>
        </div>
        <div class="content-section-panel" style="position: relative">
          <a-skeleton
            style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 80%"
            v-if="!eChartInit"
            :paragraph="{rows: 4}"
            :title="false" active/>
          <div id="eMap" ref="eMap" style="height: 80vh; width: 100%; max-height: 400px"/>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import osIcon from '@/components/os-icon'
import regionMatch from '@/assets/json/region-match.json'
import { BaiduMap, debounce, getDelay, getGeoPosition, getOsInfo, getSpeed } from '@/util'
import { onMounted, reactive, ref, watchEffect, toRaw, onUnmounted } from 'vue'
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
  components: {
    osIcon
  },
  setup () {
    const store = useStore()
    /**
     * 以下百度地图获取信息模块
     */
    const baiduMapLoading = ref(false)
    // 信息栏
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
        value: '',
        icon: ''
      },
      delay: {
        name: '延迟',
        value: ''
      },
      isp: {
        name: '运营商',
        value: ''
      },
      os: {
        name: '操作系统',
        value: '',
        icon: ''
      },
      browser: {
        name: '浏览器',
        value: '',
        icon: ''
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
      const ip = JSON.parse(sessionStorage.getItem('ip'))
      userInfoList.ip.value = ip?.IPAddress
      userInfoList.ipPosition.value = ip?.position?.address || '无法获取...'
      userInfoList.isp.value = ip?.position?.Isp || '无法获取...'
      // 获取浏览器geo定位
      getGeoPosition().then(geoRes => { userInfoList.geo.value = geoRes.error ? geoRes.info : geoRes.position })
      // 获取系统信息
      getOsInfo().then(res => {
        const os = `${res.name} ${res.version}`
        userInfoList.os.value = [res.name, res.version].includes(null) ? '无法获取...' : os
        userInfoList.os.icon = os.toLowerCase()
        const browser = `${res.browserName} ${res.browserVersion}`
        userInfoList.browser.value = browser
        userInfoList.browser.icon = browser.toLowerCase()
      })
      // 获取网速
      getSpeed().then(speed => {
        userInfoList.speed.value = speed.str
        const speedNum = parseInt(speed.num)
        if (speedNum < 1) {
          userInfoList.speed.icon = 'run'
        } else if (speedNum < 10) {
          userInfoList.speed.icon = 'car'
        } else if (speedNum >= 10) {
          userInfoList.speed.icon = 'jet'
        }
      })
      // 获取网络延迟
      getDelay().then(delay => { userInfoList.delay.value = delay })
      // 获取位置
      const positionRes = await baiduMap.getCurrentPosition()
      if (!positionRes.error) { userInfoList.bMap.value = positionRes.value.position } else userInfoList.bMap.value = '无法获取...'
        // 获取位置描述
      baiduMap.getLocationCN(positionRes.value?.r.longitude, positionRes.value?.r.latitude)
              .then(res => { userInfoList.bMapPosition.value = res })
      // 绘制百度地图
      baiduMap.drawMap('map', positionRes.value?.r.longitude, positionRes.value?.r.latitude)
              .then(() => { baiduMapLoading.value = true })
    }
    /**
     * 以下ECharts-百度指数模块
     */
    const eMap = ref(null)
    const eChartSwitch = ref(false)
    const eChartIndex = ref('大数据')
    const eChartLoading = ref(false)
    // 初始化完成的标记
    const eChartInit = ref(false)
    // Chart实例
    let myChart = null
    // 关键词数据
    let eChartData = null
    // 中国地图数据
    let mapData = null
    // 请求中国地图数据 - return Promise
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
    // 获取数据-百度指数 - return Promise
    const getEChartsData = (type) => {
      return new Promise(resolve => {
        if (eChartData?.region?.key === eChartIndex.value) {
          if (type !== 'init') message.info('换一个关键词试试吧！')
          resolve(eChartData)
        } else {
          eChartLoading.value = true
          store.dispatch('getECharts', {
            value: eChartIndex.value,
            time: Date.now()
          }).then(res => {
            eChartLoading.value = false
            eChartData = { region: res.data.region[0] }
            resolve(eChartData)
          })
        }
      })
    }
    // ~挂载数据
    const setECharts = () => {
      if (!eChartInit.value) return
      // 省份分布源数据
      const dataSource = toRaw(eChartData.region.prov)
      // 键值对转换数组,排序
      const data = Object.keys(dataSource).sort((a, b) => dataSource[a] - dataSource[b]).map(v => {
        return {
          name: regionMatch[v],
          // 不让value等于1000或0, 颜色不好看
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
      // 开始加载
      myChart.setOption(options[!eChartSwitch.value ? 'mapOption' : 'barOption'], true)
    }
    // 初始化EChart数据
    const initECharts = async () => {
      // 中国地图数据
      mapData = mapData ?? await getMapData()
      // 注册地图
      echarts.registerMap('china', mapData)
      // 初始化
      myChart = echarts.init(eMap.value, null, { renderer: 'canvas' })
      // 隐藏加载提示
      myChart.hideLoading()
      // 获取关键词搜索的数据
      eChartData = await getEChartsData('init')
      // 初始化完成的标记
      eChartInit.value = true
      // 挂载数据
      setECharts()
    }
    // 搜索关键词数据
    const searchEChartsData = async () => {
      // 获取关键词搜索的数据
      eChartData = await getEChartsData()
      setECharts()
    }
    // 防抖,重新定位大小
    const resizeInit = debounce(() => {
      myChart.dispose()
      myChart = null
      eChartLoading.value = true
      eChartInit.value = false
      initECharts()
    }, 500)

    onMounted(() => {
      getUserInfo()
      initECharts()
      watchEffect(() => {
        setECharts(eChartSwitch.value)
      })
      window.addEventListener('resize', resizeInit)
    })

    onUnmounted(() => { window.removeEventListener('resize', resizeInit) })

    return {
      baiduMapLoading,
      userInfoList,
      getUserInfo,
      eMap,
      eChartSwitch,
      eChartIndex,
      eChartInit,
      searchEChartsData
    }
  }
}
</script>

<style lang="less">
</style>
