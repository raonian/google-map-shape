
/**
 * 读取shapefile数据写入结果列表
 * @method setShapeDatas
 * @param {Object} shapefile shp解析器, {String} url shp文件, {Array} shapeDatas 数据列表, {Function} callback 回调函数
 * @return 
 */
function setShapeDatas(shapefile, url, shapeDatas, callback) {
    shapefile.openShp(url)
        .then(source => source.read()
            .then(function log(result) {
                if (result.done) {
                    callback();
                    return;
                }
                // 读取图形数据，存放在shapeDatas
                shapeDatas.push(result.value);

                return source.read().then(log);
            }))
        .catch(error => console.log(error));
}

/**
 * 根据路径paths，在地图上绘制图形
 * @method addPolygonToMap
 * @param {Class} Polygon 图形类, {Array} paths 图形路径, {Object} map 地图实例, {Object} options 图形样式配置
 * @return 
 */
function addPolygonToMap(Polygon, paths, map, options = {}) {
    const polygon = new Polygon({
        paths,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.3,
        ...options,
    });

    polygon.setMap(map);

}

/**
 * 根据shapeDatas类型，获取图形paths, 然后将图形添加到map
 * @method drawPolygons
 * @param {Array} shapeDatas 数据列表, {Class} Polygon 图形类, {Object} map 地图实例
 * @return 
 */
function drawPolygons(shapeDatas, Polygon, map) {
    shapeDatas.map(shape => {
        if (shape.type === 'Polygon') {
            const coords = shape.coordinates[0];
            const paths = coords.map(c => ({ lat: c[1], lng: c[0]}));

            addPolygonToMap(Polygon, paths, map);
                                        
        } else if(shape.type === 'MultiPolygon') {
            shape.coordinates.map(coords => {
                const paths = coords[0].map(c => ({ lat: c[1], lng: c[0]}));

                addPolygonToMap(Polygon, paths, map);
            });
        } else {
           // TODO others type
        }
        
    });
}

/**
 * 渲染主流程
 * @method initMap
 * @param
 * @return 
 */
function initMap() {
    const shapeDatas = [];
    const mapOptions = {
         zoom: 4,
         center: { lat: -25.0568048, lng: 132.6753601 }
    };

    // 读取shapefile数据为异步处理，所以需要将绘制地图的方法作为回调函数
    setShapeDatas(shapefile, './AUS_zone.shp', shapeDatas, drawMap);


    function drawMap() {
        // 初始化map
        const map = new google.maps.Map(
            document.getElementById("map"),
            mapOptions,
        );

        // 绘制图形
        drawPolygons(shapeDatas, google.maps.Polygon, map);
        
    }

}
