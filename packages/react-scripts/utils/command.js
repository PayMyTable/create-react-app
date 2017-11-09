const execSync = require('child_process').execSync
const fs = require('fs')

const appDirectory = fs.realpathSync(process.cwd())

module.exports = {
  execSimpleSync: (cmd, cb) => {
    const stdout = execSync(cmd, { cwd: appDirectory })
    return String(stdout).split('\n').join('')
  },
  execSimpleSyncOnDirectory: (cmd, cwd, cb) => {
    const stdout = execSync(cmd, { cwd: appDirectory + '/' + cwd })
    return String(stdout).split('\n').join('')
  },
}
