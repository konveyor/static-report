const path = require("path");

const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = function override(config, env) {
  config.plugins.push(
    new MonacoWebpackPlugin({
      languages: ["xml", "java"],
    })
  );

  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.alias,
      "@app": path.resolve(__dirname, "src/"),
    },
    plugins: [
      ...(config.resolve.plugins || []),
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, "tsconfig.paths.json"),
      }),
    ],
  };

  // Handle .mjs files (ESM modules) properly in webpack 4
  config.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules/,
    type: 'javascript/auto',
  });

  // Override ForkTsCheckerWebpackPlugin to use tsconfig with paths
  const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
  const forkTsCheckerIndex = config.plugins.findIndex(
    (plugin) => plugin instanceof ForkTsCheckerWebpackPlugin
  );
  if (forkTsCheckerIndex !== -1) {
    config.plugins[forkTsCheckerIndex] = new ForkTsCheckerWebpackPlugin({
      ...config.plugins[forkTsCheckerIndex].options,
      tsconfig: path.resolve(__dirname, "tsconfig.paths.json"),
    });
  }

  const miniCssExtractPlugin = config.plugins.find(
    (plugin) => plugin.constructor.name === 'MiniCssExtractPlugin'
  );

  if (miniCssExtractPlugin) {
    // add ignoreOrder: true option
    miniCssExtractPlugin.options.ignoreOrder = true;
  }
  return config;
};
