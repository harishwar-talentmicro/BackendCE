
angular.module('ezeidApp').directive('dateTimePicker', function() {
    return {
        restrict: 'E',
        replace: true,
        require : '?ngModel',
        scope: {
            recipient: '='
        },
        template:
            '<div class="input-group datetimepicker">'+
                '<input type="text" class="form-control" placeholder="Date"  id="datetimepicker1"  name="recipientDateTime" />'+
                '<span class="input-group-addon"><span class="glyphicon glyphicon-calendar" >'+
                '</span>'+
                '</div>',
        link: function(scope, element, attrs, ngModel) {
            var input = element.find('input');
            input.bind('blur change keyup keypress',function(){
                scope.recipient = input.val();
                scope.$apply();
            });

            scope.$watch('recipient',function(newVal,oldVal){
                $(input[0]).val(newVal);
            });
        }
    }
});
