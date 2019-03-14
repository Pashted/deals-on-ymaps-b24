let settings = $('#dealsonmap-settings'),
    user_settings,
    b24 = {
        entity_get() {
            console.log('b24.entity_get START');

            return new Promise((resolve, reject) => {
                BX24.callMethod(
                    "entity.get",
                    { "ENTITY": entity_id },
                    res => {
                        console.log('b24.entity_get RESULT', res.data());

                        if (res.error()) {
                            if (res.answer.error === "ERROR_ENTITY_NOT_FOUND")
                                reject(res.answer.error);

                            else
                                console.log('b24.entity_get ERROR', res);

                        } else {
                            resolve();
                        }
                    }
                );
            });
        },

        entity_add() {
            console.log('b24.entity_add START');

            return new Promise(resolve => {
                BX24.callMethod('entity.add', {
                    'ENTITY': entity_id,
                    'NAME':   'Deals on map - settings',
                    'ACCESS': {
                        U1: 'W',
                        AU: 'R'
                    }
                }, res => {
                    console.log('b24.entity_add RESULT', res.data());

                    if (res.data() === true)
                        resolve(res.data());
                    else
                        console.log('b24.entity_add ERROR', res);

                });
            });
        },

        entity_delete() {
            console.log('b24.entity_delete START');

            return new Promise(resolve => {
                BX24.callMethod('entity.delete', { 'ENTITY': entity_id }, res => {
                    console.log('b24.entity_delete RESULT', res.data());
                    resolve(res.data());
                });
            });
        },

        item_get() {
            console.log('b24.item_get START');

            return new Promise(resolve => {
                BX24.callMethod('entity.item.get', {
                    ENTITY: entity_id,
                    SORT:   {
                        DATE_ACTIVE_FROM: 'ASC',
                        ID:               'ASC'
                    }
                }, res => {
                    let data = res.data();
                    console.log('b24.item_get RESULT', data);

                    if (data.length) {
                        user_settings = JSON.parse(data[0].DETAIL_TEXT);
                        user_settings.id = data[0].ID;

                        console.log('USER_SETTINGS', user_settings);

                        resolve();
                    } else {
                        console.log('b24.item_get ERROR', res);
                    }
                });
            });
        },

        item_add() {
            // TODO: добавить сюда default settings
            console.log('b24.item_add START');

            return new Promise(resolve => {
                BX24.callMethod('entity.item.add', {
                    ENTITY:           entity_id,
                    DATE_ACTIVE_FROM: new Date(),
                    DETAIL_TEXT:      '{}',
                    // DETAIL_PICTURE:   '',
                    NAME:             'Intels Deals on map settings'
                    // SECTION:          219
                }, res => {
                    console.log('b24.item_add RESULT', res.data());

                    if (res.data())
                        resolve(res);
                    else
                        console.log('b24.item_add ERROR', res);
                });
            });
        },

        item_update(data) {
            console.log('b24.item_update START');

            return new Promise(resolve => {
                BX24.callMethod('entity.item.update', {
                    ENTITY:           entity_id,
                    ID:               user_settings.id,
                    DATE_ACTIVE_FROM: new Date(),
                    // DETAIL_PICTURE:   '',
                    DETAIL_TEXT:      JSON.stringify(data),
                    // NAME:             user_settings.NAME,
                    // SECTION: 219
                }, res => {
                    console.log('b24.item_update RESULT', res.data());

                    if (res.data())
                        resolve(res);
                    else
                        console.log('b24.item_update ERROR', res);
                });
            });
        },

        get_fields() {
            console.log('b24.get_fields START');

            return new Promise(resolve => {
                BX24.callMethod(
                    "crm.deal.fields",
                    {},
                    res => {
                        console.log('b24.get_fields RESULT', res.data());
                        if (res.error())
                            console.log('b24.get_fields ERROR', res);
                        else
                            resolve(res.data());
                    }
                );
            });
        }
    };


settings.on({
    init() {
        console.log('settings.init START');

        b24.entity_get()
            .catch(err => b24.entity_add().then(b24.item_add))
            .then(b24.item_get)
            .then(() => {
                settings.trigger('init_form');
                control.trigger("init");

                ymaps.ready(() => {
                    map.trigger('init');
                    deals_status_list.trigger('bx_update');
                });
            });

        // .then(after_add => settings.trigger('init'));
    },

    reset() {
        console.log('settings.reset START');

        // b24.entity_delete()
        //     .then(() => {
        //         b24.entity_add()
        //             .then(b24.item_add)
        //             .then(b24.item_get);
        //     });
        b24.item_update({}).then(b24.item_get).then(() => settings.trigger('init_form'));
    },

    save() {
        let data = {
            api:     {
                type: settings.find('[name="access-method"]:checked').val(),
                key:  settings.find('[name="api-key"]').val()
            },
            date:    settings.find('[name="date-settings"]').val(),
            address: settings.find('[name="address-settings"]').val(),
            fields:  []
        };

        settings.find('[name="user-fields"]:checked').map((i, elem) => data.fields.push($(elem).attr('id')));

        b24.item_update(data).then(b24.item_get);
    },

    init_form() {
        console.log('settings.set_fields START');

        b24.get_fields().then(result => {
            let data = {
                chkbox: ['', ''],
                select: ['', '']
            };

            $.each(result, (id, field) => {

                let label = field.formLabel ? field.formLabel : field.title,
                    option = `<option value="${id}" title="${id} (${field.type})">${label}</option>`,
                    html = `<div>
<input type="checkbox" name="user-fields" value="${id}" id="${id}" class="uk-checkbox" ${$.inArray(id, user_settings.fields) >= 0 ? 'checked="true"' : ''}>
<label for="${id}" uk-tooltip="${id} (${field.type})" class="uk-form-label">${label}</label>
</div>`;

                if (!field.formLabel) {
                    data.chkbox[0] += html;
                    data.select[0] += option;
                } else {
                    data.chkbox[1] += html;
                    data.select[1] += option;
                }
            });


            // select 1, 2
            let selects = settings.find('select');

            selects.html(`<option value="">[по умолчанию]</option>
<optgroup label="СИСТЕМНЫЕ ПОЛЯ">${data.select[0]}</optgroup>
<optgroup label="ПОЛЬЗОВАТЕЛЬСКИЕ ПОЛЯ">${data.select[1]}</optgroup>`);

            if (user_settings.date)
                selects.filter('select[name="date-settings"]').val(user_settings.date);

            if (user_settings.address)
                selects.filter('select[name="address-settings"]').val(user_settings.address);

            selects.trigger("chosen:updated");


            // checkboxes
            $('.userfields-settings')
                .html(`<div uk-grid>
<div><strong>Системные поля:</strong><br>${data.chkbox[0]}</div>
<div><strong>Пользовательские поля:</strong><br>${data.chkbox[1]}</div>
</div>`);

            if (user_settings.api) {

                if (typeof user_settings.api.type !== 'undefined')
                    settings.find(`[name="access-method"][value="${user_settings.api.type}"]`).click();

                if (typeof user_settings.api.key !== 'undefined')
                    settings.find(`[name="api-key"]`).val(user_settings.api.key);
            }

        });

    }
});