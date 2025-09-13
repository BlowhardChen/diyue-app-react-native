// 图层切换模块
window.SwitchMapLayer = (function () {
    let currentLayers = [];
    let tdAnnotationLayer = null; // 单独保存天地图标注图层引用

    /**
     * 初始化天地图标注图层（单例）
     */
    function getTdAnnotationLayer() {
        if (!tdAnnotationLayer) {
            tdAnnotationLayer = LayerModule.createTDAnnotationMapLayer();
        }
        return tdAnnotationLayer;
    }

    /**
     * 切换地图图层
     * @param {*} map 地图实例
     * @param {*} layerType 图层类型
     * @param {*} customUrl 自定义图层URL
     */
    function switchMapLayer(map, layerType, customUrl) {
        let layersToLoad = [];
        
        switch (layerType) {
            case 'TIANDITU_SAT': 
                // 卫星地图也添加标注层
                layersToLoad = [
                    LayerModule.createTdSatelliteMapLayer(),
                    getTdAnnotationLayer() // 添加天地图标注图层
                ]; 
                break;
            case 'TIANDITU_ELEC': 
                // 电子地图需要添加标注层
                layersToLoad = [
                    LayerModule.createTdElectronMapLayer(),
                    getTdAnnotationLayer() // 添加天地图标注图层
                ]; 
                break;
            case 'CUSTOM': 
                if (customUrl) {
                    layersToLoad = [
                        LayerModule.createCustomLayer(customUrl),
                        getTdAnnotationLayer() // 添加天地图标注图层 
                    ];
                } 
                break;
            default: 
                WebBridge.postError(`未知图层类型: ${layerType}`); 
                return;
        }
        
        switchBaseLayers(map, layersToLoad);
    }

    /**
     * 切换基础地图图层
     * @param {*} map 地图实例
     * @param {*} newLayers 新图层数组
     */
    function switchBaseLayers(map, newLayers) {
        // 检查新图层中是否包含标注图层
        const hasAnnotation = newLayers.includes(tdAnnotationLayer);
        
        // 保存当前标注图层的状态（如果存在）
        let annotationWasPresent = false;
        if (tdAnnotationLayer && map.getLayers().getArray().includes(tdAnnotationLayer)) {
            annotationWasPresent = true;
        }

        // 移除所有当前图层
        currentLayers.forEach(layer => {
            map.removeLayer(layer);
        });

        // 添加新图层
        newLayers.forEach(layer => {
            map.addLayer(layer);
        });

        // 特殊处理标注图层 - 确保天地图类型下标注图层被正确添加
        if (hasAnnotation && !map.getLayers().getArray().includes(tdAnnotationLayer)) {
            map.addLayer(tdAnnotationLayer);
        }

        currentLayers = newLayers;
    }


    return {getTdAnnotationLayer, switchMapLayer, switchBaseLayers };
})();
    