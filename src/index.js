/**
 * TODO: сделать панель настроек полей
 *  сделать css для печати карты на принтере (с указанием параметров фильтра)
 *  помечать на календаре праздничные и сокращенные дни
 */

require.config({
    baseUrl: 'js',
    paths:   {
        jquery:                  '../node_modules/jquery/dist/jquery.min',
        chosen:                  '../node_modules/chosen-js/chosen.jquery.min',
        uikit:                   '../node_modules/uikit/dist/js/uikit.min',
        uikiticons:              '../node_modules/uikit/dist/js/uikit-icons.min',
        '../widgets/datepicker': '../node_modules/jquery-ui/ui/widgets/datepicker',
        '../keycode':            '../node_modules/jquery-ui/ui/keycode',
        '../version':            '../node_modules/jquery-ui/ui/version',
        datepicker_ext:          'jquery.datepicker.extension.range.min',
        bx_api:                  '//api.bitrix24.com/api/v1/?',
        map:                     'ymaps',
        // map:                     'osm',
        polyfill:                '../node_modules/@babel/polyfill/dist/polyfill.min',
    },
    shim:    {
        chosen:         { deps: [ 'jquery' ] },
        datepicker_ext: { deps: [ 'jquery', '../widgets/datepicker' ] }
    }
});

require(
    [ 'uikit', 'uikiticons', 'chosen', 'datepicker_ext', 'bx_api', 'polyfill' ],
    (UIkit, icons) => {
        icons(UIkit);

        BX24.init(() => {

            require([ 'settings', 'form', 'map' ], (settings, form, map) => {

                settings.init()
                    .then(() => map.init())
                    .then(() => form.init());

            });
        });
    }
);