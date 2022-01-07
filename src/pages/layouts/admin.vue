<!--
  这是后台布局
  承载博客后台
-->

<template>
  <a-layout id="admin-wrap" :class="{'pro-dark': adminTheme}">

    <!--  menu s  -->
    <a-layout-sider
      collapsible
      breakpoint="lg"
      collapsed-width="0"
      @breakpoint="onBreakpoint"
      v-model:collapsed="collapseStatus"
      :data-menu-breakpoint="breakpointStatus"
      :data-menu-collapse="collapseStatus"
    >
      <div class="admin-logo">
        <img :src="logoDark" alt="logo" v-if="adminTheme">
        <img :src="logo" alt="logo" v-else>
      </div>
      <a-menu
        v-model:selectedKeys="store.state.admin.menu.curSelectedKeys"
        mode="inline"
        theme="dark"
      >
        <template v-for="(item, key) in proRoutes.children" :key="key">
          <router-link :to="{
            name: item.name,
             query: (item.meta?.query ? item.meta?.query : null)
          }">
            <a-menu-item :key="item.meta.title">
              <component :is="item.meta.icon"/>
              <span class="nav-text">{{ item.meta.title }}</span>
            </a-menu-item>
          </router-link>
        </template>
      </a-menu>
    </a-layout-sider>
    <!--  menu e  -->

    <!--  router-view 主内容  s  -->
    <a-layout-content
      :style="{ filter: breakpointStatus && !collapseStatus ? 'blur(6px)' : 'none', overflow: !collapseStatus && breakpointStatus ? 'hidden' : 'auto' }"
    >
      <div
        id="mask"
        v-if="breakpointStatus && !collapseStatus"
        @click="collapseStatus = !collapseStatus"
      ></div>

      <!--  面包屑以及切换开关 s -->
      <div class="admin-header">
        <a-breadcrumb>
          <a-breadcrumb-item v-for="(val, index) in store.state.admin.header.routes" :key="index">
            <component :is="val.icon"/>
            {{ val.name }}
          </a-breadcrumb-item>
        </a-breadcrumb>
        <div class="admin-changeTheme">
          <a-switch
            checked-children="默认主题"
            un-checked-children="暗黑主题"
            v-model:checked="store.state.g.menuConfig.adminTheme"/>
        </div>
      </div>
      <!--  面包屑以及切换开关 e -->

      <!-- 缓存的视图组件 s -->
      <router-view v-if="router.currentRoute.value.meta.keepalive" v-slot="{ Component }">
        <keep-alive>
          <component :is="Component"/>
        </keep-alive>
      </router-view>
      <!-- 缓存的视图组件 s -->

      <!-- 这里是不被缓存的视图组件 -->
      <router-view v-if="!router.currentRoute.value.meta.keepalive" v-slot="{ Component }">
        <component :is="Component"/>
      </router-view>
      <!-- 这里是不被缓存的视图组件 -->

    </a-layout-content>
    <!--  router-view 主内容  e  -->

  </a-layout>
</template>

<script>
import { AreaChartOutlined, BugOutlined, CopyOutlined, EditOutlined, HomeFilled, MessageOutlined, SettingOutlined, StarOutlined } from '@ant-design/icons-vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { exportRoutes } from '@/router'
import { useStore } from 'vuex'

export default {
  components: {
    AreaChartOutlined,
    CopyOutlined,
    StarOutlined,
    SettingOutlined,
    MessageOutlined,
    BugOutlined,
    EditOutlined,
    HomeFilled
  },
  setup () {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const routes = exportRoutes()
    // routes源信息，遍历得到菜单
    const proRoutes = routes.filter(val => val.path === '/Pro' ? val : null)[0]
    // 搜索内容
    const searchContent = ref('')
    // 侧边栏是否收起, 收起为true, 展开为false
    const collapseStatus = ref(false)
    // 侧边栏是否自动折叠, 自动折叠为true, 防止为false
    const breakpointStatus = ref(false)
    // 获取body宽度，宽度小于768时每次点击都收回侧边栏
    const clientWidth = document.documentElement.offsetWidth
    // 折叠菜单回调
    const onBreakpoint = (status) => {
      breakpointStatus.value = status
    }
    // 路由每次更新，菜单都收回
    onBeforeRouteUpdate(() => {
      if (clientWidth < 768) {
        collapseStatus.value = true
      }
    })
    // 进入到管理员界面时, html overflow属性修改为hidden
    onMounted(() => {
      document.documentElement.style.overflow = 'hidden'
    })
    // 退出管理员界面时, html overflow属性修改为auto
    onUnmounted(() => {
      document.documentElement.style.overflow = 'auto'
    })
    // 主题更改时,写入到localStorage
    watchEffect(() => {
      localStorage.setItem('adminTheme', String(store.state.g.menuConfig.adminTheme))
    })
    // 获取数据
    // 所有文章，包括未审核
    if (localStorage.getItem('token')) {
      store.dispatch('getArticles', 'all')
      store.dispatch('getLoginRecords', { uid: localStorage.getItem('uid') })
    }
    return {
      proRoutes,
      collapseStatus,
      breakpointStatus,
      route,
      router,
      store,
      searchContent,
      onBreakpoint,
      logoDark: require('@/assets/img/logo-dark.png'),
      logo: require('@/assets/img/LOGO.png'),
      adminTheme: computed(() => store.state.g.menuConfig.adminTheme)
    }
  }
}
</script>

<style lang="less">
</style>
