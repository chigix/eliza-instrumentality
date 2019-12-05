import * as utils from './utils';
import * as fs from 'fs';
import links from './links.json';
import { build as buildIpaDic } from './build-ipadic';
import { ElizaScriptBuilder } from './templates/eliza-script';
import { UserStoryScript } from './templates/user-story-script';

const DIRS = {
  dist: process.env.PKG_PATH + '/dist',
  cache: process.env.PKG_PATH + '/cache',
};

(async function main() {
  if (!fs.existsSync(DIRS.dist)) {
    fs.mkdirSync(DIRS.dist);
  }
  if (!fs.existsSync(DIRS.cache)) {
    fs.mkdirSync(DIRS.cache);
  }
  if (!fs.existsSync(DIRS.cache + '/ipadic.tar.gzip')) {
    await utils.download(links.IPADIC, DIRS.cache + '/ipadic.tar.gzip');
  }
  await utils.unzipTar(DIRS.cache + '/ipadic.tar.gzip', DIRS.cache);
  fs.writeFileSync(
    DIRS.dist + '/eliza.ipadic.script',
    await buildIpaDic({
      dicDir: DIRS.cache + '/mecab-ipadic-2.7.0-20070801',
      scriptTemplate: new ElizaScriptBuilder(),
    }));
  fs.writeFileSync(
    DIRS.dist + '/user-story-composer.script',
    await buildIpaDic({
      dicDir: DIRS.cache + '/mecab-ipadic-2.7.0-20070801',
      scriptTemplate: new UserStoryScript(),
    }));
})();
