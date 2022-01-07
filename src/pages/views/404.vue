<template>
  <div id="notFound" class="user-select-not">
    <img src="../../assets/img/ErrorTV.svg" alt="404 Not Found" draggable="false">
    <h1>无法找到页面</h1>
    <p>{{ countdown }} 秒后跳转到主页</p>
    <router-link to="/"><p style="color: #1890ff">立即跳转</p></router-link>
  </div>
</template>

<script setup>
import { onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const countdown = ref(6)
const timer = setInterval(() => {
  if (countdown.value > 0) {
    countdown.value -= 1
  } else {
    clearInterval(timer)
    router.replace({
      path: '/'
    })
  }
}, 1000)

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style lang="less">
</style>
