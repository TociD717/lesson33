const { task, series, parallel, src, dest, watch } = require('gulp');
const cssnano = require('cssnano');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const csscomb = require('gulp-csscomb');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const sortCSSmq = require('sort-css-media-queries');
const plugins = [autoprefixer({ overrideBrowserslist: ['last 5 versions', '> 1%'], cascade: true }), mqpacker({ sort: sortCSSmq })];

const PATH = {
  scssRoot: './assets/scss/style.scss',
  cssRoot: './assets/css',
  htmlFiles: './*.html',
  scssFiles: './assets/scss/*.scss',
  jsFiles: './assets/js/**/*.js',
  scssFolder: './assets/scss',
};

function buildSCSS() {
  return src(PATH.scssRoot)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(dest(PATH.cssRoot))
    .pipe(browserSync.stream());
}

function buildMinSCSS() {
  const pluginsForMinified = [...plugins, cssnano({ preset: 'default' })];
  return src(PATH.scssRoot)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(pluginsForMinified))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(PATH.cssRoot))
    .pipe(browserSync.stream());
}

async function reload() {
  await browserSync.reload();
}

function watchFiles() {
  syncInit();
  watch(PATH.scssRoot, series(buildSCSS, buildMinSCSS));
  watch(PATH.htmlFiles, reload);
  watch(PATH.jsFiles, reload);
}

function syncInit() {
  browserSync.init({
    server: {
      baseDir: './',
    },
  });
}

function comb() {
  return src(PATH.scssFiles).pipe(csscomb('./.csscomb.json')).pipe(dest(PATH.scssFolder));
}

task('comb', comb);
task('watch', watchFiles);
task('scss', series(buildSCSS, buildMinSCSS));
