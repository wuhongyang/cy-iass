define(['mustache'],function(mustache){
    var $$ = jQuery;
    var tplManager = {


        loadTpl: function(id){
            var tpl = $$('#' + id).html();
            return tpl;
        },

        renderRemoteTpl: function(tplName,renderData,callback){
            tplName = tplName || '';
            $$.get('page/' + tplName + '.tpl.html' ,function(markup){
                var output = mustache.render(markup,renderData);

                typeof(callback === 'function') ? callback(output) : null;
            });

        },

        renderTpl: function(markup,renderData){
            var output = mustache.render(markup,renderData);
            return output;
        },

        renderTplById: function(tplId,renderData){
            var markup = this.loadTpl(tplId);
            var output = mustache.render(markup,renderData);
            return output;
        }

    };

   

    return tplManager;
});