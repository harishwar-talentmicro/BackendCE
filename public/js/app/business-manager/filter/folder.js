angular.module('ezeidApp').filter('mapFolder', ['$rootScope',function($rootScope) {

    var functionTypeList = [
        'sales',
        'reservation',
        'homeDelivery',
        'service',
        'resume'
    ];
    return function(input,functionType) {
        var folderHash = $rootScope.businessManager[functionTypeList[functionType]].folders;
        if (!input){
            return '';
        } else {
            return folderHash[input];
        }
    };

}]);