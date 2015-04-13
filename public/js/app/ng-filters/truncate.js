/**
 * Filter for truncating String to a specific length
 * @param string
 * @param length to be truncated
 * @usage
 * string | truncate:10
 */
angular.module('ezeidApp').
    filter('truncate', function () {
        return function (text, length, end) {
            if (isNaN(length))
            {
                length = 10;
            }

            if (typeof(end) === "undefined"){
                end = "...";
            }

            if (text.length <= length) {
                return text;
            }
            else {
                var str = String(text).substring(0, length) + end;
                return str;
            }

        };
    });
