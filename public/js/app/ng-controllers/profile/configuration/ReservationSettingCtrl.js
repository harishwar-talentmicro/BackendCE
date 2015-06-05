 /**
 * ReservationSettingCtrl
 *
 */
angular.module('ezeidApp').controller('ReservationSettingCtrl',[
    '$scope',
    '$rootScope',
    '$q',
    '$http',
    'Notification',
    '$filter',
    'MsgDelay',
    'GURL',
    'ScaleAndCropImage',
    function(
        $scope,
        $rootScope,
        $q,
        $http,
        Notification,
        $filter,
        MsgDelay,
        GURL,
        ScaleAndCropImage){

    //Initially First Tab is selected
    $scope.selectedTab = 1;
    $scope.selectedTID = [];

    resetResourceValue();
    getUserDetails();


        getReservationTransactionData();

        /**
         * Function for converting UTC time from server to LOCAL timezone
         */
        var convertTimeToLocal = function(timeFromServer,dateFormat,returnFormat){
            if(!dateFormat){
                dateFormat = 'DD-MMM-YYYY hh:mm A';
            }
            if(!returnFormat){
                returnFormat = dateFormat;
            }
            var x = new Date(timeFromServer);
            var mom1 = moment(x);
            return mom1.add((mom1.utcOffset()),'m').format(returnFormat);
        };

        function selectedTimeUtcToLocal(selectedTime)
        {
            var x = new Date();
            var today = moment(x.toISOString()).utc().format('DD-MMM-YYYY');

            var currentTaskDate = moment(today+' '+selectedTime).format('DD-MMM-YYYY H:mm');
            return convertTimeToLocal(currentTaskDate,'DD-MMM-YYYY H:mm',"H:mm");
        }

        function getReservationTransactionData(){
            $scope.$emit('$preLoaderStart');
            $http({
                url : GURL + 'reservation_transaction',
                method : "GET",
                params :{
                    resourceid : 6,
                    date : '05 Jun 2015 09:42:00 AM',
                    toEzeid : "krunalpaid"
                }
            }).success(function(resp){

                    $scope.$emit('$preLoaderStop');
                    if(resp.status){
                        //  set formated result for reservation listing
                        getFormatedTransactionData(resp);
                    }
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                });
        };

        function getFormatedTransactionData(_data)
        {
            console.log(_data);
            var formatedData = [];
            var times = new Array
                                (
                                    selectedTimeUtcToLocal(_data.data[0]['W1']),
                                    selectedTimeUtcToLocal(_data.data[0]['W2']),
                                    selectedTimeUtcToLocal(_data.data[0]['W3']),
                                    selectedTimeUtcToLocal(_data.data[0]['W4'])
                                );

            var reserved = new Array(   _data.data[0]['Starttime'],
                                        _data.data[0]['endtime'],
                                        _data.data[0]['reserverName'],
                                        _data.data[0]['reserverId'],
                                        _data.data[0]['service'],
                                        _data.data[0]['Status']
                                    );

            formatedData['working'] = times;
            formatedData['reserved'] = reserved;
            console.log(formatedData);
            console.log("Sai");
            console.log(formatedData['working']);
            return formatedData;
        };




    function resetResourceValue()
    {
        $scope.modalBox = {
            item : {
                operatorid : 0,
                title : "",
                status  : 1,
                description: "",
                picture : "",
                TID: 0
            }
        };
    }

    function resetServicesValue()
    {
       $scope.selectedTID = [];
       $scope.modalBox = {
            servicesItem : {
                title : "",
                status  : 1,
                duration: 5,
                rate : 0,
                TID: 0,
                serviceType: 1,
                service_ids: ""
            }
        };
    }

    function resetMappingValue()
    {
        $scope.selectedTID = [];
        $scope.modalBox = {
            mapItem : {
                resourceid : 0
            }
        };
    }

    $scope.reservationServiceTabSelected = function(){
        $scope.selectedTID = [];
        resetServicesValue();
        getAllServices();
    };


    /**
     * Resource Status Mapping
     * @type {{1: string, 2: string}}
     */
    $scope.status = 1 ;
    /**
     *     Open Modal box for add Resource
     */
    $scope.showModal = false;
    $scope.openResourceModalBox = function(item){
        $scope.showModal = true;
        resetResourceValue();

        loadSubuserList();

        if(item != 0)
        {
           $scope.modalBox = {
                item : {
                    operatorid : item.operatorid,
                    title : item.title,
                    status  : item.status,
                    description: item.description,
                    picture : item.picture,
                    TID: item.tid
                }
            };
        }
       // loadSubuserList();
    };

    $scope.closeResourceModalBox = function(){
        $scope.showModal = false;
        resetResourceValue();
    };

    /**
     * Loads list of subusers
     */
    function loadSubuserList()
    {
       $scope.$emit('$preLoaderStart');
       $scope.subusers = [];
       $http({
            url : GURL + 'ewtGetSubUserList',
            method : "GET",
            params : {
                Token : $rootScope._userInfo.Token,
                MasterID : $scope.masterUser.MasterID
            }
        }).success(function(resp){
                if(resp && resp.length > 0 && resp !== 'null')
                {
                    $scope.subusers = resp;
                }
                else{
                    //Notification.error({ message: "No subusers added ", delay : MsgDelay});
                }
                $scope.$emit('$preLoaderStop');
            }).error(function(err){
                $scope.$emit('$preLoaderStop');
              //  Notification.error({ message: "No subusers added ", delay : MsgDelay});
            });
    };

    /**
     * Getting master user details
     */
    function getUserDetails(){

       $http({
            url : GURL + 'ewtGetUserDetails',
            method : "GET",
            params :{
                Token : $rootScope._userInfo.Token
            }
        }).success(function(resp){
                if(resp.length>0){
                    $scope.masterUser = resp[0];
                    getAllResources();
                }
            }).error(function(err){
                Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
            });
    };

    // Get All Resources
    function getAllResources(){
        $scope.$emit('$preLoaderStart');
        $http({
            url : GURL + 'reservation_resource',
            method : "GET",
            params :{
                ezeid : $scope.masterUser.EZEID
            }
        }).success(function(resp){
                $scope.$emit('$preLoaderStop');
                if(resp.data.length>0)
                {
                   $scope.AllResources = resp.data;
                }
            }).error(function(err){
                $scope.$emit('$preLoaderStop');
                Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
            });
    };

    // To upload image
    $scope.selectItemImage = function(){
        $("#modal-box-item-image").trigger('click');
    };
    $scope.uploadItemImage = function(){
        var image = $("#modal-box-item-image")[0].files[0];
        var fileName = image.name;
        ScaleAndCropImage.covertToBase64(image).then(function(imageUrl){
            var scaledImageUrl = ScaleAndCropImage.scalePropotional(imageUrl,128,128);
            $scope.modalBox.item.picture = ScaleAndCropImage.cropImage(scaledImageUrl,128,128);
        });
    };

    /**
     * Validates the data while adding items
     * @param item
     * @returns {boolean}
     */
    function validateItem(){
        var err = [];
        if($scope.modalBox.item.description.length < 1 ){
            err.push('Add description to this resource');
        }
        if(!$scope.modalBox.item.picture){
            err.push('Please select a picture for this resource');
        }
        if($scope.modalBox.item.operatorid == 0){
            err.push('Please select an operator for this resource');
        }
        if($scope.modalBox.item.title.length < 1){
            err.push('Resource title is empty');
        }
        if(err.length > 0){
            for(var i = 0; i < err.length; i++){
                Notification.error({ message : err[i], delay : 2000});
            }
            return false;
        }
        return true;
    };

    $scope.saveResource = function(){

        if(validateItem())
        {
            $scope.modalBox.item.Token = $rootScope._userInfo.Token;
            $scope.$emit('$preLoaderStart');
            $http({
                url : GURL + 'reservation_resource',
                method : ($scope.modalBox.item.TID == 0) ? "POST" : "PUT",
                data : $scope.modalBox.item
            }).success(function(resp)
                {
                   $scope.$emit('$preLoaderStop');
                   if(resp.status){

                        Notification.success({ message : 'Resource added successfully', delay : 2000 });
                        getAllResources();
                    }
                    else{
                        Notification.error({ message : 'An error occurred while saving resource! Please try again', delay : 2000});
                    }
                    resetResourceValue()
                    $scope.showModal = false;
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message : 'An error occurred while saving resource! Please try again', delay : 2000});
                });
        }

    };

    //  Open Services Modal box
    $scope.showReservationServiceModal = false;
    $scope.openReservationServiceModalBox = function(item){
        $scope.showReservationServiceModal = true;
        resetServicesValue();
        if(item != 0)
        {
           var servicesIdArray = JSON.parse("[" + item.serviceids + "]");
           $scope.modalBox =
           {
                servicesItem : {
                    title : item.title,
                    status  : item.status,
                    duration: item.duration,
                    rate : item.rate,
                    TID: item.tid,
                    serviceType: (item.serviceids == 0) ? 1 : 2
                }
           };
           $scope.selectedTID = servicesIdArray;
        }
    };
    $scope.closeReservationServiceModalBox = function(){
        $scope.showReservationServiceModal = false;
        resetServicesValue();
    };

     $scope.getMinuteSlots = function(){
         return new Array(288);
     };

    // Get All Services
    function getAllServices(){
        $scope.$emit('$preLoaderStart');
        $http({
            url : GURL + 'reservation_service',
            method : "GET",
            params :{
                ezeid : $scope.masterUser.EZEID
            }
        }).success(function(resp){
                $scope.$emit('$preLoaderStop');
                if(resp){
                    $scope.AllServices = resp.data;
                }
            }).error(function(err){
                $scope.$emit('$preLoaderStop');
                Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
            });
    };

    /**
     * Validates the data while adding services
     * @param item
     * @returns {boolean}
     */
    function validateServices(){
        var err = [];
        if($scope.modalBox.servicesItem.rate.length < 1 ){
            err.push('Services rate is empty');
        }
        if($scope.modalBox.servicesItem.title.length < 1){
            err.push('Services title is empty');
        }
        if(err.length > 0){
            for(var i = 0; i < err.length; i++){
                Notification.error({ message : err[i], delay : 2000});
            }
            return false;
        }
        return true;
    };

    $scope.saveServices = function(){

        if(validateServices())
        {
            $scope.modalBox.servicesItem.service_ids = $scope.selectedTID;
            $scope.modalBox.servicesItem.Token = $rootScope._userInfo.Token;
            $scope.$emit('$preLoaderStart');
            $http({
                url : GURL + 'reservation_service',
                method : ($scope.modalBox.servicesItem.TID == 0) ? "POST" : "PUT",
                data : $scope.modalBox.servicesItem
            }).success(function(resp)
                {
                    $scope.$emit('$preLoaderStop');
                    $scope.showReservationServiceModal = false;
                    if(resp.status){

                        Notification.success({ message : 'Service added successfully', delay : 2000});

                    }
                    else{
                        Notification.error({ message : 'An error occurred while saving Service! Please try again', delay : 2000});
                    }
                    resetResourceValue();
                    getAllServices()
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message : 'An error occurred while saving Service! Please try again', delay : 2000});
                });
        }
    };

    // To get and remove value of check box
    $scope.toggleCheckbox = function(event){
        var elem = event.currentTarget;
        var val = $(elem).data('tid');
        if($(elem).is(":checked")){
            $scope.selectedTID.push(val);
        }
        else{
            var index = $scope.selectedTID.indexOf(val);
            $scope.selectedTID.splice(index,1);
        }
    };

    // Maping tab selection
    $scope.reservationServiceMapTabSelected = function(){
        $scope.selectedTID = [];
        resetMappingValue();
        getAllServices();
        getAllMappingData();
    };

    //  Open Services Modal box
    $scope.showReservationServiceMapModal = false;
    $scope.openReservationServiceMapModalBox = function(item){

        $scope.showReservationServiceMapModal = true;
        resetMappingValue();
        if(item != 0)
        {
            var servicesIdArray = JSON.parse("[" + item.serviceID + "]");
            $scope.modalBox = {
                mapItem : {
                   resourceid : item.ResourceID
                }
            };
            $scope.selectedTID = servicesIdArray;
        }
    };

    $scope.closeReservationServiceMapModalBox = function(){
        $scope.showReservationServiceMapModal = false;
        resetMappingValue();
    };

    // Get Mapping data
    function getAllMappingData(){
        $scope.$emit('$preLoaderStart');
        $http({
            url : GURL + 'reservation_resource_service_map',
            method : "GET",
            params :{
                ezeid : $scope.masterUser.EZEID
            }
        }).success(function(resp){
                $scope.$emit('$preLoaderStop');
                if(resp.status){
                    var mappingData = resp.data;
                    var nCount, nServicCount;
                    for (nCount = 0; nCount < mappingData.length; nCount++)
                    {
                        var res = mappingData[nCount].serviceID.split(",");
                        mappingData[nCount].ServicesArray = JSON.parse("[" + res + "]");
                    }
                    $scope.AllMappingData = mappingData;
                }
            }).error(function(err){
                $scope.$emit('$preLoaderStop');
                Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
            });
    };

    // save mapping data
    $scope.saveMappingData = function(){
            if(($scope.selectedTID.length > 0) && ($scope.modalBox.mapItem.resourceid != 0))
            {
                $scope.modalBox.mapItem.serviceids = $scope.selectedTID;
                $scope.modalBox.mapItem.Token = $rootScope._userInfo.Token;
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'reservation_resource_service_map',
                    method : "POST",
                    data : $scope.modalBox.mapItem
                }).success(function(resp)
                    {
                        $scope.$emit('$preLoaderStop');
                        $scope.showReservationServiceMapModal = false;
                        if(resp.status){
                            Notification.success({ message : 'Mapping added successfully', delay : 2000});
                        }
                        else{
                            Notification.error({ message : 'An error occurred while saving Mapping! Please try again', delay : 2000});
                        }
                        resetMappingValue();
                        getAllServices();
                        getAllMappingData();
                    }).error(function(err){
                        $scope.$emit('$preLoaderStop');
                        Notification.error({ message : 'An error occurred while saving Mapping! Please try again', delay : 2000});
                    });
            }
    };

    // Below function gives getServiceIds
    $scope.getServicesOfResource = function(_ResourceId){
        var ResourceId = parseInt(_ResourceId);
        var nCount;
        for (nCount = 0; nCount <  $scope.AllMappingData.length; nCount++)
        {
            if((parseInt(_ResourceId)) == $scope.AllMappingData[nCount].ResourceID)
            {
                var servicesIdArray = JSON.parse("[" + $scope.AllMappingData[nCount].serviceID + "]");
                $scope.selectedTID = servicesIdArray;
            }
        }
    };


    }]);