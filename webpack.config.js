//@ts-check

'use strict';

const path = require('path');

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
	target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
	mode: 'production', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

	entry: './src/UnrealVsCodeHelper.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
	output: {
		// the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
		path: path.resolve(__dirname, 'dist'),
		filename: 'extension.js',
		libraryTarget: 'commonjs2'
	},
	externals: {
		vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
		// modules added here also need to be added in the .vscodeignore file
	},
	resolve: {
		// support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
		extensions: ['.ts', '.tsx', '.js', '.jsx']
	},
	module: {
		rules: [
			{
				test: /\.(css)$/i,
				use: ["style-loader", "css-loader"],
			},
			{
				test: /\.(ts|tsx|js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						cacheDirectory: true,
						cacheCompression: true,
					},
				},
			}
		]
	},
	devtool: 'nosources-source-map',
	infrastructureLogging: {
		level: "log", // enables logging required for problem matchers
	},
};

function GenerateAllViewConfigutation(views) {
	return (views.map((entry) => {
		return ({
			target: ['web'],
			mode: 'production',

			entry: `./src/Views/${entry}.tsx`,
			output: {
				path: path.resolve(__dirname, 'dist'),
				filename: `UVCH-${entry}.js`,
				libraryTarget: 'commonjs2'
			},
			resolve: {
				extensions: ['.ts', '.tsx', '.js', '.jsx'],
			},
			module: {
				rules: [
					{
						test: /\.(css)$/i,
						use: ["style-loader", "css-loader"],
					},
					{
						test: /\.(ts|tsx|js|jsx)$/,
						exclude: /node_modules/,
						use: {
							loader: 'babel-loader',
							options: {
								cacheDirectory: true,
								cacheCompression: true,
							},
						},
					},
				]
			},
			devtool: 'nosources-source-map',
			infrastructureLogging: {
				level: "log", // enables logging required for problem matchers
			},
		});
	}));
}

module.exports = [ extensionConfig, ...GenerateAllViewConfigutation(
	[
		"UnrealProjectView",
		"UnrealDocView"
	])
];