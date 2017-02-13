import {
  Vue,
  VueRouter,
  VueResource
} from './lib'
import {
  preLoadResource,
  setRouter,
  getConfig,
  setAppRoot,
  setStore
} from './utils'

import {registerState} from './stateManager'

Vue.use(VueRouter)
Vue.use(VueResource)

function boot(store, routes) {
  var config = getConfig()

  const router = new VueRouter({
    root: '',
    linkActiveClass: 'active',
    hashbang: true,
    routes: routes
  })
  setRouter(router)

  var modules = store.modules

  Object.keys(modules).forEach((module) =>{
    registerState(module, modules[module].state)
  })

  var rootApp = new Vue({
    router,
    render: h => h('router-view'),
    data: () => ({
      config: config
    }),
  })

  setAppRoot(rootApp)



  preLoadResource(function () {
    rootApp.$mount(document.getElementsByTagName('app')[0])
  }, routes)
}

export {boot}
