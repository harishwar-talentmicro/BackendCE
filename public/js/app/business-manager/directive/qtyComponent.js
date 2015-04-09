angular.module('ezeidApp').directive('qtyComponent',['$compile',function($compile){
    var template = '<div class="input-group  modalbox-input-group-control">'+
//        '<span ng-click="subValue()"  class="input-group-addon"><span class="glyphicon glyphicon-minus"></span> </span>'+
        '<span class="input-group-addon minus"><span class="glyphicon glyphicon-minus"></span> </span>'+
//        '<input class="form-control" type="text" ng-model="qty" />'+
        '<input class="form-control" type="text" ng-model="qty" />'+
//    '<span ng-click="addValue()" class="input-group-addon"><span class="glyphicon glyphicon-plus"></span> </span>'+
    '<span class="input-group-addon plus"><span class="glyphicon glyphicon-plus"></span> </span>'+
    '</div>';

    return {
          restrict : 'EA',
          require : '^?ngModel',
          link : function(scope,elem,attrs,ngModelCtrl){
                elem.html(template);
                elem.on('click','.minus',function(){
                    if(ngModelCtrl.$modelValue > 0 && scope.qty > 0){
                        scope.qty -= 1;
                        ngModelCtrl.$modelValue -= 1;
                        ngModelCtrl.$setViewValue(ngModelCtrl.$modelValue);
                    }
                });
                elem.on('click','.plus',function(){
                    scope.qty += 1;
                    ngModelCtrl.$modelValue = ngModelCtrl.$modelValue +1;
                    ngModelCtrl.$setViewValue(ngModelCtrl.$modelValue);
                });

                elem.on('keypress','.form-control',function(event){
                    if(event.keyCode < 48 || event.keyCode > 57){
                        try{
                            event.preventDefault();
                        }
                        catch(ex){
                            event.defaultPrevented();
                        }
                        return;
                    }
                    ngModelCtrl.$modelValue = parseInt($(this).val());
                });
               scope.$watch('qty',function(newVal,oldVal){

                   if(typeof(newVal) == "undefined" || Number.isNaN(newVal) || newVal == null || newVal == "" || newVal == 0){
                       scope.qty = 1;
                       ngModelCtrl.$modelValue = 1;
                       ngModelCtrl.$setViewValue(1);
                   }
               });
//              setInterval(function(){
//                  console.log('..........................');
//                  console.log('scope.qty : '+scope.qty);
//                  console.log('ngModel value : '+ngModelCtrl.$modelValue);
//                  console.log('ngModel viewValue : '+ ngModelCtrl.$viewValue);
//                  console.log('..........................');
//              },3000);
                $compile(elem.contents())(scope);
          },
          scope : {
               qty : '=ngModel'
          }
    };
}]);