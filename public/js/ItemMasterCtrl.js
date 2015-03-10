/**
 * Created by admin on 6/3/15.
 */
angular.module('ezeidApp').controller('ItemMasterCtrl',['$q','$scope','$interval','$http','Notification','$rootScope','$filter',function($q,$scope,$interval,$http,Notification,$rootScope,$filter){
    //Initially First Tab is selected
    $scope.selectedTab = 1;
    $scope.defaultPicture = 'images/sample_96.png';

    // Item types (functionTypes) available to the system
    $scope.itemTypes = [
        'Sales',
        'Reservation',
        'Home Delivery',
        'Service',
        'Resume'
    ]


    $scope.modalBox = {
        title : "Add New Item",
        item : {
            TID : 0,
            title : "",
            rate : "",
            status : 2,
            description : "",
            picture : $scope.defaultPicture,
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
    $scope.toggleModalBox = function(type,event){
        if(event){
            //@todo Handle editing and updating of items here
        }

        $scope.resetModalData();

        $scope.modalBox.item.type = type;
        $scope.showModal = !$scope.showModal;
    };

    $scope.resetModalData = function(){
        $scope.modalBox = {
            title : "Add New Item",
                item : {
                TID : 0,
                    title : "",
                    rate : "",
                    status : 2,
                    description : "",
                    picture : $scope.defaultPicture,
                    type : 0,    // Type of Item(Function Type) Sales,Reservation,Home Delivery, Service, Resume
                    duration : null
            }
        }
    };

    /**
     * Convert picture to base64 and scales it, after scale assign it to picture
     * @param el
     */
    $scope.uploadPicture = function(el){
        var elem = $(el);
        var imageFile = angular.element(elem)[0].files;
        $scope.fileToBase64(imageFile).then(function(data){
            $scope.scaleImage(data,96).then(function(image){
                $scope.modalBox.item.picture = image;
            },function(){
                //Error Handling for Promise
                Notification.error({ message: "An error occured", delay: MsgDelay });
            });
        },function(){
            //Error Handling for Promise
            Notification.error({ message: "An error occured", delay: MsgDelay });
        });
    };

    $scope.selectPicture = function(){
        console.log($rootScope._userInfo);
        $("#picture-upload-input").trigger('click');
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
            Rate : $scope.modalBox.item.rate,
            Status : $scope.modalBox.item.status,
            ItemDuration : $scope.modalBox.item.duration

        };
       console.log(data);
       $http({
           url : '/ewtSaveItem',
           method : "POST",
           data : data
       }).success(function(resp){
           console.log(resp);
               //@todo Notification Message for saving Item
       }).error(function(err){

       });
    };

    /**
     * Count for Loading items based on type(FunctionType)
     * @type {number}
     */
    $scope.count = 0;

    /**
     * Loads items from server based on function type
     * Recursive calls implemented to make requests one after the other
     */
    $scope.loadItems = function(){
        $http({
            url : '/ewtGetItemList',
            method : "GET",
            params : {
                Token : $rootScope._userInfo.Token,
                FunctionType : $scope.count,
                MasterID : $scope.masterUser.MasterID
            }
        }).success(function(resp){
                console.log(resp);
                $scope.count += 1;
                if($scope.count < 5){
                    $scope.loadItems();
                }
        }).error(function(err){
                console.log(err);
        });
    };

    /**
     * Getting master user details
     */
    $http({
        url : '/ewtGetUserDetails',
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


}]);