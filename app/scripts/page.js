define(function(){
    var pageCount = {

        pageHead:function(){
            var html="";
            if(pageCount.index == 1){
                                    html =  '<ul><li><a class="page-active">首页</a></li><li><a class="page-active">上一页</a></li>';
                                }else{
                                    html =  '<ul><li><a class="page-button">首页</a></li><li><a class="page-button">上一页</a></li>';
                                }
                                return html;
        },
        pageBody:function(pageCounts){
            var html = "",count = parseInt(pageCounts);
            if(count>15){
                if(pageCount.index<=5){
                     html+=pageCount.makeBody(1,pageCount.index+5);   
                }else if(pageCount.index>5&&pageCount.index+5<=count){
                    html+=pageCount.makeBody(pageCount.index-5,pageCount.index+5);
                }else if(pageCount.index>=5&&pageCount.index+5>count){
                        html+=pageCount.makeBody(pageCount.index-5,count);
                    }
            }else{
                  for(var i=1;i<=count;i++){
                if(pageCount.index == i ){
                             html+='<li><a  class="page-active">'+i+'</a></li>';
                }else{
                    html+='<li><a class="page-button">'+i+'</a></li>';
                }   
                  };
            }
            return html;
        },
        makeBody:function(s,e){
            var html = "";
             for(var i=s;i<=e;i++){
                if(pageCount.index == i ){
                             html+='<li><a  class="page-active">'+i+'</a></li>';
                }else{
                    html+='<li><a class="page-button">'+i+'</a></li>';
                }   
                  };
                  return html;
        },
        pageFoot:function(count){
            var html = "";
            if(pageCount.index == count){
                html='<li><a  class="page-active">下一页</a></li><a  class="page-active">尾页</a></li><li><a>共'+count+'页</a></li><li><a>当前第'+pageCount.index+'页</a></li><li></ul>';
                                }else{
                                    html='<li><a class="page-button">下一页</a></li><a  class="page-button">尾页</a></li><li><a>共'+count+'页</a></li><li><a>当前第'+pageCount.index+'页</a></li><li></ul>';
                                }
                                return html;
        },
        getPageCount:function(index,count){
            pageCount.index = index;
            return pageCount.pageHead()+pageCount.pageBody(count)+pageCount.pageFoot(count);
        }
    };

   

    return pageCount;
});