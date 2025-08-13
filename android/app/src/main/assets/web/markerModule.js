// 标记点模块
window.MarkerModule = (function () {
    let selfMarkerLayer;                 // 当前设备点位图层
    let dotMarkers = [];                 // 地图打点图层数组
    let dotMarkerCoordinates = [];       // 打点经纬度数组（[{lon,lat}, ...]）

    /**
     * 绘制地图打点（核心）
     * @param {ol.Map} map
     * @param {{lon:number, lat:number}} location
     */
    function drawDotMarker(map, location) {
        // 1) 重复点过滤（0.3m 内算重复）
        if (!filterPointDot(location, dotMarkerCoordinates)) {
            safePost({ type: 'WEBVIEW_DOT_REPEAT' });
            return;
        }

        // 2) 存储 & 绘制点
        dotMarkerCoordinates.push(location);

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

        const feature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([location.lon, location.lat]))
        });
        feature.setStyle(markerIcon);

        const layer = new ol.layer.Vector({
            source: new ol.source.Vector({ features: [feature] }),
            zIndex: 110
        });

        dotMarkers.push(layer);
        map.addLayer(layer);

        // 3) 线段 / 多边形 联动
        handlePolylineAndPolygon(map);
        // 同步数量
        safePost({ type: 'WEBVIEW_UPDATE_DOT_TOTAL', total: dotMarkerCoordinates.length });
    }

    /**
     * 根据当前点数联动折线与多边形
     * @param {ol.Map} map
     */
    function handlePolylineAndPolygon(map) {
        const total = dotMarkerCoordinates.length;
        const coordsLonLat = dotMarkerCoordinates.map(d => [d.lon, d.lat]);

        if (total === 0) {
            window.PolylineModule.removeAllPolylines(map);
            window.PolygonModule.removePolygon(map);
            safePost({ type: 'WEBVIEW_DOT_SUCCESS', message: '请点击打点按钮打点或点击十字光标标点' });
            return;
        }

        if (total === 1) {
            window.PolylineModule.removeAllPolylines(map);
            window.PolygonModule.removePolygon(map);
            safePost({ type: 'WEBVIEW_DOT_SUCCESS', message: '请继续添加下一个点位' });
            return;
        }

        if (total === 2) {
            // 两点：清除多边形，仅绘制折线（且只有一条）
            window.PolygonModule.removePolygon(map);
            window.PolylineModule.removeAllPolylines(map);

            const start = coordsLonLat[0];
            const end   = coordsLonLat[1];
            window.PolylineModule.drawPolyline(map, start, end);

            safePost({ type: 'WEBVIEW_DOT_SUCCESS', message: '已生成线段，请继续添加下一个点位' });
            return;
        }

        // 3 个及以上：清除折线，绘制多边形（自动闭合）
        window.PolylineModule.removeAllPolylines(map);
        window.PolygonModule.removePolygon(map);

        const polygonResult = window.PolygonModule.drawPolygon(map, coordsLonLat);
        if (polygonResult) {
            safePost({
                type: 'WEBVIEW_DOT_SUCCESS',
                message: `已形成闭合区域地块，面积: ${polygonResult.area}亩，是否保存`,
                area: polygonResult.area
            });
        }
    }

    /**
     * 撤销最后一个打点
     * @param {ol.Map} map
     */
    function removeDotMarker(map) {
        if (dotMarkers.length === 0) return;

        // 移除最后一个点要素图层
        const lastLayer = dotMarkers.pop();
        map.removeLayer(lastLayer);

        // 同步经纬度数组
        dotMarkerCoordinates.pop();

        // 重新联动
        handlePolylineAndPolygon(map);

        // 数量通知
        safePost({ type: 'WEBVIEW_UPDATE_DOT_TOTAL', total: dotMarkerCoordinates.length });
    }

    /**
     * 移除所有打点
     * @param {ol.Map} map
     */
    function removeAllDotMarkers(map) {
        dotMarkers.forEach(layer => map.removeLayer(layer));
        dotMarkers = [];
        dotMarkerCoordinates = [];

        window.PolylineModule.removeAllPolylines(map);
        window.PolygonModule.removePolygon(map);

        safePost({ type: 'WEBVIEW_UPDATE_DOT_TOTAL', total: 0 });
        safePost({ type: 'WEBVIEW_DOT_SUCCESS', message: '请点击打点按钮打点或点击十字光标标点' });
    }

    /**
     * 过滤重复点（0.3m 内为重复）
     */
    function filterPointDot(location, list) {
        if (list.length === 0) return true;
        const newPoint = turf.point([location.lon, location.lat]);
        for (const dot of list) {
            const p = turf.point([dot.lon, dot.lat]);
            const d = turf.distance(newPoint, p, { units: 'meters' });
            if (d < 0.3) return false;
        }
        return true;
    }

    // —— 定位与朝向（保持原有接口不变） ——
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

        const feature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([location.lon, location.lat]))
        });
        feature.setStyle(markerIcon);

        selfMarkerLayer = new ol.layer.Vector({
            source: new ol.source.Vector({ features: [feature] }),
            zIndex: 101
        });

        map.addLayer(selfMarkerLayer);
    }

    function updateCurrentLocation(location, map) {
        const features = selfMarkerLayer?.getSource()?.getFeatures();
        if (!features || features.length === 0) {
            safePost("⚠️ selfMarkerFeature 不存在，自动绘制");
            drawCurrentLocation(map, location);
            return;
        }
        const geom = features[0].getGeometry();
        geom.setCoordinates(ol.proj.fromLonLat([location.lon, location.lat]));
        map.renderSync();
    }

    function transformMarkerCoordinate(map, fromType, toType) {
        const features = selfMarkerLayer?.getSource()?.getFeatures();
        if (!features || features.length === 0) return;
        const current = features[0].getGeometry().getCoordinates();
        let [lon, lat] = ol.proj.toLonLat(current);
        if (fromType === "WGS84" && toType === "GCJ02") {
            [lon, lat] = TransformModule.wgs84ToGcj02(lon, lat);
        } else if (fromType === "GCJ02" && toType === "WGS84") {
            [lon, lat] = TransformModule.gcj02ToWgs84(lon, lat);
        }
        features[0].getGeometry().setCoordinates(ol.proj.fromLonLat([lon, lat]));
    }

    function updateMarkerRotation(map, degrees) {
        const features = selfMarkerLayer?.getSource()?.getFeatures();
        if (!features || features.length === 0) return;

        const radians = degrees * (Math.PI / 180);
        const style = new ol.style.Style({
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

        features[0].setStyle(style);
        if (map && typeof map.render === 'function') map.render();
    }

    /** 安全发消息到 RN（存在性判断） */
    function safePost(payload) {
        if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
            if (typeof payload === 'string') {
                window.ReactNativeWebView.postMessage(payload);
            } else {
                window.ReactNativeWebView.postMessage(JSON.stringify(payload));
            }
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
