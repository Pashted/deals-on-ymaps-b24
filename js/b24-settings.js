let settings = $('#dealsonmap-settings'),
    user_settings,
    b24 = {
        entity_get() {
            console.log('b24.entity_get START');

            return new Promise((resolve, reject) => {
                BX24.callMethod(
                    "entity.get",
                    {"ENTITY": entity_id},
                    function (res) {
                        console.log('entity.get RESULT', res.data());

                        if (res.error()) {
                            if (res.answer.error === "ERROR_ENTITY_NOT_FOUND")
                                reject(res.answer.error);

                            else
                                alert(`Произошла ошибка ${res.answer.error}. Обратитесь в тех. поддержку.`);

                        } else {
                            resolve();
                        }
                    }
                );
            });
        },

        entity_add() {
            console.log('b24.entity_add START');

            return new Promise((resolve, reject) => {
                BX24.callMethod('entity.add', {
                    'ENTITY': entity_id,
                    'NAME':   'Deals on map - settings',
                    'ACCESS': {
                        U1: 'W',
                        AU: 'R'
                    }
                }, (res) => {
                    console.log('entity.add RESULT', res.data());
                    if (res.data() === true)
                        resolve(res.data());
                    else
                        alert('Произошла ошибка. Обратитесь в тех. поддержку.');

                });
            });
        },

        entity_delete() {
            console.log('b24.entity_delete START');

            return new Promise((resolve, reject) => {
                BX24.callMethod('entity.delete', {'ENTITY': entity_id}, (res) => {
                    console.log('b24.entity_delete RESULT', res.data());
                    resolve(res.data());
                });
            });
        },

        item_get() {
            console.log('b24.item_get START');

            return new Promise((resolve, reject) => {
                BX24.callMethod('entity.item.get', {
                    ENTITY: entity_id,
                    SORT:   {
                        DATE_ACTIVE_FROM: 'ASC',
                        ID:               'ASC'
                    }
                }, (res) => {
                    console.log('b24.item_get RESULT', res.data());
                    if (res.data().length)
                        resolve(res.data());

                    else
                        reject('no_items');

                });
            });
        },

        item_add() {
            console.log('b24.item_add START');

            return new Promise((resolve, reject) => {
                BX24.callMethod('entity.item.add', {
                    ENTITY:           entity_id,
                    DATE_ACTIVE_FROM: new Date(),
                    DETAIL_TEXT:      '{json}',
                    DETAIL_PICTURE:   '',
                    NAME:             'Intels Deals on map settings'
                    // SECTION:          219
                }, (res) => {
                    console.log('b24.item_add RESULT', res.data());

                    if (res.data())
                        resolve(res);
                    else
                        reject('cant_add_item');
                });
            });
        },

        item_update() {
            console.log('b24.item_update START');

            return new Promise((resolve, reject) => {
                BX24.callMethod('entity.item.update', {
                    ENTITY:           entity_id,
                    ID:               842,
                    DATE_ACTIVE_FROM: new Date(),
                    DETAIL_PICTURE:   '',
                    NAME:             'Goodbye Cruel World',
                    PROPERTY_VALUES:  {
                        test:      11,
                        test1:     22,
                        test_file: ''
                    },
                    // SECTION: 219
                });
            });
        }
    };


settings.on({
    init() {
        console.log('settings.init START');

        b24.entity_get()
            .catch(() => b24.entity_add().then(b24.item_add))
            .then(b24.item_get)
            .then((result) => {
                user_settings = result[0];
                console.log('user_settings', user_settings);

                control.trigger("init");

                ymaps.ready(() => {
                    map.trigger('init');
                    deals_status_list.trigger('bx_update');
                });
            }, (error) => alert(`Произошла ошибка ${error}. Обратитесь в тех. поддержку.`));

        // .then(after_add => settings.trigger('init'));
    },
    create() {

    },
    delete() {

        b24.entity_delete()
            .then(() => {
                user_settings = {};
                console.log('user_settings', user_settings);
            });
    },
    write() {

    },
    crm_fields() {
        console.log('get_userfields START');
        BX24.callMethod(
            "crm.deal.fields",
            {},
            function (result) {
                if (result.error()) {
                    console.error(result.error());
                } else {
                    console.log(result.data());

                    let html_system = '', html_user = '';
                    $.each(result.data(), (id, field) => {
                        if (field.formLabel)
                            html_user += `<div>
<input type="checkbox" name="user-fields" value="${id}" id="${id}" class="uk-checkbox">
<label for="${id}" uk-tooltip="${id} (${field.type})" class="uk-form-label">${field.formLabel}</label>
</div>`;
                        else
                            html_system += `<div>
<input type="checkbox" name="user-fields" value="${id}" id="${id}" class="uk-checkbox">
<label for="${id}" uk-tooltip="${id} (${field.type})" class="uk-form-label">${field.title}</label>
</div>`;

                    });

                    $('.userfields-settings').html(`<div uk-grid>
<div><strong>Системные поля:</strong><br>${html_system}</div>
<div><strong>Пользовательские поля:</strong><br>${html_user}</div>
</div>`);

                }
            }
        );
    }
});