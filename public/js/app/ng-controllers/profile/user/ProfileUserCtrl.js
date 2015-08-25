angular.module('ezeidApp').controller('ProfileUserCtrl',[
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


        $scope.newUserDetails = {};
        /**
         * Calling new API for loading user details
         * i.e. user_details_new
         */
        $scope.loadNewUserDetails = function(){
            var defer = $q.defer();
            $http({
                method : "GET",
                url : GURL + "user_details_new",
                params : {
                    token : $rootScope._userInfo.Token
                }
            }).success(function(resp){
                if(resp && resp !== 'null'){
                    if(resp.status){
                        for(var x=0; x < resp.data.locationcount; x++){
                            $scope.locCount.push({ id : x});
                        }
                        $scope.newUserDetails = resp.data;
                        defer.resolve(resp);

                    }
                    else{
                        defer.resolve(resp);
                    }
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
            $scope.loadNewUserDetails().then(function(){
                $scope.$emit('$preLoaderStop');
            },function(){
                $scope.$emit('$preLoaderStop');
            });
        });
    }
]);