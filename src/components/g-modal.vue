<!--
  这是全局模态框组件
  可自定义挂载点container
-->

<template>

  <a-modal v-model:visible="modalVisible"
           :getContainer="() => modalContainer"
           :title="title"
           @cancel="modalClose"
  >

    <!--  slot s  -->
    <slot name="modal-content"/>
    <!--  slot e  -->

    <template #footer>
      <a-button type="primary" @click="modalClose">确定</a-button>
    </template>

  </a-modal>

</template>

<script>

import { computed } from 'vue'

export default {
  name: 'g-modal',
  props: ['visible', 'container', 'title'],
  emits: ['close'],
  setup (props, { emit }) {
    return {
      modalClose: () => emit('close'),
      modalVisible: computed(() => props.visible),
      modalContainer: computed(() => props.container())
      // modalVisible,
      // modalContainer
    }
  }
}
</script>

<style lang="less">
</style>
