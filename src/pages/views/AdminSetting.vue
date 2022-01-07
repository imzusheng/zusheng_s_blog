<template>
  <div id="admin-setting" class="admin-section">
    <a-row :gutter="24">

      <!-- setting-anchor s -->
      <a-col :xs="24" :sm="24" :md="7" :lg="7" :xl="7">
        <a-anchor :affix="false" :getContainer="() => anchorContainer">
          <a-anchor-link
            v-for="(item, key) in anchorCollection"
            :key="key"
            :href="`#${item.href}`"
          >
            <template #title>
              <component :style="{color: '#ccc'}" :is="item.icon"/>
              {{ item.title }}
            </template>
          </a-anchor-link>
        </a-anchor>
      </a-col>
      <!-- setting-anchor e -->

      <!-- setting-card-list s -->
      <a-col :xs="24" :sm="24" :md="17" :lg="17" :xl="17">

        <a-card style="width: 100%" v-for="(card, key) in anchorCollection.filter(item => item.template)" :key="key">
          <template #title>
            <div class="ant-card-head-title" :id="card.href">{{ card.title }}</div>
          </template>
          <!--  setting-card s  -->
          <setting-card :vnode="formData[card.href]?.template">
            <!--  content s  -->
            <template #settingContent v-if="formData[card.href]?.content">
              <a-col
                :xs="24" :sm="24" :md="24" :lg="12" :xl="12" :key="colKey"
                v-for="(colVal, colKey) in Object.keys(formData[card.href].content)">
                <a-form-item :label="colVal.toUpperCase()">
                  <a-input v-model:value="formData[card.href].content[colVal]"
                           :disabled="formData[card.href].disabled"
                           :data-disable="formData[card.href].disabled"/>
                </a-form-item>
              </a-col>
            </template>
            <!--  content e  -->
            <!--  buttonGroup s  -->
            <template #settingButton v-if="formData[card.href]?.button">
              <a-button v-for="(btn, btnKey) in formData[card.href].button"
                        :type="btn.type"
                        :key="btnKey"
                        :danger="btn.danger"
                        @click="btn.click"
                        :style="{
                          'border-radius': '4px',
                          'margin-right': (formData[card.href].button.length === (btnKey + 1) ? '0' : '8px')
                        }">
                {{ btn.value }}
              </a-button>
            </template>
            <!--  buttonGroup e  -->
          </setting-card>
          <!--  setting-card e  -->
        </a-card>

      </a-col>
      <!-- setting-card-list e -->
    </a-row>
  </div>
</template>

<script>
// import { Form } from 'ant-design-vue'
import settingCard from '@/components/AdminSetting/setting-card'
import { Modal } from 'ant-design-vue'
import { ApiFilled, BuildFilled, DatabaseFilled, EnvironmentFilled, ExclamationCircleOutlined, ProfileFilled, RestFilled } from '@ant-design/icons-vue'
import { h, onMounted, reactive, ref, toRaw } from 'vue'
import { deleteTokenStorage, formatDate } from '@/util'
import { useStore } from 'vuex'
import router from '@/router'

