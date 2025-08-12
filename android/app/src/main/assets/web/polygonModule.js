// 多边形模块
window.PolygonModule = (function () {
    let polygonLayer = null; // 当前多边形图层
    let polygonFeature = null; // 当前多边形 Feature
    let polygonArea = 0; // 当前多边形面积（亩）

    /**
     * 计算面积（亩）
     * @param {Array<Array<number>>} coords - 经纬度坐标数组
     * @returns {number} 面积（亩）
     */
    function computeArea(coords) {
        const turfPolygon = turf.polygon([[...coords, coords[0]]]); // 闭合多边形
        const areaM2 = turf.area(turfPolygon); // 平方米
        return (areaM2 / 666.6667).toFixed(2); // 转亩
    }

    /**
     * 绘制多边形
     * @param {ol.Map} map - 地图实例
     * @param {Array<Array<number>>} data - 经纬度坐标数组，例如 [[lon, lat], [lon, lat], ...]
     * @returns {{layer: ol.layer.Vector, feature: ol.Feature, area: number}}
     */
    function drawPolygon(map, data) {
        if (!map || !Array.isArray(data) || data.length < 3) {
            console.error("多边形坐标无效");
            return;
        }

        // 经纬度转 EPSG:3857
        const path = data.map((item) =>
            ol.proj.transform(item, 'EPSG:4326', 'EPSG:3857')
        );

        // 创建多边形
        const polygon = new ol.geom.Polygon([path]);
        polygonArea = computeArea(data);

        polygonFeature = new ol.Feature({
            geometry: polygon,
        });

        // 多边形样式
        polygonFeature.setStyle(
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#ffffff',
                    width: 2,
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 0, 0.3)',
                }),
                text: new ol.style.Text({
                    text: polygonArea + '亩',
                    font: '16px Arial',
                    fill: new ol.style.Fill({ color: '#fff' }),
                    stroke: new ol.style.Stroke({
                        color: '#000',
                        width: 2,
                    }),
                }),
            })
        );

        // 图层
        polygonLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [polygonFeature],
            }),
            zIndex: 99,
        });

        map.addLayer(polygonLayer);

        // 边长标注
        for (let i = 0; i < path.length; i++) {
            const start = path[i];
            const end = path[(i + 1) % path.length];
            const line = new ol.geom.LineString([start, end]);
            const length = ol.sphere.getLength(line);

            const lineFeature = new ol.Feature({
                geometry: line,
            });

            lineFeature.setStyle(
                new ol.style.Style({
                    text: new ol.style.Text({
                        text: length.toFixed(2) + ' m',
                        font: '16px Arial',
                        textAlign: 'center',
                        textBaseline: 'middle',
                        placement: 'line',
                        offsetY: -15,
                        fill: new ol.style.Fill({ color: '#ffffff' }),
                        stroke: new ol.style.Stroke({
                            color: '#000000',
                            width: 2,
                        }),
                    }),
                })
            );

            polygonLayer.getSource().addFeature(lineFeature);
        }

        return { layer: polygonLayer, feature: polygonFeature, area: polygonArea };
    }

    function getCurrentPolygonArea() {
        return polygonArea; // 返回当前多边形面积
    }

    /**
     * 移除多边形
     * @param {ol.Map} map - 地图实例
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
