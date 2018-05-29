/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "http://localhost:8082/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _lib = __webpack_require__(2);

	var _boot = __webpack_require__(3);

	var _instanceManager = __webpack_require__(6);

	var _locales = __webpack_require__(8);

	var _locales2 = _interopRequireDefault(_locales);

	__webpack_require__(9);

	var _utils = __webpack_require__(5);

	var _log = __webpack_require__(7);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	window.$entry = {};
	window[window._$vueEntry_exportName] = window.$entry;
	$entry.getState = _utils.getState; // get vuex state
	$entry.invoke = _instanceManager.invoke; // invoke method in vue component methods options.
	$entry.getData = _instanceManager.getData; // get vue component data options value.
	$entry.getComponent = _instanceManager.getComponent; // get vue component instance.
	$entry.beforeInit = null; // callback before app start >params {config，router, routes，rootApp, next}

	// Vue extension for debug
	_lib.Vue.prototype.$debug = _log.debug;
	_lib.Vue.prototype.$error = _log.error;

	// method for auto entry file
	window._PRIVATE__ = {};
	window._PRIVATE__.startApp = startApp;
	window._PRIVATE__.initConfig = initConfig;
	window._PRIVATE__.initI18n = initI18n;

	// expose Vue global
	window.Vue = _lib.Vue;

	// get stand alone config file asynchronous.
	function initConfig() {
	  return _lib.Vue.http.get('./config.json').then(function (res) {
	    var debugStatus = localStorage && typeof localStorage.getItem == 'function' && localStorage.getItem('debug');

	    if (debugStatus) {
	      res.data['DEBUG'] = true;
	    }

	    (0, _utils.setConfig)(res.data);
	    (0, _log.setConfig)(res.data);

	    return res.data;
	  });
	}

	// get stand alone i18n file asynchronous.
	function initI18n() {
	  var langUrl = './' + ((0, _utils.getConfig)()['LANG'] || window.__i18n_list[0]) + '.lang.json';
	  return _lib.Vue.http.get(langUrl).then(function (res) {
	    var lang = (0, _utils.getConfig)()['LANG'] || (0, _utils.getConfig)()['lang'] || 'zh_CN';
	    _lib.Vue.config.lang = lang;

	    _lib.Vue.locale(lang, res.data);
	  });
	}

	// Start app
	function startApp(unused, store, routes, pluginInitCallback) {
	  (0, _utils.setStore)(store);
	  (0, _log.initLog)();
	  (0, _boot.boot)(store, routes, pluginInitCallback);
	}

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var Vue = window.Vue;
	var Vuex = window.Vuex;
	var VueI18n = window.VueI18n;
	var VueRouter = window.VueRouter;
	var VueResource = window.VueResource;

	exports.Vue = Vue;
	exports.Vuex = Vuex;
	exports.VueI18n = VueI18n;
	exports.VueRouter = VueRouter;
	exports.VueResource = VueResource;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.boot = undefined;

	var _lib = __webpack_require__(2);

	var _vuexRouterSync = __webpack_require__(4);

	var _utils = __webpack_require__(5);

	_lib.Vue.use(_lib.VueRouter);
	_lib.Vue.use(_lib.VueResource);
	_lib.Vue.use(_lib.VueI18n);

	function boot(store, routes, pluginInitCallback) {
	  var config = (0, _utils.getConfig)();

	  var router = new _lib.VueRouter({
	    root: '',
	    linkActiveClass: 'active',
	    hashbang: true,
	    routes: routes
	  });
	  (0, _utils.setRouter)(router);

	  var vuexStore = new _lib.Vuex.Store(store);
	  window.$entry.store = vuexStore;
	  window.$entry.router = router;

	  (0, _vuexRouterSync.sync)(vuexStore, router);

	  var modules = store.modules;

	  pluginInitCallback && pluginInitCallback();

	  var rootApp = new _lib.Vue({
	    store: vuexStore,
	    router: router,
	    render: function render(h) {
	      return h('router-view');
	    },
	    data: function data() {
	      return {
	        config: config
	      };
	    }
	  });

	  (0, _utils.setAppRoot)(rootApp);

	  (0, _utils.preLoadResource)(function () {
	    rootApp.$mount(document.getElementsByTagName('app')[0]);
	  }, routes);
	}

	exports.boot = boot;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	exports.sync = function (store, router, options) {
	  var moduleName = (options || {}).moduleName || 'route'

	  store.registerModule(moduleName, {
	    namespaced: true,
	    state: cloneRoute(router.currentRoute),
	    mutations: {
	      'ROUTE_CHANGED': function ROUTE_CHANGED (state, transition) {
	        store.state[moduleName] = cloneRoute(transition.to, transition.from)
	      }
	    }
	  })

	  var isTimeTraveling = false
	  var currentPath

	  // sync router on store change
	  var storeUnwatch = store.watch(
	    function (state) { return state[moduleName]; },
	    function (route) {
	      var fullPath = route.fullPath;
	      if (fullPath === currentPath) {
	        return
	      }
	      if (currentPath != null) {
	        isTimeTraveling = true
	        router.push(route)
	      }
	      currentPath = fullPath
	    },
	    { sync: true }
	  )

	  // sync store on router navigation
	  var afterEachUnHook = router.afterEach(function (to, from) {
	    if (isTimeTraveling) {
	      isTimeTraveling = false
	      return
	    }
	    currentPath = to.fullPath
	    store.commit(moduleName + '/ROUTE_CHANGED', { to: to, from: from })
	  })

	  return function unsync () {
	    // On unsync, remove router hook
	    if (afterEachUnHook != null) {
	      afterEachUnHook()
	    }

	    // On unsync, remove store watch
	    if (storeUnwatch != null) {
	      storeUnwatch()
	    }

	    // On unsync, unregister Module with store
	    store.unregisterModule(moduleName)
	  }
	}

	function cloneRoute (to, from) {
	  var clone = {
	    name: to.name,
	    path: to.path,
	    hash: to.hash,
	    query: to.query,
	    params: to.params,
	    fullPath: to.fullPath,
	    meta: to.meta
	  }
	  if (from) {
	    clone.from = cloneRoute(from)
	  }
	  return Object.freeze(clone)
	}



