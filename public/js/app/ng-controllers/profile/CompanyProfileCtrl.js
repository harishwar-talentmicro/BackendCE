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

            console.log($rootScope._userInfo);

            $scope.dataProgressLoader.dataLoadInProgress = false;
            $scope.dataProgressLoader.dataLoadError = false;
            $scope.dataProgressLoader.dataLoadComplete = true;

            var init = function(){
                $http({
                    url : GURL + 'ewtCompanyProfile',
                    method : 'GET',
                    params : {
                        Token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){
                    console.log(resp);
                }).error(function(err){
                    console.log('err');
                });
            };


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
                    console.log(resp);
                }).error(function(err){
                    console.log(err);
                });
            };


            if($rootScope._userInfo){

                if($rootScope._userInfo.Type != 2){
                  $location.path('/');
                }
                else{
                    init();
                }
            }
            else{
                $location.path('/');
            }

        }])
})();