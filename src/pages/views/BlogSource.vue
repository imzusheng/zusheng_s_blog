<template>
  <div id="map" style="height: 600px; width: 100%">
  </div>
</template>

<script>
import { LoadBaiduMapScript } from '@/util'

const options = {
  // 指示浏览器获取高精度的位置
  enableHighAccuracy: true,
  // 指定获取地理位置的超时时间，默认不限时，单位为毫秒
  timeout: 5000,
  // 最长有效期,即位置缓存
  maximumAge: 3000
}
export default {
  name: 'BlogSource',
  setup () {
    const successCb = position => {
      // longitude 经度, latitude  纬度
      initBMap(position.coords.latitude, position.coords.longitude)
    }
    const errorCb = error => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          console.log('用户拒绝对获取地理位置的请求(User denied the request for Geolocation.)')
          break
        case error.POSITION_UNAVAILABLE:
          console.log('位置信息是不可用(Location information is unavailable.)')
          break
        case error.TIMEOUT:
          console.log('用户的请求超时(The request to get user location timed out.)')
          break
        default:
          console.log('未知错误(An unknown error occurred.)')
          break
      }
    }
    navigator.geolocation.getCurrentPosition(successCb, errorCb, options)

    const initBMap = async (latitude, longitude) => {
      const BMap = await LoadBaiduMapScript()
      const { Point, Marker, Map, Geocoder, NavigationControl, MapTypeControl, GeolocationControl } = BMap
      const map = new Map('map')
      const point = new Point(longitude, latitude)
      map.centerAndZoom(point, 11)
      // 创建标注
      const marker = new Marker(point)
      // 将标注添加到地图中
      map.addOverlay(marker)
      // 添加控件
      map.addControl(new NavigationControl())
      map.addControl(new MapTypeControl())
      map.addControl(new GeolocationControl())
      // 将地址解析结果显示在地图上，并调整地图视野
      const myGeo = new Geocoder()
      // myGeo.getPoint('广东省惠州市博罗县博罗文化广场', function (point) {
      //   if (point) {
      //     map.centerAndZoom(point, 16)
      //     map.addOverlay(new BMap.Marker(point))
      //   }
      // })
      map.addEventListener('click', function (e) {
        const pt = e.point
        myGeo.getLocation(pt, function (rs) {
          const addComp = rs.addressComponents
          console.log(addComp.province + ', ' + addComp.city + ', ' + addComp.district + ', ' + addComp.street + ', ' + addComp.streetNumber)
        })
      })
    }

    return {}
  }
}
</script>

<style lang="less">
</style>
