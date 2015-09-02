/**
 * @author: Krunal[EZEOne]
 * @since 30082015
 */
angular.module('ezeidApp').
    controller('MyInstituteJobCtrl', [
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
        'GoogleMaps',
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
            UtilityService,
            GoogleMap
        ) {


            $scope.lat = "";
            $scope.lng = "";

            getMyInstituteJob();

            var handleNoGeolocation = function () {
            };
            $scope.googleMap = new GoogleMap();

            var promise = $scope.googleMap.getCurrentLocation()
            promise.then(function (resp) {
               if (resp)
                {
                   $scope.lat = $scope.googleMap.currentMarkerPosition.latitude;
                   $scope.lng = $scope.googleMap.currentMarkerPosition.longitude;

                    // call for get my institute jobs
                    getMyInstituteJob();
                }
                else
                {
                     handleNoGeolocation();
                }
            }, function () {
                handleNoGeolocation();
            });

            function getMyInstituteJob()
            {
                if($rootScope._userInfo.IsAuthenticate)
                {
                    $scope.$emit('$preLoaderStart');
                    $http({ method: 'get',
                        url: GURL + 'job_myinstitute',
                        params:
                        {
                            latitude: 54.54,
                            longitude: 1545.55,
                            token: $rootScope._userInfo.Token
                            /*latitude: $scope.lat,
                            longitude: $scope.lng,
                            token: $rootScope._userInfo.Token*/
                        }
                    }).success(function (response) {
                            $scope.$emit('$preLoaderStop');
                            if(response.status)
                            {
                                $scope.resultData = response.data;
                            }
                        }).error(function(){
                            Notification.error({ message : 'An error occurred', delay : MsgDelay});
                            $scope.$emit('$preLoaderStop');
                        });
                }
                else
                {
                    $location.url('/');
                }
            }

            /**
             * Get experience string
             */
            $scope.getExperienceString = function(exp1,exp2)
            {
                if(!parseInt(exp1) > 0 && !parseInt(exp2) > 0)
                {
                    return  "NA";
                }
                if(parseInt(exp1) == parseInt(exp2))
                {
                    return exp1+" Years";
                }
                else if(parseInt(exp1) < parseInt(exp2))
                {
                    return exp1+"-"+exp2+" Years";
                }
                else
                {
                    return exp2+"-"+exp1+" Years";
                }
            };

            /**
             * Set keySkills
             */
            $scope.activeSkillsArray = [];
            $scope.getKeySkillsArray = function(skillString)
            {
                $scope.activeSkillsArray = skillString.split(",");
            };

            /**
             * Get the salary range
             */
            $scope.getSalaryRange = function(salaryFrom,salaryTo)
            {
                if(!parseInt(salaryFrom) > 0 && !parseInt(salaryTo) > 0)
                {
                    return  "NA";
                }
                if(parseInt(salaryFrom) == parseInt(salaryTo))
                {
                    return UtilityService.currencyStyleConverter(salaryFrom);
                }
                else if(parseInt(salaryFrom) < parseInt(salaryTo))
                {
                    return UtilityService.currencyStyleConverter(salaryFrom)+" - "+UtilityService.currencyStyleConverter(salaryTo);
                }
                else
                {
                    return UtilityService.currencyStyleConverter(salaryTo)+" - "+UtilityService.currencyStyleConverter(salaryFrom);
                }
            };

            /**
             * Redirect to jobDetail page
             */
            $scope.redirectJobDetailPage = function(tid)
            {
                $location.url('/jobdetail' + '?jobid='+tid);
            };

            /**
             * Redirect to notify-applicant page
             */
            $scope.redirectNotifyPage = function(tid)
            {
                $location.url('/notify-applicant' + '?jobid='+tid);
            };


        }]);