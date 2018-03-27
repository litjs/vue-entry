import gulp from 'gulp'
import del from 'del'
import babel from "gulp-babel"
import connect from 'gulp-connect'
import config from '../config'
import env from 'gulp-env'
import errorHandler from '../helpers/errorHandler'

import webpackGulp from 'webpack-stream'
import named from 'vinyl-named'

import configWebpack from '../webpack'

var envs = { NODE_ENV: config.NODE_ENV }

gulp.task('clean', function(cb){
    try {
        del.sync(config.dest)
    } catch (e) {
        console.log('%s do not clean', config.dest)
    }
})

gulp.task("apptools", function() {
    return gulp.src(config.src + "/bootstrap/**/*.js") // ES6 源码存放的路径
        .pipe(babel())
        .pipe(gulp.dest("dist/bootstrap")); //转换成 ES5 存放的路径
});

gulp.task('connect', () =>
    connect.server({
        root: [config.dest],
        port: config.server.port,
        livereload: true,
        // https://github.com/bripkens/connect-history-api-fallback
        // fallback: config.dest + '/index.html',
    })
)

gulp.task("indexhtml", function() {
    return gulp.src([config.src + "/bootstrap/**/*.html",config.src + "/bootstrap/**/*.json"]) // ES6 源码存放的路径
        .pipe(gulp.dest("dist/bootstrap")); //转换成 ES5 存放的路径
});

gulp.task('webpack', () =>
    gulp
        .src([config.src + '/core/index.js'])
        .pipe(env.set(envs))
        .pipe(errorHandler())
        .pipe(named())
        .pipe(webpackGulp(configWebpack))
        .pipe(gulp.dest(config.dest))
)

gulp.task('build', gulp.series(gulp.parallel('clean', 'webpack'),function(){

}))

gulp.task('default', gulp.series(gulp.parallel('apptools', 'indexhtml', 'webpack'),function(){

}))
