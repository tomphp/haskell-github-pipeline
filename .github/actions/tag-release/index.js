const core = require('@actions/core');
const exec = require('@actions/exec');

function execAndCapture(command, args) {
  let stdout = '';
  let stderr = '';
  const options = {
    listeners: {
      stdout: (data) => {
        console.log(data.toString());
        stdout += data.toString();
      },
      stderr: (data) => {
        console.error(data.toString());
        stderr += data.toString();
      },
    },
  };
  return exec
    .exec(command, args, options)
    .then(() => ({ stdout, stderr, errorCode: 0 }))
    .catch((error) => ({ stdout, stderr, errorCode: error.errorCode }));
}

async function checkUpliftIsInstalled() {
  try {
    await exec.exec('uplift', ['version']);
  } catch (error) {
    console.error(error.message);
    throw new Error(
      'uplift not installed\n'
        + '\n'
        + 'Try adding the following step before this one:\n'
        + '\n'
        + '- name: Install Uplift\n'
        + '  uses: gembaadvantage/uplift-action@v2\n'
        + '  with:\n'
        + '    version: latest\n'
        + '    install-only: true\n'
        + '    args: version\n',
    );
  }
}

async function tagNextVersion() {
  await checkUpliftIsInstalled();

  const { stdout, stderr } = await execAndCapture('uplift', ['release', /* '--fetch-all', */ '--no-push']);

  //   if (stderr.includes('no commits trigger a change in semantic version')) {
  //     return '';
  //   }

  const found = stderr.match(/identified next tag *tag=(.*)/);
  if (found) {
    return found[1];
  }

//   throw new Error('Unexpected result');
}

try {
  const expectedVersion = core.getInput('expected-version', { required: true });
  tagNextVersion()
    .then((version) => {
      if (version != expectedVersion) {
        core.setFailed(`Expected version to be ${expectedVersion}, got ${version}`);
      }
    })
    .catch((error) => { core.setFailed(error); });
} catch (error) {
  core.setFailed(error.message);
}
