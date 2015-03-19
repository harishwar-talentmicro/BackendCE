/**
 * Created by admin on 18/3/15.
 */

angular.module('ezeidApp').factory('AccessRightsService',function(){

    var rights = {
        canAdd : false,
        canEdit : false,
        canDelete : false,
        gridOptions : {

        }
    };

    var svc = {
        getRights : function(right){
            switch (right) {
                case 1 :
                    break;
                case 2 :
                    break;
                case 3 :
                    break;
                case 4 :
                    break;
                default:
                    break;
            }
        }
    };
});