import TileLayer from "esri/layers/TileLayer";
import EsriMap from "esri/Map";

export const map = new EsriMap({
  basemap: {
    baseLayers: [
      new TileLayer({
        url: "https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer"
      })
    ]
  },
  // basemap: "gray",
  // ground: "world-elevation"
});


