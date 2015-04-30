/**
 * Directive for using modal box bootstrap
 */
angular.module('ezeidApp').directive('modal', function () {
    return {
        template: '<div class="modal fade">' +
            '<div class="modal-dialog modal-lg {{mclass}}">' +
            '<div class="modal-content">' +
            '<span class="closelink" data-dismiss="modal" aria-hidden="true">X</span>'+
            '<div class="modal-header">' +
//                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
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


            scope.mclass = (attrs.mclass) ? attrs.mclass : '';
            scope.mtitle = attrs.mtitle;
            scope.$watch(attrs.visible, function(value){
                if(value == true)
                    $(element).modal('show');
                else
                    $(element).modal('hide');
            });
            scope.$watch(attrs.mtitle,function(value){
                scope.mtitle = value;
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
