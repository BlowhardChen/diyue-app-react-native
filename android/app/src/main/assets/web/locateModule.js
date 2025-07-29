window.LocateModule = (function () {
    let selfMarkerLayer;
    let markerFeature; 

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
        markerFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([location.lon, location.lat]))
        });
        markerFeature.setStyle(markerIcon);

        // 创建图层并添加到地图
        selfMarkerLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [markerFeature]
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
            window.ReactNativeWebView?.postMessage("⚠️ markerFeature 不存在，自动绘制");
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
        if (!markerFeature || !markerFeature.getGeometry()) return;

        const currentCoord = markerFeature.getGeometry().getCoordinates(); // 投影坐标
        let [lon, lat] = ol.proj.toLonLat(currentCoord); // WGS84 经纬度

        if (fromType === toType) return;

        if (fromType === "WGS84" && toType === "GCJ02") {
            [lon, lat] = TransformModule.wgs84ToGcj02(lon, lat);
        } else if (fromType === "GCJ02" && toType === "WGS84") {
            [lon, lat] = TransformModule.gcj02ToWgs84(lon, lat);
        }

        const transformedCoord = ol.proj.fromLonLat([lon, lat]); // 转回投影坐标
        markerFeature.getGeometry().setCoordinates(transformedCoord);
    }
    /**
     * 更新定位标记的旋转角度。
     * 如果定位标记不存在，则不执行任何操作。
     * @param {number} degrees - 要设置的旋转角度，单位为度。
     */
    function updateMarkerRotation(degrees) {
        if (!markerFeature) return;
    
        const radians = degrees * (Math.PI / 180);
        const style = markerFeature.getStyle();
        const icon = style.getImage();
        icon.setRotation(radians);
        markerFeature.setStyle(style);
    }

    return {
        locateToSelf,
        drawCurrentLocation,
        updateCurrentLocation,
        transformMarkerCoordinate,
        updateMarkerRotation
    };
})();
