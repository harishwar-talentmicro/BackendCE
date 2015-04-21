/**
 * StatusTypesCtrl
 * RuleFilter can be used for Filtering Status too, as both contain FunctionType(Sales,Reservation,HomeDelivery..) Property
 */
angular.module('ezeidApp').controller('StatusTypesCtrl',['$scope','$rootScope','$http','Notification','$filter','MsgDelay','GURL',function($scope,$rootScope,$http,Notification,$filter,MsgDelay,GURL){
    //Initially First Tab is selected
    $scope.selectedTab = 1;
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
        1 : "Active",
        2 : "Inactive"
    };


    /***
     * All types of items will reside in this model
     * @type {{sales: Array, reservation: Array, homeDelivery: Array, service: Array, resume: Array}}
     */
    $scope.txStatuses = {
        sales : [],
        reservation : [],
        homeDelivery : [],
        service : [],
        resume : []
    };



    // Item types (functionTypes) available to the system
    $scope.itemTypes = [
        'Sales',
        'Reservation',
        'Home Delivery',
        'Service',
        'Resume'
    ];

    /**
     *     Open Modal box for user
     */
    $scope.showModal = false;
    $scope.toggleModalBox = function(event){
        if(event){
            var element = event.currentTarget;
            var userIndex = $(element).data('index');
            $scope.modalBox.subuser = $scope.subusers[userIndex];
            $scope.modalBox.title = "Update Status Type";
            $scope.modalBox.txStatus = {
                TID : 0,
                type : 0,           // Function Type
                title : "",
                progress : 0,       // Progress % for this title
                status : 1,         // 1 : Active
                notificationMsg : "",   // Notification Message
                notificationMailMsg : "",   // Notification Mail Message
                statusValue : 0
            }

        }
        else{
            $scope.resetModalData();
        }
        $scope.showModal = !$scope.showModal;
    };

    $scope.resetModalData = function(){
        $scope.modalBox = {
            title : "Add new Status Type",
            txStatus : {
                TID : 0,
                type : 0,           // Function Type
                title : "",
                progress : 0,       // Progress % for this title
                status : 1,         // 1 : Active
                notificationMsg : "",   // Notification Message
                notificationMailMsg : "",   // Notification Mail Message
                statusValue : 0
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
                    $scope.loadTxStatusTypes();
                }
            }).error(function(err){
                Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
            });

    };

    $scope.statusValueLimit = 10;

    /**
     * For generating Status Values from 1 to 40
     * @param num
     * @returns {Array}
     */
    $scope.getNumber = function(num) {
        return new Array(num);
    }


    $scope.validateTxStatus = function(txStatus){
        /**
         * @todo Validate all fields and then allow saving of txStatus
         */
        return true;
    };

    $scope.saveTxStatus = function(){
        if($scope.validateTxStatus($scope.modalBox.txStatus)){
            var data = {
                Token : $rootScope._userInfo.Token,
                TID : $scope.modalBox.txStatus.TID,
                Title : $scope.modalBox.txStatus.title,
                MasterID : $scope.masterUser.MasterID,
                FunctionType : $scope.modalBox.txStatus.type,
                Progress : $scope.modalBox.txStatus.progress,
                Status : $scope.modalBox.txStatus.status,
                NotificationMsg : $scope.modalBox.txStatus.notificationMsg,
                NotificationMailMsg: $scope.modalBox.txStatus.notificationMailMsg,
                StatusValue : $scope.modalBox.txStatus.statusValue
            };

            $http({
                url : GURL + 'ewmSaveStatusType',
                data : data,
                method : 'POST'
            }).success(function(resp){
                if(resp && resp !== 'null' && resp.hasOwnProperty('IsSuccessfull')){
                    if(resp.IsSuccessfull){
                        Notification.success({ message : 'Status added successfully', delay : MsgDelay});
                    }
                    else{
                        Notification.error({ message : 'An error occured while adding status', delay : MsgDelay});
                    }
                }
                else{
                    Notification.error({ message : 'An error occured while adding status', delay : MsgDelay});
                }
            }).error(function(err){
                    Notification.error({ message : 'An error occured while adding status', delay : MsgDelay});
            });
        }
        else{
            return;
        }
    };


    $scope.loadTxStatusTypes = function(functionType){

        var fType = (typeof(functionType) !== "undefined") ? functionType : $scope.functionTypeCount;
        $http({
            url : GURL + 'ewtGetStatusType',
            method : "GET",
            params : {
                Token : $rootScope._userInfo.Token,
                FunctionType : fType,
                MasterID : ($scope._userInfo.MasterID) ? $scope._userInfo.MasterID : $scope.masterUser.MasterID
            }
        }).success(function(resp){
                var functionTypes = ['sales','reservation','homeDelivery','service','resume'];

                /**
                 * If functionType is set in function, it will be called once only
                 */

                if(typeof(functionType) !== "undefined"){
                    if(resp && resp.length > 0 && resp !== 'null'){
                        $scope.txStatuses[functionTypes[fType]] = resp;
                    }
                }

                /**
                 * It will try to load all items and will increase the counter( loading all types of items initially)
                 */
                else{
                    if(resp && resp.length > 0 && resp.length !== 'null'){
                        $scope.txStatuses[functionTypes[fType]] = resp;
                    }

                    $scope.count += 1;
                    if($scope.count < 5){
                        $scope.loadItems();
                    }
                }
            }).error(function(err){
                console.log(err);
            });
    };


    $scope.getMasterUserDetails();

}]);