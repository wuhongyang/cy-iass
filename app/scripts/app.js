var DATASERVER = "http://10.10.82.111:81";//.";//
/**
 * start pjax
 */

$(function(){
    var lastPage, currentPage = $('#main-content').children('.page').data('page');
    $(document).pjax('#sidebar a, a[data-pjax]', '#main-content', {
        fragment: '#main-content'
    });
    $(document).on('pjax:complete', function() {
        $('#loading').hide()
    });
    $(document).on('pjax:send', function() {
        $('#loading').show()
    });
    $(document).on('pjax:beforeReplace', function(contents,options) {
        lastPage = $('#main-content').children('.page').data('page');
        currentPage = options.filter('.page').data('page');
    });
    $(document).on('pjax:end', function(contents,options) {
        $(document).trigger('remove',{page:lastPage});
        $(document).trigger('render',{page:currentPage});
    });

})



/**
 *  app JS start
 */

require.config({
        paths: {
            TM:'./tplManager',
            CM:'./controllermodule',
            eChartTheme:'./theme',
            "mustache":'../../bower_components/mustache/mustache',
            'echarts':'../../bower_components/echarts/build/echarts',
            'echarts/chart/bar' : '../../bower_components/echarts/build/echarts',       // 把所需图表指向单文件
            'echarts/chart/line': '../../bower_components/echarts/build/echarts',
            'echarts/chart/pie': '../../bower_components/echarts/build/echarts',
            PAGE:'./page'
        }
    });


require(['CM','TM'],function(CM,TM){

    /**
     * router
     */

    $(function(){
        $(document).on('remove',function(event,data){
            if(data&&data.page){
                CM[data.page + "Ctrl"] && CM[data.page + "Ctrl"].distory && CM[data.page + "Ctrl"].distory();
            }
        });
        $(document).on('render',function(event,data){
            if(data&&data.page){
                CM[data.page + "Ctrl"] && CM[data.page + "Ctrl"].init && CM[data.page + "Ctrl"].init();
            }
        });
        $(document).trigger('render',{page:$('#main-content').children('.page').data('page')});
    });

    /**
     *  初始化用户 sub-menu
     */
     $.get(DATASERVER + '/data/users/').done(function(response){      
            $('#user-sub-menu').html(TM.renderTplById('userSubMenuTemplate',{users: response}));
    });
    /**
     *  初始化部门 sub-menu
     */
    $.get(DATASERVER + '/data/departs/').done(function(response){
        $('#depart-sub-menu').html(TM.renderTplById('departSubMenuTemplate',{departs: response}));
    });
      /**
     *  初始化主机 sub-menu
     */
     $.get(DATASERVER + '/data/hosts/').done(function(response){
           $('#host-sub').html(TM.renderTplById('hostSubMenuTemplate',{hosts:response}));
    });
    /**
     *  初始化vmware sub-menu
     */
    $.get(DATASERVER + '/vmware/host/').done(function(response){
        $('#vmHost-sub').html(TM.renderTplById('VmHostSubMenuTemplate',{hosts:response}));
    });
});

$(function(){
    $.fn.DataTable.defaults.sPaginationType = 'simple';
});

/*---LEFT BAR ACCORDION----*/
$(function() {
    
    $('#nav-accordion').dcAccordion({
        eventType: 'click',
        autoClose: true,
        saveState: true,
        disableLink: false,
        speed:300 ,//'slow',
        showCount: false,
        autoExpand: true,
//        cookie: 'dcjq-accordion-1',
        classExpand: 'dcjq-current-parent'
    });
});

