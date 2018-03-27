import path from 'path'

import autoprefixer from 'autoprefixer'
// import precss from 'precss'

import config from '../config'
import loaders from './webpack.loaders'
import plugins from './webpack.plugins'

export default {

  context: path.resolve(config.src),

  resolve: {
    modules: [
      path.resolve(config.src),
      path.resolve('./node_modules/'),
    ],
    alias: {},
    extensions: ['.js']
  },

  output: {
    // path: path.resolve(config.dest + config.scripts),
    publicPath: config.isDevelope ? 'http://localhost:' + config.server.port + '/' : '',
    filename: './vue-entry.js',
  },

  watch: config.isDevelope,

  module: {
    loaders: loaders,
  },

  // http://habrahabr.ru/post/245991/
  plugins: plugins,

  devtool: config.isDebug ? '#inline-source-map' : false,
}
