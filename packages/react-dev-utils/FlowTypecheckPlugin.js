/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */


 // Taken from https://github.com/Timer/create-react-app/blob/800af94575280a4e024983bb34980200c9a4b7f9/packages/react-dev-utils/FlowTypecheckPlugin.js

'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const childProcess = require('child_process');
const flowBinPath = require('flow-bin');

function exec(command, args, options) {
  return new Promise((resolve, reject) => {
    var stdout = new Buffer('');
    var stderr = new Buffer('');
    var oneTimeProcess = childProcess.spawn(command, args, options);
    oneTimeProcess.stdout.on('data', chunk => {
      stdout = Buffer.concat([stdout, chunk]);
    });
    oneTimeProcess.stderr.on('data', chunk => {
      stderr = Buffer.concat([stderr, chunk]);
    });
    oneTimeProcess.on('error', error => reject(error));
    oneTimeProcess.on('exit', code => {
      switch (code) {
        case 0: {
          return resolve(stdout);
        }
        default: {
          return reject(new Error(Buffer.concat([stdout, stderr]).toString()));
        }
      }
    });
  });
}

function createVersionWarning(flowVersion) {
  return 'Flow: ' +
    chalk.red(
      chalk.bold(
        `Your global flow version is incompatible with this tool.
To fix warning, uninstall it or run \`npm install -g flow-bin@${flowVersion}\`.`
      )
    );
}

function formatFlowErrors(error) {
  return error
    .toString()
    .split('\n')
    .filter(line => {
      return !(/flow is still initializing/.test(line) ||
        /Found \d+ error/.test(line) ||
        /The flow server is not responding/.test(line) ||
        /Going to launch a new one/.test(line) ||
        /The flow server is not responding/.test(line) ||
        /Spawned flow server/.test(line) ||
        /Logs will go to/.test(line) ||
        /version didn't match the client's/.test(line));
    })
    .map(line => line.replace(/^Error:\s*/, ''))
    .join('\n');
}

function getFlowVersion(global) {
  return exec(global ? 'flow' : flowBinPath, ['version', '--json'])
    .then(data => JSON.parse(data.toString('utf8')).semver || '0.0.0')
    .catch(() => null);
}

class FlowTypecheckPlugin {
  constructor() {
    this.shouldRun = false;
    this.flowStarted = false;
    this.flowStarting = null;

    this.flowVersion = require(path.join(
      __dirname,
      'package.json'
    )).dependencies['flow-bin'];
  }

  startFlow(cwd) {
    if (this.flowStarted) {
      return Promise.resolve();
    }
    if (this.flowStarting != null) {
      return this.flowStarting.then(err => {
        // We need to do it like this because of unhandled rejections
        // ... basically, we can't actually reject a promise unless someone
        // has it handled -- which is only the case when we're returned from here
        if (err != null) {
          throw err;
        }
      });
    }
    console.log(chalk.cyan('Starting the flow server ...'));
    const flowConfigPath = path.join(cwd, '.flowconfig');
    let delegate;
    this.flowStarting = new Promise(resolve => {
      delegate = resolve;
    });
    return getFlowVersion(true)
      .then(globalVersion => {
        if (globalVersion === null) return;
        return getFlowVersion(false).then(ourVersion => {
          if (globalVersion !== ourVersion) {
            return Promise.reject('__FLOW_VERSION_MISMATCH__');
          }
        });
      })
      .then(
        () => new Promise(resolve => {
          fs.access(flowConfigPath, err => {
            if (err) {
              resolve(exec(flowBinPath, ['init'], { cwd }));
            } else {
              resolve();
            }
          });
        })
      )
      .then(() => exec(flowBinPath, ['stop'], {
        cwd,
      }))
      .then(() => exec(flowBinPath, ['start'], { cwd }).catch(err => {
        if (
          typeof err.message === 'string' &&
          err.message.indexOf('There is already a server running') !== -1
        ) {
          return true;
        } else {
          throw err;
        }
      }))
      .then(() => {
        this.flowStarted = true;
        delegate();
        this.flowStarting = null;
      })
      .catch(err => {
        delegate(err);
        this.flowStarting = null;
        throw err;
      });
  }

  apply(compiler) {
    compiler.plugin('compile', () => {
      this.shouldRun = false;
    });

    compiler.plugin('compilation', compilation => {
      compilation.plugin('normal-module-loader', (loaderContext, module) => {
        if (
          this.shouldRun ||
          module.resource.indexOf('node_modules') !== -1 ||
          !/[.]js(x)?$/.test(module.resource)
        ) {
          return;
        }
        const contents = loaderContext.fs.readFileSync(module.resource, 'utf8');
        if (
          /^\s*\/\/.*@flow/.test(contents) || /^\s*\/\*.*@flow/.test(contents)
        ) {
          this.shouldRun = true;
        }
      });
    });

    // Run lint checks
    compiler.plugin('emit', (compilation, callback) => {
      if (!this.shouldRun) {
        callback();
        return;
      }
      const cwd = compiler.options.context;
      const first = this.flowStarting == null && !this.flowStarted;
      this.startFlow(cwd)
        .then(() => {
          if (first) {
            console.log(
              chalk.yellow(
                'Flow is initializing, ' +
                  chalk.bold('this might take a while...')
              )
            );
          } else {
            console.log('Running flow...');
          }
          exec(flowBinPath, ['status', '--color=always'], { cwd })
            .then(() => {
              callback();
            })
            .catch(e => {
              compilation.warnings.push(formatFlowErrors(e));
              callback();
            });
        })
        .catch(e => {
          if (e === '__FLOW_VERSION_MISMATCH__') {
            compilation.warnings.push(createVersionWarning(this.flowVersion));
          } else {
            compilation.warnings.push(
              'Flow: Type checking has been disabled due to an error in Flow.'
            );
          }
          callback();
        });
    });
  }
}

module.exports = FlowTypecheckPlugin;
