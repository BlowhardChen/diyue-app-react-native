window.LocateModule = (function () {
    let markerLayer;
    let markerFeature; 

    /**
     * 设置设备定位标记。
     * @param {ol.Map} map - OpenLayers 地图实例。
     * @param {object} location - 经纬度坐标对象 {lon, lat}。
     * @returns {ol.layer.Vector} - 包含定位标记的矢量图层。
     */
    function setDevicePositionMarker(map, location) {
        const markerIcon = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: '../images/location-my.png',
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
        markerLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [markerFeature]
            }),
            zIndex: 101
        });

        map.addLayer(markerLayer);
    }

    /**
     * 更新已存在的定位标记坐标。
     * 如果标记不存在，则自动调用 setDevicePositionMarker 初始化。
     * @param {object} location - 新的经纬度坐标 {lon, lat}。
     * @param {ol.Map} map - OpenLayers 地图实例。
     */
    function updateDevicePosition(location, map) {
        if (markerFeature && markerLayer) {
            const newCoord = ol.proj.fromLonLat([location.lon, location.lat]);
            markerFeature.getGeometry().setCoordinates(newCoord);
        } else {
            // 初次调用，尚未添加定位点
            setDevicePositionMarker(map, location);
        }
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

    /**
     * 获取定位标记图层。
     * @returns {ol.layer.Vector} - 包含定位标记的矢量图层。
     */
    function getMarkerLayer() {
        return markerLayer;
    }

    return {
        setDevicePositionMarker,
        updateDevicePosition,
        transformMarkerCoordinate,
        getMarkerLayer,
        updateMarkerRotation
    };
})();
