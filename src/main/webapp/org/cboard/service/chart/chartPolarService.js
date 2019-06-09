/**
 * Created by yfyuan on 2016/10/28.
 */
'use strict';
cBoard.service('chartPolarService', function ($state, $window) {

    this.render = function (containerDom, option, scope, persist, drill, relations, chartConfig) {
        var render = new CBoardEChartRender(containerDom, option);
        render.addClick(chartConfig, relations, $state, $window);
        return render.chart(null, persist);
    };

    this.parseOption = function (data) {
    	var series_xdata = data.data[0];
    	var series_xdata = [],series_ydata = [],legend = [],series_data=[];
    	_.chain(data.series).forEach(function(key,i){
    		legend.push(key.join('-'));
    	})
    	_.chain(data.data).forEach(function(key,i){
    		series_xdata.push({
    			coordinateSystem: 'polar',
                name: legend[i],
                type: 'line',
                data: data.data[i]
    		})
    	})
    	_.chain(data.keys).forEach(function(key,i){
    		series_ydata.push(key.join('-'));
    	})
//    	series_data = [];
//    	for (var i = 0; i <= 100; i++) {
//    	    var theta = i / 100 * 360;
//    	    var r = 5 * (1 + Math.sin(theta / 180 * Math.PI));
//    	    series_data.push([r, theta]);
//    	}
    	//legend = ["line"];
    	var echartOption = {

            legend: {
                data: legend
            },
            polar: {
                center: ['50%', '54%']
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                }
            },
            angleAxis: {
                type: 'category',
//                startAngle: 0
                data:series_ydata,
                boundaryGap:false
            },
            radiusAxis: {
                min: 0
            },
            series: series_xdata,
            animationDuration: 2000
        };

        return echartOption;
    }
});
