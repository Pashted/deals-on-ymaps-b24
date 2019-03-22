define(() => {

// TODO: Добавить возможность ввести свой api-ключ яндекс-карт + инструкция по получению ключа

    return {
        Map: {}, objectManager: {}, dots: [],
        set_coords() {
            return new Promise(resolve => {
                console.log('map.set_coords START');

                let timer;

                for (let i = 0; i < this.dots.length; i++) {
                    ymaps.geocode(this.dots[i].address, { results: 1 })
                        .then(res => {
                            clearTimeout(timer);
                            // Выбираем первый результат геокодирования.
                            this.dots[i].geometry.coordinates = res.geoObjects.get(0).geometry.getCoordinates();
                            console.log(i + '_coords', this.dots[i].geometry.coordinates, this.dots[i].id, this.dots[i].address);

                            this.dots[i].properties.balloonContentFooter = `<hr><i>Координаты Yandex: ${this.dots[i].geometry.coordinates}</i>`;

                            timer = setTimeout(() => resolve(), 1000);

                        });
                }

            });
        },

        check_dots() {
            let not_found = [];

            for (let i = 0; i < this.dots.length; i++) {
                if (this.dots[i].geometry.coordinates !== undefined)
                    continue;

                // ненайденные точки на карте помещаем в массив для лога и отменяем вывод их на карту
                not_found.push(`[[${this.dots[i].id}]]: ${this.dots[i].address}`);

                this.dots.splice(i, 1);
            }

            let log = `<br>Сделок на карте: <b>${this.dots.length}</b>.`;

            if (not_found.length)
                log += ` <span style='color:red'>Ненайденных адресов: <b>${not_found.length}</b>.<br>${not_found.join('<br>')}</span>`;


            return log;
        },

        add_dots() {
            return new Promise((resolve, reject) => {
                console.log('map.add_dots START');
                /**
                 * Добавление точек на карту
                 */

                console.log('map.dots', this.dots);

                this.objectManager.objects.options.set('preset', 'islands#darkGreenIcon');
                this.objectManager.clusters.options.set('preset', 'islands#invertedDarkGreenClusterIcons');
                this.Map.geoObjects.add(this.objectManager);

                this.objectManager.add({
                    "type":     "FeatureCollection",
                    "features": this.dots
                });

                setTimeout(() => {
                    console.log('MAP UPDATED!');
                    resolve();
                    try {
                        //     this.Map.setBounds(myClusterer.getBounds(), {checkZoomRange: true});
                        this.Map.setBounds(this.objectManager.getBounds(), { checkZoomRange: true });
                        console.log('MAP checkZoomRange DONE');
                    } catch (e) {
                        console.log('ymaps ERROR:', e);
                    }
                }, 100);

            });
        },

        init_map() {
            console.log("map.init_map START");

            this.Map = new ymaps.Map('map', {
                center: [55.753994, 37.622093],
                zoom:   10
            });

            // myClusterer = new ymaps.Clusterer();

            this.objectManager = new ymaps.ObjectManager({
                // Чтобы метки начали кластеризоваться, выставляем опцию.
                clusterize: true,
                // ObjectManager принимает те же опции, что и кластеризатор.
                gridSize:   32,
                // clusterDisableClickZoom: true
            });
        },

        clear() {
            console.log("map.clear START");
            this.dots = [];
            this.Map.geoObjects.removeAll();
            this.objectManager.removeAll();
        }
    }
});
