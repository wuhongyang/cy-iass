define(function(){
	//$(".knob").knob();
	var Ctrl = {
		init: function(){
			Ctrl.renderUserQuota();
		},
		renderUserQuota : function(){
			var options = {
				type: 'pie',
				width: '80',
				height: '80',
				borderColor: '#00bf00',
				sliceColors: ['#41CAC0', '#A8D76F', '#F8D347', '#EF6F66']
				//        tooltipFormat: '<span style="display:block; padding:0px 10px 12px 0px;">' +
				//            '<span style="color: {{color}}">&#9679;</span> {{offset:names}} ({{percent.1}}%)</span>'
			};
			$(".quota").sparkline([2, 1,5], options );
		}
	}
	return Ctrl;
})