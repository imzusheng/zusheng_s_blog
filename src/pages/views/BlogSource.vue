<template>
  <div id="lab">
    <div class="lab-title"><h2>正在开发或探索的新玩法！</h2></div>
    <div class="lab-content">
      <div class="lab-user-info">
        <div class="user-info-title">用户信息<span data-reget @click="getUserInfo">重新获取</span></div>
        <div class="user-info-panel">
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
    </div>
  </div>
</template>

<script>
import { BaiduMap, getBrowser, getDelay, getGeoPosition, getSpeed } from '@/util'
import { reactive } from 'vue'

export default {
  name: 'BlogSource',
  setup () {
    const userInfoList = reactive({
      ip: {
        name: 'IP 地址',
        value: ''
      },
      ipPosition: {
        name: 'IP 定位',
        value: ''
      },
      os: {
        name: '操作系统',
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
      speed: {
        name: '网速',
        value: ''
      },
      delay: {
        name: '延迟',
        value: ''
      },
      geo: {
        name: 'geo 定位',
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

    setTimeout(() => getUserInfo(), 2000)

    return {
      getUserInfo,
      userInfoList
    }
  }
}
</script>

<style lang="less">
#lab {
  .lab-title {
    margin: 24px 0 24px;

    h2 {
      text-align: center;
      vertical-align: center;
      color: @font-color-grey65;
    }
  }

  .lab-content {
    max-width: 1068px;
    margin: auto;

    .lab-user-info {
      padding: 0 20px;

      @media @max768 {
        & {
          padding: 0 10px;

          .user-info-title {
            text-align: center;
          }
        }
      }

      .user-info-title {
        font-size: 16px;
        color: @font-color-grey45;
        margin-bottom: 12px;

        span[data-reget] {
          margin-left: 12px;
          font-size: 14px;
          color: @font-color-blue;
          cursor: pointer;
        }
      }

      .user-info-panel {
        width: 100%;
        padding: 20px;
        box-shadow: 1px 2px 8px rgba(0, 0, 0, 0.1), -1px -2px 8px #ffffff;
        border-radius: 12px;
        display: flex;
        justify-content: space-between;

        .info-panel-left {
          > div {
            &:not(:last-child) {
              margin-bottom: 12px;
            }

            span[data-title] {
              color: @font-color-grey45;
            }
          }
        }

        .info-panel-right {
          flex: 1;
          max-width: 60%;
          padding-left: 20px;

          #map {
            height: 100%;
            width: 100%;
          }
        }

        @media @max768 {
          & {
            display: block;
            box-shadow: none;
            padding: 0;
            border-radius: 12px;

            .info-panel-right {
              width: 100%;
              height: 50vh;
              padding: 10px 0 0;
            }
          }
        }
      }
    }
  }
}
</style>
