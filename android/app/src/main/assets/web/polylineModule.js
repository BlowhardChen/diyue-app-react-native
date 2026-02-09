window.PolylineModule = (function () {
    let polylines = []; 
    let locusCoordinates = []; 
    let locusLineLayer = null; 
    let farmingLocusCoordinates = []; // 统一维护所有农事轨迹（RTK+GPS）
    let farmingLocusLineLayers = []; // 改为数组，存储多条轨迹线图层（关键修改）
    let farmingCurrentMarkerLayer = null;

    //  定义5种轨迹线颜色数组
    const TRACK_COLORS = [
        '#08D55C', // 绿色（默认）
        '#FF4E4C', // 红色
        '#28E1FF', // 蓝色
        '#FFD166', // 黄色
        '#9370DB'  // 紫色
    ];

    // 新增：合并轨迹数据（解决设备切换时轨迹断裂）
    function mergeFarmingLocusData(newData) {
        if (Array.isArray(newData) && newData.length > 0) {
            newData.forEach(item => {
            // 保留6位小数，避免精度问题导致的误判
            const lng = parseFloat(item.lng.toFixed(6));
            const lat = parseFloat(item.lat.toFixed(6));
            const key = `${lng},${lat}`;
            const existingKeys = farmingLocusCoordinates.map(i => `${parseFloat(i.lng.toFixed(6))},${parseFloat(i.lat.toFixed(6))}`);
            if (!existingKeys.includes(key)) {
                farmingLocusCoordinates.push({lng, lat});
            }
            });
        } else if (newData && newData.lng && newData.lat) {
            const lng = parseFloat(newData.lng.toFixed(6));
            const lat = parseFloat(newData.lat.toFixed(6));
            const key = `${lng},${lat}`;
            const existingKeys = farmingLocusCoordinates.map(i => `${parseFloat(i.lng.toFixed(6))},${parseFloat(i.lat.toFixed(6))}`);
            if (!existingKeys.includes(key)) {
            farmingLocusCoordinates.push({lng, lat});
            }
        }
    }

    // 优化：增量更新轨迹线（避免整体重建）
    function updateFarmingLocusLineIncrementally(map, newPoint, userName, locusColor = '#08D55C') {
        if (!newPoint || !newPoint.lng || !newPoint.lat) return;
        
        // 转换新坐标
        const newCoord = ol.proj.fromLonLat([newPoint.lng, newPoint.lat]);
        
        // 如果轨迹线不存在，创建新的
        if (!farmingLocusLineLayers.length) {
            const lineString = new ol.geom.LineString([newCoord]);
            const feature = new ol.Feature({ geometry: lineString });
            feature.setStyle(new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: locusColor,
                    width: 2,
                    lineCap: 'round',
                    lineJoin: 'round',
                }),
            }));
            const newLayer = new ol.layer.Vector({
                source: new ol.source.Vector({ features: [feature] }),
                zIndex: 101,
            });
            farmingLocusLineLayers.push(newLayer);
            map.addLayer(newLayer);
            return;
        }

        // 增量更新现有轨迹线（注：多轨迹时需区分图层，此处保留原逻辑，如需精准更新需扩展）
        const source = farmingLocusLineLayers[0].getSource();
        const features = source.getFeatures();
        if (features.length > 0) {
            const feature = features[0];
            const lineString = feature.getGeometry();
            const coordinates = lineString.getCoordinates();
            // 只添加新的坐标点（避免重复）
            const lastCoord = coordinates[coordinates.length - 1];
            if (lastCoord[0] !== newCoord[0] || lastCoord[1] !== newCoord[1]) {
                coordinates.push(newCoord);
                lineString.setCoordinates(coordinates);
                feature.setGeometry(lineString);
            }
        }
        
        // 更新当前点Marker
        drawFarmingCurrentMarker(map, newPoint, userName, locusColor);
    }

    function drawPolyline(map, startLonLat, endLonLat) {
        const start3857 = ol.proj.fromLonLat(startLonLat);
        const end3857   = ol.proj.fromLonLat(endLonLat);

        const lineString = new ol.geom.LineString([start3857, end3857]);
        const feature = new ol.Feature({ geometry: lineString });

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

    function calculateDistance(start3857, end3857) {
        const startLonLat = ol.proj.toLonLat(start3857);
        const endLonLat   = ol.proj.toLonLat(end3857);
        return ol.sphere.getDistance(startLonLat, endLonLat);
    }

    function removePolyline(map) {
        if (polylines.length > 0) {
            const last = polylines.pop();
            map.removeLayer(last);
        }
    }

    function removeAllPolylines(map) {
        polylines.forEach(layer => map.removeLayer(layer));
        polylines = [];
    }

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

    function updateFindNavigationPolyline(map, startLonLat, endLonLat) {
        removePolyline(map)
        drawFindNavigationPolyline(map, startLonLat, endLonLat)
    }

    function removeFindNavigationPolyline(map) {
        removePolyline(map)
    }

    function drawPatrolLocusPolyline(map, data) {
        if (!data || data.length === 0) {
            WebBridge.postError('无效的巡田轨迹数据')
            return
        }
        if(locusLineLayer) {
           map.removeLayer(locusLineLayer)
           locusLineLayer = null
        }
        let locusPath = []
        data.forEach(item => {
            locusPath.push(ol.proj.fromLonLat([item.lng, item.lat]))
        });

        if (locusPath.length < 2) return
        
        const lineString = new ol.geom.LineString(locusPath)
        const feature = new ol.Feature({ geometry: lineString });
        const style = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#08D55C',
                width: 1.4,
                lineCap: 'round',
                lineJoin: 'round',
            }),
        });
        feature.setStyle(style);
        const layer = new ol.layer.Vector({
            source: new ol.source.Vector({ features: [feature] }),
            zIndex: 101,
        });
        locusLineLayer = layer
        map.addLayer(layer);
    }

    function updatePatrolLocusPolyline(map, location) {
        if (!location || !location.lng || !location.lat) {
            WebBridge.postError('无效的巡田轨迹更新数据')
            return
        }

        locusCoordinates.push(location)
        if (locusCoordinates.length < 1) return
        
        if(locusLineLayer) {
            map.removeLayer(locusLineLayer)
        }
    
        drawPatrolLocusPolyline(map, locusCoordinates)
    }

    function removePatrolLocusPolyline(map) {
        if(locusLineLayer) {
            map.removeLayer(locusLineLayer)
            locusLineLayer = null
        }
    }

    // 核心修改：让Marker样式和轨迹线完全一致
    function drawFarmingCurrentMarker(map, currentPoint, userName = '作业人', locusColor = '#08D55C') {
        if (farmingCurrentMarkerLayer) {
            map.removeLayer(farmingCurrentMarkerLayer);
            farmingCurrentMarkerLayer = null;
        }
        if (!currentPoint || !currentPoint.lng || !currentPoint.lat) return;

        const currentCoordinate = ol.proj.fromLonLat([currentPoint.lng, currentPoint.lat]);
        const markerFeature = new ol.Feature({
            geometry: new ol.geom.Point(currentCoordinate),
        });

        // 修改点样式：使用圆形标记，匹配轨迹线的颜色、圆角等样式
        const markerStyle = [
            new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 1, // 圆点半径，可根据需要调整
                    fill: new ol.style.Fill({
                        color: locusColor // 填充色和轨迹线一致
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#ffffff', // 白色描边增加辨识度
                        width: 2, // 描边宽度
                        lineCap: 'round',
                        lineJoin: 'round'
                    })
                }),
            }),
            new ol.style.Style({
                text: new ol.style.Text({
                    text: userName,
                    font: '16px 微软雅黑',
                    fill: new ol.style.Fill({ color: locusColor }), // 文字颜色和轨迹线一致
                    stroke: new ol.style.Stroke({ color: '#000', width: 2 }), // 文字描边保留
                    offsetY: -20, // 调整文字位置，避免遮挡圆点
                    textAlign: 'center',
                    textBaseline: 'middle'
                }),
            }),
        ];
        markerFeature.setStyle(markerStyle);

        farmingCurrentMarkerLayer = new ol.layer.Vector({
            source: new ol.source.Vector({ features: [markerFeature] }),
            zIndex: 102, 
        });
        map.addLayer(farmingCurrentMarkerLayer);
    }

    /**
     * 绘制农事地图轨迹线列表
     * @param {Array{farmingLocusId, locusType, userName, mobile, userId, locusGpsList}} data 农事轨迹数据
     * @returns 
     */
    function drawFarmingMapTaskLocusPolylineList(map, data) {
        if (!data || data.length === 0) {
            WebBridge.postError('无效的农事轨迹数据');
            return;
        }
        
        // 2. 先清空旧的多轨迹图层（关键修改）
        if (farmingLocusLineLayers.length > 0) {
            farmingLocusLineLayers.forEach(layer => map.removeLayer(layer));
            farmingLocusLineLayers = [];
        }
        
        // 3. 遍历数据，按索引循环取颜色（index % 5）
        data.forEach((item, index) => {
            // 取模运算实现颜色循环
            const trackColor = TRACK_COLORS[index % TRACK_COLORS.length];
            drawFarmingMapTaskLocusPolyline(map, item, trackColor); // 传递颜色参数
        })
    }

    /**
     * 绘制农事地图轨迹线
     * @param {ol.Map} map 
     * @param {data:{farmingLocusId, locusType, userName, mobile, userId, locusGpsList}} data 农事轨迹数据
     * @param {string} trackColor 轨迹线颜色（新增参数）
     * @returns 
     */
    function drawFarmingMapTaskLocusPolyline(map, data, trackColor = '#08D55C') { // 新增颜色参数
        if (!data || !data.locusGpsList || data.locusGpsList.length === 0) {
            WebBridge.postError('无效的农事轨迹数据');
            return;
        }
        
        // 4. 构建当前轨迹的坐标数组
        let locusPath = [];
        data.locusGpsList.forEach(item => {
            locusPath.push(ol.proj.fromLonLat([item.lng, item.lat]));
        });
        
        // 至少2个点才绘制轨迹线
        if (locusPath.length >= 2) {
            const lineString = new ol.geom.LineString(locusPath);
            const feature = new ol.Feature({ 
                geometry: lineString,
                farmingLocusId: data.farmingLocusId // 绑定轨迹ID，方便后续管理
            });
            
            // 5. 应用指定的颜色到轨迹线样式
            feature.setStyle(new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: trackColor, // 使用传递的颜色
                    width: 2,
                    lineCap: 'round',
                    lineJoin: 'round',
                }),
            }));
            
            // 6. 创建独立图层并加入数组管理
            const newLayer = new ol.layer.Vector({
                source: new ol.source.Vector({ features: [feature] }),
                zIndex: 101 + farmingLocusLineLayers.length, // 分层显示，避免遮挡
            });
            farmingLocusLineLayers.push(newLayer);
            map.addLayer(newLayer);

            // 7. 绘制轨迹最后一个点的Marker，同步颜色（可选）
            const lastPoint = data.locusGpsList[data.locusGpsList.length - 1];
            drawFarmingCurrentMarker(map, lastPoint, data.userName || '作业人', trackColor);
        }
    }

    // 重构：增量更新轨迹（核心修复）
    function updateFarmingTaskLocusPolyline(map, location, userName = '作业人') {
        if (!location || !location.lng || !location.lat) {
            WebBridge.postError('无效的农事轨迹更新数据');
            return;
        }

        let workerName = userName
        
        // 合并新坐标到总轨迹
        mergeFarmingLocusData(location);
        
        // 使用增量更新，避免整体重建（默认用第一个颜色，如需指定可扩展参数）
        updateFarmingLocusLineIncrementally(map, location, workerName, TRACK_COLORS[0]);
    }

    function removeFarmingTaskLocusPolyline(map) {
        // 8. 清空所有农事轨迹图层（关键修改）
        if (farmingLocusLineLayers.length > 0) {
            farmingLocusLineLayers.forEach(layer => map.removeLayer(layer));
            farmingLocusLineLayers = [];
        }
        if (farmingCurrentMarkerLayer) {
            map.removeLayer(farmingCurrentMarkerLayer);
            farmingCurrentMarkerLayer = null;
        }
        farmingLocusCoordinates = [];
    }

    // 获取农事轨迹数据的方法（供设备切换时使用）
    function getFarmingLocusCoordinates() {
        return [...farmingLocusCoordinates]; 
    }

    // 设置农事轨迹数据（供设备切换时初始化）
    function setFarmingLocusCoordinates(data) {
        if (Array.isArray(data) && data.length > 0) {
            farmingLocusCoordinates = [...data];
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
        removePatrolLocusPolyline,
        drawFarmingMapTaskLocusPolylineList,
        drawFarmingMapTaskLocusPolyline,
        removeFarmingTaskLocusPolyline,
        updateFarmingTaskLocusPolyline,
        getFarmingLocusCoordinates, 
        setFarmingLocusCoordinates  
    };
})();