/**
 * Number only directive (allows only number for input fields)
 */
angular.module('ezeidApp').directive('numbersOnly', function(){
    return {
        //require: 'ngModel',
        //link: function(scope, element, attrs, modelCtrl) {
        //    modelCtrl.$parsers.push(function (inputValue) {
        //        // this next if is necessary for when using ng-required on your input.
        //        // In such cases, when a letter is typed first, this parser will be called
        //        // again, and the 2nd time, the value will be undefined
        //        if (inputValue == undefined) return ''
        //        var transformedInput = inputValue.replace(/[^0-9]/g, '');
        //        if (transformedInput!=inputValue) {
        //            modelCtrl.$setViewValue(transformedInput);
        //            modelCtrl.$render();
        //        }
        //
        //        return transformedInput;
        //    });
        //}

        link : function(scope,element,attrs,model){
            element.on('keypress',function(e){
                if((e.which < 48 || e.which > 57)){
                    if(e.which == 0 || e.which == 8){
                    }
                    else{
                        return false;
                    }
                }
            });
        }
    };
});