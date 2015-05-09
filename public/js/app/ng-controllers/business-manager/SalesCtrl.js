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
            $route
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



            $scope.listConf = [
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
            $scope.txStatusTypes = [];
            $scope.txActionTypes = [];

            $scope.showModal = false;
            $scope.modalBox = {
              title : 'Transaction Details',
              class : 'business-manager-modal',
              tx : {
                  orderAmount : 0,
                  trnNo : '',

                  TID : 0,
                  functionType : 0, // Function Type will be 0 for sales
                  ezeid : '',
                  statusType : 0,
                  notes : '',
                  locId : 0,
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


            /**
             * Toggles the edit mode for particular transaction
             * Inline editing
             * @param index
             */
            $scope.toggleAllEditMode = function(index){
                console.log(index);
                if(typeof(index) === "undefined")
                {
                    index = -1;
                }
                for(var c = 0; c < $scope.editModes.length; c++){
                    if(c === index){
                        $scope.editModes[c] = true;
                    }
                    else{
                        $scope.editModes[c] = false;
                    }
                }
            };

            /**
             * Modal Box toggle
             * @param e
             */
            $scope.toggleModalBox = function(e){
                if(e){
                    /**
                     * Fill the information of Current Transaction
                     */
                }
                $scope.loadItemList().then(function(){
                    $scope.$emit('$preLoaderStop');
                    $scope.showModal = !$scope.showModal;
                },function(){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({message : 'Unable to load item list', delay : MsgDelay} );
                });
            };

            $scope.resetModalBox = function(){
                $scope.modalBox = {
                    title : 'Transaction Details',
                    class : 'business-manager-modal',
                    tx : {
                        orderAmount : 0,
                        trnNo : '',
                        ezeidTid : 0,

                        TID : 0,
                        functionType : 0, // Function Type will be 0 for sales
                        ezeid : '',
                        statusType : 0,
                        notes : '',
                        locId : 0,
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
                return txItem;
            };

            /**
             * Add item to transaction item list (selected items list)
             * @param item
             */
            $scope.addItem = function(item){
                var txItemIndex  = $scope.modalBox.tx.itemList.indexOfWhere('ItemID',item.TID);
                console.log(txItemIndex);
                if(txItemIndex === -1){
                    $scope.modalBox.tx.itemList.push(createTxItem(item));
                }
                else{
                    $scope.modalBox.tx.itemList[txItemIndex].Qty += 1;
                }
                console.log($scope.modalBox.tx);
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


            $scope.checkEzeidInfo = function(ezeid){
                if(!ezeid){
                    return;
                }
                $scope.getEzeidDetails(ezeid).then(function(resp){
                    $scope.modalBox.tx.ezeid = $filter('uppercase')(ezeid);
                    $scope.modalBox.tx.contactInfo = resp.FirstName + ' ' +
                    resp.LastName  +
                        ((resp.MobileNumber && resp.MobileNumber !== 'null') ? ', ' + resp.MobileNumber : '');
                    $scope.modalBox.tx.ezeidTid = resp.TID;
                },function(){
                    Notification.error({ message : 'Invalid EZEID', delay : MsgDelay});
                    $scope.modalBox.tx.ezeid = '';
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
                        /**
                         * Change
                         * 1. $scope.totalPages
                         * 2. $scope.pageNumber
                         * 3. $scope.txList
                         */
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


            $scope.$watch('pageNumber',function(newVal,oldVal){
                if(newVal !== oldVal)
                {
                    $scope.$broadcast('$preLoaderStart');
                    $scope.loadTransaction(newVal,$scope.statusType).then(function(){
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
            $scope.loadTxActionTypes().then(function(){
                $scope.loadTxStatusTypes().then(function(){
                    $scope.loadTransaction().then(function(){
                        $scope.$emit('$preLoaderStop');
                    },function(){
                        $scope.$emit('$preLoaderStop');
                    });
                },function(){
                    $scope.$emit('$preLoaderStop');
                });
            },function(){
                $scope.$emit('$preLoaderStop');
            });




        }]);

})();
