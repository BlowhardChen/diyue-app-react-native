// 折线模块
window.PolylineModule = (function () {
    let polylines = []; // 折线图层集合（按绘制顺序）
    let locusLineLayer = null; // 巡田轨迹图层对象

    /**
     * 绘制折线
     * @param {ol.Map} map - 地图对象
     * @param {Array<number>} startLonLat - [lon, lat] 起点经纬度
     * @param {Array<number>} endLonLat   - [lon, lat] 终点经纬度
     */
    function drawPolyline(map, startLonLat, endLonLat) {
        const start3857 = ol.proj.fromLonLat(startLonLat);
        const end3857   = ol.proj.fromLonLat(endLonLat);

        const lineString = new ol.geom.LineString([start3857, end3857]);
        const feature = new ol.Feature({ geometry: lineString });

        // 计算两点球面距离（米）
        const distance = calculateDistance(start3857, end3857).toFixed(2);

        const style = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#ffffff',
                width: 2,
            }),
            text: new ol.style.Text({
                text: `${distance}米`,
                font: '16px Arial',
                textAlign: 'center',
                textBaseline: 'middle',
                placement: 'line',
                offsetY: -15,
                fill: new ol.style.Fill({ color: '#ffffff' }),
                stroke: new ol.style.Stroke({ color: '#000000', width: 2 }),
            })
        });

        feature.setStyle(style);

        const layer = new ol.layer.Vector({
            source: new ol.source.Vector({ features: [feature] }),
            zIndex: 99,
        });

        polylines.push(layer);
        map.addLayer(layer);
    }

    /**
     * 计算两点之间的球面距离（米）
     * @param {Array<number>} start3857 - EPSG:3857 坐标
     * @param {Array<number>} end3857   - EPSG:3857 坐标
     * @returns {number} 距离（米）
     */
    function calculateDistance(start3857, end3857) {
        const startLonLat = ol.proj.toLonLat(start3857);
        const endLonLat   = ol.proj.toLonLat(end3857);
        return ol.sphere.getDistance(startLonLat, endLonLat);
    }

    /**
     * 移除最后一条折线
     * @param {ol.Map} map
     */
    function removePolyline(map) {
        if (polylines.length > 0) {
            const last = polylines.pop();
            map.removeLayer(last);
        }
    }

    /**
     * 移除所有折线
     * @param {ol.Map} map
     */
    function removeAllPolylines(map) {
        polylines.forEach(layer => map.removeLayer(layer));
        polylines = [];
    }

    /**
     * 绘制导航折线
     * @param {ol.Map} map - 地图对象
     * @param {Array<number>} startLonLat - [lon, lat] 起点经纬度
     * @param {Array<number>} endLonLat   - [lon, lat] 终点经纬度
     */
    function drawFindNavigationPolyline(map, startLonLat, endLonLat) {
        if(polylines.length > 0) {
            removePolyline(map)
        }
        drawPolyline(map, startLonLat, endLonLat)
        WebBridge.postMessage(
            JSON.stringify({
                type: "WEBVIEW_NAVIGATION_POLYLINE_COMPLETE",
            }),
        );
    }

    /**
     * 更新导航折线
     * @param {ol.Map} map - 地图对象
     * @param {Array<number>} startLonLat - [lon, lat] 起点经纬度
     * @param {Array<number>} endLonLat   - [lon, lat] 终点经纬度
     */
    function updateFindNavigationPolyline(map, startLonLat, endLonLat) {
        removePolyline(map)
        drawFindNavigationPolyline(map, startLonLat, endLonLat)
    }
    /**
     * 移除导航折线
     * @param {ol.Map} map - 地图对象
     */
    function removeFindNavigationPolyline(map) {
        removePolyline(map)
    }

    /**
     * 绘制巡田轨迹折线
     * @param {ol.Map} map - 地图对象
     * @param {Array} data - 轨迹数据数组，[{lng: 经度, lat: 纬度}, ...]
     */
    function drawPatrolLocusPolyline(map, data) {
        if (!data || data.length === 0) {
            WebBridge.postError('无效的巡田轨迹数据')
            return
        }
        if(locusLineLayer) {
           map.removeLayer(locusLineLayer)
           locusLineLayer = null
        }
        // 经纬度转地图投影坐标 EPSG:3857
        let locusPath = []
        data.forEach(item => {
            locusPath.push(ol.proj.fromLonLat([item.lng, item.lat]))
        })
        const lineString = new ol.geom.LineString(locusPath)
        const feature = new ol.Feature({ geometry: lineString });
        // 轨迹样式
        const style = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#08D55C',
                width: 1.4,
                lineCap: 'round',
                lineJoin: 'round',
            }),
        });
        feature.setStyle(style);
        // 创建矢量图层并添加到地图
        const layer = new ol.layer.Vector({
            source: new ol.source.Vector({ features: [feature] }),
            zIndex: 101,
        });
        locusLineLayer = layer
        map.addLayer(layer);
    }

    /**
     * 更新巡田轨迹折线
     * @param {ol.Map} map - 地图对象
     * @param {Array} data - 最新轨迹数据数组，[{lng: 经度, lat: 纬度}, ...]
     */
    function updatePatrolLocusPolyline(map, data) {
        // 入参校验 和绘制函数保持一致
        if (!data || data.length === 0) {
            WebBridge.postError('无效的巡田轨迹更新数据')
            return
        }
        // 先移除旧轨迹，再重新绘制新轨迹
        if(locusLineLayer) {
            map.removeLayer(locusLineLayer)
        }
        drawPatrolLocusPolyline(map, data)
    }

    /**
     * 移除巡田轨迹折线
     * @param {ol.Map} map - 地图对象
     */
    function removePatrolLocusPolyline(map) {
        if(locusLineLayer) {
            map.removeLayer(locusLineLayer)
            locusLineLayer = null
        }
    }
    
    return {
        drawPolyline,
        removePolyline,
        removeAllPolylines,
        drawFindNavigationPolyline,
        updateFindNavigationPolyline,
        removeFindNavigationPolyline,
        drawPatrolLocusPolyline,
        updatePatrolLocusPolyline,
        removePatrolLocusPolyline 
    };
})();