// 标记点模块
window.MarkerModule = (function () {
    let selfMarkerLayer;                 // 当前设备点位图层
    let dotMarkers = [];                 // 地图打点图层数组
    let dotMarkerCoordinates = [];       // 打点经纬度数组（[{lon,lat}, ...]）
    let commonPointMarkers = [];        // 公共点标准数组
    let findPointMarkers = [];        // 查找点标准数组
    let markPointMarkers = [];        // 标记点标准数组

    /**
     * 绘制地图打点
     * @param {ol.Map} map
     * @param {{lon:number, lat:number}} location
     */
    function drawDotMarker(map, location) {
        if (!filterPointDot(location, dotMarkerCoordinates)) {
            WebBridge.postMessage({ type: 'WEBVIEW_DOT_REPEAT' });
            return;
        }

        dotMarkerCoordinates.push(location);

        const feature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([location.lon, location.lat]))
        });
        feature.setStyle(getDotMarkerStyle());

        const layer = new ol.layer.Vector({
            source: new ol.source.Vector({ features: [feature] }),
            zIndex: 110
        });

        dotMarkers.push(layer);
        map.addLayer(layer);

        handlePolylineAndPolygon(map);
    }

    /**
     * 获取当前打点样式
     */
    function getDotMarkerStyle(scale = 0.3) {
        return new ol.style.Style({
           image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: Base64Images.dotMarkerJS,
                crossOrigin: 'anonymous',
                scale: scale,
                rotateWithView: true
            })
        });
    }

    /**
     * 根据当前点数联动折线与多边形
     * @param {ol.Map} map
     */
    function handlePolylineAndPolygon(map) {
        const total = dotMarkerCoordinates.length;
        const coordsLonLat = dotMarkerCoordinates.map(d => [d.lon, d.lat]);

        if (total === 0 || total === 1) {
            PolylineModule.removeAllPolylines(map);
            PolygonModule.removeEnclosurePolygon(map);
            WebBridge.postMessage({ type: 'WEBVIEW_UPDATE_DOT_TOTAL',total: dotMarkerCoordinates.length, message: total === 0 ? '请点击打点按钮打点' : '请继续添加下一个点位' });
            return;
        }

        if (total === 2) {
            PolygonModule.removeEnclosurePolygon(map);
            PolylineModule.removeAllPolylines(map);
            PolylineModule.drawPolyline(map, coordsLonLat[0], coordsLonLat[1]);
            WebBridge.postMessage({ type: 'WEBVIEW_UPDATE_DOT_TOTAL',total: dotMarkerCoordinates.length, message: '已生成线段，请继续添加下一个点位' });
            return;
        }   

        // 3 个及以上：清除折线，绘制多边形（自动闭合）
        PolylineModule.removeAllPolylines(map);
        PolygonModule.removeEnclosurePolygon(map);

        // 判断多边形是否相交
        const path = dotMarkerCoordinates.concat([dotMarkerCoordinates[0]])
        const isPolygonIntersect = isPolygonSelfIntersecting(path)
        WebBridge.postMessage({ 
            type: 'WEBVIEW_POLYGON_INTERSECT',
            isPolygonIntersect,
            message: isPolygonIntersect ? '生成的地块区域自相交，请检查点位顺序' : '' // 自相交时才带提示文本
        });

        const polygonResult = PolygonModule.drawEnclosurePolygon(map, coordsLonLat);
        if (polygonResult) {
            WebBridge.postMessage({ 
                type: 'WEBVIEW_UPDATE_DOT_TOTAL', 
                total: dotMarkerCoordinates.length, 
                message: `${isPolygonIntersect ? '地块区域自相交' : '已形成闭合区域地块'}，面积: ${polygonResult.area.toFixed(2)} 亩` 
            });
        }
    }

    /**
     * 检查多边形是否自相交
     * @param {Array<Array<number>>} path - 多边形顶点坐标数组 [ [lon,lat], ... ]
     * @returns {boolean} 是否相交
     */
    function isPolygonSelfIntersecting(path) {
        let polygonPath = []
        let features= []

        path.forEach((item) => {
            polygonPath.push([item.lon, item.lat])
            features.push(turf.point([item.lon, item.lat]))
        })

        const poly = turf.polygon([polygonPath])
        const kinks = turf.kinks(poly)

        return kinks.features.length > 0
    }

    /**
     * 撤销最后一个打点
     * @param {ol.Map} map
     */
    function removeDotMarker(map) {
        if (dotMarkers.length === 0) return;

        const lastLayer = dotMarkers.pop();
        map.removeLayer(lastLayer);
        dotMarkerCoordinates.pop();

        handlePolylineAndPolygon(map);
    }

    /**
     * 移除所有打点
     * @param {ol.Map} map
     */
    function removeAllDotMarkers(map) {
        dotMarkers.forEach(layer => map.removeLayer(layer));
        dotMarkers = [];
        dotMarkerCoordinates = [];

        PolylineModule.removeAllPolylines(map);

        WebBridge.postMessage({ type: 'WEBVIEW_UPDATE_DOT_TOTAL', total: 0 }); 
    }

    /**
     * 过滤点是否重复
     * @param {*} location 新点
     * @param {*} list 旧点列表
     * @returns 
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

    /**
     * 定位到当前位置
     * @param {*} map 地图
     * @param {*} location 位置
     */
    function toLocateSelf(map, location) {
        if (!selfMarkerLayer) {
            drawCurrentLocation(map, location);
        } else {
            updateCurrentLocation(map, location);
        }
        map.getView().animate({
            center: ol.proj.fromLonLat([location.lon, location.lat]),
            zoom: 17,
            duration: 500
        });
        WebBridge.postMessage({ type: 'WEBVIEW_LOCATE_SELF'});
    }

    /**
     * 绘制当前位置
     * @param {*} map 地图
     * @param {*} location 位置
     */
    function drawCurrentLocation(map, location) {
        const markerIcon = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: Base64Images.locationMarkerJS,
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

    /**
     * 更新当前位置
     * @param {*} location 位置
     * @param {*} map 地图
     * @returns 
     */
    function updateCurrentLocation(map,location) {
        const features = selfMarkerLayer?.getSource()?.getFeatures();
        if (!features || features.length === 0) {
            drawCurrentLocation(map, location);
            return;
        }
        const geom = features[0].getGeometry();
        geom.setCoordinates(ol.proj.fromLonLat([location.lon, location.lat]));
    }

    /**
     * 更新当前位置旋转角度
     * @param {*} map 地图
     * @param {*} degrees 角度
     * @returns 
     */
    function updateMarkerRotation(map, degrees) {
        const features = selfMarkerLayer?.getSource()?.getFeatures();
        if (!features || features.length === 0) return;

        const radians = degrees * (Math.PI / 180);
        const style = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: Base64Images.locationMarkerJS,
                crossOrigin: 'anonymous',
                scale: 0.3,
                rotateWithView: true,
                rotation: radians
            })
        });

        features[0].setStyle(style);
        if (map && typeof map.render === 'function') map.render();
    }
    

    /**
     * 保存地块数据并传递给React Native
     */
    async function savePolygonToNative(token) {
        try {
            // 地块坐标点
            let polygonPath = [...dotMarkerCoordinates];
            const firstPoint = polygonPath[0];
            const lastPoint = polygonPath[polygonPath.length - 1];
            if (firstPoint.lon !== lastPoint.lon || firstPoint.lat !== lastPoint.lat) {
                polygonPath.push(firstPoint);
            }

            // 获取面积
            const area = PolygonModule.getCurrentPolygonArea() || 0;
            if (area <= 0) {
                WebBridge.postError('计算地块面积失败');
                return;
            }

            // const mapImageFile = await getMapScreenshot()

            // const imageUrl = await uploadImageToOSS(mapImageFile, token);

            // 发送参数数据到RN
            WebBridge.postMessage({
                type: 'SAVE_POLYGON',
                saveLandParams: {
                    polygonPath: polygonPath.map(point => ({
                        lng: parseFloat(point.lon.toFixed(8)),
                        lat: parseFloat(point.lat.toFixed(8))
                    })),
                    area: parseFloat(area.toFixed(2)),
                    // imageUrl 
                }
            });

            // PolygonModule.initPolygonCommonPointClickEvent()

        } catch (error) {
            WebBridge.postMessage({
                type: 'SAVE_ERROR',
                message: `保存失败: ${error.message}`
            });
        }
    }

    /**
    * 获取地图截图
    */
    async function getMapScreenshot() {
        const map = MapCore.getMap();
        const target = map.getTarget();
        const mapElement = typeof target === 'string' ? document.getElementById(target) : target;

        if (!mapElement) {
            WebBridge.postError('无法获取地图容器元素');
            return;
        }

        // 移除天地图层（避免跨域）
        let getTdAnnotationLayer = SwitchMapLayer.getTdAnnotationLayer()

        const canvas = mapElement.querySelector('canvas')

        // 设置Canvas的尺寸与地图视图相同
        canvas.width = map.getSize()[0]
        canvas.height = map.getSize()[1]

        WebBridge.postMessage({
            type: 'SAVE_ERROR',
            width: canvas.width,
            height: canvas.height,
        });
        // 移除天地图层
        map.removeLayer(getTdAnnotationLayer)

        // 返回一个Promise，用于在地图渲染完成后获取Blob
        const getCanvasBlob = () => {
            return new Promise((resolve) => {
                canvas.toBlob(
                    (blob) => {
                        resolve(blob)
                    },
                    'image/jpeg',
                    0.5
                )
            })
        }
        let blob = await getCanvasBlob()

        map.addLayer(getTdAnnotationLayer)

        // 创建File对象
        const file = new File([blob], 'map-screenshot.jpg', { type: 'image/jpeg' });
        return file;
    }

      /**
        * 上传图片到OSS    
        */
    function uploadImageToOSS(file, token) {
        return new Promise((resolve, reject) => {
            try {
                // 创建 FormData 对象
                const formData = new FormData();
                formData.append("multipartFile", file);
                formData.append("type", "0");
                formData.append("fileName", "other");
                // 发送 POST 请求
                fetch("http://xtnf.com/app/aliyun/oss/uploadToAliOss", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: formData,
                })
                .then(response => {
                    if (!response.ok) {
                        WebBridge.postError("图片上传失败");
                        reject;
                    }
                    return response.json();
                })
                .then(data => {
                    // 处理成功的响应
                    resolve(data.data);
                })
                .catch(error => {
                    WebBridge.postError("图片上传失败");
                    reject(error);
                });
            } catch (error) {
                WebBridge.postError("图片上传失败")
                reject(error);
            }
        });
    }

    /**
     * 绘制公共点
     */
    function drawCommonPointMarker(map, polygonPath) {
        if (!polygonPath || !Array.isArray(polygonPath) || polygonPath.length === 0) {
            WebBridge.postError(`无效的公共点数据: ${JSON.stringify(polygonPath)}`);
            return
        }
        removeCommonPointMarker(map)
        
        let path = [];
        if (polygonPath.length > 3) {
            path = polygonPath.slice(0, -1)
        } else {
            path = polygonPath
        }

        let markerList = []
        path.forEach((position) => {
            const markerIcon = new ol.style.Style({
                image: new ol.style.Icon({
                        anchor: [0.5, 0.5],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'fraction',
                        src: Base64Images.commonDotMarkerJS,
                        scale: 0.8, // 缩放比例
                        crossOrigin: 'anonymous',
                })
            })
            // 创建一个新的Feature，并设置其几何形状为Point
            const markerFeature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([position.lng, position.lat])),
            });
            markerFeature.setStyle(markerIcon)
            // 创建一个新的VectorLayer，并将marker添加到其中
            const markerLayer = new ol.layer.Vector({
                source: new ol.source.Vector({features: [markerFeature]}),
                zIndex: 100,
            });

            // 将VectorLayer添加到地图中
            map.addLayer(markerLayer);
            markerList.push({ layer: markerLayer, feature: markerFeature })
        })

        commonPointMarkers = markerList

        return markerList
    }

    /**
     * 清除公共点
    */
    function removeCommonPointMarker(map) {
        if (!commonPointMarkers.length) return; 
        commonPointMarkers.forEach(marker => {
            if (marker.layer) {
                map.removeLayer(marker.layer)
            }  
        })
        commonPointMarkers = []
    }

    /**
     * 获取公共点数组
     */
    function getCommonPointMarkers() {
        return commonPointMarkers
    }

    /**
     * 绘制查找点
     * @param {*} map 
     * @param {*} polygonPath 
     * @returns 
     */
    function drawFindPointMarker(map, polygonPath) {
        removeFindPointMarkers(map)
        let path = [];
        if (polygonPath.length > 3) {
            path = polygonPath.slice(0, -1)
        } else {
            path = polygonPath
        }
        let markerList = []
        path.forEach((position) => {
            const markerIcon = getDotMarkerStyle(0.5)
            // 创建一个新的Feature，并设置其几何形状为Point
            const markerFeature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([position.lng, position.lat])),
            });
            markerFeature.setStyle(markerIcon)
            // 创建一个新的VectorLayer，并将marker添加到其中
            const markerLayer = new ol.layer.Vector({
                source: new ol.source.Vector({features: [markerFeature]}),
                zIndex: 999,
            });

            // 将VectorLayer添加到地图中
            map.addLayer(markerLayer);
            markerList.push({ layer: markerLayer, feature: markerFeature })
        })

        findPointMarkers = markerList

        return markerList
    }

    /**
     * 获取查找点数组
     * @returns 
     */
    function getFindPointMarkers() {
        return findPointMarkers
    }
    /**
     * 移除查找点标记
     * @param {*} map 
     * @returns 
     */
    function removeFindPointMarkers(map) {
        if (!findPointMarkers.length) return; 
        findPointMarkers.forEach(marker => {
            if (marker.layer) {
                map.removeLayer(marker.layer)
            }  
        })
        findPointMarkers = []
    }

    /**
     * 绘制回找点
     * @param {*} map 
     * @param {*} position 
     * @returns 
     */
    function drawFindMarker(map, position) {
        if (!position) return
        WebBridge.postMessage(
            JSON.stringify({
                type: "WEBVIEW_CONSOLE_LOG",
                position
            }),
        );
        const markerIcon = getDotMarkerStyle(0.5)
        // 创建一个新的Feature，并设置其几何形状为Point
        const markerFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([position.lon, position.lat])),
        });
        markerFeature.setStyle(markerIcon)
        // 创建一个新的VectorLayer，并将marker添加到其中
        const markerLayer = new ol.layer.Vector({
            source: new ol.source.Vector({features: [markerFeature]}),
            zIndex: 999,
        });

        // 将VectorLayer添加到地图中
        map.addLayer(markerLayer);
     
    }

    /**
     * 绘制地图标记标记点
     */
    function drawMarkPointMarker(map, location) {
        if (!filterPointDot(location, dotMarkerCoordinates)) {
            WebBridge.postMessage({ type: 'WEBVIEW_DOT_REPEAT' });
            return;
        }

        dotMarkerCoordinates.push(location);

        const feature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([location.lon, location.lat]))
        });
        feature.setStyle(getMarkMarkerStyle());

        const layer = new ol.layer.Vector({
            source: new ol.source.Vector({ features: [feature] }),
            zIndex: 110
        });

        // 判断标记点是否在已绘制的地块内
        let isInsideLand = isMarkerInsidePolygons(ol.proj.fromLonLat([location.lon, location.lat]), PolygonModule.getPolygonFeatureList());
        if (isInsideLand) {
            markPointMarkers.push({
                longitude: location.lon,
                latitude: location.lat,
                landId: isInsideLand,
            })
        } else {
            markPointMarkers.push({
                longitude: location.lon,
                latitude: location.lat,
            })
        }

        dotMarkers.push(layer);
        map.addLayer(layer);
    }

    /**
     * 获取标记点打点样式
     */
    function getMarkMarkerStyle(scale = 0.5) {
        return new ol.style.Style({
           image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: Base64Images.markPointMarkerJS,
                crossOrigin: 'anonymous',
                scale: scale,
                rotateWithView: true
            })
        });
    }

    /**
     * 撤销标记打点
     * @param {ol.Map} map
     */
    function removeMarkDotMarker(map) {
        if (dotMarkers.length === 0) return;
        markPointMarkers.pop();
        const lastLayer = dotMarkers.pop();
        map.removeLayer(lastLayer);
        dotMarkerCoordinates.pop();
    }

    /**
     * 判断标记点是否在已绘制的地块内
     */
    function isMarkerInsidePolygons(markerPosition, polygonFeatures) {
        // 参数为空直接返回 null
        if (!markerPosition || !polygonFeatures || !Array.isArray(polygonFeatures) || polygonFeatures.length === 0) {
            return null;
        }
        // 遍历所有多边形特征
        for (const polygonFeature of polygonFeatures) {
            if (!polygonFeature?.feature) {
                continue; // 跳过无效元素，不中断遍历
            }
            const polygonGeometry = polygonFeature.feature.getGeometry();
            // 几何对象存在且可判断相交
            if (polygonGeometry && polygonGeometry.intersectsCoordinate) {
                if (polygonGeometry.intersectsCoordinate(markerPosition)) {
                    // 如果标记点在多边形内，返回多边形的 ID
                    return polygonFeature.feature.get('id');
                }
            }
        }
        return null;
    }

    /**
     * 保存的标记点
     */
    function saveMarkPoint() {
        WebBridge.postMessage({
                type: 'SAVE_MARK_POINT_RESULT',
                data: markPointMarkers || [],
        });
    }

    /**
     * 绘制异常标记点
     * @param {ol.Map} map
     * @param {markPoints,abnormalReport} data
     */

    function drawAbnormalMarkedPoints(map, data) {
        const { markPoints, abnormalReport } = data;
        if(!markPoints || !Array.isArray(markPoints) || markPoints.length === 0) {
            WebBridge.postError('无效的标记点数据');
            return;
        }
        for (let i = 0; i < markPoints.length; i++) {
            const point = markPoints[i];
            const feature = new ol.Feature({
                 geometry: new ol.geom.Point(ol.proj.fromLonLat([point.lon, point.lat]))
            });

            feature.setStyle(getAbnormalMarkMarkerStyle(0.5, abnormalReport.join('、')));

            const layer = new ol.layer.Vector({
                source: new ol.source.Vector({ features: [feature] }),
                zIndex: 111
            });

            map.addLayer(layer);
        }
    }
     
    
    /**
     * 获取异常标记样式
     */
    function getAbnormalMarkMarkerStyle(scale = 0.5, text = '') {
        return new ol.style.Style({
           image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: Base64Images.markPointMarkerJS,
                crossOrigin: 'anonymous',
                scale: scale,
                rotateWithView: true
           }),
           text: new ol.style.Text({
              text: text, 
              font: '16px sans-serif', 
              fill: new ol.style.Fill({ color: 'white' }),
              offsetY: -32, // 文字的垂直偏移量，负值让文字显示在标记点的上方
              padding: [5, 5, 5, 5], // 上、右、下、左的内边距，单位为像素
              backgroundFill: new ol.style.Fill({color: 'rgba(0, 0, 0, 0.5)'}),
            })
        });
    }

    return {
        toLocateSelf,
        drawCurrentLocation,
        updateCurrentLocation,
        updateMarkerRotation,
        drawDotMarker,
        removeDotMarker,
        removeAllDotMarkers,
        filterPointDot,
        savePolygonToNative,
        drawCommonPointMarker,
        removeCommonPointMarker,
        getCommonPointMarkers,
        removeFindPointMarkers,
        getFindPointMarkers,
        drawFindPointMarker,
        drawFindMarker,
        drawMarkPointMarker,
        removeMarkDotMarker,
        isMarkerInsidePolygons,
        saveMarkPoint,
        drawAbnormalMarkedPoints
    };
})();
