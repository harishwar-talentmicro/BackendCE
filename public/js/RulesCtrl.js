/**
 * Created by admin on 6/3/15.
 */
angular.module('ezeidApp').controller('RulesCtrl',['$scope','$interval','$http','Notification','$rootScope','$filter',function($scope,$interval,$http,Notification,$rootScope,$filter){
    //Initially First Tab is selected
    $scope.selectedTab = 1;

    //Open Modal box for user
    $scope.showModal = false;

    $scope.openModalBox = function(event){
        $scope.showModal = !$scope.showModal;
    };

    $scope.modalBox = {
        title : 'Add new Folder'
    };

}]);