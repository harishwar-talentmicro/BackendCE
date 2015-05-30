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
    getAllResources();

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
                Token : $rootScope._userInfo.Token
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
           var servicesIdArray = item.ServiceID.split(",");

           $scope.modalBox = {
                servicesItem : {
                    title : item.title,
                    status  : item.status,
                    duration: item.duration,
                    rate : item.rate,
                    TID: item.tid,
                    serviceType: (item.serviceids == 0) ? 1 : 2,
                    service_ids: servicesIdArray
                }
            };
            $scope.selectedTID = item.serviceids;
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
                Token : $rootScope._userInfo.Token
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
            var servicesIdArray = JSON.parse("[" + item.ServiceID + "]");
            $scope.modalBox = {
                mapItem : {
                    resourceid : 0
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
                Token : $rootScope._userInfo.Token
            }
        }).success(function(resp){
                $scope.$emit('$preLoaderStop');
                if(resp.status){
                    /*$scope.AllMappingData = resp.data;*/
                    var mappingData = resp.data;
                    //console.log(mappingData);
                    var nCount, nServicCount;
                    for (nCount = 0; nCount < mappingData.length; nCount++)
                    {
                        var res = mappingData[nCount].ServiceID.split(",");
                        console.log(res);
                        /*mappingData[nCount].ServicesArray = res;*/
                         mappingData[nCount].ServicesArray = JSON.parse("[" + res + "]");

                        /*for (nServicCount = 0; nServicCount < res.length; nServicCount++)
                        {
                            mappingData[nCount].ServicesArray.push(res[nServicCount]);
                        }*/
                    }

                    console.log("sai111");
                    console.log(mappingData);

                   // $scope.AllMappingData1[0].tmp = [7,8,9];
                    $scope.AllMappingData = mappingData;

                }
            }).error(function(err){
                $scope.$emit('$preLoaderStop');
                Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
            });
    };

    // save mapping data
    $scope.saveMappingData = function(){

            if($scope.selectedTID)
            {
                $scope.modalBox.mapItem.service_ids = $scope.selectedTID;
                $scope.modalBox.mapItem.Token = $rootScope._userInfo.Token;
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'reservation_resource_service_map',
                    method : ($scope.modalBox.mapItem.TID == 0) ? "POST" : "PUT",
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

}]);