(function() {
    angular.module('ezeidApp').controller('CompanyProfileCtrl', [
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
        '$route',
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
            $route) {


            $scope.$emit('$preLoaderStart');
            if($rootScope._userInfo.Verified !== 2){
                $scope.$emit('$preLoaderStop');
                Notification.error({ message : 'Please be verified by EZEID Area Partner before accessing this area', delay : MsgDelay});
                $location.path('/profile-manager/user');
            }


            /**
             * Company Profile Loaded from service
             * @type {string}
             */
            $scope.companyProfile = '';

            /**
             * Editing Mode Company Profile
             * @type {string}
             */
            $scope.companyProfileEdit = '';

            /**
             * Edit Mode Flag
             * @type {boolean}
             */
            $scope.editMode = false;

            /**
             * Toggles EditMode for company profile
             * Copies actual company profile to edit mode when edit mode is to be enabled
             */
            $scope.toggleEditMode = function(){
                if(!$scope.editMode){
                    $scope.companyProfileEdit = $scope.companyProfile;
                }
                $scope.editMode = !$scope.editMode;
            };


            /**
             * Saves edited company profile on server
             * Copies editing Mode CompanyProfile to companyProfile view mode
             * and toggles editing mode
             */
            $scope.saveCompanyProfile = function(){
                $http({
                    url : GURL + 'ewtCompanyProfile',
                    method : 'POST',
                    data : {
                        Token : $rootScope._userInfo.Token,
                        CompanyProfile : $scope.companyProfileEdit
                    }
                }).success(function(resp){
                    if(resp && resp !== 'null' && resp.hasOwnProperty('IsSuccessfull'))
                    {
                        if(resp.IsSuccessfull){
                            Notification.success({ message : 'Company Profile is saved successfully', delay : MsgDelay});
                            $scope.companyProfile = $scope.companyProfileEdit;
                            $scope.toggleEditMode();
                        }
                        else{
                            Notification.error({ message : 'An error occured while saving company profile', delay : MsgDelay});
                        }

                    }
                    else{
                        Notification.error({ message : 'An error occured while saving company profile', delay : MsgDelay});
                    }
                }).error(function(err){
                    Notification.error({ message : 'An error occured while saving company profile', delay : MsgDelay});
                });
            };



            var initialize = function(){
                $scope.loadUserDetails().then(function(){
                    $scope.dataProgressLoader.dataLoadInProgress = false;
                    $scope.dataProgressLoader.dataLoadError = false;
                    $scope.dataProgressLoader.dataLoadComplete = true;
                    loadCompanyProfile();
                },function(){
                    Notification.error({ message : 'Something went wrong ! Please refresh the page', delay : MsgDelay});
                    $scope.dataProgressLoader.dataLoadInProgress = false;
                    $scope.dataProgressLoader.dataLoadError = true;
                    $scope.dataProgressLoader.dataLoadComplete = false;
                });
            };


            var loadCompanyProfile = function(){
                $http({
                    url : GURL + 'ewtCompanyProfile',
                    method : 'GET',
                    params : {
                        Token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){
                    $scope.$emit('$preLoaderStart');
                    ////////console.log(resp);
                    if(resp && resp !== 'null' && resp.hasOwnProperty('Result')){
                        if(resp.Result.length > 0){
                            if(resp.Result[0].TagLine){
                                $scope.companyProfile = resp.Result[0].TagLine;
                            }
                        }
                        else{
                            Notification.error({ message : 'Unable to load your company profile information', delay : MsgDelay});
                        }
                    }
                    else{
                        Notification.error({ message : 'Unable to load your company profile information', delay : MsgDelay});
                    }
                }).error(function(err){
                    $scope.$emit('$preLoaderStart');
                    Notification.error({ message : 'Unable to load your company profile information', delay : MsgDelay});
                });
            };




            if($rootScope._userInfo){

                if($rootScope._userInfo.Type != 2){
                  $location.path('/');
                }
                else{
                    initialize();
                }
            }
            else{
                $location.path('/');
            }

        }])
})();