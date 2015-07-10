define(['TM','echarts','PAGE'], function(TM,ec,PAGE) {
		
	/**
	 * 报警控制器
	 * @type {Object}
	 */
	var Ctrl = {
	             basicUrl : DATASERVER,

	             url:{
	             	"alarmHistroyTable":"/alarm/historys/paginator/"	,
	             	"alarmHistroyChart":"/alarm/historys/month_count/",
	             	"alarmHistroyCount":"/alarm/all/count/",
	             	"verify":"/alarm/historys/"
	             },
	             index:1,
	             total:0,
	             offset:"5",
				 status:"0",

		init: function() {
			//注册dataTable
			//Ctrl.initTable();
			//注册分页事件
			Ctrl.initPageEvent();
			//报警人员
			Ctrl.getAlarmTable(Ctrl.index,Ctrl.offset, Ctrl.status);
			//报警折线图
			Ctrl.getAlarmChart();
			//报警统计
			Ctrl.getAlarmCount();
			//注册事件
			Ctrl.addEvent();						
		},
		addEvent:function(){
			$(".refresh").click(function(){
				switch($(this).attr("name")){
					case"alarm-table":
						Ctrl.getAlarmTable(Ctrl.index,Ctrl.offset, Ctrl.status);
					break;
					case"alarm-chart":
						Ctrl.getAlarmChart();
					break;
					default:
						Ctrl.getAlarmCount();
					break;
				};
			});
			$("table").delegate("button","click",function(){
				var $dom = $(this).parent().parent(),id=$dom.attr("name")||1;
				//id/verify/
				Ctrl.getData(Ctrl.url["verify"]+id+"/verify/").done(function(response){
					if("Verify OK!"==response.result){
						$dom.html('<span class="green">已确认</span>');
					}
				});
			});
		},
		initTable:function(){
			Ctrl.table = $(".datatable").dataTable({
					"bLengthChange": false, //改变每页显示数据数量
					"bFilter": true, //过滤功能
					"bSort": false, //排序功能
					"bInfo": false,//页脚信息
					"bAutoWidth": true,//自动宽度
					"bPaginate": false, //翻页功能
					"bStateSave": true
			             });
		},
		getAlarmTable:function(index,offset,status){
			Ctrl.getData2(Ctrl.url["alarmHistroyTable"],{index:index,offset:offset,status:status}).done(function(response){
				
				Ctrl.index = parseInt(response.index); 
				Ctrl.total = response.total_page;
				Ctrl.offset = response.offset;
				Ctrl.renderAlarmsTable(response);
				Ctrl.renderPage(response.total_page);
				//Ctrl.createTable();
				$(".datatable").dataTable({
					"bLengthChange": true, //改变每页显示数据数量
					"bFilter": true, //过滤功能
					"bSort": false, //排序功能
					"bInfo": false,//页脚信息
					"bAutoWidth": true,//自动宽度
					"bPaginate": false, //翻页功能
					"bRetrieve": true
			             });
			});
		},
		renderPage:function(count){
			$(".page-count").empty();
			var html = PAGE.getPageCount(Ctrl.index,count);
			$(html).appendTo($(".page-count"));
		},
		initPageEvent:function(){
			$(".page-count").delegate("a.page-button","click",function(){
				var  currentOffset = $("#perNumberAlarms").val(),index=$(this).text(),postIndex = "";
				switch(index){
					case"下一页":
						postIndex = Ctrl.index+1;
					break;
					case"上一页":
						postIndex = Ctrl.index-1;
					break;
					case"首页":
						postIndex = 1;
					break;
					case"尾页":
						postIndex = parseInt(Ctrl.total);
					break;
					default:
						postIndex = index;
					break;
				};
				Ctrl.getAlarmTable(postIndex,currentOffset, Ctrl.status);
			});
			$("#perNumberAlarms").change(function(){
				Ctrl.offset = $(this).val();
				Ctrl.getAlarmTable(Ctrl.index,Ctrl.offset, Ctrl.status);
			});
			$("#AlarmStatus").change(function(){
				Ctrl.status = $(this).val();
				Ctrl.getAlarmTable(Ctrl.index,Ctrl.offset, Ctrl.status);
			});
		},
		getAlarmChart:function(){
			Ctrl.getData(Ctrl.url["alarmHistroyChart"]).done(function(response){
				Ctrl.renderAlarmsEchart(Ctrl.resetEchartData(response),"alarmStatistics");
			});
		},
		getAlarmCount:function(){
			Ctrl.getData(Ctrl.url["alarmHistroyCount"]).done(function(response){
				Ctrl.renderAlarmsCount(response);
			});
		},
		getData:function(url){
			return $.get(DATASERVER + url).fail(function(xhr){				
				Messenger().post({
				  	message: '获取报警历史列表：' + xhr.status + ' / ' + xhr.statusText,
				  	type: 'error',
				  	showCloseButton: true
				});
			});
		},
		getData2:function(url,data,mothed){
			var options={
				 type:mothed || 'GET',
				  url: DATASERVER + url,
				  dataType: "json",
				  data : data,
				  contentType: "application/json;charset=utf-8"
			};
			return $.ajax(options);
		},
		renderAlarmsTable: function(data){
		    $('#alarmList').html(TM.renderTplById('alarmListTemplate',{list:Ctrl.resetTool(data)}));
		},
		renderAlarmsCount:function(data){
		    $('#alarmCount').html(TM.renderTplById('alarmCountTemplate',{count:data}));
		},
		resetTool:function(data){
			var result = data["history_data"];
			$(result).each(function(i){
				if(1==result[i]["is_verify"]){
					result[i]["verify"] = "确认";
				}
			});
			return result;
		},
		resetEchartData:function(data){
			//[]
			var r = data.length==0?[ {"alarm_time": "2014-10-15T00:00:00Z","count": 1}, 
                                                                    {"alarm_time": "2014-10-16T00:00:00Z",  "count": 1},
                                                                    {"alarm_time": "2014-10-17T00:00:00Z",  "count": 2},
                                                                    {"alarm_time": "2014-10-18T00:00:00Z",  "count": 1}] :data;
			var result = {
				alarm_time:[],
				count:[]
			};
			$(r).each(function(i){
				result["alarm_time"].push(r[i]["alarm_time"]);
				result["count"].push(r[i]["count"]);
			});
			return result;

		},
		createTable:function(){
			          $("#dataTable").empty();
			          var table = '<table id="alarm-list-table" class="table table-bordered datatable" style="border:1px solid #ccc">'+
			                    '<thead >'+
			                    '<tr>'+
			                      '<th>时间</th>'+
			                      '<th>报警模块</th>'+
			                      '<th>报警对象</th>'+
			                      '<th>报警组</th>'+
			                      '<th>报警详细信息</th>'+
			                      '<th>操        作</th>'+
			                    '</tr>'+
			                    '</thead>'+
			                    '<tbody id="alarmList">'+
			                   
			                    '</tbody>'+
			              '</table>';
			             $(table).appendTo($("#dataTable"));
		},		
		renderAlarmsEchart: function(data,name) {
			var myChart = ec.init(document.getElementById(name));
			option = {
			    title : {
			        text: '最近一年报警项目数统计',
			        subtext: '',
			        x:"center"
			    },
			    tooltip : {
			        trigger: 'axis'
			    },
			    calculable : true,
			    xAxis : [
			        {
			            type : 'category',
			            boundaryGap : false,
			            data :data["alarm_time"]
			        }
			    ],
			    yAxis : [
			        {
			            type : 'value',
			        }
			    ],
			    series : [
			        {
			            name:'',
			            type:'line',
			            data:data["count"]
			        }
			    ]
			};
			                    


			// 为echarts对象加载数据 
			myChart.setOption(option);
		}
	}
	return Ctrl;
})