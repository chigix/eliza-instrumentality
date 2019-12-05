import program from 'commander';
import * as inquirer from 'inquirer';
import * as fs from 'fs';
import { Subject as RxSubject } from 'rxjs';
import { loadEliza, loadElizaInEnglish } from 'eliza-core';
import { fromFile, SCRIPT_PATH } from 'eliza-util';
import { IPADIC } from 'eliza-jp';

import { PKG_ROOT } from './consts';

const projectPackageJson = JSON.parse(
  fs.readFileSync(PKG_ROOT + '/package.json', 'utf-8'),
);

program.version(projectPackageJson.version)
  .description(projectPackageJson.description)
  .usage('[options]')
  .option('-j, --japanese', 'Launch Eliza with a default Japanese script.');

export async function run() {
  program.parse(process.argv);

  const eliza = await (() => {
    if (program.japanese) {
      return loadEliza(fromFile(IPADIC));
    } else {
      return loadElizaInEnglish(fromFile(SCRIPT_PATH + '/eliza.script'));
    }
  })();

  let i = 0;
  const prompts = new RxSubject<inquirer.DistinctQuestion>();
  inquirer.prompt(prompts).ui.process.subscribe({
    next: function onEachAnswer({ answer }: { answer?: string }) {
      i++;
      if (!answer || answer.length < 1) {
        return prompts.complete();
      }
      const reply = (eliza.processInput(answer)
        || { assembled: { reassembled: 'I am at a loss for words.' } })
        .assembled.reassembled;
      if (eliza.isFinished()) {
        return process.stdout.write(`${reply}\n`, 'utf8', () => {
          prompts.complete();
        });
      }
      prompts.next({
        type: 'input',
        name: `userInput-${i}`,
        message: `${reply}\n user#${i} >> `,
      });
    },
    error: (err) => {
      process.stderr.write(err);
    },
    complete: () => {
      process.stdout
        .write('Interactive session is complete. Good bye! 👋\n', 'utf8');
    },
  });
  prompts.next({
    type: 'input',
    name: `userInput-${i}`,
    message: eliza.getInitialStr() + `\n user#${i} >> `,
  });
}
