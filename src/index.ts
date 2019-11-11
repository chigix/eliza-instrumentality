import * as inquirer from 'inquirer';
import { Subject as RxSubject } from 'rxjs';
import { loadEliza } from './eliza';
import { fromFile } from './script-reader';

(async function main() {
  const eliza = await loadEliza(fromFile('eliza.script'));
  let i = 0;
  const prompts = new RxSubject<inquirer.DistinctQuestion>();
  inquirer.prompt(prompts).ui.process.subscribe({
    next: function onEachAnswer({ answer }: { answer?: string }) {
      i++;
      if (!answer || answer.length < 1) {
        return prompts.complete();
      }
      prompts.next({
        type: 'input',
        name: `userInput-${i}`,
        message: `Question#${i}: ${eliza.processInput(answer)}`,
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
    message: eliza.getInitialStr(),
  });
})();
