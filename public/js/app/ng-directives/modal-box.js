/**
 * Directive for using modal box bootstrap
 */
angular.module('ezeidApp').directive('modal', function () {
    return {
        template: '<div class="modal fade" data-backdrop="static">' +
            '<div class="modal-dialog modal-lg {{ mclass }}">' +
            '<button type="button" class="close up-btn" data-dismiss="modal" aria-hidden="true" ng-show="mclass && !showheader">×</button>' +
            '<div class="modal-content">' +
            '<span class="closelink" data-dismiss="modal" aria-hidden="true" ng-hide="mclass">×</span>'+
            '<div class="modal-header" ng-show="showheader">' +
               '<button type="button" class="close" data-dismiss="modal" aria-hidden="true" ng-show="mclass">×</button>' +
            '<h4 class="modal-title text-center">{{ mtitle }}</h4>' +
            '</div>' +
            '<div class="modal-body" ng-transclude></div>' +
            '</div>' +
            '</div>' +
            '</div>',
        restrict: 'E',
        transclude: true,
        replace:true,
        scope:true,
        link: function postLink(scope, element, attrs) {
            scope.mclass = attrs.mclass;
            scope.mtitle = attrs.mtitle;
            scope.showheader = true;
            if(typeof(attrs.showheader) !== "undefined"){
                scope.showheader = attrs.showheader;
                scope.$watch(attrs.showheader,function(value){
                    scope.showheader = value;
                });
            }
            scope.$watch(attrs.visible, function(value){
                if(value == true)
                    $(element).modal('show');
                else
                    $(element).modal('hide');
            });
            scope.$watch(attrs.mtitle,function(value){
                scope.mtitle = value;
            });

            scope.$watch(attrs.mclass,function(value){
                scope.mclass = value;
            });

            $(element).on('shown.bs.modal', function(){
                scope.$apply(function(){
                    scope.$parent[attrs.visible] = true;
                });
            });

            $(element).on('hidden.bs.modal', function(){
                scope.$apply(function(){
                    scope.$parent[attrs.visible] = false;
                });
            });
        }
    };
});
