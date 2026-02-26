// 多边形模块
window.PolygonModule = (function () {
    let polygonLayer = null;   // 当前多边形图层
    let polygonFeature = null; // 当前多边形 Feature
    let polygonArea = 0;       // 当前多边形面积（亩）
    let polygonFeatureList = []; // 多边形 Feature 列表
    let lineFeatureList = []; // 边长文本Feature列表
    let mergedPolygonFeature = null; // 合并后的多边形 Feature
    let mergePolygonLayer = null; // 合并后的多边形图层
    let enclosurePolygonFeature = null; // 当前圈地多边形 Feature
    let enclosurePolygonLayer = null; // 当前圈地多边形图层

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
     * 绘制圈地多边形（传入未闭合经纬度坐标）
     * @param {ol.Map} map
     * @param {Array<Array<number>>} coordsLonLat - [ [lon,lat], ... ] 未闭合
     * @returns {{ layer: ol.layer.Vector, feature: ol.Feature, area: number }|null}
     */
    function drawEnclosurePolygon(map, coordsLonLat) {
        if (!map || !Array.isArray(coordsLonLat) || coordsLonLat.length < 3) {
            WebBridge.postError("圈地多边形坐标无效");
            return null;
        }   

        // 投影到 3857（不闭合）
        const path3857 = coordsLonLat.map(ll => ol.proj.transform(ll, 'EPSG:4326', 'EPSG:3857'));
        // OpenLayers 多边形需要闭合
        const closed3857 = [...path3857, path3857[0]];

        const polygon = new ol.geom.Polygon([closed3857]);
        polygonArea = computeAreaMu(coordsLonLat);

        enclosurePolygonFeature = new ol.Feature({ geometry: polygon });

        // 样式（面 + 面积标注）
        enclosurePolygonFeature.setStyle(
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

        enclosurePolygonLayer = new ol.layer.Vector({
            source: new ol.source.Vector({ features: [enclosurePolygonFeature] }),
            zIndex: 99,
        });

        // 边长标注：显式指定投影，避免单位误差
        for (let i = 0; i < closed3857.length - 1; i++) {
            const start = closed3857[i];
            const end = closed3857[i + 1];
            const line = new ol.geom.LineString([start, end]);

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

            enclosurePolygonLayer.getSource().addFeature(lineFeature);
        }

        map.addLayer(enclosurePolygonLayer);
        return { layer: enclosurePolygonLayer, feature: enclosurePolygonFeature, area: polygonArea };
    }

    /**
     * 获取当前多边形面积
     * @returns {number} 面积（亩）
     */
    function getCurrentPolygonArea() {
        return polygonArea;
    }

    /**
     * 移除圈地多边形
     */
    function removeEnclosurePolygon(map) {
        if (enclosurePolygonLayer) {
            map.removeLayer(enclosurePolygonLayer);
            enclosurePolygonLayer = null;
            enclosurePolygonFeature = null;
        }
    }

    /**
     * 绘制地块多边型
     */
    function drawLandPolygon(map, data) {
        if (!data || !Array.isArray(data.gpsList) || data.gpsList.length < 3) {
            return null;
        }
        // 提取是否选中的状态（React Native端传递的isSelect属性）
        const isSelect = !!data.isSelect;

        // 将坐标转换为OpenLayers可以接受的格式
        let path3857 = data.gpsList.map((item) => {
            return ol.proj.transform([item.lng, item.lat], 'EPSG:4326', 'EPSG:3857')
        });

        // 创建多边形几何对象（自动闭合，OpenLayers要求）
        const closedPath3857 = [...path3857, path3857[0]];
        let polygon = new ol.geom.Polygon([closedPath3857]);

        // 创建特性并添加到源（保留原有属性，新增isSelect记录状态）
        let landPolygonFeature = new ol.Feature({
            geometry: polygon,
            id: data.id,
            checked: data.checked ? data.checked : false,
            landType: data.landType,
            landName: data.landName,
            actualAcreNum: data.actualAcreNum,
            isSelect: isSelect // 存入Feature，方便后续判断
        });

        const textMsg = `${data.landName}\n${data.actualAcreNum}亩`;
        // 基础颜色（根据地块类型）
        const landTypeColor1 = '#A1FF83'; // 流转地块
        const landTypeColor2 = '#5BF3FF'; // 托管地块
        const activeColor = '#FFFF00';    // 选中激活色（黄色）

        // 设置地块样式：区分选中/未选中
        landPolygonFeature.setStyle(
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: isSelect ? activeColor : (data.landType === '1' ? landTypeColor1 : landTypeColor2),
                    width: 2,
                }),
                fill: new ol.style.Fill({
                    color: isSelect 
                        ? 'rgba(161, 255, 131, 0.1)' // 选中时的填充色（与点击后一致）
                        : (data.landType === '1' ? 'rgba(161, 255, 131, 0.1)' : 'rgba(91, 243, 255, 0.2)'),
                }),
                text: new ol.style.Text({
                    text: textMsg,
                    font: '16px Arial',
                    fill: new ol.style.Fill({ color: isSelect ? activeColor : '#fff' }),
                    stroke: new ol.style.Stroke({
                        color: '#000',
                        width: 2,
                    }),
                }),
            })
        );

        // 创建多边形向量图层并添加到地图
        let polygonVectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [landPolygonFeature],
            }),
            zIndex: 99,
        });

        // 选中状态时，自动绘制黄色边长标注
        if (isSelect) {
            // 遍历多边形边，计算并添加边长标注
            for (let i = 0; i < closedPath3857.length - 1; i++) {
                let start = closedPath3857[i];
                let end = closedPath3857[i + 1];
                let line = new ol.geom.LineString([start, end]);
                // 计算球面长度
                let length = ol.sphere.getLength(line, { projection: 'EPSG:3857' });
                let lineFeature = new ol.Feature({ geometry: line });
                
                lineFeature.setStyle(
                    new ol.style.Style({
                        text: new ol.style.Text({
                            text: length.toFixed(2) + ' m',
                            font: '16px Arial',
                            textAlign: 'center',
                            textBaseline: 'middle',
                            placement: 'line',
                            offsetY: -15,
                            fill: new ol.style.Fill({ color: activeColor }), // 黄色标注
                            stroke: new ol.style.Stroke({ color: '#000000', width: 2 }),
                        }),
                    })
                );
                // 加入边长Feature列表
                lineFeatureList.push(lineFeature);
                polygonVectorLayer.getSource().addFeature(lineFeature);
            }
        }

        map.addLayer(polygonVectorLayer);
        polygonFeatureList.push({
            layer: polygonVectorLayer,
            feature: landPolygonFeature,
        });
        return { layer: polygonVectorLayer, feature: landPolygonFeature };
    }

    /**
     * 绘制地块多边形列表(已圈地地块数据，首页，圈地，退地页面等)
     * @param {ol.Map} map
     * @param {LandDetailInfo[]} data
     */
    function drawLandPolygonList(map, data) {
        if (data && data.length > 0) {
            removeLandPolygon(map);
            data.forEach(item => {
                drawLandPolygon(map, item);
            });
            polygonAndPointClickEvent(map);
        }
    }


    /**
     * 移除地块多边形
     */
    function removePolygon(map) {
        if (polygonLayer) {
            map.removeLayer(polygonLayer);
            polygonLayer = null;
            polygonFeature = null;
            polygonArea = 0;
        }
    }

    /**
     * 移除指定地块多边形
     * @param {ol.Map} map
     * @param {LandDetailInfo} data
     */
    function removeSpecifyLand(map, data) {
        if (polygonFeatureList.length) {
            const index = polygonFeatureList.findIndex(item => item.feature.values_.id === data.id);
            if (index !== -1) {
                map.removeLayer(polygonFeatureList[index].layer);
                polygonFeatureList.splice(index, 1);
            }
        }
    }

    /**
     * 移除所有地块多边形
     * @param {ol.Map} map
     */
    function removeLandPolygon(map) {
        clearAllSideLengthFeatures()
        polygonFeature = null;
        if (polygonFeatureList.length) {
            polygonFeatureList.forEach((item) => {
                map.removeLayer(item.layer);
            });
            polygonFeatureList = [];
        }
    }

    /**
     * 清除指定图层上的所有边长标注Feature
     * @param {ol.layer.Vector} layer - 要清除的图层
     */
    function clearSideLengthFeatures(layer) {
        if (layer && lineFeatureList.length > 0) {
            lineFeatureList.forEach(f => {
                if (layer.getSource().getFeatures().includes(f)) {
                    layer.getSource().removeFeature(f);
                }
            });
            // 过滤掉已移除的feature，避免内存泄漏
            lineFeatureList = lineFeatureList.filter(f => !layer.getSource().getFeatures().includes(f));
        }
    }

    /**
     * 清除所有图层上的所有边长标注Feature
     */
    function clearAllSideLengthFeatures() {
        if (lineFeatureList.length > 0) {
            polygonFeatureList.forEach(({ layer }) => {
                lineFeatureList.forEach(f => {
                    if (layer.getSource().getFeatures().includes(f)) {
                        layer.getSource().removeFeature(f);
                    }
                });
            });
            lineFeatureList = [];
        }
    }

    /**
     * 重置激活的多边形样式
     */
    function resetActivePolygon() {
        clearAllSideLengthFeatures();
        if (polygonFeature) {
            // 保存原始属性
            const landType = polygonFeature.values_.landType;
            const landName = polygonFeature.values_.landName;
            const actualAcreNum = polygonFeature.values_.actualAcreNum;
            const textMsg = `${landName}\n${actualAcreNum}亩`;

            polygonFeature.setStyle(
                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: landType === '1' ? '#A1FF83' : landType === '2' ? '#5BF3FF' : '#ffffff',
                        width: 2,
                    }),
                    fill: new ol.style.Fill({
                        color: landType === '1' ? 'rgba(161, 255, 131, 0.1)' : landType === '2' ? 'rgba(91, 243, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    }),
                    text: new ol.style.Text({
                        text: textMsg,
                        font: '16px Arial',
                        fill: new ol.style.Fill({ color: '#fff' }),
                        stroke: new ol.style.Stroke({ color: '#000', width: 2 }),
                    }),
                })
            );
        }
    }

    // 继续圈地时仅清除当前多边形，保留已经绘制的多边形
    function clearCurrentPolygon(map) {
        // 清除当前圈地多边形
        if (enclosurePolygonLayer && map) {
            map.removeLayer(enclosurePolygonLayer);
            enclosurePolygonLayer = null;
            enclosurePolygonFeature = null;
        }
        // 清除当前多边形（用于其他功能）
        if (polygonLayer && map) {
            map.removeLayer(polygonLayer);
            polygonLayer = null;
            polygonFeature = null;
            polygonArea = 0;
        }
    }

    // 多边形和公共点点击事件
    function polygonAndPointClickEvent(map) {
        map.on('click', (event) => {
            let clickedMarker = false;
            const commonPointMarkers = MarkerModule.getCommonPointMarkers();

            // 先判断是否点击了公共点
            map.forEachFeatureAtPixel(event.pixel, (feature) => {
                if (commonPointMarkers.some((marker) => marker.feature === feature)) {
                    const clickedCoordinate = feature.getGeometry().getCoordinates();
                    const wgsCoordinate = ol.proj.transform(clickedCoordinate, 'EPSG:3857', 'EPSG:4326');
                    clickedMarker = true;
                    WebBridge.postMessage({
                        type: 'WEBVIEW_BORROW_DOT',
                        point: {
                            lon: wgsCoordinate[0].toFixed(8),
                            lat: wgsCoordinate[1].toFixed(8),
                        }
                    });
                    MarkerModule.removeCommonPointMarker(map);
                    resetActivePolygon();
                    event.stopPropagation();
                    return true; // 停止遍历
                }
            });

            if (!clickedMarker) {
                map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
                    // 重置之前激活的多边形样式
                    resetActivePolygon();
                    MarkerModule.removeCommonPointMarker(map);

                    // 设置当前点击的多边形为激活状态
                    polygonFeature = feature;
                    polygonLayer = layer;
                    
                    const textMsg = `${feature.values_.landName}\n${feature.values_.actualAcreNum}亩`;
                    feature.setStyle(
                        new ol.style.Style({
                            stroke: new ol.style.Stroke({ color: '#FFFF00', width: 2 }),
                            fill: new ol.style.Fill({ color: 'rgba(161, 255, 131, 0.1)' }),
                            text: new ol.style.Text({
                                text: textMsg,
                                font: '16px Arial',
                                fill: new ol.style.Fill({ color: '#FFFF00' }),
                                stroke: new ol.style.Stroke({ color: '#000', width: 2 }),
                            })
                        })
                    );

                    // 获取多边形的几何对象
                    let polygonGeometry = feature.getGeometry();
                    // 获取多边形的坐标集合（已闭合）
                    let coordinates = polygonGeometry.getCoordinates()[0];
                    // 清除可能存在的旧边长标注
                    clearSideLengthFeatures(layer);

                    // 计算每条边的长度并显示
                    for (let i = 0; i < coordinates.length - 1; i++) {
                        let start = coordinates[i];
                        let end = coordinates[i + 1]; // 不需要模运算，因为最后一个点与第一个点相同
                        let line = new ol.geom.LineString([start, end]);
                        let length = ol.sphere.getLength(line);
                        let lineFeature = new ol.Feature({ geometry: line });
                        
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
                        );
                        
                        lineFeatureList.push(lineFeature);
                        layer.getSource().addFeature(lineFeature);
                    }

                    // 获取多边形的边界框并居中显示
                    let polygonExtent = feature.getGeometry().getExtent();
                    let polygonCenter = ol.extent.getCenter(polygonExtent);
                    map.getView().animate({ center: polygonCenter, zoom: 18, duration: 500 });
                    WebBridge.postMessage({
                        type: 'POLYGON_CLICK',
                        id: feature.values_.id
                    });

                    return true; // 停止遍历
                });
            }
        });
    }

    // 绘制地块详情
    function drawLandDetailPolygon(map, data) {
        // 先移除已存在的地块多边形
        if(polygonFeature && polygonLayer){
            removeLandPolygon(map);
        }
        let coordsLonLat = data.list ? data.list : [];
        if (!map || !Array.isArray(coordsLonLat) || coordsLonLat.length < 3) {
            WebBridge.postError("多边形坐标无效");
            return null;
        }

        // 将坐标转换为OpenLayers可以接受的格式
        let path3857 = coordsLonLat.map((item) => {
            return ol.proj.transform([item.lng, item.lat], 'EPSG:4326', 'EPSG:3857')
        });

        // 创建多边形几何对象
        let polygon = new ol.geom.Polygon([path3857]);

        // 创建特性并添加到源
        polygonFeature = new ol.Feature({
            geometry: polygon,
            id: data.id,
            landType: data.landType,
            landName: data.landName,
            actualAcreNum: data.actualAcreNum
        });

        const textMsg = `${data.landName}\n${data.actualAcreNum}亩`;

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
                    text: textMsg,
                    font: '16px Arial',
                    fill: new ol.style.Fill({ color: '#FFFF00' }),
                    stroke: new ol.style.Stroke({
                        color: '#000',
                        width: 2,
                    }),
                }),
            })
        );

        // 创建多边形向量图层并添加到地图
        let polygonVectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [polygonFeature],
            }),
            zIndex: 99,
        });
        const coordinates = polygon.getCoordinates()[0];
        // 计算每条边的长度并显示
        for (let i = 0; i < coordinates.length - 1; i++) {
                let start = coordinates[i];
                let end = coordinates[i + 1]; // 不需要模运算，因为最后一个点与第一个点相同
                let line = new ol.geom.LineString([start, end]);
                let length = ol.sphere.getLength(line);
                let lineFeature = new ol.Feature({ geometry: line });
                        
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
                );
                        
                lineFeatureList.push(lineFeature);
                polygonVectorLayer.getSource().addFeature(lineFeature);
        }


        map.addLayer(polygonVectorLayer);
        polygonFeatureList.push({
            layer: polygonVectorLayer,
            feature: polygonFeature,
        });
        // 获取多边形的边界框并居中显示
        let polygonExtent = polygonFeature.getGeometry().getExtent();
        let polygonCenter = ol.extent.getCenter(polygonExtent);
        map.getView().animate({ center: polygonCenter, zoom: 18, duration: 500 });
        
        polygonAndPointClickEvent(map);
    }

    /**
     * 绘制地块选择多边形
     * @param {ol.Map} map 
     * @param {LandDetailInfo[]} data 
     */
    function drawLandSelectionPolygon(map, data) {
        if (data.length) {
            removeLandPolygon(map);
            data.forEach(item => {
                drawLandPolygon(map, item);
            });
            selectPolygonClickEvent(map);
        }
    }

    /**
     * 地块选择多边形点击事件
     * @param {ol.Map} map 
     */
    function selectPolygonClickEvent(map) {
        map.on('click', function (event) {
            map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
                // 处理多边型点击事件
                WebBridge.postMessage({
                    type: 'POLYGON_CLICK',
                    id: feature.values_.id,
                });
                return true; // 停止遍历
            });
        });
    }

    /**
     * 设置选择地块选中状态
     * @param {ol.Map} map - OpenLayers 地图实例
     * @param {string|number} id - 要更新状态的地块 ID
     * @param {boolean} isSelect - true 为选中，false 为取消选中
     */
    function setSelectPolygonActive(map, id, isSelect) {
        // 根据 ID 在 polygonFeatureList 中查找对应的 feature 对象
        const targetFeatureInfo = polygonFeatureList.find(item => item.feature.values_.id === id);

        // 如果没有找到，直接返回
        if (!targetFeatureInfo) {
            return;
        }

        // 从找到的对象中获取 feature 和它所在的 layer
        const feature = targetFeatureInfo.feature;
        const layer = targetFeatureInfo.layer;

        // 文本消息
        const textMsg = `${feature.values_.landName}\n${feature.values_.actualAcreNum}亩`;

        // 更新样式
        feature.setStyle(
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: isSelect ? '#FFFF00' :
                        feature.values_.landType === '1' ? '#A1FF83' :
                        feature.values_.landType === '2' ? '#5BF3FF' : '#ffffff',
                    width: 2
                }),
                fill: new ol.style.Fill({
                    color: isSelect ? 'rgba(161, 255, 131, 0.1)' :
                        feature.values_.landType === '1' ? 'rgba(161, 255, 131, 0.1)' :
                        feature.values_.landType === '2' ? 'rgba(91, 243, 255, 0.1)' : 'rgba(0, 0, 0, 0.3)'
                }),
                text: new ol.style.Text({
                    text: textMsg,
                    font: '16px Arial',
                    fill: new ol.style.Fill({ color: isSelect ? '#FFFF00' : '#ffffff' }),
                    stroke: new ol.style.Stroke({ color: '#000', width: 2 }),
                })
            })
        );

        // 处理边长标注
        if (isSelect) {
            // 获取多边形的几何对象
            let polygonGeometry = feature.getGeometry();
            // 获取多边形的坐标集合（已闭合）
            let coordinates = polygonGeometry.getCoordinates()[0];
            // 清除可能存在的旧边长标注
            clearSideLengthFeatures(layer);
            // 计算每条边的长度并显示
            for (let i = 0; i < coordinates.length - 1; i++) {
                let start = coordinates[i];
                let end = coordinates[i + 1]; 
                let line = new ol.geom.LineString([start, end]);
                let length = ol.sphere.getLength(line);
                let lineFeature = new ol.Feature({ geometry: line });
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
                );
                layer.getSource().addFeature(lineFeature);
                lineFeatureList.push(lineFeature);
            }

            // 获取多边形的边界框并居中显示
            let polygonExtent = feature.getGeometry().getExtent();
            let polygonCenter = ol.extent.getCenter(polygonExtent);
            map.getView().animate({ center: polygonCenter, zoom: 18, duration: 500 });
        } else {
            clearSideLengthFeatures(layer);
        }
    }

    /**
     * 设置全部地块选中状态
     * @param {ol.Map} map 
     * @param {landListInfoItem[]} landListInfo 地块列表信息
     */
    function setAllSelectPolygonActive(map, landListInfo) {
        // 在批量更新前，先清除所有可能存在的边长标注
        clearAllSideLengthFeatures();

        // 遍历所有已绘制的地块 Feature
        polygonFeatureList.forEach(({ feature }) => {
            // 找到当前 Feature 对应的地块数据
            const landInfo = landListInfo.find(item => item.id === feature.values_.id);
            if (landInfo) {
                // 直接调用单个地块的样式更新逻辑
                setSelectPolygonActive(map, feature.values_.id, landInfo.isSelect);
            }
        });
    }

    /**
     * 绘制选中地块的凸包（包裹多边形）
     * @param {ol.Map} map
     * @param {landListInfoItem[]} selectedLandInfo 选中地块列表信息
     */
    function drawMergeLandPolygon(map, selectedLandInfo) {
        if (!selectedLandInfo || !Array.isArray(selectedLandInfo) || selectedLandInfo.length === 0) {
            WebBridge.postError('无效的地块数据或未选择任何地块');
            return null;
        }

        let combinedArea = 0;
        let ids = [];
        const turfPoints = []; // 变量名更清晰

        selectedLandInfo.forEach((item) => {
            combinedArea += item.actualAcreNum;
            ids.push(item.id);
            // 注意：这里的逻辑是收集所有点来计算凸包，而不是合并多边形
            item.gpsList.forEach((gpsItem) => {
                turfPoints.push(turf.point([gpsItem.lng, gpsItem.lat]));
            });
        });

        // 如果没有收集到任何点，直接返回
        if (turfPoints.length === 0) {
            WebBridge.postError('选中的地块没有有效的坐标点');
            return null;
        }

        // 计算凸包
        let convexHull = turf.convex(turf.featureCollection(turfPoints));

        // 检查计算结果是否有效
        if (!convexHull || !convexHull.geometry || convexHull.geometry.type !== 'Polygon') {
            WebBridge.postError('无法计算凸包或结果不是一个多边形');
            return null;
        }

        const mergedCoordinatesLonLat = convexHull.geometry.coordinates[0];

        let mergedPath = convexHull.geometry.coordinates[0].map((item) => {
            return ol.proj.transform([item[0], item[1]], 'EPSG:4326', 'EPSG:3857');
        });

        // 创建多边形几何对象
        let mergedPolygon = new ol.geom.Polygon([mergedPath]);
        mergedPolygonFeature = new ol.Feature({ geometry: mergedPolygon });
        const textMsg = `合并地块${combinedArea.toFixed(2)}亩`;

        mergedPolygonFeature.setStyle(
            new ol.style.Style({
                stroke: new ol.style.Stroke({ color: '#FF5733', width: 3 }), // 使用醒目的颜色
                fill: new ol.style.Fill({ color: 'rgba(255, 87, 51, 0.3)' }),
                text: new ol.style.Text({
                    text: textMsg,
                    font: '16px Arial',
                    fill: new ol.style.Fill({ color: '#FF5733' }),
                    stroke: new ol.style.Stroke({ color: '#000', width: 2 }),
                }),
            })
        );

        // 如果之前有合并图层，先移除
        if (mergePolygonLayer) {
            map.removeLayer(mergePolygonLayer);
        }

        mergePolygonLayer = new ol.layer.Vector({
            source: new ol.source.Vector({ features: [mergedPolygonFeature] }),
            zIndex: 100,
        });
        map.addLayer(mergePolygonLayer);
        WebBridge.postMessage({
            type: 'DRAW_MERGED_LAND_COORDINATES',
            mergeCoordinates: mergedCoordinatesLonLat, 
            mergeArea: combinedArea.toFixed(2),
        });
    }

    /**
     * 清除合并地块的凸包多边形
     * @param {ol.Map} map 
     */
    function removeMergeLandPolygon(map) {
        if (mergePolygonLayer) {
            map.removeLayer(mergePolygonLayer);
            mergePolygonLayer = null;
        }
    }

    /**
     * 绘制查找地块多边形
     */
    function drawFindLandPolygon(map, data) {
        // 先移除已存在的地块多边形
        if(polygonFeature && polygonLayer){
            removeLandPolygon(map);
        }
        // 先移除已存在的查找点标记
        if(MarkerModule?.getFindPointMarkers() && MarkerModule.getFindPointMarkers().length > 0){
            MarkerModule?.removeFindPointMarkers(map);
        }

        let coordsLonLat = data.list ? data.list : [];
        if (!map || !Array.isArray(coordsLonLat) || coordsLonLat.length < 3) {
            WebBridge.postError("多边形坐标无效");
            return null;
        }
        
        MarkerModule?.drawFindPointMarker(map, coordsLonLat);
        
        // 获取findPointMarkers
        const findPointMarkers = MarkerModule?.getFindPointMarkers();

        // 将坐标转换为OpenLayers可以接受的格式
        let path3857 = coordsLonLat.map((item) => {
            return ol.proj.transform([item.lng, item.lat], 'EPSG:4326', 'EPSG:3857')
        });

        // 创建多边形几何对象
        let polygon = new ol.geom.Polygon([path3857]);

        // 创建特性并添加到源
        polygonFeature = new ol.Feature({
            geometry: polygon,
            id: data.id,
            landType: data.landType,
            landName: data.landName,
            actualAcreNum: data.actualAcreNum
        });

        const textMsg = `${data.landName}\n${data.actualAcreNum}亩`;

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
                    text: textMsg,
                    font: '16px Arial',
                    fill: new ol.style.Fill({ color: '#FFFF00' }),
                    stroke: new ol.style.Stroke({
                        color: '#000',
                        width: 2,
                    }),
                }),
            })
        );

        // 创建多边形向量图层并添加到地图
        let polygonVectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [polygonFeature],
            }),
            zIndex: 99,
        });
        const coordinates = polygon.getCoordinates()[0];
        // 计算每条边的长度并显示
        for (let i = 0; i < coordinates.length - 1; i++) {
                let start = coordinates[i];
                let end = coordinates[i + 1]; // 不需要模运算，因为最后一个点与第一个点相同
                let line = new ol.geom.LineString([start, end]);
                let length = ol.sphere.getLength(line);
                let lineFeature = new ol.Feature({ geometry: line });
                        
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
                );
                        
                lineFeatureList.push(lineFeature);
                polygonVectorLayer.getSource().addFeature(lineFeature);
        }
        map.addLayer(polygonVectorLayer);
        polygonFeatureList.push({
            layer: polygonVectorLayer,
            feature: polygonFeature,
        });
        // 获取多边形的边界框并居中显示
        let polygonExtent = polygonFeature.getGeometry().getExtent();
        let polygonCenter = ol.extent.getCenter(polygonExtent);
        map.getView().animate({ center: polygonCenter, zoom: 18, duration: 500 });
        map.on('click', (event) => {
            map.forEachFeatureAtPixel(event.pixel, (feature) => {
                if (findPointMarkers.some((marker) => marker.feature === feature)) {
                    const clickedCoordinate = feature.getGeometry().getCoordinates();
                    const wgsCoordinate = ol.proj.transform(clickedCoordinate, 'EPSG:3857', 'EPSG:4326');
                    WebBridge.postMessage({
                        type: 'WEBVIEW_JUMP_FIND_POINT',
                        point: {
                            lon: wgsCoordinate[0].toFixed(8),
                            lat: wgsCoordinate[1].toFixed(8),
                        }
                    });
                    event.stopPropagation();
                    return true; // 停止遍历
                }
            });
        });
    }

    /**
     * 绘制地图标记已圈地块
     * @param {*} map 地图对象
     * @param {*} data 地块数据
    */
    function drawMarkEnclosureLandPolygon(map, data) {
        if (data.length) {
            removeLandPolygon(map);
            data.forEach(item => {
                drawMarkLandPolygon(map, item);
            });
         }
    }

    /**
     * 绘制地图标记已圈地块
     * @param {*} map 地图对象
     * @param {*} data 地块数据
    */
    function drawMarkLandPolygon(map, data) {
        if (!data || !Array.isArray(data.gpsList) || data.gpsList.length < 3) {
            return null;
        }

        // 将坐标转换为OpenLayers可以接受的格式
        let path3857 = data.gpsList.map((item) => {
            return ol.proj.transform([item.lng, item.lat], 'EPSG:4326', 'EPSG:3857')
        });

        // 创建多边形几何对象
        let polygon = new ol.geom.Polygon([path3857]);

        // 创建特性并添加到源
        let landPolygonFeature = new ol.Feature({
            geometry: polygon,
            id: data.id,
            checked: data.checked ? data.checked : false,
            landType: data.landType,
            landName: data.landName,
            actualAcreNum: data.actualAcreNum
        });

        const textMsg = `${data.landName}\n${data.actualAcreNum}亩`;

        // 设置地块样式
        landPolygonFeature.setStyle(
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color:'#ffffff',
                    width: 2,
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 0, 0.3)',
                }),
                text: new ol.style.Text({
                    text: textMsg,
                    font: '16px Arial',
                    fill: new ol.style.Fill({ color: '#fff' }),
                    stroke: new ol.style.Stroke({
                        color: '#000',
                        width: 2,
                    }),
                }),
            })
        );

        // 创建多边形向量图层并添加到地图
        let polygonVectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [landPolygonFeature],
            }),
            zIndex: 99,
        });

        map.addLayer(polygonVectorLayer);
        polygonFeatureList.push({
            layer: polygonVectorLayer,
            feature: landPolygonFeature,
        });
        return { layer: polygonVectorLayer, feature: landPolygonFeature };
    }

    /**
     * 获取地块列表数据
     */
    function getPolygonFeatureList() {
        return polygonFeatureList;
    }

    /**
     * 绘制农事标注地块列表
     */
    function drawFarmingMarkLandListPolygon(map, data) {
        if (data.length) {
            removeLandPolygon(map);
            data.forEach(item => {
                drawFarmingMarkLandPolygon(map, item);
            });
            selectPolygonClickEvent(map);
        }
    }

    /**
     * 绘制农事标注地块
     */
    function drawFarmingMarkLandPolygon(map, data) {
        if (!data || !Array.isArray(data.gpsList) || data.gpsList.length < 3) {
            return null;
        }

        // 将坐标转换为OpenLayers可以接受的格式
        let path3857 = data.gpsList.map((item) => {
            return ol.proj.transform([item.lng, item.lat], 'EPSG:4326', 'EPSG:3857')
        });

        // 创建多边形几何对象（自动闭合，OpenLayers要求）
        const closedPath3857 = [...path3857, path3857[0]];
        let polygon = new ol.geom.Polygon([closedPath3857]);

        // 创建特性并添加到源
        let landPolygonFeature = new ol.Feature({
            geometry: polygon,
            id: data.id,
            landType: data.landType,
            landName: data.landName,
            actualAcreNum: data.actualAcreNum,
            landStatus: data.landStatus,
        });

        const textMsg = `${data.landName}\n${data.actualAcreNum}亩`;
        // 基础颜色（根据地块类型）
        const completedColor = '#37DC6B'; // 已完成
        const unfinishedColor = '#FF4E4C'; // 未完成

        // 设置地块样式：区分已完成/未完成
        landPolygonFeature.setStyle(
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: data.landStatus ==='0' ? unfinishedColor : data.landStatus ==='1' ? completedColor : '#fff',
                    width: 2,
                }),
                fill: new ol.style.Fill({
                    color: data.landStatus ==='0' ? 'rgba(255, 78, 76, 0.20)' : data.landStatus ==='1'?'rgba(55, 220, 107, 0.20)':'rgba(0, 0, 0, 0.3)',
                }),
                text: new ol.style.Text({
                    text: textMsg,
                    font: '16px Arial', 
                    fill: new ol.style.Fill({ color: data.landStatus ==='0' ? '#FF4E4C' : data.landStatus ==='1'? '#37DC6B' : '#fff' }),
                    stroke: new ol.style.Stroke({
                        color: '#fff',
                        width: 2,
                    }),
                }),
            })
        );

        // 创建多边形向量图层并添加到地图
        let polygonVectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [landPolygonFeature],
            }),
            zIndex: 99,
        });
        map.addLayer(polygonVectorLayer);
        polygonFeatureList.push({
            layer: polygonVectorLayer,
            feature: landPolygonFeature,
        });
        return { layer: polygonVectorLayer, feature: landPolygonFeature };

    }  

    /**
     * 更新农事地块状态样式
     * @param {ol.Map} map - 地图实例
     * @param {string|number} id - 地块ID
     * @param {string} landStatus - 0:未完成 1:已完成
     */
    function updateFarmingLandStatus(map, id, landStatus) {
        // 1. 查找目标地块Feature
        const targetFeatureInfo = polygonFeatureList.find(item => item.feature.values_.id === id);
        if (!targetFeatureInfo) {
            WebBridge.postError(`未找到ID为${id}的地块`);
            return;
        }

        const feature = targetFeatureInfo.feature;
        const layer = targetFeatureInfo.layer;
        
        // 2. 定义状态对应的样式
        const completedColor = '#37DC6B'; // 已完成
        const unfinishedColor = '#FF4E4C'; // 未完成
        const textMsg = `${feature.values_.landName}\n${feature.values_.actualAcreNum}亩`;

        // 3. 更新Feature样式
        feature.setStyle(
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: landStatus === '0' ? unfinishedColor : landStatus === '1' ? completedColor : '#fff',
                    width: 2,
                }),
                fill: new ol.style.Fill({
                    color: landStatus === '0' ? 'rgba(255, 78, 76, 0.20)' : 'rgba(55, 220, 107, 0.20)',
                }),
                text: new ol.style.Text({
                    text: textMsg,
                    font: '16px Arial', 
                    fill: new ol.style.Fill({ color: landStatus === '0' ? '#FF4E4C' : '#37DC6B' }),
                    stroke: new ol.style.Stroke({
                        color: '#fff',
                        width: 2,
                    }),
                }),
            })
        );

        // 4. 更新Feature的landStatus属性（同步数据）
        feature.set('landStatus', landStatus);
        
        // 5. 通知RN端更新成功
        WebBridge.postMessage({
            type: "FARMING_LAND_STATUS_UPDATED",
            id: id,
            landStatus: landStatus
        });
    }

    return {
        drawEnclosurePolygon,
        removeEnclosurePolygon,
        removePolygon,
        removeSpecifyLand,
        removeLandPolygon,
        getCurrentPolygonArea,
        drawLandPolygon,
        drawLandPolygonList,
        resetActivePolygon,
        clearCurrentPolygon,
        drawLandDetailPolygon,
        drawLandSelectionPolygon,
        selectPolygonClickEvent,
        setSelectPolygonActive,
        setAllSelectPolygonActive,
        drawMergeLandPolygon,
        removeMergeLandPolygon,
        drawFindLandPolygon,
        drawMarkEnclosureLandPolygon,
        getPolygonFeatureList,
        drawFarmingMarkLandPolygon,
        updateFarmingLandStatus,
        drawFarmingMarkLandListPolygon
    };
})();