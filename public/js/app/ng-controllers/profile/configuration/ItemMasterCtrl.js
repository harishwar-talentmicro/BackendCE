angular.module('ezeidApp').directive('contentItem', ['$compile','$templateCache',function ($compile,$templateCache) {

    var getTemplate = function(templateType) {
        var template = '';

        switch(templateType) {
            case 0:
                template = $templateCache.get('/only-message-tpl.html');
                break;
            case 1:
                template = $templateCache.get('/only-item-tpl.html');
                break;
            case 2:
                template = $templateCache.get('/item-picture-tpl.html');
                break;
            case 3:
                template = $templateCache.get('/item-picture-rate-tpl.html');
                break;
            case 4 :
                template = $templateCache.get('/item-picture-rate-tpl.html');
                break;
            default :
                template = "";
                break;
        }

        return template;
    };

    var linker = function(scope, element, attrs) {
        // scope.rootDirectory = 'images/';
        // ////////////console.log(attrs.templateType);
        var templateType = scope.$eval(attrs.templateType);
        element.html(getTemplate(templateType)).show();
        $compile(element.contents())(scope);
    };


    return {
        restrict: "E",
        link: linker,
        scope: {
            content:'=',
            index: '=',
            toggleModalBox : '&',
            removeItem : '&'
        }
    };
}]);
/**
 * Filter for Performing Text Stripping for showing description
 */
angular.module('ezeidApp').filter('textLength',function(){
    return function(text,length){
        if(typeof(text) !== "string" || text.length < 1 || text.length < length)
        {
            return text;
        }
        var retText = text.substr(0,length);
        return retText+" ...";
    };
});

/**
 * Controller : ItemMasterCtrl
 */
