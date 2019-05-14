// Change siteName, CSS and JS files
// Secure site with Valet SSL certificate
// Gulp tasks:
// gulp init to prepare files for production
// gulp browsersync for full browsersync experience
// gulp (default) to watch css and js files

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    header  = require('gulp-header'),
    rename = require('gulp-rename'),
    cssnano = require('gulp-cssnano'),
    concat = require('gulp-concat'),
    package = require('./package.json'),
    notify  = require('gulp-notify'),
    browserSync = require('browser-sync').create();

var siteName = 'nieuwedokter_v1'; // set your siteName here
var userName = 'kaz'; // set your macOS userName here

var config = {
  bootstrapDir: './node_modules/bootstrap',
  publicDir: './',
  srcDir: './src',
};

var banner = [
  '/*!\n' +
  ' * <%= package.name %>\n' +
  ' * <%= package.title %>\n' +
  ' * <%= package.url %>\n' +
  ' * @author <%= package.author %>\n' +
  ' * @version <%= package.version %>\n' +
  ' * Copyright ' + new Date().getFullYear() + '. <%= package.license %> licensed.\n' +
  ' */',
  '\n'
].join('');

// array of js files to simply copy to destination
var jsfiles = [
  //'./node_modules/slick-carousel/slick/slick.js'
];

gulp.task('jscopy', function () {
  gulp.src(jsfiles)
  .pipe(gulp.dest(config.publicDir+'/js'));
});

// array of sass/src files to simply copy to destination
// run this command only once, otherwise modifications will be overwritten!
// $ gulp csscopy
var cssfiles = [
  './node_modules/slick-carousel/slick/slick-theme.scss',
  './node_modules/slick-carousel/slick/slick.scss'
];

gulp.task('csscopy', function () {
  gulp.src(cssfiles)
  .pipe(gulp.dest(config.srcDir+'/scss/vendor'));
});

gulp.task('bowerscripts', function() {
  return gulp.src([
    'node_modules/bootstrap/dist/js/bootstrap.bundle.js',
    'node_modules/slick-carousel/slick/slick.js'
  ])

  .pipe(concat('vendor.js'))
  .pipe(gulp.dest(config.srcDir+'/js/'))
  .pipe(notify({
    message: "Vendor JS files concatenated",
  }));
});

gulp.task('css', function () {
  return gulp.src(config.srcDir+'/scss/nieuwedokter.scss') // Set SCSS file name
  .pipe(sass({
    includePaths: [
      config.bootstrapDir + '/scss'
    ],
  }).on('error', sass.logError))
  .pipe(autoprefixer('last 4 versions'))
  .pipe(gulp.dest(config.publicDir+'/css'))
  .pipe(cssnano())
  .pipe(rename({ suffix: '.min' }))
  .pipe(header(banner, { package : package }))
  .pipe(gulp.dest(config.publicDir+'/css'))
  .pipe(notify({
    message: "CSS Re-Generated",
  }));
});

gulp.task('js',function(){
  gulp.src('src/js/*.js')
  .pipe(header(banner, { package : package }))
  .pipe(concat('nieuwedokter.js')) // Set JS file name
  .pipe(gulp.dest(config.publicDir+'/js'))
  .pipe(uglify())
  .pipe(header(banner, { package : package }))
  .pipe(rename({ suffix: '.min' }))
  .pipe(gulp.dest(config.publicDir+'/js'))
  .pipe(notify({
    message: "Js files concatenated",
  }));
});

gulp.task('init', ['csscopy','bowerscripts','css', 'js'], function () {
  // Nothing to see here
});

gulp.task('default', ['bowerscripts','css', 'js'], function () {
  gulp.watch("src/scss/*/*.scss", ['css']);
  gulp.watch("src/scss/*/*.sass", ['css']);
  gulp.watch("src/js/*.js", ['js']);
});

gulp.task('browsersync', ['bowerscripts','css', 'js'], function () {
  browserSync.init({
    proxy: 'https://' + siteName + '.dev',
    host: siteName + '.dev',
    open: 'external',
    port: 8000,
    https: {
      key:
      '/Users/' +
      userName +
      '/.valet/Certificates/' +
      siteName +
      '.dev.key',
      cert:
      '/Users/' +
      userName +
      '/.valet/Certificates/' +
      siteName +
      '.dev.crt'
    }
  });

  gulp.watch("src/scss/*/*.scss", ['css']).on( 'change', browserSync.reload );
  gulp.watch("src/scss/*/*.sass", ['css']).on( 'change', browserSync.reload );
  gulp.watch("src/js/*.js", ['js']).on( 'change', browserSync.reload );
  gulp.watch(["./site/content/collections/**/*.md"]).on('change', browserSync.reload);
  gulp.watch(["./site/content/pages/**/*.md"]).on('change', browserSync.reload);
  gulp.watch(["partials/**/*.html"]).on('change', browserSync.reload);
  gulp.watch(["layouts/**/*.html"]).on('change', browserSync.reload);
  gulp.watch(["templates/**/*.html"]).on('change', browserSync.reload);

}); // gulp.task('browsersync')...
