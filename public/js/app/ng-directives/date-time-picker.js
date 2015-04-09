
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
            if(attrs.settings){
                try{
                    var dateTimeSettings = JSON.parse(attrs.settings);
                    $(input).datetimepicker(dateTimeSettings);
                }
                catch(ex){
                    console.error('Date Time pickers settings not passed correctly');
                    $(input).datetimepicker();
                }
            }

            $(input).siblings('.input-group-addon').on('click',function(){
                $(input).trigger('focus');
            });

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
