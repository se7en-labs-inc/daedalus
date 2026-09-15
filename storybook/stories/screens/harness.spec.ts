import fs from 'fs';
import path from 'path';

/*
 * A structural check on the screen corpus, run at the harness review that closes
 * the container tranches.
 *
 * The harness exists so a story can mount a real container without the machinery
 * a real store brings: `setUpStores` takes a live `Api` and `initialize()` starts
 * every store's polling reactions. Nothing in the render spec would notice a
 * story that constructed one. It would pass, and the workbench would quietly hold
 * a timer and a network client per story.
 *
 * So this asserts the property directly and mechanically: no screen story reaches
 * a store or an api module at all. It is a weaker statement than "no reaction is
 * running" and a far more durable one, because it fails on the import rather than
 * on the symptom.
 */
const SCREENS_DIR = path.join(__dirname);

const collect = (dir: string, found: Array<string> = []): Array<string> => {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collect(full, found);
    } else if (entry.name.endsWith('.stories.tsx')) {
      found.push(full);
    }
  });
  return found;
};

const storyFiles = collect(SCREENS_DIR);

describe('the screen story corpus', () => {
  it('has a story file per covered screen', () => {
    // 30 of the application's 49 reachable screens: the 29 from phase 6 plus the
    // wallet-scale proof screen that opens phase 7.
    expect(storyFiles).toHaveLength(30);
  });

  it.each(storyFiles.map((file) => [path.relative(SCREENS_DIR, file), file]))(
    '%s reaches no store and no api module',
    (_name, file) => {
      const source = fs.readFileSync(file, 'utf8');
      expect(source).not.toMatch(/app\/stores/);
      expect(source).not.toMatch(/app\/api\//);
    }
  );

  it.each(storyFiles.map((file) => [path.relative(SCREENS_DIR, file), file]))(
    '%s mounts its container through the shared frame',
    (_name, file) => {
      // Every screen story goes through `screenDecorator`, which is what supplies
      // the Provider, the router and the analytics context. A story that built
      // its own frame would drift from the others silently.
      const source = fs.readFileSync(file, 'utf8');
      expect(source).toMatch(/screenDecorator\(/);
    }
  );
});
