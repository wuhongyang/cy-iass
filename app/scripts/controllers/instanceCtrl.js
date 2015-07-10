define(['TM','echarts','eChartTheme',
	'echarts/chart/line',
	'echarts/chart/pie'
	// 使用柱状图就加载bar模块，按需加载
],function(TM,ec,theme){
	//$(".knob").knob();
	var Ctrl = {
		init: function(){
			Messenger.options = {
				    extraClasses: 'messenger-fixed messenger-on-top',
				    theme: 'flat'
				}

			Ctrl.fixip = Ctrl.getParam("fixip");

			if(!Ctrl.fixip){
				Messenger().post({
				  	message: '没有云主机数据！',
				  	type:'error',
				  	showCloseButton: true
				});
				return false;
			}
			Ctrl.getInstanceInfo().done(function(response){
				Ctrl.renderInstanceInfo(response);
			});
			Ctrl.metricUrl = DATASERVER + "/data/instance/" + Ctrl.fixip + "/metrics/?metric=";
			Ctrl.refreshChart("hour");
			Ctrl.bindEvent();
		},
		formatErrorMsg : function(label,status,statusText){
			return  '' + label + Ctrl.fixip + ' / ' + status + ' / ' + statusText
		},
		getParam:function(name)
		{
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if (r!=null)
				return (r[2]);
			return null;
		},
		bindEvent: function(){
			$(".refresh").click(function(){
				Ctrl.refreshChart($(this).attr("name"));
			});
		},
		refreshChart:function(period){
			$(".chart").each(function(){
				var $dom = $(this);
				var name = $dom.attr("name");
				Ctrl.ajax(Ctrl.metricUrl + name  + "&period=1" + period, {name:name, theme:theme});
			});
		},
		getInstanceInfo :function() {
			return $.get(DATASERVER + "/data/instance/" + Ctrl.fixip + '/').fail(function(xhr){
				Messenger().post({
				  	message: Ctrl.formatErrorMsg('获取云主机信息: ',xhr.status ,xhr.statusText),
				  	type:'error',
				  	showCloseButton: true
				});
			});
		},
		renderInstanceInfo : function(data){
			if(data){
				$('#instance-info').html(TM.renderTplById('instanceInfoTemplate',{instance:data}));
			}
		},
		ajax:function(url,config){
			$.ajax({url:url
				,async: false
			}).done(Ctrl.renderMainCharts.bind(config))
				.fail(function(result) {
					//alert(result);
				});
		},
		renderMainCharts : function(data){
			// 基于准备好的dom，初始化echarts图表
			var echart = ec.init(document.getElementById("instance-"+this.name), this.theme);

			option = {
				tooltip: {
					trigger: 'axis'
				},
				grid: {
					y: 20,
					y2: 10,
					x:40,
					x2:20,
					borderWidth:0
					//borderColor:"#ff0000"
				},
				
				calculable: true,
				xAxis: [{
					axisTick :{show:false},
					axisLabel : {
						show:false
					},
					splitLine: {
						show: false
					},
					axisLine: { // 轴线
						show: true,
						lineStyle: {
							width: 1
						}
					},
					type: 'category',
					boundaryGap: false,
					data: data.time
				}],
				yAxis: [{
					splitLine: {
						show: false
					},
					axisLine: { // 轴线
						show: true,
						lineStyle: {
							width: 1
						}
					},
					type: 'value'
				}],
				series: [{
					name: '',
					type: 'line',
					//smooth: true,
					itemStyle: {
						normal: {
							areaStyle: {
								type: 'default'
							}
						}
					},
					data: data.value
				}]
			};
			if(this.name == "cpu_usage")
			{
				option["yAxis"][0]["max"] = 100;
				option["yAxis"][0]["min"] = 0;
			}

			// 为echarts对象加载数据 
			echart.setOption(option);
		}
	};
	return Ctrl;
})