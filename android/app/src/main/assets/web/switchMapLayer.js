// 图层切换模块
window.SwitchMapLayer = (function () {
  let currentLayers = []; // 缓存当前图层

  /**
   * 切换地图图层
   * @param {Object} map - OpenLayers 地图实例
   * @param {string} layerType - 要切换的图层类型，可选值：'TIANDITU_SAT', 'TIANDITU_ELEC', 'CUSTOM'
   * @param {string} customUrl - 自定义图层的服务URL，仅在 layerType 为 'CUSTOM' 时需要
   */
  function switchMapLayer(map, layerType, customUrl) {
    window.ReactNativeWebView?.postMessage(`切换地图图层,layerType:${layerType},customUrl:${customUrl}`)
      let layersToLoad = [];
      switch (layerType) {
          case 'TIANDITU_SAT':
            layersToLoad = [LayerModule.tdtSatellite, LayerModule.tdtAnnotation];
            break;
          case 'TIANDITU_ELEC':
            layersToLoad = [LayerModule.tdtElectronic, LayerModule.tdtAnnotation];
            break;
          case 'CUSTOM':
            if (customUrl) {
              layersToLoad = [LayerModule.createCustomLayer(customUrl)];
            }
            break;
          default:
            window.ReactNativeWebView?.postMessage(`未知图层类型: ${layerType}`);
            return;
      }
      switchBaseLayers(map, layersToLoad);
  }

  /**
   * 切换地图底图图层
   * @param {ol.Map} map - 地图对象
   * @param {ol.layer.Base[]} newLayers - 新图层列表
   */
  function switchBaseLayers(map, newLayers) {
     // 从地图中移除旧图层
    if (currentLayers && currentLayers.length > 0) {
      currentLayers.forEach(layer => {
        map.removeLayer(layer);
      });
    }

    // 添加新图层到地图中
    newLayers.forEach(layer => {
      map.addLayer(layer);
    });

    // 更新当前缓存图层
    currentLayers = newLayers;
  }

  return {
    switchMapLayer,
    switchBaseLayers
  };
})();
