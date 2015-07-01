(function(){
    angular.module('ezeidApp').directive('bussinessItem', ['$compile','$templateCache',function ($compile,$templateCache) {

        var getTemplate = function(templateType) {
            var template = '';
            switch(templateType) {
                case 1:
                    template = $templateCache.get('/tpl/bus-item-description.html');
                    break;
                case 2:
                    template = $templateCache.get('/tpl/bus-item-description-picture.html');
                    break;
                case 3:
                    template = $templateCache.get('/tpl/bus-item-description-picture-qty.html');
                    break;
                case 4:
                    template = $templateCache.get('/tpl/bus-item-description-picture-qty-rate.html');
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
                templateType = 0;
            }



            element.html(getTemplate(templateType)).show();
            var itemIndex = parseInt(scope.itemIndex);
            var elemClass = 'blue';
            var btnClass = 'btn-orange';
            if(itemIndex%3 == 1){
                elemClass = 'purple';
                btnClass = 'btn-blue'
            }
            else if(itemIndex % 3 == 2){
                elemClass = 'orange';
                btnClass = 'btn-green';
            }
            //element.find('.business-manager-item').addClass(elemClass);
            //console.log(element);
            //console.log(elemClass);
            element.find('div.business-manager-item').addClass(elemClass);
            element.find('.btn-xs').addClass(btnClass);
            $compile(element.contents())(scope);
        }


        return {
            restrict: "E",
            link: linker,
            replace : true,
            scope: {
                itemListType : '=',
                item : '=',
                addItem : '&',
                editPermission : '=',
                editMode : '=',
                itemIndex : '='
            }
        };
    }]);
})();
