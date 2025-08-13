// 多边形模块
window.PolygonModule = (function () {
    let polygonLayer = null;   // 当前多边形图层
    let polygonFeature = null; // 当前多边形 Feature
    let polygonArea = 0;       // 当前多边形面积（亩）

    /**
     * 计算面积（亩）
     * @param {Array<Array<number>>} coordsLonLat - 未闭合的 [ [lon,lat], ... ]
     * @returns {number} 亩
     */
    function computeAreaMu(coordsLonLat) {
        if (!Array.isArray(coordsLonLat) || coordsLonLat.length < 3) return 0;
        const closed = [...coordsLonLat, coordsLonLat[0]];
        const turfPolygon = turf.polygon([closed]); // GeoJSON 多边形
        const areaM2 = turf.area(turfPolygon);
        return +(areaM2 / 666.6667).toFixed(2);
    }

    /**
     * 绘制多边形（传入未闭合经纬度坐标）
     * @param {ol.Map} map
     * @param {Array<Array<number>>} coordsLonLat - [ [lon,lat], ... ] 未闭合
     * @returns {{ layer: ol.layer.Vector, feature: ol.Feature, area: number }|null}
     */
    function drawPolygon(map, coordsLonLat) {
        if (!map || !Array.isArray(coordsLonLat) || coordsLonLat.length < 3) {
            console.error("多边形坐标无效");
            return null;
        }

        // 投影到 3857（不闭合）
        const path3857 = coordsLonLat.map(ll => ol.proj.transform(ll, 'EPSG:4326', 'EPSG:3857'));
        // OpenLayers 多边形需要闭合
        const closed3857 = [...path3857, path3857[0]];

        const polygon = new ol.geom.Polygon([closed3857]);
        polygonArea = computeAreaMu(coordsLonLat);

        polygonFeature = new ol.Feature({ geometry: polygon });

        // 样式（面 + 面积标注）
        polygonFeature.setStyle(
            new ol.style.Style({
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 }),
                fill: new ol.style.Fill({ color: 'rgba(0, 0, 0, 0.3)' }),
                text: new ol.style.Text({
                    text: polygonArea + '亩',
                    font: '16px Arial',
                    fill: new ol.style.Fill({ color: '#fff' }),
                    stroke: new ol.style.Stroke({ color: '#000', width: 2 }),
                }),
            })
        );

        polygonLayer = new ol.layer.Vector({
            source: new ol.source.Vector({ features: [polygonFeature] }),
            zIndex: 99,
        });

        map.addLayer(polygonLayer);

        // —— 边长标注：显式指定投影，避免单位误差 ——
        for (let i = 0; i < closed3857.length - 1; i++) {
            const start = closed3857[i];
            const end   = closed3857[i + 1];
            const line  = new ol.geom.LineString([start, end]);

            // 使用球面长度并显式告知几何所用投影
            const lengthM = ol.sphere.getLength(line, { projection: 'EPSG:3857' });

            const lineFeature = new ol.Feature({ geometry: line });
            lineFeature.setStyle(
                new ol.style.Style({
                    text: new ol.style.Text({
                        text: lengthM.toFixed(2) + ' m',
                        font: '16px Arial',
                        textAlign: 'center',
                        textBaseline: 'middle',
                        placement: 'line',
                        offsetY: -15,
                        fill: new ol.style.Fill({ color: '#ffffff' }),
                        stroke: new ol.style.Stroke({ color: '#000000', width: 2 }),
                    }),
                })
            );

            polygonLayer.getSource().addFeature(lineFeature);
        }

        return { layer: polygonLayer, feature: polygonFeature, area: polygonArea };
    }

    function getCurrentPolygonArea() {
        return polygonArea;
    }

    /**
     * 移除多边形
     * @param {ol.Map} map
     */
    function removePolygon(map) {
        if (polygonLayer) {
            map.removeLayer(polygonLayer);
            polygonLayer = null;
            polygonFeature = null;
            polygonArea = 0;
        }
    }

    return {
        drawPolygon,
        removePolygon,
        getCurrentPolygonArea
    };
})();
