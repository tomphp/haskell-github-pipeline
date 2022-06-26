const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

describe('get-next-version', () => {
  test('when a new feature is added', async () => {
    const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'action-test-git-repo'));

    process.chdir(repoDir);
    await exec('git init');
    await exec('git remote add origin git@github.com/tomphp/no-repo');
    await exec('touch example.txt');
    await exec('git add example.txt');
    await exec('git commit -m "First commit"');
    await exec('git tag v1.0.0');
    await exec('echo "feature line" >example.txt');
    await exec('git add example.txt');
    await exec('git commit -m "feat: First feature"');

    const { stdout } = await exec(`node ${__dirname}/index.js`);

    expect(stdout).toContain('::set-output name=next-version::v1.1.0');
  });

  test('when no new version is required', async () => {
    const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'action-test-git-repo'));

    process.chdir(repoDir);
    await exec('git init');
    await exec('git remote add origin git@github.com/tomphp/no-repo');
    await exec('touch example.txt');
    await exec('git add example.txt');
    await exec('git commit -m "First commit"');
    await exec('git tag v1.0.0');

    const { stdout } = await exec(`node ${__dirname}/index.js`);

    expect(stdout).toMatch(/::set-output name=next-version::\s*$/g);
  });

  test('when no git repository is present', async () => {
    const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'action-test-git-repo'));

    process.chdir(repoDir);

    expect.assertions(2);

    try {
      await exec(`node ${__dirname}/index.js`);
    } catch (error) {
      expect(error.stdout).toContain('Error: current working directory is not a git repository');
      expect(error.stdout).toContain('::error::Error: Unexpected result');
    }
  });

  test('when uplift is not installed', async () => {
    expect.assertions(1);
    try {
      await exec(`alias uplift='exit 1;'; node ${__dirname}/index.js`);
    } catch (error) {
      expect(error.stdout).toContain('::error::Error: uplift not installed');
    }
  })
});
