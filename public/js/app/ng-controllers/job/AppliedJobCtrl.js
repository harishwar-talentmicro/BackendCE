/**
 * Controller to view all the Applied Job
 *
 * @author: Krunal[EZE ONE]
 * @since 20150801
 */
angular.module('ezeidApp').
    controller('AppliedJobCtrl', [
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

            $scope.pageSize = 10;
            $scope.pageCount = 0;
            getAppliedJob();

            // Get Applied Job list
            function getAppliedJob()
            {
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'applied_job',
                    method : 'GET',
                    params : {
                        token : $rootScope._userInfo.Token,
                        page_size : $scope.pageSize,
                        page_count : $scope.pageCount
                    }
                }).success(function(resp){
                    $scope.$emit('$preLoaderStop');

                        console.log(resp);
                    if(resp.status)
                    {


                    }

                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                });
            }



        }]);