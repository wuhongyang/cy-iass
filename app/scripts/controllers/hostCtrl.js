define(['TM','echarts','eChartTheme',
	'echarts/chart/line',
	'echarts/chart/bar',
	'echarts/chart/pie'
	// 使用柱状图就加载bar模块，按需加载
],function(TM,ec,theme){
	var Ctrl = {
		init: function () {
			Messenger.options = {
				extraClasses: 'messenger-fixed messenger-on-top',
				theme: 'flat'
			};
			Ctrl.hostIp = Ctrl.getParam("ip");
			if (!Ctrl.hostIp) {
				Messenger().post({
					message: '没有主机数据！',
					type: 'error',
					showCloseButton: true
				});
				return false;
			}
			Ctrl.basicUrl = DATASERVER + "/data/hosts/" + Ctrl.hostIp + "/";

			Ctrl.getHostInfo().done(function (response) {
				Ctrl.renderHostInfo(response);
				Ctrl.renderQuotaCharts(response, "", theme);
			});
			Ctrl.getHostInstanceList().done(function (response) {
				Ctrl.renderHostInstanceList(response);
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
			Ctrl.metricUrl = Ctrl.basicUrl + "metrics/?metric=";
			Ctrl.refreshChart("hour");
			Ctrl.bindEvent();
		},
		bindEvent: function () {
			$('#host-instance-list-table').on('click', 'tbody > tr', function (event) {
				var $el = $(this);
				var fixed_ip = $el.data('id');
				var url = 'instance.html?fixip=' + fixed_ip;
				$.pjax({url: url, container: '#main-content', fragment: '#main-content'});
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
		getParam: function (name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if (r != null)
				return (r[2]);
			return null;
		},
		getHostInfo: function () {
			return $.get(Ctrl.basicUrl).fail(function (xhr) {
				Messenger().post({
					message: Ctrl.formatErrorMsg('获取用户信息: ', xhr.status, xhr.statusText),
					type: 'error',
					showCloseButton: true
				});
			});
		},
		renderHostInfo: function (data) {
			var cpuinfo = JSON.parse(data["cpu_info"]);
			var cpuspeed = new Number(data["cpu_speed"]/1000);
			data["cpu_spec"] = cpuinfo.vendor + " " + cpuinfo.model + cpuinfo.arch + " " + cpuinfo.topology.cores + "核*" + cpuinfo.topology.threads + "线程," + cpuspeed.toFixed(1)+"GHZ";
			data["memory_mb"] = Math.ceil(data["memory_mb"] / 1024);
			data["memory_mb_used"] = Math.ceil(data["memory_mb_used"] / 1024);
			$('#host-info').html(TM.renderTplById('hostInfoTemplate', {host: data}));
		},
		getHostInstanceList: function () {
			return $.get(Ctrl.basicUrl + "instance/").fail(function (xhr) {
				Messenger().post({
					message: Ctrl.formatErrorMsg('获取用户虚拟主机列表: ', xhr.status, xhr.statusText),
					type: 'error',
					showCloseButton: true
				});
			});
		},
		renderHostInstanceList: function (data) {
			$('#host-instance-list-table > tbody').html(TM.renderTplById('hostInstanceListTemplate', {list: data}));
		},
		ajax: function (url, config) {
			$.ajax({
				url: url
				, async: false
			}).done(Ctrl.renderMainCharts.bind(config))
				.fail(function (result) {
					//alert(result);
				});
		},
		renderMainCharts: function (data) {
			// 基于准备好的dom，初始化echarts图表
			var echart = ec.init(document.getElementById("host-" + this.name), this.theme);

			var option = {
				tooltip: {
					trigger: 'axis'
				},
				grid: {
					y: 20,
					y2: 10,
					x:40,
					x2:20,
					borderWidth: 0
					//borderColor:"#ff0000"
				},

				calculable: true,
				xAxis: [{
					axisTick: {show: false},
					axisLabel: {
						show: false
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
		renderQuotaCharts : function(data, theme){
			// 基于准备好的dom，初始化echarts图表
			var echart = ec.init(document.getElementById("host-quota"), theme);

			var labelTop = {
					normal : {
						label : {
							show : true,
							position : 'center',
							formatter : '{b}',
							textStyle: {
								baseline : 'bottom'
							}
						},
						labelLine : {
							show : false
						}
					}
				};
			var labelFromatter = {
				normal : {
					label : {
						formatter : function (a,b,c,d){return 100- Math.round(d) + '%'},
						textStyle: {
							baseline : 'top'
						}
					}
				}
			};
			var labelBottom = {
				normal : {
					color: '#ccc',
					label : {
						show : true,
						position : 'center'
					},
					labelLine : {
						show : false
					}
				},
				emphasis: {
					color: 'rgba(0,0,0,0)'
				}
			};
			var radius = [30, 50];
			var option = {
				title : {
					text: '主机资源',
					x: 'center',
					y: 'top'
				},
				series : [
					{
						type : 'pie',
						center : ['24%', '30%'],
						radius : radius,
						x: '20%', // for funnel
						itemStyle : labelFromatter,
						data : [
							{name:'虚拟CPU未使用', value:data["vcpus"]-data["vcpus_used"], itemStyle : labelBottom},
							{name:'虚拟CPU使用', value: data["vcpus_used"], itemStyle : labelTop}
						]
					},
					{
						type : 'pie',
						center : ['76%', '30%'],
						radius : radius,
						x:'60%', // for funnel
						itemStyle : labelFromatter,
						data : [
							{name:'ECU未使用', value: data["ecus"]-data["ecus_used"], itemStyle : labelBottom},
							{name:'ECU使用', value: data["ecus_used"], itemStyle : labelTop}
						]
					},
					{
						type : 'pie',
						center : ['24%', '80%'],
						radius : radius,
						y: '55%',   // for funnel
						x: '60%',    // for funnel
						itemStyle : labelFromatter,
						data : [
							{name:'内存未使用', value: data["memory_mb"]-data["memory_mb_used"], itemStyle : labelBottom},
							{name:'内存使用', value: data["memory_mb_used"], itemStyle : labelTop}
						]
					},
					{
						type : 'pie',
						center : ['76%', '80%'],
						radius : radius,
						y: '55%',   // for funnel
						x:'60%', // for funnel
						itemStyle : labelFromatter,
						data : [
							{name:'硬盘未使用', value:data["storage_gb"]-data["storage_gb_used"], itemStyle : labelBottom},
							{name:'硬盘使用', value:data["storage_gb_used"],itemStyle : labelTop}
						]
					}
				]
			};
			// 为echarts对象加载数据
			echart.setOption(option);
		}
	}
	return Ctrl;
})