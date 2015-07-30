(function() {
    angular.module('ezeidApp').controller('SalesMasterCtrl', [
        '$rootScope',
        '$scope',
        '$http',
        '$q',
        '$timeout',
        'Notification',
        '$filter',
        '$window',
        'GURL',
        '$interval',
        'MsgDelay',
        '$location',
        '$routeParams',
        '$route',
        'GoogleMaps',
        'UtilityService',
        function ($rootScope,
                  $scope,
                  $http,
                  $q,
                  $timeout,
                  Notification,
                  $filter,
                  $window,
                  GURL,
                  $interval,
                  MsgDelay,
                  $location,
                  $routeParams,
                  $route,
                  GoogleMap,
                  UtilityService) {

            $scope.salesEnquiryTab = true;
            $scope.salesStatisticsTab = false;
            $scope.salesTaskTab = false;

            $scope.tplSalesEnquiryTab = 'html/business-manager/sales/sales.html';
            $scope.tplSalesStatisticsTab = 'html/business-manager/sales/sales-report.html';
            $scope.tplSalesTaskTab = 'html/business-manager/sales/sales-task.html';

        }]);
})();