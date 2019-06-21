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
        ymaps_api:               'https://api-maps.yandex.ru/2.1/?lang=ru_RU',
        'promise-polyfill':      '../node_modules/promise-polyfill/dist/polyfill.min',
    },
    shim:    {
        chosen:         { deps: [ 'jquery' ] },
        datepicker_ext: { deps: [ 'jquery', '../widgets/datepicker' ] }
    }
});

require(
    [ 'uikit', 'uikiticons', 'chosen', 'datepicker_ext', 'bx_api', 'promise-polyfill' ],
    (UIkit, icons) => {
        icons(UIkit);

        BX24.init(() => {
            require([ 'settings', 'form', 'ymaps' ], (settings, form, map) => {
                settings.init()
                    .then(() => {

                            let api = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';

                            if (settings.user.api_type > 0) {
                                api += '&apikey=' + settings.user.api_key;
                                if (settings.user.api_not_free)
                                    api = api.replace(/(api-maps)/, 'enterprise.$1');
                            }
                            require(
                                [ api ],
                                () => ymaps.ready(() => form.init()),
                                err => {
                                    UIkit.modal.alert(err.message);
                                    require(
                                        [ 'ymaps_api' ],
                                        () => ymaps.ready(() => form.init()),
                                        err => {
                                            UIkit.modal.alert(err.message);
                                        }
                                    );
                                });

                        }
                    );
            });
        });
    }
);