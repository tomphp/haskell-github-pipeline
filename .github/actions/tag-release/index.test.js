const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

describe('tag-release', () => {
  test('when uplift is not installed', async () => {
    const tempBin = fs.mkdtempSync(path.join(os.tmpdir(), 'action-test-git-repo'));
    await exec(`echo "exit 1" >"${tempBin}/uplift"`);
    await exec(`chmod +x "${tempBin}/uplift"`);

    expect.assertions(1);
    try {
      await exec(
        `PATH="${tempBin}:$PATH" node '${__dirname}/index.js'`,
        { env: { ...process.env, 'INPUT_EXPECTED_VERSION': 'v2.0.0' } },
      );
    } catch (error) {
      expect(error.stdout).toContain('::error::Error: uplift not installed');
    }
  });

  test('tagging a new release', async () => {
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

    await exec(
      `node ${__dirname}/index.js`,
      { env: { ...process.env, 'INPUT_EXPECTED_VERSION': 'v1.1.0' } },
    );

    const { stdout } = await exec('git tag --points-at HEAD');
    expect(stdout.split('\n')).toContain('v1.1.0');
  });

  test('unexpected version', async () => {
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

    expect.assertions(1);
    try {
      await exec(
        `node ${__dirname}/index.js`,
        { env: { ...process.env, 'INPUT_EXPECTED_VERSION': 'v2.0.0' } },
      );
    } catch (error) {
      expect(error.stdout).toContain('::error::Expected version to be v2.0.0, got v1.1.0');
    }
  });
});
