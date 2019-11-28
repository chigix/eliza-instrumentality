const gulp = require('gulp'),
  log = require('fancy-log');
fs = require('fs-extra'),
  path = require('path'),
  ts = require('gulp-typescript');

const PACKAGES_DIR = path.resolve(__dirname, './packages');
const PACKAGE_TYPES = {
  NODE: ['eliza-util', 'eliza-core', 'eliza-shell'],
  ANGULAR: ['playground'],
};

/**
 * @param string[] type string[]
 */
function getPackages(projectFilter) {
  return fs.readdirSync(PACKAGES_DIR)
    .map(file => path.resolve(PACKAGES_DIR, file))
    .filter(f => fs.lstatSync(path.resolve(f)).isDirectory())
    .map(dir => ({
      dir,
      pkgJson: require(path.resolve(dir, 'package.json')),
    })).filter(pkg => projectFilter ? projectFilter.indexOf(pkg.pkgJson.name) > -1 : true);
}

/**
 *
 * Gulp Tasks
 */

gulp.task('ts-compiling', cb => Promise.all(getPackages(PACKAGE_TYPES.NODE).map(pkg => Promise.all(
  fs.readdirSync(pkg.dir).filter(f => fs.lstatSync(path.resolve(pkg.dir, f)).isFile())
    .map(f => f.match(/tsconfig\.(cjs|esm5|esm2015|esm5\.rollup|migrations|types)\.json$/))
    .filter(tsconfigMatch => tsconfigMatch && tsconfigMatch.length && tsconfigMatch.length > 1)
    .map(tsconfig => new Promise(resolve => {
      const tsconfigFile = path.resolve(pkg.dir, tsconfig[0]);
      log(`ts-compiling: ${tsconfigFile}`);
      const tsProject = ts.createProject(tsconfigFile);
      const tsResult = gulp.src(['src/**/*.ts', '!**/*.spec.ts'], { cwd: pkg.dir })
        .pipe(tsProject());
      if (tsconfig[1] === 'types') {
        tsResult.dts.pipe(gulp.dest('dist', { cwd: pkg.dir }));
      } else {
        const dest = {
          cjs: 'dist',
          esm5: 'dist/_esm5',
          esm2015: 'dist/_esm2015',
        }[tsconfig[1]];
        tsResult.js.pipe(gulp.dest(dest, { cwd: pkg.dir }));
        gulp.src(['src/**/*', '!src/**/*.ts',
          '!src/**/__snapshots__', '!src/**/__snapshots__/**/*'], {
          base: path.resolve(pkg.dir, 'src'),
          cwd: pkg.dir,
        }).pipe(gulp.dest(dest, { cwd: pkg.dir }));
      }
      resolve();
    }))
))).then(() => cb()));

gulp.task('make-packages', cb => Promise.all(getPackages(PACKAGE_TYPES.NODE).map(
  pkg => new Promise(resolve => {
    const distPath = path.resolve(pkg.dir, 'dist');
    const rootPackageJson = Object.assign({},
      require(path.resolve(pkg.dir, 'package.json')),
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
    if (fs.existsSync(path.resolve(pkg.dir, 'README.md'))) {
      fs.copyFileSync(path.resolve(pkg.dir, 'README.md'), `${distPath}/README.md`);
    }
    resolve({ dest: `${distPath}/package.json`, rootPackageJson });
    log('make-packages: writing: ' + `${distPath}/package.json`);
  }).then(
    ({ dest, rootPackageJson }) => fs.writeJson(dest, rootPackageJson, { spaces: 2 })
  ))).then(() => cb()));
