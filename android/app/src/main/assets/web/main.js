// 修改模块加载顺序，确保依赖模块优先加载
(function () {
  const map = MapCore.initMap('map');
  window.ReactNativeWebView?.postMessage(JSON.stringify({
      type: 'WEBVIEW_MAP_READY', 
  }));

  const tdtSatelliteMapLayer = LayerModule.createTdSatelliteMapLayer(); // 天地图卫星图层
  const tdtAnnotationMapLayer = LayerModule.createTDAnnotationMapLayer(); // 天地图注记图层

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

    switch (data.type) {
      // 定位设备位置(设备IP所在定位)
      case "SET_LOCATION":
          const { lon, lat } = data.location;
          const coords = ol.proj.fromLonLat([lon, lat]);
          map.getView().animate({ center: coords, duration: 500 }); 
        break;

      // 设置设备位置图标（取得权限后的当前设备位置）
      case "SET_ICON_LOCATION":
          window.MarkerModule?.toLocateSelf(map, data.location);
        break;
      
      // 更新设备位置图标
      case "UPDATE_ICON_LOCATION":
          if (data.location) {
            window.MarkerModule?.updateCurrentLocation(data.location, map);
          } 
        break;
      
      // 更新设备位置图标旋转角度
      case "UPDATE_MARKER_ROTATION":
          window.MarkerModule?.updateMarkerRotation(map, data.rotation);
        break;
      
      // 切换地图图层
      case "SWITCH_LAYER":
          SwitchMapLayer.switchMapLayer(map, data.layerType, data.customUrl);
        break;
      
      // 地图打点（打点按钮）
      case "DOT_MARKER":
         if (data.location) {
            const {lon, lat} = data.location;
            window.MarkerModule?.drawDotMarker(map, {lon, lat});
          } 
        break;
      
      // 地图十字光标打点
      case "CURSOR_DOT_MARKER":
          const center = map.getView().getCenter(); 
          const cursorCoordinate = ol.proj.toLonLat(center); 
          window.MarkerModule?.drawDotMarker(map, {
            lon: cursorCoordinate[0], 
            lat: cursorCoordinate[1]
          });
        break;

      // 地图撤销打点
      case "REMOVE_DOT_MARKER":
         window.MarkerModule?.removeDotMarker(map);
        break;
    
      default:
          window.ReactNativeWebView?.postMessage("未处理的消息类型:" + data.type);
    }
  });
})();
