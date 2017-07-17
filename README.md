# vue-entry [![Build Status](https://img.shields.io/circleci/project/litjs/vue-entry/master.svg)](https://circleci.com/gh/litjs/vue-entry) [![npm package](https://img.shields.io/npm/v/vue-entry.svg)](https://www.npmjs.com/package/vue-entry)
An entry boot for Vue2 projects.

### Installation
```
npm install vue-entry --save-dev
```

### Example Webpack Config
``` javascript
var vueEntry = require('vue-entry');

module.exports = {
   entry: vueEntry({
   src: './src',
   autoImportVueComponent: true
   }),
}
```

### Options and defaults (Optional)
```javascript
{
  "src": './src', // An relative path for the source. Default: './src'. normally  include pages and components folders in it.
  "autoImportVueComponent": true, // vue component import and registered to Vue globally.
  "langs": ["zh_CN"], //  export in .i18n.js file
  "vueLibBuildIn":true, // include vue.js, vue-router.js, vue-resource.js, vue-i18n.js. if setting false, using script tag for global use manually.
   "rem":{ // rem setting for mobile app
      designWidth: 640,
      designHeight: 1136,
      designFontSize: 20
   }
}
```

### Application architecture
1. single app in one project

    ```
    src/
    ├── components/
    ├── page1/
    │   ├── page1.i18n.js // i18n file optional 
    │   ├── pag1.vue // page file *required
    │   └──page1.state.js // state file optional 
    ├── index.html  // *required
    ├── routes.js  // optional
    ├── config.json  // optional 
    ├── service.js  // optional 
    └── ...
    └── statics/
        ├── images/
        └── ...
    ```
2. multi app in one project

    ```
    src/
    ├── components/
    ├── apps/
    │   ├── app1
    │   │   ├── index.html
    │   │   ├── routes.js
    │   │   ├── config.json
    │   │   └── ...
    │   ├── app2
    │   │    ├── index.html
    │   │    ├── routes.js
    │   │    ├── config.json
    │   │    └── ...
    │   └── ...
    └── statics/
        ├── images/
        └── ...
    ```

### extra tools for app development

1. standalone config file
    
2. standalone i18n file

3. standalone vuex file

4. log method($debug and $error) for vue component object



    
