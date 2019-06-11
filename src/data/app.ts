import TileLayer from "esri/layers/TileLayer";
import EsriMap from "esri/Map";
import AppConfig from "@/AppConfig";

const appConfig = AppConfig.appConfig;
export const map = new EsriMap({
  basemap: {
    baseLayers: [
      new TileLayer({
        url: appConfig.map.basemaps[0].url
      })
    ]
  }
});

//todo 使用配置文件中的地址
// export const map = new EsriMap({
//   basemap: {
//     baseLayers: [
//       new TileLayer({
//         url:
//           "https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer"
//       })
//     ]
//   }
// });
