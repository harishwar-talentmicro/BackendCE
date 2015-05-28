/**
 * ReservationSettingCtrl
 *
 */
angular.module('ezeidApp').controller('ReservationSettingCtrl',['$scope',
    '$rootScope',
    '$http',
    'Notification',
    '$filter',
    'MsgDelay',
    'GURL',
    'ScaleAndCropImage',
    function(
        $scope,
        $rootScope,
        $http,
        Notification,
        $filter,
        MsgDelay,
        GURL,
        ScaleAndCropImage){

    //Initially First Tab is selected
    $scope.selectedTab = 1;
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

        console.log("SA122");
        console.log(item);

        loadSubuserList();

    };

    $scope.closeResourceModalBox = function(){
        $scope.showModal = false;
        resetResourceValue();
    };

    /**
     *     Open Modal box for user
     */
    $scope.showReservationCerviceModal = false;
    $scope.toggleReservationServiceModalBox = function(type,index){

        $scope.showReservationCerviceModal = !$scope.showReservationCerviceModal;
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

    /**
     * Get All Resources
     */
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
                console.log(resp.data);
                if(resp.data.length>0){
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
                Notification.error({ message : err[i], delay : 5000});
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
                    console.log(resp);

                    if(resp.status){

                        Notification.success({ message : 'Resource added successfully', delay : 5000 });

                    }
                    else{
                        Notification.error({ message : 'An error occurred while saving resource! Please try again', delay : 5000});
                    }
                    resetResourceValue()
                    $scope.showModal = false;
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message : 'An error occurred while saving resource! Please try again', delay : 2000});
                });
        }

    };
}]);