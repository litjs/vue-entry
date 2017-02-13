import {
  Vue,
  i18n,
} from './lib'

import {boot} from './boot'
import {invoke, getData} from './instanceManager'

import {
  setConfig,
  getConfig,
  setStore,
  getState
} from './utils'

import {
  setConfig as setConfigForLog,
  debug,
  error,
  initLog
} from './log'

Vue.getState = getState // get vuex state
Vue.invoke = invoke // invoke method in vue component methods options.
Vue.getData = getData // get vue component data options value.
Vue.beforeInit = null // callback before app start >params {config，router, routes，rootApp, next}

// Vue extension for debug
Vue.prototype.$debug = debug
Vue.prototype.$error = error

// method for auto entry file
window._PRIVATE__ = {}
window._PRIVATE__.startApp = startApp
window._PRIVATE__.initConfig = initConfig
window._PRIVATE__.initI18n = initI18n

// expose Vue global
window.Vue = Vue

// get stand alone config file asynchronous.
function initConfig() {
  return Vue.http.get('./config.json').then((res) => {
    var debugStatus = localStorage && typeof localStorage.getItem == 'function' && localStorage.getItem('debug')

    if (debugStatus) {
      res.data['DEBUG'] = true
    }

    setConfig(res.data)
    setConfigForLog(res.data)
  })
}

// get stand alone i18n file asynchronous.
function initI18n() {
  var langUrl = './' + (getConfig()['LANG'] || 'cn') + '.lang.json'
  return Vue.http.get(langUrl).then((res) => {
    var lang = getConfig()['LANG'] || 'cn'
    var locales = {}
    locales[lang] = res.data
    Vue.use(i18n, {
      lang: lang,
      locales: locales
    })
  })
}

// Start app
function startApp(unused, store, routes) {
  setStore(store)
  initLog()
  boot(store, routes)
}