/***/ }),
/* 5 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var gConfig = {};
	var gRouter = null;
	var gAppRoot = null;
	var gStore = null;

	function preLoadResource(next, routes) {
	  var beforeInit = getUserConfig('beforeInit');

	  getFixedMainLayout();
	  setTitle();

	  if (beforeInit) {
	    beforeInit({
	      config: gConfig,
	      router: gRouter,
	      routes: routes,
	      next: next
	    });
	  } else {
	    next();
	  }
	}

	function getUserConfig(key) {
	  return window.$entry[key];
	}

	// set page title
	function setTitle() {
	  window.document.title = gConfig['APP_NAME'] || window.document.title;
	}

	function getFixedMainLayout() {
	  var app = document.createElement('app');

	  window.document.body.appendChild(app);
	}

	function getState(vuexName) {
	  var vuex = gStore.modules[vuexName];

	  return vuex && vuex.state;
	}

	function getConfig() {
	  return gConfig || {};
	}

	function setConfig(config) {
	  gConfig = config;
	}

	function getAppRoot() {
	  return gAppRoot;
	}

	function setAppRoot(appRoot) {
	  gAppRoot = appRoot;
	}

	function getRouter() {
	  return gRouter;
	}

	function setRouter(router) {
	  gRouter = router;
	}

	function getStore() {
	  return gStore;
	}

	function setStore(store) {
	  gStore = store;
	}

	function addState() {}

	exports.getConfig = getConfig;
	exports.setConfig = setConfig;
	exports.setRouter = setRouter;
	exports.getRouter = getRouter;
	exports.setAppRoot = setAppRoot;
	exports.getAppRoot = getAppRoot;
	exports.setStore = setStore;
	exports.getStore = getStore;
	exports.preLoadResource = preLoadResource;
	exports.getState = getState;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getComponent = exports.getData = exports.invoke = undefined;

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _lib = __webpack_require__(2);

	var _log = __webpack_require__(7);

	// all the vue components's instance saved in instanceContainer object.
	var instanceContainer = {};

	_lib.Vue.mixin({
	  created: function created() {
	    var currentComponentName = this.$options._vue_component_name;

	    if (currentComponentName) {
	      instanceContainer[currentComponentName] = this;
	    }
	  },
	  beforeDestroy: function beforeDestroy() {
	    var currentComponentName = this.$options._vue_component_name;

	    if (currentComponentName) {
	      instanceContainer[currentComponentName] = null;
	    }
	  }
	});

	// Vue.invoke implementation
	function invoke(methodPath) {
	  var _instanceContainer$co;

	  var _methodPath$split = methodPath.split('.'),
	      _methodPath$split2 = _slicedToArray(_methodPath$split, 2),
	      componentName = _methodPath$split2[0],
	      methodName = _methodPath$split2[1];

	  if (!instanceContainer[componentName]) {
	    (0, _log.error)(componentName + '.vue file not exist\uFF01', true);
	    return;
	  }

	  if (typeof instanceContainer[componentName][methodName] !== 'function') {
	    (0, _log.error)(' no method name:' + methodName + ' in ' + componentName + '.vue \'s methods option\uFF01', true);
	    return;
	  }

	  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    args[_key - 1] = arguments[_key];
	  }

	  return (_instanceContainer$co = instanceContainer[componentName])[methodName].apply(_instanceContainer$co, args);
	}

	// get component private state(state in data option)
	function getData(componentName) {
	  if (!instanceContainer[componentName]) {
	    (0, _log.error)(componentName + '.vue not exist\uFF01', true);
	    return;
	  }

	  return instanceContainer[componentName].$data;
	}

	function getComponent(componentName) {
	  if (!instanceContainer[componentName]) {
	    (0, _log.error)(componentName + '.vue\u4E0D\u5B58\u5728\uFF01', true);
	    return;
	  }

	  return instanceContainer[componentName];
	}

	exports.invoke = invoke;
	exports.getData = getData;
	exports.getComponent = getComponent;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.initLog = exports.setConfig = exports.error = exports.debug = undefined;

	var _lib = __webpack_require__(2);

	var gConfig = {};

	function setConfig(config) {
	  gConfig = config;
	}

	function debug(string, sys) {
	  if (gConfig['DEBUG']) {
	    console && console.debug('[' + (sys ? 'SYS DEBUG' : 'DEV DEBUG') + '] ' + new Date().toISOString() + ' ' + (this && this.$options && this.$options._vue_component_name ? '[' + this.$options._vue_component_name + ']' : '') + ' ' + string);
	  }
	}

	function error(string, sys) {
	  console && console.debug('%c [' + (sys ? 'SYS ERROR' : 'DEV ERROR') + '] ' + new Date().toISOString() + ' [' + (this && this.$options && this.$options._vue_component_name ? '[' + this.$options._vue_component_name + ']' : '') + ' ' + string, 'color:red');
	}

	// Vue AJAX debug log
	function initVueAjaxLog() {
	  _lib.Vue.http.interceptors.push(function (request, next) {
	    debug('[begin ajax] url: ' + request.url + '  request:\n ' + JSON.stringify(request.body, null, 2), true);
	    next(function (response) {
	      debug('[end ajax] url: ' + response.url + '  request: ' + request.body + ' ' + (response.status !== 200 ? 'http status: ' + response.status : 'response:\n ' + JSON.stringify(response.body, null, 2) + ' '), true);
	    });
	  });
	}

	// VUE component log
	_lib.Vue.mixin({
	  created: function created() {
	    var _this = this;

	    var computed = this.$options.computed;
	    if (!computed) {
	      return;
	    }
	    var states = Object.keys(computed);
	    var currentComponentName = this.$options._vue_component_name;

	    if (currentComponentName && states.length > 0) {
	      var statesStringArray = [];

	      states && states.forEach(function (item) {
	        if (typeof computed[item] === 'function') {
	          try {
	            statesStringArray.push(item + ': ' + JSON.stringify(computed[item].bind(_this)(), null, 2));
	          } catch (e) {
	            statesStringArray.push(item + ': get state error');
	          }
	        }
	      });

	      debug('[Vue Component Create] name: ' + currentComponentName + ' state: \n-------------------------------------------------\n' + statesStringArray.join('\n\n') + '\n-------------------------------------------------', true);
	    }
	  },
	  beforeDestroy: function beforeDestroy() {
	    if (!this.$options.computed) {
	      return;
	    }
	    var states = Object.keys(this.$options.computed);
	    var currentComponentName = this.$options._vue_component_name;

	    if (currentComponentName && states.length > 0) {
	      debug('[Vue Component Destroy] name: ' + currentComponentName, true);
	    }
	  }
	});

	function initLog() {
	  initVueAjaxLog();
	}

	exports.debug = debug;
	exports.error = error;
	exports.setConfig = setConfig;
	exports.initLog = initLog;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	exports.default = function (i18n) {
	  var cn = {};
	  var en = {};
	  Object.keys(i18n).forEach(function (item) {
	    var cnObj = {};
	    var enObj = {};
	    cnObj[item] = i18n[item]['default']['cn'];
	    enObj[item] = i18n[item]['default']['en'];
	    $.extend(cn, cnObj);
	    $.extend(en, enObj);
	  });

	  return { cn: cn, en: en };
	};

/***/ }),
/* 9 */
/***/ (function(module, exports) {

	'use strict';

	(function (win, lib) {
	  var doc = win.document;
	  var docEl = doc.documentElement;
	  var metaEl = doc.querySelector('meta[name="viewport"]');
	  var flexibleEl = doc.querySelector('meta[name="flexible"]');
	  var dpr = 0;
	  var scale = 0;
	  var tid;
	  var flexible = lib.flexible || (lib.flexible = {});

	  if (metaEl) {
	    console.warn('将根据已有的meta标签来设置缩放比例');
	    var match = metaEl.getAttribute('content').match(/initial\-scale=([\d\.]+)/);
	    if (match) {
	      scale = parseFloat(match[1]);
	      dpr = parseInt(1 / scale);
	    }
	  } else if (flexibleEl) {
	    var content = flexibleEl.getAttribute('content');
	    if (content) {
	      var initialDpr = content.match(/initial\-dpr=([\d\.]+)/);
	      var maximumDpr = content.match(/maximum\-dpr=([\d\.]+)/);
	      if (initialDpr) {
	        dpr = parseFloat(initialDpr[1]);
	        scale = parseFloat((1 / dpr).toFixed(2));
	      }
	      if (maximumDpr) {
	        dpr = parseFloat(maximumDpr[1]);
	        scale = parseFloat((1 / dpr).toFixed(2));
	      }
	    }
	  }

	  if (!dpr && !scale) {
	    var isAndroid = win.navigator.appVersion.match(/android/gi);
	    var isIPhone = win.navigator.appVersion.match(/iphone/gi);
	    var devicePixelRatio = win.devicePixelRatio;
	    if (isIPhone) {
	      // iOS下，对于2和3的屏，用2倍的方案，其余的用1倍方案
	      if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {
	        dpr = 3;
	      } else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)) {
	        dpr = 2;
	      } else {
	        dpr = 1;
	      }
	    } else {
	      // 其他设备下，仍旧使用1倍的方案
	      dpr = 1;
	    }
	    scale = 1 / dpr;
	  }

	  docEl.setAttribute('data-dpr', dpr);
	  if (!metaEl) {
	    metaEl = doc.createElement('meta');
	    metaEl.setAttribute('name', 'viewport');
	    metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
	    if (docEl.firstElementChild) {
	      docEl.firstElementChild.appendChild(metaEl);
	    } else {
	      var wrap = doc.createElement('div');
	      wrap.appendChild(metaEl);
	      doc.write(wrap.innerHTML);
	    }
	  }

	  function refreshRem() {
	    var width = docEl.getBoundingClientRect().width;
	    if (width / dpr > 540) {
	      width = 540 * dpr;
	    }
	    var rem = width / 10;
	    docEl.style.fontSize = rem + 'px';
	    flexible.rem = win.rem = rem;
	  }

	  win.addEventListener('resize', function () {
	    clearTimeout(tid);
	    tid = setTimeout(refreshRem, 300);
	  }, false);
	  win.addEventListener('pageshow', function (e) {
	    if (e.persisted) {
	      clearTimeout(tid);
	      tid = setTimeout(refreshRem, 300);
	    }
	  }, false);

	  if (doc.readyState === 'complete') {
	    doc.body.style.fontSize = 12 * dpr + 'px';
	  } else {
	    doc.addEventListener('DOMContentLoaded', function (e) {
	      doc.body.style.fontSize = 12 * dpr + 'px';
	    }, false);
	  }

	  refreshRem();

	  flexible.dpr = win.dpr = dpr;
	  flexible.refreshRem = refreshRem;
	  flexible.rem2px = function (d) {
	    var val = parseFloat(d) * this.rem;
	    if (typeof d === 'string' && d.match(/rem$/)) {
	      val += 'px';
	    }
	    return val;
	  };
	  flexible.px2rem = function (d) {
	    var val = parseFloat(d) / this.rem;
	    if (typeof d === 'string' && d.match(/px$/)) {
	      val += 'rem';
	    }
	    return val;
	  };
	})(window, window['lib'] || (window['lib'] = {}));

/***/ })
/******/ ]);