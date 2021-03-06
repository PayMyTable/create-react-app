/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const devPlugins = [
  // Adds hot loader
  // https://github.com/gaearon/react-hot-loader/tree/master/docs#migration-to-30
  require.resolve('react-hot-loader/babel'),
]

const plugins = [
  // class { handleClick = () => { } }
  require.resolve('babel-plugin-transform-class-properties'),
  // The following two plugins use Object.assign directly, instead of Babel's
  // extends helper. Note that this assumes `Object.assign` is available.
  // { ...todo, completed: true }
  [
    require.resolve('babel-plugin-transform-object-rest-spread'),
    {
      useBuiltIns: true,
    },
  ],
  // Transforms JSX
  [
    require.resolve('babel-plugin-transform-react-jsx'),
    {
      useBuiltIns: true,
    },
  ],
  // Polyfills the runtime needed for async/await and generators
  [
    require.resolve('babel-plugin-transform-runtime'),
    {
      helpers: false,
      polyfill: false,
      regenerator: true,
    },
  ],
  // add decoractors
  // Ex: @withRestaurant
  // class ...
  require.resolve("babel-plugin-transform-decorators-legacy"),
  // add trailing function commas
  // Ex: this.myFunc(
  //  a,
  //  b,
  //  c, <--
  // )
  require.resolve("babel-plugin-syntax-trailing-function-commas"),
  // transform the eventual for-of
  // for of is not supported on old browsers
  require.resolve("babel-plugin-transform-es2015-for-of"),

  // https://github.com/lodash/babel-plugin-lodash
  [
    require.resolve("babel-plugin-lodash"),
    {
      // This plugin is moving in a lib agnostic direction, to become a generic cherry-pick plugin
      // so babel-plugin-lodash is not limited to lodash. It can be used with recompose as well.
      // see https://github.com/acdlite/recompose
      id: [
        "lodash",
        "recompose"
      ]
    }
  ]
];

// This is similar to how `env` works in Babel:
// https://babeljs.io/docs/usage/babelrc/#env-option
// We are not using `env` because it’s ignored in versions > babel-core@6.10.4:
// https://github.com/babel/babel/issues/4539
// https://github.com/facebookincubator/create-react-app/issues/720
// It’s also nice that we can enforce `NODE_ENV` being specified.
var env = process.env.BABEL_ENV || process.env.NODE_ENV;
if (env !== 'development' && env !== 'test' && env !== 'production') {
  throw new Error(
    'Using `babel-preset-react-app` requires that you specify `NODE_ENV` or ' +
      '`BABEL_ENV` environment variables. Valid values are "development", ' +
      '"test", and "production". Instead, received: ' +
      JSON.stringify(env) +
      '.'
  );
}

if (env === 'development' || env === 'test') {
  // The following two plugins are currently necessary to make React warnings
  // include more valuable information. They are included here because they are
  // currently not enabled in babel-preset-react. See the below threads for more info:
  // https://github.com/babel/babel/issues/4702
  // https://github.com/babel/babel/pull/3540#issuecomment-228673661
  // https://github.com/facebookincubator/create-react-app/issues/989
  plugins.push.apply(plugins, devPlugins.concat([
    // Adds component stack to warning messages
    require.resolve('babel-plugin-transform-react-jsx-source'),
    // Adds __self attribute to JSX which React will use for some warnings
    require.resolve('babel-plugin-transform-react-jsx-self'),
  ]));
}

if (env === 'test') {
  module.exports = {
    presets: [
      // ES features necessary for user's Node version
      [
        require('babel-preset-env').default,
        {
          targets: {
            node: 'current',
          },
        },
      ],
      // JSX, Flow
      require.resolve('babel-preset-react'),
      //
      require.resolve("babel-preset-stage-1"),
    ],
    plugins: plugins.concat([
      // Compiles import() to a deferred require()
      require.resolve('babel-plugin-dynamic-import-node'),
    ]),
  };
} else {
  module.exports = {
    presets: [
      // Latest stable ECMAScript features
      [
        require.resolve('babel-preset-env'),
        {
          targets: {
            // React parses on ie 9, so we should too
            ie: 9,
            // We currently minify with uglify
            // Remove after https://github.com/mishoo/UglifyJS2/issues/448
            uglify: true,
          },
          // Disable polyfill transforms
          useBuiltIns: false,
          // Do not transform modules to CJS
          modules: false,
        },
      ],
      // JSX, Flow
      // preset "react"
      require.resolve('babel-preset-react'),
      // preset "flow"
      // require.resolve("babel-preset-flow"),
      require.resolve("babel-preset-stage-1"),

      // Important: if you add any preset here, add it to the test configuration above too
    ],
    plugins: plugins.concat([
      // function* () { yield 42; yield 43; }
      [
        require.resolve('babel-plugin-transform-regenerator'),
        {
          // Async functions are converted to generators by babel-preset-env
          async: false,
        },
      ],
      // Adds syntax support for import()
      require.resolve('babel-plugin-syntax-dynamic-import'),

      // Important: if you add any plugin here, add it to the test configuration above too
    ]),
  };

  if (env === 'production') {
    // Optimization: hoist JSX that never changes out of render()
    // Disabled because of issues: https://github.com/facebookincubator/create-react-app/issues/553
    // TODO: Enable again when these issues are resolved.
    // plugins.push.apply(plugins, [
    //   require.resolve('babel-plugin-transform-react-constant-elements')
    // ]);
  }
}
