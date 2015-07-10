define(['TM','echarts','eChartTheme',
	'echarts/chart/bar'
	// 使用柱状图就加载bar模块，按需加载
],function(TM,ec,theme){
	var $ = window.jQuery;
	var Ctrl = {
		advanType:[
			"device",
			"efficiency",
			"energy"
		],
		init: function(){
			Messenger.options = {
				    extraClasses: 'messenger-fixed messenger-on-top',
				    theme: 'flat'
				};

			Ctrl.getList("/data/platform/").done(function(response){
				for(var i = 0; i < Ctrl.advanType.length; i++)
				{
					Ctrl.renderAdvanList(response, Ctrl.advanType[i], theme);
				}
			});
			for(var i = 0; i < Ctrl.advanType.length; i++) {
				Ctrl.bindEvent(Ctrl.advanType[i]);
			}
		},
		bindEvent: function(type){
			$("#advan-" + type + "-btn").on('click','button',function(event){
				var $el = $(this);
				var period = $el.data('id');
				var url = '/data/platform/?period='+ period;
				Ctrl.getList(url).done(function(response){
					Ctrl.renderAdvanList(response, type, theme);
				});
			});
		},
		getList:function(url){
			return $.get(DATASERVER + url);
		},
		renderAdvanList: function(data, type, theme){
			var advandata= new Array();
			switch (type){
				case "device":
					advandata[0] = { "option": "服务器", "tradition" : data["instance_count"], "cloud" : data["host_count"] , "unit":"台"};
					advandata[1] = { "option": "存储设备", "tradition" : data["depart_count"], "cloud" : 1 , "unit":"台"};
					advandata[2] = { "option": "网络设备", "tradition" : data["depart_count"] * 2, "cloud" : 2 , "unit":"台"};
					advandata[3] = { "option": "合计", "tradition" : data["instance_count"] + data["depart_count"] * 3, "cloud" : data["host_count"] + 3 , "unit":"台"};
					$('#advan-device-table > tbody').html(TM.renderTplById('advanListTemplate',{advans:advandata}));
					Ctrl.renderMainCharts(advandata[3], type, theme);
					break;
				case "efficiency":
					advandata[0] = { "option": "购置时间(月)", "tradition" : data["ticket_count"] * 2, "cloud" : 2 , "unit":"月"};
					advandata[1] = { "option": "部署时间", "tradition" : data["instance_count"]+" 天", "cloud" : data["instance_count"] + " * 15分钟" , "unit":""};
					advandata[2] = { "option": "运维时间(月)", "tradition" : (data["instance_count"] + data["depart_count"]), "cloud" : (data["host_count"] + 1), "unit":"套"};
					advandata[3] = { "option": "合计(月)", "tradition" : data["ticket_count"] * 2, "cloud" : 2 , "unit":"月"};
					$('#advan-efficiency-table > tbody').html(TM.renderTplById('advanListTemplate',{advans:advandata}));
					Ctrl.renderMainCharts(advandata[3], type, theme);
					break;
				case "energy":
					advandata[0] = { "option": "服务器", "tradition" : data["instance_count"], "cloud" : data["host_count"] , "unit":"*1000W"};
					advandata[1] = { "option": "存储设备", "tradition" : data["depart_count"], "cloud" : 1 , "unit":"*500W"};
					advandata[2] = { "option": "网络设备", "tradition" : (data["depart_count"] * 2), "cloud" : 2  , "unit":"*300W"};
					advandata[3] = { "option": "合计", "tradition" : (data["instance_count"] * 10 + data["depart_count"] * 11)/10  , "cloud" : (data["host_count"]+ 1.1) , "unit":"KW"};
					$('#advan-energy-table > tbody').html(TM.renderTplById('advanListTemplate',{advans:advandata}));
					Ctrl.renderMainCharts(advandata[3], type, theme);
					break;
				default :
					break;
			}
		},
		renderMainCharts : function(data, type, theme){
			// 基于准备好的dom，初始化echarts图表
			var echart = ec.init(document.getElementById("advan-" + type + "-chart"), theme);
			var itemFromatter = {
				normal : {
					barBorderWidth: 4,
					barBorderRadius: 0,
					label: {
						show: true,
						position: 'inside',
						formatter : function (a,b,c,d){return b+"\n"+c+data.unit},
						textStyle: {
							fontSize : 16,
							fontWeight : 'bolder'
						}
					}
				}
			};
			var option = {
				tooltip : {
					trigger: 'axis'
				},
				grid:{
					x:20,
					x2:30,
					y:10,
					y2:0,
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
							show: false,
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
							show:false
						},
						splitLine: {
							show: false,
						},
						axisLine: { // 轴线
							show: false,
							lineStyle: {
								width: 1
							}
						},
						type : 'category',
						data : ["传统", "云平台"]
					}
				],
				series : [
					{
						name:'',
						type:'bar',
						data: [data.tradition, data.cloud],
						itemStyle: itemFromatter
					}
				]
			};
			// 为echarts对象加载数据
			echart.setOption(option);
		}
	};
	return Ctrl;
});