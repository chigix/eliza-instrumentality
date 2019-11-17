import * as inquirer from 'inquirer';
import { Subject as RxSubject } from 'rxjs';
import { loadEliza } from 'eliza-core';
import { fromFile } from 'eliza-util';

export async function run() {
  const eliza = await loadEliza(fromFile('eliza.script'));
  let i = 0;
  const prompts = new RxSubject<inquirer.DistinctQuestion>();
  inquirer.prompt(prompts).ui.process.subscribe({
    next: function onEachAnswer({ answer }: { answer?: string }) {
      i++;
      if (!answer || answer.length < 1) {
        return prompts.complete();
      }
      const reply = eliza.processInput(answer);
      if (eliza.isFinished()) {
        console.log(reply);
        return prompts.complete();
      }
      prompts.next({
        type: 'input',
        name: `userInput-${i}`,
        message: `${reply}\n user#${i} >> `,
      });
    },
    error: (err) => {
      console.error(err);
    },
    complete: () => {
      console.log('Interactive session is complete. Good bye! 👋\n');
    },
  });
  prompts.next({
    type: 'input',
    name: `userInput-${i}`,
    message: eliza.getInitialStr() + `\n user#${i} >> `,
  });
}