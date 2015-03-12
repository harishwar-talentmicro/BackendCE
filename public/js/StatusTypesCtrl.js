/**
 * StatusTypesCtrl
 * RuleFilter can be used for Filtering Status too, as both contain FunctionType(Sales,Reservation,HomeDelivery..) Property
 */
angular.module('ezeidApp').controller('StatusTypesCtrl',['$scope','$rootScope','$http','Notification','$filter','MsgDelay','GURL',function($scope,$rootScope,$http,Notification,$filter,MsgDelay,GURL){

    /**
     * Main EZEID logged in as business user and having verified status
     * @type {null}
     */
    $scope.masterUser = null;

    /**
     * Sub user Status Mapping
     * @type {{1: string, 2: string}}
     */
    $scope.status = {
        1 : "Inactive",
        2 : "Active"
    };


    /**
     *     Open Modal box for user
     */
    $scope.showModal = false;
    $scope.toggleModalBox = function(event){
        if(event){
            var element = event.currentTarget;
            var userIndex = $(element).data('index');
            $scope.modalBox.subuser = $scope.subusers[userIndex];
            $scope.modalBox.title = "Update Subuser";
            $scope.modalBox.ezeidExists = true;
            $scope.modalBox.isEzeidAvailable = true;
            var callback = function(){
                $scope.modalBox.subuser = $scope.subusers[userIndex];
            };
            $scope.checkAvailability(callback());

        }
        else{
            $scope.resetModalData();
        }
        $scope.showModal = !$scope.showModal;
    };

    $scope.resetModalData = function(){
        $scope.modalBox = {
            title : "Add new Status Type",
            statusItem : {
                //@todo Define default values for resetting modal data
            }
        };
    };

    /**
     * Function type count for loading rules based on functionType
     * @type {number}
     */
    $scope.functionTypeCount = 0;
    /**
     * Getting Master User Details
     * Then calling loadRules Function to load all statuses
     */
    $scope.getMasterUserDetails = function(){
        $http({
            url : GURL + 'ewtGetUserDetails',
            method : "GET",
            params :{
                Token : $rootScope._userInfo.Token
            }
        }).success(function(resp){
                if(resp.length>0){
                    $scope.masterUser = resp[0];
                    $scope.loadAllStatuses();
                }
            }).error(function(err){
                Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
            });

    };

}]);