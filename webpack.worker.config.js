const path = require("path");

module.exports = {
  mode: "production",
  entry: path.resolve(__dirname, "src/RaytracingWorker.js"),
  output: {
    filename: "raytracingworker.bundle.js",
    path: path.resolve(__dirname, "dist"),
    library: {
      type: "umd",
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
};
