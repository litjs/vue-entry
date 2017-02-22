import {
  Vue,
  Vuex,
  VueRouter,
  VueResource,
  VueI18n,
} from './lib'
import { sync } from 'vuex-router-sync'
import {
  preLoadResource,
  setRouter,
  getConfig,
  setAppRoot,
  setStore
} from './utils'

Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(VueI18n)

function boot(store, routes, pluginInitCallback) {
  var config = getConfig()

  const router = new VueRouter({
    root: '',
    linkActiveClass: 'active',
    hashbang: true,
    routes: routes
  })
  setRouter(router)

  let vuexStore = new Vuex.Store(store)
  window.$entry.store = vuexStore
  window.$entry.router = router

  sync(vuexStore, router)

  var modules = store.modules

  pluginInitCallback && pluginInitCallback()

  var rootApp = new Vue({
    store: vuexStore,
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
