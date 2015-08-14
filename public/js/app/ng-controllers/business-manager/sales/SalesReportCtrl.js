(function() {
    angular.module('ezeidApp').controller('SalesReportCtrl', [
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

            var todayDate = moment().format('DD-MMM-YYYY hh:mm A');
            var dateOneMonthBefore = moment(todayDate,'DD-MMM-YYYY hh:mm A').subtract(1,'month').format('DD-MMM-YYYY hh:mm A');

            var reportData = null;

            $scope.loadReportData = function(fromDate,toDate,stages,probabilities,userIds){
                $http({
                    url : GURL + 'sales_statistics',
                    method : 'GET',
                    params : {
                        token : $rootScope._userInfo.Token,
                        from_date : '',
                        to_date : '',
                        stages : '',
                        probabilities : '',
                        user : ''
                    }
                }).success(function(resp,statusText,statusCode){
                    if(resp){
                        if(resp.status){
                            if(resp.data){
                                
                            }
                        }
                        else{
                            Notification.error({
                                title : 'Error',
                                message : 'An error occurred! Please try again',
                                delay : MsgDelay
                            });
                        }
                    }
                    else{
                        Notification.error({
                            title : 'Error',
                            message : 'An error occurred! Please try again',
                            delay : MsgDelay
                        });
                    }

                }).error(function(err,statusText,statusCode){
                    if(!statusCode){
                        Notification.error({
                            title : 'Connection Lost',
                            message : 'Unable to reach server ! Please check your connection',
                            delay : MsgDelay});
                    }
                    else{
                        Notification.error({
                            title : 'Error',
                            message : 'An error occurred! Please try again',
                            delay : MsgDelay
                        });
                    }
                });
            };


            $scope.reportFromDate = dateOneMonthBefore;
            $scope.reportToDate = todayDate;


        }])
})();