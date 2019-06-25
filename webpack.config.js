const path = require('path'),
    webpack = require('webpack');


let dev = true;

process.argv.forEach(param => {
    // если webpack запущен с командой --mode production
    if (param === 'production')
        dev = false;
});


module.exports = {
    devtool: dev && 'source-map',
    context: path.resolve('./src/'),
    entry:   { osm: './osm.js' },

    output: {
        filename: '[name].js',
        path:     path.resolve('./js'),
    },

    // resolve: {
    //     alias: {
    //         'uikit-icons':          path.resolve('./node_modules/uikit/dist/js/uikit-icons'),
    //         'highcharts/highstock': path.resolve(`./node_modules/highcharts/highstock.src.js`),
    //         'timeframesMultiplies': path.resolve(`./components/storage/data/timeframes`),
    //     }
    // },

    optimization: {
        splitChunks: {
            cacheGroups: {
                OpenLayers: {
                    chunks:  'initial',
                    name:    'OpenLayers',
                    test:    /node_modules/,
                    enforce: true
                }
            }
        }
    },


    module: {
        rules: [
            {
                test:    /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use:     { loader: "babel-loader" }
            }
        ]
    }

};
