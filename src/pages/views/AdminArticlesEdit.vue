<template>
  <div class="blog-edit">
    <div class="skeleton" v-if="loading" :style="{padding: '16px'}">
      <a-skeleton active/>
    </div>
    <div v-else>
      <span class="blog-edit-steps">
        <h2 style="margin-bottom: 24px">开始创作</h2>
        <a-steps :current="stepsCur" :status="stepStatus">
          <a-step title="编辑"/>
          <a-step title="发布预览"/>
          <a-step title="审核" description="直接发布或查看预览."/>
        </a-steps>
      </span>
      <a-tabs v-if="!releaseResult.display" :style="{'overflow-y': 'auto'}">
        <a-tab-pane key="1" tab="编辑选项" force-render>
          <a-form :style="{padding: '16px'}" :label-col="{ style: { minWidth: '66px' } }">
            <a-row :gutter="24">
              <a-col :xs="24" :md="24" :lg="24" :xl="16">
                <a-form-item label="标题" v-bind="validateInfos.title" required>
                  <a-input v-model:value="modelRef.title"/>
                </a-form-item>
                <a-form-item label="分类" v-bind="validateInfos['operate.category']" required>
                  <a-input v-model:value="modelRef.operate.category"/>
                </a-form-item>
                <a-form-item label="描述" v-bind="validateInfos.content" required>
                  <a-textarea
                    v-model:value="modelRef.content"
                    :autoSize="{minRows: 2, maxRows: 6 }"
                    :maxlength="9999"
                    :showCount="true"
                  />
                </a-form-item>
                <a-form-item label="标签">
                  <a-input v-model:value="modelRef.tagVal" @blur="handleAddTag" @keyup.enter="handleAddTag"/>
                  <a-tag v-for="(tag, tagIndex) in modelRef.tags"
                         :key="tagIndex"
                         closable
                         @close="handleTagClose(tag)">
                    {{ tag }}
                  </a-tag>
                </a-form-item>
                <a-form-item label="上传封面">
                  <a-upload
                    name="poster"
                    accept=".png,.jpeg"
                    :show-upload-list="false"
                    :customRequest="uploadFile"
                  >
                    <a-button>
                      <UploadOutlined/>
                      点击上传
                    </a-button>
                  </a-upload>
                </a-form-item>
                <a-form-item v-if="modelRef.imageUrl">
                  <div class="poster-preview">
                    <img :src="modelRef.imageUrl" style="max-width: 100%" alt="poster"/>
                  </div>
                </a-form-item>
              </a-col>
              <a-col align="bottom" :xs="24" :sm="24" :md="24" :lg="24" :xl="8"
                     :style="{'border-left': '1px dashed rgba(0,0,0,.1)'}">
                <a-row :style="{width: '100%'}">
                  <a-col :style="{width: '100%'}">
                    <a-form-item label="是否引入 Markdown 文件">
                      <a-switch @change="mdChange" v-model:checked="modelRef.markdown.md"/>
                    </a-form-item>
                    <a-form-item v-bind="validateInfos.mdFileList" v-show="modelRef.markdown.md">
                      <a-upload-dragger
                        v-model:fileList="modelRef.mdFileList"
                        :defaultFileList="modelRef.mdFileList"
                        name="md"
                        accept=".md"
                        :multiple="false"
                        listType="text"
                        @reject="handleReject"
                        :customRequest="uploadFile"
                      >
                        <!--    :disabled="modelRef.mdFileList.length > 0"-->
                        <div style="display: flex; flex-direction: column; align-items: center">
                          <p class="ant-upload-drag-icon">
                            <InboxOutlined/>
                          </p>
                          <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
                          <p class="ant-upload-hint">
                            仅支持 .md 格式
                          </p>
                        </div>
                      </a-upload-dragger>
                    </a-form-item>
                  </a-col>
                </a-row>
              </a-col>
            </a-row>
          </a-form>
        </a-tab-pane>
        <a-tab-pane key="2" tab="编辑 markdown 源文件" force-render>
          <div class="codeView">
            <pre><div
              ref="rawContent"
              contenteditable="true"
              style="width: 100%; height: 100%"
            >{{ modelRef.rawContent }}</div></pre>
          </div>
        </a-tab-pane>
      </a-tabs>
      <div v-if="!releaseResult.display" class="edit-bottom-bar">
        <a-button @click="back">返回</a-button>
        <a-button type="primary" @click="onSubmit">提交</a-button>
      </div>
      <a-result
        v-if="releaseResult.display"
        :status="releaseResult.status"
        :title="releaseResult.title"
        :sub-title="releaseResult['sub-title']"
      >
        <template #extra>
          <a-button type="primary" @click="verify">直接发布</a-button>
          <a-button @click="toDetail">预览页面</a-button>
        </template>
      </a-result>
    </div>
  </div>
