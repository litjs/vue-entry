import {
  Vue
} from './lib'

import {boot} from './boot'
import {invoke, getData, getComponent} from './instanceManager'
import locales from './locales'
import './flexible'

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

window.$entry = {}
window[window._$vueEntry_exportName] = window.$entry
$entry.getState = getState // get vuex state
$entry.invoke = invoke // invoke method in vue component methods options.
$entry.getData = getData // get vue component data options value.
$entry.getComponent = getComponent // get vue component instance.
$entry.beforeInit = null // callback before app start >params {config，router, routes，rootApp, next}

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

    return res.data
  })
}

// get stand alone i18n file asynchronous.
function initI18n() {
  var langUrl = './' + (getConfig()['LANG'] || window.__i18n_list[0]) + '.lang.json'
  return Vue.http.get(langUrl).then((res) => {
    var lang = getConfig()['LANG'] || getConfig()['lang'] || 'zh_CN'
    Vue.config.lang = lang

    Vue.locale(lang, res.data)
  })
}

// Start app
function startApp(unused, store, routes, pluginInitCallback) {
  setStore(store)
  initLog()
  boot(store, routes, pluginInitCallback)
}
