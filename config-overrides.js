const path = require("path");

const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

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
