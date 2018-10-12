const paths = require('./paths');

const webpackAliases = {
  'pmt-ui': paths.pmtUi, // @PMT
  'pmt-utils': paths.pmtUtils, // @PMT
  'pmt-modules': paths.pmtModules, // @PMT
  'app':  paths.appSrc, // @PMT
}

module.exports = webpackAliases