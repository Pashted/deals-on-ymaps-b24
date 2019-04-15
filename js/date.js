define(() => {

    /**
     * Выбор даты
     */
    return {
        start:       $('[name="startDate"]'),
        end:         $('[name="endDate"]'),
        date_filter: $('[name="date-filter"]'),
        init() {
            let date_range_area = $('#date-range'),
                $this = this;

            date_range_area.datepicker({
                range:             'period', // режим - выбор периода
                numberOfMonths:    1,
                onSelect:          (dateText, inst, extensionRange) => {
                    // extensionRange - объект расширения
                    $this.start.val(extensionRange.startDateText);
                    $this.end.val(extensionRange.endDateText);
                    $this.date_filter.filter('[value="range"]').click();

                    $('.reload').removeClass('loading').text('Применить');
                },
                showOtherMonths:   true,
                selectOtherMonths: true
            });

            // объект расширения (хранит состояние календаря)
            let extensionRange = date_range_area.datepicker('widget').data('datepickerExtensionRange');

            $this.date_filter.on('change', function () {
                let val = $(this).val();
                if (val === 'today' || val === 'tomorrow') {
                    let range = ['+0d', '+0d'];
                    console.log(val);
                    if (val === 'tomorrow')
                        range = ['+1d', '+1d'];

                    date_range_area.datepicker('setDate', range);
                    $this.start.val(extensionRange.startDateText);
                    $this.end.val(extensionRange.endDateText);
                }
                // TODO: сделать сброс кнопки по событию input в нижних полях ввода
                // $('.reload').removeClass('loading');
            });
            $this.date_filter.filter('[value="today"]').click();
        },

        format_date(timestamp) {
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
        }
    }
});