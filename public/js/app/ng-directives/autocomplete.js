/**
 * @author Indrajeet
 * @description Autocomplete directive for companies
 * @since June 19,2015 03:00 AM
 *
 **/

(function(){
    angular.module('ezeidApp').directive('autocomplete',['$compile','$sce',function($compile,$sce){
        var listTemplate =  '<li class="ac-list-child" data-id="{{id}}">{{name}} ({{duration}} Days)</li>';


        var templateHtml = '<div class="form-group autocomplete">' +
            '<input type="text" class="form-control" maxlength="150" />' +
            '<div class="ac-suggestion-box">'+
            '<ul class="ac-list" ng-bind-html="listTemp">'+
            '</ul>'+
            '</div>' +
            '</div>';

        return {
            restrict : 'EA',
            replace : true,
            scope : {
                list : '=',
                companyId : '=',
                companyName : '=',
                loadSuggestion : '='
            },
            link : function(scope,element,attrs){

                function recompile(alist){
                    //console.log('hi');
                    var list = (alist) ? alist : [];
                    var genListTemp = '';
                    for(var i=0; i<list.length;i++){
                        var lt = listTemplate;
                        //console.log(lt);
                        lt = lt.replace('{{name}}',list[i].name);
                        lt = lt.replace('{{duration}}',list[i].duration);
                        lt = lt.replace('{{id}}',list[i].id);
                        //console.log(lt);
                        genListTemp = genListTemp + lt;
                    }

                    scope.listTemp = $sce.trustAsHtml(genListTemp);

                    element.find('li').bind('click',function(e){
                        console.log('li bind');
                        var elem = e.currentTarget;

                        var eid = parseInt(angular.element(elem).data('id'));

                        var eIndex = list.indexOfWhere('id',eid);
                        if(eIndex !== -1){
                            element.find('input').val(list[eIndex]);
                            scope.companyId = eid;
                            scope.companyName = list[eIndex].name;
                        }
                    });


                    element.find('input').bind('keypress',function(e){
                        scope.companyId = 0;
                        scope.companyName = angular.element(e.currentTarget).val();
                        scope.loadSuggestion();
                    });
                }



                scope.$watch(function(){
                    recompile(scope.list);
                    return scope.list;
                });


                recompile(scope.list);

                element.html(templateHtml).show();
                $compile(element.contents())(scope);

            }



        };
    }]);
})();