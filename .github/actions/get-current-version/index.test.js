const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

describe('get-current-version', () => {
  test('when no existing tag', async () => {
    const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'action-test-git-repo'));

    process.chdir(repoDir);
    await exec('git init');
    await exec('git remote add origin git@github.com/tomphp/no-repo');
    await exec('git commit --allow-empty -m "feat: One"');

    const { stdout } = await exec(`node ${__dirname}/index.js`);

    expect(stdout).toMatch(/::set-output name=current-version::\s*/g);
  });

  test('when existing version is the last tag', async () => {
    const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'action-test-git-repo'));

    process.chdir(repoDir);
    await exec('git init');
    await exec('git remote add origin git@github.com/tomphp/no-repo');
    await exec('git commit --allow-empty -m "feat: One"');
    await exec('git tag v1.0.0');
    await exec('git commit --allow-empty -m "feat: Two"');
    await exec('git tag v2.0.0');

    const { stdout } = await exec(`node ${__dirname}/index.js`);

    expect(stdout).toMatch(/::set-output name=current-version::v2.0.0/g);
  });

  test('when tags are not in order', async () => {
    const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'action-test-git-repo'));

    process.chdir(repoDir);
    await exec('git init');
    await exec('git remote add origin git@github.com/tomphp/no-repo');
    await exec('git commit --allow-empty -m "feat: One"');
    await exec('git tag v1.0.0');
    await exec('git commit --allow-empty -m "feat: Three"');
    await exec('git tag v3.0.0');
    await exec('git commit --allow-empty -m "feat: Two"');
    await exec('git tag v2.0.0');

    const { stdout } = await exec(`node ${__dirname}/index.js`);

    expect(stdout).toMatch(/::set-output name=current-version::v3.0.0/g);
  });

  test('when non-version tags exist', async () => {
    const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'action-test-git-repo'));

    process.chdir(repoDir);
    await exec('git init');
    await exec('git remote add origin git@github.com/tomphp/no-repo');
    await exec('git commit --allow-empty -m "feat: One"');
    await exec('git tag v1.0.0');
    await exec('git commit --allow-empty -m "feat: Meh"');
    await exec('git tag zoom');

    const { stdout } = await exec(`node ${__dirname}/index.js`);

    expect(stdout).toMatch(/::set-output name=current-version::v1.0.0/g);
  });

  // test('when no git repository is present', async () => {
  //   const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'action-test-git-repo'));

  //   process.chdir(repoDir);

  //   expect.assertions(2);

  //   try {
  //     await exec(`node ${__dirname}/index.js`);
  //   } catch (error) {
  //     expect(error.stdout).toContain('Error: current working directory is not a git repository');
  //     expect(error.stdout).toContain('::error::Error: Unexpected result');
  //   }
  // });

  // test('when uplift is not installed', async () => {
  //   const tempBin = fs.mkdtempSync(path.join(os.tmpdir(), 'action-test-git-repo'));
  //   await exec(`echo "exit 1" >"${tempBin}/uplift"`);
  //   await exec(`chmod +x "${tempBin}/uplift"`);

  //   expect.assertions(1);
  //   try {
  //     await exec(`PATH="${tempBin}:$PATH" node '${__dirname}/index.js'`);
  //   } catch (error) {
  //     console.log(error.message);
  //     expect(error.stdout).toContain('::error::Error: uplift not installed');
  //   }
  // });
});
