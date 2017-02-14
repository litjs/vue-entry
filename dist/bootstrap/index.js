'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _debounce = require('debounce');

var _debounce2 = _interopRequireDefault(_debounce);

var _jsBeautify = require('js-beautify');

var _jsBeautify2 = _interopRequireDefault(_jsBeautify);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var projectType = null;
var tempFileContents = {
  entryFiles: {}
};

exports.default = function (userConfig) {
  (0, _utils.setPath)(_path2.default);
  userConfig.langs = userConfig.langs || ['cn'];
  var entrys = {};

  projectType = (0, _utils.checkProjectType)(userConfig.src);

  generatorEntryFiles(_path2.default, userConfig, entrys);

  var watcher = _chokidar2.default.watch([_path2.default.resolve(userConfig.src) + '/pages/', _path2.default.resolve(userConfig.src) + '/components/'], {
    persistent: true
  });

  var watcher2 = _chokidar2.default.watch([_path2.default.resolve(userConfig.src) + '/pages/**/*.i18n.js'], {
    persistent: true
  });

  watcher.on('addDir', function () {
    reGeneratorEntryFiles(_path2.default, userConfig, entrys);
  }).on('unlinkDir', function () {
    reGeneratorEntryFiles(_path2.default, userConfig, entrys);
  }).on('unlink', function () {
    reGeneratorEntryFiles(_path2.default, userConfig, entrys);
  }).on('add', function () {
    reGeneratorEntryFiles(_path2.default, userConfig, entrys);
  });

  watcher2.on('change', function () {
    reGeneratorEntryFiles(_path2.default, userConfig, entrys);
  });

  return entrys;
};

