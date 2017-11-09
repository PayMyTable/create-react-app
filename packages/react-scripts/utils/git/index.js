const execSimpleSync = require('../command').execSimpleSync
const execSimpleSyncOnDirectory = require('../command').execSimpleSyncOnDirectory

module.exports = {
  lastAppCommit: () => {
    return execSimpleSync(
      'git rev-parse --short HEAD'
    )
  },

  lastSdkCommit: () => {
    return execSimpleSyncOnDirectory(
      'git rev-parse --short HEAD',
      'pmt-react-sdk'
    )
  },


  //
  // https://stackoverflow.com/questions/6245570/how-to-get-the-current-branch-name-in-git
  //

  currentProjectBranch: () => {
    return execSimpleSync(
      'git rev-parse --abbrev-ref HEAD'
    )
  },

  currentSdkBranch: () => {
    return execSimpleSyncOnDirectory(
      'git rev-parse --abbrev-ref HEAD',
      'pmt-react-sdk'
    )
  },

}
