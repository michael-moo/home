
module.exports = {
    entry: "./app.js",
    //entry: ['babel-polyfill', './app.js'],
    output: {
        filename: "app.js",
        path: "build/"
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: '/node_modules/',
                query: {
                    //plugins: ['transform-runtime'],
                    presets: ['es2015', 'stage-0']
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    plugins: []
};
