import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import { exec } from 'child_process';

export function download(url: string, savePath: string) {
  return new Promise((resolve, reject) => {
    const get = url.startsWith('https') ? https.get : http.get;
    get(url, res => {
      if (res.headers.location) {
        return download(res.headers.location, savePath)
          .then(resolve).catch(reject);
      }
      const outFile = fs.createWriteStream(savePath);
      res.pipe(outFile);
      res.on('end', () => {
        outFile.close();
        resolve();
      });
      res.on('error', e => {
        reject(e);
      });
    });
  });
}

export function unzipTar(file: string, dist: string) {
  return new Promise(resolve => exec([
    'tar', '-zxvf', `"${file}"`, '-C', `"${dist}"`,
  ].join(' '), (err, stdout) => resolve()));
}

export function replaceAll(str: string, src: string, dest: string) {
  if (src.length !== dest.length) {
    throw new Error('Fatal Code Error: dest and src should be with same length.');
  }
  for (let index = 0; index < src.length; index++) {
    str = str.split(src.charAt(index)).join(dest.charAt(index));
  }

  return str;
}
