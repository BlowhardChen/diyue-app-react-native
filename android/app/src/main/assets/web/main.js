// 地图功能模块（消息队列）
(function () {
  const map = MapCore.initMap('map');

  // 默认图层
  SwitchMapLayer.switchMapLayer(map, 'TIANDITU_SAT');

  // 执行来自 React Native 的消息指令
  document.addEventListener("message", function (event) {
    WebBridge.onMessage(event, (data) => {
          switch (data.type) {
              // 定位设备位置(设备IP所在定位)
              case "SET_LOCATION":
                  const { lon, lat } = data.location;
                  const coords = ol.proj.fromLonLat([lon, lat]);
                  map.getView().animate({ center: coords, duration: 500 }); 
                break;
              // 设置设备位置图标（取得权限后的当前设备位置）
              case "SET_ICON_LOCATION":
                  MarkerModule?.toLocateSelf(map, data.location);
                break;
              // 更新设备位置图标
              case "UPDATE_ICON_LOCATION":
                  if (data.location) {
                      MarkerModule?.updateCurrentLocation(data.location, map);
                  } 
                break;
              // 更新设备位置图标旋转角度
              case "UPDATE_MARKER_ROTATION":
                  MarkerModule?.updateMarkerRotation(map, data.rotation);
                break;
              // 切换地图图层
              case "SWITCH_LAYER":
                  SwitchMapLayer.switchMapLayer(map, data.layerType, data.customUrl);
                break;  
              // 地图打点（打点按钮）
              case "DOT_MARKER":
                  if (data.location) {
                    const {lon, lat} = data.location;
                    MarkerModule?.drawDotMarker(map, {lon, lat});
                  } 
                break;
              // 地图十字光标打点
              case "CURSOR_DOT_MARKER":
                  const center = map.getView().getCenter(); 
                  const cursorCoordinate = ol.proj.toLonLat(center); 
                  MarkerModule?.drawDotMarker(map, {
                    lon: cursorCoordinate[0], 
                    lat: cursorCoordinate[1]
                  });
                break;
              // 地图撤销打点
              case "REMOVE_DOT_MARKER":
                  MarkerModule?.removeDotMarker(map);
                break;
              // 保存地块
              case "SAVE_POLYGON":
                  MarkerModule?.savePolygonToNative(data.token);
                break;
              // 绘制已圈地地块
              case "DRAW_ENCLOSURE_LAND":
                  PolygonModule?.drawLandPolygonList(map,data.data);
                break;
              // 继续圈地
              case 'CONTINUE_ENCLOSURE':
                  PolygonModule?.clearCurrentPolygon(map);
                  MarkerModule?.removeAllDotMarkers(map);
                break
              default:
                  WebBridge.postMessage("未处理的消息类型:" + data.type);
                break;
          }
      });
  });

  WebBridge.postMessage({ type: 'WEBVIEW_READY' });
})();
