<template>
  <collapse-transition :appear="appear">
    <ul :class="classes">
      <li @contextmenu.stop="handleContextmenu(data, $event)" @selectstart.stop="handlePreventSelect(data, $event)">
        <span :class="arrowClasses" @click="handleExpand">
          <i v-if="showArrow" :class="arrowType"></i>
          <i v-if="showLoading" class="fa fa-circle-o-notch pie-load-loop" aria-hidden="true"></i>
        </span>
        <Checkbox
          v-if="showCheckbox"
          :value="data.checked"
          :indeterminate="data.indeterminate"
          :disabled="data.disabled || data.disableCheckbox"
          @click.native.prevent="handleCheck"></Checkbox>
        <span :class="titleClasses" @click="handleClickNode">
          <Render v-if="data.render" :render="data.render" :data="data" :node="node"></Render>
          <Render v-else-if="isParentRender" :render="parentRender" :data="data" :node="node"></Render>
          <template v-else>{{ data.title }}</template>
        </span>
        <template v-if="data.expand">
          <tree-node
            :appear="appearByClickArrow"
            v-for="(item, i) in children"
            :key="i"
            :data="item"
            :multiple="multiple"
            :show-checkbox="showCheckbox"
            :children-key="childrenKey">
          >
          </tree-node>
        </template>
      </li>
    </ul>
  </collapse-transition>
</template>

<script>
import CollapseTransition from '../base/collapse-transition'
import Render from './render'
import { findComponentUpward } from '../../utils/assist'
import Emitter from '@/mixins/emitter'
const prefixCls = 'pie-tree'

export default {
  name: 'TreeNode',
  data () {
    return {
      prefixCls: prefixCls,
      appearByClickArrow: false
    }
  },
  inject: ['TreeInstance'],
  mixins: [Emitter],
  props: {
    data: {
      type: Object,
      default () {
        return {}
      }
    },
    appear: {
      type: Boolean,
      default: false
    },
    childrenKey: {
      type: String,
      default: 'children'
    },
    multiple: {
      type: Boolean,
      default: false
    },
    showCheckbox: {
      type: Boolean,
      default: false
    }
  },
  components: {
    CollapseTransition,
    Render
  },
  methods: {
    handleClickNode () {
      if (this.TreeInstance.expandNode) {
        if (this.showArrow) this.handleExpand()
      } else if (this.TreeInstance.selectNode) {
        this.handleSelect()
      }
    },
    handleSelect () {
      if (this.data.disabled) return
      if (this.TreeInstance.showCheckbox && this.TreeInstance.checkDirectly) {
        this.handleCheck()
      } else {
        this.dispatch('Tree', 'on-selected', this.data.nodeKey)
      }
    },
    handleExpand () {
      const item = this.data
      // if (item.disabled) return;

      // Vue.js 2.6.9 对 transition 的 appear 进行了调整，导致 初始化时无动画
      // 加此方法来判断通过点击箭头展开时，加 appear，否则初始渲染时 appear 为 false
      this.appearByClickArrow = true

      // async loading
      if (item[this.childrenKey].length === 0) {
        const tree = findComponentUpward(this, 'Tree')
        if (tree && tree.loadData) {
          this.$set(this.data, 'loading', true)
          tree.loadData(item, children => {
            this.$set(this.data, 'loading', false)
            if (children.length) {
              this.$set(this.data, this.childrenKey, children)
              this.$nextTick(() => this.handleExpand())
            }
          })
          return
        }
      }

      if (item[this.childrenKey] && item[this.childrenKey].length) {
        this.$set(this.data, 'expand', !this.data.expand)
        this.dispatch('Tree', 'toggle-expand', this.data)
      }
    },
    handleContextmenu (data, event) {
      if (data.contextmenu) {
        event.preventDefault()
        this.dispatch('Tree', 'contextmenu', { data, event })
      }
    },
    handlePreventSelect (data, event) {
      if (data.contextmenu) {
        event.preventDefault()
      }
    },
    handleCheck () {
      if (this.data.disabled) return
      const changes = {
        checked: !this.data.checked && !this.data.indeterminate,
        nodeKey: this.data.nodeKey
      }
      this.dispatch('Tree', 'on-check', changes)
    }
  },
  computed: {
    classes () {
      return [
        `${prefixCls}-children`
      ]
    },
    arrowClasses () {
      return [
        `${prefixCls}-arrow`,
        {
          [`${prefixCls}-arrow-disabled`]: this.data.disabled,
          [`${prefixCls}-arrow-open`]: this.data.expand
        }
      ]
    },
    titleClasses () {
      return [
        `${prefixCls}-title`,
        {
          [`${prefixCls}-title-selected`]: this.data.selected
        }
      ]
    },
    showArrow () {
      return (this.data[this.childrenKey] && this.data[this.childrenKey].length) ||
      ('loading' in this.data && !this.data.loading)
    },
    showLoading () {
      return 'loading' in this.data && this.data.loading
    },
    children () {
      return this.data[this.childrenKey]
    },
    isParentRender () {
      const Tree = findComponentUpward(this, 'Tree')
      return Tree && Tree.render
    },
    arrowType () { // iconfont icon-arrow-right
      const type = 'iconfont icon-arrow-right'

      // if (this.$PIECE) {
      //   if (this.$PIECE.tree.customArrow) {
      //     type = ''
      //   } else if (this.$PIECE.tree.arrow) {
      //     type = this.$PIECE.tree.arrow
      //   }
      // }
      return type
    },
    parentRender () {
      const Tree = findComponentUpward(this, 'Tree')
      if (Tree && Tree.render) {
        return Tree.render
      } else {
        return null
      }
    },
    node () {
      const Tree = findComponentUpward(this, 'Tree')
      if (Tree) {
        // 将所有的 node（即flatState）和当前 node 都传递
        return [Tree.flatState, Tree.flatState.find(item => item.nodeKey === this.data.nodeKey)]
      } else {
        return []
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
