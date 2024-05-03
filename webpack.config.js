const {resolve} = require("path");

module.exports = {
    optimization: {
        minimize: true,
    },
    devServer: {
        // hot: true,
        // port:3322,
        // contentBase:"./dist"
        // open: true,
        // host: "localhost",
    },
    target: 'node',
    mode: "development",
    performance: {
        maxEntrypointSize: 10000000, maxAssetSize: 30000000,
    },
    entry: "./src/main",
    output: {
        path: resolve(resolve(), "dist"), filename: "index.js",
    },
    experiments: {
    },
    plugins: [],
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    externals: {
        //
    },
    resolve: {
        extensions: [".tsx", ".ts", ".jsx", ".js", "..."], alias: {
            "@": resolve(resolve(), "src"),
        },
    },
};

