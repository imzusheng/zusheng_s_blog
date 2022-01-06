<template>

  <span v-if="type === 'os'">
    <!--  windows  -->
    <img v-if="os.indexOf('windows') > -1" src="../assets/img/icon/windows.svg" alt="icon"
         :style="{height: `${size}px`, width: `${size}px`}">

    <!--  android -->
    <img v-else-if="os.indexOf('android') > -1" src="../assets/img/icon/android.svg" alt="icon"
         :style="{height: `${size}px`, width: `${size}px`}">

    <!--  ubuntu  -->
    <img v-else-if="os.indexOf('ubuntu') > -1" src="../assets/img/icon/ubuntu.svg" alt="icon"
         :style="{height: `${size}px`, width: `${size}px`}">

    <!--  apple -->
    <img v-else-if="os.indexOf('iphone') > -1 || os.indexOf('ipad') > -1" src="../assets/img/icon/apple.svg" alt="icon"
         :style="{height: `${size}px`, width: `${size}px`}">

    <!--  linux -->
    <img v-else-if="os.indexOf('linux') > -1" src="../assets/img/icon/linux.svg" alt="icon"
         :style="{height: `${size}px`, width: `${size}px`}">
  </span>

  <span v-else-if="type === 'browser'">
    <!--  safari -->
    <img v-if="os.indexOf('safari') > -1 || os.indexOf('mac') > -1" src="../assets/img/icon/safari.svg" alt="icon"
         :style="{height: `${size}px`, width: `${size}px`}">

    <!--  firefox -->
    <img v-if="os.indexOf('firefox') > -1" src="../assets/img/icon/firefox.svg" alt="icon"
         :style="{height: `${size}px`, width: `${size}px`}">

    <!--  edge -->
    <img v-if="os.indexOf('edg') > -1" src="../assets/img/icon/edge.svg" alt="icon"
         :style="{height: `${size}px`, width: `${size}px`}">

    <!--  chrome -->
    <img v-if="os.indexOf('chrome') > -1" src="../assets/img/icon/chrome.svg" alt="icon"
         :style="{height: `${size}px`, width: `${size}px`}">
  </span>

  <span v-else-if="type === 'speed'">
    <!--  run -->
    <img v-if="os.indexOf('run') > -1" src="../assets/img/icon/speed-run.svg" alt="icon"
         :style="{height: `${size}px`, width: `${size}px`}">

    <!--  car -->
    <img v-if="os.indexOf('car') > -1" src="../assets/img/icon/speed-car.svg" alt="icon"
         :style="{height: `${size}px`, width: `${size}px`}">

    <!--  jet -->
    <img v-if="os.indexOf('jet') > -1" src="../assets/img/icon/speed-jet.svg" alt="icon"
         :style="{height: `${size}px`, width: `${size}px`}">
  </span>

  <span v-else>
    <!--  map -->
    <img v-if="os.indexOf('map') > -1" src="../assets/img/icon/map.svg" alt="map"
         :style="{height: `${size}px`, width: `${size}px`}">
  </span>

</template>

<script>
export default {
  name: 'os-icon',
  props: ['size', 'type', 'os']
}
</script>
