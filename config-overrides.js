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
      ...config.resolve.alias,
      "@app": path.resolve(__dirname, "src/"),
    },
    plugins: [
      ...(config.resolve.plugins || []),
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, "tsconfig.paths.json"),
      }),
    ],
  };

  const miniCssExtractPlugin = config.plugins.find(
    (plugin) => plugin.constructor.name === 'MiniCssExtractPlugin'
  );

  if (miniCssExtractPlugin) {
    // add ignoreOrder: true option
    miniCssExtractPlugin.options.ignoreOrder = true;
  }
  return config;
};
