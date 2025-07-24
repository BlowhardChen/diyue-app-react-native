window.TransformModule = (function () {
    /**
     * WGS84 转 GCJ02（火星坐标系）
     * @param {number} lon - 经度
     * @param {number} lat - 纬度
     * @returns {[number, number]} - [经度, 纬度]
     */
    function wgs84ToGcj02(lon, lat) {
        if (outOfChina(lon, lat)) return [lon, lat];
        
        let dLat = transformLat(lon - 105.0, lat - 35.0);
        let dLon = transformLon(lon - 105.0, lat - 35.0);
        
        const radLat = lat / 180.0 * Math.PI;
        let magic = Math.sin(radLat);
        magic = 1 - 0.00669342162296594323 * magic * magic;
        const sqrtMagic = Math.sqrt(magic);
        
        dLat = (dLat * 180.0) / ((6335552.717000426 * (1 - 0.00669342162296594323)) / (magic * sqrtMagic) * Math.PI);
        dLon = (dLon * 180.0) / (6378245.0 / sqrtMagic * Math.cos(radLat) * Math.PI);
        
        return [lon + dLon, lat + dLat];
    }

    /**
     * GCJ02（火星坐标系）转 WGS84
     * @param {number} lon - 经度
     * @param {number} lat - 纬度
     * @returns {[number, number]} - [经度, 纬度]
     */
    function gcj02ToWgs84(lon, lat) {
        if (outOfChina(lon, lat)) return [lon, lat];
        
        // 第一次近似计算
        let [mgLon, mgLat] = wgs84ToGcj02(lon, lat);
        let deltaLon = mgLon - lon;
        let deltaLat = mgLat - lat;
        
        // 第二次迭代修正
        [mgLon, mgLat] = wgs84ToGcj02(lon - deltaLon, lat - deltaLat);
        deltaLon = mgLon - lon;
        deltaLat = mgLat - lat;
        
        // 最终结果
        return [lon * 2 - mgLon, lat * 2 - mgLat];
    }

    /**
     * 检查坐标是否在中国境外
     */
    function outOfChina(lon, lat) {
        return lon < 72.004 || lon > 137.8347 || lat < 0.8293 || lat > 55.8271;
    }

    /**
     * 纬度转换计算
     */
    function transformLat(x, y) {
        return -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 
            0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x)) + 
            (20.0 * Math.sin(6.0 * x * Math.PI) + 
             20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0 + 
            (20.0 * Math.sin(y * Math.PI) + 
             40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0 + 
            (160.0 * Math.sin(y / 12.0 * Math.PI) + 
             320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
    }

    /**
     * 经度转换计算
     */
    function transformLon(x, y) {
        return 300.0 + x + 2.0 * y + 0.1 * x * x + 
            0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x)) + 
            (20.0 * Math.sin(6.0 * x * Math.PI) + 
             20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0 + 
            (20.0 * Math.sin(x * Math.PI) + 
             40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0 + 
            (150.0 * Math.sin(x / 12.0 * Math.PI) + 
             300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
    }

    return {
        wgs84ToGcj02,
        gcj02ToWgs84,
        outOfChina
    };
})();