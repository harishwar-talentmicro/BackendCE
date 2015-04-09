/**
 * Pattern Restrictor for Input Field
 * @desc Resticts the input field based on pattern passed to it
 */
angular.module('ezeidApp').directive('pinOnly',function(){
    return {
        require : 'ngModel',
        link : function(scope,element,attrs,modelCtrl){
            modelCtrl.$parsers.push(function(inputValue){

                if (inputValue == undefined) return '';

                if(inputValue.length > 3){
                    modelCtrl.$setViewValue(modelCtrl.$modelValue);
                    modelCtrl.$render();
                    return modelCtrl.$modelValue;
                }

                var transformedInput = inputValue.replace(/[^0-9]/g, '');
                if (transformedInput != inputValue) {
                    modelCtrl.$setViewValue(transformedInput);
                    modelCtrl.$render();
                }
                return transformedInput;
            });
        }
    }
});
