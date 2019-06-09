/**
 * Created by yfyuan on 2016/10/28.
 */
'use strict';
cBoard.service('chartParallelService', function ($state, $window) {

    this.render = function (containerDom, option, scope, persist, drill, relations, chartConfig) {
        var render = new CBoardEChartRender(containerDom, option);
        render.addClick(chartConfig, relations, $state, $window);
        return render.chart(null, persist);
    };

    this.parseOption = function (data) {
//    	data.data = [
//            [12.99,  82, 'bad'],
//            [9.99,  77, 'OK'],
//            [120, 60, 'good']
//        ]
    	var child = [];
    	_.chain(data.data).forEach(function(key,i){
    		_.chain(key).forEach(function(data,i){
    			if(!data){
    				key[i] = 0;
    			}
    			else{
    				if(isNaN(key[i])&&i==key.length-1){
    					child.push(data);
    				}
    			}
    		})
    	})
    	var series_xdata = data.data[0];
    	var series_xdata = [],series_ydata = [],legend = [],series_data=[];
    	_.chain(data.series).forEach(function(key,i){
    		legend.push(key.join('-'));
    	})
    	series_xdata = {
    			type: 'parallel',
    		        lineStyle: {
    		            width: 0.5
		        },
		        data: data.data
    		}
    	_.chain(data.keys).forEach(function(key,i){
    		if(child.length&&i==data.keys.length-1){
    			series_ydata.push({
        			name:key.join('-'),
        			dim:i,
        			type: 'category',
        			data:child
        		});
    		}
    		else{
    			series_ydata.push({
        			name:key.join('-'),
        			dim:i
        		});
    		}
    	})
    	var echartOption = {
            toolbox: {
                feature: {
                    brush: {
                        type: ['lineX', 'clear']
                    }
                }
            },
            parallelAxis: series_ydata,
            series: series_xdata,
        };

        return echartOption;
    }
});
