/**
 * Created by admin on 6/3/15.
 */
angular.module('ezeidApp').controller('ConfigurationNavigationCtrl',['$scope','$rootScope','$http','Notification','GURL',function($scope,$rootScope,$http,Notification,GURL){

    /**
     * Hiding progress loader when userDetails are loaded successfully
     */
    $scope.$watch('userDetails',function(newVal,oldVal){
        if(newVal.MasterID){
            $scope.dataProgressLoader.dataLoadInProgress = false;
            $scope.dataProgressLoader.dataLoadError = false;
            $scope.dataProgressLoader.dataLoadComplete = true;
        }
    });

    /**
     * @todo Create and add template for resource creation and mapping with reservation items
     */
    $scope.pageSubuser = "html/subusers.html";
    $scope.pageItemMaster = "html/item-master.html";
    $scope.pageResources = "html/reservation-resource.html";
    $scope.pageStatusTypes = "html/status-types.html";
    $scope.pageActionTypes = "html/action-types.html";
    $scope.pageRules = "html/rules.html";
    $scope.pageWorkingHours = "html/working-hours.html";
    $scope.pageHolidayCalender = "html/holiday-calender.html";
    $scope.pageBusinessListing = "html/business-listing.html";
    $scope.pageModuleSettings = "html/module-settings.html";

    $scope.activeSubTemplate = $scope.pageModuleSettings;

    $scope.changeActive = function(active){
        $scope.activeSubTemplate = active;
    };

}]);