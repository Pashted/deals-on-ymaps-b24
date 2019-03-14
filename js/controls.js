let control = $('.map-control'),
    map = $('#map'),
    start = $('[name="startDate"]'),
    end = $('[name="endDate"]'),
    reload_btn = control.find('.reload'),
    log = control.find('#log'),

    format_date = (timestamp) => {
        let date = new Date(timestamp),
            d = date.getDate(),
            m = date.getMonth() + 1,  // месяцы в js с 0 по 11
            y = date.getFullYear(),
            h = date.getHours(),
            min = date.getMinutes();

        if (d.toString().length === 1) d = "0" + d;
        if (m.toString().length === 1) m = "0" + m;
        if (h.toString().length === 1) h = "0" + h;
        if (min.toString().length === 1) min = "0" + min;

        return `${d}.${m}.${y} ${h}:${min}`;
    },

    format_phones = (phones) => {
        let result = "";

        jQuery.each(phones, function (i, phone) {
            let tel = phones.length === 1 ? "" : " " + (i + 1);
            result += `<b>Телефон${tel}:</b> <a href='tel:${phone.VALUE.replace(/[^0-9+]/, "")}'>${phone.VALUE}</a><br>`
        });

        return result;
    };


// TODO: сделать панель настроек полей: выбор свойства адреса, свойства даты, показывать/скрывать сделки без адреса, без даты
// сделать css для печати карты на принтере (с указанием выбранными фильтрами)

control.on({
    init() {
        /**
         * Выпадающие списки
         */
        $("select").chosen({
            no_results_text:         "Ничего не найдено!",
            placeholder_text_single: 'Выберите из списка',
            width:                   "250px"
        });

        /**
         * Кнопка перезагрузки карты
         */
        reload_btn.on('click', () => {
            if (reload_btn.hasClass('loading'))
                return false;

            reload_btn.addClass('loading').text('Очистка значений...');
            dots = [];

            console.clear();
            log.text('');

            myMap.geoObjects.removeAll();
            objectManager.removeAll();

            map.trigger("bx_set_deals");

        });

        /**
         * Выбор даты
         */
        let date_filter = control.find('[name="date-filter"]'),
            date_range_area = $('#date-range');

        date_range_area.datepicker({
            range:             'period', // режим - выбор периода
            numberOfMonths:    1,
            onSelect:          (dateText, inst, extensionRange) => {
                // extensionRange - объект расширения
                start.val(extensionRange.startDateText);
                end.val(extensionRange.endDateText);
                date_filter.filter('[value="range"]').click();
            },
            showOtherMonths:   true,
            selectOtherMonths: true
        });

        // объект расширения (хранит состояние календаря)
        let extensionRange = date_range_area.datepicker('widget').data('datepickerExtensionRange');

        date_filter.on('change', function () {
            let val = $(this).val();
            if (val === 'today' || val === 'tomorrow') {
                let range = ['+0d', '+0d'];
                console.log(val);
                if (val === 'tomorrow')
                    range = ['+1d', '+1d'];

                date_range_area.datepicker('setDate', range);
                start.val(extensionRange.startDateText);
                end.val(extensionRange.endDateText);
            }
            reload_btn.removeClass('loading');
        });
        date_filter.filter('[value="today"]').click();

        /**
         * Модальное окно
         */
        settings.on({
            'show.uk.modal': () => {
                console.log('USER_SETTINGS', user_settings);
                // settings.trigger('init_form');
            },
            'hide.uk.modal': () => {
            }
        });

        settings.find('.api-settings [type=radio]').on({
            change() {
                if ($(this).val() === '1')
                    settings.find('.api-settings [type=text]').prop('disabled', false).focus();
                else
                    settings.find('.api-settings [type=text]').prop('disabled', true);

            }
        });

        settings.find('.save-settings').click(() => settings.trigger('save'));

        settings.find('.reset-settings').click(
            () => UIkit.modal.confirm('Это действие невозможно отменить. Вы действительно хотите удалить все настройки модуля?', {stack: true})
                .then(() => settings.trigger('reset'), () => console.log('reset promise rejected'))
        );
    }
});
