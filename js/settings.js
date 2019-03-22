define(['b24'], b24 => {
    let settings = $('#dealsonmap-settings');

    //TODO: сохранять/загружать по init фильтр по статусам в хранилище

    return {
        user:    {},
        defaults: {
            api_type:     0,
            api_key:      '',
            api_not_free: 1,
            date:         'DATE_CREATE',
            address:      'LOCATION_ID',
            fields:       ['ID', 'NAME']
        },

        init() {
            return new Promise(resolve => {
                console.log('settings.init START');

                b24.entity_get()
                    .catch(err => b24.entity_add().then(b24.item_add))
                    .then(() => b24.item_get())
                    .then(user_settings => {
                        this.user = user_settings;
                        this.user.__proto__ = this.defaults;
                        console.log('settings.INIT RESULT', this.user);
                        resolve();
                    });
            });
        },

        reset() {
            return new Promise(resolve => {
                console.log('settings.reset START');

                b24.item_update({ api_key: this.user.api_key })
                    .then(() => b24.item_get())
                    .then(user_settings => {
                        this.user = user_settings;
                        this.user.__proto__ = this.defaults;
                        console.log('settings.RESET RESULT', this.user);
                        resolve();
                    });
            });
        },

        save() {
            console.log('settings.save START');

            let data = {
                api_type:     $('[name="access-method"]:checked').val(),
                api_key:      $('[name="api-key"]').val(),
                api_not_free: $('[name="api-not-free"]:checked').length ? 1 : 0,
                date:         $('[name="date-settings"]').val(),
                address:      $('[name="address-settings"]').val(),
                fields:       []
            };

            $('[name="user-fields"]:checked').map((i, elem) => data.fields.push($(elem).attr('id')));

            b24.item_update(data)
                .then(() => b24.item_get())
                .then(user_settings => {
                    this.user = user_settings;
                    this.user.__proto__ = this.defaults;
                    console.log('settings.SAVE RESULT', this.user);
                });
        },
    }
});