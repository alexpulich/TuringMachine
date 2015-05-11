var gulp = require('gulp'),
    useref = require('gulp-useref'),
    uglify = require('gulp-uglify'),
    clean = require('gulp-clean'),
    gulpif = require('gulp-if'),
    minifyCss = require('gulp-minify-css'),
    browserSync = require('browser-sync'),
    size = require('gulp-size'),
    opn = require('opn'),
    reload = browserSync.reload;

//===============================
//====== Local Development ======
//===============================

gulp.task('server', function () {  
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: 'app'
    }
  });  
});

gulp.task('watch', function() {
    gulp.watch([
        './app/*.html',
        './app/css/*.css',
        './app/js/*.js'
        ]).on('change', reload);
});

gulp.task('default', ['server', 'watch']);

//===============================
//==== Production Building ======
//===============================

gulp.task('clean', function () {
  return gulp.src('dist')
    .pipe(clean());
});

gulp.task('useref', function () {
  var assets = useref.assets();
  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest('dist'));
});

gulp.task('dist', ['useref', 'images', 'fonts', 'extras'], function () {
  return gulp.src('dist/**/*').pipe(size({title: 'build'}));
});

gulp.task('build', ['clean'], function () {
  gulp.start('dist');
});

gulp.task('server-dist', function () {  
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: 'dist'
    }
  });
});