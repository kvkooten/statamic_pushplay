// Change siteName, themeName, CSS and JS files
// Run 'valet link && valet secure'
// Run 'yarn install'
// Gulp tasks:
// 'gulp init' to prepare files for production
// 'gulp browsersync' for full browsersync experience
// 'gulp' (default) to watch css and js files

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
var themeName = 'nieuwedokter' // set theme themeName. This needs fixing.

var config = {
  bootstrapDir: './node_modules/bootstrap',
  publicDir: 'site/themes/' + themeName + '/',
  srcDir: 'site/themes/' + themeName + '/src'
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
  return gulp.src(config.srcDir+'/scss/' + themeName + '.scss') // Set SCSS file name
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
  gulp.src('site/themes/' + themeName + '/src/js/*.js')
  .pipe(header(banner, { package : package }))
  .pipe(concat(themeName + '.js')) // Set JS file name
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

var htmlWatch = [
  ["site/themes/" + themeName + "/partials/**/*.html"],
  ["site/themes/" + themeName + "/layouts/**/*.html"],
  ["site/themes/" + themeName + "/templates/**/*.html"]
]
var mdWatch = [
  ["site/content/collections/**/*.md"],
  ["site/content/pages/**/*.md"]
]
var cssWatch = [
  "site/themes/" + themeName + "/src/scss/*/*.scss",
  "site/themes/" + themeName + "/src/scss/*/*.sass"
]
var jsWatch = "site/themes/" + themeName + "/src/js/*.js"

gulp.task('default', ['bowerscripts','css', 'js'], function () {
  gulp.watch("site/themes/" + themeName + "/src/scss/*/*.scss", ['css']);
  gulp.watch("site/themes/" + themeName + "/src/scss/*/*.sass", ['css']);
  gulp.watch("site/themes/" + themeName + "/src/js/*.js", ['js']);
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
      '/.config/valet/Certificates/' +
      siteName +
      '.dev.key',
      cert:
      '/Users/' +
      userName +
      '/.config/valet/Certificates/' +
      siteName +
      '.dev.crt'
    }
  });

  gulp.watch(cssWatch, ['css']).on('change', browserSync.reload);
  gulp.watch(jsWatch, ['js']).on('change', browserSync.reload);
  gulp.watch(mdWatch).on('change', browserSync.reload);
  gulp.watch(htmlWatch).on('change', browserSync.reload);

}); // gulp.task('browsersync')...
