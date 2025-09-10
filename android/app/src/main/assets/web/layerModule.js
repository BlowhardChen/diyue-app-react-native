// 图层模块
window.LayerModule = (function () {
    const cache = {}; // 缓存图层实例

  /**
   * 创建自定义图层
   * @param {string} url 图层URL
   * @returns 
   */
    function createCustomLayer(url) {
        if (!cache[url]) {
            cache[url] = new ol.layer.Tile({
                source: new ol.source.XYZ({ url, projection: 'EPSG:3857' })
            });
        }
        return cache[url];
    }

  /**
   * 创建天地图卫星图层
   * @returns {ol.layer.Tile} - 返回创建的天地图卫星图层实例
   */
    function createTdSatelliteMapLayer() {
        const key = 'tdSatellite';
        if (!cache[key]) {
            cache[key] = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'http://t0.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=bdb59406d5662fe9f4d12b5012e04171',
                    projection: 'EPSG:3857'
                })
            });
        }
        return cache[key];
    }

  /**
   * 创建天地图电子图层
   * @returns {ol.layer.Tile} - 返回创建的天地图电子图层实例
   */
    function createTdElectronMapLayer() {
        const key = 'tdElectronic';
        if (!cache[key]) {
            cache[key] = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'http://t0.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=bdb59406d5662fe9f4d12b5012e04171',
                    projection: 'EPSG:3857'
                })
            });
        }
        return cache[key];
    }

  /**
   * 创建天地图标注图层
   * @returns {ol.layer.Tile} - 返回创建的天地图标注图层实例
   */
    function createTDAnnotationMapLayer() {
        const key = 'tdAnnotation';
        if (!cache[key]) {
            cache[key] = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://t2.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=4685c5e03cc4daa9f7cb7914cdf05c98',
                    projection: 'EPSG:3857'
                })
            });
        }
        return cache[key];
    }

  /**
   * 创建Google卫星图层
   * @returns {ol.layer.Tile} - 返回创建的Google卫星图层实例
   */
    function createGoogleSatelliteMapLayer() {
        const key = 'googleSatellite';
        if (!cache[key]) {
            cache[key] = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://map.tugemap.site/maps/vt?lyrs=s&x={x}&y={y}&z={z}&src=app&scale=2&from=app',
                    projection: 'EPSG:3857'
                })
            });
        }
        return cache[key];
    }

    return {
        createCustomLayer,
        createTdSatelliteMapLayer,
        createTdElectronMapLayer,
        createTDAnnotationMapLayer,
        createGoogleSatelliteMapLayer
    };
})();
