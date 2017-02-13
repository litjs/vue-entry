import gulp from 'gulp'
import babel from "gulp-babel"
import config from '../config'

gulp.task("apptools", function() {
  return gulp.src(config.src + "/bootstrap/**/*.js") // ES6 源码存放的路径
    .pipe(babel())
    .pipe(gulp.dest("dist/bootstrap")); //转换成 ES5 存放的路径
});
