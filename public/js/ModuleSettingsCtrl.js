angular.module('ezeidApp').controller('ModuleSettingsCtrl',['$q','$scope','$interval','$http','Notification','$rootScope','$filter','GURL',function($q,$scope,$interval,$http,Notification,$rootScope,$filter,GURL){
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
    $scope.accessRights = [
        {value : 0, title : 'Hidden'},   //0
        {value : 1, title : 'Read Only'},    //1
        {value : 2, title : 'Read, Create and Update'}, //2
        {value : 3, title : 'Read, Create, Update and Delete'}, //3
        {value : 4, title : 'Read and Update'},  //4
        {value : 5, title : 'Read, Update and Delete'}   //5
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
     * @type {{sales: {title: string, accessRight: number}, reservation: {title: string, accessRights: number}, homeDelivery: {title: string, accessRights: number}, service: {title: string, accessRights: number}, resume: {title: string, accessRights: number}}}
     */
    $scope.settings = {
        sales : {
            title : '',
            defaultFormMsg : '',
            accessRight : 0,
            itemListType : 0       // 0: Message, 1: Item, 2: Item+picture, 3: Item+picture+quantity, 4: Item + picture + quantity + rate

        },
        reservation : {
            title : '',
            defaultFormMsg : '',
            accessRight : 0,
            displayFormat : 0 // 0 : Hours (30 min slot), 1 : Days, 2 : Months
        },
        homeDelivery : {
            title : '',
            defaultFormMsg : '',
            accessRight : 0,
            itemListType : 1

        },
        service : {
            title : '',
            defaultFormMsg : '',
            accessRight : 0,
            itemListType : 1

        },
        resume : {
            title : '',
            defaultFormMsg : '',
            accessRight : 0,
            itemListType : 1,    //Hardcoded, will always be an item only
            keywords : ""
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
        //@todo Load business settings from _userInfo
        $http({
            url : GURL + 'ewtGetConfig',
            method : "GET",
            params : {
                Token : $rootScope._userInfo.Token
            }
        }).success(function(resp){
                console.log(resp);
                if(resp && resp.length > 0){

                        $scope.settings.sales.title = resp[0].SalesTitle;
                        $scope.settings.sales.defaultFormMsg = resp[0].SalesFormMsg;
                        $scope.settings.sales.accessRight = resp[0].UserModuleRights.split("")[0];
                        $scope.settings.sales.itemListType = resp[0].SalesItemListType;


                        $scope.settings.reservation.title = resp[0].ReservationTitle;
                        $scope.settings.reservation.defaultFormMsg = resp[0].ReservationFormMsg;
                        $scope.settings.reservation.accessRight = resp[0].UserModuleRights.split("")[1];;
                        $scope.settings.reservation.displayFormat = resp[0].ReservationDisplayFormat;


                        $scope.settings.homeDelivery.title = resp[0].HomeDeliveryTitle;
                        $scope.settings.homeDelivery.defaultFormMsg = resp[0].HomeDeliveryFormMsg;
                        $scope.settings.homeDelivery.accessRight = resp[0].UserModuleRights.split("")[2];;
                        $scope.settings.homeDelivery.itemListType = resp[0].HomeDeliveryItemListType;

                        $scope.settings.service.title = resp[0].ServiceTitle;
                        $scope.settings.service.defaultFormMsg = resp[0].ServiceFormMsg;
                        $scope.settings.service.accessRight= resp[0].UserModuleRights.split("")[3];;


                        $scope.settings.resume.title = resp[0].ResumeTitle;
                        $scope.settings.resume.defaultFormMsg = resp[0].ResumeFormMsg;
                        $scope.settings.resume.accessRight = resp[0].UserModuleRights.split("")[4];;
                        $scope.settings.resume.keywords = resp[0].ResumeKeyword;



                        $scope.settings.business.dataRefreshInterval = resp[0].DataRefreshInterval;
                        $scope.settings.business.brochureFileName = resp[0].BrochureFileName;
                        $scope.settings.business.brochureMimeType= "";
                        $scope.settings.business.brochureFileData = "";
                        $scope.settings.business.keywords = "";
                        $scope.settings.business.category = resp[0].BusinessCategoryID;

                }
                console.log(resp);
            }).error(function(err){
                console.log(err);
            });
    };

    $scope.validateSettings = function(){
        /**
         * @todo Validate Settings before saving
          */
        return true;
    };

    $scope.saveSettings = function(){
        console.log($scope.settings);

        var data = {
            Token : $rootScope._userInfo.Token ,
            SalesTitle : $scope.settings.sales.title ,
            ReservationTitle : $scope.settings.reservation.title ,
            HomeDeliveryTitle : $scope.settings.homeDelivery.title ,
            ServiceTitle : $scope.settings.service.title ,
            ResumeTitle : $scope.settings.resume.title ,

            UserAccessRights : $scope.settings.sales.accessRight + "" +
                $scope.settings.reservation.accessRight + "" +
                $scope.settings.homeDelivery.accessRight + "" +
                $scope.settings.service.accessRight + "" +
                $scope.settings.resume.accessRight,

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
            ResumeFormMsg : $scope.settings.resume.defaultFormMsg
        };

        if($scope.validateSettings()){
            $http({
                url : GURL + "ewtSaveConfig",
                method : "POST",
                data : data
            }).success(function(resp){
                console.log(resp);
            }).error(function(err){
                console.log(err);
            });
        }
    };

    $scope.uploadBrochure = function(){
        //@todo Write code for brochure upload
       var file =  $("#brochure-file-upload")[0].files;
       console.log('I am executing');
        console.log(file);
            console.log('Then executing');
            var formData = new FormData();
            formData.append('file', file);
            formData.append('Token',$rootScope._userInfo.Token);
            formData.append('RefType',6);

           $http({
               url : GURL + 'ewTUploadDoc',
               method : "POST",
               data : formData
           }).success(function(resp){
                console.log(resp);
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

    //@todo write method for brochure base64 conversion and upload option( in HTML view also)
    //@todo Separate call is present for File upload(already separate API Service is present for file upload)


}]);