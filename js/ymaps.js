// TODO: Добавить возможность ввести свой api-ключ яндекс-карт + инструкция по получению ключа

let myMap, objectManager,
    dots = [],
    set_coords = () => {
        console.log('set_coords START');
        reload_btn.text('Поиск объектов на карте...');

        let j = 1;
        for (let i = 0; i < dots.length; i++) {
            ymaps.geocode(dots[i].address, {results: 1}).then((res) => {
                // Выбираем первый результат геокодирования.
                dots[i].geometry.coordinates = res.geoObjects.get(0).geometry.getCoordinates();
                dots[i].properties.balloonContentFooter = `<hr><i>Координаты Yandex: ${dots[i].geometry.coordinates}</i>`;
                console.log(i + ' coords', dots[i].geometry.coordinates);

                if (j === dots.length)
                    add_dots();
                j++;
            });
        }
    },
    add_dots = () => {
        /**
         * Добавление точек на карту
         */

        console.log('add_dots START');
        reload_btn.text('Добавление объектов на карту...');


        objectManager.objects.options.set('preset', 'islands#darkGreenIcon');
        objectManager.clusters.options.set('preset', 'islands#invertedDarkGreenClusterIcons');
        myMap.geoObjects.add(objectManager);



        objectManager.add({
            "type":     "FeatureCollection",
            "features": dots
        });

        reload_btn.removeClass('loading').text('Применить');
        console.log('MAP UPDATED!');

        setTimeout(() => {
            try {
                //     myMap.setBounds(myClusterer.getBounds(), {checkZoomRange: true});
                myMap.setBounds(objectManager.getBounds(), {checkZoomRange: true});
                console.log('MAP checkZoomRange DONE');
            } catch (e) {
                console.log(e);
            }
        }, 100);

    };

map.on({
    init() {
        console.log("ymaps_init START");

        myMap = new ymaps.Map('map', {
            center: [
                55.753994,
                37.622093
            ],
            zoom:   10
        });

        // myClusterer = new ymaps.Clusterer();

        objectManager = new ymaps.ObjectManager({
            // Чтобы метки начали кластеризоваться, выставляем опцию.
            clusterize:              true,
            // ObjectManager принимает те же опции, что и кластеризатор.
            gridSize:                32,
            // clusterDisableClickZoom: true
        });


    },
    map_deals() {
        setTimeout(() => {
            console.log('map_deals START', dots);
            if (dots.length) {
                set_coords();
            } else {
                log.append(`Ничего не найдено.`);
                reload_btn.removeClass('loading').text('Применить');
            }
        }, 100);
    }

});