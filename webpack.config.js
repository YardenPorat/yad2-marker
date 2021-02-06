const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'production',
    entry: {
        contentScript: './project/devContentScript.js', //main js file
        popupCss: './project/popup.css',
    },
    output: {
        path: path.resolve(__dirname, 'dist'), //output folder
        filename: '[name].js', //output file
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: 'babel-loader',
            },
            {
                test: /\.css$/,
                use: [
                    // fallback to style-loader in development
                    process.env.NODE_ENV !== 'production'
                        ? 'style-loader'
                        : MiniCssExtractPlugin.loader,
                    'css-loader',
                ],
            },
        ],
    },
    optimization: {
        minimize: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './project/popup.html',
            filename: 'popup.html',
        }),
    ],
};
