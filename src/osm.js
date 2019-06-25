// import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';


const init = () => {
    console.log(3333);

    const map = new Map({
        target: 'map',
        layers: [
            new TileLayer({
                source: new OSM()
            })
        ],
        view:   new View({
            center: [ 0, 0 ],
            zoom:   0
        })
    });

    console.log(map)


    return new Promise(resolve => {
        setTimeout(() => resolve(), 100);
    });

};

export { init };

