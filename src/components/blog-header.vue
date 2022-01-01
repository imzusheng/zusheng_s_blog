<!--
  博客默认顶部菜单栏
-->

<template>
  <div class="blog-header user-select-not">
    <div>
      <div
        class="blog-header-action-menu"
        @click="store.state.g.menuActive = !store.state.g.menuActive">
        <BarsOutlined/>
      </div>
      <div class="blog-logo" ref="logo" @click="toHome"></div>
      <div class="blog-header-menu">
        <ul ref="menuEl">
          <li data-index="BlogHome" data-selected="true">
            <router-link :to="{name: 'BlogHome'}">主页</router-link>
          </li>
          <li data-index="BlogWorks">
            <router-link :to="{name: 'BlogWorks'}">作品集</router-link>
          </li>
          <li data-index="BlogSource">
            <router-link :to="{name: 'BlogSource'}">实验室</router-link>
          </li>
          <li data-index="me">
            <a href="https://zusheng.club">关于</a>
          </li>
        </ul>
      </div>
      <div class="blog-header-action-search">
        <div @click="toSearch">
          <SearchOutlined/>
        </div>
        <div
          class="moreBtn"
          style="padding-top: 2px"
          @click="store.state.g.menuActive = !store.state.g.menuActive">
          <MoreOutlined/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { BarsOutlined, MoreOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { ref, watchEffect } from 'vue'

export default {
  components: {
    SearchOutlined,
    BarsOutlined,
    MoreOutlined
  },
  setup () {
    const menuEl = ref(null)
    const router = useRouter()
    const store = useStore()
    const toSearch = () => {
      router.push({
        name: 'BlogSearch'
      })
    }
    const toHome = () => {
      router.push({
        name: 'BlogHome'
      })
    }
    watchEffect(() => {
      if (menuEl.value?.childNodes) {
        // eslint-disable-next-line no-unused-expressions
        menuEl.value?.childNodes.forEach(item => {
          item.dataset.selected = (item.dataset.index === store.state.g.header.curSelected).toString()
        })
      }
      // console.log(store.state.g.header.curSelected)
    })
    return {
      toHome,
      toSearch,
      store,
      menuEl
    }
  }
}
</script>

<style lang="less">
</style>