angular.module('ezeidApp').controller('ItemMasterCtrl',[
    '$q',
    '$scope',
    '$interval',
    '$http',
    'Notification',
    '$rootScope',
    '$filter',
    'GURL',
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
        ScaleAndCropImage
        ){
    //Initially First Tab is selected
    $scope.selectedTab = 1;
//    $scope.defaultPicture = 'images/sample_96.png';

    /**
     * Settings to be fetched from Global Configuration
     * @todo Fetch from global Configuration
     * @type {Array}
     *
     */
    $scope.globalConfig = {
        itemListType : [
        2,          // Sales itemListType
        0,          // Reservation DisplayFormat  (Minutes)
        3,          // HomeDelivery itemListType
        1,          // Service itemListType (Hardcoded as it will always be an item only with description)
        1           // Resume itemListType (Hardcoded as resume will always be having Item only with description)
    ]};

    /**
     * Templates to select based on list type(HTML Templates using ng-template)
     * @type {Array}
     */
    $scope.listTypeTemplates = [
        '/only-message-tpl.html',
        '/only-item-tpl.html',
        '/item-picture-tpl.html',
        '/item-picture-qty-tpl.html',
        '/item-picture-qty-rate-tpl.html'
    ];

    /***
     * All types of items will reside in this model
     * @type {{sales: Array, reservation: Array, homeDelivery: Array, service: Array, resume: Array}}
     */
    $scope.items = {
        sales : [],
        reservation : [],
        homeDelivery : [],
        service : [],
        resume : []
    };



    // Item types (functionTypes) available to the system
    $scope.itemTypes = [
        'Sales',
        'Reservation',
        'Home Delivery',
        'Service',
        'Resume'
    ];


    $scope.modalBox = {
        title : "Add New Item",
        item : {
            TID : 0,
            title : "",
            rate : 0,
            status : 1,
            description : "",
            picture : "",
            type : 0,    // Type of Item(Function Type) Sales,Reservation,Home Delivery, Service, Resume
            duration : null
        }
    };

    /**
     * Scaling Image based on height (height === width)
     * @param src
     * @param dHeight
     * @returns {promise|*}
     */
    $scope.scaleImage = function(src,dHeight){
        var image = new Image();
        var defer = $q.defer();
        try{
            image.src = src;
            image.onload = function(){
                var canvas = document.createElement("canvas");
                image.height = dHeight;
                image.width = dHeight;
                var ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0, image.width, image.height);
                var dataUri = canvas.toDataURL("image/jpeg", 1.0);
                defer.resolve(dataUri);
            };
        }
        catch(ex){
            defer.reject();
        }
        return defer.promise;
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

    //Open Modal box for user
    $scope.showModal = false;
    $scope.toggleModalBox = function(type,itemIndex){
        // ////////////console.log(type);
        // ////////////console.log(itemIndex);
        if(typeof(type) == "undefined"){
            type = 0;
        }
        if(typeof(itemIndex)!== "undefined"){
               var functionTypes = ['sales','reservation','homeDelivery','service','resume'];

               $scope.modalBox.item = {
                    TID : $scope.items[functionTypes[type]][itemIndex].TID,
                    title : $scope.items[functionTypes[type]][itemIndex].ItemName,
                    description : $scope.items[functionTypes[type]][itemIndex].Description,
                    rate : $scope.items[functionTypes[type]][itemIndex].Rate,
                    status : $scope.items[functionTypes[type]][itemIndex].Status,
                    picture : $scope.items[functionTypes[type]][itemIndex].Pic,
                    type : type,
                    duration : ($scope.items[functionTypes[type]][itemIndex].Duration) ? $scope.items[functionTypes[type]][itemIndex].Duration : null
               };
        }

        else{
            $scope.resetModalData();
            $scope.modalBox.item.type = type;
        }
        $scope.showModal = !$scope.showModal;
    };

    $scope.resetModalData = function(){
        $scope.modalBox = {
            title : "Add New Item",
                item : {
                    TID : 0,
                    title : "",
                    rate : "",
                    status : 1,
                    description : "",
                    picture : "",
                    type : 0,    // Type of Item(Function Type) Sales,Reservation,Home Delivery, Service, Resume
                    duration : null
            }
        }
    };

//    /**
//     * Convert picture to base64 and scales it, after scale assign it to picture
//     * @param el
//     */
//    $scope.uploadPicture = function(el){
//        var elem = $(el);
//        var imageFile = angular.element(elem)[0].files;
//        $scope.fileToBase64(imageFile).then(function(data){
//            $scope.scaleImage(data,96).then(function(image){
//                $scope.modalBox.item.picture = image;
//            },function(){
//                //Error Handling for Promise
//                Notification.error({ message: "An error occured", delay: MsgDelay });
//            });
//        },function(){
//            //Error Handling for Promise
//            Notification.error({ message: "An error occured", delay: MsgDelay });
//        });
//    };

    $scope.selectPicture = function(){
        // ////////////console.log($rootScope._userInfo);
        $("#picture-upload-input").trigger('click');
    };

    /**
     * Validates the data while adding items
     * @param item
     * @returns {boolean}
     */
    $scope.validateItem = function(item){
        var err = [];
        if(item.title.length < 1){
            err.push('Item Title is empty');
        }
        if(item.description.length < 1 ){
            err.push('Add description to this item');
        }
        if($scope.globalConfig.itemListType[item.type] > 1){
            if(!item.picture){
                err.push('Please select a picture for this item');
            }
            if($scope.globalConfig.itemListType[item.type] > 2){
                if(!item.rate){
                    err.push('Please enter rate of item');
                }
            }
        }

        if(err.length > 0){
            for(var i = 0; i < err.length; i++){
                Notification.error({ message : err[i], delay : 5000});
            }
            return false;
        }
        return true;
    };

    $scope.saveItem = function(){
        var data = {
            Token : $rootScope._userInfo.Token,
            MasterID : $scope.masterUser.MasterID,

            TID : $scope.modalBox.item.TID,
            FunctionType : $scope.modalBox.item.type,
            ItemName : $scope.modalBox.item.title,
            ItemDescription : $scope.modalBox.item.description,
            Pic : ($scope.modalBox.item.picture == $scope.defaultPicture) ? null : $scope.modalBox.item.picture,
            Rate : ($scope.modalBox.item.rate)? $scope.modalBox.item.rate : 0.00,
            Status : $scope.modalBox.item.status,
            ItemDuration : $scope.modalBox.item.duration

        };

        /**
         * Validates Items and then save it to server
         */
       if($scope.validateItem($scope.modalBox.item)){
           $http({
               url : GURL + 'ewtSaveItem',
               method : "POST",
               data : data
           }).success(function(resp){
                   if(resp && resp.hasOwnProperty("IsSuccessfull")){
                       if(resp.IsSuccessfull){
                           $scope.loadItems($scope.modalBox.item.type);
                           $scope.toggleModalBox();
                           if(data.TID){
                               Notification.success({ message : 'Item updated successfully', delay : 5000 });
                           }
                           else{
                               Notification.success({ message : 'Item added successfully', delay : 5000 });
                           }

                       }
                       else{
                           Notification.error({ message : 'An error occurred while saving item! Please try again', delay : 5000});
                       }
                   }
                   else{
                       Notification.error({ message : 'An error occurred while saving item! Please try again', delay : 5000});
                   }
               }).error(function(err){
                   Notification.error({ message : 'An error occured while saving item! Please try again', delay : 2000});
               });
       }

    };

    /**
     * Count for Loading items based on type(FunctionType)
     * @type {number}
     */
    $scope.count = 0;

        /**
         * Keeping track of HTTP status
         * @type {{items: boolean, config: boolean}}
         */
        var loadStatus  = {
            items : false,
            config : false
        }

    /**
     * Loads items from server based on function type
     * Recursive calls implemented to make requests one after the other
     */
    $scope.loadItems = function(functionType){

        var fType = (typeof(functionType) !== "undefined") ? functionType : $scope.count;
        $http({
            url : GURL + 'ewtGetItemList',
            method : "GET",
            params : {
                Token : $rootScope._userInfo.Token,
                FunctionType : fType,
                MasterID : ($scope._userInfo.MasterID) ? $scope._userInfo.MasterID : $scope.masterUser.MasterID
            }
        }).success(function(resp){
                var functionTypes = ['sales','reservation','homeDelivery','service','resume'];

                /**
                 * If functionType is set in function, it will be called once only
                 */

                if(typeof(functionType) !== "undefined"){
                    if(resp && resp.length > 0 && resp !== 'null'){
                        $scope.items[functionTypes[fType]] = resp;
                    }
                }

                /**
                 * It will try to load all items and will increase the counter( loading all types of items initially)
                 */
                else{
                    if(resp && resp.length > 0 && resp.length !== 'null'){
                        $scope.items[functionTypes[fType]] = resp;
                    }

                    $scope.count += 1;
                    if($scope.count < 5){
                        // ////////////console.log('Item load for '+ fType);
                        $scope.loadItems();
                    }
                }
        }).error(function(err){
            loadStatus.items = true;
                // ////////////console.log(err);
        });
    };


    /**
     * Loading Global Configuration Settings for this Business User
     */
    $scope.loadGlobalConfig = function(){
        $http({
            url : GURL + 'ewtConfig',
            method : "GET",
            params : {
                Token : $rootScope._userInfo.Token
            }
        }).success(function(resp){
                if(resp && resp.length > 0 && resp !== 'null'){
                    $scope.globalConfig.itemListType = [];
                    $scope.globalConfig.itemListType[0] = (resp[0].SalesItemListType) ? resp[0].SalesItemListType : 0;
                    $scope.globalConfig.itemListType[1] = (resp[0].ReservationDisplayFormat) ? resp[0].ReservationDisplayFormat : 0;
                    $scope.globalConfig.itemListType[2] = (resp[0].ReservationDisplayFormat) ? resp[0].HomeDeliveryItemListType : 0;
                    $scope.globalConfig.itemListType[3] = 1;
                    $scope.globalConfig.itemListType[4] = 1;
                }
            }).error(function(err){
                // ////////////console.log(err);
            });
    };

    /**
     * Getting master user details
     */
    $scope.getMasterUserDetails = function(){
        $http({
            url : GURL + 'ewtGetUserDetails',
            method : "GET",
            params :{
                Token : $rootScope._userInfo.Token
            }
        }).success(function(resp){
                if(resp.length>0){
                    $scope.masterUser = resp[0];
                    //Loading all function items one by one
                    $scope.loadItems();
                }
            }).error(function(err){
                Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
            });
    };


    $scope.loadGlobalConfig();
    $scope.getMasterUserDetails();

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


}]);