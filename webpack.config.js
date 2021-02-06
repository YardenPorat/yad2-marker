const path = require('path');
const BrowserExtensionPlugin = require('extension-build-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'production',
    entry: './project/devContentScript.js', //source js file
    output: {
        path: path.resolve(__dirname, 'dist'), //output folder
        filename: 'contentScript.js', //output file
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: 'babel-loader',
            },
        ],
    },
    plugins: [
        new BrowserExtensionPlugin({
            devMode: false,
            name: 'yad2-marker.zip',
            directory: 'zips',
            updateType: 'minor',
        }),
        new HtmlWebpackPlugin({
            template: './project/popup.html',
            filename: 'popup.html',
        }),
    ],
};
