const gulp = require('gulp'),
  log = require('fancy-log'),
  fs = require('fs-extra'),
  path = require('path'),
  ts = require('gulp-typescript');

const PACKAGES_DIR = path.resolve(__dirname, './packages');
const TYPE_TO_DEST = {
  cjs: 'dist',
  esm5: 'dist/_esm5',
  esm2015: 'dist/_esm2015',
};

/**
 * @param string type string
 */
function preparePackageContext(packageName) {
  return fs.readdirSync(PACKAGES_DIR)
    .map(file => path.resolve(PACKAGES_DIR, file))
    .filter(f => fs.lstatSync(path.resolve(f)).isDirectory())
    .map(dir => ({
      dir,
      pkgJson: require(path.resolve(dir, 'package.json')),
    })).find(pkg => pkg.pkgJson.name === packageName);
}

function getTsContexts(packageContext) {
  return fs.readdirSync(packageContext.dir)
    .filter(f => fs.lstatSync(path.resolve(packageContext.dir, f)).isFile())
    .map(f => f.match(/tsconfig\.(cjs|esm5|esm2015|esm5\.rollup|migrations|types)\.json$/))
    .filter(tsconfigMatch => tsconfigMatch && tsconfigMatch.length && tsconfigMatch.length > 1)
    .map(tsconfig => ({
      dir: packageContext.dir,
      pkgJson: packageContext.pkgJson,
      tsconfigFile: path.resolve(packageContext.dir, tsconfig[0]),
      buildType: tsconfig[1],
    }));
}

function compileTs(tsContext) {
  function compileTsTask() {
    const tsProject = ts.createProject(tsContext.tsconfigFile);
    const tsResult = gulp.src(['src/**/*.ts', '!**/*.spec.ts'], { cwd: tsContext.dir })
      .pipe(tsProject());
    if (tsContext.buildType === 'types') {
      return tsResult.dts.pipe(gulp.dest('dist', { cwd: tsContext.dir }));
    } else {
      const dest = TYPE_TO_DEST[tsContext.buildType];
      return tsResult.js
        .pipe(gulp.src(
          ['src/**/*', '!src/**/*.ts',
            '!src/**/__snapshots__', '!src/**/__snapshots__/**/*'], {
          base: path.resolve(tsContext.dir, 'src'),
          cwd: tsContext.dir,
        })).pipe(gulp.dest(dest, { cwd: tsContext.dir }));
    }
  };
  compileTsTask.displayName = `${tsContext.pkgJson.name} - ${tsContext.buildType}`;
  return compileTsTask;
}

function compileTsReplace(tsContext) {
  function compileTsTask() {
    const tsProject = ts.createProject(tsContext.tsconfigFile);
    const tsResult = gulp.src(['src-replace/**/*.ts'], { cwd: tsContext.dir })
      .pipe(tsProject());
    if (tsContext.buildType === 'types') {
      return tsResult.dts.pipe(gulp.dest('dist', { cwd: tsContext.dir }));
    } else {
      const dest = TYPE_TO_DEST[tsContext.buildType];
      return tsResult.js.pipe(gulp.dest(dest, { cwd: tsContext.dir }));
    }
  };
  compileTsTask.displayName = `${tsContext.pkgJson.name}[src-replace] - ${tsContext.buildType}`;
  return compileTsTask;
}

function assemblePackageFiles(packageContext) {
  function assemblePackageTask() {
    const distPath = path.resolve(packageContext.dir, 'dist');
    const rootPackageJson = Object.assign({},
      require(path.resolve(packageContext.dir, 'package.json')),
      {
        main: './index.js',
        typings: './index.d.ts',
      });
    if (fs.existsSync(`${distPath}/_esm5`)) {
      rootPackageJson.module = './_esm5/index.js';
    }
    if (fs.existsSync(`${distPath}/_esm2015`)) {
      rootPackageJson.es2015 = './_esm2015/index.js';
    }
    delete rootPackageJson.scripts;
    if (fs.existsSync(path.resolve(packageContext.dir, 'README.md'))) {
      fs.copyFileSync(path.resolve(packageContext.dir, 'README.md'), `${distPath}/README.md`);
    }
    log('make-packages: writing: ' + `${distPath}/package.json`);
    return fs.writeJson(`${distPath}/package.json`, rootPackageJson, { spaces: 2 });
  }
  assemblePackageTask.displayName = `${packageContext.pkgJson.name} - assemble`;
  return assemblePackageTask;
}

exports.buildPackages = gulp.parallel(
  gulp.series(
    gulp.parallel(
      getTsContexts(preparePackageContext('eliza-util')).map(compileTs),
    ),
    gulp.parallel(
      getTsContexts(preparePackageContext('eliza-util')).map(compileTsReplace),
      assemblePackageFiles(preparePackageContext('eliza-util')),
    ),
  ),
  gulp.series(
    gulp.parallel(
      getTsContexts(preparePackageContext('eliza-core')).map(compileTs),
    ),
    gulp.parallel(
      getTsContexts(preparePackageContext('eliza-core')).map(compileTsReplace),
      assemblePackageFiles(preparePackageContext('eliza-core')),
    ),
  ),
  gulp.series(
    gulp.parallel(
      getTsContexts(preparePackageContext('eliza-shell')).map(compileTs),
    ),
    gulp.parallel(
      getTsContexts(preparePackageContext('eliza-shell')).map(compileTsReplace),
      assemblePackageFiles(preparePackageContext('eliza-shell')),
    ),
  ),
  gulp.series(
    gulp.parallel(
      getTsContexts(preparePackageContext('eliza-jp')).map(compileTs),
    ),
    gulp.parallel(
      getTsContexts(preparePackageContext('eliza-jp')).map(compileTsReplace),
      assemblePackageFiles(preparePackageContext('eliza-jp')),
    ),
  ),
);
