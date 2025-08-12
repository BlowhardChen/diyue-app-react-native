// 标记点模块
window.MarkerModule = (function () {
    let selfMarkerLayer; // 当前设备点位图层
    let selfMarkerFeature; // 当前设备点位点地理要素
    let dotMarkerLayer; // 地图打点图层
    let dotMarkerFeature; // 地图打点地理要素
    let dotMarkers = []; // 地图打点图层数组
    let dotMarkerCoordinates = []; // 地图打点坐标数组（格式: [{lon, lat}, ...]）


    /**
     * 绘制地图打点（核心逻辑）
     * @param {ol.Map} map - 地图实例
     * @param {object} location - 经纬度坐标 {lon, lat}
     */
    function drawDotMarker(map, location) {
        // 1. 过滤重复点（距离小于0.3米则视为重复）
        if (!filterPointDot(location, dotMarkerCoordinates)) {
            window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'WEBVIEW_DOT_REPEAT',
               
            }));
            return;
        }

        // 2. 存储新点并更新计数
        dotMarkerCoordinates.push(location);
        const dotTotal = dotMarkerCoordinates.length;

        // 3. 绘制标记点
        const markerIcon = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAAAXNSR0IArs4c6QAAAtxJREFUWEfNmE1sTFEUx383KmyahrBpWgk2aPVDYqEaWpFaSFhJtGz7SRtiS8WwFcLo9GNbrcSKxIKIltAuhGmZYiGRaNMNIU03ROWaw3svb+5MvXmvPu5LZnPvPef+5pz//ThXEfLTWq8H9gG1wGZgHVDouJkH3gOvgcfAXaXUuzBTqHwGa62XAYeA40ANkJcdoIExIA7cVEp9D5ov0LHWei9wFdgU5Cyg/w3QqZS6/7txiwJprVcCl4GWEBEJYpaI9QMnlFJfcg3OCaS1XgvcSf+2ZxlpDZOTMD4GUymYnoF5kY4oqRBKS6CsHHbUQGUlqJxTPAX2K6U+mP6zRjswj7JSJCAPR2GgH6angyLxq7+0FJpbYHddLjBJ4S4TKgPISZPAZEZmdhZi5+DVVH4g5qgtZdB9FoqLzR6JlEB56TOBeoHWDKtkErpPw9xcNBjXqqgIYhegutr006eUanMbPSBnNd3LELDAnDoJCwtLg3GtCwrg4iUTSoTe4K6+n0DOPpPK0I2kqbV56ZEx/4pEqm/ATJ/oqVz2KRfoMDDs2YqA29uiayYonqKpRK8p9Eal1A0XSLb5nZ6f0RHoPhPkdmn9sfNQV+/38SSdtlqltd4AvPW0I9E52pT/0o6KJVvC4JA/SqKljQIkCk94fieS0NUZdZpwdlfiUFXlt2kXoEHgiNea6IHhoXCOo45ubIL2Dr/1dQF6BmzzWo91wMsXUacIZ7e1Aq71+G2eC5CcJ2u81oMH4POncI6jjl61Gm7d9lt/FCDZtld4rXvqYeFb1CnC2RUshwcjfpuvVgJZl7L/J+qKCohni9q6ZW9sjBPQJXf5f/AtsjHadXRIHNJ3IXsOVwfIuuuHFIL2XNCcKElBaMcV1l1PWmt7LvlOlKRatacMcqCkarWjUPSlLqCUnoDxcUilYMYopUtKoPwPltI+KHseG/yHhjXPMQaUPQ9W5hHrlE0Nf+tJ7weMM2/KMUGazgAAAABJRU5ErkJggg==',
                crossOrigin: 'anonymous',
                scale: 0.3,
                rotateWithView: true
            })
        });
        const dotMarkerFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([location.lon, location.lat]))
        });
        dotMarkerFeature.setStyle(markerIcon);
        const dotMarkerLayer = new ol.layer.Vector({
            source: new ol.source.Vector({ features: [dotMarkerFeature] }),
            zIndex: 110
        });
        dotMarkers.push(dotMarkerLayer);
        map.addLayer(dotMarkerLayer);

        // 4. 处理线段和多边形绘制逻辑
        handlePolylineAndPolygon(map, dotTotal);
    }

    /**
     * 处理线段和多边形的绘制/移除逻辑
     * @param {ol.Map} map - 地图实例
     * @param {number} dotTotal - 当前打点总数
     */
    function handlePolylineAndPolygon(map, dotTotal) {
        const coords = dotMarkerCoordinates.map(coord => [coord.lon, coord.lat]);

        // 根据点数处理不同情况
        switch (dotTotal) {
            case 0:
                // 0个点：清空所有内容
                window.PolylineModule.removeAllPolylines();
                window.PolygonModule.removePolygon(map);
                break;

            case 1:
                // 1个点：只保留标记点
                window.PolylineModule.removeAllPolylines();
                window.PolygonModule.removePolygon(map);
                break;

            case 2:
                // 2个点：绘制两点之间的线段
                window.PolygonModule.removePolygon(map); // 移除可能存在的多边形
                window.PolylineModule.removeAllPolylines();
                const startPoint = coords[0];
                const endPoint = coords[1];
                window.PolylineModule.drawPolyline(map, startPoint, endPoint);
                break;

            default: // 3个点及以上
                // 移除之前的多边形
                window.PolygonModule.removePolygon(map);
                
                // 创建闭合多边形坐标
                const closedCoords = [...coords, coords[0]];
                const polygonResult = window.PolygonModule.drawPolygon(map, closedCoords);
                
                // 通知RN已形成闭合区域
                if (polygonResult) {
                    window.ReactNativeWebView?.postMessage(JSON.stringify({
                        type: 'WEBVIEW_DOT_SUCCESS',
                        message: `已形成闭合区域地块，面积: ${polygonResult.area}亩，是否保存`,
                        area: polygonResult.area
                    }));
                }
                break;
        }
    }


    /**
     * 移除地图打点（同时处理线段和多边形）
     * @param {ol.Map} map - 地图实例
     */
    function removeDotMarker(map) {
        if (dotMarkers.length === 0) return;

        // 移除最后一个点标记
        dotMarkerCoordinates.pop();
        const lastMarker = dotMarkers.pop();
        map.removeLayer(lastMarker);

        const dotTotal = dotMarkerCoordinates.length;
        
        // 重新处理线段和多边形状态
        handlePolylineAndPolygon(map, dotTotal);
        
        // 通知RN更新计数
        window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'WEBVIEW_UPDATE_DOT_TOTAL',
            total: dotTotal
        }));
    }

    /**
     * 移除所有地图打点（重置所有状态）
     * @param {ol.Map} map - 地图实例
     */
    function removeAllDotMarkers(map) {
        // 移除所有点标记
        dotMarkers.forEach(marker => map.removeLayer(marker));
        dotMarkers = [];
        dotMarkerCoordinates = [];

        // 移除所有线段和多边形
        window.PolylineModule.removeAllPolylines();
        window.PolygonModule.removePolygon(map);

        // 通知RN重置计数
        window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'WEBVIEW_UPDATE_DOT_TOTAL',
            total: 0
        }));
        window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'WEBVIEW_DOT_SUCCESS',
            message: '请点击打点按钮打点或点击十字光标标点'
        }));
    }

    /**
     * 过滤重复点（距离小于0.3米则视为重复）
     */
    function filterPointDot(location, dotMarkerCoordinates) {
        if (dotMarkerCoordinates.length === 0) return true;
        
        const points = dotMarkerCoordinates.map(dot => 
            turf.point([dot.lon, dot.lat])
        );
        const newPoint = turf.point([location.lon, location.lat]);
        let isTooClose = false;
        
        points.forEach(point => {
            const distance = turf.distance(newPoint, point, { units: 'meters' });
            if (distance < 0.3) isTooClose = true;
        });
        
        return !isTooClose;
    }

    // 以下为原有方法（保持不变）
    function toLocateSelf(map, location) {
        if (!selfMarkerLayer) {
            drawCurrentLocation(map, location);
        } else {
            updateCurrentLocation(location, map);
        }
        map.getView().animate({
            center: ol.proj.fromLonLat([location.lon, location.lat]),
            zoom: 17,
            duration: 500
        });
    }

    function drawCurrentLocation(map, location) {
        const markerIcon = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGwAAABsCAMAAAC4uKf/AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA/UExURUdwTP///////////////////////////////////////////////wBm/2qm/9/r/yJ7/4G0/7rV/53F/0iR/8UpuJkAAAAMdFJOUwBv0J5M9ZAoD+e0f3GFDYUAAAJVSURBVGje7ZrJloMgEEWDTA6Mkv//1hYwaU3SRhDq9IK7ybCpU4/iWRTebv8eQuBi9cPQgwUbhRihYiGxgGBiceqDUQ4SrBOBDiLWJFYmIBHnGUTI3ouojdFeyNr1z7yAdynv/pNVtg4fw8kF57+RutbhRZQBL2RVI8GriJ4gJK4sopUrtqqQWxGrCzn6VMxvMON/V3Lk4L9KblDVHDlah9xRzUi6FxGfQlZw5OlNxKeQE4SItYRc/dcrd1fWOmetuoefFRw5+q9Rs9gxK1PekYN1aC0+EP8lha3jCFrQSPA2k9lZtWDdvM0UFxXxsUa7bbZZw0JC8lVErcx76Ru15jfwgrG0kn+whut4sVhWHmAL5UZC+6uNPCRsbUFJAZeKHc4x7npLHjW08gT2qpLBEYWSpwgPgAsuiU/n9cwNX9rMTp7mSt/62kx950K7xT70AV92QPbjJlS9lUnY3PpnqSI+hMxIrafnq35f/zR91VBOYjG19La1y0ksppbcSPLkUtwUJM9QcZYZzBk6jnkqRh1TTzY0T8WoI01fMi2z0MmLRnKXLC4aSa4PlxfMJVfIlO6LW3+cko1R5QVTyfaIrwXD/zcYqIygBQJa+qCbGtSuQI0Y9hED+vAEbQtAGx7YVg60SQVtv2EPFqBHJtjDIOgxF/YADzuaAB26wI6TYAdlsCPAJVoHN9xcahKfGdviUvNvMnwbSA8lB/uMHo3aKSt7P8J/w73dILDyN2g96j6F6lClW0+Oxl1+dER13y/gBE0MYzYhAvNGSKPRaDQajUbjD34Ahjuw/2IMQQQAAAAASUVORK5CYII=',
                crossOrigin: 'anonymous',
                scale: 0.3,
                rotateWithView: true
            })
        });
        selfMarkerFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([location.lon, location.lat]))
        });
        selfMarkerFeature.setStyle(markerIcon);
        selfMarkerLayer = new ol.layer.Vector({
            source: new ol.source.Vector({ features: [selfMarkerFeature] }),
            zIndex: 101
        });
        map.addLayer(selfMarkerLayer);
    }

    function updateCurrentLocation(location, map) {
        const features = selfMarkerLayer?.getSource()?.getFeatures();
        if (!features || features.length === 0) {
            window.ReactNativeWebView?.postMessage("⚠️ selfMarkerFeature 不存在，自动绘制");
            drawCurrentLocation(map, location);
            return;
        }
        const markerGeometry = features[0].getGeometry();
        const newCoord = ol.proj.fromLonLat([location.lon, location.lat]);
        markerGeometry.setCoordinates(newCoord);
        map.renderSync();
    }

    function transformMarkerCoordinate(map, fromType, toType) {
        if (!selfMarkerFeature || !selfMarkerFeature.getGeometry()) return;
        const currentCoord = selfMarkerFeature.getGeometry().getCoordinates();
        let [lon, lat] = ol.proj.toLonLat(currentCoord);
        if (fromType === toType) return;
        if (fromType === "WGS84" && toType === "GCJ02") {
            [lon, lat] = TransformModule.wgs84ToGcj02(lon, lat);
        } else if (fromType === "GCJ02" && toType === "WGS84") {
            [lon, lat] = TransformModule.gcj02ToWgs84(lon, lat);
        }
        const transformedCoord = ol.proj.fromLonLat([lon, lat]);
        selfMarkerFeature.getGeometry().setCoordinates(transformedCoord);
    }

    function updateMarkerRotation(map, degrees) {
        if (!selfMarkerFeature) return;
        const radians = degrees * (Math.PI / 180);
        const rotatedStyle = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGwAAABsCAMAAAC4uKf/AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA/UExURUdwTP///////////////////////////////////////////////wBm/2qm/9/r/yJ7/4G0/7rV/53F/0iR/8UpuJkAAAAMdFJOUwBv0J5M9ZAoD+e0f3GFDYUAAAJVSURBVGje7ZrJloMgEEWDTA6Mkv//1hYwaU3SRhDq9IK7ybCpU4/iWRTebv8eQuBi9cPQgwUbhRihYiGxgGBiceqDUQ4SrBOBDiLWJFYmIBHnGUTI3ouojdFeyNr1z7yAdynv/pNVtg4fw8kF57+RutbhRZQBL2RVI8GriJ4gJK4sopUrtqqQWxGrCzn6VMxvMON/V3Lk4L9KblDVHDlah9xRzUi6FxGfQlZw5OlNxKeQE4SItYRc/dcrd1fWOmetuoefFRw5+q9Rs9gxK1PekYN1aC0+EP8lha3jCFrQSPA2k9lZtWDdvM0UFxXxsUa7bbZZw0JC8lVErcx76Ru15jfwgrG0kn+whut4sVhWHmAL5UZC+6uNPCRsbUFJAZeKHc4x7npLHjW08gT2qpLBEYWSpwgPgAsuiU/n9cwNX9rMTp7mSt/62kx950K7xT70AV92QPbjJlS9lUnY3PpnqSI+hMxIrafnq35f/zR91VBOYjG19La1y0ksppbcSPLkUtwUJM9QcZYZzBk6jnkqRh1TTzY0T8WoI01fMi2z0MmLRnKXLC4aSa4PlxfMJVfIlO6LW3+cko1R5QVTyfaIrwXD/zcYqIygBQJa+qCbGtSuQI0Y9hED+vAEbQtAGx7YVg60SQVtv2EPFqBHJtjDIOgxF/YADzuaAB26wI6TYAdlsCPAJVoHN9xcahKfGdviUvNvMnwbSA8lB/uMHo3aKSt7P8J/w73dILDyN2g96j6F6lClW0+Oxl1+dER13y/gBE0MYzYhAvNGSKPRaDQajUbjD34Ahjuw/2IMQQQAAAAASUVORK5CYII=',
                crossOrigin: 'anonymous',
                scale: 0.3,
                rotateWithView: true,
                rotation: radians
            })
        });
        selfMarkerFeature.setStyle(rotatedStyle);
        if (map && typeof map.render === 'function') {
            map.render();
        }
    }

    return {
        toLocateSelf,
        drawCurrentLocation,
        updateCurrentLocation,
        transformMarkerCoordinate,
        updateMarkerRotation,
        drawDotMarker,
        removeDotMarker,
        removeAllDotMarkers,
        filterPointDot
    };
})();
