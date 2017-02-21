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

	var _utils = __webpack_require__(4);

	var _log = __webpack_require__(7);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	_lib.Vue.getState = _utils.getState; // get vuex state
	_lib.Vue.invoke = _instanceManager.invoke; // invoke method in vue component methods options.
	_lib.Vue.getData = _instanceManager.getData; // get vue component data options value.
	_lib.Vue.beforeInit = null; // callback before app start >params {config，router, routes，rootApp, next}

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
	  var langUrl = './' + ((0, _utils.getConfig)()['LANG'] || 'cn') + '.lang.json';
	  return _lib.Vue.http.get(langUrl).then(function (res) {
	    var lang = (0, _utils.getConfig)()['LANG'] || (0, _utils.getConfig)()['lang'] || 'cn';
	    _lib.Vue.config.lang = lang;

	    _lib.Vue.locale(lang, res.data);
	  });
	}

	// Start app
	function startApp(unused, store, routes) {
	  (0, _utils.setStore)(store);
	  (0, _log.initLog)();
	  (0, _boot.boot)(store, routes);
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var Vue = window.Vue;
	var i18n = window.VueI18n;
	var VueRouter = window.VueRouter;
	var VueResource = window.VueResource;

	exports.Vue = Vue;
	exports.i18n = i18n;
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

	var _utils = __webpack_require__(4);

	var _stateManager = __webpack_require__(5);

	_lib.Vue.use(_lib.VueRouter);
	_lib.Vue.use(_lib.VueResource);
	_lib.Vue.use(_lib.i18n);

	function boot(store, routes) {
	  var config = (0, _utils.getConfig)();

	  var router = new _lib.VueRouter({
	    root: '',
	    linkActiveClass: 'active',
	    hashbang: true,
	    routes: routes
	  });
	  (0, _utils.setRouter)(router);

	  var modules = store.modules;

	  Object.keys(modules).forEach(function (module) {
	    (0, _stateManager.registerState)(module, modules[module].state);
	  });

	  var rootApp = new _lib.Vue({
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
	  return window.Vue[key];
	}

	// set page title
	function setTitle() {
	  window.document.getElementsByTagName('title').innerTHML = gConfig['APP_NAME'];
	}

	function getFixedMainLayout() {
	  var header = document.createElement('header');
	  var main = document.createElement('main');
	  var footer = document.createElement('footer');

	  main.innerHTML = '<app></app>';

	  window.document.body.appendChild(header);
	  window.document.body.appendChild(main);
	  window.document.body.appendChild(footer);
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
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getState = exports.registerState = undefined;

	var _lib = __webpack_require__(2);

	var stateManager = new _lib.Vue({
	  data: function data() {
	    return { gState: {} };
	  }
	});

	function registerState(name, state) {
	  stateManager.$set(stateManager.gState, name, state);
	}

	function getState() {
	  return stateManager.gState;
	}

	exports.registerState = registerState;
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

	var _stateManager = __webpack_require__(5);

	var _log = __webpack_require__(7);

	// all the vue components's instance saved in instanceContainer object.
	var instanceContainer = {};

	_lib.Vue.mixin({
	  beforeCreate: function beforeCreate() {
	    this.$store = (0, _stateManager.getState)();
	  },
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

/***/ }
/******/ ]);