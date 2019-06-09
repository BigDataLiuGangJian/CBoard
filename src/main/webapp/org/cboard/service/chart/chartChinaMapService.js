/**
 * Created by jintian on 2017/8/22.
 */
cBoard.service('chartChinaMapService', function () {
    this.render = function (containerDom, option, scope, persist,drill, relations, chartConfig) {
        if (option == null) {
            containerDom.html("<div class=\"alert alert-danger\" role=\"alert\">No Data!</div>");
            return;
        }
        var height;
        scope ? height = scope.myheight - 20 : null;
        return new CBoardHeatMapRender(containerDom, option).chart(height, persist);
    };

    this.parseOption = function (data) {
        var optionData = [];
        var seriesData = [];
        var data_keys = data.keys;
        var data_series = data.series;
        var chartConfig = data.chartConfig;
        var code = 'china';
        if (chartConfig.city && chartConfig.city.code) {
            code = chartConfig.city.code;
        } else if (chartConfig.province && chartConfig.province.code) {
            code = chartConfig.province.code;
        }

        var url;
        if (code == 'china') {
            url = 'plugins/FineMap/mapdata/china.json'
        } else if (code.length > 2) {
            url = 'plugins/FineMap/mapdata/geometryCouties/' + code + '.json';
        } else {
            url = 'plugins/FineMap/mapdata/geometryProvince/' + code + '.json';
        }

        var fromName;
        var fromN;
        var fromL;
        var toName;
        var toN;
        var toL;
        var max;
        var min;
        var j = 0;
        var maxScatter;
        for(var serieConfig in data.seriesConfig){

            var serieType = data.seriesConfig[serieConfig].type;
            

            //重置为null，防止脏数据
            fromName = null;
            fromN = null;
            fromL = null;
            if(data_series[j].length > 3){
                fromName = data_series[j][2];
                fromN = parseFloat(data_series[j][0]);
                fromL = parseFloat(data_series[j][1]);
            }else if(data_series[j].length == 3){
                fromName = data_series[j][1];
                fromN = parseFloat(data_series[j][0].split(",")[0]);
                fromL = parseFloat(data_series[j][0].split(",")[1]);
            }

            //根据不同的地图类型获取不同的series
            switch (serieType){
                case "markLine" :
                    var lineData = [];
                    if(fromN && fromL){
                        for(var i = 0; data_keys[0] && i < data_keys.length; i++){
                            toName = null;
                            toN = null;
                            toL = null;
                            if(data_keys[i].length > 2){
                                toName = data_keys[i][2];
                                toN = parseFloat(data_keys[i][0]);
                                toL = parseFloat(data_keys[i][1]);
                            }else if(data_keys[i].length == 2){
                                toName = data_keys[i][1];
                                toN = parseFloat(data_keys[i][0].split(",")[0]);
                                toL = parseFloat(data_keys[i][0].split(",")[1]);
                            }

                            if(data.data[j][i] && toN && toL){
                                lineData.push({fromName: fromName,
                                    toName: toName,
                                    coords: [[fromN,fromL],
                                        [toN, toL]]
                                });

                                if(max == null || max <= parseFloat(data.data[j][i])){
                                    max = parseFloat(data.data[j][i]) + 10;
                                }
                                if(min == null || min >= parseFloat(data.data[j][i])){
                                    min = parseFloat(data.data[j][i]) - 10;
                                }
                            }
                        }

                        if(lineData.length > 0){
                            seriesData.push(
                                {
                                    name:fromName,
                                    type: 'lines',
                                    coordinateSystem: 'geo',
                                    symbol: ['none', 'arrow'],
                                    symbolSize: 6,
                                    effect: {
                                        show: true,
                                        period: 6,
                                        trailLength: 0,
                                        symbol: 'arrow',
                                        symbolSize: 4
                                    },
                                    lineStyle: {
                                        normal: {
                                            width: 1,
                                            opacity: 0.6,
                                            curveness: 0.2
                                        }
                                    },
                                    data: lineData
                                }
                            );
                            optionData.push(fromName);
                        }
                    }
                    break;

                case "heat" :
                    var heatmapData = [];
                    for(var i = 0; data_keys[0] && i < data_keys.length; i++){
                        toName = null;
                        toN = null;
                        toL = null;
                        if(data_keys[i].length > 2){
                            toName = data_keys[i][2];
                            toN = parseFloat(data_keys[i][0]);
                            toL = parseFloat(data_keys[i][1]);
                        }else if(data_keys[i].length == 2){
                            toName = data_keys[i][1];
                            toN = parseFloat(data_keys[i][0].split(",")[0]);
                            toL = parseFloat(data_keys[i][0].split(",")[1]);
                        }
                        else{
                        	toName = data_keys[i][0];
                        }

                        if(data.data[j][i]){
                            //heatmapData.push([toN,toL,parseFloat(data.data[j][i])]);
                        	heatmapData.push({name:toName,value:parseFloat(data.data[j][i])});
                            if(max == null || max <= parseFloat(data.data[j][i])){
                                max = parseFloat(data.data[j][i]) + 10;
                            }
                            if(min == null || min >= parseFloat(data.data[j][i])){
                                min = parseFloat(data.data[j][i]) - 10;
                            }
                        }
                    }
                    if(heatmapData.length > 0){
                    	console.log(heatmapData)
                        seriesData.push(
                            {
//                                name: serieConfig,
//                                type: 'heatmap',
//                                mapType: code,
//                                coordinateSystem: 'geo',
//                                data: heatmapData
                                
                                name: serieConfig,
              	                type: 'map',
              	                roam: true,
              	                map: code,
              	                itemStyle:{
              	                    emphasis:{label:{show:true}}
              	                },
              	                // 文本位置修正
              	                textFixed: {
              	                    Alaska: [20, -20]
              	                },
              	                //data: [{name: '吉林省', value: 4822023}]
              	                data:heatmapData
                            }
                        );
                        optionData.push(serieConfig);
                    }
                    break;

                case "scatter" :
                    var scatterData = [];
                    for(var i = 0; data_keys[0] && i < data_keys.length; i++){
                        toName = null;
                        toN = null;
                        toL = null;
                        if(data_keys[i].length > 2){
                            toName = data_keys[i][2];
                            toN = parseFloat(data_keys[i][0]);
                            toL = parseFloat(data_keys[i][1]);
                        }else if(data_keys[i].length == 2){
                            toName = data_keys[i][1];
                            toN = parseFloat(data_keys[i][0].split(",")[0]);
                            toL = parseFloat(data_keys[i][0].split(",")[1]);
                        }

                        if(data.data[j][i]){
                            scatterData.push({
                                name:toName,
                                value:[toN,toL,parseFloat(data.data[j][i])]
                            });
                            if(maxScatter == null || maxScatter < parseFloat(data.data[j][i])){
                                maxScatter = parseFloat(data.data[j][i]);
                            }

                            if(max == null || max <= parseFloat(data.data[j][i])){
                                max = parseFloat(data.data[j][i]) + 10;
                                max = 1000;
                            }
                            if(min == null || min >= parseFloat(data.data[j][i])){
                                min = parseFloat(data.data[j][i]) - 10;
                                min = 0;
                            }
                        }
                    }

                    if(scatterData.length > 0){
                        seriesData.push(
                            {
                                name: serieConfig,
                                type: 'scatter',
                                coordinateSystem: 'geo',
                                data: scatterData,
                                //data:[{"name":"海门","value":[121.15,31.89,9]},{"name":"鄂尔多斯","value":[109.781327,39.608266,12]},{"name":"招远","value":[120.38,37.35,12]},{"name":"舟山","value":[122.207216,29.985295,12]},{"name":"齐齐哈尔","value":[123.97,47.33,14]},{"name":"盐城","value":[120.13,33.38,15]},{"name":"赤峰","value":[118.87,42.28,16]},{"name":"青岛","value":[120.33,36.07,18]},{"name":"乳山","value":[121.52,36.89,18]},{"name":"金昌","value":[102.188043,38.520089,19]},{"name":"泉州","value":[118.58,24.93,21]},{"name":"莱西","value":[120.53,36.86,21]},{"name":"日照","value":[119.46,35.42,21]},{"name":"胶南","value":[119.97,35.88,22]},{"name":"南通","value":[121.05,32.08,23]},{"name":"拉萨","value":[91.11,29.97,24]},{"name":"云浮","value":[112.02,22.93,24]},{"name":"梅州","value":[116.1,24.55,25]},{"name":"文登","value":[122.05,37.2,25]},{"name":"上海","value":[121.48,31.22,25]},{"name":"攀枝花","value":[101.718637,26.582347,25]},{"name":"威海","value":[122.1,37.5,25]},{"name":"承德","value":[117.93,40.97,25]},{"name":"厦门","value":[118.1,24.46,26]},{"name":"汕尾","value":[115.375279,22.786211,26]},{"name":"潮州","value":[116.63,23.68,26]},{"name":"丹东","value":[124.37,40.13,27]},{"name":"太仓","value":[121.1,31.45,27]},{"name":"曲靖","value":[103.79,25.51,27]},{"name":"烟台","value":[121.39,37.52,28]},{"name":"福州","value":[119.3,26.08,29]},{"name":"瓦房店","value":[121.979603,39.627114,30]},{"name":"即墨","value":[120.45,36.38,30]},{"name":"抚顺","value":[123.97,41.97,31]},{"name":"玉溪","value":[102.52,24.35,31]},{"name":"张家口","value":[114.87,40.82,31]},{"name":"阳泉","value":[113.57,37.85,31]},{"name":"莱州","value":[119.942327,37.177017,32]},{"name":"湖州","value":[120.1,30.86,32]},{"name":"汕头","value":[116.69,23.39,32]},{"name":"昆山","value":[120.95,31.39,33]},{"name":"宁波","value":[121.56,29.86,33]},{"name":"湛江","value":[110.359377,21.270708,33]},{"name":"揭阳","value":[116.35,23.55,34]},{"name":"荣成","value":[122.41,37.16,34]},{"name":"连云港","value":[119.16,34.59,35]},{"name":"葫芦岛","value":[120.836932,40.711052,35]},{"name":"常熟","value":[120.74,31.64,36]},{"name":"东莞","value":[113.75,23.04,36]},{"name":"河源","value":[114.68,23.73,36]},{"name":"淮安","value":[119.15,33.5,36]},{"name":"泰州","value":[119.9,32.49,36]},{"name":"南宁","value":[108.33,22.84,37]},{"name":"营口","value":[122.18,40.65,37]},{"name":"惠州","value":[114.4,23.09,37]},{"name":"江阴","value":[120.26,31.91,37]},{"name":"蓬莱","value":[120.75,37.8,37]},{"name":"韶关","value":[113.62,24.84,38]},{"name":"嘉峪关","value":[98.289152,39.77313,38]},{"name":"广州","value":[113.23,23.16,38]},{"name":"延安","value":[109.47,36.6,38]},{"name":"太原","value":[112.53,37.87,39]},{"name":"清远","value":[113.01,23.7,39]},{"name":"中山","value":[113.38,22.52,39]},{"name":"昆明","value":[102.73,25.04,39]},{"name":"寿光","value":[118.73,36.86,40]},{"name":"盘锦","value":[122.070714,41.119997,40]},{"name":"长治","value":[113.08,36.18,41]},{"name":"深圳","value":[114.07,22.62,41]},{"name":"珠海","value":[113.52,22.3,42]},{"name":"宿迁","value":[118.3,33.96,43]},{"name":"咸阳","value":[108.72,34.36,43]},{"name":"铜川","value":[109.11,35.09,44]},{"name":"平度","value":[119.97,36.77,44]},{"name":"佛山","value":[113.11,23.05,44]},{"name":"海口","value":[110.35,20.02,44]},{"name":"江门","value":[113.06,22.61,45]},{"name":"章丘","value":[117.53,36.72,45]},{"name":"肇庆","value":[112.44,23.05,46]},{"name":"大连","value":[121.62,38.92,47]},{"name":"临汾","value":[111.5,36.08,47]},{"name":"吴江","value":[120.63,31.16,47]},{"name":"石嘴山","value":[106.39,39.04,49]},{"name":"沈阳","value":[123.38,41.8,50]},{"name":"苏州","value":[120.62,31.32,50]},{"name":"茂名","value":[110.88,21.68,50]},{"name":"嘉兴","value":[120.76,30.77,51]},{"name":"长春","value":[125.35,43.88,51]},{"name":"胶州","value":[120.03336,36.264622,52]},{"name":"银川","value":[106.27,38.47,52]},{"name":"张家港","value":[120.555821,31.875428,52]},{"name":"三门峡","value":[111.19,34.76,53]},{"name":"锦州","value":[121.15,41.13,54]},{"name":"南昌","value":[115.89,28.68,54]},{"name":"柳州","value":[109.4,24.33,54]},{"name":"三亚","value":[109.511909,18.252847,54]},{"name":"自贡","value":[104.778442,29.33903,56]},{"name":"吉林","value":[126.57,43.87,56]},{"name":"阳江","value":[111.95,21.85,57]},{"name":"泸州","value":[105.39,28.91,57]},{"name":"西宁","value":[101.74,36.56,57]},{"name":"宜宾","value":[104.56,29.77,58]},{"name":"呼和浩特","value":[111.65,40.82,58]},{"name":"成都","value":[104.06,30.67,58]},{"name":"大同","value":[113.3,40.12,58]},{"name":"镇江","value":[119.44,32.2,59]},{"name":"桂林","value":[110.28,25.29,59]},{"name":"张家界","value":[110.479191,29.117096,59]},{"name":"宜兴","value":[119.82,31.36,59]},{"name":"北海","value":[109.12,21.49,60]},{"name":"西安","value":[108.95,34.27,61]},{"name":"金坛","value":[119.56,31.74,62]},{"name":"东营","value":[118.49,37.46,62]},{"name":"牡丹江","value":[129.58,44.6,63]},{"name":"遵义","value":[106.9,27.7,63]},{"name":"绍兴","value":[120.58,30.01,63]},{"name":"扬州","value":[119.42,32.39,64]},{"name":"常州","value":[119.95,31.79,64]},{"name":"潍坊","value":[119.1,36.62,65]},{"name":"重庆","value":[106.54,29.59,66]},{"name":"台州","value":[121.420757,28.656386,67]},{"name":"南京","value":[118.78,32.04,67]},{"name":"滨州","value":[118.03,37.36,70]},{"name":"贵阳","value":[106.71,26.57,71]},{"name":"无锡","value":[120.29,31.59,71]},{"name":"本溪","value":[123.73,41.3,71]},{"name":"克拉玛依","value":[84.77,45.59,72]},{"name":"渭南","value":[109.5,34.52,72]},{"name":"马鞍山","value":[118.48,31.56,72]},{"name":"宝鸡","value":[107.15,34.38,72]},{"name":"焦作","value":[113.21,35.24,75]},{"name":"句容","value":[119.16,31.95,75]},{"name":"北京","value":[116.46,39.92,79]},{"name":"徐州","value":[117.2,34.26,79]},{"name":"衡水","value":[115.72,37.72,80]},{"name":"包头","value":[110,40.58,80]},{"name":"绵阳","value":[104.73,31.48,80]},{"name":"乌鲁木齐","value":[87.68,43.77,84]},{"name":"枣庄","value":[117.57,34.86,84]},{"name":"杭州","value":[120.19,30.26,84]},{"name":"淄博","value":[118.05,36.78,85]},{"name":"鞍山","value":[122.85,41.12,86]},{"name":"溧阳","value":[119.48,31.43,86]},{"name":"库尔勒","value":[86.06,41.68,86]},{"name":"安阳","value":[114.35,36.1,90]},{"name":"开封","value":[114.35,34.79,90]},{"name":"济南","value":[117,36.65,92]},{"name":"德阳","value":[104.37,31.13,93]},{"name":"温州","value":[120.65,28.01,95]},{"name":"九江","value":[115.97,29.71,96]},{"name":"邯郸","value":[114.47,36.6,98]},{"name":"临安","value":[119.72,30.23,99]},{"name":"兰州","value":[103.73,36.03,99]},{"name":"沧州","value":[116.83,38.33,100]},{"name":"临沂","value":[118.35,35.05,103]},{"name":"南充","value":[106.110698,30.837793,104]},{"name":"天津","value":[117.2,39.13,105]},{"name":"富阳","value":[119.95,30.07,106]},{"name":"泰安","value":[117.13,36.18,112]},{"name":"诸暨","value":[120.23,29.71,112]},{"name":"郑州","value":[113.65,34.76,113]},{"name":"哈尔滨","value":[126.63,45.75,114]},{"name":"聊城","value":[115.97,36.45,116]},{"name":"芜湖","value":[118.38,31.33,117]},{"name":"唐山","value":[118.02,39.63,119]},{"name":"平顶山","value":[113.29,33.75,119]},{"name":"邢台","value":[114.48,37.05,119]},{"name":"德州","value":[116.29,37.45,120]},{"name":"济宁","value":[116.59,35.38,120]},{"name":"荆州","value":[112.239741,30.335165,127]},{"name":"宜昌","value":[111.3,30.7,130]},{"name":"义乌","value":[120.06,29.32,132]},{"name":"丽水","value":[119.92,28.45,133]},{"name":"洛阳","value":[112.44,34.7,134]},{"name":"秦皇岛","value":[119.57,39.95,136]},{"name":"株洲","value":[113.16,27.83,143]},{"name":"石家庄","value":[114.48,38.03,147]},{"name":"莱芜","value":[117.67,36.19,148]},{"name":"常德","value":[111.69,29.05,152]},{"name":"保定","value":[115.48,38.85,153]},{"name":"湘潭","value":[112.91,27.87,154]},{"name":"金华","value":[119.64,29.12,157]},{"name":"岳阳","value":[113.09,29.37,169]},{"name":"长沙","value":[113,28.21,175]},{"name":"衢州","value":[118.88,28.97,177]},{"name":"廊坊","value":[116.7,39.53,193]},{"name":"菏泽","value":[115.480656,35.23375,194]},{"name":"合肥","value":[117.27,31.86,229]},{"name":"武汉","value":[114.31,30.52,273]},{"name":"大庆","value":[125.03,46.58,279]}],
                                symbolSize : function (val) {
                                	return 10;
                                    //return val[2] * 30 / maxScatter;
                                },
                                label: {
                                    normal: {
                                        formatter: '{b}',
                                        position: 'right',
                                        show: false
                                    },
                                    emphasis: {
                                        show: true
                                    }
                                }
                            }
                        );
                        optionData.push(serieConfig);
                    }
            }
            j++;
        }

        var mapOption;

        $.ajax({
            type: "get",
            url: url,
            async: false,
            //type:'json',
            success: function (cityJson) {
            	echarts.registerMap(code, cityJson);
            	switch(serieType){
            		case "scatter" :
            			mapOption = {
                            legend: {
                                orient: 'vertical',
                                top: 'top',
                                left: 'left',
                                selectedMode: 'multiple',
                                data: optionData,
                                show:false
                            },
                            visualMap: {
                                min: min,
                                max: max,
                                left: 'right',
                                top: 'bottom',
                                //text: ['High', 'Low'],
                                inRange: {
                                    color: ['#d94e5d','#eac736','#50a3ba'].reverse()
                                },
                                calculable : true,
                                textStyle: {
                                    color: '#d94e5d'
                                }
                            },
                            geo: {
                                map: code,
                                label: {
                                    emphasis: {
                                        show: false
                                    }
                                },
                                itemStyle: {
                                    normal: {
                                        areaColor: '#EFF0F0',
                                        borderColor: '#B5B5B5',
                                        borderWidth: 1
                                    }
                                }
                            },
                            tooltip: {
                                trigger: 'item'
                            },
                            series:seriesData
                        };
            			break;
            		case "heat" :
            			mapOption = {
                  	        tooltip: {
                  	            trigger: 'item',
                  	            showDelay: 0,
                  	            transitionDuration: 0.2,
                  	            formatter: function (params) {
                  	                var value = (params.value + '').split('.');
                  	                value = value[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,');
                  	                return params.seriesName + '<br/>' + params.name + ': ' + value;
                  	            }
                  	        },
                  	        visualMap: {
                  	            left: 'right',
                  	            min: min,
                  	            max: max,
                  	            inRange: {
                  	                color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
                  	            },
                  	            text:['High','Low'],           // 文本，默认为数值文本
                  	            calculable: true
                  	        },
                  	        toolbox: {
                  	            show: true,
                  	            //orient: 'vertical',
                  	            left: 'right',
                  	            top: 'top',
                  	            feature: {
                  	                dataView: {readOnly: false},
                  	                restore: {},
                  	                saveAsImage: {}
                  	            }
                  	        },
                  	        series: seriesData
                  	    };
            			break;
            	}
                
            }
        });

        return mapOption;
    };

});
