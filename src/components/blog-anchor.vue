<!--
  这是文章目录组件
  监听store.state.g.title
-->

<template>
  <div class="blog-detail-anchor" v-show="store.state.g.menuConfig.anchor && anchorCollection.arr.length > 0">
    <a-anchor :affix="false">
      <a-anchor-link
        v-for="(item, key) in anchorCollection.arr"
        :key="key"
        :href="`#${item.href}`"
        :title="item.title"
      />
    </a-anchor>
  </div>
</template>

<script>
import { onUnmounted, reactive, watchEffect } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'blog-anchor',
  setup () {
    const store = useStore()
    const anchorCollection = reactive({
      arr: []
    })
    watchEffect(() => {
      if (store.state.g.title && anchorCollection.arr.length === 0) {
        store.state.g.title.forEach((el, key) => {
          el.id = `#title${key}`
          anchorCollection.arr.push({
            href: `#title${key}`,
            title: `${key + 1}. ${el.innerText}`
          })
        })
      }
    })
    onUnmounted(() => {
      store.commit('deleteElement')
    })
    return {
      store,
      anchorCollection,
      wrap: document.getElementById('app')
    }
  }
}
</script>

<style lang="less">
</style>
