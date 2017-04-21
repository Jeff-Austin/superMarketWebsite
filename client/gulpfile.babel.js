import assign from 'lodash.assign';
import babelify from 'babelify';
import browserify from 'browserify';
import buffer from 'vinyl-buffer';
import gulp from 'gulp';
import gutil from 'gulp-util';
import sass from 'gulp-sass';
import source from 'vinyl-source-stream';
import uglify from 'gulp-uglify';
import watchify from 'watchify';
import sourcemaps from 'gulp-sourcemaps';
import handlebars from 'hbsfy';

handlebars.configure({
  traverse: true,
  extensions: ['hbs'],
});

const BROWSERIFY_OPTIONS = {
  transform: [handlebars],
  entries: './src/scripts/app.js',
  debug: true
};

const bundler = browserify(BROWSERIFY_OPTIONS);

gulp.task('copy:html', () => {
  return gulp.src('./src/index.html')
    .pipe(gulp.dest('./dist'));
});

gulp.task('copy:fonts', () => {
  return gulp.src([
    './node_modules/font-awesome/fonts/*.+(eot|svg|ttf|woff|woff2|otf)',
    './node_modules/octicons/build/font/*.+(ttf|eot|svg|ttf|woff|woff2)',
  ])
  .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('build:js', () => {
  return bundler
    .transform(babelify)
    .bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/scripts'));
});

gulp.task('build:templates', () => {
  return
});

gulp.task('watch:js', () => {
  const watcherOpts = assign({}, watchify.args, BROWSERIFY_OPTIONS);
  const watcher = watchify(browserify(watcherOpts)).transform(babelify);

  const bundle = () => {
    return watcher
      .bundle()
      // log errors if they happen
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(gulp.dest('./dist/scripts'));
  }

  watcher.on('update', bundle); // on any dep update, runs the bundler
  watcher.on('log', gutil.log); // output build logs to terminal

  return bundle();
});

gulp.task('build:scss', () => {
  return gulp.src('./src/stylesheets/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/stylesheets'));
});

gulp.task('watch:scss', () => {
  gulp.watch('./src/stylesheets/*.scss', ['build:scss']);
});

gulp.task('apply-prod-environment', () => {
  process.env.NODE_ENV = 'production';
});

gulp.task('watch', ['watch:js', 'watch:scss']);
gulp.task('build', ['copy:html', 'copy:fonts', 'build:js', 'build:scss']);
gulp.task('release', ['apply-prod-environment', 'build']);
gulp.task('default', ['build']);
