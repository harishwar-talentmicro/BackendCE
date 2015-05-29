

angular.module('ezeidApp').controller('PasswordCtrl',[
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


        /**
         * Hiding progress loader when userDetails are loaded successfully
         */
        if(!$scope.userDetails){
            $scope.$emit('$preLoaderStart');
            $scope.loadUserDetails().then(function(){
                $scope.$emit('$preLoaderStop');
            },function(){
                $scope.$emit('$preLoaderStop');
            });
            $scope.$watch('userDetails',function(newVal,oldVal){
                if(newVal){
                    if(newVal.MasterID){
                        $scope.dataProgressLoader.dataLoadInProgress = false;
                        $scope.dataProgressLoader.dataLoadError = false;
                        $scope.dataProgressLoader.dataLoadComplete = true;
                    }
                }

            });
        }

        $scope.currentPassword = '';
        $scope.newPassword = '';

        /**
         * Changes Password of current user
         */
        $scope.changePassword = function(){
            $http({
                method : "POST",
                url : GURL + 'ewtChangePassword',
                data : {
                    Token : $rootScope._userInfo.Token,
                    OldPassword : $scope.currentPassword,
                    NewPassword : $scope.newPassword
                }

            }).success(function(resp){
                    if(resp && resp !== 'null' && resp.hasOwnProperty('IsChanged')){
                        if(resp.IsChanged){
                            Notification.success({
                               message : 'Your password is changed successfully',
                                delay : MsgDelay
                            });
                            $scope.currentPassword = '';
                            $scope.newPassword = '';
                            $scope.renewPassword = '';
                        }
                        else{
                            Notification.error({
                                message : 'You current password doesn\'t matched',
                                delay : MsgDelay
                            })
                        }

                    }
                    else{
                        Notification.error({
                            message : 'An error occured ! Please try again',
                            delay : MsgDelay
                        });
                    }
                // ////console.log(resp);
            }).error(function(err){
                Notification.error({
                    message : 'An error occured ! Please try again',
                    delay : MsgDelay
                });
            });
        };
    }]);