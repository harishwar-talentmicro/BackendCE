angular.module('ezeidApp').controller('ModuleSettingsCtrl',[
    '$q',
    '$scope',
    '$interval',
    '$http',
    'Notification',
    '$rootScope',
    '$filter',
    'GURL',
    'MsgDelay',
    function(
        $q,
        $scope,
        $interval,
        $http,
        Notification,
        $rootScope,
        $filter,
        GURL,
        MsgDelay
        ){
    $scope.inactiveBrochureImage = 'images/brochure-absent.png';
    $scope.activeBrochureImage = 'images/brochure-present.png';
    $scope.brochureImage = 'images/brochure-present.png';
    /**
     * Data Refresh Interval List
     * (Automatic Generation)
     */
    $scope.refreshIntervalList = [];
    for(var i = 1; i < 1441; i++){
        $scope.refreshIntervalList.push(i);
    }


    /**
     * Access Rights mapping
     * @type {Array}
     */
    $scope.visibilities = [
        {value : 1, title : 'Visible'},    //1
        {value : 2, title : 'Hidden'} //2

    ];

    /**
     * Item List Types
     * Format to display items to end users (Sales and Home Delivery Items)
     * @type {Array}
     */
    $scope.itemListTypes = [
        {value : 0, title : 'Message Only'},   //0
        {value : 1, title : 'Item Only'},    //1
        {value : 2, title : 'Item and Picture'}, //2
        {value : 3, title : 'Item, Picture and Quantity'}, //3
        {value : 4, title : 'Item, Picture, Quantity and Rate'}  //4
    ];

    $scope.reservationDisplayFormat = [
        {value : 0, title : 'Hours (30 min slots)'},   //0
        {value : 1, title : 'Days'},    //1
        {value : 2, title : 'Months'} //2
    ];

    /**
     * Business Settings Variables from service
     * @type {{categories: Array}}
     */
    $scope.business = {
        categories : []
    };

    /**
     * Basic Modal Declaration
     * @type {{sales: {title: string, visibility: number}, reservation: {title: string, visibilitys: number}, homeDelivery: {title: string, visibilitys: number}, service: {title: string, visibilitys: number}, resume: {title: string, visibilitys: number}}}
     */
    $scope.settings = {
        sales : {
            title : '',
            defaultFormMsg : '',
            visibility : 0,
            itemListType : 0 ,      // 0: Message, 1: Item, 2: Item+picture, 3: Item+picture+quantity, 4: Item + picture + quantity + rate,
            url : ''

        },
        reservation : {
            title : '',
            defaultFormMsg : '',
            visibility : 0,
            displayFormat : 0, // 0 : Hours (30 min slot), 1 : Days, 2 : Months
            url : ''
        },
        homeDelivery : {
            title : '',
            defaultFormMsg : '',
            visibility : 0,
            itemListType : 1,
            url : ''

        },
        service : {
            title : '',
            defaultFormMsg : '',
            visibility : 0,
            itemListType : 1,
            url : ''

        },
        resume : {
            title : '',
            defaultFormMsg : '',
            visibility : 0,
            itemListType : 1,    //Hardcoded, will always be an item only
            keywords : "",
            url : ''
        },

        business : {
            dataRefreshInterval : 5,
            brochureFileName : "",
            brochureMimeType : "",
            brochureFileData : "",
            keywords : "",
            category : null
        }
    };


    $scope.loadSettings = function(){
        $http({
            url : GURL + 'ewtConfig',
            method : "GET",
            params : {
                Token : $rootScope._userInfo.Token
            }
        }).success(function(resp){
                if(resp && resp.length > 0){
                        $scope.settings.sales.title = (resp[0].SalesTitle) ? resp[0].SalesTitle : '';
                        $scope.settings.sales.defaultFormMsg = (resp[0].SalesFormMsg) ?  resp[0].SalesFormMsg :'';
                        $scope.settings.sales.visibility = (resp[0].VisibleModules) ? resp[0].VisibleModules.split("")[0] : 1;
                        $scope.settings.sales.itemListType = (resp[0].SalesItemListType) ? resp[0].SalesItemListType : 0;
                        $scope.settings.sales.url = (resp[0].SalesURL) ? resp[0].SalesURL : '';


                        $scope.settings.reservation.title = (resp[0].ReservationTitle) ? resp[0].ReservationTitle : '';
                        $scope.settings.reservation.defaultFormMsg = (resp[0].ReservationFormMsg) ? resp[0].ReservationFormMsg : '';
                        $scope.settings.reservation.visibility = (resp[0].VisibleModules) ? resp[0].VisibleModules.split("")[1] : 1;
                        $scope.settings.reservation.displayFormat = (resp[0].ReservationDisplayFormat) ? resp[0].ReservationDisplayFormat : 0;
                        $scope.settings.reservation.url = (resp[0].ReservationURL) ? resp[0].ReservationURL : '';


                        $scope.settings.homeDelivery.title = (resp[0].HomeDeliveryTitle) ? resp[0].HomeDeliveryTitle : '';
                        $scope.settings.homeDelivery.defaultFormMsg = (resp[0].HomeDeliveryFormMsg) ? resp[0].HomeDeliveryFormMsg : '';
                        $scope.settings.homeDelivery.visibility = (resp[0].VisibleModules) ? resp[0].VisibleModules.split("")[2] : 1;
                        $scope.settings.homeDelivery.itemListType = (resp[0].HomeDeliveryItemListType) ? resp[0].HomeDeliveryItemListType : 0;
                        $scope.settings.homeDelivery.url = (resp[0].HomeDeliveryURL) ? resp[0].HomeDeliveryURL : '';

                        $scope.settings.service.title = (resp[0].ServiceTitle) ? resp[0].ServiceTitle : '';
                        $scope.settings.service.defaultFormMsg = (resp[0].ServiceFormMsg) ? resp[0].ServiceFormMsg : '';
                        $scope.settings.service.visibility= (resp[0].VisibleModules) ? resp[0].VisibleModules.split("")[3] : 1;
                        $scope.settings.service.url = (resp[0].ServiceURL) ? resp[0].ServiceURL : '';


                        $scope.settings.resume.title = (resp[0].ResumeTitle) ? resp[0].ResumeTitle : '';
                        $scope.settings.resume.defaultFormMsg = (resp[0].ResumeFormMsg) ? resp[0].ResumeFormMsg : '';
                        $scope.settings.resume.visibility = (resp[0].VisibleModules) ? resp[0].VisibleModules.split("")[4] : 1;
                        $scope.settings.resume.keywords = (resp[0].ResumeKeyword) ? resp[0].ResumeKeyword : '';
                        $scope.settings.resume.url = (resp[0].ResumeURL) ? resp[0].ResumeURL : '';


                        $scope.settings.business.dataRefreshInterval = (resp[0].DataRefreshInterval) ? resp[0].DataRefreshInterval : 0;
                        $scope.settings.business.brochureFileName = (resp[0].BrochureFileName) ? resp[0].BrochureFileName : '';
                        $scope.settings.business.brochureMimeType= "";
                        $scope.settings.business.brochureFileData = "";
                        $scope.settings.business.keywords = "";
                        $scope.settings.business.category = (resp[0].BusinessCategoryID) ? resp[0].BusinessCategoryID : 0;
                        $scope.settings.resume.freshersAccepted = (resp[0].FreshersAccepted === 1) ? true : false;

                }
            }).error(function(err){
                // ////console.log(err);
            });
    };

    $scope.validateSettings = function(){
        /**
         * @todo Validate Settings before saving
          */
        return true;
    };

    $scope.saveSettings = function(){
        var data = {
            Token : $rootScope._userInfo.Token ,
            SalesTitle : $scope.settings.sales.title ,
            ReservationTitle : $scope.settings.reservation.title ,
            HomeDeliveryTitle : $scope.settings.homeDelivery.title ,
            ServiceTitle : $scope.settings.service.title ,
            ResumeTitle : $scope.settings.resume.title ,

            VisibleModules : $scope.settings.sales.visibility + "" +
                $scope.settings.reservation.visibility + "" +
                $scope.settings.homeDelivery.visibility + "" +
                $scope.settings.service.visibility + "" +
                $scope.settings.resume.visibility,

            SalesItemListType : $scope.settings.sales.itemListType ,
            HomeDeliveryItemListType : $scope.settings.homeDelivery.itemListType ,
            ResumeKeyword : $scope.settings.resume.keywords ,
            Category : $scope.settings.business.category ,
            Keyword : $scope.settings.business.keywords ,
            ReservationDisplayFormat : $scope.settings.reservation.displayFormat ,
            DataRefreshInterval : $scope.settings.business.dataRefreshInterval ,
            SalesFormMsg : $scope.settings.sales.defaultFormMsg ,
            ReservationFormMsg : $scope.settings.reservation.defaultFormMsg ,
            HomeDeliveryFormMsg : $scope.settings.homeDelivery.defaultFormMsg ,
            ServiceFormMsg : $scope.settings.service.defaultFormMsg ,
            ResumeFormMsg : $scope.settings.resume.defaultFormMsg,
            FreshersAccepted  : ($scope.settings.resume.freshersAccepted === true) ? 1 : 2,

            SalesURL : ($scope.settings.sales.url) ?  $scope.settings.sales.url : '',
            ReservationURL : ($scope.settings.reservation.url) ? $scope.settings.reservation.url : '',
            HomeDeliveryURL : ($scope.settings.homeDelivery.url) ? $scope.settings.homeDelivery.url : '',
            ServiceURL : ($scope.settings.service.url) ? $scope.settings.service.url : '',
            ResumeURL : ($scope.settings.resume.url) ? $scope.settings.resume.url : ''
        };

        if($scope.validateSettings()){
            // ////console.log(data);
            $http({
                url : GURL + "ewtConfig",
                method : "POST",
                data : data
            }).success(function(resp){
                Notification.success({message : 'Configuration Saved Successfully', delay : MsgDelay})
            }).error(function(err){
                // ////console.log(err);
            });
        }
    };

    $scope.uploadBrochure = function(){
        /**
         * @todo Write code for brochure upload
         * @type {files|*|files|FileList|files}
         */
       var file =  $("#brochure-file-upload")[0].files;
       // ////console.log('I am executing');
        // ////console.log(file);
            // ////console.log('Then executing');
            var formData = new FormData();
            formData.append('file', file);
            formData.append('Token',$rootScope._userInfo.Token);
            formData.append('RefType',6);

           $http({
               url : GURL + 'ewTUploadDoc',
               method : "POST",
               data : formData
           }).success(function(resp){
                // ////console.log(resp);
           }).error(function(err){

           });

    };


    $scope.selectBrochure = function(){
        $("#brochure-file-upload").trigger('click');
    };

    $scope.loadCategories = function(){
        $http({
            url : GURL + 'ewmGetCategory',
            method : "GET",
            params : {
                LangID : 1
            }
        }).success(function(resp){
                if(resp && resp.length>0){
                    $scope.business.categories = resp;
                }
            }).error(function(err){

            });
    };


    /**
     * Converts a binary file into base64
     * @param file
     * @returns {promise|*}
     */
    $scope.fileToBase64 = function(file){
        var deferred = $q.defer();
        try{
            var fileReader = new FileReader();
            fileReader.onload = function(){
                deferred.resolve(fileReader.result);
            };
            fileReader.readAsDataURL(file[0]);
        } catch(ex){
            //Error with fileReader
        }
        return deferred.promise;
    };


    $scope.loadCategories();
    $scope.loadSettings();

    /**
     * @todo write method for brochure base64 conversion and upload option( in HTML view also)
     //@todo Separate call is present for File upload(already separate API Service is present for file upload)
     */


}]);