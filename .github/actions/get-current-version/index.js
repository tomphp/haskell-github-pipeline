const core = require('@actions/core');
const exec = require('@actions/exec');

function execAndCapture(command, args) {
  let stdout = '';
  let stderr = '';
  const options = {
    listeners: {
      stdout: (data) => {
        stdout += data.toString();
      },
      stderr: (data) => {
        stderr += data.toString();
      },
    },
  };
  return exec
    .exec(command, args, options)
    .then(() => ({ stdout, stderr, errorCode: 0 }))
    .catch((error) => ({ stdout, stderr, errorCode: error.errorCode }));
}

function isVersion(tag) {
  return tag.match(/^v\d+\.\d+\.\d+$/);
}

async function getCurrentVersion() {
  const { stdout } = await execAndCapture('git', ['tag']);
  const tags = stdout.trim().split('\n');
  const versions = tags.filter(isVersion);
  return versions[versions.length - 1];
}

try {
  getCurrentVersion()
    .then((version) => { core.setOutput('current-version', version); })
    .catch((error) => { core.setFailed(error); });
} catch (error) {
  core.setFailed(error.message);
}
