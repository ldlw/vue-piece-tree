import Tree from './components/tree'
import Icon from './components/icon'
import Checkbox from './components/checkbox'

const components = {
  Tree,
  Icon,
  Checkbox,
  CheckboxGroup: Checkbox.Group
}

export default (Vue, opts = {}) => {
  Object.keys(components).forEach(key => {
    Vue.component(key, components[key])
  })

  Vue.prototype.$PIECE = {
    size: opts.size || '',
    tree: {
      arrow: opts.tree ? opts.tree.arrow ? opts.tree.arrow : '' : '',
      customArrow: opts.tree ? opts.tree.customArrow ? opts.tree.customArrow : '' : '',
      arrowSize: opts.tree ? opts.tree.arrowSize ? opts.tree.arrowSize : '' : ''
    }
  }
}
