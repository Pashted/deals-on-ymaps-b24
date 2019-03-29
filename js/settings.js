define(['b24'], b24 => {
    let ls_name = "intels_deals_on_map";

    //TODO: сохранять/загружать по init фильтр по статусам в хранилище

    return {
        user:     {},
        ls:       {},
        defaults: {
            api_type:     0,
            api_key:      '',
            api_not_free: 1,
            date:         'DATE_CREATE',
            address:      'LOCATION_ID',
            fields:       ['ID', 'NAME']
        },

        save_ls(params) {
            if (params !== this.ls) {
                console.log('settings.save_ls', params, this.ls);
                localStorage.setItem(ls_name, JSON.stringify(params));
            }
        },

        init_ls() {
            // TODO: сделать хранение параметров фильтра в хранилище b24
            this.ls = localStorage.getItem(ls_name);

            if (this.ls === null) {
                this.ls = { status_filter: [] };
                localStorage.setItem(ls_name, JSON.stringify(this.ls));

            } else {
                this.ls = JSON.parse(this.ls);
            }
            console.log('settings.init_ls', this.ls);
        },

        init() {
            return new Promise(resolve => {
                console.log('settings.init START');

                this.init_ls();

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
            return new Promise(resolve => {
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
                        resolve();
                    });
            });
        },
    }
});