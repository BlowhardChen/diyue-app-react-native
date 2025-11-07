// 标记点模块
window.MarkerModule = (function () {
    let selfMarkerLayer;                 // 当前设备点位图层
    let dotMarkers = [];                 // 地图打点图层数组
    let dotMarkerCoordinates = [];       // 打点经纬度数组（[{lon,lat}, ...]）
    let commonPointMarkers = [];        // 公共点标准数组

    /**
     * 绘制地图打点（核心）
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
    function getDotMarkerStyle() {
        return new ol.style.Style({
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
            PolygonModule.removePolygon(map);
            WebBridge.postMessage({ type: 'WEBVIEW_UPDATE_DOT_TOTAL',total: dotMarkerCoordinates.length, message: total === 0 ? '请点击打点按钮打点' : '请继续添加下一个点位' });
            return;
        }

        if (total === 2) {
            PolygonModule.removePolygon(map);
            PolylineModule.removeAllPolylines(map);
            PolylineModule.drawPolyline(map, coordsLonLat[0], coordsLonLat[1]);
            WebBridge.postMessage({ type: 'WEBVIEW_UPDATE_DOT_TOTAL',total: dotMarkerCoordinates.length, message: '已生成线段，请继续添加下一个点位' });
            return;
        }   

        // 3 个及以上：清除折线，绘制多边形（自动闭合）
        PolylineModule.removeAllPolylines(map);
        PolygonModule.removePolygon(map);

        // 判断多边形是否相交
        const path = dotMarkerCoordinates.concat([dotMarkerCoordinates[0]])
        const isPolygonIntersect = isPolygonSelfIntersecting(path)
        WebBridge.postMessage({ 
            type: 'WEBVIEW_POLYGON_INTERSECT',
            isPolygonIntersect,
            message: isPolygonIntersect ? '生成的地块区域自相交，请检查点位顺序' : '' // 自相交时才带提示文本
        });

        const polygonResult = PolygonModule.drawPolygon(map, coordsLonLat);
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
            updateCurrentLocation(location, map);
        }
        map.getView().animate({
            center: ol.proj.fromLonLat([location.lon, location.lat]),
            zoom: 17,
            duration: 500
        });
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

    /**
     * 更新当前位置
     * @param {*} location 位置
     * @param {*} map 地图
     * @returns 
     */
    function updateCurrentLocation(location, map) {
        const features = selfMarkerLayer?.getSource()?.getFeatures();
        if (!features || features.length === 0) {
            drawCurrentLocation(map, location);
            return;
        }
        const geom = features[0].getGeometry();
        geom.setCoordinates(ol.proj.fromLonLat([location.lon, location.lat]));
        map.renderSync();
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
                        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAAAXNSR0IArs4c6QAAApJJREFUWEfNmDtoFEEYx3+DoDYWgoI2gopEwUpQfMTYSCxMqaCmNxEUbNTG0kYrQcFH7QtiqYVi4ztEkipgJIJgo2DAwsYIMu5/mX3Nrs7enRdm4OBuduab333P+dbQ4bCWjcAhYBDYBmwAVjkxP4DPwHvgFfDEGD51coRps9halgFHgdPAXqDVPsACb4DrwIQx/A6dFxRsLQeBa8DWkLDA8zngjDE8+9e6vwJZy0rgKnCyA42EmKWx28BZY/jZtLgRyFrWAo+Tz876Jm3ZDxxOXGQPsAVY7ZZ9B+YTF3vrtr90VqtJeScBxvDNf1IDcjAvmk10BLgEDIQ04Z5/AC4CD5vWy4RDPlQFyJlJMJ5mFFj3gN0tQfxlk8AJqAecNCWo3Hw+0E1grCrugPuHa7qEybYtANLwc1/OLWMYzyZzIBdNT6sOLBhNLe8RJtv+K8kCwz6UHH04i74UyOWZ2arfyExTSQrpVTP+f5Gmdvnmkz9tV57KgI4lnnq/ulWR0q3PhBQqn1KEVsZxY3iQASnN7ysey9YTIak9Plfir0Tf68Rsg8ZaNgEfC98Ro0pR29DulkspQaVQLpQOfdksIHn4jULsUFMkdHtqYJ+CRlkmH6cEdCdJr6PF3BXgXJ8AfLE660J58q6ApoEdxayIVRqWYqi0yCL5mBGQ6kkptr8A65aCBvgKrC+ftSAgpe0Vxaz3s69oi5BeKvKxGCVQdCaLzqm9sL8MnO+r51RTTD3so0uMcZWOtIjYtIeKo7g6oOiuH2oE47mgOS2pIYzjCpuFobXEc8l3WlJhiacNclDqWuNoFEuma9FKj7gmoKmV1iX+EfAfWukSVDwvG8qFLJrXMR5UPC+s/LLv2ib1w315pfcHfpD3xwJR4DUAAAAASUVORK5CYII=',
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
        getCommonPointMarkers
      
    };
})();
