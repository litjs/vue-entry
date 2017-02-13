import {
  Vue
} from './lib'
import {getState} from './stateManager'
import {error} from './log'

// all the vue components's instance saved in instanceContainer object.
var instanceContainer = {}

Vue.mixin({
  beforeCreate(){
    this.$store = getState()
  },
  created() {
    var currentComponentName = this.$options._vue_component_name

    if (currentComponentName) {
      instanceContainer[currentComponentName] = this
    }
  },

  beforeDestroy() {
    var currentComponentName = this.$options._vue_component_name

    if (currentComponentName) {
      instanceContainer[currentComponentName] = null
    }
  }
})

// Vue.invoke implementation
function invoke(methodPath, ...args) {
  var [componentName, methodName] = methodPath.split('.')
  if (!instanceContainer[componentName]) {
    error(`${componentName}.vue file not exist！`, true)
    return
  }

  if (typeof instanceContainer[componentName][methodName] !== 'function') {
    error(` no method name:${methodName} in ${componentName}.vue 's methods option！`, true)
    return
  }

  return instanceContainer[componentName][methodName](...args)
}

// get component private state(state in data option)
function getData(componentName) {
  if (!instanceContainer[componentName]) {
    error(`${componentName}.vue not exist！`, true)
    return
  }

  return instanceContainer[componentName].$data
}

export {invoke, getData}
