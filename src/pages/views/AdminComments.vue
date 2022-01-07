<template>
  <div class="comments-container">
    <a-table
      :data-source="store.state.g.comments"
      :rowKey="record => record._id"
      :columns="columns"
      :bordered="false"
      :scroll="{ x: 800 }"
      size="default"
    >
      <template #linkId="{record}">
        <router-link v-if="record.articleInfo" :style="{color: '#1890ff'}"
                     :to="{ name: 'BlogDetail', query: {_id: record.articleInfo._id} }">
          {{ textClip(record.articleInfo ? record.articleInfo.title : '') }}
        </router-link>
        <span v-else>主页</span>
      </template>
      <template #releaseTime="{ text: releaseTime }">
        {{ formatDate(releaseTime) }}
      </template>
      <template #author="{ text: author }">
        IP: {{ author.IPAddress }}
        <br>
        <span v-if="author.position">
          位置: {{ author.position.result.Country + author.position.result.Province + author.position.result.City }}
        </span>
      </template>
      <template #like="{ record: {like, dislike} }">
        赞: {{ like.sum }}
        <br>
        踩: {{ dislike.sum }}
      </template>
      <template #verify="{ text: verify }">
        <CheckCircleOutlined :style="{color: '#389e0d'}" v-if="verify"/>
        <ExclamationCircleOutlined :style="{color: 'rgb(240,120,80)'}" v-else/>
        {{ verify ? '已发布' : '未审核' }}
      </template>
      <template #operate="{ record: {verify, _id} }">
        <a-dropdown :trigger="['click']">
          <a class="ant-dropdown-link" @click.prevent>
            更多
            <DownOutlined/>
            <!--            <MoreOutlined/>-->
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="deleteComments(_id)">
                <span>删除</span>
              </a-menu-item>
              <a-menu-divider/>
              <a-menu-item key="2" :disabled="verify" @click="verifyComments({_id, verify: true})">
                <span>审核</span>
              </a-menu-item>
              <a-menu-item key="3" :disabled="!verify" @click="verifyComments({_id, verify: false})">
                <span>撤回</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>
    </a-table>
  </div>
</template>

<script>
import { reactive } from 'vue'
import { useStore } from 'vuex'
import { formatDate, textClip } from '@/util'
import { CheckCircleOutlined, DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

export default {
  name: 'AdminComments',
  components: {
    DownOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined
  },
  setup () {
    const store = useStore()

    const columns = reactive([
      {
        title: '内容',
        dataIndex: 'content',
        key: 'content',
        ellipsis: true
      },
      {
        title: '发布时间',
        dataIndex: 'time',
        key: 'time',
        slots: { customRender: 'releaseTime' }
      },
      {
        title: '关联页面',
        key: 'link',
        dataIndex: 'link',
        slots: { customRender: 'link' }
      },
      {
        title: '关联文章',
        key: 'linkId',
        dataIndex: 'linkId',
        slots: { customRender: 'linkId' }
      },
      {
        title: '作者',
        key: 'author',
        dataIndex: 'author',
        slots: { customRender: 'author' },
        ellipsis: true
      },
      {
        title: '赞/踩',
        key: 'like',
        dataIndex: 'like',
        width: 100,
        slots: { customRender: 'like' }
      },
      {
        title: '状态',
        key: 'verify',
        dataIndex: 'verify',
        width: 120,
        slots: { customRender: 'verify' }
      },
      {
        title: '操作',
        key: 'operate',
        dataIndex: 'operate',
        slots: { customRender: 'operate' },
        fixed: 'right',
        width: 100
      }])

    store.dispatch('getAllComments')

    const verifyComments = ({
      _id,
      verify
    }) => {
      store.dispatch('putVerifyComments', {
        _id,
        verify
      }).then(({ error }) => {
        if (!error) {
          store.dispatch('getAllComments')
          message.success('操作成功')
        }
      })
    }

    const deleteComments = (_id) => {
      store.dispatch('deleteComments', { _id }).then(({ error }) => {
        if (!error) {
          store.dispatch('getAllComments')
          message.success('操作成功')
        }
      })
    }
    return {
      store,
      columns,
      formatDate,
      textClip,
      verifyComments,
      deleteComments
    }
  }
}
</script>

<style lang="less">
</style>
