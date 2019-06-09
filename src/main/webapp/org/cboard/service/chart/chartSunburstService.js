/**
 * Created by Junjie.M on 2017/07/21.
 */
'use strict';
cBoard.service('chartSunburstService', function ($state, $window) {

    this.render = function (containerDom, option, scope, persist, drill, relations, chartConfig) {
        if (option == null) {
            containerDom.html("<div class=\"alert alert-danger\" role=\"alert\">No Data!</div>");
            return;
        }
        var height;
        scope ? height = scope.myheight - 20 : null;
        var render = new CBoardEChartRender(containerDom, option);
        render.addClick(chartConfig, relations, $state, $window);
        return render.chart(height, persist);
    };

    this.parseOption = function (data) {

        var config = data.chartConfig;

        var style = config.values[0].style ? config.values[0].style : "random";
        if (style != "random" && style != "multi") option.color = [style];

        var depth = data.chartConfig.keys.length;
        var keys = data.keys;
        var values = data.data;
        var mydata ;
        for (var i in keys) keys[i].reverse();
        var datas = recursion(depth, depth, "", keys, values, style);
        if (style != "random" && style != "multi") {
            mydata = [
                {
                    value: 1000,
                    children: datas
                }
            ];
        } else {
            mydata = datas;
        }
        var option = {
        		visualMap: {
        	        type: 'continuous',
        	        min: 0,
        	        max: 100000,
        	        inRange: {
        	            color: ['#2D5F73', '#538EA6', '#F2D1B3', '#F2B8A2', '#F28C8C']
        	        }
        	    },
                series: {
                	type: 'sunburst',
                    data: mydata,
                    radius: [0, '90%'],
                    label: {
                        rotate: 'radial'
                    }
                }
            };
        return option;
    };

    /**
     * 递归
     */
    function recursion(depth, totalDepth, prefix, keys, values, style) {
        var map = getMap(depth, totalDepth, prefix, keys, values);
        var data = [];
        if (depth == totalDepth) {
            for (var k in map) {
                var obj = {
                    name: map[k].arr[depth - 1],
                    value: map[k].val,
                    children: recursion(depth - 1, totalDepth, map[k].key, keys, values)
                };
                if (style == "random") obj.itemStyle = createRandomItemStyle();
                data.push(obj);
            }
        } else if (depth > 1) {
            for (var k in map) {
                data.push({
                    name: map[k].arr[depth - 1],
                    value: map[k].val,
                    children: recursion(depth - 1, totalDepth, map[k].key, keys, values)
                });
            }
        } else if (depth == 1) {
            for (var k in map) {
                data.push({
                    name: map[k].arr[depth - 1],
                    value: map[k].val
                });
            }
        }
        return data;
    }

    function getMap(depth, totalDepth, prefix, keys, values) {
        var map = {};
        for (var i in keys) {
            var key = keys[i][depth - 1];
            if (totalDepth > depth) {
                var prefixs = "";
                for (var j = totalDepth; j > depth; j--) {
                    if (j == totalDepth)
                        prefixs = keys[i][j - 1];
                    else
                        prefixs = prefixs + "-" + keys[i][j - 1];
                }
                if (prefix != prefixs) continue;
                key = prefix + "-" + key;
            }
            var val = isNaN(values[0][i]) ? 0 : parseFloat(values[0][i]);
            if (map[key] == undefined) {
                map[key] = {key: key, val: val, arr: keys[i]};
            } else {
                map[key] = {key: key, val: map[key].val + val, arr: keys[i]};
            }
        }
        return map;
    }


    function createRandomItemStyle() {
        return {
            normal: {
                color: 'rgb(' + [
                    Math.round(Math.random() * 160),
                    Math.round(Math.random() * 160),
                    Math.round(Math.random() * 160)
                ].join(',') + ')'
            }
        };
    }

});
