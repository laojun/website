const path = require('path');
const os = require('os');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SpritesmithPlugin = require('webpack-spritesmith');
const HtmlWebpackInjectPreload = require('@principalstudio/html-webpack-inject-preload');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer'); // help tailwindcss to work
const pkg = require('./package.json');
const WebpckBar = require('webpackbar');
const getTheme = require('./src/views/antd-theme');

const resolve = (pathname) => path.resolve(__dirname, pathname);

const createSprites = () => {
  // 按模块、页面来分sprite文件
  const spriteArr = ['common', 'about', 'home', 'why'];
  return spriteArr.map((item) => (
    new SpritesmithPlugin({
      src: {
        cwd: resolve(`src/images/${item}/icons`),
        glob: '*.png',
      },
      target: {
        image: resolve(`src/images/sprites/sprite-${item}.png`),
        css: [
          [
            resolve(`src/images/sprites/sprite-${item}.scss`),
            {
              format: 'handlebars_based_template',
            },
          ],
        ],
      },
      apiOptions: {
        cssImageRef: `/images/sprites/sprite-${item}.png`,
        handlebarsHelpers: {
          half: (num) => `${parseInt(num) / 2}px`,
        },
      },
      customTemplates: {
        // 自定义sprite模块文件
        handlebars_based_template: resolve('src/images/sprites/sass.template.handlebars'),
      },
    })
  ));
};

module.exports = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProd = nodeEnv === 'production';
  const themeColor = '#5D48DF';

  // eslint-disable-next-line
  const targetConfig = require(`./webpack.${nodeEnv}.js`);
  const theme = getTheme(themeColor) || {};
  const commonConfig = {
    parallelism: os.cpus().length,
    entry: {
      app: ['./src'],
    },
    target: isProd ? 'browserslist' : 'web',
    // cache: {
    //   type: 'filesystem',
    // },
    resolve: {
      symlinks: false,
      fallback: {
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        buffer: require.resolve('buffer/'),
        util: require.resolve('util/'),
      },
      alias: {
        '~': resolve('./src'), // 根目录
        common: resolve('./src/common'),
        pages: resolve('./src/pages'),
        layout: resolve('./src/layout'),
      },
      extensions: ['.js', '.jsx', '.tsx', '.ts', '.d.ts'],
      modules: [resolve('src'), 'node_modules', 'src/images/sprites'],
    },
    module: {
      rules: [
        {
          test: /\.(scss)$/,
          include: [
            resolve('src'),
          ],
          use: [
            ...(isProd ? [MiniCssExtractPlugin.loader] : []),
            // 'thread-loader',
            ...(isProd ? [] : ['style-loader']),
            {
              loader: 'css-loader',
              options: {
                url: false,
                sourceMap: false,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  ident: 'postcss',
                  plugins: [tailwindcss, autoprefixer],
                },
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: false,
                additionalData: `$primary: ${themeColor};`,
              },
            },
            {
              loader: 'sass-resources-loader',
              options: {
                sourceMap: false,
                resources: [
                  // 只能放 variable，mixin等不会产生真实样式的东西，否则会重复很多遍
                  resolve('./src/styles/_variable.scss'),
                  resolve('./src/styles/_color.scss'),
                  resolve('./src/styles/_mixin.scss'),
                  resolve('./src/images/sprites/sprite-common.scss'),
                ],
              },
            },
          ],
        },
        {
          test: /\.(less)$/,
          use: [
            MiniCssExtractPlugin.loader,
            // 'thread-loader',
            'css-loader',
            'postcss-loader',
            {
              loader: 'less-loader',
              options: {
                sourceMap: true,
                lessOptions: {
                  modifyVars: theme,
                  javascriptEnabled: true,
                },
              },
            },
          ],
          include: [
            resolve('node_modules/antd'),
          ],
        },
        {
          test: /\.(css)$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.(tsx?|jsx?)$/,
          include: [
            resolve('src'),
          ],
          use: [
            'thread-loader',
            {
              loader: 'ts-loader',
              options: {
                happyPackMode: true, // IMPORTANT! use happyPackMode mode to speed-up compilation and reduce errors reported to webpack
                transpileOnly: true,
                getCustomTransformers: resolve('webpack_ts.loader.js'),
              },
            },
          ],
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.svg$/,
          use: ['@svgr/webpack'],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[name].[hash].[ext]',
              outputPath: 'images',
            },
          }],
        },
        {
          test: /\.(mp4)$/i,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[name].[hash].[ext]',
              outputPath: 'video',
            },
          }],
        },
      ],
    },
    plugins: [
      ...createSprites(),
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: './src/images',
            to: 'images',
          },
          {
            from: './src/static',
            to: '',
          },
        ],
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './src/views/index.ejs',
        // injectDll: !isProd,
        hash: isProd,
        minify: isProd
          ? {
            collapseWhitespace: true,
            minifyJS: true,
            minifyCSS: true,
            removeEmptyAttributes: true,
          }
          : false,
        themeColor,
      }),
      new HtmlWebpackInjectPreload({
        files: [
          {
            match: /.*\.css$/,
            attributes: {
              type: 'text/css',
              as: 'style',
            },
          },
        ],
      }),
      new webpack.ContextReplacementPlugin(
        // eslint-disable-next-line
        /moment[\\\/]locale$/,
        /(zh-cn)\.js/,
      ),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(nodeEnv),
        'process.env.ERDA_VER': JSON.stringify(pkg.version),
      }),
      new WebpckBar(),
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        minSize: 30000,
        // maxSize: 500000, // 500kb
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 5,
        name: false,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            reuseExistingChunk: true,
            priority: -10,
          },
        },
      },
    },
  };

  return merge(commonConfig, targetConfig);
};
