
/**
 * Directive to convert text to image
 */
angular.module('ezeidApp').directive('memeimage', function () {
    console.log("SAi777");
    return {
        restrict: 'EA',
        template:'<canvas></canvas>',
        replace:true,
        link: function (scope, el, attrs) {

            scope.upperText = "";
            scope.fontsize = 14;
            var c = el[0];
            c.height = 30;
            var ctx = c.getContext("2d");


            scope.drawCanvas = function () {

                c.width = c.width;
                ctx.font = scope.fontsize + "px  SANS SERIF";
                ctx.fillStyle = '';
                ctx.strokeStyle = '#337ab7';
                var x = c.width / 2;
                var y = c.height / 2;
                ctx.textAlign = 'center';
                ctx.fillText(scope.upperText.toUpperCase(), x, 20);
                ctx.lineWidth = 2;
                ctx.strokeText(scope.upperText.toUpperCase(), x, 20);


            };
        }
    }
});
