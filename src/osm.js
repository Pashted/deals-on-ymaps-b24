// import Map from 'ol/Map';
// import View from 'ol/View';
// import TileLayer from 'ol/layer/Tile';
// import XYZ from 'ol/source/XYZ';

define([
    '../node_modules/ol/Map',
    '../node_modules/ol/View',
    '../node_modules/ol/layer/Tile',
    '../node_modules/ol/source/XYZ'
], (Map, View, TileLayer, XYZ) => {

    // new Map({
    //     target: 'map',
    //     layers: [
    //         new TileLayer({
    //             source: new XYZ({
    //                 url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    //             })
    //         })
    //     ],
    //     view:   new View({
    //         center: [ 0, 0 ],
    //         zoom:   2
    //     })
    // });

    console.log(Map)

    return {

        init() {
            console.log(123)
        }
    }
});