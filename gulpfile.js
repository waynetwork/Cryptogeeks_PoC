const gulp = require('gulp');
const util = require('gulp-util');
const filter = require('gulp-filter');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');
const gulpSequence = require('gulp-sequence');
const rimraf = require('gulp-rimraf');
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config');

gulp.task('build', ['webpack'], function(cb) {
  const hostname = util.env.hostname;
  const port = util.env.port;
  const isNotificationFeatureEnabled = util.env.enableNotifications || false;
  const isWaitcoinChallengeFeatureEnabled = util.env.enableWaitcoinChallenge || false;
  const googleAnalyticsId = util.env.googleAnalyticsId || '';
  if(!hostname || !port) {
    throw new Error("Please provide --hostname and --port as argument!");
  }
  const websocketUrl = 'https://' + hostname + ':' + port + '/';
  const globals = `
    DEVELOPMENT_MODE=false
    WEBSOCKET_BASE_URL='${websocketUrl}'
    FEATURE_NOTIFICATIONS=${isNotificationFeatureEnabled},
    FEATURE_WAITCOIN_CHALLENGE=${isWaitcoinChallengeFeatureEnabled},
    GOOGLE_ANALYTICS_ID='${googleAnalyticsId}'
  `;
  fs.writeFileSync('temp/globals.js', globals);
  gulpSequence('revision', cb);
});

gulp.task('webpack', ['clean'], function() {
  webpack(webpackConfig);
  return webpackStream(webpackConfig).pipe(gulp.dest('temp'));
});

gulp.task('clean', () => {
  return gulp.src(['temp', 'build'], {read: false}).pipe(rimraf());
});

gulp.task('revision', ['append-revision'], function () {
  const outputDir = 'build';
  return gulp.src([outputDir + '/*.html'])
    .pipe(revReplace({manifest: gulp.src(outputDir + '/rev-manifest.json')}))
    .pipe(gulp.dest(outputDir));
});

// append revision hash to filename of js and css files
// to not run into caching issues after releasing changes
gulp.task('append-revision', function () {
  const jsAndCssFilter = filter(['*.js', '*.css']);
  const outputDir = 'build';
  return gulp.src(['temp/**'])
      .pipe(gulp.dest(outputDir))
      .pipe(jsAndCssFilter)
      .pipe(rev())
      .pipe(gulp.dest(outputDir))
      .pipe(jsAndCssFilter.restore())
      .pipe(rev.manifest())
      .pipe(gulp.dest(outputDir));
});
