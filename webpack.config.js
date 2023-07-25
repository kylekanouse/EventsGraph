const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
require('dotenv').config({ path: process.cwd() + '/src/server/.env' });

const outputDirectory = 'dist';

module.exports = {
  entry: ['babel-polyfill', './src/client/index.tsx'],
  output: {
    path: path.join(__dirname, outputDirectory),
    filename: './js/[name].bundle.js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'awesome-typescript-loader'
          },
        ],
        exclude: /node_modules/
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader'
      },
      { 
        test: /\.css$/, use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000'
      },
    ]
  },
  resolve: {
    extensions: ['*', '.ts', '.tsx', '.js', '.jsx', '.json', '.css']
  },
  devServer: {
    port: 3000,
    open: true,
    hot: true,
    proxy: {
      '/api/**': {
        target: 'http://localhost:8050',
        secure: false,
        changeOrigin: true
      }
    }
  },
  plugins: [
    new CleanWebpackPlugin([outputDirectory]),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'EventsGraph',
    }),
    new MiniCssExtractPlugin({
      filename: './css/[name].css',
      chunkFilename: './css/[id].css',
    }),
    new CopyPlugin([
      { from: './public/favicon', to: 'favicon'},
      { from: './src/client/assets', to: 'assets'},
      { from: './src/client/data', to: 'data'}
    ]),
    new webpack.DefinePlugin({
      __ENV__                                                     : JSON.stringify(process.env.ENV),
      __ENABLE_STATS__                                            : process.env.ENABLE_STATS,
      __API_SERVICE_URL__                                         : JSON.stringify(process.env.CLIENT_BASE_URL),
      __API_BASE_PATH__                                           : JSON.stringify(process.env.BASE_API_ENDPOINT_PATH),
      __WS_SERVICE_URL__                                          : JSON.stringify(process.env.WS_URL),
      __MAIN_FONT_URL__                                           : JSON.stringify(process.env.MAIN_FONT_URL),
      __INIT_SOUND_LOAD_URL__                                     : JSON.stringify(process.env.INIT_GRAPH_LOAD_SOUND_URL),
      __TWITTER_TEST_TWEET_ID__                                   : JSON.stringify(process.env.TWITTER_TEST_TWEET_ID),
      __TWITTER_TEST_TWEET_IDS__                                  : JSON.stringify(process.env.TWITTER_TEST_TWEET_IDS),
      __TWITTER_TEST_TWEET_SEARCH_QUERY__                         : JSON.stringify(process.env.TWITTER_TEST_TWEET_SEARCH_QUERY),
      __TWITTER_TEST_USERNAME_IDS__                               : JSON.stringify(process.env.TWITTER_TEST_USERNAME_IDS),
      __TWITTER_DEFAULT_FILTERED_STREAM_SAMPLE_SIZE__             : JSON.stringify(process.env.DEFAULT_VALUE_TWEET_STREAM_BATCH_COUNT),
      __OBSERVER_GRAPH_LOADED_CHANNEL_ID__                        : JSON.stringify('graphLoaded'),
      __OBSERVER_ENTITY_CLICKED_CHANNEL_ID__                      : JSON.stringify('entityClicked'),
      __OBSERVER_ENTITY_ACTIVE_CHANNEL_ID__                       : JSON.stringify('entityActive'),
      __OBSERVER_ENTITY_FOCUSED_CHANNEL_ID__                      : JSON.stringify('entityFocused'),
      __OBSERVER_ENTITY_HOVER_CHANNEL_ID__                        : JSON.stringify('entityHover'),
      __OBSERVER_ENTITY_ON_STAGE_CHANNEL_ID__                     : JSON.stringify('entityOnStage'),
      __OBSERVER_ENTITIES_ON_STAGE_CHANNEL_ID__                   : JSON.stringify('entitiesOnStage'),
      __OBSERVER_VRCONTROLS_CLICKED_CHANNEL_ID__                  : JSON.stringify('vrClickedControls'),
      __OBSERVER_COMMANDS_CHANNEL_ID__                            : JSON.stringify('commands'),
      __OBSERVER_NODE_CLICKED_CHANNEL_ID__                        : JSON.stringify('nodeClicked'),
      __OBSERVER_NODE_FOCUSED_CHANNEL_ID__                        : JSON.stringify('nodeFocused'),
      __OBSERVER_NODE_ACTIVE_CHANNEL_ID__                         : JSON.stringify('nodeActive'),
      __OBSERVER_NODES_ACTIVE_CHANNEL_ID__                        : JSON.stringify('nodesActive'),
      __OBSERVER_NODES_ON_STAGE_CHANNEL_ID__                      : JSON.stringify('nodesOnStage'),
      __OBSERVER_KEYS_CONTROLS_CHANNEL_ID__                       : JSON.stringify('keysControls'),
      __OBSERVER_INTERACTIVE_ENTITY_ON_STAGE_CHANNEL_ID__         : JSON.stringify('interactiveEntityOnStage'),
      __OBSERVER_INTERACTIVE_ENTITIES_ON_STAGE_CHANNEL_ID__       : JSON.stringify('interactiveEntitiesOnStage'),
      __OBSERVER_NAV_SELECTED_TYPES_CHANNEL_ID__                  : JSON.stringify('navSelectedTypes'),
      __OBSERVER_NAVIGATION_CHANNEL_ID__                          : JSON.stringify('nav'),
    })
  ],
};
