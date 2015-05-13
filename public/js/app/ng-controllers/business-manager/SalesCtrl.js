(function(){
    angular.module('ezeidApp').controller('SalesCtrl',[
        '$rootScope',
        '$scope',
        '$http',
        '$q',
        '$timeout',
        'Notification',
        '$filter',
        '$window',
        'GURL',
        '$interval',
        'MsgDelay',
        '$location',
        '$routeParams',
        '$route',
        'GoogleMaps',
        function (
            $rootScope,
            $scope,
            $http,
            $q,
            $timeout,
            Notification,
            $filter,
            $window,
            GURL,
            $interval,
            MsgDelay,
            $location,
            $routeParams,
            $route,
            GoogleMap
            ) {


            /**
             * Logged in user cannot use this module as he is not having the required permissions for it
             */
            var moduleIndex = $scope.modules.indexOfWhere('type','sales');
            var permission = parseInt($scope.modules[moduleIndex].permission);
            if(permission.isNaN || permission === 0 )
            {
                $location.path('/business-manager');
            };


            /**
             * Permission Configuration for what fields and button should be visible and what should be hidden
             * 0 : Hidden
             * 1 : Read Only
             * 2 : Read,Create and update
             * 3 : Reader,Create and Update
             * 4 : Read and Update
             * 5 : Read and Update
             */

            var permissionConf = [
                {
                    txCreate : false,
                    txList : false,
                    txUpdate : false
                },
                {
                    txCreate : false,
                    txList : true,
                    txUpdate : false
                },
                {
                    txCreate : true,
                    txList : true,
                    txUpdate : true
                },
                {
                    txCreate : true,
                    txList : true,
                    txUpdate : true
                },
                {
                    txCreate : false,
                    txList : true,
                    txUpdate : false
                },{
                    txCreate : false,
                    txList : true,
                    txUpdate : false
                },


            ];

            /**
             * Item list configuration for what fields should be visible and what fields should be hidden on modal box and tx list
             * 0 : msg only
             * 1 : item and description
             * 2 : item, description and picture
             * 3 : item, description, picture and quantity
             * 4 : item, description,picture,quantity, rate
             * @type {*[]}
             */
            var listConf = [
                {
                    message : true,
                    item : false,
                    amount : false
                },
                {
                    message : true,
                    item : true,
                    amount : false
                },
                {
                    message : true,
                    item : true,
                    amount : false
                },
                {
                    message : true,
                    item : true,
                    amount : false
                },
                {
                    message : true,
                    item : true,
                    amount : true
                }
            ];


            $scope.moduleConf = $scope.modules[moduleIndex];
            $scope.salesListConf = listConf[$scope.modules[moduleIndex].listType];
            $scope.salesPermissionConf = permissionConf[$scope.modules[moduleIndex].permission];

            $scope.$emit('$preLoaderStart');


            $(document).on('click','.popover-close',function(){
                $('*[data-toggle="popover"]').popover('hide');
            });

            $scope.pageNumber = 1;
            $scope.statusType = null;
            $scope.txList = [];

            /**
             *
             * Sales items present for this user
             * @type {Array}
             */
            $scope.moduleItems = [];

            $scope.totalPages = 1;
            $scope.filterStatus = -1;
            $scope.filterStatusTypes = [];
            $scope.txStatusTypes = [];
            $scope.txActionTypes = [];
            $scope.txFolderRules = [];



            $scope.showModal = false;
            $scope.modalBox = {
              title : 'Transaction Details',
              class : 'business-manager-modal',
              editMode : false,
              locationList : [],
              tx : {
                  orderAmount : 0.00,
                  trnNo : '',
                  ezeidTid : 0,

                  TID : 0,
                  functionType : 0, // Function Type will be 0 for sales
                  ezeid : '',
                  statusType : 0,
                  notes : '',
                  locId : '',
                  country : '',
                  state : '',
                  city : '',
                  area : '',
                  contactInfo : '',
                  deliveryAddress : '',
                  nextAction : 0,
                  nextActionDateTime : '',
                  taskDateTime : '',
                  folderRule : 0,
                  message : '',
                  messageType : ($rootScope._userInfo.SalesItemListType) ? $rootScope._userInfo.SalesItemListType : 0,
                  latitude : 0,
                  longitude : 0,
                  duration : 0,
                  durationScale : 0,
                  itemList : []     // This is transaction item list
              }
            };

            $scope.editModes = [];




            $scope.loadLocationListForEzeid = function(tid){
                var defer = $q.defer();
                $http({
                    url : GURL + 'ewtGetLocationListForEZEID',
                    method : 'GET',
                    params : {
                        Token : $rootScope._userInfo.Token,
                        TID :   tid
                    }
                }).success(function(resp){
                    if(resp && resp !== 'null'){
                        $scope.modalBox.locationList = resp.Result;
                        defer.resolve(resp.Result);
                    }
                    else{
                        defer.reject();
                    }
                }).error(function(err){
                    defer.reject();
                });
                return defer.promise;
            };
            /**
             * Copies the transaction properties to editMode Object
             * @param tx
             * @return editModeTx
             */
            var prepareEditTransaction = function(tx){

                var editModeTx =  {
                        orderAmount : (!isNaN(parseFloat(tx.Amount))) ? parseFloat(tx.Amount) : 0.00,
                        trnNo : tx.TrnNo,
                        ezeidTid : (tx.EZEID) ? true : 0,

                        TID : tx.TID,
                        functionType : 0, // Function Type will be 0 for sales
                        ezeid : tx.EZEID,
                        statusType : 0,
                        notes : tx.Notes,
                        locId : tx.LocID,
                        country : '',
                        state : '',
                        city : '',
                        area : '',
                        contactInfo : tx.ContactInfo,
                        deliveryAddress : '',
                        nextAction : (tx.NextActionID && tx.NextActionID !== 'null') ? tx.NextActionID : 0,
                        nextActionDateTime : $filter('dateTimeFilter')(tx.NextActionDate,'DD MMM YYYY hh:mm:ss A','DD MMM YYYY hh:mm:ss A'),
                        taskDateTime : tx.TaskDateTime,
                        folderRule : (tx.FolderRuleID && tx.FolderRuleID !== 'null') ? tx.FolderRuleID : 0,
                        message : tx.Message,
                        messageType : ($rootScope._userInfo.SalesItemListType) ? $rootScope._userInfo.SalesItemListType : 0,
                        latitude : 0,
                        longitude : 0,
                        duration : 0,
                        durationScale : 0,
                        itemList : []
                };
                return editModeTx;

            };
            /**
             * Toggles the edit mode for particular transaction
             * Inline editing
             * @param index
             */
            $scope.toggleAllEditMode = function(index,resolveGeolocation,loadItems){
                $scope.$emit('$preLoaderStart');
                if(typeof(index) === "undefined")
                {
                    index = -1;
                }
                for(var c = 0; c < $scope.editModes.length; c++){
                    if(c === index){
                        $scope.resetModalBox();
                        $scope.modalBox.tx = prepareEditTransaction($scope.txList[index]);
                        console.log($scope.modalBox.tx);
                        $scope.editModes[c] = true;
                    }
                    else{
                        $scope.editModes[c] = false;
                    }
                }
                if(resolveGeolocation){
                    $scope.resolveGelocationAddress().then(function(){
                        if(loadItems){
                            loadTransactionItems($scope.modalBox.tx.TID).then(function(){
                                $scope.$emit('$preLoaderStop');
                            },function(){
                                $scope.$emit('$preLoaderStop');
                            });
                        }
                    },function(){
                        if(loadItems){
                            loadTransactionItems($scope.modalBox.tx.TID).then(function(){
                                $scope.$emit('$preLoaderStop');
                            },function(){
                                $scope.$emit('$preLoaderStop');
                            });
                        }
                    });
                }


            };

            var loadTransactionItems = function(txId){
                var defer = $q.defer();
                $http({
                    url : GURL + 'ewtGetTranscationItems',
                    method : 'GET',
                    params : {
                        Token : $rootScope._userInfo.Token,
                        MessageID : txId
                    }
                }).success(function(resp){
                    if(resp && resp.length > 0 && resp !== 'null'){
                        $scope.modalBox.tx.itemList = resp;
                        defer.resolve(resp);
                    }
                    else{
                        defer.resolve([]);
                    }
                }).error(function(err){
                    Notification.error({ message : 'Unable to load items for this enquiry ! Please try again', delay : MsgDelay});
                    defer.reject();
                });
                return defer.promise;
            };

            /**
             * Modal Box toggle
             * @param e
             */
            $scope.toggleModalBox = function(e,index){

                $scope.resetModalBox();


                if(e && typeof(index) !== 'undefined' && typeof(index) !== 'null'){
                    /**
                     * Fill the information of Current Transaction
                     */
                    $scope.modalBox.editMode = true;
                    $scope.modalBox.tx = prepareEditTransaction($scope.txList[index]);
                    if($scope.moduleConf.listType > 0){
                        loadTransactionItems($scope.modalBox.tx.TID).then(function(resp){
                            $scope.showModal = !$scope.showModal;
                        },function(){
                            $scope.showModal = !$scope.showModal;
                        });
                    }
                    else{
                        $scope.showModal = !$scope.showModal;
                    }
                }
                else{
                    $scope.modalBox.editMode = false;
                    $scope.showModal = !$scope.showModal;
                }
            };

            /**
             *
             */
            $scope.resolveGelocationAddress = function(){
                $scope.modalBox.tx.address = '';
                if(!$scope.modalBox.tx.locId){
                    return;
                }

                $scope.$emit('$preLoaderStart');
                var locIndex = $scope.modalBox.locationList.indexOfWhere("TID",parseInt($scope.modalBox.tx.locId));
                if(locIndex === -1){
                    $scope.$emit('$preLoaderStop');
                    return;
                }
                var lat = $scope.modalBox.locationList[locIndex].Latitude;
                var lng = $scope.modalBox.locationList[locIndex].Longitude;

                $scope.modalBox.tx.latitude = lat;
                $scope.modalBox.tx.longitude = lng;

                $scope.modalBox.tx.address = $scope.modalBox.locationList[locIndex].AddressLine1+' ' +
                    $scope.modalBox.locationList[locIndex].AddressLine2;
                var googleMap = new GoogleMap();
                googleMap.getReverseGeolocation(lat,lng).then(function(resp){
                    $scope.$emit('$preLoaderStop');
                    if(resp.data){
                        var data = googleMap.parseReverseGeolocationData(resp.data);


                        $scope.modalBox.tx.city = data.city;
                        $scope.modalBox.tx.state = data.state;
                        $scope.modalBox.tx.country = data.country;
                        $scope.modalBox.tx.area = data.area;


                    }
                    else{
                        $scope.$emit('$preLoaderStop');
                        Notification.error({message : 'Please enable geolocation settings n your browser',delay : MsgDelay});
                    }

                },function(){
                    Notification.error({message : 'Please enable geolocation settings n your browser',delay : MsgDelay});
                    $scope.$emit('$preLoaderStop');
                });

            };


            $scope.$watch('showModal',function(newVal,oldVal){
                if(!newVal){
                    $scope.resetModalBox();
                }
            });

            $scope.resetModalBox = function(){
                $scope.modalBox = {
                    title : 'Transaction Details',
                    class : 'business-manager-modal',
                    locationList : [],
                    editMode : false,
                    tx : {
                        orderAmount : 0,
                        trnNo : '',
                        ezeidTid : 0,

                        TID : 0,
                        functionType : 0, // Function Type will be 0 for sales
                        ezeid : '',
                        statusType : 0,
                        notes : '',
                        locId : '',
                        country : '',
                        state : '',
                        city : '',
                        area : '',
                        contactInfo : '',
                        deliveryAddress : '',
                        nextAction : 0,
                        nextActionDateTime : '',
                        taskDateTime : '',
                        folderRule : 0,
                        message : '',
                        messageType : ($rootScope._userInfo.SalesItemListType) ? $rootScope._userInfo.SalesItemListType : 0,
                        latitude : 0,
                        longitude : 0,
                        duration : 0,
                        durationScale : 0,
                        itemList : []
                    }
                };
            };

            /**
             * Creates transaction item from business item from the properties of business item
             * @param item
             */
            var createTxItem = function(businessItem){
                var txItem = {};
                var allowProperties = [
                    'TID',
                    'Rate',
                    'ItemName',
                    'Pic'
                ];
                for(var prop in businessItem){
                    if(allowProperties.indexOf(prop) !== -1){
                        if(prop == 'TID'){
                            txItem.ItemID = businessItem['TID'];
                        }
                        else if(prop == 'Rate'){
                            try{
                                txItem.Rate = parseFloat(businessItem[prop]);
                            }
                            catch(ex){
                                txItem.Rate = 0;
                            }
                        }
                        else{
                            txItem[prop] = businessItem[prop];
                        }
                    }
                }
                txItem.Qty = 1;
                txItem.Amount = txItem.Qty * txItem.Rate;
                return txItem;
            };

            /**
             * Add item to transaction item list (selected items list)
             * @param item
             */
            $scope.addItem = function(item){
                var txItemIndex  = $scope.modalBox.tx.itemList.indexOfWhere('ItemID',item.TID);
                if(txItemIndex === -1){
                    $scope.modalBox.tx.itemList.push(createTxItem(item));
                }
                else{
                    $scope.modalBox.tx.itemList[txItemIndex].Qty += 1;
                    $scope.modalBox.tx.itemList[txItemIndex].Amount =
                        ($scope.modalBox.tx.itemList[txItemIndex].Qty * $scope.modalBox.tx.itemList[txItemIndex].Rate);
                }
            };

            /**
             * Add item to transaction item list (selected items list)
             * @param item
             */
            $scope.removeItem = function(txItem){
                var txItemIndex  = $scope.modalBox.tx.itemList.indexOfWhere('ItemID',txItem.ItemID);
                console.log(txItemIndex);
                $scope.modalBox.tx.itemList.splice(txItemIndex,1);
            };


            /**
             * Fetches the information of particular EZEID
             * @param ezeid
             * @returns {*}
             */
            $scope.getEzeidDetails = function(ezeid){
                var defer = $q.defer();
                $http({
                    url : GURL + 'ewtEZEIDPrimaryDetails',
                    method : 'GET',
                    params : {
                        Token : $rootScope._userInfo.Token,
                        EZEID :   ezeid
                    }
                }).success(function(resp){
                    if(resp && resp !== 'null' && resp.length > 0){
                        defer.resolve(resp[0]);
                    }
                    else{
                        defer.reject();
                    }
                }).error(function(err){
                    defer.reject();
                });
                return defer.promise;
            };


            $scope.$watch('modalBox.tx.ezeid',function(newVal,oldVal){
                if(!newVal){
                    $scope.modalBox.tx.ezeid = '';
                    $scope.modalBox.tx.ezeidTid = 0;
                    return;
                }
                if(newVal !== oldVal){
                    $scope.checkEzeidInfo(newVal);
                }
            });

            /**
             * Loading EZEID userInfo and managing fields visibility based on the it
             * @param ezeid
             */
            $scope.checkEzeidInfo = function(ezeid){
                $scope.$emit('$preLoaderStart');
                $scope.getEzeidDetails(ezeid).then(function(resp){
                    $scope.modalBox.tx.ezeid = $filter('uppercase')(ezeid);
                    $scope.modalBox.tx.contactInfo = resp.FirstName + ' ' +
                    resp.LastName  +
                        ((resp.MobileNumber && resp.MobileNumber !== 'null') ? ', ' + resp.MobileNumber : '');
                    $scope.modalBox.tx.ezeidTid = resp.TID;
                    $scope.loadLocationListForEzeid(resp.TID).then(function(){
                        $scope.$emit('$preLoaderStop');
                    },function(){
                        $scope.$emit('$preLoaderStop');
                        //Notification.error({ message : 'Unable to load location list for this user', delay : MsgDelay});
                    });

                },function(){
                    $scope.$emit('$preLoaderStop');
                    //Notification.error({ message : 'Invalid EZEID', delay : MsgDelay});
                    $scope.modalBox.tx.ezeid = '';
                    $scope.modalBox.tx.ezeidTid = 0;
                });
            };

            /**
             * Loads all transactions
             * @param pageNo
             * @param statusType
             * @returns {*}
             */
            $scope.loadTransaction = function(pageNo,statusType){
                var defer = $q.defer();
                if(!pageNo){
                    pageNo = 1;
                }
                if(!statusType){
                    statusType = null;
                }
                $http({
                    url : GURL + 'ewtGetTranscation',
                    method : 'GET',
                    params : {
                        Token : $rootScope._userInfo.Token,
                        Page : pageNo,
                        Status : (statusType) ? statusType : '',
                        FunctionType : 0    // For Sales
                    }
                }).success(function(resp){
                    if(resp && resp !== 'null'){
                        /**
                         * Change
                         * 1. $scope.totalPages
                         * 2. $scope.pageNumber
                         * 3. $scope.txList
                         */
                        $scope.totalPage = resp.TotalPage;
                        $scope.pageNumber = pageNo;
                        $scope.txList = resp.Result;

                        for(var a = 0; a < resp.Result.length; a++){
                            $scope.editModes.push(false);
                        }
                    }
                    else{

                        $scope.txList = [];
                    }
                    defer.resolve(resp);
                }).error(function(err){
                    defer.reject();
                });
                return defer.promise;
            };


            /**
             * Load Transaction Status types for filtering transaction
             * @returns {*}
             */
            $scope.loadfilterStatusTypes = function(){
                var defer = $q.defer();
                $http({
                    url : GURL + 'ewmStatusType',
                    method : 'GET',
                    params : {
                        Token : $rootScope._userInfo.Token,
                        FunctionType : 0    // For Sales
                    }
                }).success(function(resp){
                    if(resp && resp !== 'null' && resp.length > 0){
                        $scope.filterStatusTypes = resp;
                    }
                    else{

                        $scope.filterStatusTypes = [];
                    }
                    defer.resolve(resp);
                }).error(function(err){
                    defer.reject();
                });
                return defer.promise;
            };

            /**
             * Load Transaction Action Types
             * @returns {*}
             */
            $scope.loadTxActionTypes = function(){
                var defer = $q.defer();
                $http({
                    url : GURL + 'ewtGetActionType',
                    method : 'GET',
                    params : {
                        Token : $rootScope._userInfo.Token,
                        FunctionType : 0    // For Sales
                    }
                }).success(function(resp){
                    if(resp && resp !== 'null' && resp.length > 0){
                        $scope.txActionTypes = resp;
                    }
                    else{

                        $scope.txActionTypes = [];
                    }
                    defer.resolve(resp);
                }).error(function(err){
                    defer.reject();
                });
                return defer.promise;
            };


            /**
             * Load Transaction Status Types
             * @returns {*}
             */
            $scope.loadTxStatusTypes = function(){
                var defer = $q.defer();
                $http({
                    url : GURL + 'ewtGetStatusType',
                    method : 'GET',
                    params : {
                        Token : $rootScope._userInfo.Token,
                        FunctionType : 0    // For Sales
                    }
                }).success(function(resp){
                    if(resp && resp !== 'null' && resp.length > 0){
                        /**
                         * Change
                         * 1. $scope.totalPages
                         * 2. $scope.pageNumber
                         * 3. $scope.txList
                         */
                        $scope.txStatusTypes = resp;
                    }
                    else{

                        $scope.txStatusTypes = [];
                    }
                    defer.resolve(resp);
                }).error(function(err){
                    defer.reject();
                });
                return defer.promise;
            };


            /**
             * Load business items
             * @returns {*|promise}
             */
            $scope.loadItemList = function(){
                var defer = $q.defer();
                $http({
                    url : GURL + 'ewtGetItemList',
                    method : 'GET',
                    params : {
                        Token : $rootScope._userInfo.Token,
                        FunctionType : 0    // Sales
                    }
                }).success(function(resp){
                    if(resp && resp !== 'null' && resp.length > 0){
                        $scope.moduleItems = resp;
                        defer.resolve(resp);
                    }
                    else{
                        defer.resolve([]);
                    }
                }).error(function(err){
                    defer.reject();
                });
                return defer.promise;
            };


            /**
             * Loads FolderRules for Sales
             * @return {*|promise}
             */
            $scope.loadFolderRules = function(){
                var defer = $q.defer();
                $http({
                    url : GURL + 'ewtGetFolderList',
                    method : 'GET',
                    params : {
                        Token : $rootScope._userInfo.Token,
                        FunctionType : 0    // Sales
                    }
                }).success(function(resp){
                    if(resp && resp !== 'null' && resp.length > 0){
                        $scope.txFolderRules = resp;
                        defer.resolve(resp);
                    }
                    else{
                        defer.resolve([]);
                    }
                }).error(function(err){
                    defer.reject();
                });
                return defer.promise;
            };


            $scope.$watch('pageNumber',function(newVal,oldVal){
                if(newVal !== oldVal)
                {
                    $scope.$broadcast('$preLoaderStart');
                    $scope.loadTransaction(newVal,$scope.filterStatus).then(function(){
                        $scope.$broadcast('$preLoaderStop');
                    },function(){
                        $scope.$broadcast('$preLoaderStop');
                    });
                }
            });

            /**
             * Load transaction items
             * @param txId
             * @returns {*}
             */
            $scope.loadTxItems = function(txId){
                var defer = $q.defer();
                $http({
                    url : GURL + 'ewtGetTranscationItems',
                    method : 'GET',
                    params : {
                        Token : $rootScope._userInfo.Token,
                        MessageID : txId    // Transaction TID
                    }
                }).success(function(resp){
                    if(resp && resp !== 'null' && resp.length > 0){

                        defer.resolve(resp);
                    }
                    else{
                        defer.resolve([]);
                    }

                }).error(function(err){
                    defer.reject();
                });
                return defer.promise;
            };


            /**
             * Main Intialization
             */


            var init = function(){
                $scope.loadfilterStatusTypes().then(function(resp){
                    console.log(resp);
                    $scope.loadTxActionTypes().then(function(){
                        $scope.loadTxStatusTypes().then(function(){
                            $scope.loadTransaction().then(function(){
                                $scope.loadItemList().then(function(){
                                    $scope.loadFolderRules().then(function(){
                                        $scope.$emit('$preLoaderStop');
                                    },function(){
                                        $scope.$emit('$preLoaderStop');
                                        Notification.error({message : 'Unable to load folder rules', delay : MsgDelay} );
                                    });
                                },function(){
                                    $scope.$emit('$preLoaderStop');
                                    Notification.error({message : 'Unable to load item list', delay : MsgDelay} );
                                });
                            },function(){
                                $scope.$emit('$preLoaderStop');
                                Notification.error({message : 'Unable to load sales transaction list', delay : MsgDelay} );
                            });
                        },function(){
                            $scope.$emit('$preLoaderStop');
                            Notification.error({message : 'Unable to load sales transaction status types', delay : MsgDelay} );
                        });
                    },function(){
                        $scope.$emit('$preLoaderStop');
                        Notification.error({message : 'Unable to load sales next actions list', delay : MsgDelay} );
                    });
                },function(){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({message : 'Unable to load status types', delay : MsgDelay} );
                });

            };

            $rootScope.$on('$includeContentLoaded',function(){
                $timeout(function(){
                    $scope.$emit('$preLoaderStart');
                    init();
                },1000);

            });


            /**
             * Preparing data for saving transaction
             * @param tx
             * @param editMode
             */
            var prepareSaveTransaction = function(editMode){

                /**
                 * @todo Implement Validations
                 * 1. Access Rights and permission
                 * 2. Format of Dates, aciton types and status
                 * 3. Amount
                 * @type {{TID: number, Token: *, MessageText: string, Status: number, TaskDateTime: string, Notes: string, LocID: *, Country: string, State: string, City: string, Area: string, FunctionType: number, Latitude: number, Longitude: number, EZEID: string, ContactInfo: string, FolderRuleID: number, Duration: number, DurationScales: number, NextAction: number, NextActionDateTime: string, ItemsList: Array, DeliveryAddress: string}}
                 */
                var preparedTx = {
                    TID : ($scope.modalBox.tx.TID) ? $scope.modalBox.tx.TID : 0,
                    Token : $rootScope._userInfo.Token,
                    MessageText : $scope.modalBox.tx.message,
                    Status : $scope.modalBox.tx.statusType,
                    TaskDateTime : (!editMode) ? moment().format('DD MMM YYYY hh:mm:ss') : $scope.modalBox.tx.taskDateTime,
                    Notes : $scope.modalBox.tx.notes,
                    LocID : ($scope.modalBox.tx.locId) ? $scope.modalBox.tx.locId : 0,
                    Country : $scope.modalBox.tx.country,
                    State : $scope.modalBox.tx.state,
                    City : $scope.modalBox.tx.city,
                    Area : $scope.modalBox.tx.area,
                    FunctionType : 0,   // For sales
                    Latitude : $scope.modalBox.tx.latitude,
                    Longitude : $scope.modalBox.tx.longitude,
                    EZEID : $scope.modalBox.tx.ezeid,
                    ContactInfo : $scope.modalBox.tx.contactInfo,
                    FolderRuleID : ($scope.modalBox.tx.folderRule) ? $scope.modalBox.tx.folderRule : 0,
                    Duration : 0,
                    DurationScales : 0,
                    NextAction : ($scope.modalBox.tx.nextAction) ? $scope.modalBox.tx.nextAction : 0,
                    NextActionDateTime : ($scope.modalBox.tx.nextActionDateTime) ? $scope.modalBox.tx.nextActionDateTime : moment().format('DD MMM YYYY hh:mm:ss'),
                    ItemsList: JSON.stringify($scope.modalBox.tx.itemList),
                    DeliveryAddress : (!editMode) ? ($scope.modalBox.tx.address + $scope.modalBox.tx.area + $scope.modalBox.tx.city +
                        $scope.modalBox.tx.state + $scope.modalBox.tx.country) : $scope.modalBox.tx.deliveryAddress
                };
                return preparedTx;
            };
            /**
             * Saving transaction in
             * @param editMode
             */
            $scope.saveTransaction = function(){
                var data = prepareSaveTransaction($scope.modalBox.editMode);

                if(!data.ContactInfo){
                    Notification.error({ message : 'Please enter contact information for customer',delay : MsgDelay});
                    return ;
                }

                if($scope.modalBox.tx.itemList.length <  1 && $scope.modules[moduleIndex].listType > 0){
                    Notification.error({ message : 'Please select items for the enquiry',delay : MsgDelay});
                    return ;
                }

                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'ewtSaveTranscation',
                    method : 'POST',
                    data : data
                }).success(function(resp){
                    if(resp && resp.hasOwnProperty('IsSuccessfull')){
                        if(resp.IsSuccessfull){
                            Notification.success({ message : 'Enquiry is posted successfully.', delay : MsgDelay});
                            $scope.toggleModal();
                        }
                        else{
                            Notification.error({ message : 'An error occurred while placing enquiry', delay : MsgDelay});
                        }
                    }
                    else{
                        Notification.error({ message : 'An error occurred while placing enquiry', delay : MsgDelay});
                    }

                    $scope.$emit('$preLoaderStop');
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message : err, delay : MsgDelay});
                });
            };

        }]);

})();
