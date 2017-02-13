# vue-entry
An entry boot for Vue.js projects.

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
}
```

### application architecture
1. single app in one project
```
src/
├── components/
├── pages/
│   ├── page1
│   │   ├── page1.i18n.js // i18n file optional 
│   │   ├── pag1.vue // page file *required
│   │   └──page1.state.js // state file optional 
│   ├── index.html  // *required
│   ├── routes.js  // optional
│   ├── config.json  // optional 
│   ├── service.js  // optional 
│   └── ...
└── statics/
    ├── images/
    └── ...
```
2. multi app in one project
```
src/
├── components/
├── pages/
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
