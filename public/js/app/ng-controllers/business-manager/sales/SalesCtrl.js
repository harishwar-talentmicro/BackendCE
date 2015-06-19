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

            $scope._tempSalesItemListType = $rootScope._userInfo.SalesItemListType;
            $scope.txSearchTerm = '';

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
            $scope.statusType = -1;
            $scope.txList = [];

            /**
             *
             * Sales items present for this user
             * @type {Array}
             */
            $scope.moduleItems = [];

            $scope.totalPages = 1;
            $scope.filterStatus = -1;
            $scope.sortBy = 0;
            $scope.filterStatusTypes = [];
            $scope.txStatusTypes = [];
            $scope.txActionTypes = [];
            $scope.txFolderRules = [];



            $scope.showModal = false;
            $scope.modalBox = {
              title : 'Create New Lead',
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
                  itemList : [],     // This is transaction item list
                  companyName : '',
                  companyId : 0
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
             * @changeUserDetails {boolean} if true then ezeid is not allocated to modalbox.tx.ezeid so that watcher doesn't execute
             * saving one api call (loadUserDetails)
             * @return editModeTx
             */
            var prepareEditTransaction = function(tx,changeUserDetails){

                var editModeTx =  {
                        orderAmount : (!isNaN(parseFloat(tx.Amount))) ? parseFloat(tx.Amount) : 0.00,
                        trnNo : tx.TrnNo,
                        ezeidTid : (tx.EZEID) ? true : 0,

                        TID : tx.TID,
                        functionType : 0, // Function Type will be 0 for sales
                        ezeid : (changeUserDetails) ? '' :  tx.RequesterEZEID,
                        statusType : (tx.Status) ? tx.Status : 0,
                        notes : tx.Notes,
                        locId : tx.LocID,
                        country : '',
                        state : '',
                        city : '',
                        area : '',
                        contactInfo : tx.ContactInfo,
                        deliveryAddress : tx.DeliveryAddress,
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
                        itemList : [],
                        companyId : tx.company_id,
                        companyName : tx.company_name
                };
                return editModeTx;

            };
            /**
             * Toggles the edit mode for particular transaction
             * @param index
             * @param resolveGeolocation
             * @param loadItems
             * @param changeUserDetails (if true then it doesn't actually transfers the ezeid to modalBox.tx
             * so that ezeid doesn't change and wathcer doesn't execute and therefore preventing any service call)
             */

            $scope.toggleAllEditMode = function(index,resolveGeolocation,loadItems,changeUserDetails){
                $scope.$emit('$preLoaderStart');
                if(typeof(index) === "undefined")
                {
                    index = -1;
                }
                for(var c = 0; c < $scope.editModes.length; c++){
                    if(c === index){
                        $scope.resetModalBox();
                        $scope.modalBox.tx = prepareEditTransaction($scope.txList[index],changeUserDetails);
                        $scope.editModes[c] = true;
                    }
                    else{
                        $scope.editModes[c] = false;
                    }
                }
                var itemsLoaded = true;
                var locationLoaded = true;
                if(resolveGeolocation){
                    locationLoaded = false;
                    $scope.resolveGeolocationAddress().then(function(){
                        locationLoaded = true;
                        if(itemsLoaded && locationLoaded){
                            $scope.$emit('$preLoaderStop');
                        }
                    });
                }
                if(loadItems){
                    itemsLoaded = false;
                    loadTransactionItems($scope.modalBox.tx.TID).then(function(){
                        itemsLoaded = true;
                        if(itemsLoaded && locationLoaded){
                            $scope.$emit('$preLoaderStop');
                        }
                    },function(){
                        itemsLoaded = true;
                        if(itemsLoaded && locationLoaded){
                            $scope.$emit('$preLoaderStop');
                        }
                    });
                }

                /**
                 * If both resolveGeolcation and loadItems are false then stop preloader
                 */
                if(!(resolveGeolocation || loadItems)){
                    $scope.$emit('$preLoaderStop');
                }
            };


            /**
             * Updates transaction (without reloading items saving api call to load items)
             */
            $scope.updateTransaction = function(){
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'update_transaction',
                    method : 'PUT',
                    data : {
                        TID : $scope.modalBox.tx.TID,
                        status : ($scope.modalBox.tx.statusType) ? $scope.modalBox.tx.statusType : 0,
                        folderRuleID : ($scope.modalBox.tx.folderRule) ? $scope.modalBox.tx.folderRule : 0,
                        nextAction : ($scope.modalBox.tx.nextAction) ? $scope.modalBox.tx.nextAction : 0,
                        nextActionDateTime : ($scope.modalBox.tx.nextActionDateTime) ? $scope.modalBox.tx.nextActionDateTime : moment().format('YYYY-MM-DD hh:mm:ss'),
                        Token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){
                    $scope.$emit('$preLoaderStop');
                    if(resp && resp.status && resp!= 'null'){
                        Notification.success({ message : 'Record updated successfully', delay : MsgDelay});
                        $scope.resetModalBox();
                        $scope.toggleAllEditMode();

                        var id = $scope.txList.indexOfWhere('TID',parseInt(resp.data.TID));
                        console.log($scope.txList[id]);
                        $scope.txList[id].FolderRuleID = parseInt(resp.data.folderRuleID);
                        $scope.txList[id].Status = parseInt(resp.data.status);

                        $scope.txList[id].statustitle = ($scope.txStatusTypes.indexOfWhere('TID', parseInt(resp.data.status)) !== -1)
                            ? $scope.txStatusTypes[$scope.txStatusTypes.indexOfWhere('TID', parseInt(resp.data.status))].StatusTitle : '',

                        $scope.txList[id].FolderTitle = ($scope.txFolderRules.indexOfWhere('TID', parseInt(resp.data.folderRuleID)) !== -1)
                            ? $scope.txFolderRules[$scope.txFolderRules.indexOfWhere('TID', parseInt(resp.data.folderRuleID))].FolderTitle : '',

                        $scope.txList[id].ActionTitle = ($scope.txActionTypes.indexOfWhere('TID', parseInt(resp.data.nextAction)) !== -1)
                            ? $scope.txActionTypes[$scope.txActionTypes.indexOfWhere('TID', parseInt(resp.data.nextAction))].ActionTitle : '',

                        $scope.txList[id].NextActionID = (parseInt(resp.data.nextAction)!== NaN ) ? parseInt(resp.data.nextAction) : 0 ;
                        var date = moment().format('DD MMM YYYY hh:mm');
                        try{
                            date = moment(resp.data.nextActionDateTime,'YYYY-MM-DD hh:mm:ss').format('DD MMM YYYY hh:mm');
                        }
                        catch(ex){

                        }
                        $scope.txList[id].NextActionDate = resp.data.nextActionDateTime;
                    }
                    else{
                        var msg = 'Something went wrong! Please try again';
                        Notification.error({ message : msg, delay : MsgDelay});
                    }

                }).error(function(err,statusCode){
                    $scope.$emit('$preLoaderStop');
                    var msg = 'Something went wrong! Please try again';
                    if(statusCode === 403) {
                        msg = 'You do not have permission to update this transaction';
                    }
                    if(statusCode === 0){
                        msg = 'Unable to reach server ! Please check your connection';
                    }
                    Notification.error({ message : msg, delay : MsgDelay});
                });
            };

            /**
             * Loads the transaction items for already existing transaction
             * @param txId (MessageID)
             * @returns {* | promise}
             */
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
                    var editTx = prepareEditTransaction($scope.txList[index]);
                    if($scope.moduleConf.listType > 0){
                        $scope.$emit('$preLoaderStart');
                        loadTransactionItems(editTx.TID).then(function(resp){
                            editTx.itemList = resp;
                            $scope.showModal = !$scope.showModal;
                            //UI updation is not happening properly because ui is not rendered, and model bind before it
                            //therefore once again updating data after ui rendered
                            $timeout(function(){
                                $scope.modalBox.title = 'Update Lead';
                                $scope.modalBox.tx = editTx;
                                $scope.$emit('$preLoaderStop');
                            },1500);
                        },function(){
                            $scope.showModal = !$scope.showModal;
                            $timeout(function(){
                                $scope.modalBox.tx = editTx;
                                $scope.$emit('$preLoaderStop');
                            },1500);
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
             * Finds address using geolocation lat lng
             * called on change of location
             */
            $scope.findAddress = function(){
                $scope.$emit('$preLoaderStart');
                $scope.resolveGeolocationAddress().then(function(){
                    $scope.$emit('$preLoaderStop');
                },function(){
                    $scope.$emit('$preLoaderStop');
                });
            };

            /**
             *  Resolves geolocation and sets geolocation address in modalbox for particular transaction
             */
            $scope.resolveGeolocationAddress = function(){
                var defer = $q.defer();
                $scope.modalBox.tx.address = '';
                if(!$scope.modalBox.tx.locId){
                    $timeout(function(){
                        defer.resolve();
                    },500);
                    return defer.promise;
                }

                //$scope.$emit('$preLoaderStart');
                var locIndex = $scope.modalBox.locationList.indexOfWhere("TID",parseInt($scope.modalBox.tx.locId));
                if(locIndex === -1){
                    $timeout(function(){
                        defer.resolve();
                    },500);
                    return defer.promise;
                }
                var lat = $scope.modalBox.locationList[locIndex].Latitude;
                var lng = $scope.modalBox.locationList[locIndex].Longitude;

                $scope.modalBox.tx.latitude = lat;
                $scope.modalBox.tx.longitude = lng;

                $scope.modalBox.tx.address = $scope.modalBox.locationList[locIndex].AddressLine1+' ' +
                    $scope.modalBox.locationList[locIndex].AddressLine2;

                var googleMap = new GoogleMap();
                try{
                    googleMap.getReverseGeolocation(lat,lng).then(function(resp){
                        //$scope.$emit('$preLoaderStop');
                        if(resp.data){
                            var data = googleMap.parseReverseGeolocationData(resp.data);
                            $scope.modalBox.tx.city = data.city;
                            $scope.modalBox.tx.state = data.state;
                            $scope.modalBox.tx.country = data.country;
                            $scope.modalBox.tx.area = data.area;


                        }
                        else{
                            //$scope.$emit('$preLoaderStop');
                            Notification.error({message : 'Please enable geolocation settings n your browser',delay : MsgDelay});
                        }
                        defer.resolve();

                    },function(){
                        Notification.error({message : 'Please enable geolocation settings n your browser',delay : MsgDelay});
                        //$scope.$emit('$preLoaderStop');
                        defer.resolve();
                    });
                }
                catch(ex){
                    $timeout(function(){
                        Notification.error({message : 'Unable to resolve geolocation',delay : MsgDelay});
                        defer.resolve();
                    },400);
                }
                return defer.promise;
            };


            $scope.$watch('showModal',function(newVal,oldVal){
                if(!newVal){
                    $scope.resetModalBox();
                }
            });

            $scope.resetModalBox = function(){
                $scope.modalBox = {
                    title : 'Create New Lead',
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
                        itemList : [],
                        companyName : '',
                        companyId : 0
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
                txItem.TID = 0;
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
                ////////console.log(txItemIndex);
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
                    $scope.modalBox.tx.companyName = (resp.IDTypeID == 1) ? resp.FirstName : resp.CompanyName;
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
             * This function will be called when status types filter selection box value is changed
             */
            $scope.triggerStatusFilter = function(pageNo,statusType){
                $scope.$emit('$preLoaderStart');
                $scope.loadTransaction(pageNo,statusType,$scope.txSearchTerm,$scope.sortBy).then(function(){
                    $scope.$emit('$preLoaderStop');
                },function(){
                    $scope.$emit('$preLoaderStop');
                });
            };


            /**
             * Clears the search term and load the results again
             */
            $scope.clearSearchTerm = function(pageNo,statusType){
                $scope.txSearchTerm = '';
                $scope.$emit('$preLoaderStart');
                $scope.loadTransaction(pageNo,statusType,$scope.txSearchTerm,$scope.sortBy).then(function(){
                    $scope.$emit('$preLoaderStop');
                },function(){
                    $scope.$emit('$preLoaderStop');
                });
            };


            /**
             * Loads all transactions
             * @param pageNo
             * @param statusType
             * @returns {*}
             */
            $scope.loadTransaction = function(pageNo,statusType,txSearchKeyword,sortBy){
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
                        Page : (pageNo) ? pageNo : 1,
                        Status : (statusType) ? statusType : '',
                        FunctionType : 0,    // For Sales
                        searchkeyword : txSearchKeyword,
                        sort_by : (sortBy) ? sortBy : 0
                    }
                }).success(function(resp){
                    if(resp && resp !== 'null'){
                        /**
                         * Change
                         * 1. $scope.totalPages
                         * 2. $scope.pageNumber
                         * 3. $scope.txList
                         */
                        $scope.totalPages = parseInt(resp.TotalPage);
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
                    //////console.log(resp);
                    if(resp && resp !== 'null' && resp.hasOwnProperty('Result')){

                        if(resp.Result && resp.Result.length > 0){
                            $scope.filterStatusTypes = resp.Result;
                        }
                    }
                    else{
                        $scope.filterStatusTypes = [
                            {TID : -1, StatusTitle : 'All Open'},
                            {TID : -2, StatusTitle : 'All'}
                        ];
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
                    $scope.filterStatusTypes = [
                        {TID : -2, StatusTitle : 'All'},
                        {TID : -1, StatusTitle : 'All Open'}
                    ];
                    $scope.filterStatusTypes = $scope.filterStatusTypes.concat(resp);

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
                        $rootScope._userInfo.SalesItemListType = 0;
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



            var watchPageNumber = function(){
                $scope.$watch('pageNumber',function(newVal,oldVal){
                    if(newVal !== oldVal)
                    {
                        $scope.$emit('$preLoaderStart');
                        $scope.loadTransaction(newVal,$scope.filterStatus,$scope.txSearchTerm,$scope.sortBy).then(function(){
                            $scope.$emit('$preLoaderStop');
                        },function(){
                            $scope.$emit('$preLoaderStop');
                        });
                    }
                });
            };

            var watchSortBy = function(){
                $scope.$watch('sortBy',function(newVal,oldVal){
                    if(newVal !== oldVal)
                    {
                        $scope.$emit('$preLoaderStart');
                        $scope.loadTransaction($scope.pageNumber,$scope.filterStatus,$scope.txSearchTerm,$scope.sortBy).then(function(){
                            $scope.$emit('$preLoaderStop');
                        },function(){
                            $scope.$emit('$preLoaderStop');
                        });
                    }
                });
            };


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
                //$scope.loadfilterStatusTypes().then(function(resp){

                    $scope.loadTxActionTypes().then(function(){
                        $scope.loadTxStatusTypes().then(function(){
                            $scope.loadTransaction(1,-1,$scope.txSearchTerm,$scope.sortBy).then(function(){
                                    watchPageNumber();
                                    watchSortBy();
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
               // },function(){
               //     $scope.$emit('$preLoaderStop');
               //     //Notification.error({message : 'Unable to load status types', delay : MsgDelay} );
               //});
            };


            var makeAddress = function(){
                var address = [];
                if($scope.modalBox.tx.address){
                    address.push($scope.modalBox.tx.address);
                }
                if($scope.modalBox.tx.area){
                    address.push($scope.modalBox.tx.area);
                }
                if($scope.modalBox.tx.city){
                    address.push($scope.modalBox.tx.city);
                }

                if($scope.modalBox.tx.state){
                    address.push($scope.modalBox.tx.state);
                }
                if($scope.modalBox.tx.country){
                    address.push($scope.modalBox.tx.country);
                }
                return address.join(', ');
            };

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
                    ToEZEID : $rootScope._userInfo.ezeid,
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
                    NextActionDateTime : ($scope.modalBox.tx.nextActionDateTime) ? $scope.modalBox.tx.nextActionDateTime : moment().format('YYYY-MM-DD hh:mm:ss'),
                    ItemsList: JSON.stringify($scope.modalBox.tx.itemList),
                    item_list_type : $rootScope._userInfo.SalesItemListType,
                    DeliveryAddress : (!editMode) ?
                        makeAddress() : $scope.modalBox.tx.deliveryAddress,
                    company_name : $scope.modalBox.tx.companyName,
                    company_id : $scope.modalBox.tx.companyId
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


                if($scope.modalBox.tx.message.length < 1 && $scope.modules[moduleIndex].listType > 0){
                    var itemList = [];
                    try{
                        itemList = JSON.parse(data.ItemsList);
                    }
                    catch(ex){
                        //////console.log(ex);
                    }
                    var msg = '';
                    for(var ct = 0; ct < itemList.length; ct++){
                        msg += itemList[ct]['ItemName'];
                        if(itemList[ct]['Qty']){
                            msg += ' ('+ itemList[ct]['Qty'] + ')';
                        }
                        if(itemList[ct]['Amount']){
                            msg += ' : '+ itemList[ct]['Amount'];
                        }
                        msg += ', ';
                    }
                    msg = msg.substring(0, msg.length - 2);
                    data.MessageText = msg;
                }

                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'ewtSaveTranscation',
                    method : 'POST',
                    data : data
                }).success(function(resp){
                    if(resp && resp.hasOwnProperty('IsSuccessfull')){
                        if(resp.IsSuccessfull){
                            var msg = 'Enquiry is posted successfully';
                            if($scope.modalBox.editMode){
                                msg = 'Enquiry is updated successfully';
                            }

                            if($scope.editModes.indexOf(true) !== -1){
                                msg = 'Enquiry is updated successfully';
                            }
                            Notification.success({ message : msg, delay : MsgDelay});
                            if($scope.showModal){
                                $scope.showModal = !$scope.showModal;
                            }
                            $scope.resetModalBox();
                            $scope.toggleAllEditMode();
                            $scope.$emit('$preLoaderStart');
                            $scope.loadTransaction(1,$scope.statusType,$scope.txSearchTerm,$scope.sortBy).then(function(){
                                $scope.$emit('$preLoaderStop');
                            },function(){
                                $scope.$emit('$preLoaderStop');
                            });
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

            $scope.incrementPage = function(){
              $scope.pageNumber = parseInt($scope.pageNumber)  + 1;
            };

            $scope.decrementPage = function(){
                $scope.pageNumber  = parseInt($scope.pageNumber) - 1;
            };



            $scope.$on(
                "$destroy",
                function handleDestroyEvent() {
                    /**
                     * If itemListType is > 0, and items are not there then automatically
                     * listType becomes 0 but to restore the actual list type in $rootScope
                     * this will reassign the values to _userInfo.SalesItemListType
                     */
                    $rootScope._userInfo.SalesItemListType = $scope._tempSalesItemListType;
                }
            );


            /**
             * Dom loaded flag that if the dom is loaded the this flag is set true so that domLoaded function
             * doesn't execute more than once
             * @type {boolean}
             * @private
             */
            var _domLoaded = false;

            /**
             * Function is executed once only when dom is loaded and ready
             */
            $scope.domLoaded = function(){
                if(!_domLoaded){
                    $timeout(function(){
                        $scope.$emit('$preLoaderStart');
                        init();
                    },1000);
                    _domLoaded = true;
                }
            };


            var companyList = [];
            $scope.companySuggestionList = [];
            $scope.loadSuggestion = function(companyName){
                console.log('load ctlr :' + companyName);
                if(companyName){
                    console.log( $filter('filter')(companyList,companyName));
                    console.log(companyList);
                    return $filter('filter')(companyList,companyName);
                }
                else{
                    return [];
                }
            };

            /**
             * Loads company list for that particular ezeid
             * Company Contact list according to functionType
             */
             var loadCompany = function(){
                $http({
                    method : 'GET',
                    url : GURL + 'company_details',
                    params : {
                        Token : $rootScope._userInfo.Token,
                        functiontype : 0
                    }

                }).success(function(resp){
                    if(resp && resp.status && resp.data){
                            for(var a=0; a < resp.data.length; a++){
                                var suggestion = {
                                    id : resp.data[a].tid,
                                    duration : resp.data[a].idledays,
                                    user : resp.data[a].updateduser,
                                    name : resp.data[a].company_name
                                };
                                companyList[a] = suggestion;
                            }
                    }
                }).error(function(err,statusCode){
                    var msg = '';
                    if(statusCode == 0){
                        msg = 'Unable to reach server ! Please check your connection';
                        Notification.error({ title : 'No Connection', message : msg, delay : MsgDelay});
                    }
                });
            };

            loadCompany();

            /**
             * Refreshes company data every 1 minute
             */
            $interval(function(){
                loadCompany();
            },60000);


            $scope.cartData = {
                items : 0,
                amount : 0.00
            };


            function _cartCalculateAmount(itemList){
                for(var i = 0; i < itemList.length; i++){

                }
            };

            function _cartCalculateItems(itemList){

            }

        }]);

})();

