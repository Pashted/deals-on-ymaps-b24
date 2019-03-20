define(['b24', 'date'], (b24, date) => {
    let settings = $('#dealsonmap-settings');

    return {
        user_settings: {},

        init() {
            return new Promise(resolve => {
                console.log('settings.init START');

                b24.entity_get()
                    .catch(err => b24.entity_add().then(b24.item_add))
                    .then(() => b24.item_get())
                    .then(user_settings => {
                        this.user_settings = user_settings;
                        console.log('settings.INIT RESULT', this.user_settings);
                        resolve();
                    });
            });
        },

        reset() {
            return new Promise(resolve => {
                console.log('settings.reset START');

                b24.item_update({ api_key: this.user_settings.api_key })
                    .then(() => b24.item_get())
                    .then(user_settings => {
                        this.user_settings = user_settings;
                        console.log('settings.RESET RESULT', this.user_settings);
                        resolve();
                    });
            });
        },

        save() {
            console.log('settings.save START');

            let data = {
                api_type: $('[name="access-method"]:checked').val(),
                api_key:  $('[name="api-key"]').val(),
                date:     $('[name="date-settings"]').val(),
                address:  $('[name="address-settings"]').val(),
                fields:   []
            };

            $('[name="user-fields"]:checked').map((i, elem) => data.fields.push($(elem).attr('id')));

            b24.item_update(data)
                .then(() => b24.item_get())
                .then(user_settings => {
                    this.user_settings = user_settings;
                    console.log('settings.SAVE RESULT', this.user_settings);
                });
        },
    }
});