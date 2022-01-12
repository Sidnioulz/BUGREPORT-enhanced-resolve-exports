const path = require('path')

module.exports = {
  mode: 'development',
	entry: './src/index.js',
	output: {
    path: path.resolve(__dirname, 'build'),
		filename: 'index.js',
	},
	resolve: {
		// exportsFields: ['basicExports', 'exports'], // uncomment to succeed.
	},
}
