// 图层切换模块
window.LayerModule = (function () {
  /**
   * 创建自定义瓦片图层
   * @param {string} url - 瓦片图层服务的URL，需包含XYZ切片参数（如 {x}, {y}, {z}）
   * @returns {ol.layer.Tile} 自定义瓦片图层实例
   */
  function createCustomLayer(url) {
    const customLayer = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url ,
        projection: 'EPSG:3857',

      })
    })
    return customLayer;
  }
  /**
   * 创建天地图卫星影像图层
   * @returns {ol.layer.Tile} 天地图卫星影像图层实例
   */
  function createTdSatelliteMapLayer () {
    const tdtSatelliteMapLayer = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: 'http://t0.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=bdb59406d5662fe9f4d12b5012e04171',
        projection: 'EPSG:3857',
      })
    })
    return tdtSatelliteMapLayer;
  }

  /**
   * 创建天地图电子图层
   * @returns {ol.layer.Tile} 天地图电子图层实例
   */
  function createTdElectronMapLayer () {
    const tdtElectronicMapLayer = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: 'http://t0.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=bdb59406d5662fe9f4d12b5012e04171',
        projection: 'EPSG:3857',
      })
    })
    return tdtElectronicMapLayer;
  }
  /**
   * 创建天地图注记图层
   * @returns {ol.layer.Tile} 天地图注记图层实例
   */
  function createTDAnnotationMapLayer () {
    const tdtAnnotationMapLayer = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: 'https://t2.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=4685c5e03cc4daa9f7cb7914cdf05c98',
        projection: 'EPSG:3857',
      })
    })
    return tdtAnnotationMapLayer;
  }
  /**
   * 创建谷歌卫星影像地图图层
   * @returns {ol.layer.Tile} 谷歌卫星影像地图图层实例
   */
  function createGoogleSatelliteMapLayer () {
    const googleSatelliteMapLayer = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: 'https://map.tugemap.site/maps/vt?lyrs=s&x={x}&y={y}&z={z}&src=app&scale=2&from=app',
        projection: 'EPSG:3857',
      })
    })
    return googleSatelliteMapLayer;
  }


  return { createCustomLayer, createTdSatelliteMapLayer,createTdElectronMapLayer,createTDAnnotationMapLayer,createGoogleSatelliteMapLayer };
})();