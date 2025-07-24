(function () {
  const map = MapCore.initMap('map');

  const tdtSatelliteMapLayer = LayerModule.createTdSatelliteMapLayer(); // 天地图卫星图层
  const tdtAnnotationMapLayer = LayerModule.createTDAnnotationMapLayer(); // 天地图注记图层
  const tdtElectronicMapLayer = LayerModule.createTdElectronMapLayer(); // 天地图电子图层


  map.addLayer(tdtSatelliteMapLayer);
  map.addLayer(tdtAnnotationMapLayer);

  // 接收来自 React Native 的消息
  document.addEventListener("message", function (event) {
   
    let data = null;
    try {
      data = JSON.parse(event.data);
    } catch (e) {
      window.ReactNativeWebView?.postMessage("无法解析消息:" + event.data);
      return;
    }

    if (!data || !data.type) return;
    window.ReactNativeWebView?.postMessage("接收来自 React Native 的消息:" + event.data.type);

    switch (data.type) {
      // 定位设备位置(设备IP所在定位)
      case "SET_LOCATION":
        const { lon, lat } = data.location;
        const coords = ol.proj.fromLonLat([lon, lat]);
        map.getView().animate({ center: coords, duration: 500 });
        break;

      // 设置设备位置图标（取得权限后的当前设备位置）
      case "SET_ICON_LOCATION":
        window.LocateModule?.setDevicePositionMarker(map, data.location);
        break;
      
      // 更新设备位置图标旋转角度
      case "UPDATE_MARKER_ROTATION":
        window.LocateModule?.setDevicePositionMarker(map, data.location);
        break;
      
      // 切换地图图层
      case "SWITCH_LAYER":
        switchMapLayer(map, data.layerType, data.customUrl);
        break;
      
      default:
        window.ReactNativeWebView?.postMessage("未处理的消息类型:" + data.type);
    }
  });

  /**
   * 切换地图图层
   * @param {Object} map - OpenLayers 地图实例
   * @param {string} layerType - 要切换的图层类型，可选值：'TIANDITU_SAT', 'TIANDITU_ELEC', 'CUSTOM'
   * @param {string} customUrl - 自定义图层的服务URL，仅在 layerType 为 'CUSTOM' 时需要
   */
  function switchMapLayer(map, layerType, customUrl) {
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
      SwitchMapLayer.switchBaseLayers(map, layersToLoad);
  }
})();
