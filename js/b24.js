define(() => {

    let crm = `https://${BX24.getDomain()}/crm`, // адрес CRM Bitrix24
        entity_id = 'intelsdom', // имя хранилища для хранения настроек модуля в crm
        default_settings = {
            api_type: 0,
            api_key:  '',
            date:     'DATE_CREATE',
            address:  'LOCATION_ID',
            fields:   ['ID', 'NAME']
        };

// TODO: очищать в href контакта лишние символы регуляркой
// TODO: сделать показ более 50 контактов на одной карте, либо показывать сообщение вместо undefined в контактах, которые есть, но не были получены


    return b24 = {
        crm,
        statuses:    {},
        settings_id: null,
        get_fields() {
            return new Promise(resolve => {
                console.log('b24.get_fields START');

                BX24.callMethod("crm.deal.fields", {}, res => {
                        console.log('b24.get_fields RESULT', res.data());

                        if (res.error())
                            console.log('b24.get_fields ERROR', res);
                        else
                            resolve(res.data());
                    }
                );
            });
        },

        get_statuses() {
            return new Promise(resolve => {
                console.log('b24.get_statuses START');

                BX24.callMethod(
                    "crm.status.list",
                    { order: { "ENTITY_ID": "ASC" }, filter: { "ENTITY_ID": "DEAL_STAGE" } },
                    result => {
                        if (result.error())
                            console.error(result.error());
                        else {
                            $.each(result.data(), (i, st) => this.statuses[st.STATUS_ID] = st.NAME);

                            if (result.more()) {
                                result.next();
                            } else {
                                console.log('b24.get_statuses RESULT', this.statuses);
                                resolve(this.statuses);
                            }
                        }
                    }
                );

            });
        },

        get_deals(filter) {
            return new Promise(resolve => {
                console.log('b24.get_deals START');

                let deals = [];

                BX24.callMethod(
                    "crm.deal.list",
                    {
                        order:  { "STAGE_ID": "ASC" },
                        filter: filter,
                        select: ["*", "UF_*", "PHONE"]
                    },
                    res => {
                        if (res.error())
                            console.error(res.error());
                        else {
                            deals = deals.concat(res.data());

                            if (res.more()) {
                                res.next();
                            } else {
                                console.log('b24.get_deals RESULT', deals);
                                resolve(deals);
                            }
                        }
                    }
                );
            });
        },

        get_contacts(batch) {
            return new Promise((resolve, reject) => {
                console.log('b24.get_contacts START, batch:', batch);

                let count = Object.keys(batch).length;

                if (count) {
                    BX24.callBatch(batch, result => {
                        console.log('b24.get_contacts RESULT', result);
                        resolve(result, count);
                    });

                } else {
                    reject();
                }

            });

        },

        entity_get() {
            return new Promise((resolve, reject) => {
                console.log('b24.entity_get START');

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
            return new Promise(resolve => {
                console.log('b24.entity_add START');

                BX24.callMethod('entity.add', {
                    'ENTITY': entity_id,
                    'NAME':   'Deals on map - settings',
                    'ACCESS': { U1: 'W', AU: 'R' }
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
            return new Promise(resolve => {
                console.log('b24.entity_delete START');

                BX24.callMethod('entity.delete', { 'ENTITY': entity_id }, res => {
                    console.log('b24.entity_delete RESULT', res.data());
                    resolve(res.data());
                });
            });
        },

        item_get() {
            return new Promise(resolve => {
                console.log('b24.item_get START');

                BX24.callMethod('entity.item.get', {
                    ENTITY: entity_id,
                    SORT:   { DATE_ACTIVE_FROM: 'ASC', ID: 'ASC' }
                }, res => {
                    let data = res.data();
                    console.log('b24.item_get RESULT', data);

                    if (data.length) {
                        let user_settings = JSON.parse(data[0].DETAIL_TEXT);
                        user_settings.__proto__ = default_settings;

                        this.settings_id = data[0].ID;

                        resolve(user_settings);
                    } else {
                        console.log('b24.item_get ERROR', res);
                    }
                });
            });
        },

        item_add() {
            return new Promise(resolve => {
                console.log('b24.item_add START');

                BX24.callMethod('entity.item.add', {
                    ENTITY:           entity_id,
                    DATE_ACTIVE_FROM: new Date(),
                    DETAIL_TEXT:      '{}',
                    NAME:             'Intels Deals on map settings'
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
            return new Promise(resolve => {
                console.log('b24.item_update START');

                BX24.callMethod('entity.item.update', {
                    ENTITY:           entity_id,
                    ID:               this.settings_id,
                    DATE_ACTIVE_FROM: new Date(),
                    DETAIL_TEXT:      JSON.stringify(data)
                }, res => {
                    console.log('b24.item_update RESULT', res.data());

                    if (res.data())
                        resolve(res);
                    else
                        console.log('b24.item_update ERROR', res);
                });
            });
        }

    }

});