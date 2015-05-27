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
    'GURL',function(
        $scope,
        $rootScope,
        $http,
        Notification,
        $filter,
        MsgDelay,
        GURL){

    //Initially First Tab is selected
    $scope.selectedTab = 1;

    $scope.modalBox = {
        item : {
            TID : 0,
            title : "",
            rate : 0,
            status : 1,
            description : "",
            picture : "",
            duration : null
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

      /*  if(typeof(index) !== "undefined" && typeof(type) !== "undefined"){
         // ////console.log(index+'   '+type);
         $scope.modalBox.txStatus = angular.copy($scope.txStatuses[functionTypes[type]][index]);
         $scope.modalBox.title = "Update Status Type";
         }
         else{

         $scope.resetModalData();
         $scope.modalBox = {
         title : "Add new Status Type",
         txStatus : {
         TID : 0,
         type : type,           // Function Type
         title : "",
         progress : 0,       // Progress % for this title
         status : 1,         // 1 : Active
         notificationMsg : "",   // Notification Message
         notificationMailMsg : "",   // Notification Mail Message
         statusValue : 0
         }
         };
         }*/
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

    /**
     * Validates the data while adding items
     * @param item
     * @returns {boolean}
     */
    function validateItem(){
        console.log("sai77");


        console.log($scope.modalBox);
        console.log($scope.mResourceStatus);
        console.log($scope.mOperatorID);
        console.log($scope.mResourceDescription);

       /* var err = [];
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
        return true;*/
    };

    $scope.saveResource = function(){
       /* var data = {
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

        };*/

        /**
         * Validates Items and then save it to server
         */
        if(validateItem()){
            /*$http({
                url : GURL + 'ewtSaveItem',
                method : "POST",
                data : data
            }).success(function(resp){
                    if(resp && resp.hasOwnProperty("IsSuccessfull")){
                        if(resp.IsSuccessfull){
                            $scope.loadItems($scope.modalBox.item.type);
                            $scope.toggleModalBox();
                            Notification.success({ message : 'Item added successfully', delay : 5000 });
                        }
                        else{
                            Notification.error({ message : 'An error occured while saving item! Please try again', delay : 5000});
                        }
                    }
                    else{
                        Notification.error({ message : 'An error occured while saving item! Please try again', delay : 5000});
                    }
                }).error(function(err){
                    Notification.error({ message : 'An error occured while saving item! Please try again', delay : 2000});
                });*/
        }

    };

}]);