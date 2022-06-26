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
        'uplift not installed\n' +
        '\n' +
        'Try adding the following step before this one:\n' +
        '\n' +
        '- name: Install Uplift\n' +
        '  uses: gembaadvantage/uplift-action@v2\n' +
        '  with:\n' +
        '    version: latest\n' +
        '    install-only: true\n' +
        '    args: version\n'
    )
  }    
}

async function getNextVersion() {
  await checkUpliftIsInstalled();
  
  const { stderr } = await execAndCapture('uplift', ['release', '--dry-run']);
  if (stderr.includes('no commits trigger a change in semantic version')) {
    return '';
  }

  const found = stderr.match(/identified next tag *tag=(.*)/);
  if (found) {
    return found[1];
  }

  throw new Error('Unexpected result');
}

try {
  getNextVersion()
    .then((version) => { core.setOutput('next-version', version); })
    .catch((error) => { core.setFailed(error); });
} catch (error) {
  core.setFailed(error.message);
}
