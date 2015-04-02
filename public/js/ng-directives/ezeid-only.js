/**
 * Validation directive for EZEID
 * @desc Constraints
 * 1. Validates length to be max 15
 * 2. Validates pattern to be containing numbers and alphabets only
 */
angular.module('ezeidApp').directive('ezeidOnly', function(){
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (inputValue) {

                // this next if is necessary for when using ng-required on your input.
                // In such cases, when a letter is typed first, this parser will be called
                // again, and the 2nd time, the value will be undefined
                if (inputValue == undefined) return '';

                if(inputValue.length > 15){
                    modelCtrl.$setViewValue(modelCtrl.$modelValue);
                    modelCtrl.$render();
                    return modelCtrl.$modelValue;
                }

                var transformedInput = inputValue.replace(/[^0-9A-Za-z]/g, '');
                if (transformedInput != inputValue) {
                    modelCtrl.$setViewValue(transformedInput);
                    modelCtrl.$render();
                }
                return transformedInput;
            });
        }
    };

});
