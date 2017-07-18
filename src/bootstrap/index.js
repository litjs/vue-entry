import glob from 'glob'
import fs from 'fs'
import _ from 'lodash'
import chokidar from 'chokidar'
import debounce from 'debounce'
import beautify from 'js-beautify'
import path from  'path'

import {
  checkFileDuplicate,
  checkFileNameValid,
  translateEs6to5,
  relativePath,
  templateReplace,
  isSingleAppMode,
  error,
  initConfig,
  getConfig
} from './utils'

var tempFileContents = {
  entryFiles: {}
}

let singleApp = null
var srcFolder = ''
let componentsFolder = ''

export default (userConfig) => {
  initConfig(userConfig)
  userConfig = getConfig(userConfig)
  let entrys = {}

  srcFolder = userConfig.srcFolder
  componentsFolder = userConfig.componentsFolder

  userConfig.langs = userConfig.langs || ['zh_CN']

  singleApp = isSingleAppMode(srcFolder)

  generatorEntryFiles(path, userConfig, entrys)

  let watcher = chokidar.watch([path.resolve(srcFolder)], {
    persistent: true
  });

  let watcher2 = chokidar.watch([path.resolve(srcFolder) + '/**/*.i18n.js'], {
    persistent: true
  });

  watcher
    .on('addDir', function () {
      reGeneratorEntryFiles(path, userConfig, entrys)
    })
    .on('unlinkDir', function () {
      reGeneratorEntryFiles(path, userConfig, entrys)
    })
    .on('unlink', function () {
      reGeneratorEntryFiles(path, userConfig, entrys)
    })
    .on('add', function () {
      reGeneratorEntryFiles(path, userConfig, entrys)
    })

  watcher2.on('change', function () {
    reGeneratorEntryFiles(path, userConfig, entrys)
  })

  return entrys
}

