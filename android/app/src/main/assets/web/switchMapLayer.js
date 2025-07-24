// 图层切换模块
window.SwitchMapLayer = (function () {
  let currentLayers = []; // 缓存当前图层

  /**
   * 切换地图底图图层
   * @param {ol.Map} map - 地图对象
   * @param {ol.layer.Base[]} newLayers - 新图层列表
   */
  function switchBaseLayers(map, newLayers) {
    if (!map || !Array.isArray(newLayers) || newLayers.length === 0) return;

    const layerCollection = map.getLayers();

    // 移除旧图层
    currentLayers.forEach(layer => {
      if (layerCollection.getArray().includes(layer)) {
        layerCollection.remove(layer);
      }
    });

    // 添加新图层
    newLayers.forEach(layer => {
      layerCollection.push(layer);
    });

    // 更新缓存
    currentLayers = [...newLayers];

    // 可选：触发一次渲染
    map.render();
  }

  return {
    switchBaseLayers
  };
})();
