angular.module('ezeidApp').filter('mapEnquiryStatus', ['$rootScope',function($rootScope) {

    var functionTypeList = [
        'sales',
        'reservation',
        'homeDelivery',
        'service',
        'resume'
    ];
    return function(input,functionType) {
        var statusHash = $rootScope.businessManager[functionTypeList[functionType]].enquiryStatus;
        if (!input){
            return '';
        } else {
            return statusHash[input];
        }
    };

}]);