/**
 * Controller to manage all the functionaloties in OUTBOX
 *
 * @author: Krunal[EZE ONE]
 * @since 20150718
 */
angular.module('ezeidApp').
    controller('JobDetail', [
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
        'UtilityService',
        function (
            $rootScope,
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
            UtilityService
        ) {

            // Apply for job
            $scope.applyForJob = function(_tid){

                $scope.$emit('$preLoaderStart');

                $scope.jobData = {
                    token : $rootScope._userInfo.Token,
                    tid : $scope.jobTid
                }

                $http({
                    method: "POST",
                    url: GURL + 'job',
                    data:  $scope.jobData
                }).success(function (data) {
                    $scope.$emit('$preLoaderStop');

                    if(data.status)
                    {
                      Notification.success({ message: "Applied Success..", delay : 2000});
                    }
                })
                .error(function(data, status, headers, config) {
                    $scope.$emit('$preLoaderStop');
                });


            };

        }]);