angular.module('ezeidApp').controller('ProfileLocationCtrl',[
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
    'ScaleAndCropImage',
    'MsgDelay',
    '$location',
    '$routeParams',
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
        ScaleAndCropImage,
        MsgDelay,
        $location,
        $routeParams
    ) {

        $scope.locDetails = {};
        /**
         * Calling new API for loading user details
         * i.e. user_details_new
         */
        $scope.loadLocationDetails = function(){
            var defer = $q.defer();
            $http({
                method : "GET",
                url : GURL + "location_details",
                params : {
                    token : $rootScope._userInfo.Token,
                    seq_no : $scope.activeLoc
                }
            }).success(function(resp) {
                if (resp && resp !== 'null') {
                    console.log(resp);
                    defer.resolve(resp);

                }
                else{
                    defer.resolve(null);
                }
            }).error(function(err){
                defer.resolve(null);
            });
            return defer.promise;
        };


        $scope.masterInit(function(){
            $scope.loadLocationDetails().then(function(){
                $scope.$emit('$preLoaderStop');
            },function(){
                $scope.$emit('$preLoaderStop');
            });
        });
    }
]);