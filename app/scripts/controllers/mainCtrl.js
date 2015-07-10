define(['TM','echarts','eChartTheme',
	'echarts/chart/line',
	'echarts/chart/pie'
	// 使用柱状图就加载bar模块，按需加载
],function(TM,ec,theme){
	/*index.js*/
	/**
	 * 图表动画
	 */
	function countUp($display, count) {
		var div_by = 5,
			speed = Math.round(count / div_by),
			run_count = 1,
			int_speed = 24;

		var int = setInterval(function() {
			if (run_count < div_by) {
				$display.text(speed * run_count);
				run_count++;
			} else if (parseInt($display.text()) < count) {
				var curr_count = parseInt($display.text()) + 1;
				$display.text(curr_count);
			} else {
				clearInterval(int);
			}
		}, int_speed);
	}

	/**
	 * 首页控制器
	 * @type {Object}
	 */
	var Ctrl = {
	             basicUrl : DATASERVER+"/data/platform/metrics/",

	             url:{
	             	"instances_count":"/data/instance/count/",
	             	"hosts_count":"/data/users/count/",
	             	"cloudDriveCount":"/data/users/count/",
	             	"users_count":"/data/users/count/",	
	             },
	             
		init: function() {
			Ctrl.initData();
		},
		initData:function(){
			//平台概览
			Ctrl.ajax(DATASERVER+"/data/platform/");
			//监测信息
			Ctrl.getList("/data/devices/1/info/").done(function(response){
				Ctrl.renderPMList(response);
			});
			Ctrl.getList("/data/devices/2/info/").done(function(response){
				Ctrl.renderSTList(response);
			});
			Ctrl.getList("/data/devices/3/info/").done(function(response){
				Ctrl.renderNETList(response);
			});
			Ctrl.refreshChart("hour");
			Ctrl.addEvent();
		},
		addEvent:function(){
			$(".refresh").click(function(){
				Ctrl.refreshChart($(this).attr("name"));
			});
		},
		refreshChart:function(period){
			$(".metric").each(function(){
				var $dom = $(this);
				var name = $dom.attr("name"),
					eType    = $dom.attr("e-type");
				Ctrl.ajax(Ctrl.basicUrl + "?metric=" + name + "&period=1"+period, {
					name: name,
					theme: theme
				});
			});
		},
		distribute:function(type,name,data){			
			var renderData = Ctrl.resetData(data);
			var config = Ctrl.setConfig(type,data,name);
		},
		
		resetData:function(data){
			var renderData = [];
			$.each(data.value,function(i){
				renderData.push({
					name:data.time[i],
					value:data.value[i]
				});
			});
			return renderData;
		},
		getRandomColor : function(){   
			  return  '#' +   
			    (function(color){   
			    return (color +=  '0123456789abcdef'[Math.floor(Math.random()*16)])   
			      && (color.length == 6) ?  color : arguments.callee(color);   
			  })('');   
		},
		getList:function(url){
			return $.get(DATASERVER + url);
		},
		renderPMList: function(data){
			$('#PhysicalMachineList').html(TM.renderTplById('PhysicalMachineTemplate',{pms:data}));
		},
		renderSTList: function(data){
			$('#StorageList').html(TM.renderTplById('StorageTemplate',{stos:data}));
		},
		renderNETList: function(data){
			$('#NetworkList').html(TM.renderTplById('NetworkTemplate',{nets:data}));
		},
		renderCount:function(data){
			$.each(data,function(k,v){
				countUp($("#"+k), v);
			});			
		},
		ajax:function(url,config){
			if (config) {
				$.ajax({url:url
					,async: false
				}).done(Ctrl.renderEchart.bind(config))
				.fail(function(result) {
					//alert(result);
				});
			} else {
				$.get(url).done(function(result) {
					if (result) {
						Ctrl.renderCount(result);
					}
				}).fail(function(result) {
					//alert(result);
				});
			}
				
		},
		renderEchart: function(data) {
			// 基于准备好的dom，初始化echarts图表
			var myChart = ec.init(document.getElementById(this.name),this.theme);
			option = {
				title: {
					text: '',
					//subtext: '纯属虚构',
					x: "center",
					textStyle: {
						fontSize: 12,
						fontWeight: 'normal'
					}
				},
				tooltip: {
					trigger: 'axis'
				},
				grid: {
					x: 40,
					x2: 10,
					y: 15,
					y2: 10,
					borderWidth:0
				},
				calculable: true,
				xAxis: [{
					axisTick :{
						show:false
					},
					axisLabel : {
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
					type: 'category',
					boundaryGap: false,
					data: data.time
				}],
				yAxis: [{
					splitLine: {
						show: false,
					},
					axisLabel : {
						show:true
					},
					axisLine: { // 轴线
						show: true,
						lineStyle: {
							width: 1
						}
					},
					type: 'value',
				}],
				series: [{
					name: '',
					type: 'line',
					smooth: true,
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
			myChart.setOption(option);
		}
	}
	return Ctrl;
})