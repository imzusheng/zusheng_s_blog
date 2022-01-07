<template>
  <button ref="toTopBtn" class="toTop" @click="toTop">
    <img src="~@/assets/img/to-top.svg" alt="toTop">
  </button>
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue'
import { addScrollEvent, delScrollEvent, toTop } from '@/util'

export default {
  setup () {
    const toTopBtn = ref(null)
    onMounted(() => {
      addScrollEvent('toTopBtn', {
        min: 0,
        max: 380 - 52,
        els: [{
          el: toTopBtn.value,
          actions: {
            opacity: {
              direction: 1,
              start: 0,
              end: 1
            }
          }
        }]
      })
    })

    onUnmounted(() => {
      delScrollEvent('toTopBtn')
    })
    return {
      toTopBtn,
      toTop
    }
  }
}
</script>

<style scoped lang="less">
.toTop {
  padding: 16px;
  border-radius: 50%;
  position: fixed;
  bottom: 5vh;
  right: .5vw;
  text-align: center;
  cursor: pointer;
  opacity: 0;
  z-index: 999;
  background: transparent;
  //.common-shadow();

  img {
    //height: 50px;
    width: 50px;
  }
}
</style>