export default {
  name: 'AdminSetting',
  components: {
    settingCard,
    ProfileFilled,
    DatabaseFilled,
    EnvironmentFilled,
    BuildFilled,
    ApiFilled,
    RestFilled,
    ExclamationCircleOutlined
    // VNodes: {
    //   props: ['vnodes'],
    //   setup (props) {
    //     return () => [h(props.vnodes)]
    //   }
    // }
  },
  setup (props, { emit }) {
    const anchorContainer = ref(null)
    const store = useStore()
    const api = toRaw(store.state.api)
    const apiKeysList = Object.keys(api)
    const apiValuesList = Object.values(api)
    // 二级菜单数据
    const anchorCollection = [
      {
        href: 'recentLoginInfo',
        title: '最近登录信息',
        icon: 'EnvironmentFilled',
        template: true
      }, {
        href: 'localStorage',
        title: 'LocalStorage 管理',
        icon: 'DatabaseFilled',
        template: true
      }, {
        href: 'token',
        title: 'Token 管理',
        icon: 'ProfileFilled',
        template: true
      }, {
        href: 'APIConfiguration',
        title: 'API 配置文件',
        icon: 'ApiFilled',
        template: true
      }, {
        href: 'changePassword',
        title: '修改用户名和密码',
        icon: 'RestFilled',
        template: true
      }, {
        href: 'resetDatabase',
        title: '格式化数据库',
        icon: 'BuildFilled',
        template: true
      }
    ]
    // 表单数据
    // const antForm = resolveComponent('a-form')
    // const antFormItem = resolveComponent('a-form-item')
    // const antInput = resolveComponent('a-input')
    // const antRow = resolveComponent('a-row')
    // const antCol = resolveComponent('a-col')
    const newPwd = ref('')
    const newUid = ref('')
    const localStorageRaw = {}
    Object.keys(localStorage).forEach(localStorageKeys => {
      localStorageRaw[localStorageKeys] = localStorage.getItem(localStorageKeys)
    })
    const formData = reactive({  // 函数式组件所需要的数据
      token: {
        disabled: true,
        button: [
          {
            value: '续约',
            type: 'link',
            danger: false,
            click: tokenRenew
          }, {
            value: '删除',
            type: 'primary',
            danger: true,
            click: tokenDelete
          }
        ],
        content: {
          value: localStorage.getItem('token'), // 内容
          exp: formatDate(Number(localStorage.getItem('tokenExp')) * 1000) // 有效期
        }
      },
      localStorage: {
        button: [
          {
            value: '编辑',
            type: 'link',
            danger: false,
            click: editLocalStorage
          }, {
            value: '清空',
            type: 'primary',
            danger: true,
            click: clearLocalStorage
          }
        ],
        disabled: true,
        content: Object.assign({}, localStorageRaw)
      },
      resetDatabase: {
        template: () =>
          <p style="color: #999; font-size: 14px; font-weight: 400; padding: 0 12px 0">
            一旦格式化数据库，将无法恢复。请确定
          </p>,
        button: [
          {
            value: '初始化数据',
            type: 'link',
            danger: false,
            click: resetDatabase
          }, {
            value: '清空数据',
            type: 'primary',
            danger: true,
            click: clearDatabase
          }
        ]
      },
      recentLoginInfo: {
        template: () =>
          <div style="padding: 12px; margin-bottom: -24px">
            <a-timeline reverse={true}>
              {
                store.state.admin.LoginRecords?.length > 0 ? store.state.admin.LoginRecords.map(item => {
                  return <a-timeline-item>
                    <span style="color: #777">
                      {formatDate(item.time)}
                    </span>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    IP: {item.IPAddress}
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    位置: {item?.position?.address || '无法获取'}
                  </a-timeline-item>
                }) : null
              }
            </a-timeline>
          </div>
      },
      changePassword: {
        button: [
          {
            value: '更新密码',
            type: 'primary',
            danger: false,
            click: updatePwd
          }
        ],
        template: () =>
          <div>
            <a-form layout="vertical">
              <a-form-item>
                <a-input size="large" v-model:value={newUid.value} tabIndex="2" placeholder="新用户名" autocomplete="off"/>
              </a-form-item>
              <a-form-item>
                <a-input-password size="large" v-model:value={newPwd.value} tabIndex="2" placeholder="新密码"
                                  autocomplete="off"/>
              </a-form-item>
            </a-form>
            <p style="padding: 0 8px; font-weight: 400; color: #777"><span style="color: red">*</span>密码不设校验，请好自为之</p>
          </div>
      },
      APIConfiguration: {
        // TODO 也许有更好的方法, 用jsx吧
        // template: () => h(
        //   antForm,
        //   { layout: 'vertical' },
        //   {
        //     default: () => apiValuesList.map((apiClass, index) => {
        //       return [
        //         h(
        //           antRow,
        //           { gutter: 24 },
        //           {
        //             default: () => [
        //               h(
        //                 antCol,
        //                 { xs: 24, xl: 24 },
        //                 {
        //                   default: () => [
        //                     h(
        //                       'h4',
        //                       { class: 'setting-card-title', innerHTML: apiKeysList[index] }
        //                     )
        //                   ]
        //                 }
        //               ),
        //               ...Object.keys(apiClass).map((val, i) => {
        //                 return [
        //                   h(
        //                     antCol,
        //                     { xs: 24, sm: 24, md: 12, lg: 12, xl: 12 },
        //                     {
        //                       default: () => [
        //                         h(
        //                           antFormItem,
        //                           { label: val },
        //                           {
        //                             default: () => [
        //                               h(
        //                                 antInput,
        //                                 {
        //                                   disabled: true,
        //                                   value: api[apiKeysList[index]][val],
        //                                   'onUpdate:value': value => emit('update:value', value)
        //                                 }
        //                               )
        //                             ]
        //                           }
        //                         )
        //                       ]
        //                     }
        //                   )
        //                 ]
        //               })
        //             ]
        //           }
        //         )
        //       ]
        //     })
        //   }
        // )
        template: () =>
          <a-form layout="vertical">
            {
              apiValuesList.map((apiClass, index) =>
                <a-row gutter={24} key={index}>
                  <a-col xs={24} xl={24}><h4 className="setting-card-title">{apiKeysList[index]}</h4></a-col>
                  {
                    Object.keys(apiClass).map((val, i) =>
                      <a-col xs={24} sm={24} md={12} lg={12} xl={12} key={i}>
                        <a-form-item label={val}>
                          <a-input v-model:value={api[apiKeysList[index]][val]} data-disable={true} disabled={true}/>
                        </a-form-item>
                      </a-col>
                    )
                  }
                </a-row>
              )
            }
          </a-form>
      }
    })

    // 修改密码
    function updatePwd () {
      Modal.confirm({
        title: () => '请确定修改',
        icon: () => h(ExclamationCircleOutlined),
        okText: '确定',
        cancelText: '取消',
        onOk () {
          store.dispatch('putUpdatePwd', {
            newUid: newUid.value,
            pwd: newPwd.value,
            uid: localStorage.getItem('uid')
          })
        }
      })
    }

    // 表单按钮点击事件
    function tokenRenew () {
      store.dispatch('getTokenRenew', {
        uid: localStorage.getItem('uid'),
        pwd: localStorage.getItem('pwd')
      }).then(result => {
        const { data: { token, exp } } = result
        localStorage.setItem('token', token)
        localStorage.setItem('tokenExp', exp)
        formData.token.content.value = token
        formData.token.content.exp = formatDate(Number(exp) * 1000)
      })
    }

    // 删除token
    function tokenDelete () {
      Modal.confirm({
        title: () => '删除 token 后将返回登录页，请确定！',
        icon: () => h(ExclamationCircleOutlined),
        okText: '确定',
        cancelText: '取消',
        onOk () {
          deleteTokenStorage()
          router.replace({
            path: '/Pro'
          })
        }
      })
    }

    // 清空localStorage
    function clearLocalStorage () {
      if (formData.localStorage.disabled) {
        Modal.confirm({
          title: () => '清空后将刷新浏览器，并返回登录页，请确定！',
          icon: () => h(ExclamationCircleOutlined),
          // content: () => createVNode('div', { style: 'color:red;' }, 'Some descriptions'),
          okText: '确定',
          cancelText: '取消',
          onOk () {
            Object.keys(localStorage).forEach(item => {
              localStorage.removeItem(item)
            })
            window.location.reload()
          }
        })
      } else {
        storageAssignment()
      }
    }

    // 编辑localStorage
    function editLocalStorage () {
      if (formData.localStorage.disabled) {
        formData.localStorage.disabled = false
        formData.localStorage.button[0].value = '取消'
        formData.localStorage.button[1].value = '确定'
        formData.localStorage.button[1].danger = false
      } else {
        formData.localStorage.disabled = true
        formData.localStorage.button[0].value = '编辑'
        formData.localStorage.button[1].value = '清空'
        formData.localStorage.button[1].danger = true
        formData.localStorage.content = Object.assign({}, localStorageRaw)
      }
    }

    // 修改 localStorage 表单后赋值到 localStorage
    function storageAssignment () {
      formData.localStorage.disabled = true
      formData.localStorage.button[0].value = '编辑'
      formData.localStorage.button[1].value = '清空'
      formData.localStorage.button[1].danger = true
      Object.keys(formData.localStorage.content).forEach(item => {
        localStorage.setItem(item, formData.localStorage.content[item])
      })
      formData.localStorage.content = Object.assign({}, localStorage)
      // 顺带修改store的值
      store.commit('storageAssignment')
    }

    // 清空数据库
    function clearDatabase () {
      Modal.confirm({
        title: () => '将数据库清空，请确定！',
        content: '清空后将重设 - 用户名: admin, 密码: 123456',
        icon: () => h(ExclamationCircleOutlined),
        okText: '确定',
        cancelText: '取消',
        onOk () {
          store.dispatch('resetDatabase')
        }
      })
    }

    // 初始化数据库
    function resetDatabase () {
      Modal.confirm({
        title: () => '将数据库恢复至初始状态，请确定！',
        content: '初始化后将重设 - 用户名: admin, 密码: 123456',
        icon: () => h(ExclamationCircleOutlined),
        okText: '确定',
        cancelText: '取消',
        onOk () {
          store.dispatch('resetDatabase')
        }
      })
    }

    onMounted(() => {
      anchorContainer.value = document.getElementsByClassName('ant-layout-content')[0]
    })
    return {
      api,
      formData,
      anchorCollection,
      store,
      apiKeysList,
      apiValuesList,
      anchorContainer,
      vnodes: () => <p style="color: #999; font-size: 14px; font-weight: 400; padding: 0 12px 0">一旦格式化数据库，将无法恢复。请确定</p>
    }
  }
}
</script>

<style lang="less">
</style>
