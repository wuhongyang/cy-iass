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
				}
			//Ctrl.renderUserQuota();
			Ctrl.getUsers().done(function(response){
				Ctrl.renderUserList(response);
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
					"bStateSave": true
				});
				Ctrl.renderMainCharts(response, "total_count", theme);
				Ctrl.renderMainCharts(response, "ticket_count", theme);
			}).fail(function(xhr){
				Messenger().post({
				  	message: '获取用户列表：' + xhr.status + ' / ' + xhr.statusText,
				  	type: 'error',
				  	showCloseButton: true
				});
			});
			Ctrl.bindEvent();
		},
		bindEvent: function(){
			$('#user-list-table').on('click','tbody > tr',function(event){
				var $el = $(this);
				var id = $el.data('id');
				var url = 'user.html?id='+ id;
				$.pjax({url: url, container: '#main-content',fragment: '#main-content'});
			});
		},
		getParam:function(name)
		{
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if (r!=null)
				return (r[2]);
			return null;
		},
		getUsers:function(){
			var departid = Ctrl.getParam("id");
			if(departid)
				return $.get(DATASERVER + "/data/departs/"+ departid + "/user_overview/");
			else
				return null;
		},
		renderUserList: function(data){
			if(!data){
				Messenger().post({
				  	message: '没有用户数据！',
				  	showCloseButton: true
				});
			}else{
				$('#user-list-table > tbody').html(TM.renderTplById('userListTemplate',{users:data}));
			}
		},
		renderMainCharts : function(data, metric, theme){
			// 基于准备好的dom，初始化echarts图表
			var echart = ec.init(document.getElementById("user-"+ metric), theme);
			var orgname = new Array();
			var value = new Array();
			if(data.length == 0)
				return;
			for(var i =0; i < data.length; i++){
				orgname.push(data[i]["user_name"]);
				value.push(data[i][metric]);
			}
			var option = {
				tooltip : {
					trigger: 'axis'
				},
				grid:{
					x:45,
					x2:30,
					y:10,
					y2:10,
					borderWidth:0
				},
				calculable : true,
				xAxis : [
					{
						axisTick :{show:true},
						splitLine: {
							show: false
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
				yAxis : [
					{
						axisTick:{
							show:false
						},
						axisLabel:{
							show:true
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
						type : 'category',
						data : orgname
					}
				],
				series : [
					{
						name:'2011年',
						type:'bar',
						data: value,
						itemStyle: {
							normal: {
								barBorderWidth: 6,
								barBorderRadius:0,
								label : {
									show: true, position: 'inside'
								}
							}
						},
					}
				]
			};
			// 为echarts对象加载数据
			echart.setOption(option);
		}
	};
	return Ctrl;
});