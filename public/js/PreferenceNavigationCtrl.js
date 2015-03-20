/**
 * Created by admin on 6/3/15.
 */
angular.module('ezeidApp').controller('PreferenceNavigationCtrl',['$scope','$rootScope','$http','Notification','GURL',function($scope,$rootScope,$http,Notification,GURL){

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

    $scope.activeTemplate = $scope.pageModuleSettings;

    $scope.changeActive = function(active){
      $scope.activeTemplate = active;
    };

}]);