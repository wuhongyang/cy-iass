define(['TM','echarts'], function(TM,ec) {
	var  oTable;
	var $ = window.jQuery;	
	/**
	 * 报警控制器
	 * @type {Object}
	 */
	var Ctrl = {

	             basicUrl : DATASERVER,

	             url:{
	             	"projects":"/alarm/projects/",
	             	"project":"/alarm/project/",
	             	"objects":"/alarm/objects/",
	             	"metrics":"/alarm/metrics/",
	             	"groups":"/alarm/groups/",
	             	"rule":"/alarm/rule/"
	             },
	             
	             oTable : null,

	             oldRules:null,

	             finalOldRules:[],

		init: function() {
			Ctrl.initData();
			Ctrl.addEvent();			
		},
		initData:function(){
			//所有报警人员
			Ctrl.getProjects(Ctrl.url["projects"]).done(function(response){
				Ctrl.renderProjectsTable(response);
				oTable = $(".datatable").dataTable({
				"bPaginate": true, //翻页功能
				"bLengthChange": false, //改变每页显示数据数量
				"bFilter": true, //过滤功能
				"bSort": false, //排序功能
				"bInfo": false,//页脚信息
				"bAutoWidth": true,//自动宽度	
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
			//alarmRule-list-table_filter
			$("#alarmRule-list-table_filter").css("margin-right","30px");
			});
			//报警模块
			Ctrl.getProjects(Ctrl.url["metrics"]).done(function(response){	
				Ctrl.alarmMetrics=response;
			});
			//报警对象
			Ctrl.getProjects(Ctrl.url["objects"]).done(function(response){
				Ctrl.alarmObjects=response;
			});	
			//报警组
			Ctrl.getProjects(Ctrl.url["groups"]).done(function(response){
				Ctrl.alarmGroups=response;
			});
		},

		//后台统一发送请求入口，GET
		getProjects:function(url){
			return $.get(DATASERVER + url).fail(function(xhr){				
				Messenger().post({
				  	message: '获取报警人员列表：' + xhr.status + ' / ' + xhr.statusText,
				  	type: 'error',
				  	showCloseButton: true
				});
			});
		},
		//后台统一发送请求入口，POST,GET,DELETE等....
		setProjects:function(url,data,mothed){
			var options={
				type:mothed || 'put',
				url: DATASERVER + url,
				dataType: "json",
				contentType: "application/json;charset=utf-8",
				async: false
			};
			if(data){
				options.data = JSON.stringify(data);	
			}
			return $.ajax(options);
		},
		//渲染报警项目列表
		renderProjectsTable: function(data){
			$(data).each(function(i){
				if(1==data[i]["is_auto"]){
					data[i]["auto"] = "是";
				}
			});
		    $('#alarmRuleList').html(TM.renderTplById('alarmRuleListTemplate',{projects:data}));
		},
		//报警项目列表内的注册事件，包括按钮和表格单元点击
		addEvent:function(){	
			Ctrl.addSubEvent();
			Ctrl.addSubNextEvent();
			$("#alarmRule-list-table").delegate("a","click",function(){
				var pk = $(this).parent().attr("id"),type=$(this).attr("name");
				Ctrl.currentPk = pk;
				switch(type){
					case"btn-rule-change":
						Ctrl.changeAlarm(pk);
					break;
					case"check":
						Ctrl.checkAlarm(pk);
					break;
					default://
					break;
				}
				
			});
			//点击增加按钮
			$("#btn-add-alarm-project").click(function(){
				Ctrl.resetAddProject();
			});
			//点击单元格查看更多
			 $('#alarmRuleList').delegate("td.show-more","click",function(){
				        var nTr = $(this).closest('tr'),id=$(this).attr("id"),childRow = nTr.next('.childRow');
				         if(childRow.size()){
				        		childRow.remove();
					        }else{
					            Ctrl.getProjects(Ctrl.url["project"]+id+"/").done(function(response){
						    nTr.after('<tr class= "childRow "><td colspan="6">'+Ctrl.format(response.fixed_ips)+'</td></tr>');    		
				                         })	 
					        }			        
			});
			 //点击修改规则确认按钮事件,该行id为changeOld+id
			 $("#alarm_rules").delegate("a.change-old-rule","click",function(){
			 	var id = $(this).attr("id");
			 	if(Ctrl.isNull(id)>0){
			 		alert("信息填写不许为空");
			 	}else{
			 		var rules = Ctrl.getRules("#changeOld"+id,id);
			 		$("#changeOld"+id).parent().remove();
			 		$("#old-rule"+id).text("修改");
			 		$("#oldRule"+id).html(Ctrl.renderOneRule(rules[0]));
			 		Ctrl.finalOldRules.push(rules);
			 	}
			 });
		},
		//增加规则的非空验证
		isNull:function(el){
			var flag = 0,$p = $("#changeOld"+el).children();
			$.each($p,function(i){
				$.each($($p[i]).find(".is-null"),function(i){
				      ""==$(this).val().trim() ? flag++ : flag;
				});
			});
			return flag;
		},
		//点击修改按钮后触发
		changeAlarm:function(pk){
			Ctrl.getProjects(Ctrl.url["project"]+pk+"/").done(function(response){
					Ctrl.renderAlarmChange(response);			
			})
		},
		//点击查看项目名称后触发
		checkAlarm:function(pk){
			Ctrl.getProjects(Ctrl.url["project"]+pk+"/").done(function(response){
					Ctrl.renderAlarmDetails(response);			
			})
		},
		//点击详细信息后渲染页面		
		renderAlarmDetails:function(data){
			data.objects = [];
			$(data.fixed_ips).each(function(i){
				var object ={};
				object["object"] =  data.fixed_ips[i];
				data.objects.push(object);
			});
			$(data.alarm_rules).each(function(i){
				data.alarm_rules[i].alarm_level_text = Ctrl.setMethdOreLevel(data.alarm_rules[i].alarm_level,"level");
				data.alarm_rules[i].metric_unit=Ctrl.getUnit(data.alarm_rules[i]["metric_name"]);
			});
			$("#alarmDetails").html(TM.renderTplById('alarmRuleDetailTemplate',{projects:data}))

		},
		//点击修改按钮弹出层信息渲染
		renderAlarmChange:function(response){
			$("#add-alarm-rule").empty();
			Ctrl.currentGroups = response.alarm_group_ids;
			Ctrl.setData(response);
			Ctrl.oldRules = response.alarm_rules;
			Ctrl.setRuleOr(response.alarm_rules,"alarm_rules");
			Ctrl.currentObjects =response.fixed_ips;
		},
		//渲染input框的值
		setData:function(data){
			var $input = $('#change-alarm').find("input");
			$($input).each(function(){
				$(this).val(data[$(this).attr("name")]);
			});
		},
		//渲染当前报警规则
		setRuleOr:function(data,el){
			$("#"+el).empty();
			var html = "";
			switch(el){
				case"alarm_rules":	
				        $(data).each(function(i){
				        	var result = data[i];
					html+='<tr id="oldRule'+ result["id"] +'">';
					html+=	Ctrl.renderOneRule(result);
					html+=	'</tr>';	
					});
				break;
				default:
					$(data).each(function(i){
						html+="<option value="+data[i]+">"+data[i]+"</option>"
					});
				break;
			}	
			$(html).appendTo($("#"+el));
		},
		
		//渲染报警方式和报警级别
		setMethdOreLevel:function(index,type){
			var str = "";
			if("level" == type){
				str = 1 == index ? "警告":( 2==index ? "严重":"致命");
			}else{
				str = 1 == index ? "邮箱":"手机";
			}
			return str;
		},
		//渲染报警模块下拉框初始值，		
		renderOptions:function(data,id,type){
			var html=Ctrl.createOptions(data,type);
			$(html).appendTo($("#"+id));
			Ctrl.initUnit(id);
			Ctrl.addSelectEvent(id);
		},
		//addRuleMetrics,addSelectEvent
		addSelectEvent:function(id){
			$("#"+id).change(function(){
				$("#"+id+"unit").text(Ctrl.getUnit($(this).val()));
			});
		},
		initUnit:function(id){
			var value = $("#"+id).val();
			$("#"+id+"unit").text(Ctrl.getUnit(value));
		},
		getUnit:function(value){
		          var unit="";
                               $.each(Ctrl.alarmMetrics,function(i){
				if(value == Ctrl.alarmMetrics[i]["metric_name"]){
					unit = Ctrl.alarmMetrics[i]["metric_unit"]
				}
			});
                               return unit;
		},
		IN : 1,
		//注册弹出页面的用户事件
		addSubEvent:function(id,type){
			
			$(".btn-add-rule").click(function(){
				var html = Ctrl.addRule(Ctrl.IN);				
				$(html).appendTo($("#add-alarm-rule"));
				Ctrl.renderOptions(Ctrl.alarmMetrics,"addRuleMetrics"+Ctrl.IN,"metrics");
				 Ctrl.IN++;
			});
			$("#add-rule-new").delegate("a.btn-add-rule-new","click",function(){
				var html = Ctrl.addRule(Ctrl.IN);
				$(html).appendTo($("#add-alarm-rule-new"));
				Ctrl.renderOptions(Ctrl.alarmMetrics,"addRuleMetrics"+Ctrl.IN,"metrics");
				 Ctrl.IN++;
			});
			$('#add-rule-new').delegate('a.delete-add-rule','click',function(){
				$(this).parent().remove();
			});
			$('p').delegate('a.delete-add-rule','click',function(){
				$(this).parent().remove();
			});
			$('#alarm_rules').delegate('a.old-rule','click',function(){
				Ctrl.oldRuleDo($(this));
			});
			$(".btn-primary").click(function(){
				var type = $(this).attr("name");
				Ctrl.type=type;
				switch(type){
					case"change-next":
						$(".modal").modal("hide");
						Ctrl.setBasicAlarm(type);
						break;
					case"add-next":
						Ctrl.setBasicAlarm(type);
					break;
					default:
						Ctrl.deleteAlarm();
					break;
				};
			});
		},
		//修改或删除已有规则
		oldRuleDo:function($dom){
			var id = $dom.parent().attr("id"),type = $dom.attr("name");
			switch(type){
				case"change":
					Ctrl.changeOldRule(id,$dom);
				break;
				default:
					Ctrl.deleteOldRule(id);
				break;
			}
		},
		changeOldRule:function(id,$dom){
			
			 var nTr = $dom.closest('tr'),childRow = nTr.next('.childRow');
				         if(childRow.size()){
				        		childRow.remove();
				        		$dom.text("修改");
					        }else{
					        	$dom.text("取消");
					           	 nTr.after('<tr class= "childRow " style="background-color: aliceblue;"><td id="changeOld'+id+'" colspan="5">'+Ctrl.formatOldRule(id)+'</td></tr>');    	 
					       	Ctrl.renderOptions(Ctrl.alarmMetrics,"addRuleMetrics"+Ctrl.IN,"metrics");
						Ctrl.IN++;
					       }		
		},
		deleteOldRule:function(id){
			Ctrl.setProjects(Ctrl.url["rule"]+id+"/",null,"DELETE").complete(function(response){
				 Ctrl.deleteRule('#alarm_rules',"#oldRule"+id);
				 $.each(Ctrl.oldRules,function(j){
					if(id == Ctrl.oldRules[j].id){
						Ctrl.oldRules.splice(j,1);
					}
				});
			});
		},
		//点击增加或修改的下一步触发
		setBasicAlarm:function(type){
			var el = "",modal="";
			switch(type){
				case"change-next":
				           el="change-object";
				           modal="changeRuleModalNext";
					Ctrl.basicAlarm("#change-alarm","#add-alarm-rule","changeRuleModalNext");
				break;
				default:
					el="create-object";
					modal="addRuleModalNext";
				            Ctrl.basicAlarm("#add-rule-new","#add-alarm-rule-new","addRuleModalNext");					
				break;
			};
			if(""==Ctrl[Ctrl.type].alarm_project.alarm_project_name){
				Messenger().post({
				  	message:"项目名称不能为空",
				  	type: 'error',
				  	showCloseButton: true
				});
				return;
			}else if(Ctrl[Ctrl.type].alarm_rule.length==0){
				Messenger().post({
				  	message:"请至少创建一条规则",
				  	type: 'error',
				  	showCloseButton: true
				});
				return;
			}else{	
				$(".modal").modal("hide");
			    $("#"+modal).modal("show");
				//Ctrl.addSubNextEvent(modal);
				Ctrl.renderObjects(Ctrl.alarmObjects,el);
				
			}
		},
		//一级弹出层，modal数据获取,x:修改、增加的容器；y:新增规则的容器；el:下一步要弹出的模态对话框
		basicAlarm:function(x,y,el){
			Ctrl[Ctrl.type] ={};
			Ctrl[Ctrl.type].alarm_project=Ctrl.getData(x);
			Ctrl.currentProjectName =Ctrl[Ctrl.type].alarm_project.alarm_project_name;
			if("change-next" == Ctrl.type){
				Ctrl.resetOldRules();
				Ctrl[Ctrl.type].alarm_rule = $.merge(Ctrl.getRules(y), Ctrl.oldRules); 
			}else{
				Ctrl[Ctrl.type].alarm_rule=Ctrl.getRules(y);
			}
			Ctrl[Ctrl.type].alarm_group_ids = [1];
			Ctrl[Ctrl.type].alarm_project.is_auto = $("input[name='is_auto']:checked").val();
			Ctrl[Ctrl.type].alarm_project.alarm_group_ids=[1]; 
			
		},
		//resetOldRules
		resetOldRules:function(){
			if(Ctrl.finalOldRules.length>0){
			      $.each(Ctrl.finalOldRules,function(i){
				var id = Ctrl.finalOldRules[i][0].id;
				$.each(Ctrl.oldRules,function(j){
					if(parseInt(id) == Ctrl.oldRules[j].id){
						Ctrl.finalOldRules[i][0].id = parseInt(Ctrl.finalOldRules[i][0]["id"]);
						Ctrl.oldRules[j] = Ctrl.finalOldRules[i][0];
					}
				});
		                  });	
			}else{
				return;
			}
		},
		//选择监控对象页面渲染
		renderObjects:function(data,el){
			$("#"+el+"-is").empty();$("#"+el+"-not").empty();$("#change-object-all").empty();
			$(data).each(function(i){
				var obj = data[i]["fixed_ip"],checked=false;
				if("change-object" == el){
					checked = -1 != $.inArray(obj, Ctrl.currentObjects)?true:false;
				}
				0 == data[i]["is_vm"]?Ctrl.isVM(true,data[i],el,checked):Ctrl.isVM(false,data[i],el,checked);
				 
			});
		},
		//当前在监控中的对象
		isMonitor:function(data){
			var html =  '<label style="padding:6px"><input type="checkbox" name="checkboxs" value="'+data+'"/>'+data+'</label>';
			$(html).appendTo($("#change-object-all"));
		},
		//虚拟机和物理机数据渲染
		isVM:function(flag,data,el,checked){
			var input = "";
			if(checked){
                                             input = '<label style="padding:6px"><input type="checkbox" checked "name="myobject" value="'+data["fixed_ip"]+'"/>'+data["fixed_ip"]+'</label>'; 
			
			}else{
                                             input = '<label style="padding:6px"><input type="checkbox" "name="myobject" value="'+data["fixed_ip"]+'"/>'+data["fixed_ip"]+'</label>'; 
			
			};
			if(flag){
				$(input).appendTo($("#"+el+"-is"));
			}else{
				$(input).appendTo($("#"+el+"-not"));
			}
		},
		
		//确认弹出层modal事件注册
		addSubNextEvent:function(){
			$(".btn-default").one("click",function(){
				$(".modal").hide();
				var name = $(this).attr("name"),modal=name.substring(0,name.length-4);
				$("#"+modal).modal("show");
			});
			$(".btn-next").on("click",function(){
				switch(Ctrl.type){
					case"add-next":
						Ctrl.addOrUpdate("#create-object");
					break;
					default:
					  //$(".modal").modal("hide");
						Ctrl.addOrUpdate("#change-object");
					break;
				};
			});
		},
		//更新或修改，发送请求
		addOrUpdate:function(el){
			Ctrl[Ctrl.type]["fixed_ips"] = Ctrl.getCheckBox(el);
			if(Ctrl[Ctrl.type]["fixed_ips"].length>0){
				$(".modal").modal("hide");
				Ctrl.finalServer(el);
			}else{
				Messenger().post({
				  	message:"请至少监控一个对象",
				  	type: 'error',
				  	showCloseButton: true
				});
				return;
			}
					
		},
		finalServer:function(el){
			if("#create-object" == el){
				Ctrl.setProjects(Ctrl.url["projects"],Ctrl[Ctrl.type],"POST").done(function(response){	
					Ctrl.addNewProjectTo(response,el);
				})
			}else{
				Ctrl.setProjects(Ctrl.url["project"]+Ctrl.currentPk+"/",Ctrl[Ctrl.type]).done(function(response){	
					Ctrl.addNewProjectTo(response,el);
				})
			}	
		},
		//增加或更新后重新渲染页面
		addNewProjectTo:function(response,el){
			var data = [response];
			$(data).each(function(i){
				if(1==data[i]["is_auto"]){
					data[i]["auto"] = "是";
				}
			});
			var html ="";
			if("#create-object" == el){
				html = TM.renderTplById('alarmRuleListTemplate',{projects:data});
				$(html).appendTo($('#alarmRuleList'));
			}else{
				html = TM.renderTplById('alarmRuleListTdTemplate',{projects:data});
				$("#row"+Ctrl.currentPk).html(html);

			}
		             
		},
		//删除报警项目，发送请求
		deleteAlarm:function(){
			$(".modal").modal("hide");
			Ctrl.setProjects(Ctrl.url["project"]+Ctrl.currentPk+"/",null,"DELETE").done(function(response,xhr,status){	
				  if("204" == status.status){
			         		Ctrl.deleteRule("#alarmRuleList","#row"+Ctrl.currentPk);
				  }
			})
		},
		//删除成功后重新渲染页面
		deleteRule:function(dom,id){
			$(dom).find(id).remove();
		},
		//获取checkebox的值	
		getCheckBox:function(el){
			 var $input = $('input',el),objects=[];
		             $($input).each(function(){ 
		                if($(this)[0].checked){
		                	objects.push( $(this).val());
		                }
		            })
		           return objects;
		},
		//获取提交信息的值	
		getData:function(el,className){
			var $input = $(".des",el),data={};
			$($input).each(function(){
				data[$(this).attr("name")] = $(this).val();
			});			
			return data;
		},
		//获取怎加的规则信息
		getRules:function(el,ruleId){
			var $dom=$(el).children(".basic-rule"),length = $dom.length,rules=[];
			if(length>0){
				$($dom).each(function(i){
					var $rules = $($dom[i]).find(".must"),rule={},els=$dom.attr("id");
					$($rules).each(function(i){
						var name = $(this).attr("name");
						if("metric_name"==name){
							rule["metric_id"] =Ctrl.getMerticInfo($(this).val(),"id");
							rule["metric_desc"] =Ctrl.getMerticInfo($(this).val(),"metric_desc");
						}
						if("alarm_level" == name||"alarm_frequency" == name||"alarm_times" == name){
							rule[name] = parseInt($(this).val());
						}else{
							rule[name] = $(this).val();
						}
						
						
						rule["alarm_project_name"] = Ctrl.currentProjectName;
					});
					rule["id"] = ruleId||-1;
					rule["alarm_method"] = parseInt($($dom[i]).find('input:radio:checked').val());
					rules.push(rule);
				})				
			}
			return rules;
		},
		//获取模块的id值
		getMerticInfo:function(obj,type){
			var data="";
			$(Ctrl.alarmMetrics).each(function(i){
				if(obj == Ctrl.alarmMetrics[i]["metric_name"]){
					data = Ctrl.alarmMetrics[i][type];
				}
			});
			return  data;
		},
		//添加规则dom
		addRule:function(i,el){
			var html =  '<p id="rule'+i+'"class="basic-rule">'+
						Ctrl.addRuleAlarmChild(i)+
						'若<select class="must addRuleMetrics" name="metric_name" id="addRuleMetrics'+i+'">'+
						'&nbsp一直</select>'+
						'<select class="must" name="comparison_operator" id="threshold">'+
							'<option value=">">大于</option>'+
							'<option value="<">小于</option>'+
						'</select>&nbsp;'+
						'<input class="myinput must is-null" type="text" name="threshold" value="0" maxlength="4" onkeyup="setValuesInt(this,0,10000);" style="ime-mode:Disabled"/>'+
						'<span  type="text" id="addRuleMetrics'+i+'unit" name="unit"></span>'+
						',则确认为<select class="must" name="alarm_level" id="alarm_level">'+
							'<option value="1">警告</option>'+
							'<option value="2">严重</option>'+
							'<option value="3">致命</option>'+
							'</select>级别, 并连续&nbsp'+
						'<input class="myinput must is-null" type="text" name="alarm_frequency" value="5" maxlength="3" onkeyup="setValuesInt(this,0,100);" style="ime-mode:Disabled"/>次&nbsp'+
					    '次用以下方式通知&nbsp'+
						'<input class="mycheckbox" type="radio" name="mothed'+i+'" value="1" checked="true"/>邮箱&nbsp'+
						'<input class="mycheckbox" type="radio" name="mothed'+i+'" value="2"/>手机&nbsp&nbsp'
						;
			if(el){
				html+= '&nbsp;<a id="'+el+'"class="btn mybtn change-old-rule" name="change-old-rule">确认</a>';
			}else{
				html+= '&nbsp;<a class="btn mybtn delete-add-rule">删除规则</a>';
			};
			html+='<hr width=80% size=3 color=#00ffff style="FILTER: alpha(opacity=100,finishopacity=0,style=1)"></p>';
			return html;
		},
		addRuleAlarmChild:function(i){
			var html = '连续在<select class="must"id="alarm_times'+i+'" name="alarm_times">',a=[];
			for(var i=1;i<=30;i++){
				a.push(i);
			}
                                var h = Ctrl.createOptions(a,"times");
                                html+=h+'</select>个采样区间内,&nbsp';
			return html;			          
		},
		//渲染增加规则dom
		resetAddProject:function(){
			$("#add-rule-new").empty();
			var html = 	'<form id="addruleForm" class="form-horizontal" role="form">'+
							'<div class="form-group">'+
								'<label for="alarm_project_name" class="col-lg-2 col-sm-2 control-label">报警项目</label>'+
								'<div class="col-lg-6">'+
									'<input type="text" class="form-control des" name="alarm_project_name" placeholder="请输入报警项目名称" value=""/>'+
								'</div>'+
							'</div>'+
							'<div class="form-group">'+
								'<label for="is_auto" class="col-lg-2 col-sm-2 control-label">报警规则</label>'+
								'<div class="col-lg-10">'+
									'<a class="btn mybtn btn-add-rule-new">添加规则</a>'+
									'<p id="add-alarm-rule-new"></p>'+
								'</div>'+
							'</div>'+
							'<div class="form-group">'+
								'<label for="is_auto" class="col-lg-2 col-sm-2 control-label">默认设置</label>'+
									'<div class="col-lg-10">'+
								'<input type="radio" checked="true" name="is_auto" value="1"/>是 &nbsp&nbsp <input type="radio" name="is_auto" value="0"/>否'+
								'</div>'+
							'</div>'+
							'<div class="form-group">'+
								'<label for="alarm_project_desc" class="col-lg-2 col-sm-2 control-label">报警描述</label>'+
								'<div class="col-lg-10">'+
									'<input type="text" class="form-control des" name="alarm_project_desc" placeholder="请输入报警项目描述" />'+
								'</div>'+
							'</div>'+
						'</form>'
						;
			$(html).appendTo($("#add-rule-new"));
			$('#addruleForm').bootstrapValidator(
				{
					fields: {
						alarm_project_name: {
							validators: {
								notEmpty: {
									message: '报警项目名不能为空'
								},
								stringLength: {
									max: 20,
									message: '报警项目名必须小于20个字符'
								}
							}
						}
					}
				}
			);
		},
		//渲染单条报警规则
		renderOneRule:function(result){
			 return  '<td name="metric_desc">'+result["metric_desc"]+result["comparison_operator"]+result["threshold"]+'</td>'+
				'<td>并报警'+result["alarm_frequency"]+'次</td>'+
				'<td name="alarm_times">报警方式：'+Ctrl.setMethdOreLevel(result["alarm_method"],"method")+'</td>'+
				'<td name="alarm_times">报警级别：'+Ctrl.setMethdOreLevel(result["alarm_level"],"level")+'</td>'+
				'<td id="'+ result["id"] +'"><a id="old-rule'+result["id"]+'" class="btn mybtn old-rule" name="change">修改</a><a class="btn mybtn old-rule"name="delete">删除</a></td>';
		},
		//查看更多
		format:function(data) {
	                 var html =  '<table cellpadding="5" cellspacing="0" border="0" style="width:100%;padding-left:50px;background-color:aliceblue;"><tr> <td>报警对象:</td>';
		    $(data).each(function(i){
		    	html+='<td>'+data[i]+'</td>'
		    });
		    html+="</tr></table>";
		    return html;
		},
		formatOldRule:function(id){
			var html = Ctrl.addRule(Ctrl.IN,id);
			return html;
		},
		createOptions:function(data,type){
			var html = "";
			$.each(data,function(i){
				switch(type){
					case"metrics":
					html+='<option metric_id="'+data[i]["id"]+'"value="'+ data[i]["metric_name"] +'">'+data[i]["metric_desc"] +'</option>';
					break;
					default:
					html+='<option value="'+ data[i]+'">'+data[i]+'</option>'
					break;
				}
				
			});
			return html;
		},

	}
	return Ctrl;
})