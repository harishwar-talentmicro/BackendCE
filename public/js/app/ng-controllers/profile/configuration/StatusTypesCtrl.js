/**
 * StatusTypesCtrl
 * RuleFilter can be used for Filtering Status too, as both contain FunctionType(Sales,Reservation,HomeDelivery..) Property
 */
angular.module('ezeidApp').controller('StatusTypesCtrl',['$scope','$rootScope','$http','Notification','$filter','MsgDelay','GURL',function($scope,$rootScope,$http,Notification,$filter,MsgDelay,GURL){
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
        'Help Desk',
        'Resume'
    ];

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

    /**
     *     Open Modal box for user
     */
    $scope.showModal = false;
    $scope.toggleModalBox = function(type,index){

        if(typeof(index) !== "undefined" && typeof(type) !== "undefined"){
            // //////////console.log(index+'   '+type);
            $scope.modalBox.txStatus = angular.copy($scope.txStatuses[functionTypes[type]][index]);
            $scope.modalBox.title = "Update Status Type";
        }
        else{

            $scope.resetModalData();
            $scope.modalBox = {
                title : "Add new Status Type",
                txStatus : {
                    TID : 0,
                    type : type,           // Function Type
                    title : "",
                    progress : 0,       // Progress % for this title
                    status : 1,         // 1 : Active
                    notificationMsg : "",   // Notification Message
                    notificationMailMsg : "",   // Notification Mail Message
                    statusValue : 0
                }
            };
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

    $scope.$watch('modalBox.txStatus.progress',function(n,v){
       if(parseInt(n) == NaN || parseInt(n) < 0 || parseInt(n)> 100){
            $scope.modalBox.txStatus.progress = 0;
       };
    });

    /**
     * For generating Status Values from 1 to 40
     * @param num
     * @returns {Array}
     */
    $scope.getNumber = function(num) {
        return new Array(num);
    };

    $scope.statusOptions = [
            '0 (New)',
            '1 (In process)',
            '2 (In process)',
            '3 (In process)',
            '4 (In process)',
            '5 (In process)',
            '10 (Completed)',
            '11 (Dropped)',
            '12 (Cancelled)',
        ];


    $scope.validateTxStatus = function(txStatus){
        var verror = [];
        if(!txStatus.title){
            verror.push('stage title');
        }
        if(txStatus.progress == ''){
            verror.push('progress');
        }
        if(txStatus.statusValue == ''){
            verror.push('stage value');
        }
        //console.log(verror);
        if(verror.length  > 0){
            Notification.error({ title : 'Error', msg : 'Please check '+ verror.concat(', '), delay : MsgDelay});
            return false;
        }
        else{
            return true;
        }
    };

    $scope.saveTxStatus = function(){
        if($scope.validateTxStatus($scope.modalBox.txStatus)){
            var data = {
                Token : $rootScope._userInfo.Token,
                TID : $scope.modalBox.txStatus.TID,
                StatusTitle : $scope.modalBox.txStatus.title,
                MasterID : $scope.masterUser.MasterID,
                FunctionType : $scope.modalBox.txStatus.type,
                ProgressPercent : $scope.modalBox.txStatus.progress,
                Status : (parseInt($scope.modalBox.txStatus.status) !== NaN ) ? $scope.modalBox.txStatus.status : 1,
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
                        if($scope.modalBox.txStatus.TID)
                        {
                            var salesArr = $scope.txStatuses[functionTypes[$scope.modalBox.txStatus.type]];
                            var index  = salesArr.indexOfWhere('TID',$scope.modalBox.txStatus.TID);
                            for(var prop in salesArr[index]){
                                if(salesArr[index].hasOwnProperty(prop)){
                                    // //////////console.log(prop);
                                    $scope.txStatuses[functionTypes[$scope.modalBox.txStatus.type]][index][prop] = $scope.modalBox.txStatus[prop];
                                }
                            }

                        }
                        else{
                            var txStatus = angular.copy($scope.modalBox.txStatus);
                            $scope.txStatuses[functionTypes[$scope.modalBox.txStatus.type]].push(txStatus);
                        }

                        $scope.resetModalData();
                        $scope.toggleModalBox();
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
                FunctionType : fType
            }
        }).success(function(resp){


                /**
                 * If functionType is set in function, it will be called once only
                 */

                if(typeof(functionType) !== "undefined"){
                    if(resp && resp.length > 0 && resp !== 'null'){
                        for(var i = 0 ; i < resp.length ; i++){
                            var txStatus = {
                                TID : resp[i].TID,
                                type : fType,           // Function Type
                                title : resp[i].StatusTitle,
                                progress : (resp[i].ProgressPercent) ? resp[i].ProgressPercent : 0,       // Progress % for this title
                                status : resp[i].Status,         // 1 : Active
                                notificationMsg : resp[i].NotificationMsg,   // Notification Message
                                notificationMailMsg : resp[i].NotificationMailMsg,   // Notification Mail Message
                                statusValue : (resp[i].StatusValue) ? resp[i].StatusValue : 0
                            }
                            $scope.txStatuses[functionTypes[fType]].push(txStatus);

                        }

                        // //////////console.log($scope.txStatuses);
                    }
                }

                /**
                 * It will try to load all items and will increase the counter( loading all types of items initially)
                 */
                else{
                    if(resp && resp.length > 0 && resp !== 'null'){
                        for(var i = 0 ; i < resp.length ; i++){
                            var txStatus = {
                                TID : resp[i].TID,
                                type : fType,           // Function Type
                                title : resp[i].StatusTitle,
                                progress : (resp[i].ProgressPercent) ? resp[i].ProgressPercent : 0,       // Progress % for this title
                                status : resp[i].Status,         // 1 : Active
                                notificationMsg : resp[i].NotificationMsg,   // Notification Message
                                notificationMailMsg : resp[i].NotificationMailMsg,   // Notification Mail Message
                                statusValue : (resp[i].StatusValue) ? resp[i].StatusValue : 0
                            }
                            $scope.txStatuses[functionTypes[fType]].push(txStatus);
                        }
                        // //////////console.log($scope.txStatuses);
                    }
                }
            }).error(function(err,statusCode){
                var msg = "An error occurred while loading Status Types";
                if(!statusCode){
                    msg = "Unable to reach server ! Please check your connection";
                }
                Notification.error({ message : msg, delay : MsgDelay});
                // //////////console.log(err);
            });
    };


    $scope.getMasterUserDetails();

}]);