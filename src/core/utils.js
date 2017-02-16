let gConfig = {}
let gRouter = null
let gAppRoot = null
let gStore = null

function preLoadResource(next, routes) {
  var beforeInit = getUserConfig('beforeInit')

  getFixedMainLayout()
  setTitle()

  if (beforeInit) {
    beforeInit({
      config: gConfig,
      router: gRouter,
      routes: routes,
      next: next
    })
  } else {
    next()
  }

}

function getUserConfig(key) {
  return window.Vue[key]
}

// set page title
function setTitle() {
  window.document.getElementsByTagName('title').innerTHML = gConfig['APP_NAME']
}

function getFixedMainLayout() {
  var header = document.createElement('header')
  var main = document.createElement('main')
  var footer = document.createElement('footer')

  main.innerHTML = '<app></app>'

  window.document.body.appendChild(header)
  window.document.body.appendChild(main)
  window.document.body.appendChild(footer)
}

function getState(vuexName) {
  var vuex = gStore.modules[vuexName]

  return vuex && vuex.state
}

function getConfig() {
  return gConfig || {}
}

function setConfig(config) {
  gConfig = config
}

function getAppRoot() {
  return gAppRoot
}

function setAppRoot(appRoot) {
  gAppRoot = appRoot
}

function getRouter() {
  return gRouter
}

function setRouter(router) {
  gRouter = router
}

function getStore() {
  return gStore
}

function setStore(store) {
  gStore = store
}

function addState(){

}

export {
  getConfig,
  setConfig,
  setRouter,
  getRouter,
  setAppRoot,
  getAppRoot,
  setStore,
  getStore,
  preLoadResource,
  getState
}
