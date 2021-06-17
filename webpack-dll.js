const path = require('path');
const webpack = require('webpack');

const vendors = [
  'react',
  'react-dom',
  'lodash',
  'antd',
  'react-router-dom',
  'axios',
];

module.exports = {
  mode: 'development',
  entry: { vendor: vendors },
  output: {
    path: path.join(__dirname, 'public/static'),
    filename: 'dll.js',
    library: '[name]_[hash]',
  },
  // resolve: {
  //   extensions: ['.js', '.jsx', '.tsx', '.ts', '.d.ts'],
  // },
  // module: {
  //   rules: [
  //     {
  //       test: /\.(tsx?|jsx?)$/,
  //       use: [
  //         {
  //           loader: 'ts-loader',
  //           options: {
  //             transpileOnly: true,
  //             allowTsInNodeModules: true,
  //           },
  //         },
  //       ],
  //     },
  //   ],
  // },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, 'public/manifest.json'),
      name: '[name]_[hash]',
      context: __dirname,
    }),
  ],
};
