/**
 * Controller to manage all the functionaloties in OUTBOX
 *
 * @author: Krunal[EZE ONE]
 * @since 20150718
 */
angular.module('ezeidApp').
    controller('JobAppliedSuccessCtrl', [
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



            $scope.showSuccessMsg = false;
            if(!$rootScope._userInfo.IsAuthenticate)
            {
                var defer = $q.defer();
                $rootScope.loginPromise = defer;
                $timeout(function ()
                {
                    angular.element('#SignIn_popup').css({'position':'fixed'});
                    angular.element('#SignIn_popup > .window_page').css({'position':'relative'});
                    angular.element('#SignIn_popup').slideDown();
                },2000);

                defer.promise.then(function(){
                    applayJob($routeParams.jobid);
                });
            }
            else
            {
                if($routeParams.jobid)
                {
                    applayJob($routeParams.jobid);
                }
            }

            // Apply for job
            function applayJob(_jobId)
            {
                $scope.$emit('$preLoaderStart');
                $scope.jobData = {
                    token : $rootScope._userInfo.Token,
                    job_id : $scope.jobTid
                }
                $http({
                    method: "POST",
                    url: GURL + 'job_apply',
                    data :{
                        token:$rootScope._userInfo.Token,
                        job_id:_jobId
                    }
                }).success(function (data) {
                        $scope.$emit('$preLoaderStop');

                        if(data.status)
                        {
                            if(data.data.Status == -2)
                            {
                                $scope.showSuccessMsg = false;
                            }
                            else
                            {
                                $location.url('/');
                                $scope.showSuccessMsg = true;
                                Notification.success({ message: "Applied Success..", delay : 2000});
                            }
                        }

                    })
                    .error(function(data, status, headers, config) {
                        $scope.$emit('$preLoaderStop');
                    });
            }




        }]);