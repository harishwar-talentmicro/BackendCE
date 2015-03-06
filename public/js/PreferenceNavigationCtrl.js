/**
 * Created by admin on 6/3/15.
 */
angular.module('ezeidApp').controller('PreferenceNavigationCtrl',['$scope','$rootScope','$http','Notification',function($scope,$rootScope,$http,Notification){

//    $scope.pageSubuser = "html/subusers.html";
    $scope.pageItemMaster = "html/subusers.html";
//    $scope.pageItemMaster = "html/item-master.html";
    $scope.pageSubuser = "html/item-master.html";
    $scope.pageStatusTypes = "html/status-types.html";
    $scope.pageActionTypes = "html/action-types.html";
    $scope.pageRules = "html/rules.html";
    $scope.pageWorkingHours = "html/working-hours.html";
    $scope.pageHolidayCalender = "html/holiday-calender.html";
    $scope.pageBusinessListing = "html/business-listing.html";

    $scope.activeTemplate = $scope.pageSubuser;

    $scope.changeActive = function(active){
      $scope.activeTemplate = active;
    };

}]);