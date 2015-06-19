/**
 * @author Indrajeet
 * @description Autocomplete directive for companies
 * @since June 19,2015 03:00 AM
 *
 **/

(function(){
    angular.module('ezeidApp').directive('autocomplete',['$compile','$sce','$timeout',function($compile,$sce,$timeout){
        var listTemplate =  '<li class="ac-list-child" data-id="{{id}}">{{name}} ({{duration}} Days)</li>';


        var templateHtml = '<div class="form-group form-group-sm autocomplete">' +
            '<input type="text" class="form-control" maxlength="150" ng-model="companyName"/>' +
            '<div class="ac-suggestion-box">'+
            '<ul class="ac-list">'+
            '<li class="ac-list-child" ng-repeat="l in list" ng-click="selectCompany($index)">{{l.name}} ({{l.duration}} Days)</li>'+
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
                var companyFlag = false;
                scope.selectCompany = function(i){
                    scope.companyName = scope.list[i].name;
                    companyFlag = true;
                    scope.companyId = scope.list[i].id;
                    scope.list = [];
                };
                element.html(templateHtml).show();
                $compile(element.contents())(scope);

                //element.find('input').bind('keypress',function(e){
                //    scope.companyId = 0;
                //    scope.companyName = angular.element(e.currentTarget).val();
                //    if(scope.companyName){
                //        scope.list = scope.loadSuggestion(scope.companyName);
                //    }
                //});

                scope.$watch('companyName',function(n,v,scope){
                    if(n !== v){
                        if(n && !companyFlag){
                            scope.list = scope.loadSuggestion(n);
                            scope.companyId = 0;
                        }
                        if(!n){
                            scope.companyId = 0;
                        }
                        companyFlag = false;
                    }
                });

                element.find('input').bind('focusout',function(){
                    $timeout(function(){
                        scope.list = [];
                    },500);

                });



            }



        };
    }]);
})();