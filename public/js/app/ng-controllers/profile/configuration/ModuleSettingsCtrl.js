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
    'ScaleAndCropImage',
    function(
        $q,
        $scope,
        $interval,
        $http,
        Notification,
        $rootScope,
        $filter,
        GURL,
        MsgDelay,
        ScaleAndCropImage
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
         * HTTP requests load status
         * @type {{categories: boolean, settings: boolean}}
         */
        var loadStatus = {
            categories : false,
            settings : true
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
            visibility : 2,
            itemListType : 0 ,      // 0: Message, 1: Item, 2: Item+picture, 3: Item+picture+quantity, 4: Item + picture + quantity + rate,
            url : ''

        },
        reservation : {
            title : '',
            defaultFormMsg : '',
            visibility : 2,
            displayFormat : 0, // 0 : Hours (30 min slot), 1 : Days, 2 : Months
            url : ''
        },
        homeDelivery : {
            title : '',
            defaultFormMsg : '',
            visibility : 2,
            itemListType : 1,
            url : ''

        },
        service : {
            title : '',
            defaultFormMsg : '',
            visibility : 2,
            itemListType : 1,
            url : ''

        },
        resume : {
            title : '',
            defaultFormMsg : '',
            visibility : 2,
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
                if(resp && resp.length > 0 && resp !== 'null'){
                    loadStatus.settings = true;
                    if(loadStatus.settings && loadStatus.categories){
                        $scope.$emit('$preLoaderStop');
                    }

                    var _moduleVisible = "22222";

                    if(resp[0].VisibleModules){
                        var str = resp[0].VisibleModules.toString();
                        if(str.length === 5){
                            var _arr = str.split('');
                            for(var _c = 0; _c < _arr.length; _c++){
                                if(parseInt(_arr[_c]) === 0){
                                    _arr[_c] = 2;
                                }
                            }
                            resp[0].VisibleModules = _arr.join('');
                        }
                        else{
                            resp[0].VisibleModules = _moduleVisible;
                        }
                    }
                    else{
                        resp[0].VisibleModules = _moduleVisible;
                    }

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
                        $scope.settings.resume.freshersAccepted = (parseInt(resp[0].FreshersAccepted) === 1) ? true : false;

                        $scope.settings.dealEnable = (parseInt(resp[0].dealenable) === 1) ? true : false;
                        $scope.settings.dealTitle = resp[0].dealtitle;
                        $scope.settings.dealDesc = resp[0].dealdesc;
                        $scope.settings.dealBanner = resp[0].dealbanner;
                }
                else{
                    $scope.$emit('$preLoaderStop');
                }
            }).error(function(err){
                // ////////////console.log(err);
                $scope.$emit('$preLoaderStop');
            });
    };

    $scope.validateSettings = function(data){

        var isValidUrl = function(url){
            var urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            var urlRegex = new RegExp(urlPattern);
            return (urlRegex.test(url));
        };
        var error = [];

        if(data.SalesURL){
            if(!isValidUrl(data.SalesURL)){
                error.push('sales url');
            }
        }

        if(data.ReservationURL){
            if(!isValidUrl(data.ReservationURL)){
                error.push('reservation url');
            }
        }

        if(data.HomeDeliveryURL){
            if(!isValidUrl(data.HomeDeliveryURL)){
                error.push('home delivery url');
            }
        }

        if(data.ServiceURL){
            if(!isValidUrl(data.ServiceURL)){
                error.push('service url');
            }
        }

        if(data.ResumeURL){
            if(!isValidUrl(data.ResumeURL)){
                error.push('resume url');
            }
        }

        if(data.deal_enable == 1){
            if(!data.deal_title){
                error.push('promotion(sale) title');
            }
            if(!data.deal_title){
                error.push('promotion(sale) description');
            }
            if(!data.deal_banner){
                error.push('promotional(sale) banner');
            }
        }
        if(error.length > 0){
            var msg = 'Please check '+ error.join(',');
            Notification.error({ message : msg, delay : MsgDelay});
            return false;
        }


        else{
            return true;
        }
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
            ResumeURL : ($scope.settings.resume.url) ? $scope.settings.resume.url : '',
            deal_enable : ($scope.settings.dealEnable) ? 1 : 2,
            deal_banner : ($scope.settings.dealBanner) ? $scope.settings.dealBanner : '',
            deal_title : ($scope.settings.dealTitle) ? $scope.settings.dealTitle : 'SALE',
            deal_desc : ($scope.settings.dealDesc) ? $scope.settings.dealDesc : 'Terms and Conditions Apply'
        };

        /**
         * Reflects the currently saved configuration in $rootScope_userInfo variable
         * as well updates the local storage value also
         */
        var updateRootUserInfo = function(){
            if (typeof (Storage) !== "undefined") {


                $rootScope._userInfo.SalesModuleTitle = data.SalesTitle;
                $rootScope._userInfo.AppointmentModuleTitle = data.ReservationTitle;
                $rootScope._userInfo.HomeDeliveryModuleTitle = data.HomeDeliveryTitle;
                $rootScope._userInfo.ServiceModuleTitle = data.ServiceTitle;
                $rootScope._userInfo.CVModuleTitle = data.ResumeTitle;

                $rootScope._userInfo.SalesFormMsg = data.SalesFormMsg;
                $rootScope._userInfo.ReservationFormMsg = data.ReservationFormMsg;
                $rootScope._userInfo.HomeDeliveryFormMsg = data.HomeDeliveryFormMsg;
                $rootScope._userInfo.ServiceFormMsg = data.ServiceFormMsg;
                $rootScope._userInfo.CVFormMsg = data.ResumeFormMsg;
                $rootScope._userInfo.FreshersAccepted = data.FreshersAccepted;
                $rootScope._userInfo.SalesItemListType = data.SalesItemListType;


                var encrypted = CryptoJS.AES.encrypt(JSON.stringify($rootScope._userInfo), "EZEID");
                localStorage.setItem("_token", encrypted);
            } else {
                alert('Sorry..! Browser is not supported');
                window.location.href = "/";
            }
        };

        if($scope.validateSettings(data)){
            // ////////////console.log(data);
            $scope.$emit('$preLoaderStart');
            $http({
                url : GURL + "ewtConfig",
                method : "POST",
                data : data
            }).success(function(resp){
                updateRootUserInfo();
                $scope.$emit('$preLoaderStop');
                Notification.success({message : 'Configuration Saved Successfully', delay : MsgDelay});
            }).error(function(err){
                // ////////////console.log(err);
                $scope.$emit('$preLoaderStop');
                Notification.success({message : 'Error while saving configuration! Please try again', delay : MsgDelay});

            });
        }
    };

    $scope.uploadBrochure = function(){
        var file =  $("#brochure-file-upload")[0].files[0];
        var formData = new FormData();
        formData.append('file', file);
        formData.append('TokenNo',$rootScope._userInfo.Token);
        formData.append('RefType',6);
        $scope.$emit('$preLoaderStart');
        $http({
           url : GURL + 'ewtUploadDoc',
           method : "POST",
           data : formData,
           headers: {'Content-Type': undefined  },
           transformRequest: angular.identity
        }).success(function(resp){
            $scope.$emit('$preLoaderStop');
            if(resp && resp != 'null' && resp.IsSuccessfull){
                Notification.success({ message : 'Brochure Uploaded successfully', delay : MsgDelay});
            }
           else{
                Notification.error({ message : 'An error occurred while uploading brochure', delay : MsgDelay});
            }
        }).error(function(err){
            $scope.$emit('$preLoaderStop');
           Notification.error({ message : 'An error occurred while uploading brochure', delay : MsgDelay});
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
            loadStatus.categories = true;
            if(loadStatus.settings && loadStatus.categories){
                $scope.$emit('$preLoaderStop');
            }

            if(resp && resp.length>0){
                    $scope.business.categories = resp;
                }
            }).error(function(err){
                $scope.$emit('$preLoaderStop');
                Notification.error({ message : 'Unable to load categories', delay : MsgDelay});
            });
    };

        $scope.selectDealBanner = function(){
            angular.element('#deal-banner-upload').trigger('click');
        };

    $scope.uploadDealBanner = function(event){
        var image = $('#deal-banner-upload')[0].files[0];
        var fileName = image.name;
        var imageHeight = 100;
        var imageWidth = 840;

        $scope.$emit('$preLoaderStart');
        ScaleAndCropImage.convertToBase64FromServer(image,imageHeight,imageWidth).then(function(imageUrl){
            $scope.settings.dealBanner = imageUrl;
            $scope.$emit('$preLoaderStop');
        },function(err){
            console.info('Server Cropping failed ! Falling back to browser croppping mode');
            ScaleAndCropImage.covertToBase64(image).then(function(imageUrl){
                var scaledImageUrl = ScaleAndCropImage.scalePropotional(imageUrl,imageHeight,imageWidth);
                var finalImage = ScaleAndCropImage.cropImage(scaledImageUrl,imageHeight,imageWidth);
                $scope.settings.dealBanner = finalImage;
                $scope.$emit('$preLoaderStop');
            },function(){
                $scope.$emit('$preLoaderStop');
            });
        });
    };

    $scope.loadCategories();
    $scope.loadSettings();



}]);