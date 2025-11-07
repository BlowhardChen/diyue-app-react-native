
// 多边形模块
window.PolygonModule = (function () {
    let polygonLayer = null;   // 当前多边形图层
    let polygonFeature = null; // 当前多边形 Feature
    let polygonArea = 0;       // 当前多边形面积（亩）
    let polygonFeatureList = []; // 多边形 Feature 列表
    let currentDrawPolygons = []; // 保存当前绘制多边形
    let lineFeatureList = []; // 边长文本Feature列表


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

        map.addLayer(polygonLayer);
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
            checked: data.checked ? data.checked : false,
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
            removeLandPolygon(map)
            data.forEach(item => {
                drawLandPolygon(map,item)
            })
            polygonAndPointClickEvent(map)
        }
    }

    /**
     * 获取圈地多边形
     */
    function getPolygon() {
        return {
            layer: polygonLayer,
            feature: polygonFeature,
            area: polygonArea,
        }
    }

    /**
     * 移除地块多边形
     */
    function removePolygon(map) {
        if (polygonLayer) {
            map.removeLayer(polygonLayer)
            polygonLayer = null
            polygonFeature = null
            polygonArea = 0
        }
    }
    
    /**
     * 移除指定地块多边形
     * @param {ol.Map} map
     * @param {LandDetailInfo} data
     */
    function removeSpecifyLand(map,data) {
        if (polygonFeatureList.length) {
            polygonFeatureList.forEach((item) => {
                if (item.feature.values_.id === data.id) {
                    map.removeLayer(item.layer)
                    polygonFeatureList = polygonFeatureList.filter(f => f.feature.values_.id !== data.id)
                }
            })
        }
    }

    /**
     * 移除所有地块多边形
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
     * 重置激活的多边形样式
     */
    function resetActivePolygon() {
        if (lineFeatureList.length) {
            lineFeatureList.forEach(f => polygonLayer.getSource().removeFeature(f))
            lineFeatureList = []
        }
        if (polygonFeature) {
            polygonFeature.setStyle(
                new ol.style.Style({
                   stroke: new ol.style.Stroke({
                        color:polygonFeature.values_.landType === '1'? '#A1FF83' : polygonFeature.values_.landType === '2'?'#5BF3FF':'#ffffff',
                        width: 2,
                    }),
                    fill: new ol.style.Fill({
                        color: polygonFeature.values_.landType === '1'? 'rgba(161, 255, 131, 0.1)' : polygonFeature.values_.landType === '2'?'rgba(91, 243, 255, 0.2)':'rgba(0, 0, 0, 0.3)',
                    }),
                    text: new ol.style.Text({
                        text: polygonFeature.getStyle().getText().text_,
                        font: '16px Arial',
                        fill: new ol.style.Fill({ color: '#fff' }),
                        stroke: new ol.style.Stroke({color: '#000',width: 2}),
                    }),
               })
            )
            MarkerModule.removeCommonPointMarker()
       }
    }

    
    // 继续圈地时仅清除当前多边形，保留已经绘制的多边形
    function clearCurrentPolygon(map) {
        currentDrawPolygons.push(polygonLayer);
        map.removeLayer(polygonLayer);
        polygonLayer = null;
        polygonFeature = null;
        polygonArea = 0;
        currentDrawPolygons.forEach(polygon => {map.addLayer(polygon)});
    }

    // 多边形和公共点点击事件
    function polygonAndPointClickEvent(map) {
        map.on('click', (event) => {
            let clickedMarker = false
            const commonPointMarkers = MarkerModule.getCommonPointMarkers()
            map.forEachFeatureAtPixel(event.pixel, (feature) => {
                // 判断点击的是不是标注点
                if (commonPointMarkers.some((marker) => marker.feature === feature)) {
                    const clickedCoordinate = feature.getGeometry().getCoordinates()
                    const wgsCoordinate = ol.proj.transform(clickedCoordinate, 'EPSG:3857', 'EPSG:4326')
                    clickedMarker = true
                    WebBridge.postMessage({
                        type: 'WEBVIEW_CONSOLE_LOG',
                        data: '点击了公共点',
                    })
                    // 处理标注点的点击事件
                    WebBridge.postMessage({
                        type: 'WEBVIEW_BORROW_DOT',
                        point: {
                            lon: wgsCoordinate[0].toFixed(8),
                            lat: wgsCoordinate[1].toFixed(8),
                        }
                    })
                    MarkerModule.removeCommonPointMarker()
                    event.stopPropagation() // 阻止事件传播
                    return  // 立即返回，阻止执行多边形的点击事件
                }
            })
            if (!clickedMarker) {
                map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
                    if (polygonFeature) {
                        resetActivePolygon()
                        polygonFeature = null
                    } else {
                        polygonFeature = feature
                        polygonLayer = layer
                        feature.setStyle(
                            new ol.style.Style({
                                stroke: new ol.style.Stroke({color: '#FFFF00',width: 2}),
                                fill: new ol.style.Fill({color: 'rgba(161, 255, 131, 0.1)'}),
                                text: new ol.style.Text({
                                    text: feature.getStyle().getText().text_, // 这里是你想要显示的文本
                                    font: '16px Arial',
                                    fill: new ol.style.Fill({ color: '#FFFF00' }),
                                    stroke: new ol.style.Stroke({color: '#000',width: 2}),
                                })
                            })
                        )
                        // 获取多边形的几何对象
                        let polygonGeometry = feature.getGeometry()
                        // 获取多边形的坐标集合
                        let coordinates = polygonGeometry.getCoordinates()[0]
                        // 计算每条边的长度并显示
                        for (let i = 0; i < coordinates.length - 1; i++){
                            let start = coordinates[i]
                            // 使用模运算来获取下一个点，当i为最后一个索引时，会返回第一个点
                            let end = coordinates[(i + 1) % coordinates.length] 
                            // 创建线段几何对象
                            let line = new ol.geom.LineString([start, end])
                            // 计算线段长度
                            let length = ol.sphere.getLength(line)
                            // 创建特性并设置样式
                            let lineFeature = new ol.Feature({ geometry: line })
                            lineFeature.setStyle(
                                new ol.style.Style({
                                    text: new ol.style.Text({
                                        text: length.toFixed(2) + ' m',
                                        font: '16px Arial',
                                        textAlign: 'center',
                                        textBaseline: 'middle',
                                        placement: 'line',
                                        offsetY: -15,
                                        fill: new ol.style.Fill({ color: '#FFFF00' }),
                                        stroke: new ol.style.Stroke({ color: '#000000', width: 2 }),
                                    }),
                                })
                            )
                            lineFeatureList.push(lineFeature)
                                // 将边长文本特性添加到图层
                                layer.getSource().addFeature(lineFeature)
                        }
                        // 获取多边形的边界框
                        let polygonExtent = feature.getGeometry().getExtent()
                        // 计算多边形中心点
                        let polygonCenter = ol.extent.getCenter(polygonExtent)
                        // 设置地图视图中心点和缩放级别
                        map.getView().setCenter(polygonCenter)
                        map.getView().setZoom(18)
                        WebBridge.postMessage({
                            type: 'WEBVIEW_CONSOLE_LOG',
                            data: '点击了地块',
                        })
                        // 处理多边型点击事件
                        WebBridge.postMessage({
                            type: 'POLYGON_CLICK',
                            id:feature.values_.id
                        })
                    }
                   
                })
            }
        })
    }

    // 绘制地块详情
    function drawLandDetailPolygon(map, data) {
        WebBridge.postMessage({
            type: 'WEBVIEW_CONSOLE_LOG',
            data,
        })
        let coordsLonLat = data.list  ?data.list : []
        if (!map || !Array.isArray(coordsLonLat) || coordsLonLat.length < 3) {
            WebBridge.postError("多边形坐标无效");
            return null;
        }
        // 将坐标转换为OpenLayers可以接受的格式
        let path3857
        path3857 = coordsLonLat.map((item) => {
            return ol.proj.transform([item.lng,item.lat], 'EPSG:4326', 'EPSG:3857')
        })

        // 创建多边形几何对象
        let polygon = new ol.geom.Polygon([path3857])

        // 创建特性并添加到源
        polygonFeature = new ol.Feature({
            geometry: polygon,
            id: data.id,
            landType: data.landType,
        })

        const textMsg = `${data.landName}\n${data.actualAcreNum}亩`

        // 设置文本样式换行显示
        polygonFeature.setStyle(function () {
        let offsetY = 0
        const textLines = textMsg.split('\n')
            return textLines.map((line) => {
                offsetY += 16
                    return new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: '#000000',
                            width: 2,
                        }),
                        fill: new ol.style.Fill({
                            color: 'rgba(161, 255, 131, 0.1)',
                        }),
                        text: new ol.style.Text({
                                text: line,
                                font: '16px Arial',
                                offsetY: offsetY,
                                fill: new ol.style.Fill({ color: '#FFFF00' }),
                                stroke: new ol.style.Stroke({
                                color: '#000',
                                width: 2,
                            }),
                        }),
                })
            })
        })

        // 设置地块样式
        polygonFeature.setStyle(
           new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#FFFF00',
                    width: 2,
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(161, 255, 131, 0.1)',
                }),
                text: new ol.style.Text({
                    text: textMsg, // 这里是你想要显示的文本
                    font: '16px Arial',
                    fill: new ol.style.Fill({ color: '#FFFF00' }),
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
                features: [polygonFeature],
            }),
            zIndex: 99,
        })

        map.addLayer(polygonVectorLayer)
        // 获取多边形的边界框
        let polygonExtent = polygonFeature.getGeometry().getExtent()
        // 计算多边形中心点
        let polygonCenter = ol.extent.getCenter(polygonExtent)
        // 设置地图视图中心点和缩放级别
        map.getView().setCenter(polygonCenter)
        map.getView().setZoom(18)
        polygonAndPointClickEvent(map)
    }

    return {
        drawPolygon,
        getPolygon,
        removePolygon,
        removeSpecifyLand,
        removeLandPolygon,
        getCurrentPolygonArea,
        drawLandPolygon,
        drawLandPolygonList,
        resetActivePolygon,
        clearCurrentPolygon,
        drawLandDetailPolygon
    };
})();