</template>

<script>
import { blobToFile, blobToString, fileToBlob, fileToFormData, fileToUrl, formatDate, stringToBlob } from '@/util'
import { onMounted, reactive, ref, toRaw } from 'vue'
import { useStore } from 'vuex'
import { Form, message } from 'ant-design-vue'
import { apiService } from '@/util/axios'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { InboxOutlined, UploadOutlined } from '@ant-design/icons-vue'

export default {
  name: 'adminArticlesEdit',
  components: {
    InboxOutlined,
    UploadOutlined
  },
  setup () {
    onBeforeRouteUpdate(() => {
      releaseResult.display = false
      resetFields()
    })
    const stepsCur = ref(0)
    const stepStatus = ref('process')
    const rawContent = ref(null)
    const route = useRoute()
    const store = useStore()
    const api = store.state.api
    const router = useRouter()
    const loading = ref(true)
    // 表单数据
    const modelRef = reactive({
      mdFileList: [], // md文件
      loading: false,
      imageUrl: '',
      rawContent: '',
      tagVal: '',
      //  以上属性数据库中不保存，发送时移除
      title: '',
      tags: [],
      content: '',
      poster: '',
      markdown: {
        md: true,
        filename: ''
      },
      operate: {
        fire: 0,
        releaseTime: '',
        category: ''
      },
      verify: false
    })
    const rulesRef = reactive({
      // 表单校验规则
      title: [{
        required: true,
        message: '请输入标题'
      }],
      content: [{
        required: true,
        message: '请输入描述'
      }],
      'operate.category': [{
        required: true,
        message: '请输入分类'
      }],
      mdFileList: [{
        required: true,
        message: '请上传文件'
      }]
    })
    // 结果展示面板 a-result
    const releaseResult = reactive({
      status: '',
      title: '',
      'sub-title': '',
      display: false, // 面板显示
      _id: ''
    })
    const useForm = Form.useForm
    const {
            resetFields,
            validate,
            validateInfos
          } = useForm(modelRef, rulesRef)
    // 获取文章数据并赋值
    onMounted(() => {
      if (route.query.type === 'modify') {
        store.dispatch('getBlogDetail', { _id: route.query._id })
             .then(result => {
               Object.assign(modelRef, result)
               rulesRef.mdFileList[0].required = modelRef.markdown.md
               modelRef.imageUrl = result.poster ? `${api.API_ROOT.BASE_URL}/assets?filename=${result.poster}` : null
               loading.value = false
               mdJudge(result)
             })
      } else if (route.query.type === 'add') {
        loading.value = false
      } else {
        loading.value = false
      }
    })

    // 判断是否需要获取 markdown 文件
    function mdJudge (result) {
      if (result.markdown.md && result.markdown.filename) {
        store.dispatch('getGlobalAssets', { filename: result.markdown.filename })
             .then(({ data }) => {
               if (data) {
                 const blob = stringToBlob(data, 'text/x-markdown')
                 const file = blobToFile(blob, result.markdown.filename)
                 modelRef.mdFileList.push(file)
                 modelRef.rawContent = data
                 loading.value = false
               } else {
                 modelRef.rawContent = '获取文件失败'
                 loading.value = false
               }
             })
      } else {
        loading.value = false
        modelRef.rawContent = '未导入 markdown'
      }
    }

    // 删除 tag
    const handleTagClose = (removeTag) => {
      // 返回数组中不等于 removeTag 的元素
      modelRef.tags = modelRef.tags.filter(tag => tag !== removeTag)
    }

    // 添加 tag
    const handleAddTag = () => {
      const inputVal = modelRef.tagVal
      if (inputVal && modelRef.tags.indexOf(inputVal) === -1) {
        if (modelRef.tags.length < 5) {
          modelRef.tags = [...modelRef.tags, inputVal]
          Object.assign(modelRef, { tagVal: '' })
        } else {
          message.info('最多不超过5个标签')
        }
      }
    }

    // 提交
    const onSubmit = () => {
      // 表单验证
      validate().then(afterValidate).catch(() => {
        stepStatus.value = 'error'
      })
    }

    // 表单验证成功
    function afterValidate () {
      stepsCur.value = 1
      stepStatus.value = 'finish'
      dataProcess(toRaw(modelRef))
        .then(result => {
          stepsCur.value = 2
          stepStatus.value = 'finish'
          if (result) {
            releaseResult.display = true
            releaseResult.status = 'success'
            releaseResult.title = '发布预览成功'
            releaseResult['sub-title'] = '当前为待审核状态，点击下方按钮跳转到预览页面.'
            releaseResult._id = result.insertedId || route.query._id
          } else {
            releaseResult.status = 'error'
            releaseResult.title = '发布失败'
            releaseResult['sub-title'] = result
          }
        })
        .catch(() => {
          stepStatus.value = 'error'
        })
    }

    // 数据过滤
    function dataProcess (rawData) {
      rawData.operate.releaseTime = new Date().getTime()
      delete rawData.mdFileList
      delete rawData.loading
      delete rawData.imageUrl
      delete rawData.rawContent
      delete rawData.tagVal
      if (route.query.type === 'add') {
        return store.dispatch('addNewBlog', rawData)
      } else if (route.query.type === 'modify') {
        rawData._id = route.query._id
        return store.dispatch('modifyBlog', rawData)
      }
    }

    // 拖入的文件类型不符合
    const handleReject = (evt) => {
      message.error('仅支持 Markdown 文件')
    }

    // 是否引入 md 按钮
    const mdChange = () => {
      rulesRef.mdFileList[0].required = modelRef.markdown.md
    }

    // 上传 文件
    const uploadFile = (e) => {
      if (e.filename === 'md' && modelRef.mdFileList.length > 0) {
        modelRef.mdFileList.shift()
      } else if (e.filename === 'poster') {
        modelRef.loading = true
      }
      const formData = fileToFormData(e.file)
      apiService.upload(api.API_UPLOAD.POST_COMMON_UPLOAD, formData).then(result => {
        uploadSuccess(e.filename, result, e.file)
      }).catch(err => {
        uploadError(e.filename, err)
      })
    }

    // 上传文件失败
    function uploadError (type) {
      if (type === 'md') {
        modelRef.mdFileList = []
      } else if (type === 'poster') {
        modelRef.loading = false
      }
    }

    // 上传文件成功
    async function uploadSuccess (type, result, file) {
      if (type === 'md') {
        const blob = await fileToBlob(file)
        modelRef.rawContent = await blobToString(blob)
        modelRef.mdFileList[0].status = 'done'
        modelRef.markdown.filename = result.writeFileName
      } else if (type === 'poster') {
        modelRef.poster = result.writeFileName
        modelRef.imageUrl = await fileToUrl(file)
        modelRef.loading = false
      }
      message.success(`${result.filename} 上传成功.`)
    }

    // 预览博客
    const toDetail = () => {
      const url = router.resolve({
        name: 'BlogDetail',
        query: {
          _id: releaseResult._id
        }
      })
      window.open(url.href, '_blank')
    }

    const verify = () => {
      store.dispatch('putVerifyArticle', {
        _id: releaseResult._id,
        verify: true
      }).then(result => {
        releaseResult.display = false
        message.success('操作成功')
        back()
      })
    }

    // 返回
    const back = () => {
      router.push({
        name: 'Articles'
      })
    }

    return {
      formatDate,
      stepsCur,
      stepStatus,
      loading,
      releaseResult,
      validateInfos,
      modelRef,
      handleTagClose,
      handleAddTag,
      onSubmit,
      mdChange,
      handleReject,
      uploadFile,
      toDetail,
      verify,
      back,
      rawContent
    }
  }
}
</script>

<style lang="less">
</style>
