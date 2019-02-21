let crm = `https://${BX24.getDomain()}/crm`,
    statuses = {},
    deals_status_list = $('#select-deals-status');

// TODO: очищать в href контакта лишние символы регуляркой
// TODO: сделать показ более 50 контактов на одной карте, либо показывать сообщение вместо undefined в контактах, которые есть, но не были получены

deals_status_list.on({
    bx_update() {
        BX24.callMethod(
            "crm.status.list",
            {
                order:  {"ENTITY_ID": "ASC"},
                filter: {"ENTITY_ID": "DEAL_STAGE"}
            },
            function (result) {
                if (result.error())
                    console.error(result.error());
                else {
                    console.log('deals_status_list callback');

                    jQuery.each(result.data(), function (i, st) {
                        statuses[st.STATUS_ID] = st.NAME;
                        deals_status_list.append(`<option value="${st.STATUS_ID}">${st.NAME}</option>`)
                    });

                    deals_status_list.trigger("chosen:updated");


                    if (result.more())
                        result.next();
                    else
                        map.trigger("bx_set_deals");
                }
            }
        );
    }
});

map.on({
    bx_set_deals() {
        // TODO: реализовать фильтрацию по статусу сделки на уровне карт https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ObjectManager-docpage/#method_detail__setFilter

        /**
         * фильтр 3 по полю start_date
         */
        let filter = {},
            val1 = start.val(),
            time = new Date(),
            timezone_offset = time.getTimezoneOffset() * 60 * 1000,
            val2 = Date.parse(end.val()) + timezone_offset + 86400000; // + 3 часа и плюс 1 день, чтобы искать до конца дня, указанного в конце диапазона

        if (val1)
            filter = {">UF_CRM_5C07A1C52D5CF": val1};

        /**
         * filter 2 стадии сделок
         */
        let status_filter = deals_status_list.val();
        console.log('status_filter', status_filter);

        reload_btn.text('Загрузка сделок...');

        BX24.callMethod(
            "crm.deal.list",
            {
                order:  {"STAGE_ID": "ASC"},
                filter: filter,
                select: ["*", "UF_*", "PHONE"]
            },
            (res) => {
                if (res.error())
                    console.error(res.error());
                else {
                    console.log('set_deals callback');

                    let data = res.data();

                    jQuery.each(data, (i, el) => {
                        if (!el.UF_CRM_5C07A1C53EAA9 || !el.UF_CRM_5C07A1C52D5CF)
                            return;

                        if (status_filter !== null && $.inArray(el.STAGE_ID, status_filter) < 0) {
                            console.log(`SKIP DEAL #${el.ID} by STAGE_ID FILTER`, el.STAGE_ID);
                            return;
                        }
                        // фильтр "окончание периода"
                        if (val2) {
                            let deal_time = Date.parse(el.UF_CRM_5C07A1C52D5CF);
                            if (deal_time > val2) {

                                console.log(`SKIP DEAL #${el.ID} by EndDate FILTER`, deal_time, ">", val2);
                                return;
                            }
                        }
                        console.log("crm.deal.list:el", el);
                        console.log(el.ID, el.UF_CRM_5C07A1C53EAA9);
                        // Поле "адрес google"
                        let address = el.UF_CRM_5C07A1C53EAA9.split('|')[0],
                            dot = {
                                "type":     "Feature",
                                "id":       el.ID,
                                "geometry": {"type": "Point"},
                                "icon":     "darkGreenDotIcon",
                                "address":  address,
                                "properties": {
                                    'iconCaption': `${el.TITLE}, ID ${el.ID}`,
                                    'clusterCaption': `${el.TITLE}, ID ${el.ID}`,
                                    'balloonContentHeader': `${el.TITLE}, ID ${el.ID}`,
                                    'balloonContentBody': `<p><a href="${crm}/deal/details/${el.ID}/" target="_blank">Открыть сделку в новом окне</a></p>
                                    <p style="color:#1bad03"><b>Стадия сделки:</b> ${statuses[el.STAGE_ID] !== undefined ? statuses[el.STAGE_ID] : el.STAGE_ID}</p>
                                    <p><b>Адрес:</b> ${address}</p>
                                    <p><b>Дата сделки:</b> ${format_date(el.UF_CRM_5C07A1C52D5CF)}</p>`,
                                },
                                "contact":  el.CONTACT_ID
                            };

                        dots.push(dot);

                    });

                    if (res.more())
                        res.next();
                    else
                        map.trigger("bx_set_contacts");
                }
            }
        );


    },
    bx_set_contacts() {
        console.log('bx_set_contacts START');
        reload_btn.text('Загрузка контактов...');

        let batch = {}; // пакет запросов для b24

        $.each(dots, (i, deal) => {

            // создаём список уникальных контактов, которые будут запрошены у b24
            if (deal.contact !== null && $.inArray(deal.contact, batch) < 0) {
                batch['contact_' + deal.contact] = {
                    method: 'crm.contact.get',
                    params: {id: deal.contact}
                };
            }
        });
        console.log('contacts batch query:', batch);

        let contacts_count = Object.keys(batch).length;

        if (contacts_count) {
            BX24.callBatch(batch, function (result) {
                $.each(dots, (i, deal) => {

                    if (deal.contact !== null) {

                        let contact = result['contact_' + deal.contact].data();
                        dots[i].balloon += `<b>Связанный контакт:</b> <a href="${crm}/contact/details/${contact.ID}/" target="_blank">${contact.NAME}</a><br>
                                             ${format_phones(contact.PHONE)}`;
                    }
                });

                if (contacts_count > 50)
                    contacts_count = `<span style='color:red'>${contacts_count} (поддерживается не более 50!)</span>`;

                log.append(`Найдено сделок: <b>${dots.length}</b>,<br>связанных с ними контактов: <b>${contacts_count}</b>.`);
                map.trigger("map_deals");
            });

        } else {
            map.trigger("map_deals");
        }
    }
});


BX24.init(function () {

    control.trigger("init");

    ymaps.ready(() => {
        map.trigger('init');
        deals_status_list.trigger('bx_update');
    });


});