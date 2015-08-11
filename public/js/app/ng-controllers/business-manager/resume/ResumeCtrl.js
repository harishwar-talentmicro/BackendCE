(function(){
    angular.module('ezeidApp').controller('ResumeCtrl',[
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
        'FileToBase64',
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
            GoogleMap,
            UtilityService,
            FileToBase64
        ) {

            $scope.txSearchTerm = '';
            /**
             * Variable that tell that when somebody is loading applicants for single job
             * the applicant list is loaded or not and the promise is resolved or not
             * (Only in case when person comes from the neighbourhood tab i.e. Jobs)
             * @type {boolean}
             */
            $scope.jobTidLoaded = false;
            $scope.jobTitleString = '';

            $scope.salaryTypeMapping = [
                'p.h.',
                'p.m.',
                'p.a.'
            ];

            $scope.salaryTypeMappingLong = [
                'per hour',
                'per month',
                'per year'
            ];

            $scope.experienceFrom = 0;
            $scope.experienceTo = 50;
            /**
             * Probability Values are mapped in this fashion
             * @type {string[]}
             *
             * Index of this array start from 0, therefore for display purposes conversions are done in html template file only
             */

            $scope.probabilityMapping = [
                'Less Likely',      // 1
                'Likely',           // 2 (Default probability for every lead)
                'More Likely',      // 3
                'Definite'          // 4
            ];


            $scope.alarmDurationList = [
                "--Select Alarm Duration--",
                "15 Minutes",
                "30 Minutes",
                "1 Hour",
                "2 Hours",
                "3 Hours",
                "4 Hours",
                "1 Day",
                "7 Days",
                "1 Week",
                "1 Month"
            ];

            /**
             * Logged in user cannot use this module as he is not having the required permissions for it
             */
            var moduleIndex = $scope.modules.indexOfWhere('type','resume');
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
             * recruitmentitems present for this user
             * @type {Array}
             */
            $scope.moduleItems = [];

            $scope.totalPages = 1;
            $scope.filterStatus = -2;   // Show all at first
            $scope.sortBy = 0;
            $scope.filterStatusTypes = [];
            $scope.txStatusTypes = [];
            $scope.txActionTypes = [];
            $scope.txFolderRules = [];



            $scope.showModal = false;
            $scope.modalBox = {
                title : 'Add New Applicant',
                class : 'business-manager-modal',
                contactType : 0, // Shows that transaction is made by EZEID (1) or by Contact Name Only (2), zero means have to select
                editMode : false,
                locationList : [],
                tx : {
                    orderAmount : 0.00,
                    trnNo : '',
                    ezeidTid : 0,

                    TID : 0,
                    functionType : 4, // Function Type will be 4 for recruitment (resume)
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
                    messageType : (0) ? 0 : 0,
                    latitude : 0,
                    longitude : 0,
                    duration : 0,
                    durationScale : 0,
                    itemList : [],     // This is transaction item list
                    companyName : '',
                    companyId : 0,
                    attachment : "",
                    attachmentName : "",
                    attachmentMimeType : "",
                    probability : 2,
                    targetDate : moment().format('YYYY-MM-DD'),
                    alarmDuration : 0,

                    instituteId : 0,
                    educationId : 0,
                    specializationId : 0,
                    salaryType : 3,
                    jobId : 0
                }
            };

            $scope.editModes = [];



            $scope.getEzeidLocationDetails = function(ezeoneId){
                var defer = $q.defer();
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'ezeoneid',
                    method : 'GET',
                    params : {
                        ezeoneid : ezeoneId,
                        token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){
                    $scope.$emit('$preLoaderStop');
                    if(resp && resp.status){
                        angular.element('#ezeoneAddressId').parent('.input-group').removeClass('has-error').addClass('has-success');
                        $scope.modalBox.tx.address = resp.data.AddressLine1;
                        $scope.modalBox.tx.area = resp.data.AddressLine1;
                        $scope.modalBox.tx.city = resp.data.CityTitle;
                        $scope.modalBox.tx.state = resp.data.StateTitle;
                        $scope.modalBox.tx.country = resp.data.CountryTitle;
                        $scope.modalBox.tx.pinCode = resp.data.PostalCode;
                        $scope.modalBox.tx.latitude = resp.data.Latitude;
                        $scope.modalBox.tx.longitude = resp.data.Longitude;

                        $scope.modalBox.tx.DeliveryAddress = makeAddress();
                    }
                    else{
                        Notification.error({ title : 'Error', message : 'EZEOne ID not found', delay : MsgDelay});
                    }

                    defer.resolve(resp);
                }).error(function(err,statusCode){
                    $scope.$emit('$preLoaderStop');
                    var msg = 'EZEOne ID not found';
                    if(!statusCode){
                        msg = 'Unable to reach the server ! Please check your connection';
                    }
                    if(statusCode == 400){
                        Notification.error({ title : 'Error', message : msg, delay : MsgDelay});
                    }

                    defer.resolve(null);
                });
                return defer.promise;
            };

            /**
             * Eliminates the rate and item description from the message
             * so that it can be recalculated and saved when internal user changes or updates the order
             * @param msg
             * @usage parameter msg will be like
             * msg = 'this is message text for this recruitmentenquiry     Nuts(7), Bolts(6)
             * alteredMsg = 'this is message text for this recruitment enquiry'
             */
            var alterTransactionMessageToEdit = function(msg){

                return msg;
                /**
                 * Return message unaltered in case of recruitment
                 */
            };

            /**
             * Copies the transaction properties to editMode Object
             * @param tx
             * @changeUserDetails {boolean} if true then ezeid is not allocated to modalbox.tx.ezeid so that watcher doesn't execute
             * saving one api call (loadUserDetails)
             * @return editModeTx
             */
            var prepareEditTransaction = function(tx,changeUserDetails){
                console.log(tx);
                var editModeTx =  {
                    trnNo : tx.TrnNo,
                    ezeid : (changeUserDetails) ? '' :  tx.RequesterEZEID,
                    ezeidTid : (tx.EZEID) ? true : 0,

                    TID : tx.TID,
                    functionType : 4, // Function Type will be 4 for recruitment (resume)

                    statusType : (tx.Status) ? tx.Status : 0,
                    notes : tx.Notes,
                    locId : tx.LocID,
                    country : '',
                    state : '',
                    city : '',
                    area : '',
                    contactInfo : (tx.ContactInfo) ? tx.ContactInfo : tx.Requester,
                    DeliveryAddress : tx.DeliveryAddress,
                    nextAction : (tx.NextActionID && tx.NextActionID !== 'null') ? tx.NextActionID : 0,
                    nextActionDateTime : $filter('dateTimeFilter')(tx.NextActionDate,'DD MMM YYYY hh:mm A','DD MMM YYYY HH:mm'),
                    taskDateTime : tx.TaskDateTime,
                    folderRule : (tx.FolderRuleID && tx.FolderRuleID !== 'null') ? tx.FolderRuleID : 0,
                    message : alterTransactionMessageToEdit(tx.Message),
                    messageType : (0) ? 0 : 0,
                    latitude : 0,
                    longitude : 0,
                    duration : 0,
                    durationScale : 0,
                    itemList : [],
                    companyId : 0,
                    companyName :  '',
                    amount : (parseFloat(tx.salary) !== NaN) ? parseFloat(tx.salary).toFixed(2) : 0.00,
                    targetDate : (tx.target_date) ? tx.target_date :  moment().format('YYYY-MM-DD'),
                    probability : (parseInt(tx.probability) !== NaN && parseInt(tx.probability) !== 0) ?
                        parseInt(tx.probability) : 2,
                    attachment : "",
                    attachmentName : "",
                    attachmentMimeType : "",
                    alarmDuration : (parseInt(tx.alarm_duration)) ? parseInt(tx.alarm_duration) : 0,
                    instituteId : tx.institute_id,
                    educationId : tx.Educationid,
                    specializationId : tx.specialization_id,
                    jobId : tx.job_id,
                    salaryType : tx.salary_type,
                    orderAmount : (parseFloat(tx.salary) !== NaN) ? parseFloat(tx.salary).toFixed(2) : 0.00

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
                        nextActionDateTime : UtilityService._convertTimeToServer(($scope.modalBox.tx.nextActionDateTime)
                            ? moment($scope.modalBox.tx.nextActionDateTime,'DD MMM YYYY hh:mm:ss A').format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD HH:mm:ss'),'YYYY-MM-DD HH:mm:ss','YYYY-MM-DD HH:mm:ss'),
                        Token : $rootScope._userInfo.Token,
                        target_date : $scope.modalBox.tx.targetDate,
                        probability : (parseInt($scope.modalBox.tx.probability)) ? $scope.modalBox.tx.probability : 2,
                        alarm_duration : (parseInt($scope.modalBox.tx.alarmDuration)) ? parseInt($scope.modalBox.tx.alarmDuration) : 0,

                        institute_id : (parseInt($scope.modalBox.tx.instituteId) !== NaN
                        && parseInt($scope.modalBox.tx.instituteId) > 0) ?
                            parseInt($scope.modalBox.tx.instituteId) : 0,

                        education_id : (parseInt($scope.modalBox.tx.educationId) !== NaN
                        && parseInt($scope.modalBox.tx.educationId) > 0) ?
                            parseInt($scope.modalBox.tx.educationId) : 0,

                        specialization_id : (parseInt($scope.modalBox.tx.specializationId) !== NaN
                        && parseInt($scope.modalBox.tx.specializationId) > 0) ?
                            parseInt($scope.modalBox.tx.specializationId) : 0,

                        job_id : (parseInt($scope.modalBox.tx.jobId) !== NaN
                        && parseInt($scope.modalBox.tx.jobId) > 0) ?
                            parseInt($scope.modalBox.tx.jobId) : 0,

                        amount : (parseFloat($scope.modalBox.tx.orderAmount) !== NaN
                        && parseFloat($scope.modalBox.tx.orderAmount) > 0) ?
                            parseFloat($scope.modalBox.tx.orderAmount) : 0,

                        salary_type : ($scope.modalBox.tx.salaryType) ? $scope.modalBox.tx.salaryType : 3
                    }
                }).success(function(resp){
                    $scope.$emit('$preLoaderStop');
                    if(resp && resp.status && resp!= 'null'){
                        Notification.success({ message : 'Record updated successfully', delay : MsgDelay});
                        $scope.resetModalBox();
                        $scope.toggleAllEditMode();

                        var id = $scope.txList.indexOfWhere('TID',parseInt(resp.data.TID));
                        $scope.txList[id].FolderRuleID = parseInt(resp.data.folderRuleID);
                        $scope.txList[id].Status = parseInt(resp.data.status);

                        $scope.txList[id].statustitle = ($scope.txStatusTypes.indexOfWhere('TID', parseInt(resp.data.status)) !== -1)
                            ? $scope.txStatusTypes[$scope.txStatusTypes.indexOfWhere('TID', parseInt(resp.data.status))].StatusTitle : '',

                            $scope.txList[id].FolderTitle = ($scope.txFolderRules.indexOfWhere('TID', parseInt(resp.data.folderRuleID)) !== -1)
                                ? $scope.txFolderRules[$scope.txFolderRules.indexOfWhere('TID', parseInt(resp.data.folderRuleID))].FolderTitle : '',

                            $scope.txList[id].ActionTitle = ($scope.txActionTypes.indexOfWhere('TID', parseInt(resp.data.nextAction)) !== -1)
                                ? $scope.txActionTypes[$scope.txActionTypes.indexOfWhere('TID', parseInt(resp.data.nextAction))].ActionTitle : '',

                            $scope.txList[id].NextActionID = (parseInt(resp.data.nextAction)!== NaN ) ? parseInt(resp.data.nextAction) : 0 ;
                        var date = moment().format('DD MMM YYYY hh:mm A');
                        try{
                            date = moment(resp.data.nextActionDateTime,'YYYY-MM-DD HH:mm:ss').format('DD MMM YYYY hh:mm A');
                            resp.data.nextActionDateTime = UtilityService._convertTimeToLocal(date,'DD MMM YYYY hh:mm A','DD MMM YYYY hh:mm A');
                        }
                        catch(ex){
                            var date = moment().format('YYYY-MM-DD HH:mm:ss A').format('DD MMM YYYY hh:mm A');
                            resp.data.nextActionDateTime = UtilityService._convertTimeToLocal(date,'DD MMM YYYY hh:mm A','DD MMM YYYY hh:mm A');
                        }
                        $scope.txList[id].NextActionDate = resp.data.nextActionDateTime;

                        $scope.txList[id].target_date = resp.data.target_date;
                        $scope.txList[id].probability = (parseInt(resp.data.probability)) ? parseInt(resp.data.probability) : 2;

                        $scope.txList[id].institute_id = resp.data.institute_id;
                        $scope.txList[id].Educationid = resp.data.education_id ;
                        $scope.txList[id].specialization_id = resp.data.specialization_id ;
                        $scope.txList[id].job_id = resp.data.job_id;

                        $scope.txList[id].salary = resp.data.amount;
                        $scope.txList[id].salary_type = resp.data.salary_type;

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

                /**
                 * Recruitment will be having no items therefore not making an HTTP call to load items
                 * and returning the promise with empty item set
                 */
                $timeout(function(){
                    defer.resolve([]);
                },250);
                //$http({
                //    url : GURL + 'ewtGetTranscationItems',
                //    method : 'GET',
                //    params : {
                //        Token : $rootScope._userInfo.Token,
                //        MessageID : txId
                //    }
                //}).success(function(resp){
                //    if(resp && resp.length > 0 && resp !== 'null'){
                //        $scope.modalBox.tx.itemList = resp;
                //        defer.resolve(resp);
                //    }
                //    else{
                //        defer.resolve([]);
                //    }
                //}).error(function(err){
                //    Notification.error({ message : 'Unable to load items for this enquiry ! Please try again', delay : MsgDelay});
                //    defer.reject();
                //});
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
                    var editTx = prepareEditTransaction($scope.txList[index],true);

                    if($scope.moduleConf.listType > 0){
                        $scope.$emit('$preLoaderStart');
                        loadTransactionItems(editTx.TID).then(function(resp){
                            editTx.itemList = resp;

                            $scope.showModal = !$scope.showModal;
                            //UI updation is not happening properly because ui is not rendered, and model bind before it
                            //therefore once again updating data after ui rendered
                            $timeout(function(){
                                $scope.modalBox.title = 'Update Applicant';
                                $scope.modalBox.tx = editTx;
                                $scope.modalBox.contactType = ($scope.modalBox.tx.ezeid) ? 1 : 2;
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
             * This code is commented intentionally because there is no requirement of
             * address in recruitment module
             */

            //var googleMap = new GoogleMap();
            //$timeout(function(){
            //    googleMap.addSearchBox('google-map-search-box');
            //    googleMap.listenOnMapControls(null,function(lat,lng){
            //        $scope.modalBox.tx.latitude = lat;
            //        $scope.modalBox.tx.longitude = lat;
            //        googleMap.getReverseGeolocation(lat,lng).then(function(resp){
            //            if(resp.data){
            //                var data = googleMap.parseReverseGeolocationData(resp.data);
            //                $scope.modalBox.tx.city = data.city;
            //                $scope.modalBox.tx.state = data.state;
            //                $scope.modalBox.tx.country = data.country;
            //                $scope.modalBox.tx.area = data.area;
            //                $scope.modalBox.tx.pinCode = data.postalCode;
            //                $scope.modalBox.tx.address = googleMap.createAddressFromGeolocation(data,{
            //                    route : true,
            //                    sublocality3 : true,
            //                    sublocality2 : true,
            //                    area : false,
            //                    city : false,
            //                    state : false,
            //                    country : false,
            //                    postalCode : false
            //                });
            //
            //                $scope.modalBox.tx.DeliveryAddress = makeAddress();
            //            }
            //            else{
            //                Notification.error({message : 'Please enable geolocation settings in your browser',delay : MsgDelay});
            //            }
            //
            //        },function(){
            //            Notification.error({message : 'Please enable geolocation settings in your browser',delay : MsgDelay});
            //            defer.resolve();
            //        });
            //    },false);
            //},3000);



            /**
             * Selecting address selection method whether using EZEOne ID or other address
             * @type {number} 0 : EZEOne ID location
             * 1 : Other address (Google map autocomplete active)
             */
            $scope.addressSelectionType = 0;

            /**
             * EZEOne ID from which address will be fetched
             * @type {string}
             */
            $scope.ezeoneAddressId = '';
            var timeoutPromise = null;
            $scope.$watch('ezeoneAddressId',function(n,v){
                //console.log(n);
                //console.log(v);
                if(n && (n !== v)){
                    //console.log('hello');
                    if(timeoutPromise){
                        $timeout.cancel(timeoutPromise);
                    }
                    angular.element('#ezeoneAddressId').parent('.input-group').removeClass('has-success').addClass('has-error');
                    $scope.modalBox.tx.address = '';
                    $scope.modalBox.tx.area = '';
                    $scope.modalBox.tx.city = '';
                    $scope.modalBox.tx.state = '';
                    $scope.modalBox.tx.country = '';
                    $scope.modalBox.tx.pinCode = '';
                    $scope.modalBox.tx.latitude = 0;
                    $scope.modalBox.tx.longitude = 0;
                    $scope.modalBox.tx.DeliveryAddress = '';
                    timeoutPromise = $timeout(function(){
                        $scope.getEzeidLocationDetails($scope.ezeoneAddressId);
                    },2000);

                }
                else if(!n){
                    angular.element('#ezeoneAddressId').parent('.input-group').removeClass('has-success').addClass('has-error');
                    $scope.modalBox.tx.address = '';
                    $scope.modalBox.tx.area = '';
                    $scope.modalBox.tx.city = '';
                    $scope.modalBox.tx.state = '';
                    $scope.modalBox.tx.country = '';
                    $scope.modalBox.tx.pinCode = '';
                    $scope.modalBox.tx.latitude = 0;
                    $scope.modalBox.tx.longitude = 0;
                    $scope.modalBox.tx.DeliveryAddress ='';
                }
            });

            $scope.$watch('showModal',function(newVal,oldVal){
                $scope.cartAmount = 0.00;
                $scope.cartString = '';
                if(!newVal){
                    $scope.resetModalBox();
                }
            });

            $scope.resetModalBox = function(){
                $scope.modalBox = {
                    title : 'Add applicant',
                    class : 'business-manager-modal',
                    contactType : 0,
                    locationList : [],
                    editMode : false,
                    tx : {
                        orderAmount : 0,
                        trnNo : '',
                        ezeidTid : 0,

                        TID : 0,
                        functionType : 4, // Function Type will be 4 for recruitment (resume)
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
                        messageType : (0) ? 0 : 0,
                        latitude : 0,
                        longitude : 0,
                        duration : 0,
                        durationScale : 0,
                        itemList : [],
                        companyName : '',
                        companyId : 0,

                        attachment : "",
                        attachmentName : "",
                        attachmentMimeType : "",
                        probability : 2,
                        targetDate : moment().format('YYYY-MM-DD'),
                        alarmDuration  : 0,

                        instituteId : 0,
                        educationId : 0,
                        specializationId : 0,
                        salaryType : 3,
                        jobId : 0
                    }
                };

                $scope.cartAmount = 0.00;
                $scope.cartString = '';
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
                ////////////console.log(txItemIndex);
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



            var companyList = [];
            $scope.companySuggestionList = [];
            $scope.loadSuggestion = function(companyName){
                if(companyName){
                    return $filter('filter')(companyList,companyName);
                }
                else{
                    return [];
                }
            };

            /**
             * Not required in recruitment module
             * Loads company list for that particular ezeid
             * Company Contact list according to functionType
             */
            var loadCompany = function(){
                //$http({
                //    method : 'GET',
                //    url : GURL + 'company_details',
                //    params : {
                //        Token : $rootScope._userInfo.Token,
                //        functiontype : 4
                //    }
                //
                //}).success(function(resp){
                //    if(resp && resp.status && resp.data){
                //        for(var a=0; a < resp.data.length; a++){
                //            var suggestion = {
                //                id : resp.data[a].tid,
                //                duration : resp.data[a].idledays,
                //                user : resp.data[a].updateduser,
                //                name : resp.data[a].company_name,
                //                ezeid : resp.data[a].RequesterEZEID
                //            };
                //            companyList[a] = suggestion;
                //        }
                //    }
                //}).error(function(err,statusCode){
                //    var msg = '';
                //    if(statusCode == 0){
                //        msg = 'Unable to reach server ! Please check your connection';
                //        Notification.error({ title : 'No Connection', message : msg, delay : MsgDelay});
                //    }
                //});
            };

            /**
             * Loads company list as soon as controller is initialized
             */
            loadCompany();



            $scope.$watch('modalBox.tx.companyId',function(n,v){
                ////console.log(n);
                if(n){
                    ////console.log(companyList);
                    var indx = companyList.indexOfWhere('id',n);
                    ////console.log(indx);
                    if(indx !== -1){
                        /**
                         * Code is commented intentionally to prevent watcher from executing
                         * when company id is selected
                         */
                        //$scope.modalBox.tx.ezeid = companyList[indx].ezeid;
                    }
                }
            });

            /**
             * Radion buttons for creating lead by ezeoneid or by contact information
             * @param contactType 1: EZEOne ID , 2: Contact Information
             */
            $scope.selectContactType = function(contactType){
                $scope.modalBox.contactType = contactType;
                $scope.modalBox.tx.ezeid = "";
                $scope.modalBox.tx.companyId = 0;
                $scope.modalBox.tx.companyName = "";

                $scope.modalBox.tx.contactInfo = "";
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
                    $scope.$emit('$preLoaderStop');
                    $scope.modalBox.tx.ezeid = $filter('uppercase')(ezeid);
                    $scope.modalBox.tx.contactInfo = resp.FirstName + ' ' +
                        resp.LastName  +
                        ((resp.MobileNumber && resp.MobileNumber !== 'null') ? ', ' + resp.MobileNumber : '');
                    $scope.modalBox.tx.ezeidTid = resp.TID;

                    /**
                     * If EZEID type is business then only consider the company and fill up the company details
                     * else make it empty only
                     */
                    if(resp.IDTypeID == 2){
                        var cIndex = companyList.indexOf(resp.CompanyName)
                        if(cIndex !== -1){
                            $scope.modalBox.tx.companyId = companyList[cIndex].tid;
                            $scope.modalBox.tx.companyName =  resp.CompanyName;
                        }
                        else{
                            $scope.modalBox.tx.companyId = 0;
                            $scope.modalBox.tx.companyName = resp.CompanyName;
                        }
                    }

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
             * Loads candidate picture based on ezeone_id
             */
            var loadCandidatePicture = function(_tx){
                var defer = $q.defer();
                if(!_tx.RequesterEZEID){
                    return;
                }
                $http({
                    url : GURL + 'ezeone_image',
                    method : 'GET',
                    params : {
                        ezeone_id : _tx.RequesterEZEID,
                        token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){
                    if(resp){
                        if(resp.status){
                            if(resp.data){
                                if(resp.data[0]){
                                    if(resp.data[0].Picture){
                                        _tx.applicantImage = resp.data[0].Picture;
                                        defer.resolve();
                                    }
                                    else{
                                        defer.reject();
                                    }
                                }
                                else{
                                    defer.reject();
                                }
                            }
                            else{
                                defer.reject();
                            }
                        }
                        else{
                            defer.reject();
                        }
                    }
                    else{
                        defer.reject();
                    }

                }).error(function(err){
                    defer.reject();
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

                /**
                 * If user has not selected any folders to display then by default select all the folders
                 * which are assigned to him and assign them to the data model of myFolders also
                 * to make ui and requested data consistent
                 */

                var folderRuleArr = [];
                for(var i = 0; i < $scope.myFolders.length; i++){
                    folderRuleArr.push($scope.myFolders[i].id);
                }

                var folderRules = (folderRuleArr) ? folderRuleArr.join(',') : '';

                /**
                 * If user has not selected any institutes to display then by default select all the institutes
                 * which are assigned to him and assign them to the data model of myFolders also
                 * to make ui and requested data consistent
                 */
                var instituteArr = [];
                for(var i = 0; i < $scope.myInstitutes.length; i++){
                    instituteArr.push($scope.myInstitutes[i].id);
                }

                var institutes = (instituteArr) ? instituteArr.join(',') : '';

                /**
                 * If user has not selected any institutes to display then by default select all the institutes
                 * which are assigned to him and assign them to the data model of myFolders also
                 * to make ui and requested data consistent
                 */
                var jobArr = [];
                for(var i = 0; i < $scope.selectedJobs.length; i++){
                    jobArr.push($scope.selectedJobs[i].id);
                }
                var jobs = (jobArr) ? jobArr.join(',') : '';


                /**
                 * If user is subuser and he is not having any rules assigned to him then don't allow him to
                 * make any transaction load request and therefore show no transaction available for him
                 * else let him see the transaction as he can see transaction of default folder also
                 */
                if($rootScope._userInfo.MasterID > 0 && (!folderRules)){
                    $timeout(function(){
                        defer.resolve([]);
                        $scope.txList = [];
                    },300);
                }
                else{
                    $http({
                        url : GURL + 'ewtGetTranscation',
                        method : 'GET',
                        params : {
                            Token : $rootScope._userInfo.Token,
                            Page : (pageNo) ? pageNo : 1,
                            Status : (statusType) ? statusType : '',
                            FunctionType : 4,    // For Sales
                            searchkeyword : txSearchKeyword,
                            sort_by : (sortBy) ? sortBy : 0,
                            folder_rules : folderRules,
                            institute : institutes,
                            job_id : jobs,
                            exp_from : (parseFloat($scope.experienceFrom) < 0 || parseFloat($scope.experienceFrom) > 50 || parseFloat($scope.experienceFrom) == NaN) ?
                                0 : parseFloat($scope.experienceFrom),
                            exp_to : (parseFloat($scope.experienceTo) < 0 || parseFloat($scope.experienceTo) > 50 || parseFloat($scope.experienceFrom) == NaN) ?
                                50 : parseFloat($scope.experienceTo),
                            location_id : ''
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
                            if(resp.Result && angular.isArray(resp.Result)){
                                for(var a = 0; a < resp.Result.length; a++){
                                    $scope.editModes.push(false);
                                    resp.Result[a].TaskDateTime = UtilityService._convertTimeToLocal(resp.Result[a].TaskDateTime,'DD MMM YYYY hh:mm:ss A','DD MMM YYYY hh:mm:ss A');
                                    resp.Result[a].NextActionDate = (resp.Result[a].NextActionDate) ?
                                        UtilityService._convertTimeToLocal(resp.Result[a].NextActionDate,'DD MMM YYYY hh:mm:ss A','DD MMM YYYY hh:mm:ss A') :
                                        UtilityService._convertTimeToLocal(moment().format('DD MMM YYYY hh:mm:ss A'));
                                    resp.Result[a].applicantImage = null;
                                }
                                $scope.txList = resp.Result;
                                for(var ax = 0; ax < $scope.txList.length; ax++){
                                    loadCandidatePicture($scope.txList[ax]);
                                }
                            }

                        }
                        else{

                            $scope.txList = [];
                            $scope.totalPages = 1;
                            $scope.pageNumber = 1;
                        }
                        defer.resolve(resp);
                    }).error(function(err){
                        $scope.totalPages = 1;
                        $scope.pageNumber = 1;
                        defer.resolve([]);
                    });
                }
                return defer.promise;
            };


            /**
             * This function is executed only when the control comes from the neighbour tab i.e. Jobs
             * when anybody click on applicant number in that tab
             * @returns {*}
             */
            var loadApplicantForOneJob = function(pageNo){
                var defer = $q.defer();

                    $http({
                        url : GURL + 'ewtGetTranscation',
                        method : 'GET',
                        params : {
                            Token : $rootScope._userInfo.Token,
                            Page : (pageNo) ? pageNo : 1,
                            Status : '',
                            FunctionType : 4,    // For Sales
                            searchkeyword : '',
                            sort_by :  0,
                            folder_rules : '',
                            institute : '',
                            job_id : (parseInt($scope.jobTid) !== NaN && parseInt($scope.jobTid) > 0) ? parseInt($scope.jobTid) : 0 ,
                            exp_from : 0,
                            exp_to : 50,
                            location_id : ''
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
                            if(resp.Result && angular.isArray(resp.Result)){
                                for(var a = 0; a < resp.Result.length; a++){
                                    $scope.editModes.push(false);
                                    resp.Result[a].TaskDateTime = UtilityService._convertTimeToLocal(resp.Result[a].TaskDateTime,'DD MMM YYYY hh:mm:ss A','DD MMM YYYY hh:mm:ss A');
                                    resp.Result[a].NextActionDate = (resp.Result[a].NextActionDate) ?
                                        UtilityService._convertTimeToLocal(resp.Result[a].NextActionDate,'DD MMM YYYY hh:mm:ss A','DD MMM YYYY hh:mm:ss A') :
                                        UtilityService._convertTimeToLocal(moment().format('DD MMM YYYY hh:mm:ss A'));
                                    resp.Result[a].applicantImage = null;
                                }
                                $scope.txList = resp.Result;
                                for(var ax = 0; ax < $scope.txList.length; ax++){
                                    loadCandidatePicture($scope.txList[ax]);
                                }
                            }

                        }
                        else{

                            $scope.txList = [];
                            $scope.totalPages = 1;
                            $scope.pageNumber = 1;
                        }
                        $scope.jobTidLoaded = true;
                        $scope.jobTitleString = ($scope.jobsList[$scope.jobsList.indexOfWhere('id',parseInt($scope.jobTid))].jc) ?
                            ($scope.jobsList[$scope.jobsList.indexOfWhere('id',parseInt($scope.jobTid))].label) +' (' +
                            ($scope.jobsList[$scope.jobsList.indexOfWhere('id',parseInt($scope.jobTid))].jc) + ') ':
                            ($scope.jobsList[$scope.jobsList.indexOfWhere('id',parseInt($scope.jobTid))].label);
                        defer.resolve(resp);
                    }).error(function(err){
                        $scope.totalPages = 1;
                        $scope.pageNumber = 1;
                        $scope.jobTidLoaded = true;
                        $scope.jobTitleString = ($scope.jobsList[$scope.jobsList.indexOfWhere('id',parseInt($scope.jobTid))].jc) ?
                        ($scope.jobsList[$scope.jobsList.indexOfWhere('id',parseInt($scope.jobTid))].label) +' (' +
                        ($scope.jobsList[$scope.jobsList.indexOfWhere('id',parseInt($scope.jobTid))].jc) + ') ':
                            ($scope.jobsList[$scope.jobsList.indexOfWhere('id',parseInt($scope.jobTid))].label);
                        defer.resolve([]);
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
                        FunctionType : 4    // For Sales
                    }
                }).success(function(resp){
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
                        FunctionType : 4    // For Sales
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
                        FunctionType : 4    // For Sales
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
                        FunctionType : 4    // Sales
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
             * Folders which are assigned to logged in user and are selected by him
             * to load transacation based on it
             * @type {string}
             */
            $scope.myFolders = [];
            $scope.myInstitutes = [];
            $scope.selectedJobs = [];

            /**
             * Folders applicable to the user who logged in
             * @type {Array}
             */
            $scope.userFolders = [];
            var userFoldersList = [];
            var userFoldersLoaded = false;
            var allFoldersLoaded = false;

            $scope.institutesList = [];
            var institutesLoaded = false;

            $scope.educationsList = [];
            var educationsLoaded = false;

            $scope.specializationsList = [];
            var specializationsLoaded = false;

            $scope.jobsList = [];
            var jobsLoaded = false;

            $scope.locationsList = [];
            var locationsLoaded = false;


            var assignUserFolders = function(){
                for(var b=0; b < userFoldersList.length;b++){
                    var _findex = $scope.txFolderRules.indexOfWhere('TID',userFoldersList[b]);
                    if(_findex !== -1){
                        var folder = angular.copy($scope.txFolderRules[_findex]);
                        folder.id = parseInt(folder.TID);
                        folder.label = folder.FolderTitle;
                        $scope.userFolders.push(folder);
                        $scope.myFolders.push({ id : folder.id});
                    }
                }
            };


            /**
             * Makes data type conversion to be used by multiselect control
             */
            var assignInstitutes = function(){
                for(var b=0; b < $scope.institutesList.length;b++){
                        var institute = angular.copy($scope.institutesList[b]);
                        institute.id = parseInt(institute.TID);
                        $scope.institutesList[b].id = parseInt(institute.TID);
                        $scope.institutesList[b].label = institute.InstituteTitle;
                        //$scope.myInstitutes.push({ id : institute.id});
                }
            };


            /**
             * Makes data type conversion to be used by multiselect control
             */
            var assignEducations = function(){
                for(var b=0; b < $scope.educationsList.length;b++){
                    var edu = angular.copy($scope.educationsList[b]);
                    edu.id = parseInt(edu.TID);
                    $scope.educationsList[b].id = parseInt(edu.TID);
                    $scope.educationsList[b].label = edu.EducationTitle;
                    //$scope.myInstitutes.push({ id : institute.id});
                }
            };


            /**
             * Makes data type conversion to be used by multiselect control
             */
            var assignSpecializations = function(){
                for(var b=0; b < $scope.specializationsList.length;b++){
                    var spz = angular.copy($scope.specializationsList[b]);
                    spz.id = parseInt(spz.TID);
                    $scope.specializationsList[b].id = parseInt(spz.TID);
                    $scope.specializationsList[b].label = spz.Title;
                    //$scope.myInstitutes.push({ id : institute.id});
                }
            };


            /**
             * Makes data type conversion to be used by multiselect control
             */
            var assignJobs = function(){
                for(var b=0; b < $scope.jobsList.length;b++){
                    var __job = angular.copy($scope.jobsList[b]);
                    __job.id = parseInt(__job.tid);
                    $scope.jobsList[b].id = parseInt(__job.tid);
                    $scope.jobsList[b].label = __job.jobtitle;
                    //$scope.selectedJobs.push({ id : _job.id});
                }
            };


            /**
             * Loading user list to fetch rules that are specific to the subuser who logged in
             * (Folder list of logged in user can be fetched by selecting the logged in user from response
             * and getting it's comma separated folder list)
             */
            var getSubUserList = function(){
                var defer = $q.defer();
                $http({
                    url : GURL + 'ewtGetSubUserList',
                    method : 'GET',
                    params : {
                        MasterID : $rootScope._userInfo.MasterID,
                        Token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){
                    if(resp && resp.length > 0 && resp !== 'null'){
                        var index = resp.indexOfWhere('EZEID',$rootScope._userInfo.ezeid);
                        if(index !== -1){
                            var userFolders = (resp[index].ResumeIDs) ? resp[index].ResumeIDs.split(',') : [];
                            ////console.log(userFolders);
                            for(var b=0;b<userFolders.length;b++){
                                userFolders[b] = parseInt(userFolders[b]);
                            }
                            userFoldersList = userFolders;
                        }
                    }
                    userFoldersLoaded = true;
                    if(allFoldersLoaded && userFoldersLoaded){
                        assignUserFolders();
                    }
                    defer.resolve(resp);
                }).error(function(err,statusCode){
                    $scope.userFolders = [];
                    userFoldersLoaded = true;
                    if(allFoldersLoaded && userFoldersLoaded){
                        assignUserFolders();
                    }
                    defer.resolve([]);
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
                        FunctionType : 4    // Sales
                    }
                }).success(function(resp){
                    if(resp && resp !== 'null' && resp.length > 0){
                        $scope.txFolderRules = resp;
                        defer.resolve(resp);
                    }
                    else{
                        defer.resolve([]);
                    }
                    allFoldersLoaded  = true;
                    if(allFoldersLoaded && userFoldersLoaded){
                        assignUserFolders();
                    }
                }).error(function(err){
                    defer.reject();
                    allFoldersLoaded = true;
                    if(allFoldersLoaded && userFoldersLoaded){
                        assignUserFolders();
                    }
                });
                return defer.promise;
            };



            /**
             * Loads Specializations for Resume
             * @return {*|promise}
             */
            $scope.loadSpecializations = function(){
                var defer = $q.defer();
                $http({
                    url : GURL + 'specialization',
                    method : 'GET',
                    params : {
                        token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){
                    if(resp){
                        if(resp.status){
                            if(resp.data){
                                $scope.specializationsList = resp.data;
                                defer.resolve(resp.data);

                            }
                            else{
                                defer.resolve([]);
                            }
                        }
                        else{
                            defer.resolve([]);
                        }

                    }
                    else{
                        defer.resolve([]);
                    }
                    specializationsLoaded  = true;
                    if(specializationsLoaded){
                        assignSpecializations();
                    }
                }).error(function(err){
                    defer.reject();
                    specializationsLoaded = true;
                    if(institutesLoaded){
                        assignSpecializations();
                    }
                });
                return defer.promise;
            };

            /**
             * Loads Educations for Resume
             * @return {*|promise}
             */
            $scope.loadEducations = function(){
                var defer = $q.defer();
                $http({
                    url : GURL + 'educations',
                    method : 'GET',
                    params : {
                        token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){
                    if(resp){
                        if(resp.status){
                            if(resp.data){
                                $scope.educationsList = resp.data;
                                defer.resolve(resp.data);
                            }
                            else{
                                defer.resolve([]);
                            }
                        }
                        else{
                            defer.resolve([]);
                        }

                    }
                    else{
                        defer.resolve([]);
                    }
                    educationsLoaded  = true;
                    if(educationsLoaded){
                        assignEducations();
                    }
                }).error(function(err){
                    defer.reject();
                    educationsLoaded = true;
                    if(institutesLoaded){
                        assignEducations();
                    }
                });
                return defer.promise;
            };



            /**
             * Loads Institutes for Resume
             * @return {*|promise}
             */
            $scope.loadInstitutes = function(){
                var defer = $q.defer();
                $http({
                    url : GURL + 'institutes',
                    method : 'GET',
                    params : {
                        token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){
                    if(resp){
                        if(resp.status){
                           if(resp.data){
                               $scope.institutesList = resp.data;
                               defer.resolve(resp.data);

                           }
                            else{
                               defer.resolve([]);
                           }
                        }
                        else{
                            defer.resolve([]);
                        }

                    }
                    else{
                        defer.resolve([]);
                    }
                    institutesLoaded  = true;
                    if(institutesLoaded){
                        assignInstitutes();
                    }
                }).error(function(err){
                    defer.reject();
                    institutesLoaded = true;
                    if(institutesLoaded){
                        assignInstitutes();
                    }
                });
                return defer.promise;
            };

            /**
             * Loads joblist posted by the logged in user or his master
             * @return {*|promise}
             */
            $scope.loadJobs = function(){
                var defer = $q.defer();
                $http({
                    url : GURL + 'jobs_list',
                    method : 'GET',
                    params : {
                        token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){
                    if(resp){
                        if(resp.status){
                            if(resp.data){
                                $scope.jobsList = resp.data;
                                defer.resolve(resp.data);

                            }
                            else{
                                defer.resolve([]);
                            }
                        }
                        else{
                            defer.resolve([]);
                        }

                    }
                    else{
                        defer.resolve([]);
                    }
                    jobsLoaded  = true;
                    if(jobsLoaded){
                        assignJobs();
                    }
                }).error(function(err){
                    defer.reject();
                    jobsLoaded = true;
                    if(jobsLoaded){
                        assignJobs();
                    }
                });
                return defer.promise;
            };



            var watchPageNumber = function(){
                $scope.$watch('pageNumber',function(newVal,oldVal){
                    if(newVal !== oldVal)
                    {
                        $scope.$emit('$preLoaderStart');
                        if($scope.jobTid){

                        }
                        else{
                            if($scope.jobTid){
                                loadApplicantForOneJob(newVal).then(function(){
                                    $scope.$emit('$preLoaderStop');
                                },function(){
                                    $scope.$emit('$preLoaderStop');
                                });
                            }
                            else{
                                $scope.loadTransaction(newVal,$scope.filterStatus,$scope.txSearchTerm,$scope.sortBy).then(function(){
                                    $scope.$emit('$preLoaderStop');
                                },function(){
                                    $scope.$emit('$preLoaderStop');
                                });
                            }

                        }

                    }
                });
            };

            var watchSortBy = function(){
                $scope.$watch('sortBy',function(newVal,oldVal){
                    if(newVal !== oldVal)
                    {
                        $scope.$emit('$preLoaderStart');
                        if($scope.jobTid){

                        }
                        else{
                            $scope.loadTransaction($scope.pageNumber,$scope.filterStatus,$scope.txSearchTerm,$scope.sortBy).then(function(){
                                $scope.$emit('$preLoaderStop');
                            },function(){
                                $scope.$emit('$preLoaderStop');
                            });
                        }

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


                $scope.loadSpecializations().then(function(){
                    $scope.loadEducations().then(function(){
                        $scope.loadJobs().then(function(){
                            $scope.loadInstitutes().then(function(){
                                $scope.loadFolderRules().then(function(){
                                    getSubUserList().then(function(){
                                        $scope.loadTxActionTypes().then(function(){
                                            $scope.loadTxStatusTypes().then(function(){
                                                if($scope.jobTid){
                                                    loadApplicantForOneJob(1).then(function(){
                                                        $scope.$emit('$preLoaderStop');
                                                    },function(){
                                                        $scope.$emit('$preLoaderStop');
                                                    });
                                                }
                                                else{
                                                    $scope.loadTransaction(1,-2,$scope.txSearchTerm,$scope.sortBy).then(function(){
                                                        $scope.$emit('$preLoaderStop');
                                                        watchPageNumber();
                                                        watchSortBy();
                                                        //watchMyFolders();

                                                        /**
                                                         * Item loading is not required in case of recruitment module
                                                         */

                                                    },function(){
                                                        $scope.$emit('$preLoaderStop');
                                                        Notification.error({message : 'Unable to load applicant list', delay : MsgDelay} );
                                                    });
                                                }

                                            },function(){
                                                $scope.$emit('$preLoaderStop');
                                                Notification.error({message : 'Unable to load applicant status types', delay : MsgDelay} );
                                            });
                                        },function(){
                                            $scope.$emit('$preLoaderStop');
                                            Notification.error({message : 'Unable to load recruitment next actions list', delay : MsgDelay} );
                                        });
                                    },function(){
                                        $scope.$emit('$preLoaderStop');
                                    });
                                },function(){
                                    $scope.$emit('$preLoaderStop');
                                    Notification.error({message : 'Unable to load institutes', delay : MsgDelay} );
                                });
                            },function(){
                                $scope.$emit('$preLoaderStop');
                                Notification.error({message : 'Unable to load institutes', delay : MsgDelay} );
                            });

                        },function(){
                            $scope.$emit('$preLoaderStop');
                            Notification.error({message : 'Unable to load jobs list', delay : MsgDelay} );
                        });
                    },function(){
                        $scope.$emit('$preLoaderStop');
                        Notification.error({message : 'Unable to load education list', delay : MsgDelay} );
                    });
                },function(){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({message : 'Unable to load specializations', delay : MsgDelay} );
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
                address =  address.join(', ');
                if($scope.modalBox.tx.pinCode){
                    address += (' - '+ $scope.modalBox.tx.pinCode);
                }
                return address;
            };

            /**
             * Calculates the amount while saving any lead
             * @param itemList
             * @returns {number}
             */
            var calculateTxAmount = function(itemList){
                if(!itemList){
                    return 0.00;
                }
                if(parseInt(0) > 3){
                    var amount = 0.00;
                    for(var i=0; i<itemList.length; i++){
                        var qty = parseInt(itemList[i].Qty);
                        var rate = parseFloat(itemList[i].Rate,2);
                        if(qty == NaN){
                            qty = 1;
                        }
                        if(rate == NaN){
                            rate = 0.00
                        }
                        amount += (qty*rate);
                    }
                    return amount;
                }
                else{
                    return 0.00;
                }
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
                    TaskDateTime : (!editMode) ?
                        UtilityService._convertTimeToServer(moment().format('DD MMM YYYY hh:mm:ss A'),'DD MMM YYYY hh:mm:ss A','DD MMM YYYY hh:mm:ss A'):
                        UtilityService._convertTimeToServer($scope.modalBox.tx.taskDateTime,'DD MMM YYYY hh:mm:ss A','DD MMM YYYY hh:mm:ss A'),
                    Notes : $scope.modalBox.tx.notes,
                    LocID : ($scope.modalBox.tx.locId) ? $scope.modalBox.tx.locId : 0,
                    Country : $scope.modalBox.tx.country,
                    State : $scope.modalBox.tx.state,
                    City : $scope.modalBox.tx.city,
                    Area : $scope.modalBox.tx.area,
                    FunctionType : 4,   // For sales
                    Latitude : $scope.modalBox.tx.latitude,
                    Longitude : $scope.modalBox.tx.longitude,
                    EZEID : $scope.modalBox.tx.ezeid,
                    ContactInfo : $scope.modalBox.tx.contactInfo,
                    FolderRuleID : ($scope.modalBox.tx.folderRule) ? $scope.modalBox.tx.folderRule : 0,
                    Duration : 0,
                    DurationScales : 0,
                    NextAction : ($scope.modalBox.tx.nextAction) ? $scope.modalBox.tx.nextAction : 0,
                    NextActionDateTime  : UtilityService._convertTimeToServer(($scope.modalBox.tx.nextActionDateTime)
                        ? moment($scope.modalBox.tx.nextActionDateTime,'DD MMM YYYY hh:mm:ss A').format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD HH:mm:ss'),'YYYY-MM-DD HH:mm:ss','YYYY-MM-DD HH:mm:ss'),
                    //NextActionDateTime : ($scope.modalBox.tx.nextActionDateTime) ? $scope.modalBox.tx.nextActionDateTime :
                    //    moment().format('YYYY-MM-DD hh:mm:ss'),
                    ItemsList: '',
                    item_list_type : 0,
                    DeliveryAddress : '',
                    companyName : '',
                    company_id : 0,
                    //Amount : (parseInt(0) < 4) ?
                    //
                    //    ((parseFloat($scope.modalBox.tx.amount,2) !== NaN) ? parseFloat($scope.modalBox.tx.amount,2) : 0.00) :
                    //    calculateTxAmount($scope.modalBox.tx.itemList),
                    amount : (parseFloat($scope.modalBox.tx.orderAmount) !== NaN
                    && parseFloat($scope.modalBox.tx.orderAmount) > 0) ?
                        parseFloat($scope.modalBox.tx.orderAmount) : 0,

                    proabilities : (parseInt($scope.modalBox.tx.probability) !== NaN && parseInt($scope.modalBox.tx.probability) !== 0 ) ? $scope.modalBox.tx.probability : 2 ,
                    target_date : ($scope.modalBox.tx.targetDate) ? $scope.modalBox.tx.targetDate :  moment().format('YYYY-MM-DD'),
                    attachment : $scope.modalBox.tx.attachment,
                    attachment_name : $scope.modalBox.tx.attachmentName,
                    mime_type : $scope.modalBox.tx.attachmentMimeType,
                    alarm_duration : (parseInt($scope.modalBox.tx.alarmDuration)) ? parseInt($scope.modalBox.tx.alarmDuration) : 0
                };
                return preparedTx;
            };
            /**
             * Saving transaction in
             * @param editMode
             */
            $scope.saveTransaction = function(){
                var data = prepareSaveTransaction($scope.modalBox.editMode);

                /**
                 * If user is having EZEID then don't check for contact information, otherwise please validate
                 * that contact information is filled up or not
                 */
                if(!data.EZEID){
                    if(!data.ContactInfo){
                        Notification.error({ message : 'Please enter contact information for the applicant',delay : MsgDelay});
                        return ;
                    }
                }
                /**
                 * These validations are of no use in case of recruitment module
                 * therefore commented out
                 */

                //if($scope.modalBox.tx.itemList.length <  1 && $scope.modules[moduleIndex].listType > 0){
                //    Notification.error({ message : 'Please select items for the enquiry',delay : MsgDelay});
                //    return ;
                //}
                //
                //
                //if($scope.modules[moduleIndex].listType > 0){
                //    var separationStr = '     ';
                //    var itemList = [];
                //    try{
                //        itemList = JSON.parse(data.ItemsList);
                //    }
                //    catch(ex){
                //        //////////console.log(ex);
                //    }
                //    var msg = '';
                //    for(var ct = 0; ct < itemList.length; ct++){
                //        msg += itemList[ct]['ItemName'];
                //        if(itemList[ct]['Qty'] && $scope.modules[moduleIndex].listType > 2){
                //            msg += ' ('+ itemList[ct]['Qty'] + ')';
                //        }
                //        if(itemList[ct]['Amount'] && $scope.modules[moduleIndex].listType > 3){
                //            msg += ' : '+ itemList[ct]['Amount'];
                //        }
                //        msg += ', ';
                //    }
                //    msg = msg.substring(0, msg.length - 2);
                //    data.MessageText += (separationStr + msg);
                //}

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
                            if($scope.jobTid){
                                loadApplicantForOneJob(1).then(function(){
                                    $scope.$emit('$preLoaderStop');
                                },function(){
                                    $scope.$emit('$preLoaderStop');
                                });;
                            }
                            else{
                                $scope.loadTransaction(1,$scope.statusType,$scope.txSearchTerm,$scope.sortBy).then(function(){
                                    $scope.$emit('$preLoaderStop');
                                },function(){
                                    $scope.$emit('$preLoaderStop');
                                });
                            }

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
            /**
             * Refreshes company data every 1 minute
             */
            $interval(function(){
                loadCompany();
            },60000);


            $scope.cartAmount = 0.00;
            $scope.cartString = '';

            function calculateCartDetails (){
                if(!$scope.showModal){
                    return;
                }
                var amount = 0.00;
                var qty = 0;
                for(var ct = 0; ct < $scope.modalBox.tx.itemList.length; ct++){
                    if($scope.modalBox.tx.itemList[ct]['Qty'] &&
                        (parseInt(0) == 3 || parseInt(0) == 4)){
                        var ab  = parseInt($scope.modalBox.tx.itemList[ct]['Qty']);
                        if(ab !== NaN){
                            qty += ab;
                        }
                        else{
                            qty += 1;
                        }
                    }
                    else{
                        qty += 1;
                    }
                    if($scope.modalBox.tx.itemList[ct]['Amount'] && parseInt(0) == 4){
                        var am = 0.00;
                        var qt = 1;
                        var rt = parseFloat($scope.modalBox.tx.itemList[ct]['Rate']);
                        if(rt !== NaN){
                            qt = parseInt($scope.modalBox.tx.itemList[ct]['Qty']);
                        }
                        am = parseFloat(rt*qt);
                        amount += am;
                    }
                }

                var cartString = 'No items selected';
                if(qty == 1){
                    cartString = '1 item selected';
                }
                if(qty > 1){
                    cartString = qty.toString() + ' items selected';
                }

                $scope.cartAmount = amount.toFixed(2);
                $scope.cartItemString = cartString;
            };

            $interval(function(){
                calculateCartDetails();
            },700);


            /**
             * If somebody want to remove attachment after adding it before lead creation
             * this function will reset all the values related to attachment of that particular transaction
             */
            $scope.resetAttachment = function(){
                $scope.modalBox.tx.attachment = "";
                $scope.modalBox.tx.attachmentName = "";
                $scope.modalBox.tx.attachmentMimeType = "";
            };


            /**
             * Function fired when file is selected from the input
             */
            $scope.attachDocument = function(){
                var elem = $('#tx-attachment');
                var attachmentFile = angular.element(elem)[0].files;
                if(parseInt(attachmentFile[0].size/(1024*1024)) > 2){
                    Notification.error({ title : 'File size exceeds', message : 'Maximum file size allowed is 2 MB', delay : MsgDelay});
                }
                else{
                    $scope.modalBox.tx.attachmentName = attachmentFile[0].name;
                    $scope.modalBox.tx.attachmentMimeType = attachmentFile[0].type;
                    FileToBase64.fileToDataUrl(attachmentFile).then(function(data){
                        $scope.modalBox.tx.attachment  = data;
                    });
                }
            };

            /**
             * Triggers file attachment selection by generating a click event on the file input (attachment hidden field)
             */
            $scope.triggerFileAttachment = function(){
                $timeout(function(){
                    $('#tx-attachment').trigger('click');
                },1000);
            };


            /**
             * Function for downloading blob
             * @param data
             * @param mimeType
             * @param fileName
             */

            var downloadBlob = function (data, fileName,mimeType) {
                $timeout(function(){
                    console.log('a');
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.style = "display: none";
                    var blob = UtilityService._convertBase64ToBlob(data,mimeType);
                    console.log(blob);
                    var url = window.URL.createObjectURL(blob);
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    window.URL.revokeObjectURL(url);
                },1000);

            };
            /**
             * Downloads attachment for a particular transaction
             * @param txId
             */
            $scope.downloadAttachment = function(index,e){
                $scope.txList[parseInt(index)].downloadProgress = true;
                $http({
                    method : 'GET',
                    url : GURL + 'transaction_attachment',
                    params : {
                        token : $rootScope._userInfo.Token,
                        tid : $scope.txList[parseInt(index)].TID
                    }
                }).success(function(resp){
                    $scope.txList[parseInt(index)].downloadProgress = null;
                    if(resp){
                        if(resp.status){
                            if(resp.data[0]){
                                var attachmentArr = resp.data[0].attachment.split('base64,')
                                resp.data[0].attachment = (attachmentArr.length > 1) ? attachmentArr[1] : attachmentArr[0];
                                downloadBlob(resp.data[0].attachment, resp.data[0].file_name,resp.data[0].mime_type);
                            }
                        }
                        else{

                        }
                    }
                }).error(function(err){
                    if(err){
                        if(err.status){
                            if(err[0]){
                                $scope.txList[parseInt(index)].attachmentLink = resp[0].attachment;
                                console.log(e.currentTarget);
                                $(e.currentTarget).siblings('a').trigger('click');
                            }
                        }
                        else{

                        }
                    }
                });
                //$window.open(GURL + 'transaction_attachment?tid='+txId + "&token="+$rootScope._userInfo.Token);
            };


            /**
             * Settings for Mutli select control (used for folder rules in view)
             * @type {{smartButtonMaxItems: number, smartButtonTextConverter: Function}}
             */
            $scope.multiSelectDropDownSettings = {
                smartButtonMaxItems: 3,
                smartButtonTextConverter: function(itemText, originalItem) {
                    if (itemText === 'Jhon') {
                        return 'Jhonny!';
                    }

                    return itemText;
                }
            };

            $scope.multiSelectTransText = {buttonDefaultText: 'No folders selected'};

            $scope.multiSelectInstituteText = {buttonDefaultText: 'All Institutes'};
            $scope.multiSelectJobsText = {buttonDefaultText: 'All Applicants'};


        }]);

})();

