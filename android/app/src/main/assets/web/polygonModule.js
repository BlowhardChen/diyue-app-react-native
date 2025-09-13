// 多边形模块
window.PolygonModule = (function () {
    let polygonLayer = null;   // 当前多边形图层
    let polygonFeature = null; // 当前多边形 Feature
    let polygonArea = 0;       // 当前多边形面积（亩）
    let polygonFeatureList = []; // 多边形 Feature 列表
    let currentActivePolygon = null; // 当前激活的多边形
    let lineFeatures = []; // 存储边长标注Feature
    let commonPointMarkers = []; // 公共点标记列表


    /**
     * 计算面积（亩）
     * @param {Array<Array<number>>} coordsLonLat - 未闭合的 [ [lon,lat], ... ]
     * @returns {number} 亩
     */
    function computeAreaMu(coordsLonLat) {
        if (!Array.isArray(coordsLonLat) || coordsLonLat.length < 3) return 0;
        const closed = [...coordsLonLat, coordsLonLat[0]];
        const turfPolygon = turf.polygon([closed]); // GeoJSON 多边形
        const areaM2 = Math.abs(turf.area(turfPolygon)); // 取绝对值，避免自相交导致负面积
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
            WebBridge.postError("多边形坐标无效");
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

        // 边长标注：显式指定投影，避免单位误差
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

    /**
     * 获取当前多边形面积
     * @returns {number} 面积（亩）
     */
    function getCurrentPolygonArea() {
        return polygonArea;
    }

    /**
     * 绘制地块多边型
     */
    function drawLandPolygon(map,data) {
        WebBridge.postMessage(JSON.stringify({
            type: "WEBVIEW_CONSOLE_LOG",
            data:data
        }))
        if (!data || !Array.isArray(data.gpsList) || data.gpsList.length < 3) {
            WebBridge.postError(`无效的地块数据: ${JSON.stringify(data)}`);
            return null;
        }

        // 将坐标转换为OpenLayers可以接受的格式
        let path3857
        path3857 = data.gpsList.map((item) => {
            return ol.proj.transform([item.lng,item.lat], 'EPSG:4326', 'EPSG:3857')
        })

        // 创建多边形几何对象
        let polygon = new ol.geom.Polygon([path3857])

        // 创建特性并添加到源
        let landPolygonFeature = new ol.Feature({
            geometry: polygon,
            id: data.id,
            checked: data.checked,
            landType: data.landType,
        })

        const textMsg = `${data.landName}\n${data.actualAcreNum}亩`

        // 设置文本样式换行显示
        landPolygonFeature.setStyle(function () {
        let offsetY = 0
        const textLines = textMsg.split('\n')
            return textLines.map((line) => {
                offsetY += 16
                    return new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: '#A1FF83',
                            width: 2,
                        }),
                        fill: new ol.style.Fill({
                            color: 'rgba(161, 255, 131, 0.1)',
                        }),
                        text: new ol.style.Text({
                                text: line,
                                font: '16px Arial',
                                offsetY: offsetY,
                                fill: new ol.style.Fill({ color: '#fff' }),
                                stroke: new ol.style.Stroke({
                                color: '#000',
                                width: 2,
                            }),
                        }),
                })
            })
        })

        // 设置地块样式
        landPolygonFeature.setStyle(
           new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: data.landType === '1' ? '#A1FF83' : '#5BF3FF',
                    width: 2,
                }),
                fill: new ol.style.Fill({
                    color: data.landType === '1' ? 'rgba(161, 255, 131, 0.1)' : 'rgba(91, 243, 255, 0.2)',
                }),
                text: new ol.style.Text({
                    text: textMsg, // 这里是你想要显示的文本
                    font: '16px Arial',
                    fill: new ol.style.Fill({ color: '#fff' }),
                    stroke: new ol.style.Stroke({
                        color: '#000',
                        width: 2,
                    }),
                }),
            })
        )

        // 创建多边形向量图层并添加到地图
        let polygonVectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [landPolygonFeature],
            }),
            zIndex: 99,
        })

        map.addLayer(polygonVectorLayer)
        polygonFeatureList.push({
            layer: polygonVectorLayer,
            feature: landPolygonFeature,
        })
        return { layer: polygonVectorLayer, feature: landPolygonFeature }
    }

    /**
     * 绘制地块多边形列表
     */
    function drawLandPolygonList(map,data) {
        if (data.length) {
            data.forEach(item => {
                drawLandPolygon(map,item)
            })
        }
    }

    /**
     * 移除地块多边形
     * @param {ol.Map} map
     */
    function removeLandPolygon(map) {
        if (polygonFeatureList.length) {
            polygonFeatureList.forEach((item) => {
                map.removeLayer(item.layer)
            })
            polygonFeatureList = []
        }
    }

    /**
     * 初始化多边形点击事件（显示公共点）
     * @param {ol.Map} map 地图实例
     */
    function initPolygonClickEvent(map) {
        map.on('click', (event) => {
            let clickedMarker = false;

            // 检查是否点击了公共点标记
            commonPointMarkers.forEach(marker => {
                if (map.hasFeatureAtPixel(event.pixel, { feature: marker.feature })) {
                    handleCommonPointClick(marker.feature);
                    clickedMarker = true;
                }
            });

            if (clickedMarker) return;

            // 处理多边形点击
            map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
                // 判断是否为多边形Feature（排除线和其他类型）
                if (feature.getGeometry() instanceof ol.geom.Polygon) {
                    // 重置之前激活的多边形
                    resetActivePolygon();
                    
                    // 激活当前点击的多边形
                    currentActivePolygon = { feature, layer };
                    highlightPolygon(feature);
                    showPolygonEdges(feature, layer);
                    showCommonPoints(feature, map);
                    
                    // 发送事件到RN
                    WebBridge.postMessage({
                        type: 'POLYGON_CLICKED',
                        data: {
                            id: feature.get('id'),
                            message: '请点击白点作为要借用的点位'
                        }
                    });
                    return true; // 停止事件传播
                }
            });
        });
    }

    /**
     * 显示多边形公共点（顶点）
     * @param {ol.Feature} feature 多边形要素
     * @param {ol.Map} map 地图实例
     */
    function showCommonPoints(feature, map) {
        const coordinates = feature.getGeometry().getCoordinates()[0];
        const source = new ol.source.Vector();
        const layer = new ol.layer.Vector({ source, zIndex: 100 });
        map.addLayer(layer);

        coordinates.forEach(coord => {
            // 跳过最后一个点（与第一个点重复的闭合点）
            if (coordinates.indexOf(coord) === coordinates.length - 1) return;
            
            const pointFeature = new ol.Feature({
                geometry: new ol.geom.Point(coord)
            });
            
            pointFeature.setStyle(new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 6,
                    fill: new ol.style.Fill({ color: '#FFFFFF' }),
                    stroke: new ol.style.Stroke({ color: '#000000', width: 2 })
                })
            }));
            
            source.addFeature(pointFeature);
            commonPointMarkers.push({
                feature: pointFeature,
                layer: layer
            });
        });
    }

    /**
     * 处理公共点点击事件
     * @param {ol.Feature} pointFeature 点要素
     */
    function handleCommonPointClick(pointFeature) {
        const coord3857 = pointFeature.getGeometry().getCoordinates();
        const coord4326 = ol.proj.transform(coord3857, 'EPSG:3857', 'EPSG:4326');
        
        // 发送公共点坐标到RN
        WebBridge.postMessage({
            type: 'COMMON_POINT_CLICKED',
            data: {
                lng: coord4326[0].toFixed(8),
                lat: coord4326[1].toFixed(8),
                message: '借点成功，继续添加下一个点位'
            }
        });
    }

    /**
     * 重置激活的多边形样式
     */
    function resetActivePolygon() {
        if (!currentActivePolygon) return;
        
        const { feature, layer } = currentActivePolygon;
        
        // 恢复原始样式
        if (feature.get('originalStyle')) {
            feature.setStyle(feature.get('originalStyle'));
        }
        
        // 移除边长标注
        lineFeatures.forEach(line => {
            layer.getSource().removeFeature(line);
        });
        lineFeatures = [];
        
        // 移除公共点标记
        commonPointMarkers.forEach(marker => {
            marker.layer.getSource().removeFeature(marker.feature);
        });
        commonPointMarkers = [];
        
        currentActivePolygon = null;
    }

    return {
        drawPolygon,
        removeLandPolygon,
        getCurrentPolygonArea,
        drawLandPolygon,
        drawLandPolygonList,
        initPolygonClickEvent,
        resetActivePolygon
    };
})();
