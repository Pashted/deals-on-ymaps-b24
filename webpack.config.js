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
        filename:       '[name].js',
        path:           path.resolve('./js'),
        library:        'mapModule',
        libraryTarget:  'amd',
        // umdNamedDefine: true
    },

    // resolve: {
    //     alias: {
    //
    //         jquery:                  '../node_modules/jquery/dist/jquery.min',
    //         chosen:                  '../node_modules/chosen-js/chosen.jquery.min',
    //         uikit:                   '../node_modules/uikit/dist/js/uikit.min',
    //         uikiticons:              '../node_modules/uikit/dist/js/uikit-icons.min',
    //         '../widgets/datepicker': '../node_modules/jquery-ui/ui/widgets/datepicker.js',
    //         '../keycode':            '../node_modules/jquery-ui/ui/keycode.js',
    //         '../version':            '../node_modules/jquery-ui/ui/version.js',
    //         datepicker_ext:          './jquery.datepicker.extension.range.min.js',
    //         bx_api:                  '//api.bitrix24.com/api/v1/?',
    //         // map:                     'ymaps',
    //         // ol:                      '../node_modules/ol',
    //         map:                     '../js/osm',
    //         polyfill:                '../node_modules/@babel/polyfill/dist/polyfill.min',
    //     }
    // },

    optimization: {
        splitChunks: {
            cacheGroups: {
                vendors: {
                    chunks:  'initial',
                    name:    'vendors',
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
            },
            // {
            //     test: /bitrix24/,
            //     use:  { loader: "url-loader" }
            // }
        ]
    }

};
