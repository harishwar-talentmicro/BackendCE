(function(){
    angular.module('ezeidApp').directive('transactionItem', ['$compile','$templateCache',function ($compile,$templateCache) {

        var getTemplate = function(templateType) {
            var template = '';

            switch(templateType) {
                case 1:
                    template = $templateCache.get('/tpl/tx-item-description.html');
                    break;
                case 2:
                    template = $templateCache.get('/tpl/tx-item-description-picture.html');
                    break;
                case 3:
                    template = $templateCache.get('/tpl/tx-item-description-picture-qty.html');
                    break;
                case 4:
                    template = $templateCache.get('/tpl/tx-item-description-picture-qty-rate.html');
                    break;
                default :
                    template = "";
                    break;
            }

            return template;
        }

        var linker = function(scope, element, attrs) {
            var templateType = 0;
            try{
                templateType = parseInt(scope.itemListType);
            }
            catch(ex){

            }
            element.html(getTemplate(templateType)).show();
            $compile(element.contents())(scope);
        }


        return {
            restrict: "E",
            replace : true,
            link: linker,
            scope: {
                itemListType : '=',
                item:'=',
                removeItem : '&',
                editPermission : '=',
                editMode : '='
            }
        };
    }]);
})();
