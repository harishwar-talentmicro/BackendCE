/**
 * Created by admin on 6/3/15.
 */
angular.module('ezeidApp').controller('ItemMasterCtrl',['$scope','$interval','$http','Notification','$rootScope','$filter',function($scope,$interval,$http,Notification,$rootScope,$filter){
    //Initially First Tab is selected
    $scope.selectedTab = 1;

    //Open Modal box for user
    $scope.showModal = false;

    $scope.openModalBox = function(event){
//        if(event){
//            var element = event.currentTarget;
//            var userIndex = $(element).data('index');
//            $scope.modalBox.subuser = $scope.subusers[userIndex];
//            $scope.modalBox.title = "Update Subuser";
//            $scope.modalBox.ezeidExists = true;
//            $scope.modalBox.isEzeidAvailable = true;
//        }
//        else{
//            $scope.resetModalData();
//        }
        console.log($scope.showModal);
        $scope.showModal = !$scope.showModal;
    };

    $scope.modalBox = {
      title : 'Add new Item'
    };

}]);