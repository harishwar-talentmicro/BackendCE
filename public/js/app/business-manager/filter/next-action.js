angular.module('ezeidApp').filter('mapNextAction', ['$rootScope',function($rootScope) {

    var functionTypeList = [
        'sales',
        'reservation',
        'homeDelivery',
        'service',
        'resume'
    ];
    return function(input,functionType) {
        var actionHash = $rootScope.businessManager[functionTypeList[functionType]].nextActions;
        if (!input){
            return '';
        } else {
            return actionHash[input];
        }
    };

}]);