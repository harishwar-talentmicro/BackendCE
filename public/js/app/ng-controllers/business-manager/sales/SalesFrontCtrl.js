(function() {
    angular.module('ezeidApp').controller('SalesFrontCtrl', [
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
        function ($rootScope,
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
                  GoogleMap) {

            $scope.ezeone = $routeParams['ezeone'];
            /**
             * Returns index of Object from array based on Object Property
             * @param key
             * @returns {number}
             */
            Array.prototype.indexOfWhere = function(key,value){
                var resultIndex = -1;
                var found = false;
                for(var i = 0; i < this.length; i++){
                    for(var prop in this[i]){
                        if(this[i].hasOwnProperty(key) && this[i][key] === value){
                            resultIndex = i;
                            found = true;
                            break;
                        }
                    }
                    if(found){
                        break;
                    }
                }
                return resultIndex;
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

            $scope.masterUser = null;
            /**
             * List of Items available for searched EZEID
             * @type {Array}
             */
            $scope.moduleItems = [];

            /**
             * @todo
             * salesItemListTpe : To be loaded from server but currently no API call is available for this
             */
            $scope.salesItemListType = 0;
            $scope.editPermission = true;
            $scope.editMode = true;

            /**
             * Add item to the enquiry list
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
             * removes item from enquiry list
             * @param item
             */
            $scope.removeItem = function(txItem){
                var txItemIndex  = $scope.modalBox.tx.itemList.indexOfWhere('ItemID',txItem.ItemID);
                ////////console.log(txItemIndex);
                $scope.modalBox.tx.itemList.splice(txItemIndex,1);
            };

            /**
             * Modal Box data model
             * @type {{title: string, class: string, editMode: boolean, locationList: Array, tx: {orderAmount: number, trnNo: string, ezeidTid: number, TID: number, functionType: number, ezeid: string, statusType: number, notes: string, locId: string, country: string, state: string, city: string, area: string, contactInfo: string, deliveryAddress: string, nextAction: number, nextActionDateTime: string, taskDateTime: string, folderRule: number, message: string, messageType: *, latitude: number, longitude: number, duration: number, durationScale: number, itemList: Array}}}
             */
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

            $scope.resolveAddress = function(){
                $scope.$emit('$preLoaderStart');
                $scope.resolveGeolocationAddress().then(function(){
                    $scope.$emit('$preLoaderStop');
                });
            };

            $scope.resolveGeolocationAddress = function(){
                var defer = $q.defer();
                $scope.modalBox.tx.address = '';
                if($scope.modalBox.tx.locId == ''){
                    $timeout(function(){
                        defer.resolve();
                    },500);
                    return defer.promise;
                }

                var googleMap = new GoogleMap();

                var lat = 0;
                var lng = 0;
                if($scope.modalBox.tx.locId == 0){
                    googleMap.getCurrentLocation().then(function(){
                        lat = googleMap.currentMarkerPosition.latitude;
                        lng = googleMap.currentMarkerPosition.longitude;

                        $scope.modalBox.tx.latitude = lat;
                        $scope.modalBox.tx.longitude = lng;

                        googleMap.getReverseGeolocation(lat,lng).then(function(resp){

                            if(resp.data){
                                var data = googleMap.parseReverseGeolocationData(resp.data);
                                $scope.modalBox.tx.city = data.city;
                                $scope.modalBox.tx.state = data.state;
                                $scope.modalBox.tx.country = data.country;
                                $scope.modalBox.tx.area = data.area;
                                //$scope.modalBox.tx.address = data.route + ', '+ data.sublocality3 + ', '+ data.sublocality2;
                                $scope.modalBox.tx.address = googleMap.createAddressFromGeolocation(data,{
                                    route : true,
                                    sublocality3 : true,
                                    sublocality2 : true,
                                    area : false,
                                    city : false,
                                    state : false,
                                    country : false,
                                    postalCode : false
                                });

                            }
                            else{
                                //$scope.$emit('$preLoaderStop');
                                Notification.error({message : 'Please enable geolocation settings n your browser',delay : MsgDelay});
                            }
                            defer.resolve();

                        },function(){
                            Notification.error({message : 'Please enable geolocation settings n your browser',delay : MsgDelay});
                            defer.resolve();
                        });

                    });

                }
                else{
                    var locIndex = $scope.modalBox.locationList.indexOfWhere("TID",parseInt($scope.modalBox.tx.locId));
                    if(locIndex === -1){
                        $timeout(function(){
                            defer.resolve();
                        },500);
                        return defer.promise;
                    }
                    lat = $scope.modalBox.locationList[locIndex].Latitude;
                    lng = $scope.modalBox.locationList[locIndex].Longitude;


                    $scope.modalBox.tx.address = $scope.modalBox.locationList[locIndex].AddressLine1+' ' +
                        $scope.modalBox.locationList[locIndex].AddressLine2;

                    $scope.modalBox.tx.latitude = lat;
                    $scope.modalBox.tx.longitude = lng;

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

                return defer.promise;
            };


            /**
             * Resets modal box data
             */
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

                $scope.txerror = {
                    items : false,
                    address : false,
                    area : false,
                    city : false,
                    state : false,
                    country : false
                };

            };


            /**
             * Loads logged in user details from server
             * @returns {*}
             */
            $scope.getUserDetails = function(){
                var defer = $q.defer();
                $http({
                    method: 'get',
                    url: GURL + 'ewtEZEIDPrimaryDetails',
                    params : {
                        Token : $rootScope._userInfo.Token,
                        /**
                         * Change this variable to $routeParams.ezeone so that now /IND1/sales path can be supported
                         */
                        EZEID : $scope.ezeone
                    }
                }).success(function (resp) {

                    /**
                     * @todo
                     * Check whether sales module visibility is enabled or
                     * not for the ezeid to which sales enquiry is posted
                     */
                    if (resp && resp != 'null' && resp.length > 0) {
                        $scope.masterUser = resp[0];
                        $scope.salesItemListType = ($scope.masterUser.SalesItemListType &&
                        (!isNaN(parseInt($scope.masterUser.SalesItemListType)))) ? parseInt($scope.masterUser.SalesItemListType) : 0 ;
                        //$scope._salesModalTitle = ($scope.masterUser.SalesModuleTitle) ? $scope.masterUser.SalesModuleTitle : 'Sales Enquiry';
                        defer.resolve();
                    }
                    else{
                        defer.reject();
                    }
                }).error(function(err,statusCode){
                    if(statusCode == 0){
                        Notification.error({ message : 'Unable to reach server! Please check your connection'});
                        defer.reject(true);
                    }
                    else{
                        defer.reject();
                    }

                });

                return defer.promise;
            };


            /**
             * Get item list for searched EZEID
             * @returns {*}
             */
            $scope.getModuleItemList = function(){
                var defer = $q.defer();
                $http({
                    url : GURL + 'ewtGetItemListForEZEID',
                    method : 'GET',
                    params : {
                        Token: $rootScope._userInfo.Token,
                        FunctionType: 0,
                        EZEID: $scope.SearchInfo.EZEID
                    }
                }).success(function(resp){
                    if(resp && resp.length > 0 && resp !== 'null'){
                        $scope.moduleItems = resp;
                    }
                    defer.resolve(resp);

                }).error(function(err){
                    defer.resolve();
                });

                return defer.promise;
            };

            /**
             * Get location list for logged in user
             */
            $scope.getLocationList = function(){
                var defer = $q.defer();
                $http({
                    url : GURL + 'ewtGetLocationListForEZEID',
                    method : 'GET',
                    params : {
                        Token : $rootScope._userInfo.Token,
                        TID :   $scope.masterUser.TID
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
                    ToEZEID : $scope.SearchInfo.EZEID,
                    TID : 0,
                    Token : $rootScope._userInfo.Token,
                    MessageText : $scope.modalBox.tx.message,
                    Status : 0,
                    TaskDateTime : moment().format('DD MMM YYYY hh:mm:ss'),
                    Notes : $scope.modalBox.tx.notes,
                    LocID : ($scope.modalBox.tx.locId) ? $scope.modalBox.tx.locId : 0,
                    Country : $scope.modalBox.tx.country,
                    State : $scope.modalBox.tx.state,
                    City : $scope.modalBox.tx.city,
                    Area : $scope.modalBox.tx.area,
                    FunctionType : 0,   // For sales
                    Latitude : $scope.modalBox.tx.latitude,
                    Longitude : $scope.modalBox.tx.longitude,
                    EZEID : $rootScope._userInfo.ezeid,
                    ContactInfo : $scope.masterUser.FirstName + ' '+ $scope.masterUser.LastName + ', '+ $scope.masterUser.MobileNumber,
                    FolderRuleID : 0,
                    Duration : 0,
                    DurationScales : 0,
                    NextAction : 0,
                    NextActionDateTime : moment().format('DD MMM YYYY hh:mm:ss'),
                    ItemsList: JSON.stringify($scope.modalBox.tx.itemList),
                    DeliveryAddress : $scope.modalBox.tx.address + $scope.modalBox.tx.area + $scope.modalBox.tx.city +
                    $scope.modalBox.tx.state + $scope.modalBox.tx.country,
                    companyName : ($scope.masterUser.IDTypeID == 1) ? $scope.masterUser.FirstName : $scope.masterUser.CompanyName
                };
                return preparedTx;
            };

            $scope.txerror = {
                items : false,
                address : false,
                area : false,
                city : false,
                state : false,
                country : false
            };

            var validateTransaction = function(tx){

                var flag = true;
                if(!tx.address){
                    $scope.txerror.address = true;
                    flag *= false;
                }
                if(tx.address && tx.address.trim().length < 1){
                    $scope.txerror.address = true;
                    flag *= false;
                }
                if(!tx.area){
                    $scope.txerror.area = true;
                    flag *= false;
                }
                if(tx.area && tx.area.trim().length < 1){
                    $scope.txerror.area = true;
                    flag *= false;
                }

                if(!tx.city){
                    $scope.txerror.city = true;
                    flag *= false;
                }

                if(tx.city && tx.city.trim().length < 1){
                    $scope.txerror.city = true;
                    flag *= false;
                }

                if(!tx.state){
                    $scope.txerror.state = true;
                    flag *= false;
                }
                if(tx.state && tx.state.trim().length < 1){
                    $scope.txerror.state = true;
                    flag *= false;
                }

                if(!tx.country){
                    $scope.txerror.country = true;
                    flag *= false;
                }
                if(tx.country && tx.country.trim().length < 1){
                    $scope.txerror.country = true;
                    flag *= false;
                }

                if(tx.itemList.length < 1 && $scope.salesItemListType > 0 && $scope.moduleItems.length > 0){
                    $scope.txerror.items = true;
                    flag *= false;
                }
                return flag;
            };

            /**
             * Saving transaction in
             * @param editMode
             */
            $scope.saveTransaction = function(){

                $scope.txerror = {
                    items : false,
                    address : false,
                    area : false,
                    city : false,
                    state : false,
                    country : false
                };

                if(!validateTransaction($scope.modalBox.tx)){
                    Notification.error({ message : 'Please check all the errors', delay : MsgDelay});
                    return false;
                }

                var data = prepareSaveTransaction($scope.modalBox.editMode);

                if(!data.ContactInfo){
                    Notification.error({ message : 'Please enter contact information for customer',delay : MsgDelay});
                    return ;
                }

                if($scope.modalBox.tx.itemList.length <  1 && $scope.salesItemListType > 0){
                    Notification.error({ message : 'Please select items for the enquiry',delay : MsgDelay});
                    return ;
                }


                if($scope.modalBox.tx.message.length < 1 && $scope.salesItemListType > 0){
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

                            Notification.success({ message : msg, delay : MsgDelay});
                            $scope._toggleSalesModal();
                            $scope.resetModalBox();
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


            var init = function(){
                $scope.$emit('$preLoaderStart');
                $scope.getUserDetails().then(function(){
                    $scope.getModuleItemList().then(function(){
                        $scope.getLocationList().then(function(){
                            $scope.$emit('$preLoaderStop');
                        },function(){
                            Notification.error({ message : 'An error occured ! Please try again', delay : MsgDelay});
                            $scope.$emit('$preLoaderStop');
                        });
                    },function(){
                        Notification.error({ message : 'An error occured ! Please try again', delay : MsgDelay});
                        $scope.$emit('$preLoaderStop');
                    });
                },function(noInternet){
                    $scope.$emit('$preLoaderStop');
                    if(!noInternet){
                        Notification.error({ message : 'An error occured ! Please try again', delay : MsgDelay});
                    }

                });
            };

            init();

            //    }
            ////});
        }
    ]);
})();