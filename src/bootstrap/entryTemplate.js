'{{vue_lib}}'
require('{{vue_entry}}')
require('es6-promise').polyfill()



// 等app定制文件加载完成后进行初始化
window.onload = function () {
  // 初始化（获取config.json信息）
  '{{configInitStatement}}'.then(function (conf) {
    // 初始化国际化信息
    '{{i18nInitStatement}}'.then(function () {
      '{{plugins}}'
      require('{{indexHtml}}');
      '{{configRequireStatement}}'

      // 国际化文件导入
      '{{i18nRequireStatements}}'

      '{{routes}}'

      '{{stateImportStatements}}'
      '{{vueComponentImportStatements}}'

      '{{stateSetValueStatements}}'

      // 全局注册src/components及app下的vue组件
      '{{vueComponentSetValueStatements}}'

      window._PRIVATE__.startApp(null, STORE, routes);
    })
  })
}
