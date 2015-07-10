define(['TM','echarts'], function(TM,ec) {
	
	var $ = window.jQuery;	
	/**
	 * 报警控制器
	 * @type {Object}
	 */
	var Ctrl = {

		basicUrl : DATASERVER,

		url:{
			"users":"/alarm/users/",
			"user":"/alarm/user/"
		},
		pk:null,

		init: function() {
			var oTable = $(".datatable").dataTable({
				"bPaginate": false, //翻页功能
				"bLengthChange": false, //改变每页显示数据数量
				"bFilter": false, //过滤功能
				"bSort": false, //排序功能
				"bInfo": false,//页脚信息
				"bAutoWidth": true,//自动宽度
			});
			var validOption ={
				fields: {
					alarm_user_name:{
						validators: {
							notEmpty: {
								message: '用户名不能为空'
							},
							stringLength: {
								max: 20,
								message: '用户名必须小于20个字符'
							}
						}
					},
					phone:{
						validators: {
							notEmpty: {
								message: '手机号不能为空'
							},
							phone: {
								country: 'CN',
								message: '输入的不是一个有效的手机号'
							}
						}
					},
					office_phone:{
						validators: {
							phone: {
								country: 'CN',
								message: '输入的不是一个有效的电话号'
							}
						}
					},
					email:{
						validators: {
							notEmpty: {
								message: '邮箱地址不能为空'
							},
							regexp: {
								regexp: '^[^@\\s]+@([^@\\s]+\\.)+[^@\\s]+$',
								message: '输入的不是一个有效的邮箱地址'
							}
						}
					},
					remark: {
					}
				}
			};
			Ctrl.initData();
			Ctrl.addEvent();
			$('#adduserForm').bootstrapValidator(validOption)
				.on('success.form.bv', function(e) {
					var data = Ctrl.getData("alarm-user-add");
					Ctrl.setUsers(Ctrl.url["users"],data,"POST")
						.done(function(response){
							Ctrl.addOneUser(response);
							$(".modal").modal("hide");
							$('#adduserForm').bootstrapValidator('resetForm', true);
						})
						.fail(function(response){
							Messenger().post({
								message: JSON.parse(response.responseText),
								type: 'error',
								showCloseButton: true
							});
							$('#adduserForm').bootstrapValidator('resetForm', true);
						});
				});
			$('#changeuserForm').bootstrapValidator(validOption)
				.on('success.form.bv', function(e) {
					if(Ctrl.pk){
						var data = Ctrl.getData("alarm-user-change");
						Ctrl.setUsers(Ctrl.url["user"]+Ctrl.pk+"/",data)
							.done(function(response){
								Ctrl.renderOneUser(Ctrl.pk,response);
								$(".modal").modal("hide");
								$('#changeuserForm').bootstrapValidator('resetForm', true);
							})
							.fail(function(response){
								Messenger().post({
									message: JSON.parse(response.responseText),
									type: 'error',
									showCloseButton: true
								});
							});
						Ctrl.pk = null;
					}
				});
			$('#deleteuserForm').bootstrapValidator()
				.on('success.form.bv', function(e) {
					if(Ctrl.pk){
						Ctrl.setUsers(Ctrl.url["user"]+Ctrl.pk+"/",null,"DELETE")
							.done(function(response,xhr,status){
								if("204" == status.status){
									Ctrl.deleteUser(Ctrl.pk);
								}
							})
							.fail(function(response){
								Messenger().post({
									message: JSON.parse(response.responseText),
									type: 'error',
									showCloseButton: true
								});
							});
						Ctrl.pk = null;
					}
				});
			$('#adduserdismiss').on('click', function (e) {
				$('#adduserForm').bootstrapValidator('resetForm', true);
			});
			$('#changeuserdismiss').on('click', function (e) {
				$('#changeuserForm').bootstrapValidator('resetForm', true);
			});

		},
		initData:function(){
			//所有报警人员
			Ctrl.getUsers(Ctrl.url["users"]).done(function(response){
				Ctrl.renderUsersTable(response);
			})
		},
		getUsers:function(url){
			return $.get(DATASERVER + url).fail(function(xhr){				
				Messenger().post({
				  	message: '获取报警人员列表：' + xhr.status + ' / ' + xhr.statusText,
				  	type: 'error',
				  	showCloseButton: true
				});
			});
		},
		setUsers:function(url,data,mothed){
			var options={
				type:mothed || 'put',
				async: false,
				url: DATASERVER + url,
				dataType: "json",
				contentType: "application/json;charset=utf-8"
			};
			if(data){
				options.data = JSON.stringify(data);	
			}
			return $.ajax(options);
		},
		renderUsersTable: function(data){
		    $('#alarmUserSetTable').html(TM.renderTplById('alarmUserSetListTemplate',{users:data}));
		},
		addEvent:function(){			
			$("table").delegate("a","click",function(){
				var pk = $(this).parent().parent().attr("name"),type=$(this).attr("name");
				Ctrl.pk = pk;
				switch(type){
					case"alarm-user-change":
						Ctrl.getUsers(Ctrl.url["user"]+pk+"/").done(function(response){
							Ctrl.setData(response);
						});
						break;
				};
			});
			$(".add-user").click(function(){
				var $input = $('#add-user').find("input");
				$($input).each(function(){
					$(this).val("");
				});
//				Ctrl.addSubEvent(null,"alarm-user-add");
			});

		},
		setData:function(data){
			var $input = $('#change-user').find("input");
			$($input).each(function(){
				$(this).val(data[$(this).attr("name")]);
			});
		},
		getData:function(type){
			var $input = $("alarm-user-change" == type?'#change-user':'#add-user').find("input"),data={};
			$($input).each(function(){
				data[$(this).attr("name")] = $(this).val();
			});			
			return data;
		},
		renderOneUser:function(id,data){
			var html =  '<td>'+ data.alarm_user_name +'</td>'+
			            '<td>'+data.email+'</td>'+
			            '<td>'+data.phone+'</td>'+
			            '<td>'+data.office_phone+'</td>'+
			            '<td>'+data.remark+'</td>'+
			            '<td><a class="btn mybtn" name="alarm-user-change"data-toggle="modal" data-target="#changeModal">修改</a>'+
			            '<a class="btn mybtn" name="alarm-user-delete" data-toggle="modal" data-target="#deleteModal">删除</a>'+
			            '</td>';
			$(".user"+id).html(html);

		},
		deleteUser:function(id){
			$("#alarmUserSetTable").find(".user"+id).remove();
		},
		validateChange:function(){
			var validate = $("#change-user").find(".validate");
			$.each(validate,function(i){
				Ctrl.validate($(this).attr("name"),$(this).val());
			})
		},
		addOneUser:function(data){
			var html =  '<tr name="'+data.pk+'" class="user'+data.pk+'">'+
					 '<td>'+ data.alarm_user_name +'</td>'+
				            '<td>'+data.email+'</td>'+
				            '<td>'+data.phone+'</td>'+
				            '<td>'+data.office_phone+'</td>'+
				            '<td>'+data.remark+'</td>'+
				            '<td><a class="btn mybtn" name="alarm-user-change"data-toggle="modal" data-target="#changeModal">修改</a>'+
				            '<a class="btn mybtn" name="alarm-user-delete" data-toggle="modal" data-target="#deleteModal">删除</a>'+
				            '</td>'+
				         '</tr>';
			      $(html).appendTo($("#alarmUserSetTable"));
		}

	}
	return Ctrl;
})