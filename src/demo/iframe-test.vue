<template>
  <div>
    <h2 class="page-title">{{ isInIframe ? 'Iframe' : 'Top window' }}</h2>
    <div>
      <template v-if="isInIframe">
        <el-button @click="handleSendToParentClick">向父窗口发数据</el-button>
        <el-button @click="handleOpenParentDialogClick">打开父窗口弹窗</el-button>
      </template>
      <template v-else>
        <el-button @click="handleSendToChildClick">向子窗口发数据</el-button>
      </template>
      <el-button @click="handleOpenDialogClick">打开dialog</el-button>
    </div>
    <el-dialog
      :visible.sync="isDialogVisible"
      :title="isInIframe ? 'iframe 中的弹窗' : '父窗口中的弹窗'"
    >
      <div>这是弹窗的内容</div>
    </el-dialog>
    <div class="row">
      <div class="col-3">
        <h3>Draggable 1</h3>

        <!-- 数据中转站 -->
        <template v-if="isInIframe">
          <draggable v-model="tmpData" item-key="id" group="people" class="tmp-draggable">
            <div v-for="item in tmpData" :key="item.id" :id="`tmp-${item.id}`">
              {{ item.name }}
            </div>
          </draggable>
        </template>

        <draggable
          :clone="handleDragClone"
          class="list-group"
          :list="list1"
          group="people"
          ghost-class="page-ghost"
        >
          <div class="list-group-item" v-for="element in list1" :key="element.id">
            {{ element.name }} {{ element.id }}
          </div>
        </draggable>
      </div>

      <div class="col-3">
        <h3>Draggable 2</h3>
        <draggable
          :clone="handleDragClone"
          class="list-group"
          :list="list2"
          group="people"
          ghost-class="page-ghost"
        >
          <div class="list-group-item" v-for="element in list2" :key="element.id">
            {{ element.name }} {{ element.id }}
          </div>
        </draggable>
      </div>
    </div>
    <div class="iframe-container">
      <iframe
        ref="iframe"
        v-if="!$route.query.isChild"
        :src="`${iframePrefix}?isChild=1`"
        style="width: 90%; min-height: 400px"
      ></iframe>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import './bootstrap.min.css'

export default {
  name: 'two-lists',
  display: 'Two Lists',
  order: 1,
  components: {
    draggable,
  },
  data() {
    const isInIframe = this.$route.query.isChild
    return {
      isInIframe,
      isDialogVisible: false,
      name: isInIframe ? 'child' : 'parent',
      iframePrefix: window.location.origin,
      list1: isInIframe
        ? [{ name: '刘备', id: 1 }]
        : [
            { name: '刘备', id: 1 },
            { name: '关羽', id: 2 },
            { name: '张飞', id: 3 },
            { name: '吕布', id: 4 },
          ],
      list2: isInIframe
        ? [{ name: '张三', id: 5 }]
        : [
            { name: '张三', id: 5 },
            { name: '李四', id: 6 },
            { name: '王五', id: 7 },
          ],
      tmpData: [],
      parent: null,
    }
  },
  mounted() {
    window.addEventListener('message', this.handleMsg)
    if (this.isInIframe) {
      window.lctest = this
      window.parent.postMessage('catch-me')
    }
  },
  methods: {
    handleOpenParentDialogClick() {
      this.parent.handleOpenDialogClick()
    },
    setParent(p) {
      this.parent = p
    },
    handleOpenDialogClick() {
      this.isDialogVisible = true
    },
    processDragData(data) {
      console.info(`收到了数据`, data)
      this.tmpData.push(data)
      this.$nextTick(() => this.dispatchDragEl(data.id))
    },
    dispatchDragEl(id) {
      const dragEl = document.getElementById(`tmp-${id}`)
      const startEvt = new DragEvent('dragstart', { bubbles: true })
      const downEvt = new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        isPrimary: true,
      })
      // 这里触发 dragstart 事件之前，想要先触发 pointerdown 事件
      dragEl.dispatchEvent(downEvt)
      dragEl.dispatchEvent(startEvt)
    },

    handleDragClone(origin) {
      console.info(`clone`)
      console.info(origin)
      const ret = { ...origin, id: Date.now() }
      if (!this.isInIframe) {
        this.$refs.iframe.contentWindow.lctest.processDragData(ret)
      }
      return ret
    },
    handleMsg(e) {
      if (e.data?.type?.startsWith('webpack')) return
      if (e.data === 'catch-me') {
        console.info('got-you')
        this.$refs.iframe.contentWindow.lctest.setParent(this)
        return
      }
      console.info(`${this.name} message received`, e.data)
    },
    handleSendToChildClick() {
      this.$refs.iframe.contentWindow.postMessage('hello child')
    },
    handleSendToParentClick() {
      window.parent.postMessage('hello dad')
    },
  },
}
</script>

<style lang="less">
@ghost-line: 4px solid #1063f1;

.page-title {
  padding: 20px;
  text-align: center;
}

.page-ghost {
  width: 100%;
  height: 1px;
  overflow: hidden;
  border-bottom: @ghost-line;

  & > * {
    display: none;
  }
}

.iframe-container {
  text-align: center;
  margin: 20px;
}

.tmp-draggable {
  width: 0;
  height: 0;
}
</style>
