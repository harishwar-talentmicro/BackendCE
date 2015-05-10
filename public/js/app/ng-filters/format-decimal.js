(function(){
    /**
     * Filter for formatting decimal numbers
     * @param string
     * @param length to be truncated
     * @usage
     * string | truncate:10
     */
    angular.module('ezeidApp').
        filter('formatDecimal', function () {
            return function (numStr,prefix, precision) {

                var zero = parseFloat(0);

                if(!numStr){
                    numStr = zero;
                }

                if(!precision){
                    precision = 0;
                }

                if(!prefix)
                {
                    prefix = '';
                }
                var decimal = parseFloat(numStr);
                if(isNaN(decimal)){
                    return prefix + ' ' + zero.toFixed(2);
                }
                return prefix + ' ' +decimal.toFixed(precision);
            };
        });

})();