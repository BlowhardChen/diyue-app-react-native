// 地图初始化与基础配置
window.MapCore = (function () {
    let map = null;
    /**
     * 初始化地图实例
     * @param {string} targetId - 用于渲染地图的 DOM 元素的 ID
     * @returns {ol.Map} - 返回初始化后的 OpenLayers 地图实例
     */
    function initMap(targetId) {
        map = new ol.Map({
            target: targetId,
            layers: [],
            view: new ol.View({
                center: ol.proj.fromLonLat([114.085871, 22.546029]),
                projection: 'EPSG:3857',
                zoom: 17,
                maxZoom: 24
            })
        });
        return map;
    }
    /**
     * 获取地图实例
     * @returns {ol.Map} - 返回当前的 OpenLayers 地图实例
     */
    function getMap() {
        return map;
    }

    return { initMap, getMap };
})();
