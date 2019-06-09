/**
 * Created by jintian on 2017/8/22.
 */
cBoard.service('chartChinaMapService', function ($state, $window) {
	this.render = function (containerDom, option, scope, persist, drill, relations, chartConfig) {
        var render = new CBoardEChartRender(containerDom, option);
        render.addClick(chartConfig, relations, $state, $window);
        return render.chart(null, persist);
    };

    this.parseOption = function (data) {
    	var option;
    	  $.ajax({
              type: "get",
              url: "plugins/FineMap/mapdata/china.json",
              async: false,
              success:function(chinajson){
            	echarts.registerMap('china', chinajson);
          	    option = {
          	        title: {
          	            text: 'USA Population Estimates (2012)',
          	            subtext: 'Data from www.census.gov',
          	            sublink: 'http://www.census.gov/popest/data/datasets.html',
          	            left: 'right'
          	        },
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
          	            min: 500000,
          	            max: 38000000,
          	            inRange: {
          	                color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
          	            },
          	            text:['High','Low'],           // 文本，默认为数值文本
          	            calculable: true
          	        },
          	        toolbox: {
          	            show: true,
          	            //orient: 'vertical',
          	            left: 'left',
          	            top: 'top',
          	            feature: {
          	                dataView: {readOnly: false},
          	                restore: {},
          	                saveAsImage: {}
          	            }
          	        },
          	        series: [
          	            {
          	                name: 'USA PopEstimates',
          	                type: 'map',
          	                roam: true,
          	                map: 'china',
          	                itemStyle:{
          	                    emphasis:{label:{show:true}}
          	                },
          	                // 文本位置修正
          	                textFixed: {
          	                    Alaska: [20, -20]
          	                },
          	                data: [{name: '吉林省', value: 4822023}]
          	            }
          	        ]
          	    };
              }
    	  })
    	  console.log(option)
    	return option;
    }
});
