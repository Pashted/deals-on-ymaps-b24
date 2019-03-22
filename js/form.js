define(['b24', 'ymaps', 'date', 'settings', 'uikit'], (b24, map, date, settings, UIkit) => {

    let format_phones = (phones) => {
        let result = "";

        $.each(phones, function (i, phone) {
            let tel = phones.length === 1 ? "" : " " + (i + 1);
            result += `<b>Телефон${tel}:</b> <a href='tel:${phone.VALUE.replace(/[^0-9+]/, "")}'>${phone.VALUE}</a><br>`;
        });

        return result;
    };

    return {
        reload_btn:    $('.reload'),
        log:           $('#log'),
        statuses_list: $('#select-deals-status'),
        field_names:   {},

        init() {
            console.log('form.init START');

            date.init();
            this.modal_init();


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
            this.reload_btn.on('click', () => {
                if (this.reload_btn.hasClass('loading'))
                    return false;

                this.log.text('');
                console.clear();
                map.clear();

                this.search();
            });

            $('.api-settings [type=radio]').on({
                change() {
                    let val = $(this).val() !== '1';

                    $('.api-settings [type=text]').prop('disabled', val).focus();
                    $('.api-settings [type=checkbox]').prop('disabled', val);
                }
            });

            $('.save-settings').click(() => settings.save());

            $('.reset-settings').click(
                () => UIkit.modal.confirm('Это действие невозможно отменить. Вы действительно хотите удалить все настройки модуля?', { stack: true })
                    .then(
                        () => settings.reset()
                            .then(() => this.modal_init()),
                        () => console.log('reset promise rejected')
                    )
            );

        },

        search() {
            console.log('form.search START');

            this.reload_btn.addClass('loading').text('Загрузка сделок...');

            this.set_deals()
                .then(() => {
                    this.reload_btn.text('Загрузка контактов...');
                    return this.set_contacts();
                })
                .then(count => {

                    let warn = count > 50 ? `<span style='color:red'> - поддерживается не более 50!</span>` : '';
                    this.log.append(`Сделок в CRM: <b>${map.dots.length}</b> (связанных контактов: <b>${count + warn}</b>)`);

                    ymaps.ready(() => {
                        if (map.dots.length) {
                            this.reload_btn.text('Поиск объектов на карте...');

                            map.set_coords()
                                .then(() => {
                                    let not_found = map.check_dots(),
                                        text = `<br>Сделок на карте: <b>${map.dots.length}</b>.`;

                                    if (not_found.length)
                                        text += ` <span style='color:red'>Ненайденных адресов: <b>${not_found.length}</b>.<br>${not_found.join('<br>')}</span>`;

                                    text = text.replace(/\[\[(\d+)]]/g, `<a href="${b24.crm}/deal/details/$1/" target="_blank">#$1</a>`);

                                    this.log.append(text);

                                    this.reload_btn.text('Добавление объектов на карту...');
                                    return map.add_dots();
                                })
                                .then(() => this.reload_btn.removeClass('loading').text('Применить'));

                        } else {
                            this.reload_btn.removeClass('loading').text('Применить');
                            this.log.append(`Ничего не найдено.`);
                        }
                    });

                });
        },

        modal_init() {
            console.log('form.modal_init START');

            b24.get_fields()
                .then(result => {
                    $('[name="access-method"]').eq(settings.user.api_type).click();
                    $('[name="api-key"]').val(settings.user.api_key);
                    $('[name="api-not-free"]').prop('checked', settings.user.api_not_free);

                    let data = {
                        chkbox: ['', ''],
                        select: ['', '']
                    };

                    $.each(result, (id, field) => {

                        let label = field.formLabel || field.title,
                            option = `<option value="${id}" title="${id} (${field.type})">${label}</option>`,
                            html = `<div>
<input type="checkbox" name="user-fields" value="${id}" id="${id}" class="uk-checkbox" ${$.inArray(id, settings.user.fields) >= 0 ? 'checked="true"' : ''}>
<label for="${id}" uk-tooltip="${id} (${field.type})" class="uk-form-label">${label}</label>
</div>`;

                        this.field_names[id] = label;

                        if (!field.formLabel) {
                            data.chkbox[0] += html;
                            data.select[0] += option;
                        } else {
                            data.chkbox[1] += html;
                            data.select[1] += option;
                        }
                    });


                    // select 1, 2
                    let selects = $('.uk-modal select');

                    selects.html(`<optgroup label="СИСТЕМНЫЕ ПОЛЯ">${data.select[0]}</optgroup>` +
                        `<optgroup label="ПОЛЬЗОВАТЕЛЬСКИЕ ПОЛЯ">${data.select[1]}</optgroup>`);

                    selects.filter('[name="date-settings"]').val(settings.user.date);
                    selects.filter('[name="address-settings"]').val(settings.user.address);
                    selects.trigger("chosen:updated");


                    // checkboxes
                    $('.userfields-settings').html(`<div uk-grid>
<div><strong>Системные поля:</strong><br>${data.chkbox[0]}</div>
<div><strong>Пользовательские поля:</strong><br>${data.chkbox[1]}</div>
</div>`);

                });

        },

        status_list_init() {
            return new Promise(resolve => {
                console.log('form.status_list_init START');

                b24.get_statuses()
                    .then(statuses => {
                        $.each(statuses, (id, st) => this.statuses_list.append(`<option value="${id}">${st}</option>`));

                        // выбор статусов, сохраненных ранее в браузере
                        this.statuses_list.val(settings.ls.status_filter).trigger("chosen:updated");

                        resolve();
                    });
            });
        },

        set_deals() {
            return new Promise(resolve => {
                console.log('form.set_deals START');
                /**
                 * фильтр по полю start_date
                 */
                let filter = { date: {} },
                    val1 = date.start.val(),
                    date_param = settings.user.date,
                    addr_param = settings.user.address;

                if (val1)
                    filter.date['>' + date_param] = val1;

                console.log('filter', filter);

                b24.get_deals(filter.date)
                    .then(deals => {

                        let time = new Date(),
                            timezone_offset = time.getTimezoneOffset() * 60 * 1000,
                            val2 = Date.parse(date.end.val()) + timezone_offset + 86400000; // +3 часа и +1 день, чтобы искать до конца дня, указанного в конце диапазона
                        filter.status = this.statuses_list.val();

                        // сохранение в браузере последних настроек фильтра по статусу сделок
                        settings.save_ls({ status_filter: filter.status });

                        $.each(deals, (i, el) => {
                            if (!el[addr_param] || !el[date_param]) {
                                console.log(`SKIP DEAL #${el.ID}: не хватает даты или адреса`, el);
                                return;
                            }

                            /**
                             * фильтр по стадиям сделок
                             */
                            if (filter.status.length && $.inArray(el.STAGE_ID, filter.status) < 0) {
                                console.log(`SKIP DEAL #${el.ID} by STAGE_ID FILTER`, el.STAGE_ID);
                                return;
                            }
                            // фильтр "окончание периода"
                            if (val2) {
                                let deal_time = Date.parse(el[date_param]);
                                if (deal_time > val2) {

                                    console.log(`SKIP DEAL #${el.ID} by EndDate FILTER`, deal_time, ">", val2);
                                    return;
                                }
                            }
                            console.log("crm.deal.list:el", el);

                            // Поле "адрес google"
                            let address = el[addr_param].split('|')[0];

                            map.dots.push({
                                "type":       "Feature",
                                "id":         el.ID,
                                "geometry":   { "type": "Point" },
                                "icon":       "darkGreenDotIcon",
                                "address":    address,
                                "properties": {
                                    'iconCaption':          `${el.TITLE}, ID ${el.ID}`,
                                    'clusterCaption':       `${el.TITLE}, ID ${el.ID}`,
                                    'balloonContentHeader': `${el.TITLE}, ID ${el.ID}`,
                                    'balloonContentBody':   `<p><a href="${b24.crm}/deal/details/${el.ID}/" target="_blank">Открыть сделку в новом окне</a></p>
                            <p style="color:#1bad03"><b>Стадия сделки:</b> ${b24.statuses[el.STAGE_ID] !== undefined ? b24.statuses[el.STAGE_ID] : el.STAGE_ID}</p>
                            <p><b>${this.field_names[settings.user.address]}:</b> ${address}</p>
                            <p><b>${this.field_names[settings.user.date]}:</b> ${date.format_date(el[date_param])}</p>`,
                                },
                                "contact":    el.CONTACT_ID
                            });

                        });

                        resolve();
                    });
            });

        },

        set_contacts() {
            return new Promise(resolve => {

                console.log('form.set_contacts START', 'map.dots', map.dots);

                let batch = {}; // пакет запросов для b24

                $.each(map.dots, (i, deal) => {
                    console.log('form.set_contacts:deal.contact', deal.contact, batch[`contact_${deal.contact}`]);
                    // пропускаем сделки без контактов и с уже добавленными контактами
                    if (deal.contact === null || batch[`contact_${deal.contact}`] !== undefined)
                        return;

                    batch['contact_' + deal.contact] = {
                        method: 'crm.contact.get',
                        params: { id: deal.contact }
                    };
                });


                b24.get_contacts(batch)
                    .then(contacts => {
                            $.each(map.dots, (i, deal) => {
                                if (deal.contact === null)
                                    return;

                                let contact = contacts['contact_' + deal.contact].data();
                                map.dots[i].balloon += `<b>Связанный контакт:</b> 
                                                <a href="${b24.crm}/contact/details/${contact.ID}/" target="_blank">${contact.NAME}</a><br>
                                                ${format_phones(contact.PHONE)}`;
                            });

                            resolve(Object.keys(contacts).length);

                        },
                        () => resolve(0)
                    );

            });
        }
    }
});