function generatorEntryFiles(path, userConfig, entrys) {
  // appPathList 工程下所有app的主页面入口文件
  let appPathList = null

  if (singleApp) {
    appPathList = ['.']
  } else {
    appPathList = glob.sync(path.resolve(srcFolder) + '/apps/*')
  }

  // app入口文件模板
  let appEntryTemplate = fs.readFileSync(__dirname + '/entryTemplate.js', 'utf8')

  appPathList.forEach(function (appPath) {
    let stat = fs.lstatSync(appPath)

    // 如果不是文件夹 则跳出 单app模式的'.'也是文件夹
    if (!stat.isDirectory()) {
      return
    }

    let appName = appPath.replace(/.*\/apps\/([^\/]*)$/, '$1')

    // 在tempfile下创建每个应用单独的文件夹 用于存储应用的私有文件（如国际化文件等）
    let tempAppPath = __dirname + '/tempfiles/' + appName + '/'
    if (!fs.existsSync(tempAppPath)) {
      fs.mkdirSync(tempAppPath)
    }

    var appRelativePath = singleApp ? '/.' : ('/apps/' + appName)

    // 获取app下所有state文件路径列表
    let appStateFilesPath = glob.sync(path.resolve(srcFolder) + `${appRelativePath}/**/*.vuex.js`)
      .concat(glob.sync(path.resolve(srcFolder) + `${appRelativePath}/**/*.state.js`))

    // 获取app下的vue组件及components下的组件
    let appVueFilesPath = glob.sync(path.resolve(srcFolder) + `${appRelativePath}/**/*.vue`)

    // 获取app下的使用的国际化文件路径列表
    let appI18nFilesPath = glob.sync(path.resolve(srcFolder) + `${appRelativePath}/**/*.i18n.js`)

    let indexHtmlFilePath = path.resolve(srcFolder) + `${appRelativePath}/index.html`
    let configFilePath = path.resolve(srcFolder) + `${appRelativePath}/config.json`
    let serviceFilePath = path.resolve(srcFolder) + `${appRelativePath}/service.js`

    // 多app模式时， components文件夹和全局国际化文件共享
    if(!singleApp){
      appVueFilesPath = appVueFilesPath.concat(glob.sync(path.resolve(componentsFolder) + '/**/*.vue'))
      appI18nFilesPath = appI18nFilesPath.concat(glob.sync(path.resolve(srcFolder) + '/*.i18n.js'))
    }


    let vueLibStatements = generateVueLibStatements()

    // 解析state文件路径 生成对应的state初始化语句
    let stateStatements = generateStateStatements(appStateFilesPath)

    let vueStatements = generateVueStatements(appVueFilesPath)

    let i18nStatements = generateI18nStatements(appI18nFilesPath, appName)

    let configStatements = generateConfigStatements(configFilePath)

    let routeStatement = generateRouteStatements(appName)

    let pluginStatement = generatePluginStatement();

    let exportNameStatement = generateExportNameStatement();

    let setRootFontSizeStatement = generateSetRootFontSizeStatement();

    let serviceStatement = generateServiceStatements(serviceFilePath)

    // 框架代码 引用路径
    let vueEntryPath = userConfig.production ? '../../vue-entry' : '../../vue-entry'

    let fileContent = templateReplace(appEntryTemplate, {
      setRootFontSize: {content: setRootFontSizeStatement, statement: true},
      vue_lib: {content: vueLibStatements, statement: true},
      vue_entry: {content: vueEntryPath, relativePath: false, required: true},
      plugins: {content: pluginStatement, statement: true},
      exportName: {content: exportNameStatement, statement: true},

      serviceStatement:{content: serviceStatement, statement: true},

      stateImportStatements: {content: stateStatements.import, statement: true},
      stateSetValueStatements: {content: stateStatements.setValue, statement: true},

      configRequireStatement: {content: configStatements.require, statement: true},
      configInitStatement: {content: configStatements.init, statement: true},

      vueComponentImportStatements: {content: vueStatements.import, statement: true},
      vueComponentSetValueStatements: {content: vueStatements.setValue, statement: true},

      i18nInitStatement: {content: i18nStatements.init, statement: true},
      i18nRequireStatements: {content: i18nStatements.require, statement: true},

      routes: {content: routeStatement, statement: true},
      indexHtml: {content: indexHtmlFilePath, relativePath: true, required: true}
    })

    let entryFilePath = `${__dirname}/tempfiles/${appName}.js`

    // 判断入口文件是否已经存在， 如果存在切内容已过期 则重新写入（此时是为了防止对已经存在且内容未过期的入口文件重复写入触发webpack重新编译）
    if (tempFileContents[entryFilePath] != fileContent) {
      fs.writeFileSync(entryFilePath, fileContent)
      tempFileContents[entryFilePath] = fileContent
    }

    entrys[appName + '/__main_entry__'] = entryFilePath
  })

  function generateRouteStatements(appName) {
    var routeStatement = ''
    var appRelativePath = singleApp ? '/.' : ('/apps/' + appName)
    var routesJs = path.resolve(srcFolder) + `${appRelativePath}/routes.js`
    var indexVue = path.resolve(srcFolder) + `${appRelativePath}/index.vue`
    var indexVueFolder = path.resolve(srcFolder) + `${appRelativePath}/index/index.vue`

    if (fs.existsSync(routesJs)) {
      routeStatement = `var routes = require('${relativePath(routesJs)}').default`
    } else if (fs.existsSync(indexVue)) {
      routeStatement = `var routes = [{path:'/', component: require('${relativePath(indexVue)}')}]`
    } else if (fs.existsSync(indexVueFolder)) {
      routeStatement = `var routes = [{path:'/', component: require('${relativePath(indexVueFolder)}')}]`
    } else {
      error('没有找到routes.js或index.vue文件')
    }

    return routeStatement
  }

  /**
   * 生成state初始化语句 STORE在appindex/index.js中已定义
   * @param  fileList state文件列表
   * @returns {{require: string, init: string}}
   */
  function generateStateStatements(fileList) {
    let uniqueIndex = 0
    let importTpl = []
    let setValueTpl = ['var STORE = {modules: {}};']
    fileList.forEach(function (stateFile) {
      let filename = ''

      if (stateFile.indexOf('.state.js') > 0) {
        filename = stateFile.replace(/.*\/([^\/]*)\.state\.js/, '$1')
        checkFileDuplicate(fileList, filename, 'state.js')
      } else {
        filename = stateFile.replace(/.*\/([^\/]*)\.vuex\.js/, '$1')
        checkFileDuplicate(fileList, filename, 'vuex.js')
      }

      let uid = uniqueIndex++
      importTpl.push(`var ${filename}Store${uid} = require("${relativePath(stateFile)}");`)
      setValueTpl.push(`STORE.modules.${filename} = ${filename}Store${uid};`)
    })

    return {
      import: importTpl.join('\n'),
      setValue: setValueTpl.join('\n')
    }
  }

  /**
   * 如果config.json存在 则生成入口文件中config.json需要的语句
   * @param configFilePath config文件路径
   * @returns {{require: string, init: string}}
   */
  function generateConfigStatements(configFilePath) {
    var configStatements = {require: '', init: ''}

    if (fs.existsSync(configFilePath)) {
      configStatements.require = 'require("' + relativePath(configFilePath) + '")'
      configStatements.init = 'window._PRIVATE__.initConfig()'
    } else {
      configStatements.init = 'Promise.resolve()'
    }

    return configStatements
  }

  /**
   * 如果国际化文件存在 则生成入口文件中初始化国际化需要的语句
   * @param appI18nFilesPath i18n文件列表
   * @param appName 应用名称
   * @returns {{require: string, init: string}}
   */
  function generateI18nStatements(appI18nFilesPath, appName) {
    var i18nStatements = {require: '', init: ''}

    if (appI18nFilesPath.length == 0) {
      i18nStatements.init = 'Promise.resolve()'
      return i18nStatements
    }

    // 为app在tempfile文件夹中生成国际化文件
    generateI18nFile(appI18nFilesPath, appName)

    var importI18nArray = []
    userConfig.langs.forEach(function (item) {
      importI18nArray.push(`require("./${appName}/${item}.lang.json")`)
    })

    i18nStatements.require = importI18nArray.join('\n')
    i18nStatements.init = 'window._PRIVATE__.initI18n()'

    return i18nStatements
  }

  /**
   * 创建国际化文件，收集app下的国际化文件，按语言类型生成相应的国际化文件
   * @param fileList i18n文件列表
   * @param appName 应用名称
   */
  function generateI18nFile(fileList, appName) {
    let uniqueIndex = 0
    var i18nContainer = {}

    if (fileList.length === 0) {
      return
    }

    fileList.forEach(function (i18nFile) {
      let filename = i18nFile.replace(/.*\/([^\/]*)\.i18n\.js/, '$1')
      checkFileDuplicate(fileList, filename, 'i18n.js')

      var exports = translateEs6to5(i18nFile);

      userConfig.langs.forEach(function (item) {
        if (singleApp) {
          i18nContainer[item] = i18nContainer[item] || {}
          i18nContainer[item][filename] = (exports.default && exports.default[item]) || {};
        } else {
          i18nContainer[appName] = i18nContainer[appName] || {}
          if (i18nContainer[appName][item]) {
            i18nContainer[appName][item][filename] = (exports.default && exports.default[item]) || {}
          } else {
            i18nContainer[appName][item] = {}
            i18nContainer[appName][item][filename] = (exports.default && exports.default[item]) || {}
          }
        }
      });
    })

    if (singleApp) {
      userConfig.langs.forEach(function (item) {
        var fileContent = beautify.js_beautify(JSON.stringify(i18nContainer[item] || ''), {indent_size: 2})
        var filePath = __dirname + '/tempfiles/' + item + '.lang.json'
        if (tempFileContents[filePath] != fileContent) {
          fs.writeFileSync(filePath, fileContent)
          tempFileContents[filePath] = fileContent
        }
      })
    } else {
      Object.keys(i18nContainer).forEach(function (appName) {
        var appPath = __dirname + '/tempfiles/' + appName + '/'
        userConfig.langs.forEach(function (item) {
          var fileContent = beautify.js_beautify(JSON.stringify(i18nContainer[appName][item] || ''), {indent_size: 2})
          var filePath = appPath + item + '.lang.json'
          if (tempFileContents[filePath] != fileContent) {
            fs.writeFileSync(filePath, fileContent)
            tempFileContents[filePath] = fileContent
          }
        })
      })
    }
  }

  /**
   * 生成全局注册vue组件需要的语句
   * @param appVueFilesPath 应用中所有vue组件的路径列表
   */
  function generateVueStatements(appVueFilesPath) {
    var vueStatements = {import: '', setValue: ''}

    if (userConfig.autoImportVueComponent === false) {
      return vueStatements
    }

    let uniqueIndex = 0
    let importTpl = []
    let setValueTpl = []
    appVueFilesPath.forEach(function (vueFile) {
      let filename = vueFile.replace(/.*\/([^\/]*)\.vue/, '$1')

      checkFileDuplicate(appVueFilesPath, filename, 'vue')
      checkFileNameValid(filename, 'vue')

      let uid = uniqueIndex++
      let vueComponentName = filename + 'Component' + uid
      importTpl.push(`var ${vueComponentName} = require("${relativePath(vueFile)}");`)
      importTpl.push(`${vueComponentName}._vue_component_name = '${filename}';`)
      setValueTpl.push(`Vue.component(${vueComponentName}.name || "${filename}", ${vueComponentName});`)
    })

    vueStatements.import = importTpl.join('\n')
    vueStatements.setValue = setValueTpl.join('\n')

    return vueStatements
  }

  function generateVueLibStatements() {
    var vueLib = `window.Vue = require('vue/dist/vue.common')
window.VueI18n = require('vue-i18n/dist/vue-i18n')
window.VueRouter  = require('vue-router/dist/vue-router')
window.VueResource  = require('vue-resource/dist/vue-resource')
window.Vuex  = require('vuex/dist/vuex')`

    return userConfig.vueLibBuildIn === false ? '' : vueLib
  }


  function generatePluginStatement(){
    var plugins = userConfig.plugins;

    var importStatement = []

    _.each(plugins, function (item) {
      importStatement.push(`var plugin_${item.name} = require('vue-entry-plugin-${item.name}');
      var plugin_${item.name}_options = ${JSON.stringify(item.options)};
      plugin_${item.name}.exec && plugin_${item.name}.exec(plugin_${item.name}_options);`)
    })

    return importStatement.join('\n')
  }

  function generateExportNameStatement(){
    var exportName = userConfig.exportName || "$entry";

    return `window._$vueEntry_exportName = "${exportName}";`
  }

  function generateSetRootFontSizeStatement() {
      if(userConfig.rem){
        return `window.$entry_APP_DESIGN_SIZE = {
          designWidth: ${userConfig.rem.designWidth || 640},
          designHeight: ${userConfig.rem.designHeight || 1136},
          designFontSize: ${userConfig.rem.designFontSize || 20}
        }`
      }

      return `''`
  }

  function generateServiceStatements(filePath) {
    var statements = ''

    if (fs.existsSync(filePath)) {
      statements = `
      var service = require('${relativePath(filePath)}');
      
      Vue.mixin({
        computed:{
          $service:function () {
            return service.default
          }
        }
      });
`
    }

    return statements
  }

  return entrys
}

var reGeneratorEntryFiles = debounce(generatorEntryFiles, 200)
