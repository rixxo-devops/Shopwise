const path = require('path')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { pathToFileURL } = require('url');
const fs = require('fs')

module.exports = function ({ dirname, parent }) {
  const dynamicAliases = {}
  if (parent) {
    dynamicAliases.parent = parent
  }

  const resolutionFolders = [dirname, parent].filter(a => a)

  return {
    entry: {
      'index': [
        './js/index.js',
        './scss/index.scss'
      ]
    },
    output: {
      filename: 'js/[name].js',
      path: path.resolve(dirname, 'web'),
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.s[ac]ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: "sass-loader",
              options: {
                api: 'modern',
                sassOptions: {
                  importers: [
                    {
                      findFileUrl(url) {
                        if (!url.startsWith('@theme/')) {
                          return null;
                        }

                        url = url.replace(/^@theme\//, '')

                        const urlDir = path.dirname(url)
                        let basename = path.basename(url, ".scss") + ".scss"

                        for (const resolutionFolder of resolutionFolders) {
                          const fullPath = path.resolve(resolutionFolder, urlDir)

                          if (
                            fs.existsSync(path.resolve(fullPath, basename))
                            || fs.existsSync(path.resolve(fullPath, "_" + basename))
                          ) {
                            return new URL(basename, pathToFileURL(fullPath + "/"))
                          }
                        }

                        return null
                      }
                    },
                    {
                      findFileUrl(url) {
                        if (!url.startsWith('@parent/')) {
                          return null;
                        }

                        url = url.replace(/^@parent\//, '')
                        return new URL(url, pathToFileURL(parent + "/"))
                      }
                    },
                    {
                      findFileUrl(url) {
                        if (!url.startsWith('~')) return null;

                        return new URL(url.substring(1), pathToFileURL('node_modules/'));
                      }
                    }
                  ]
                }
              }
            }
          ],
        },
      ],
    },
    resolve: {
      alias: {
        'scss': path.resolve(parent || dirname, 'scss/'),
        ...dynamicAliases
      }
    },
    plugins: [
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: "css/[name].css",
        chunkFilename: "[id].css",
      }),
    ],
  }
}
