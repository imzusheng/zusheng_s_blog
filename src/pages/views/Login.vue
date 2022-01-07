<template>
  <!-- TODO 做一个好看点的登录页吧  -->
  <div id="login">
    <div class="login-container">
      <div class="login-logo">
        <img src="../../assets/img/logo-dark.png" alt="logo" v-if="store.state.g.menuConfig.theme">
        <img src="../../assets/img/LOGO.png" alt="logo" v-else>
      </div>
      <h1>登录</h1>
      <a-form :style="{padding: '16px'}" :label-col="{ style: { minWidth: '66px' } }">
        <a-form-item v-bind="validateInfos.uid" required>
          <a-input v-model:value="modelRef.uid" size="large" tabIndex="1" :placeholder="'输入账号'"/>
        </a-form-item>
        <a-form-item v-bind="validateInfos.pwd" required>
          <a-input-password v-model:value="modelRef.pwd" size="large" tabIndex="2" @keyup.enter="submit"
                            placeholder="输入密码"/>
        </a-form-item>
      </a-form>
      <div class="login-link">
        <router-link :to="{name: 'BlogHome'}">返回主页</router-link>
        <!--        <router-link to="/">创建账户</router-link>-->
      </div>
      <a-button type="primary" size="large" @click="submit">下一步</a-button>
    </div>
  </div>
</template>

<script>
import { h, reactive } from 'vue'
import { useStore } from 'vuex'
import { Form, message, Modal } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'

export default {
  name: 'Login',
  setup () {
    const store = useStore()
    // 表单数据
    const modelRef = reactive({
      uid: '',
      pwd: ''
    })
    // 表单校验规则
    const rulesRef = reactive({
      uid: [{
        required: true,
        message: '请输入账号'
      }],
      pwd: [{
        required: true,
        message: '请输入密码'
      }]
    })
    const useForm = Form.useForm
    const {
            validate,
            validateInfos
          } = useForm(modelRef, rulesRef)
    const submit = () => {
      validate().then(() =>
        store.dispatch('login', {
          uid: modelRef.uid,
          pwd: modelRef.pwd
        })).catch(() => {
        message.error('请输入账号密码')
      })
    }

    store.dispatch('getInitDatabase').then(({ init, token }) => {
      if (init) {
        localStorage.setItem('token', token.token)
        Modal.confirm({
          title: () => '看起来还未初始化数据库，我可以帮你',
          content: '初始化后将重设 - 用户名: admin, 密码: 123456',
          icon: () => h(ExclamationCircleOutlined),
          okText: '确定',
          cancelText: '你没得选',
          onOk () {
            store.dispatch('resetDatabase')
          },
          onCancel () {
            store.dispatch('resetDatabase')
          }
        })
      }
    })
    return {
      modelRef,
      rulesRef,
      validateInfos,
      store: useStore(),
      submit
    }
  }
}
</script>

<style lang="less">
</style>
