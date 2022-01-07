<template>
  <div id="admin-articles">
    <!--  主面板 s -->
    <a-table
      :data-source="articles"
      :columns="columns"
      :bordered="false"
      :scroll="{ x: 800 }"
      size="default"
    >
      <template #releaseTime="{ text: releaseTime }">{{ formatDate(releaseTime) }}</template>
      <template #poster="{ text: poster }">
        <span v-if="poster">
          <FundViewOutlined style="color: #1890ff"/>
          <span
            style="color: #1890ff; font-weight: 400; cursor: pointer"
            @click="showPreview(store.state.api.API_ROOT.BASE_URL + '/assets?filename=' + poster)"
          >查看预览</span>
        </span>
        <span v-else>无</span>
      </template>
      <template #tags="{ text: tags }">
        <a-tag v-for="tag in tags" :key="tag" color="#5F2C4C">{{ tag }}</a-tag>
      </template>
      <template #markdown="{ record: { markdown } }">
        <FileDoneOutlined :style="{ color: '#389e0d' }" v-if="markdown.md"/>
        <FileOutlined :style="{ color: 'rgb(240,120,80)' }" v-else/>
        {{ markdown.md ? '已导入' : '未导入' }}
      </template>
      <template #verify="{ record: { verify } }">
        <CheckCircleOutlined :style="{ color: '#389e0d' }" v-if="verify"/>
        <ExclamationCircleOutlined :style="{ color: 'rgb(240,120,80)' }" v-else/>
        {{ verify ? '已发布' : '未审核' }}
      </template>
      <template #operate="{ record: { verify, _id } }">
        <a-dropdown :trigger="['click']">
          <a class="ant-dropdown-link" @click.prevent>
            更多
            <DownOutlined/>
            <!--            <MoreOutlined/>-->
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item key="0" @click="toDetail(_id)">
                <span>详情</span>
              </a-menu-item>
              <a-menu-item key="1" @click="toEdit(_id)">
                <span>编辑</span>
              </a-menu-item>
              <a-menu-item key="2" @click="deleteArticles(_id)">
                <span>删除</span>
              </a-menu-item>
              <a-menu-divider/>
              <a-menu-item key="3" :disabled="verify" @click="verifyArticles({ _id, verify: true })">
                <span>审核</span>
              </a-menu-item>
              <a-menu-item
                key="4"
                :disabled="!verify"
                @click="verifyArticles({ _id, verify: false })"
              >
                <span>撤回</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>
    </a-table>
    <!--  主面板 e -->
    <gModal @close="imgPreview = false" :visible="imgPreview" :container="getContainer" title="封面预览" >
      <template #modal-content>
        <img :src="curPoster" alt="封面" :style="{ 'max-width': '100%' }"/>
      </template>
    </gModal>
  </div>
</template>

<script>
import gModal from '@/components/g-modal'
import { computed, reactive, ref, toRaw } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { formatDate } from '@/util'
import { CheckCircleOutlined, DownOutlined, ExclamationCircleOutlined, FileDoneOutlined, FileOutlined, FundViewOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

export default {
  name: 'AdminArticles',
  components: {
    gModal,
    DownOutlined,
    FileDoneOutlined,
    FileOutlined,
    FundViewOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined
  },
  setup () {
    const router = useRouter()
    const store = useStore()
    const imgPreview = ref(false)
    const curPoster = ref('')
    const showPreview = poster => {
      curPoster.value = poster
      imgPreview.value = true
    }
    const articles = computed(() => {
      if (store.state.g.articles && store.state.g.articles.length > 0) {
        const data = toRaw(store.state.g.articles)
        data.forEach(item => {
          item.key = item._id
          item.tags = item.tags && item.tags.length > 0 ? item.tags : ['暂无']
        })
        return data
      } else {
        return []
      }
    })
    const columns = reactive([
      {
        title: '标题',
        dataIndex: 'title',
        key: 'title',
        slots: { customRender: 'title' },
        ellipsis: true
      },
      {
        title: '内容',
        dataIndex: 'content',
        key: 'content',
        ellipsis: true
      },
      {
        title: '发布时间',
        dataIndex: 'operate.releaseTime',
        key: 'operate.releaseTime',
        slots: { customRender: 'releaseTime' }
      },
      {
        title: '封面',
        key: 'poster',
        dataIndex: 'poster',
        slots: { customRender: 'poster' }
      },
      {
        title: '引入MD',
        key: 'markdown.md',
        dataIndex: 'markdown.md',
        slots: { customRender: 'markdown' }
      },
      {
        title: '热度',
        key: 'operate.fire',
        dataIndex: 'operate.fire'
      },
      {
        title: '标签',
        key: 'tags',
        dataIndex: 'tags',
        slots: { customRender: 'tags' }
      },
      {
        title: '状态',
        key: 'verify',
        dataIndex: 'verify',
        slots: { customRender: 'verify' }
      },
      {
        title: '操作',
        key: 'operate',
        dataIndex: 'operate',
        slots: { customRender: 'operate' },
        fixed: 'right',
        width: 80
      }])
    // 审核文章
    const verifyArticles = ({ _id, verify }) => {
      store.dispatch('putVerifyArticle', {
        _id,
        verify
      }).then(({ error }) => {
        if (!error) {
          store.dispatch('getArticles', 'all')
          message.success('操作成功')
        }
      })
    }
    // 删除文章
    const deleteArticles = (_id) => {
      store.dispatch('deleteArticles', { _id }).then(({ error }) => {
        if (!error) {
          store.dispatch('getArticles', 'all')
          message.success('操作成功')
        }
      })
    }
    // 跳转到编辑页面
    const toEdit = (_id) => {
      router.replace({
        name: 'ArticleEdit',
        query: {
          _id,
          type: 'modify'
        }
      })
    }
    // 跳转到详情页面
    const toDetail = (_id) => {
      const url = router.resolve({
        name: 'BlogDetail',
        query: {
          _id
        }
      })
      window.open(url.href, '_blank')
    }
    return {
      store,
      imgPreview,
      columns,
      articles,
      curPoster,
      getContainer: () => document.getElementById('admin-wrap'),
      showPreview,
      verifyArticles,
      deleteArticles,
      formatDate,
      toEdit,
      toDetail
    }
  }
}
</script>

<style lang="less">
</style>
