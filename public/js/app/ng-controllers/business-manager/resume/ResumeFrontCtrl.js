(function() {
    angular.module('ezeidApp').controller('ResumeFrontCtrl', [
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
        'UtilityService',
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
                  GoogleMap,
                  UtilityService
        ) {

            $scope.ezeone = $routeParams['ezeone'];
            $scope.isEnquiryPosted = false;
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

            $scope.masterUser = null;
            /**
             * List of Items available for searched EZEID
             * @type {Array}
             */
            $scope.moduleItems = [];

            /**
             * @todo
             * resumeItemListTpe : To be loaded from server but currently no API call is available for this
             */
            $scope.resumeItemListType = 0;
            $scope.editPermission = false;
            $scope.editMode = false;

            /**
             * Modal Box data model
             * @type {{title: string, class: string, editMode: boolean, locationList: Array, tx: {orderAmount: number, trnNo: string, ezeidTid: number, TID: number, functionType: number, ezeid: string, statusType: number, notes: string, locId: string, country: string, state: string, city: string, area: string, contactInfo: string, DeliveryAddress: string, nextAction: number, nextActionDateTime: string, taskDateTime: string, folderRule: number, message: string, messageType: *, latitude: number, longitude: number, duration: number, durationScale: number, itemList: Array}}}
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
                    functionType : 4, // Function Type will be 0 for resume
                    ezeid : '',
                    statusType : 0,
                    notes : '',
                    locId : '',
                    country : '',
                    state : '',
                    city : '',
                    area : '',
                    contactInfo : '',
                    DeliveryAddress : '',
                    nextAction : 0,
                    nextActionDateTime : '',
                    taskDateTime : '',
                    folderRule : 0,
                    message : '',
                    messageType : 0,
                    latitude : 0,
                    longitude : 0,
                    duration : 0,
                    durationScale : 0,
                    itemList : []     // This is transaction item list
                }
            };


            /**
             * Resets modal box data
             */
            $scope.resetModalBox = function(){
                $scope.modalBox = {
                    title : 'Submit Resume',
                    class : 'business-manager-modal',
                    locationList : [],
                    editMode : false,
                    tx : {
                        orderAmount : 0,
                        trnNo : '',
                        ezeidTid : 0,

                        TID : 0,
                        functionType : 4, // Function Type will be 0 for resume
                        ezeid : '',
                        statusType : 0,
                        notes : '',
                        locId : '',
                        country : '',
                        state : '',
                        city : '',
                        area : '',
                        contactInfo : '',
                        DeliveryAddress : '',
                        nextAction : 0,
                        nextActionDateTime : '',
                        taskDateTime : '',
                        folderRule : 0,
                        message : '',
                        messageType : 0,
                        latitude : 0,
                        longitude : 0,
                        duration : 0,
                        durationScale : 0,
                        itemList : [],
                        pinCode : ''
                    }
                };

            };

            $scope.loggedInUser = {};


            $scope.getLoggedInUserDetails = function(){
                var defer = $q.defer();
                $http({
                    method: 'get',
                    url: GURL + 'ewtEZEIDPrimaryDetails',
                    params : {
                        Token : $rootScope._userInfo.Token,
                        /**
                         * Change this variable to $routeParams.ezeone so that now /IND1/resume path can be supported
                         */
                        EZEID : $rootScope._userInfo.ezeid
                    }
                }).success(function (resp) {

                    if (resp && resp != 'null' && resp.length > 0) {
                        $scope.loggedInUser = resp[0];

                        if(parseInt($scope.loggedInUser.IDTypeID) !== 1){
                            Notification.error({ title : 'Permission Denied',
                                message : 'Business user is not allowed to send resume', delay : MsgDelay});
                            $location.path('/'+$routeParams['ezeone']);
                            return;
                        }
                        //$scope._resumeModalTitle = ($scope.masterUser.resumeModuleTitle) ? $scope.masterUser.resumeModuleTitle : 'resume Enquiry';
                        defer.resolve();
                    }
                    else{
                        defer.reject();
                    }
                }).error(function(err,statusCode) {
                    if (statusCode == 0) {
                        Notification.error({message: 'Unable to reach server! Please check your connection'});
                        defer.reject(true);
                    }
                    else {
                        defer.reject();
                    }
                });
                return defer.promise;
            };



            /**
             * Loads searched user details from server
             * @returns {*}
             */
            $scope.getUserDetails = function(){
                var defer = $q.defer();
                $http({
                    method: 'GET',
                    url: GURL + 'ewtEZEIDPrimaryDetails',
                    params : {
                        Token : $rootScope._userInfo.Token,
                        /**
                         * Change this variable to $routeParams.ezeone so that now /IND1/resume path can be supported
                         */
                        EZEID : $scope.ezeone
                    }
                }).success(function (resp) {

                    /**
                     * Check whether resume module visibility is enabled or
                     * not for the ezeid to which resume enquiry is posted
                     */
                    if (resp && resp != 'null' && resp.length > 0) {
                        $scope.masterUser = resp[0];

                        if(parseInt($scope.masterUser.IDTypeID) !== 2){
                            $window.location.replace('/'+$scope.ezeone);
                        }

                        var visibleModules = ($scope.masterUser.VisibleModules) ?
                            (($scope.masterUser.VisibleModules.length == 5) ? $scope.masterUser.VisibleModules : '22222')
                            : '22222';


                        /**
                         * Do not allow ohter user to see the module if the module is not visible
                         * so that he will not be able to do resume enquiry
                         */
                        if(parseInt(visibleModules.split('')[4]) !== 1){
                            $window.location.replace('/'+$scope.ezeone);
                        }

                        $scope.modalBox.tx.messageType =  0;
                        $scope.resumeItemListType = 0;
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
             * Preparing data for saving transaction
             * @param tx
             * @param editMode
             */
            var prepareSaveTransaction = function(editMode){

                /**
                 * @todo Implement Validations
                 * 1. Access Rights and permission
                 * 2. Format of Dates, action types and status
                 * 3. Amount
                 * @type {{TID: number, Token: *, MessageText: string, Status: number, TaskDateTime: string, Notes: string, LocID: *, Country: string, State: string, City: string, Area: string, FunctionType: number, Latitude: number, Longitude: number, EZEID: string, ContactInfo: string, FolderRuleID: number, Duration: number, DurationScales: number, NextAction: number, NextActionDateTime: string, ItemsList: Array, DeliveryAddress: string}}
                 */
                var preparedTx = {
                    ToEZEID : $scope.ezeone,
                    TID : 0,
                    Token : $rootScope._userInfo.Token,
                    MessageText : $scope.modalBox.tx.message,
                    Status : 0,
                    TaskDateTime : UtilityService._convertTimeToServer(moment().format('DD MMM YYYY hh:mm:ss A'),'DD MMM YYYY hh:mm:ss A','DD MMM YYYY hh:mm:ss A'),
                    Notes : $scope.modalBox.tx.notes,
                    LocID : ($scope.modalBox.tx.locId) ? $scope.modalBox.tx.locId : 0,
                    Country : $scope.modalBox.tx.country,
                    State : $scope.modalBox.tx.state,
                    City : $scope.modalBox.tx.city,
                    Area : $scope.modalBox.tx.area,
                    FunctionType : 4,   // For resume
                    Latitude : $scope.modalBox.tx.latitude,
                    Longitude : $scope.modalBox.tx.longitude,
                    EZEID : $rootScope._userInfo.ezeid,
                    ContactInfo : $rootScope._userInfo.FirstName + ' '+ (($rootScope._userInfo.LastName) ? $rootScope._userInfo.LastName : '' ) + ', '+ ($scope.masterUser.MobileNumber) ? $scope.masterUser.MobileNumber : '',
                    FolderRuleID : 0,
                    Duration : 0,
                    DurationScales : 0,
                    NextAction : 0,
                    NextActionDateTime  : UtilityService._convertTimeToServer(moment().format('YYYY-MM-DD HH:mm:ss'),'YYYY-MM-DD HH:mm:ss','YYYY-MM-DD HH:mm:ss'),
                    ItemsList: '',
                    DeliveryAddress : '', // No delivery address for this user
                    companyName : '',
                    company_id : 0
                };
                return preparedTx;
            };

            /**
             * Checks that resume is uploaded by the logged in user or not who is actually submitting the
             * resume application
             * @returns {boolean}
             */
            var checkResumeAttached = function(){
                var promise = $q.defer();
                /**
                 * Check if resume attached or not for a person who is applying for this job
                 *
                 */
                $http({
                    url : GURL + 'ewtGetCVInfo',
                    params : {
                        TokenNo : $rootScope._userInfo.Token
                    },
                    method : 'GET'
                }).success(function(respx){

                    if(respx && respx.status && resp !== 'null'){
                        var resp = respx.data;
                        if(resp[0].CVDocFile){
                            (resp[0].CVDocFile.trim().length > 0) ? promise.resolve(true) : promise.resolve(false);
                        }
                        else{
                            promise.resolve(false);
                        }
                    }
                    else{
                        promise.resolve(false);
                    }
                }).error(function(resp){
                    promise.resolve(false);
                });
                return promise.promise;
            };

            $scope.isResumeAttached = true;

            /**
             * Saving transaction in
             * @param editMode
             */
            $scope.saveTransaction = function(){
                checkResumeAttached().then(function(isResumeAttached){
                    $scope.isResumeAttached = isResumeAttached;

                    if(isResumeAttached){
                        var data = prepareSaveTransaction($scope.modalBox.editMode);
                        $scope.$emit('$preLoaderStart');
                        $http({
                            url : GURL + 'ewtSaveTranscation',
                            method : 'POST',
                            data : data
                        }).success(function(resp){
                            if(resp && resp.hasOwnProperty('IsSuccessfull')){
                                if(resp.IsSuccessfull){
                                    var msg = 'Your Resume is submitted successfully';
                                    $scope.isEnquiryPosted = true;

                                    Notification.success({ message : msg, delay : MsgDelay});
                                }
                                else{
                                    Notification.error({ message : 'An error occurred while submitting your resume', delay : MsgDelay});
                                }
                            }
                            else{
                                Notification.error({ message : 'An error occurred while submitting your resume', delay : MsgDelay});
                            }

                            $scope.$emit('$preLoaderStop');
                        }).error(function(err){
                            $scope.$emit('$preLoaderStop');
                            Notification.error({ message : err, delay : MsgDelay});
                        });
                    }
                    else{
                        Notification.error({ message : 'Please attach resume before submitting it!', delay : MsgDelay});
                    }
                });
            };

            var masterUserLoaded = false;
            var loggedInUserLoaded = false;
            //var masterUserItemsLoaded = false;
            //var loggedInUserLocationsLoaded = true;

            /**
             * If all the three laoded parameters are true then preloader is stopped
             */
            var checkLoaded = function(){
                //if(masterUserLoaded && loggedInUserLoaded && masterUserItemsLoaded){
                if(masterUserLoaded && loggedInUserLoaded){
                    $scope.$emit('$preLoaderStop');
                    return true;
                }
                else{
                    return false;
                }
            };


            var init = function(){
                $scope.$emit('$preLoaderStart');
                $scope.getUserDetails().then(function(){
                    masterUserLoaded = true;
                    checkLoaded();
                },function(noInternet){
                    masterUserLoaded = false;
                    if(!noInternet){
                        Notification.error({ message : 'An error occurred ! Please try again', delay : MsgDelay});
                    }
                    checkLoaded();
                    $location.url('/'+$routeParams.ezeone);

                });

                $scope.getLoggedInUserDetails().then(function(){
                    loggedInUserLoaded = true;
                    checkLoaded();
                },function(){
                    loggedInUserLoaded = true;
                    Notification.error({ message : 'An error occurred ! Please try again', delay : MsgDelay});
                    checkLoaded();
                });
            };

            $scope.closeForm = function(){
                $window.location.replace('/'+$scope.ezeone);
            };



            init();



        }
    ]);
})();