function generatorEntryFiles(path, userConfig, entrys) {
  // appPathList 工程下所有app的主页面入口文件
  var appPathList = _glob2.default.sync(path.resolve(userConfig.src) + '/pages/*');

  // app入口文件模板
  var appEntryTemplate = _fs2.default.readFileSync(__dirname + '/entryTemplate.js', 'utf8');

  if (projectType === 'singleApp') {
    appPathList = ['.'];
  }

  appPathList.forEach(function (appPath) {
    var stat = _fs2.default.lstatSync(appPath);

    // 如果不是文件夹 则跳出 单app模式的'.'也是文件夹
    if (!stat.isDirectory()) {
      return;
    }

    var appName = appPath.replace(/.*\/pages\/([^\/]*)$/, '$1');

    // 在tempfile下创建每个应用单独的文件夹 用于存储应用的私有文件（如国际化文件等）
    var tempAppPath = __dirname + '/tempfiles/' + appName + '/';
    if (!_fs2.default.existsSync(tempAppPath)) {
      _fs2.default.mkdirSync(tempAppPath);
    }

    // 获取app下所有state文件路径列表
    var appStateFilesPath = _glob2.default.sync(path.resolve(userConfig.src) + ('/pages/' + appName + '/**/*.vuex.js')).concat(_glob2.default.sync(path.resolve(userConfig.src) + '/*.vuex.js')).concat(_glob2.default.sync(path.resolve(userConfig.src) + ('/pages/' + appName + '/**/*.state.js'))).concat(_glob2.default.sync(path.resolve(userConfig.src) + '/*.state.js'));

    // 获取app下的vue组件及components下的组件
    var appVueFilesPath = _glob2.default.sync(path.resolve(userConfig.src) + ('/pages/' + appName + '/**/*.vue')).concat(_glob2.default.sync(path.resolve(userConfig.src) + '/components/**/*.vue'));

    // 获取app下的使用的国际化文件路径列表
    var appI18nFilesPath = _glob2.default.sync(path.resolve(userConfig.src) + ('/pages/' + appName + '/**/*.i18n.js')).concat(_glob2.default.sync(path.resolve(userConfig.src) + '/*.i18n.js'));

    var indexHtmlFilePath = path.resolve(userConfig.src) + ('/pages/' + appName + '/index.html');
    var configFilePath = path.resolve(userConfig.src) + ('/pages/' + appName + '/config.json');

    var vueLibStatements = generateVueLibStatements();

    // 解析state文件路径 生成对应的state初始化语句
    var stateStatements = generateStateStatements(appStateFilesPath);

    var vueStatements = generateVueStatements(appVueFilesPath);

    var i18nStatements = generateI18nStatements(appI18nFilesPath, appName);

    var configStatements = generateConfigStatements(configFilePath);

    var routeStatement = generateRouteStatements(appName);

    // 框架代码 引用路径
    var vueEntryPath = userConfig.production ? '../../vue-entry' : '../../vue-entry';

    var fileContent = (0, _utils.templateReplace)(appEntryTemplate, {
      vue_lib: { content: vueLibStatements, statement: true },
      vue_entry: { content: vueEntryPath, relativePath: false, required: true },

      stateImportStatements: { content: stateStatements.import, statement: true },
      stateSetValueStatements: { content: stateStatements.setValue, statement: true },

      configRequireStatement: { content: configStatements.require, statement: true },
      configInitStatement: { content: configStatements.init, statement: true },

      vueComponentImportStatements: { content: vueStatements.import, statement: true },
      vueComponentSetValueStatements: { content: vueStatements.setValue, statement: true },

      i18nInitStatement: { content: i18nStatements.init, statement: true },
      i18nRequireStatements: { content: i18nStatements.require, statement: true },

      routes: { content: routeStatement, statement: true },
      indexHtml: { content: indexHtmlFilePath, relativePath: true, required: true }
    });

    var entryFilePath = __dirname + '/tempfiles/' + appName + '.js';

    // 判断入口文件是否已经存在， 如果存在切内容已过期 则重新写入（此时是为了防止对已经存在且内容未过期的入口文件重复写入触发webpack重新编译）
    if (tempFileContents[entryFilePath] != fileContent) {
      _fs2.default.writeFileSync(entryFilePath, fileContent);
      tempFileContents[entryFilePath] = fileContent;
    }

    entrys[appName + '/__main_entry__'] = entryFilePath;
  });

  function generateRouteStatements(appName) {
    var routeStatement = '';
    var routesjs = path.resolve(userConfig.src) + ('/pages/' + appName + '/routes.js');
    var indexVue = path.resolve(userConfig.src) + ('/pages/' + appName + '/index.vue');
    var indexVueFolder = path.resolve(userConfig.src) + ('/pages/' + appName + '/index/index.vue');

    if (_fs2.default.existsSync(routesjs)) {
      routeStatement = 'var routes = require(\'' + (0, _utils.relativePath)(routesjs) + '\').default';
    } else if (_fs2.default.existsSync(indexVue)) {
      routeStatement = 'var routes = [{path:\'/\', component: require(\'' + (0, _utils.relativePath)(indexVue) + '\')}]';
    } else if (_fs2.default.existsSync(indexVueFolder)) {
      routeStatement = 'var routes = [{path:\'/\', component: require(\'' + (0, _utils.relativePath)(indexVueFolder) + '\')}]';
    } else {
      (0, _utils.error)('没有找到routes.js或index.vue文件');
    }

    return routeStatement;
  }

  /**
   * 生成state初始化语句 STORE在appindex/index.js中已定义
   * @param  fileList state文件列表
   * @returns {{require: string, init: string}}
   */
  function generateStateStatements(fileList) {
    var uniqueIndex = 0;
    var importTpl = [];
    var setValueTpl = ['const STORE = {modules: {}};'];
    fileList.forEach(function (stateFile) {
      var filename = '';

      if (stateFile.indexOf('.state.js') > 0) {
        filename = stateFile.replace(/.*\/([^\/]*)\.state\.js/, '$1');
        (0, _utils.checkFileDuplicate)(fileList, filename, 'state.js');
      } else {
        filename = stateFile.replace(/.*\/([^\/]*)\.vuex\.js/, '$1');
        (0, _utils.checkFileDuplicate)(fileList, filename, 'vuex.js');
      }

      var uid = uniqueIndex++;
      importTpl.push('var ' + filename + 'Store' + uid + ' = require("' + (0, _utils.relativePath)(stateFile) + '");');
      setValueTpl.push('STORE.modules.' + filename + ' = ' + filename + 'Store' + uid + ';');
    });

    return {
      import: importTpl.join('\n'),
      setValue: setValueTpl.join('\n')
    };
  }

  /**
   * 如果config.json存在 则生成入口文件中config.json需要的语句
   * @param configFilePath config文件路径
   * @returns {{require: string, init: string}}
   */
  function generateConfigStatements(configFilePath) {
    var configStatements = { require: '', init: '' };

    if (_fs2.default.existsSync(configFilePath)) {
      configStatements.require = 'require("' + (0, _utils.relativePath)(configFilePath) + '")';
      configStatements.init = 'window._PRIVATE__.initConfig()';
    } else {
      configStatements.init = 'Promise.resolve()';
    }

    return configStatements;
  }

  /**
   * 如果国际化文件存在 则生成入口文件中初始化国际化需要的语句
   * @param appI18nFilesPath i18n文件列表
   * @param appName 应用名称
   * @returns {{require: string, init: string}}
   */
  function generateI18nStatements(appI18nFilesPath, appName) {
    var i18nStatements = { require: '', init: '' };

    if (appI18nFilesPath.length == 0) {
      i18nStatements.init = 'Promise.resolve()';
      return i18nStatements;
    }

    // 为app在tempfile文件夹中生成国际化文件
    generateI18nFile(appI18nFilesPath, appName);

    var importI18nArray = [];
    userConfig.langs.forEach(function (item) {
      importI18nArray.push('require("./' + appName + '/' + item + '.lang.json")');
    });

    i18nStatements.require = importI18nArray.join('\n');
    i18nStatements.init = 'window._PRIVATE__.initI18n()';

    return i18nStatements;
  }

  /**
   * 创建国际化文件，收集app下的国际化文件，按语言类型生成相应的国际化文件
   * @param fileList i18n文件列表
   * @param appName 应用名称
   */
  function generateI18nFile(fileList, appName) {
    var uniqueIndex = 0;
    var singleApp = projectType === 'singleApp';
    var i18nContainer = {};

    if (fileList.length === 0) {
      return;
    }

    fileList.forEach(function (i18nFile) {
      var filename = i18nFile.replace(/.*\/([^\/]*)\.i18n\.js/, '$1');
      (0, _utils.checkFileDuplicate)(fileList, filename, 'i18n.js');

      var exports = (0, _utils.translateEs6to5)(i18nFile);

      userConfig.langs.forEach(function (item) {
        if (singleApp) {
          i18nContainer[item] = i18nContainer[item] || {};
          i18nContainer[item][filename] = exports.default && exports.default[item] || {};
        } else {
          i18nContainer[appName] = i18nContainer[appName] || {};
          if (i18nContainer[appName][item]) {
            i18nContainer[appName][item][filename] = exports.default && exports.default[item] || {};
          } else {
            i18nContainer[appName][item] = {};
            i18nContainer[appName][item][filename] = exports.default && exports.default[item] || {};
          }
        }
      });
    });

    if (singleApp) {
      userConfig.langs.forEach(function (item) {
        var fileContent = _jsBeautify2.default.js_beautify(JSON.stringify(i18nContainer[item] || ''), { indent_size: 2 });
        var filePath = __dirname + '/tempfiles/' + item + '.lang.json';
        if (tempFileContents[filePath] != fileContent) {
          _fs2.default.writeFileSync(filePath, fileContent);
          tempFileContents[filePath] = fileContent;
        }
      });
    } else {
      Object.keys(i18nContainer).forEach(function (appName) {
        var appPath = __dirname + '/tempfiles/' + appName + '/';
        userConfig.langs.forEach(function (item) {
          var fileContent = _jsBeautify2.default.js_beautify(JSON.stringify(i18nContainer[appName][item] || ''), { indent_size: 2 });
          var filePath = appPath + item + '.lang.json';
          if (tempFileContents[filePath] != fileContent) {
            _fs2.default.writeFileSync(filePath, fileContent);
            tempFileContents[filePath] = fileContent;
          }
        });
      });
    }
  }

  /**
   * 生成全局注册vue组件需要的语句
   * @param appVueFilesPath 应用中所有vue组件的路径列表
   */
  function generateVueStatements(appVueFilesPath) {
    var vueStatements = { import: '', setValue: '' };

    if (userConfig.autoImportVueComponent === false) {
      return vueStatements;
    }

    var uniqueIndex = 0;
    var importTpl = [];
    var setValueTpl = [];
    appVueFilesPath.forEach(function (vueFile) {
      var filename = vueFile.replace(/.*\/([^\/]*)\.vue/, '$1');

      (0, _utils.checkFileDuplicate)(appVueFilesPath, filename, 'vue');
      (0, _utils.checkFileNameValid)(filename, 'vue');

      var uid = uniqueIndex++;
      var vueComponentName = filename + 'Component' + uid;
      importTpl.push('var ' + vueComponentName + ' = require("' + (0, _utils.relativePath)(vueFile) + '");');
      importTpl.push(vueComponentName + '._vue_component_name = \'' + filename + '\';');
      setValueTpl.push('Vue.component(' + vueComponentName + '.name || "' + filename + '", ' + vueComponentName + ');');
    });

    vueStatements.import = importTpl.join('\n');
    vueStatements.setValue = setValueTpl.join('\n');

    return vueStatements;
  }

  function generateVueLibStatements() {
    var vueLib = 'window.Vue = require(\'vue/dist/vue.min\')\nwindow.VueI18n = require(\'vue-i18n/dist/vue-i18n.min\')\nwindow.VueRouter  = require(\'vue-router/dist/vue-router.min\')\nwindow.VueResource  = require(\'vue-resource/dist/vue-resource.min\')';

    return userConfig.vueLibBuildIn === false ? '' : vueLib;
  }

  return entrys;
}

var reGeneratorEntryFiles = (0, _debounce2.default)(generatorEntryFiles, 200);