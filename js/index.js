require.config({
    baseUrl: 'js',
    paths:   {
        jquery:                  '../node_modules/jquery/dist/jquery.min',
        chosen:                  '../node_modules/chosen-js/chosen.jquery.min',
        uikit:                   '../node_modules/uikit/dist/js/uikit.min',
        uikit_icons:             '../node_modules/uikit/dist/js/uikit-icons.min',
        '../widgets/datepicker': '../node_modules/jquery-ui/ui/widgets/datepicker',
        '../keycode':            '../node_modules/jquery-ui/ui/keycode',
        '../version':            '../node_modules/jquery-ui/ui/version',
        datepicker_ext:          'jquery.datepicker.extension.range.min',
        bx:                      '//api.bitrix24.com/api/v1/?',
        ymaps:                   'https://api-maps.yandex.ru/2.1/?lang=ru_RU',
    },
    shim:    {
        chosen:         { deps: ['jquery'] },
        uikit:          { deps: ['jquery'] },
        uikit_icons:    { deps: ['uikit'] },
        datepicker_ext: { deps: ['jquery', '../widgets/datepicker'] }
    }
});

require(
    ['jquery', 'chosen', 'uikit_icons', 'datepicker_ext', 'bx'],
    () => require(['b24'])
);