define(['TM','echarts','eChartTheme',
	'echarts/chart/line',
	'echarts/chart/bar',
	'echarts/chart/pie'
	// 使用柱状图就加载bar模块，按需加载
],function(TM,ec,theme){
	var Ctrl = {
		init: function(){
			Messenger.options = {
				    extraClasses: 'messenger-fixed messenger-on-top',
				    theme: 'flat'
				};

			Ctrl.userid = Ctrl.getParam("id");

			if(!Ctrl.userid){
				Messenger().post({
				  	message: '没有用户数据！',
				  	type:'error',
				  	showCloseButton: true
				});
				return false;
			}
			Ctrl.getUserInfo().done(function(response){
				Ctrl.renderUserInfo(response);
				Ctrl.renderTrendsCharts(response.instance_trend, "instance_trend", theme);
				Ctrl.renderTrendsCharts(response.instance_trend, "ticket_trend", theme);
			});
			Ctrl.getUserComputerList().done(function(response){
				Ctrl.renderUserComputerList(response);
				$('.datatable').dataTable({
					"oLanguage": {
						"sLengthMenu": "每页显示 _MENU_ 条记录",
						"sZeroRecords": "没有检索到数据",
						"sSearch": "检索",
						"sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
						"sInfoEmpty": "没有数据",
						"sEmptyTable": "没有数据",
						"sInfoFiltered": "(从 _MAX_ 条数据中检索)",
						"oPaginate": {
							"sFirst": "首页",
							"sPrevious": "前一页",
							"sNext": "后一页",
							"sLast": "尾页"
						}
					},
					"aLengthMenu": [[5, 10, 20, -1], [5, 10, 20, "All"]],
					"bStateSave": true
				});
			});

			Ctrl.metricUrl = DATASERVER + "/data/users/" + Ctrl.userid + "/metrics/?metric=";
			Ctrl.refreshChart("hour");
			Ctrl.bindEvent();
		},
		bindEvent: function(){
			$('#user-instance-list-table').on('click','tbody > tr',function(event){
				var $el = $(this);
				var fixed_ip = $el.data('id');
				var url = 'instance.html?fixip='+ fixed_ip;
				$.pjax({url: url, container: '#main-content',fragment: '#main-content'});

			});
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
		formatErrorMsg : function(label,status,statusText){
			return  '' + label + Ctrl.userid + ' / ' + status + ' / ' + statusText
		},
		getParam:function(name)
		{
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if (r!=null)
				return (r[2]);
			return null;
		},
		getUserInfo :function() {
			return $.get(DATASERVER + "/data/users/" + Ctrl.userid + '/').fail(function(xhr){
				Messenger().post({
					message: Ctrl.formatErrorMsg('获取用户信息: ',xhr.status ,xhr.statusText),
					type:'error',
					showCloseButton: true
				});
			});
		},
		renderUserInfo : function(data){
			if(data){
				$('#user-info').html(TM.renderTplById('userInfoTemplate',{user:data}));
			}
		},
		getUserComputerList : function(){
			return $.get(DATASERVER + '/data/users/'+Ctrl.userid+'/instances/').fail(function(xhr){
				Messenger().post({
				  	message: Ctrl.formatErrorMsg('获取用户虚拟主机列表: ' , xhr.status , xhr.statusText),
				  	type:'error',
				  	showCloseButton: true
				});
			});
		},
		renderUserComputerList : function(data){
			for(var i = 0; i < data.length; i++){
				data[i]["spec"] = data[i]["vcpus"]+"CPUX"+data[i]["ecus_per_vcpu"]+"ECUS,内存"+data[i]["memory_mb"]+"MB,系统硬盘"+data[i]["rootfs_gb"]+"GB,用户硬盘"+data[i]["storage_gb"]+"GB";
			}
			$('#user-instance-list-table > tbody').html(TM.renderTplById('userInstanceListTemplate',{list:data}));
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
			var echart = ec.init(document.getElementById("user-"+this.name), this.theme);

			var option = {
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
						show: false,
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
			echart.setOption(option);
		},
		renderTrendsCharts : function(data, name, theme){
			// 基于准备好的dom，初始化echarts图表
			var echart = ec.init(document.getElementById("user-"+ name), theme);

			var option = {
				tooltip: {
					trigger: 'axis'
				},
				grid: {
					y: 10,
					y2: 30,
					x:40,
					x2:12,
					borderWidth:0,
					//borderColor:"#ff0000"
				},

				calculable: true,
				xAxis: [{
					axisTick :{
						show:false
					},
					axisLabel : {
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
					type: 'category',
					boundaryGap: [0, 0.01],
					data: data.time
				}],
				yAxis: [{
					axisTick :{
						show:false
					},
					splitLine: {
						show: false,
					},
					axisLabel : {
						show:false
					},
					axisLine: { // 轴线
						show: true,
						lineStyle: {
							width: 1
						}
					},
					type: 'value'
				}],
				series: [
					{
						name: '',
						type: 'bar',
						data: data.value,
						itemStyle: {
							normal: {
								barBorderWidth: 2,
								barBorderRadius:0,
								label : {
									show: true, position: 'top'
								}
							}
						}
					},
					{
						name: '',
						type: 'line',
						smooth: false,
						data: data.value,
						itemStyle:{
							normal:{
								lineStyle:{
									type: 'dashed'
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