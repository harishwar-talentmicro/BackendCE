/**
 * StatusTypesCtrl
 * RuleFilter can be used for Filtering Status too, as both contain FunctionType(Sales,Reservation,HomeDelivery..) Property
 */
angular.module('ezeidApp').controller('ActionTypesCtrl',['$scope','$rootScope','$http','Notification','$filter','MsgDelay','GURL',function($scope,$rootScope,$http,Notification,$filter,MsgDelay,GURL){
    var functionTypes = ['sales','reservation','homeDelivery','service','resume'];

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
    $scope.txActionTypes = {
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
        'Help Desk',
        'Resume'
    ];

    $scope.modalBox = {
        title : "Add new Action Type",
        txActionType : {
            TID : 0,
            type : 0,           // Function Type
            title : "",
            status : 1
        }
    };

    /**
     *     Open Modal box for user
     */
    $scope.showModal = false;
    $scope.toggleModalBox = function(type,index){

        if(typeof(index) !== "undefined" && typeof(type) !== "undefined"){
            // //////console.log(index+'   '+type);
            $scope.modalBox.txActionType = angular.copy($scope.txActionTypes[functionTypes[type]][index]);
            $scope.modalBox.title = "Update Action Type";
        }
        else{

            $scope.resetModalData();
            $scope.modalBox = {
                title : "Add new Action Type",
                txActionType : {
                    TID : 0,
                    type : type,           // Function Type
                    title : "",
                    status : 1
                }
            };
        }
        $scope.showModal = !$scope.showModal;
    };

    $scope.resetModalData = function(){
        $scope.modalBox = {
            title : "Add new Action Type",
            txActionType : {
                TID : 0,
                type : 0,           // Function Type
                title : "",
                status : 1
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
                    $scope.loadTxActionTypes();
                }
            }).error(function(err){
                Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
            });

    };


    $scope.validateTxStatus = function(txStatus){
        /**
         * @todo Validate all fields and then allow saving of txStatus
         */
        return true;
    };

    $scope.saveTxActionType = function(){
        if($scope.validateTxStatus($scope.modalBox.txActionType)){
            var data = {
                Token : $rootScope._userInfo.Token,
                TID : $scope.modalBox.txActionType.TID,
                ActionTitle : $scope.modalBox.txActionType.title,
                Status : $scope.modalBox.txActionType.status,
                FunctionType : $scope.modalBox.txActionType.type
            };

            $http({
                url : GURL + 'ewmSaveActionType',
                data : data,
                method : 'POST'
            }).success(function(resp){
                if(resp && resp !== 'null' && resp.hasOwnProperty('IsSuccessfull')){
                    if(resp.IsSuccessfull){
                        Notification.success({ message : 'Status added successfully', delay : MsgDelay});
                        if($scope.modalBox.txActionType.TID)
                        {
                            var salesArr = $scope.txActionTypes[functionTypes[$scope.modalBox.txActionType.type]];
                            var index  = salesArr.indexOfWhere('TID',$scope.modalBox.txActionType.TID);
                            for(var prop in salesArr[index]){
                                if(salesArr[index].hasOwnProperty(prop)){
                                    // //////console.log(prop);
                                    $scope.txActionTypes[functionTypes[$scope.modalBox.txActionType.type]][index][prop] = $scope.modalBox.txActionType[prop];
                                }
                            }

                        }
                        else{
                            var txActionType = angular.copy($scope.modalBox.txActionType);
                            $scope.txActionTypes[functionTypes[$scope.modalBox.txActionType.type]].push(txActionType);
                        }

                        $scope.resetModalData();
                        $scope.toggleModalBox();
                    }
                    else{
                        Notification.error({ message : 'An error occurred while adding status', delay : MsgDelay});
                    }
                }
                else{
                    Notification.error({ message : 'An error occurred while adding status', delay : MsgDelay});
                }
            }).error(function(err){
                    Notification.error({ message : 'An error occurred while adding status', delay : MsgDelay});
            });
        }
        else{
            return;
        }
    };


    $scope.loadTxActionTypes = function(functionType){

        var fType = (typeof(functionType) !== "undefined") ? functionType : $scope.functionTypeCount;
        $http({
            url : GURL + 'ewtGetActionType',
            method : "GET",
            params : {
                Token : $rootScope._userInfo.Token,
                FunctionType : fType,
                MasterID : ($scope._userInfo.MasterID) ? $scope._userInfo.MasterID : $scope.masterUser.MasterID
            }
        }).success(function(resp){


                /**
                 * If functionType is set in function, it will be called once only
                 */

                if(typeof(functionType) !== "undefined"){
                    if(resp && resp.length > 0 && resp !== 'null'){
                        for(var i = 0 ; i < resp.length ; i++){
                            var txActionType = {
                                TID : resp[i].TID,
                                type : fType,           // Function Type
                                title : resp[i].ActionTitle,
                                status : (resp[i].Status) ? resp[i].Status : 1        // 1 : Active

                            }
                            $scope.txActionTypes[functionTypes[fType]].push(txActionType);

                        }
                    }
                }

                /**
                 * It will try to load all items and will increase the counter( loading all types of items initially)
                 */
                else{
                    if(resp && resp.length > 0 && resp.length && resp !== 'null'){
                        for(var i = 0 ; i < resp.length ; i++){
                            var txActionType = {
                                TID : resp[i].TID,
                                type : fType,           // Function Type
                                title : resp[i].ActionTitle,
                                status : (resp[i].Status) ? resp[i].Status : 1         // 1 : Active
                            }
                            $scope.txActionTypes[functionTypes[fType]].push(txActionType);
                        }
                        // //////console.log($scope.txActionTypes);
                    }

                    $scope.count += 1;
                    if($scope.count < 5){
                        $scope.loadItems();
                    }
                }
            }).error(function(err){
                // //////console.log(err);
            });
    };


    $scope.getMasterUserDetails();

}]);