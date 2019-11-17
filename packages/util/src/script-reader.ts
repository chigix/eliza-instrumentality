import * as fs from 'fs';
import { bindNodeCallback } from 'rxjs';

export function fromFile(filename: string, encoding = 'utf8') {
  const readFileAsObservable = bindNodeCallback(
    fs.readFile as
    (path: string,
     options: { encoding: string; flag?: string; } | string,
     callback: (err: NodeJS.ErrnoException | null, data: string) => void) => void);
  return readFileAsObservable(filename, encoding);
}
