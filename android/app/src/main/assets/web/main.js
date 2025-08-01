(function () {
  const map = MapCore.initMap('map');
  window.ReactNativeWebView?.postMessage("地图加载完成");

  const tdtSatelliteMapLayer = LayerModule.createTdSatelliteMapLayer(); // 天地图卫星图层
  const tdtAnnotationMapLayer = LayerModule.createTDAnnotationMapLayer(); // 天地图注记图层
  const tdtElectronicMapLayer = LayerModule.createTdElectronMapLayer(); // 天地图电子图层


  map.addLayer(tdtSatelliteMapLayer);
  map.addLayer(tdtAnnotationMapLayer);

  // 接收来自 React Native 的消息
  document.addEventListener("message", function (event) {
   
    let data = null;
    window.ReactNativeWebView?.postMessage("接收来自 React Native 的消息:" + event.data);
    try {
      data = JSON.parse(event.data);
    } catch (e) {
      window.ReactNativeWebView?.postMessage("无法解析消息:" + event.data);
      return;
    }
      
    if (!data || !data.type) return;
  

    switch (data.type) {
      // 定位设备位置(设备IP所在定位)
      case "SET_LOCATION":
        const { lon, lat } = data.location;
        const coords = ol.proj.fromLonLat([lon, lat]);
        map.getView().animate({ center: coords, duration: 500 }); 
        break;

      // 设置设备位置图标（取得权限后的当前设备位置）
      case "SET_ICON_LOCATION":
            window.LocateModule?.locateToSelf(map, data.location);
        break;
      
      // 更新设备位置图标旋转角度
      case "UPDATE_MARKER_ROTATION":
        window.LocateModule?.updateMarkerRotation(data.rotation);
        break;
      
      // 切换地图图层
      case "SWITCH_LAYER":
        SwitchMapLayer.switchMapLayer(map, data.layerType, data.customUrl);
        break;
      
      default:
        window.ReactNativeWebView?.postMessage("未处理的消息类型:" + data.type);
    }
  });
})();
