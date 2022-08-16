const TerserPlugin = require('terser-webpack-plugin');

const reserved = ['Foo', 'BaseModel'];

module.exports = {

    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
                    compress: { side_effects: false },
                    keep_fnames: true,
                    keep_classnames: true,
                    reserved: reserved,
                    mangle: {
                        keep_fnames: true,
                        keep_classnames: true,
                        reserved: reserved,
                        properties: {
                            reserved: reserved
                        }
                    }
                }
            })
        ]
    }
};