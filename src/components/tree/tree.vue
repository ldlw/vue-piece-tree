<template>
  <div :class="prefixCls" ref="treeWrap">
    <tree-node
      v-for="(item, i) in stateTree"
      :key="i"
      :data="item"
      visible
      :multiple="multiple"
      :show-checkbox="showCheckbox"
      :children-key="childrenKey">
    >
    </tree-node>
    <div :class="[prefixCls + '-empty']" v-if="!stateTree.length">
      {{ localeEmptyText }}
    </div>
  </div>
</template>

<script>
import treeNode from './node.vue'
import Emitter from '@/mixins/emitter'

const prefixCls = 'pie-tree'

export default {
  name: 'Tree',
  components: {
    treeNode
  },
  mixins: [Emitter],
  provide () {
    return { TreeInstance: this }
  },
  data () {
    return {
      prefixCls: prefixCls,
      stateTree: this.data,
      flatState: [],
      contextMenuVisible: false
    }
  },
  methods: {
    compileFlatState () { // so we have always a relation parent/children of each node
      let keyCounter = 0
      const childrenKey = this.childrenKey
      const flatTree = []
      function flattenChildren (node, parent) {
        node.nodeKey = keyCounter++
        flatTree[node.nodeKey] = { node: node, nodeKey: node.nodeKey }
        if (typeof parent !== 'undefined') {
          flatTree[node.nodeKey].parent = parent.nodeKey
          flatTree[parent.nodeKey][childrenKey].push(node.nodeKey)
        }

        if (node[childrenKey]) {
          flatTree[node.nodeKey][childrenKey] = []
          node[childrenKey].forEach(child => flattenChildren(child, node))
        }
      }
      this.stateTree.forEach(rootNode => {
        flattenChildren(rootNode)
      })
      return flatTree
    },
    handleContextmenu ({ data, event }) {
      if (this.contextMenuVisible) this.handleClickContextMenuOutside()
      this.$nextTick(() => {
        const $TreeWrap = this.$refs.treeWrap
        const TreeBounding = $TreeWrap.getBoundingClientRect()
        const position = {
          left: `${event.clientX - TreeBounding.left}px`,
          top: `${event.clientY - TreeBounding.top}px`
        }
        this.contextMenuStyles = position
        this.contextMenuVisible = true
        this.$emit('on-contextmenu', data, event, position)
      })
    },
    handleClickContextMenuOutside () {
      this.contextMenuVisible = false
    },
    handleCheck ({ checked, nodeKey }) {
      if (!this.flatState[nodeKey]) return
      const node = this.flatState[nodeKey].node
      this.$set(node, 'checked', checked)
      this.$set(node, 'indeterminate', false)

      this.updateTreeUp(nodeKey) // propagate up
      this.updateTreeDown(node, { checked, indeterminate: false }) // reset `indeterminate` when going down

      this.$emit('on-check-change', this.getCheckedNodes(), node)
    },
    updateTreeDown (node, changes = {}) {
      if (this.checkStrictly) return

      for (const key in changes) {
        this.$set(node, key, changes[key])
      }
      if (node[this.childrenKey]) {
        node[this.childrenKey].forEach(child => {
          this.updateTreeDown(child, changes)
        })
      }
    },
    getCheckedNodes () {
      /* public API */
      return this.flatState.filter(obj => obj.node.checked).map(obj => obj.node)
    },
    etCheckedAndIndeterminateNodes () {
      /* public API */
      return this.flatState.filter(obj => (obj.node.checked || obj.node.indeterminate)).map(obj => obj.node)
    },
    getSelectedNodes () {
      /* public API */
      return this.flatState.filter(obj => obj.node.selected).map(obj => obj.node)
    },
    handleSelect (nodeKey) {
      if (!this.flatState[nodeKey]) return
      const node = this.flatState[nodeKey].node
      if (!this.multiple) { // reset previously selected node
        const currentSelectedKey = this.flatState.findIndex(obj => obj.node.selected)
        if (currentSelectedKey >= 0 && currentSelectedKey !== nodeKey) this.$set(this.flatState[currentSelectedKey].node, 'selected', false)
      }
      this.$set(node, 'selected', !node.selected)

      this.$emit('on-select-change', this.getSelectedNodes(), node)
    },
    rebuildTree () { // only called when `data` prop changes
      const checkedNodes = this.getCheckedNodes()
      checkedNodes.forEach(node => {
        this.updateTreeDown(node, { checked: true })
        // propagate upwards
        const parentKey = this.flatState[node.nodeKey].parent
        if (!parentKey && parentKey !== 0) return
        const parent = this.flatState[parentKey].node
        const childHasCheckSetter = typeof node.checked !== 'undefined' && node.checked
        // eslint-disable-next-line eqeqeq
        if (childHasCheckSetter && parent.checked != node.checked) {
          this.updateTreeUp(node.nodeKey) // update tree upwards
        }
      })
    },
    updateTreeUp (nodeKey) {
      const parentKey = this.flatState[nodeKey].parent
      if (typeof parentKey === 'undefined' || this.checkStrictly) return

      const node = this.flatState[nodeKey].node
      const parent = this.flatState[parentKey].node
      // eslint-disable-next-line eqeqeq
      if (node.checked == parent.checked && node.indeterminate == parent.indeterminate) return // no need to update upwards

      // eslint-disable-next-line eqeqeq
      if (node.checked == true) {
        this.$set(parent, 'checked', parent[this.childrenKey].every(node => node.checked))
        this.$set(parent, 'indeterminate', !parent.checked)
      } else {
        this.$set(parent, 'checked', false)
        this.$set(parent, 'indeterminate', parent[this.childrenKey].some(node => node.checked || node.indeterminate))
      }
      this.updateTreeUp(parentKey)
    }
  },
  created () {
    this.flatState = this.compileFlatState()
    this.rebuildTree()
  },
  computed: {
    localeEmptyText () {
      return this.emptyText
    }
  },
  mounted () {
    this.$on('on-check', this.handleCheck)
    this.$on('on-selected', this.handleSelect)
    this.$on('toggle-expand', node => this.$emit('on-toggle-expand', node))
    this.$on('contextmenu', this.handleContextmenu)
  },
  props: {
    data: {
      type: Array,
      default () {
        return []
      }
    },
    // 是否支持多选
    multiple: {
      type: Boolean,
      default: false
    },
    // 是否显示多选框
    showCheckbox: {
      type: Boolean,
      default: false
    },
    // 定义子节点键
    childrenKey: {
      type: String,
      default: 'children'
    },
    expandNode: {
      type: Boolean,
      default: false
    },
    checkStrictly: {
      type: Boolean,
      default: false
    },
    // 当开启 showCheckbox 时，如果开启 checkDirectly，select 将强制转为 check 事件
    checkDirectly: {
      type: Boolean,
      default: false
    },
    emptyText: {
      type: String
    }
  }
}
</script>

<style>

</style>
