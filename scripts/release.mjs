import { execSync } from 'node:child_process';
import { basename } from 'node:path';
import figlet from 'figlet';

function run(command) {
  console.log(`\n> ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    process.exit(error.status ?? 1);
  }
}

function capture(command) {
  return execSync(command, { encoding: 'utf8' }).trim();
}

const scriptName = basename(process.argv[1] ?? 'release.mjs', '.mjs');
const version = capture('gitversion /nocache /showvariable MajorMinorPatch');
console.log(figlet.textSync(`${scriptName} ${version}`));

const branch = capture('git rev-parse --abbrev-ref HEAD');
if (!/^feature\/[A-Za-z0-9][A-Za-z0-9._-]*$/.test(branch)) {
  console.error(`Release runs only on feature/<feature>. Current branch is ${branch}.`);
  process.exit(1);
}

run('npm run build');
run('npm test');
run('npm run version:sync');
if (!process.env.NPM_TOKEN) {
  console.error(
    'npm publish needs a granular access token in ~/.zshenv as NPM_TOKEN. Create it at https://www.npmjs.com/settings/~/tokens with Read and write on all packages and Bypass two-factor authentication enabled.',
  );
  process.exit(1);
}
console.log('\n> npm publish');
try {
  execSync('npm publish', { stdio: 'inherit' });
} catch (error) {
  console.error(
    'npm refused the publish. Replace NPM_TOKEN with a granular access token that has Read and write on all packages and Bypass two-factor authentication enabled: https://www.npmjs.com/settings/~/tokens',
  );
  process.exit(error.status ?? 1);
}

const dirty = capture('git status --porcelain');
if (dirty) {
  run('git add -A');
  execSync(
    'git commit -m "$(cat <<EOF\nfeat(esi): publish ' +
      version +
      '\n\nOpenSpec feature delivery on ' +
      branch +
      '. Build and test passed, then npm publish, then this commit.\nEOF\n)"',
    { stdio: 'inherit' },
  );
}

run('git push -u origin HEAD');

const existing = capture(
  `gh pr list --head ${branch} --base develop --json number,url --jq '.[0].url // empty'`,
);
if (existing) {
  run(
    `gh pr comment ${existing} --body "$(cat <<EOF\nRelease ${version} on ${branch}: build, test, and npm publish completed.\nEOF\n)"`,
  );
  console.log(existing);
} else {
  run(
    'gh pr create --base develop --title "feat(esi): publish ' +
      version +
      '" --body "$(cat <<EOF\n## Summary\n- Publish neocom-esi ' +
      version +
      ' from ' +
      branch +
      '\n- OpenSpec change: esi-character-api\n\n## Test plan\n- [x] npm test\n- [ ] Confirm the npm package version\nEOF\n)"',
  );
}
