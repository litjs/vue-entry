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
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _lib = __webpack_require__(2);

	var _boot = __webpack_require__(3);

	var _instanceManager = __webpack_require__(6);

	var _locales = __webpack_require__(8);

	var _locales2 = _interopRequireDefault(_locales);

	var _computeRootFontSize = __webpack_require__(9);

	var _utils = __webpack_require__(5);

	var _log = __webpack_require__(7);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	window.$entry = {};
	window[window._$vueEntry_exportName] = window.$entry;
	$entry.getState = _utils.getState; // get vuex state
	$entry.invoke = _instanceManager.invoke; // invoke method in vue component methods options.
	$entry.getData = _instanceManager.getData; // get vue component data options value.
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

	// mobile rem root footsize setting
	if (window.$entry_APP_DESIGN_SIZE) {
	  (0, _computeRootFontSize.computeRootSize)(window, window.$entry_APP_DESIGN_SIZE);
	}

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
	  var langUrl = './' + ((0, _utils.getConfig)()['LANG'] || 'zh_CN') + '.lang.json';
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

/***/ },
/* 2 */
/***/ function(module, exports) {

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

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 4 */
/***/ function(module, exports) {

	exports.sync = function (store, router, options) {
	  var moduleName = (options || {}).moduleName || 'route'

	  store.registerModule(moduleName, {
	    state: cloneRoute(router.currentRoute),
	    mutations: {
	      'router/ROUTE_CHANGED': function (state, transition) {
	        store.state[moduleName] = cloneRoute(transition.to, transition.from)
	      }
	    }
	  })

	  var isTimeTraveling = false
	  var currentPath

	  // sync router on store change
	  store.watch(
	    function (state) { return state[moduleName] },
	    function (route) {
	      if (route.fullPath === currentPath) {
	        return
	      }
	      isTimeTraveling = true
	      currentPath = route.fullPath
	      router.push(route)
	    },
	    { sync: true }
	  )

	  // sync store on router navigation
	  router.afterEach(function (to, from) {
	    if (isTimeTraveling) {
	      isTimeTraveling = false
	      return
	    }
	    currentPath = to.fullPath
	    store.commit('router/ROUTE_CHANGED', { to: to, from: from })
	  })
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


/***/ },
/* 5 */
/***/ function(module, exports) {

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
	  window.document.getElementsByTagName('title').innerTHML = gConfig['APP_NAME'];
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

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getData = exports.invoke = undefined;

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

	exports.invoke = invoke;
	exports.getData = getData;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

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

/***/ },
/* 8 */
/***/ function(module, exports) {

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

/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/*
	 # 按照宽高比例设定html字体, width=device-width initial-scale=1版
	 # @pargam win 窗口window对象
	 # @pargam option{
	 designWidth: 设计稿宽度，必须
	 designHeight: 设计稿高度，不传的话则比例按照宽度来计算，可选
	 designFontSize: 设计稿宽高下用于计算的字体大小，默认20，可选
	 callback: 字体计算之后的回调函数，可选
	 }
	 # return Boolean;
	 # xiaoweili@tencent.com
	 # ps:请尽量第一时间运行此js计算字体
	 */

	function computeRootSize(win, option) {
	  var count = 0,
	      designWidth = option.designWidth,
	      designHeight = option.designHeight || 0,
	      designFontSize = option.designFontSize || 20,
	      callback = option.callback || null,
	      root = document.documentElement,
	      body = document.body,
	      rootWidth,
	      newSize,
	      t,
	      self;
	  root.style.width = "100%";
	  //返回root元素字体计算结果
	  function _getNewFontSize() {
	    var scale = designHeight !== 0 ? Math.min(win.innerWidth / designWidth, win.innerHeight / designHeight) : win.innerWidth / designWidth;
	    return parseInt(scale * 10000 * designFontSize) / 10000;
	  }
	  !function () {
	    rootWidth = root.getBoundingClientRect().width;
	    //self = self ? self : arguments.callee;
	    //如果此时屏幕宽度不准确，就尝试再次获取分辨率，只尝试20次，否则使用win.innerWidth计算
	    if (rootWidth !== win.innerWidth && count < 20) {
	      win.setTimeout(function () {
	        count++;
	        computeRootSize(win, option);
	      }, 0);
	    } else {
	      newSize = _getNewFontSize();
	      //如果css已经兼容当前分辨率就不管了
	      if (newSize + 'px' !== getComputedStyle(root)['font-size']) {
	        root.style.fontSize = newSize + "px";
	        return callback && callback(newSize);
	      }
	    }
	  }();
	  //横竖屏切换的时候改变fontSize，根据需要选择使用
	  win.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function () {
	    clearTimeout(t);
	    t = setTimeout(function () {
	      computeRootSize(win, option);
	    }, 300);
	  }, false);
	}

	exports.computeRootSize = computeRootSize;

/***/ }
/******/ ]);