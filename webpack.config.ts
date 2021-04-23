import * as path from 'path'

import * as webpack from 'webpack'
import TerserPlugin from 'terser-webpack-plugin'

const config: webpack.Configuration = {
  mode: 'production',
  entry: path.resolve(__dirname, 'src', 'cli.ts'),
  target: 'node',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: true
      })
    ],
    mangleExports: 'size',
    moduleIds: 'size',
    chunkIds: 'size',
  },
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'cli.js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
      new webpack.BannerPlugin({ raw: true, banner: '#!/usr/bin/env node' })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?/,
        use: 'ts-loader',
        exclude: /node-modules/
      }
    ]
  }
}

export default config
