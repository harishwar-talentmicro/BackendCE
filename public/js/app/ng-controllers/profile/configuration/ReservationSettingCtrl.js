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

    $scope.modalBox = {
        item : {
            OperatorID : 0,
            title : "",
            status  : 1,
            description: "",
            picture : ""
        }
    };

    getUserDetails();

    /**
     * Resource Status Mapping
     * @type {{1: string, 2: string}}
     */
    $scope.status = 1 ;

    /**
     *     Open Modal box for user
     */
    $scope.showModal = false;
    $scope.toggleModalBox = function(type,index){
        loadSubuserList();
        $scope.showModal = !$scope.showModal;
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
        if($scope.modalBox.item.OperatorID == 0){
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

    /**
     * Validates Items and then save it to server
     */
    if(validateItem()){
        $scope.modalBox.item.Token = $rootScope._userInfo.Token;
        $http({
            url : GURL + 'reservation_resource',
            method : "POST",
            data : $scope.modalBox.item
        }).success(function(resp){

                console.log(resp);

                if(resp && resp.hasOwnProperty("IsSuccessfull")){
                    /*if(resp.IsSuccessfull){
                        $scope.loadItems($scope.modalBox.item.type);
                        $scope.toggleModalBox();
                        Notification.success({ message : 'Item added successfully', delay : 5000 });
                    }
                    else{
                        Notification.error({ message : 'An error occured while saving item! Please try again', delay : 5000});
                    }*/
                }
                else{
                    Notification.error({ message : 'An error occured while saving item! Please try again', delay : 5000});
                }
            }).error(function(err){
                Notification.error({ message : 'An error occured while saving item! Please try again', delay : 2000});
            });
    }

    };

}]);