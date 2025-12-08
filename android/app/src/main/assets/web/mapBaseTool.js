// 地图初始化与基础配置
window.MapCore = (function () {
    let map = null; // 地图实例
    let lastRotation = null // 存储上一次的旋转角度
    
    /**
     * 初始化地图实例
     * @param {string} targetId - 用于渲染地图的 DOM 元素的 ID
     * @returns {ol.Map} - 返回初始化后的 OpenLayers 地图实例
     */
    function initMap(targetId) {
        if (map) return map; // 单例
        map = new ol.Map({
            target: targetId,
            layers: [],
            controls: [],
            view: new ol.View({
                center: ol.proj.fromLonLat([114.085871, 22.546029]),
                projection: 'EPSG:3857',
                zoom: 17,
                maxZoom: 24
            })
        });
        onMapRotate()
        return map;
    }

    /**
     * 监听地图旋转事件
     */
     function onMapRotate() {
        map.on('postrender', function () {
          let rotation = map.getView().getRotation() // 获取地图的旋转角度
          // 检查旋转角度是否发生了变化
          if (rotation !== lastRotation) {
            WebBridge.postMessage(
                JSON.stringify({
                    type: "WEBVIEW_MAP_ROTATE",
                    rotation: rotation
                }),
            )
            lastRotation = rotation
          }
        })
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
