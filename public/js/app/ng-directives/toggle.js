/**
 * Directive for binding of bootstrap javascript popover and tooltip methods
 */
angular.module('ezeidApp').directive('toggle', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            if (attrs.toggle=="tooltip"){
                $(element).tooltip({
                    html : attrs.title
                });
            }
            if (attrs.toggle=="popover"){
                console.log(attrs.contents());
                //$compile(element.contents())(scope);
                $(element).popover({
                    html : true,
                    animation : true,
                    content : attrs.content
                });
            }
            if(attrs.toggle == "tab"){
                $(element).on('shown.bs.tab', function (e) {
                    e.target // newly activated tab
                    e.relatedTarget // previous active tab
                })
            }
            $(element).on('show.bs.popover',function(){
                $('*[data-toggle="popover"]').not(this).popover('hide');
            });
        }
    };
});
