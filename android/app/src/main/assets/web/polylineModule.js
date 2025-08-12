// 折线模块
window.PolylineModule = (function () {
    let polylineLayer; // 折线图层
    let polylineFeature; // 折线地理要素
    let polylines = []; // 折线数组

    /**
     * 绘制折线
     * @param {ol.Map} map - 地图对象
     * @param {Array<number>} startPoint - 起点的经纬度坐标
     * @param {Array<number>} endPoint - 终点的经纬度坐标
     */
    function drawPolyline(map, startPoint,endPoint) {
        let transformedStartPoint = ol.proj.fromLonLat(startPoint)
        let transformedEndPoint = ol.proj.fromLonLat(endPoint)
        let lineString = new ol.geom.LineString([transformedStartPoint, transformedEndPoint]);
        polylineFeature = new ol.Feature({
            geometry: lineString
        });
        let style = new ol.style.Style({
            stroke: new ol.style.Stroke({
                 color: '#ffffff',
                width: 2,
            })
        });
        // 计算起点和终点之间的距离，并保留两位小数
        const distance = calculateDistance(transformedStartPoint, transformedEndPoint).toFixed(2)
        // 创建显示距离的文本
        let text=new ol.style.Text({
            text: `${distance}米`,
            font: '16px Arial',
            textAlign: 'center',
            textBaseline: 'middle',
            placement: 'line',
            offsetY: -15,
            fill: new ol.style.Fill({
                color: '#ffffff',
            }),
            stroke: new ol.style.Stroke({
                color: '#000000',
                width: 2,
            }),
        })
        style.setText(text)
        polylineFeature.setStyle(style)
        polylineLayer=new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [polylineFeature],
            }),
            zIndex: 99,
        })
        polylines.push(polylineLayer)
        map.addLayer(polylineLayer)
    }

    /**
     * 移除最后绘制的折线图层
     */
    function removePolyline() {
        if (polylines.length > 0) {
            const lastPolyline = polylines.pop();
            map.removeLayer(lastPolyline);
        }
    }

    /**
     * 移除地图上所有的折线图层
     */
    function removeAllPolylines() {
        polylines.forEach(polyline => {
            map.removeLayer(polyline);
        });
        polylines = [];
    }

    /**
     * 计算两点之间的距离
     * @param {Array<number>} startPoint - 起点的投影坐标
     * @param {Array<number>} endPoint - 终点的投影坐标
     * @returns {number} 两点之间的距离
     */
    function calculateDistance(startPoint, endPoint) {
        const distance = ol.sphere.getDistance(startPoint, endPoint);
        return distance;
    }


    return {
        drawPolyline,
        removePolyline,
        removeAllPolylines
    }
})();