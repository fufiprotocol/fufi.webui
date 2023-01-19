const CompressionWebpackPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analygit')
class Bundle {
    isDevelopment = process.env.NODE_ENV === 'development';
    isAnalyzer = process.env.ANALYZER;
    ignoreSomethingAboutDev = config => {
        config.devtool = this.isDevelopment ? 'cheap-module-source-map' : false;
        if (config.optimization.minimizer) {
            config.optimization.minimizer.forEach(minimizer => {
                if (minimizer.constructor.name === 'TerserPlugin') {
                    minimizer.options.terserOptions.compress.warnings = false;
                    minimizer.options.terserOptions.compress.drop_console = true;
                    minimizer.options.terserOptions.compress.drop_debugger = true;
                }
            });
        }
        return config;
    };
    addAnalyzerPlugin = config => {
        if (this.isAnalyzer) {
            config.plugins.push(new BundleAnalyzerPlugin());
        }

        return config;
    };
    splitChunks = config => {
        if (this.isDevelopment) {
            return config;
        }

        config.optimization.splitChunks = {
            chunks: 'all',
            minChunks: 1,
            minSize: 0,
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: 5,
                    reuseExistingChunk: true,
                    name: 'c',
                },
                framework: {
                    test: /material-ui/,
                    name: 'm',
                    priority: 10,
                },
            },
        };
        return config;
    };
    addCompressionPlugin = config => {
        if (process.env.NODE_ENV === 'development') {
            return config;
        }

        config.plugins.push(
            new CompressionWebpackPlugin({
                test: /\.(css|js)$/,
                threshold: 1024,
                minRatio: 0.8,
            }),
        );

        return config;
    };
}

module.exports = new Bundle();
