/**
 * Controller to view all the Applicant list
 *
 * @author: Krunal[EZEOne]
 * @since 31082015
 */

angular.module('ezeidApp').
    controller('ApplicantListing', [
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

            $scope.cv_ids = $routeParams.cv_ids
            getApplicants();

            // Get Applied list
            function getApplicants()
            {
                if($scope.cv_ids)
                {
                    $scope.$emit('$preLoaderStart');
                    $http({
                        url : GURL + 'applicant_list',
                        method : 'GET',
                        params : {
                            token : $rootScope._userInfo.Token,
                            cv_ids : $routeParams.cv_ids
                        }
                    }).success(function(resp){
                            $scope.$emit('$preLoaderStop');

                            if(resp.status)
                            {
                                $scope.applicantData = resp.data;
                            }
                        }).error(function(err){
                            $scope.$emit('$preLoaderStop');
                        });
                }
                else
                {
                    $location.url('/');
                }
            }

        }]);