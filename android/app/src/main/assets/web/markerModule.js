// 标记点模块
window.MarkerModule = (function () {
    let selfMarkerLayer; // 当前设备点位图层
    let selfMarkerFeature; // 当前设备点位点地理要素
    let dotMarkerLayer; // 地图打点图层
    let dotMarkerFeature; // 地图打点地理要素
    let dotMarkers = []; // 地图打点数组

    /**
     * 将地图定位到用户自身位置，并绘制定位标记。
     * @param {ol.Map} map - OpenLayers 地图实例。
     * @param {object} location - 经纬度坐标对象，包含 `lon`（经度）和 `lat`（纬度）属性。
     */
    function locateToSelf(map, location) {
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

    /**
     * 绘制当前用户定位点
     * @param {ol.Map} map - OpenLayers 地图实例。
     * @param {object} location - 经纬度坐标对象 {lon, lat}。
     * @returns {ol.layer.Vector} - 包含定位标记的矢量图层。
     */
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

        // 创建 Feature（地理要素）
        selfMarkerFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([location.lon, location.lat]))
        });
        selfMarkerFeature.setStyle(markerIcon);

        // 创建图层并添加到地图
        selfMarkerLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [selfMarkerFeature]
            }),
            zIndex: 101
        });

        map.addLayer(selfMarkerLayer);
    }

    /**
     * 更新已存在的定位标记坐标。
     * 如果标记不存在，则自动调用 drawCurrentLocation 初始化。
     * @param {object} location - 新的经纬度坐标 {lon, lat}。
     * @param {ol.Map} map - OpenLayers 地图实例。
     */
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

    /**
    * 切换图层时更新标记坐标。
    * @param {ol.Map} map - 地图实例。
    * @param {"WGS84"|"GCJ02"} fromType - 原坐标类型。
    * @param {"WGS84"|"GCJ02"} toType - 目标坐标类型。
    */
    function transformMarkerCoordinate(map, fromType, toType) {
        if (!selfMarkerFeature || !selfMarkerFeature.getGeometry()) return;

        const currentCoord = selfMarkerFeature.getGeometry().getCoordinates(); // 投影坐标
        let [lon, lat] = ol.proj.toLonLat(currentCoord); // WGS84 经纬度

        if (fromType === toType) return;

        if (fromType === "WGS84" && toType === "GCJ02") {
            [lon, lat] = TransformModule.wgs84ToGcj02(lon, lat);
        } else if (fromType === "GCJ02" && toType === "WGS84") {
            [lon, lat] = TransformModule.gcj02ToWgs84(lon, lat);
        }

        const transformedCoord = ol.proj.fromLonLat([lon, lat]); // 转回投影坐标
        selfMarkerFeature.getGeometry().setCoordinates(transformedCoord);
    }
    /**
     * 更新定位标记的旋转角度。
     * 如果定位标记不存在，则不执行任何操作。
     * @param {number} degrees - 要设置的旋转角度，单位为度。
     */
    function updateMarkerRotation(degrees) {
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
        map.render();
    }
    
    /**
     * 绘制地图打点
     * @param {ol.Map} map - 地图实例
     * @param {object} location - 经纬度坐标 {lon, lat}
     */
    function drawDotMarker(map, location) {
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

        // 创建 Feature（地理要素）
        dotMarkerFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([location.lon, location.lat]))
        });
        dotMarkerFeature.setStyle(markerIcon);

        // 创建图层并添加到地图
        dotMarkerLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [dotMarkerFeature]
            }),
            zIndex: 110
        });

        dotMarkers.push(dotMarkerLayer);
        map.addLayer(dotMarkerLayer);
    }

    /**
     * 移除地图打点
     * @param {ol.Map} map - 地图实例
     */
    function removeDotMarker(map) {
        if (dotMarkers.length > 0) {
            const lastMarker = dotMarkers.pop();
            map.removeLayer(lastMarker);
        }
    }

    /**
     * 移除所有地图打点
     * @param {ol.Map} map - 地图实例
     */
    function removeAllDotMarkers(map) {
        dotMarkers.forEach(marker => {
            map.removeLayer(marker);
        });
        dotMarkers = [];
    }

    return {
        locateToSelf,
        drawCurrentLocation,
        updateCurrentLocation,
        transformMarkerCoordinate,
        updateMarkerRotation,
        drawDotMarker,
        removeDotMarker,
        removeAllDotMarkers
    };
})();
