//
// Contains the definition of all the global modules.
// Note: DO NOT abuse of this.
// For example tr is used on almost every file, so it is usefull.
module.exports = [
  // We don't want to handle React.
  // {
  //   import: 'React',
  //   from: 'react'
  // },
  {
    import: '{ tr }',
    from: 'pmt-modules/i18n',
    functionName: 'tr',
  },
]
