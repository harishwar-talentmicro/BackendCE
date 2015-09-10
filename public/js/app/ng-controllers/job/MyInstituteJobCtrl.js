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

            var handleNoGeolocation = function () {
            };
            $scope.googleMap = new GoogleMap();

            var promise = $scope.googleMap.getCurrentLocation()
            promise.then(function (resp) {
               if (resp)
                {
                   $scope.lat = $scope.googleMap.currentMarkerPosition.latitude;
                   $scope.lng = $scope.googleMap.currentMarkerPosition.longitude;

                    //Redirect to search job page
                    RedirectToSearchPage();

                }
                else
                {
                     handleNoGeolocation();
                }
            }, function () {
                handleNoGeolocation();
            });

            function RedirectToSearchPage()
            {
                $location.url('/jobsearch?searchTerm=&proximity=0&experience=null&lat='+ $scope.lat +'&lng='+ $scope.lng+'&jobType=0,1,2,3,4,5,6,7&jobSearchType=1');
            }

        }]);