/**
 * Created by admin on 6/3/15.
 */
angular.module('ezeidApp').controller('ConfigurationNavigationCtrl',[
    '$scope',
    '$rootScope',
    '$http',
    'Notification',
    'GURL',
    '$location',
    function(
        $scope,
        $rootScope,
        $http,
        Notification,
        GURL,
        $location
        ){

    /**
     * Hiding progress loader when userDetails are loaded successfully
     */
    if(!$scope.userDetails){
        $scope.loadUserDetails();
        $scope.$watch('userDetails',function(newVal,oldVal){
            if(newVal){
                if(newVal.MasterID){
                    $scope.dataProgressLoader.dataLoadInProgress = false;
                    $scope.dataProgressLoader.dataLoadError = false;
                    $scope.dataProgressLoader.dataLoadComplete = true;

                    if(newVal.IDTypeID !== 2 && newVal.SelectionType !== 2){
                        $location.path('/profile-manager/user');
                    }
                }
            }

        });
    };

    /**
     * @todo Create and add template for resource creation and mapping with reservation items
     */

        $scope.pageSubuser = "html/profile/configuration/subviews/subusers.html";
        $scope.pageItemMaster = "html/profile/configuration/subviews/item-master.html";
        $scope.pageResources = "html/profile/configuration/subviews/reservation-resource.html";
        $scope.pageStatusTypes = "html/profile/configuration/subviews/status-types.html";
        $scope.pageActionTypes = "html/profile/configuration/subviews/action-types.html";
        $scope.pageRules = "html/profile/configuration/subviews/rules.html";
        $scope.pageWorkingHours = "html/profile/configuration/subviews/working-hours.html";
        $scope.pageHolidayCalender = "html/profile/configuration/subviews/holiday-calender.html";
        $scope.pageModuleSettings = "html/profile/configuration/subviews/module-settings.html";

        $scope.activeSubTemplate = $scope.pageModuleSettings;

        $scope.changeActive = function(active){
            $scope.activeSubTemplate = active;
        };



}]);