/**
 * Password Reset Controller
 * @name SignUpCtrl
 * Manages the password reset and reset code validation when user opens the forget password link to reset his password
 *
 */
"use strict";
(function(){
    angular.module('ezeidApp').
        controller('ResetPasswordCtrl', [
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
            )
            {

                $scope.$emit('$preLoaderStart');
                /**
                 * Flag which decides link is checked or not
                 * @type {boolean}
                 */
                $scope.linkChecked = false;

                /**
                 * 5 min expire code which we get after checking the validity of password reset link
                 * @type {string}
                 */
                $scope.verifyCode = "";

                /**|
                 * Password and re enter password field models
                 * @type {string}
                 */
                $scope.password = "";
                $scope.rePassword = "";

                $scope.viewPassword = false;



                /**
                 * Flag which decides link is invalid or not
                 * @type {boolean}
                 */
                $scope.invalidLink = true;
                $scope.checkLink = function(ezeoneId,resetCode){
                    $http({
                        url : GURL + '',
                        method : 'POST',
                        data : {
                            ezeone_id : ezeoneId,
                            reset_code : resetCode
                        }

                    }).success(function(resp){


                        $scope.$emit('$preLoaderStop');
                        $scope.linkChecked = true;
                        if(resp){
                            if(resp.status){
                                if(resp.data){
                                    if(resp.data.valid){
                                        $scope.invalidLink = false;
                                        $scope.verifyCode = resp.data.verify_code;
                                    }
                                }
                            }
                        }
                        else{
                            Notification.error({
                                title : 'Error', message : 'An error occurred',delay: MsgDelay
                            });
                        }
                    }).error(function(err,statusCode){
                        $scope.linkChecked = true;
                        if(!statusCode){
                            Notification.error({ title : 'Connection Lost',
                                message : 'Please check your connection',delay : MsgDelay});
                        }
                        else{
                            Notification.error({
                                title : 'Error', message : 'An error occurred',delay: MsgDelay
                            });
                        }
                        $scope.$emit('$preLoaderStop');
                    });
                };

                $scope.resetForm = function(){
                    $scope.password = "";
                    $scope.rePassword = "";
                };

                $scope.resetPassword = function(){
                    var defer = $q.defer();

                    $http({
                        url : '',
                        method : 'POST',
                        data : {
                            password : $scope.password,
                            repassword : $scope.resPassword,
                            ezeone_id : $routeParams.ezeone,
                            verify_code : $scope.verifyCode
                        }
                    }).success(function(resp){
                        if(resp){
                            if(resp.status){
                                Notification.success({ title : 'Password reset successful',
                                    message : 'Please login to continue',delay : MsgDelay});

                                $location.path('/');

                            }
                            else{
                                Notification.error({ title : 'Your session expired',
                                    message : 'Please try again to reset your password!',delay : MsgDelay});
                                $location.path('/');
                            }
                        }
                        else{
                            Notification.error({
                                title : 'Error', message : 'An error occurred ! Please try again',delay: MsgDelay
                            });
                        }
                    }).error(function(err,statusCode){
                        defer.reject();
                        if(!statusCode){
                            Notification.error({ title : 'Connection Lost',
                                message : 'Please check your connection',delay : MsgDelay});
                        }
                        else{
                            Notification.error({
                                title : 'Error', message : 'An error occurred',delay: MsgDelay
                            });
                        }
                        $scope.$emit('$preLoaderStop');
                    });

                    return defer.promise;
                };




                if($routeParams['ezeone'] && $routeParams['reset_code']){
                    //$scope.checkLink($routeParams.ezeone,$routeParams.reset_code);

                }
                else{
                    $scope.$emit('$preLoaderStop');
                    $location.path('/');
                }
                $scope.$emit('$preLoaderStop');







            }]);
})();