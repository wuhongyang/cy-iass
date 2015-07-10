define(['TM','echarts','eChartTheme',
	'echarts/chart/line',
	'echarts/chart/bar',
	'echarts/chart/pie'
	// 使用柱状图就加载bar模块，按需加载
],function(TM,ec,theme){
	var $ = window.jQuery;
	//$(".knob").knob();
	var Ctrl = {
		init: function(){
			Messenger.options = {
				    extraClasses: 'messenger-fixed messenger-on-top',
				    theme: 'flat'
				};
			
			Ctrl.getHosts().done(function(response){
				Ctrl.renderHostList(response);
				Ctrl.renderMainCharts(response, "instances_count", theme);
			}).fail(function(xhr){
				
				Messenger().post({
				  	message: '获取主机列表：' + xhr.status + ' / ' + xhr.statusText,
				  	type: 'error',
				  	showCloseButton: true
				});
			});
		},
		getHosts:function(){
			return $.get(DATASERVER + '/vmware/host/');
		},
		renderHostList: function(data){
		    $('#host-list').html(TM.renderTplById('hostListTemplate',{hosts:data}));
		},
		renderMainCharts : function(data, name, theme){
			var echart = ec.init(document.getElementById("host-"+ name), theme);
			var hostname = new Array();
			var value = new Array();
			if(data.length == 0)
				return;
			for(var i =0; i < data.length; i++){
				hostname.push(data[i]["host_name"]);
				value.push(data[i][name]);
			}

			option = {
			    tooltip : {
			        trigger: 'axis'
			    },
			    grid:{
			    	x:20,
			    	x2:30,
			    	y:10,
			    	y2:30,
			    	borderWidth:0
			    },
			    calculable : true,
			    yAxis : [
					{
						axisTick :{
							show:false
						},
						axisLabel:{
							show:false
						},
						splitLine: {
							show: false,
						},
						axisLine: { // 轴线
							show: true,
							lineStyle: {
								width: 1
							}
						},
						type : 'value',
						boundaryGap : [0, 0.01]
					}
			    ],
			    xAxis : [
			        {
			        	axisTick:{
			        		show:false
			        	},
			        	axisLabel:{
			        		show:true
			        	},
			        	splitLine: {
							show: false,
						},
						axisLine: { // 轴线
							show: true,
							lineStyle: {
								width: 1
							}
						},
			            type : 'category',
			            data : hostname
			        }
			    ],
			    series : [
			        {
			            name:'',
			            type:'bar',
			            data: value,
						itemStyle: {
							normal: {
								barBorderWidth: 4,
								barBorderRadius: 0,
								label: {
									show: true,
									position: 'inside'
								}
							}
						}
			        }
			    ]
			};
			// 为echarts对象加载数据
			echart.setOption(option);

		}
	}
	return Ctrl;
})