var Script = function () {

//    sidebar dropdown menu auto scrolling

    jQuery('#sidebar .sub-menu > a').click(function () {
        var o = ($(this).offset());
        diff = 250 - o.top;
        if(diff>0)
            $("#sidebar").scrollTo("-="+Math.abs(diff),500);
        else
            $("#sidebar").scrollTo("+="+Math.abs(diff),500);
    });

//    sidebar toggle

    $(function() {
        function responsiveView() {
            var wSize = $(window).width();
            if (wSize <= 768) {
                $('#container').addClass('sidebar-close');
                $('#sidebar > ul').hide();
            }

            if (wSize > 768) {
                $('#container').removeClass('sidebar-close');
                $('#sidebar > ul').show();
            }
        }
        $(window).on('load', responsiveView);
        $(window).on('resize', responsiveView);
    });

    $('.icon-reorder').click(function () {
        if ($('#sidebar > ul').is(":visible") === true) {
            $('#main-content').css({
                'margin-left': '0px'
            });
            $('#sidebar').css({
                'margin-left': '-210px'
            });
            $('#sidebar > ul').hide(300);
            $("#container").addClass("sidebar-closed");
        } else {
            $('#main-content').css({
                'margin-left': '210px'
            });
            $('#sidebar > ul').show(300);
            $('#sidebar').css({
                'margin-left': '0'
            });
            $("#container").removeClass("sidebar-closed");
        }
    });

// custom scrollbar
    $("#sidebar").niceScroll({styler:"fb",cursorcolor:"#e8403f", cursorwidth: '3', cursorborderradius: '10px', background: '#404040', spacebarenabled:false, cursorborder: ''});

    $("html").niceScroll({styler:"fb",cursorcolor:"#e8403f", cursorwidth: '6', cursorborderradius: '10px', background: '#404040', spacebarenabled:false,  cursorborder: '', zindex: '1000'});

// widget tools

    jQuery('.panel .tools .icon-chevron-down').click(function () {
        var el = jQuery(this).parents(".panel").children(".panel-body");
        if (jQuery(this).hasClass("icon-chevron-down")) {
            jQuery(this).removeClass("icon-chevron-down").addClass("icon-chevron-up");
            el.slideUp(200);
        } else {
            jQuery(this).removeClass("icon-chevron-up").addClass("icon-chevron-down");
            el.slideDown(200);
        }
    });

    jQuery('.panel .tools .icon-remove').click(function () {
        jQuery(this).parents(".panel").parent().remove();
    });


//    tool tips

    $('.tooltips').tooltip();

//    popovers

    $('.popovers').popover();



// custom bar chart

    if ($(".custom-bar-chart")) {
        $(".bar").each(function () {
            var i = $(this).find(".value").html();
            $(this).find(".value").html("");
            $(this).find(".value").animate({
                height: i
            }, 2000)
        })
    }


}();


//custom select box

$(function() {
	$('select.styled').customSelect();

    
        //work progress bar

        $("#work-progress1").sparkline([5,6,7,5,9,6,4], {
            type: 'bar',
            height: '20',
            barWidth: 5,
            barSpacing: 2,
            barColor: '#5fbf00'
    //        tooltipFormat: '<span style="display:block; padding:0px 10px 12px 0px;">' +
    //            '<span style="color: {{color}}">&#9679;</span> {{offset:names}} ({{percent.1}}%)</span>'
        });

        $("#work-progress2").sparkline([3,2,5,8,4,7,5], {
            type: 'bar',
            height: '22',
            barWidth: 5,
            barSpacing: 2,
            barColor: '#58c9f1'
    //        tooltipFormat: '<span style="display:block; padding:0px 10px 12px 0px;">' +
    //            '<span style="color: {{color}}">&#9679;</span> {{offset:names}} ({{percent.1}}%)</span>'
        });

        $("#work-progress3").sparkline([1,6,9,3,4,8,5], {
            type: 'bar',
            height: '22',
            barWidth: 5,
            barSpacing: 2,
            barColor: '#8075c4'
    //        tooltipFormat: '<span style="display:block; padding:0px 10px 12px 0px;">' +
    //            '<span style="color: {{color}}">&#9679;</span> {{offset:names}} ({{percent.1}}%)</span>'
        });

        $("#work-progress4").sparkline([9,4,9,6,7,4,3], {
            type: 'bar',
            height: '22',
            barWidth: 5,
            barSpacing: 2,
            barColor: '#ff6c60'
    //        tooltipFormat: '<span style="display:block; padding:0px 10px 12px 0px;">' +
    //            '<span style="color: {{color}}">&#9679;</span> {{offset:names}} ({{percent.1}}%)</span>'
        });

        $("#work-progress5").sparkline([6,8,5,7,6,8,3], {
            type: 'bar',
            height: '22',
            barWidth: 5,
            barSpacing: 2,
            barColor: '#41cac0'
    //        tooltipFormat: '<span style="display:block; padding:0px 10px 12px 0px;">' +
    //            '<span style="color: {{color}}">&#9679;</span> {{offset:names}} ({{percent.1}}%)</span>'
        });

});



