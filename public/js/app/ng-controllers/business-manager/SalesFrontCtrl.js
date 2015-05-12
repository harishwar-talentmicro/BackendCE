(function() {
    angular.module('ezeidApp').controller('SalesFrontCtrl', [
        '$rootScope',
        '$scope',
        '$http',
        '$q',
        '$timeout',
        'Notification',
        '$filter',
        '$window',
        'GURL',
        '$interval',
        'MsgDelay',
        '$location',
        '$routeParams',
        '$route',
        'GoogleMaps',
        function ($rootScope,
                  $scope,
                  $http,
                  $q,
                  $timeout,
                  Notification,
                  $filter,
                  $window,
                  GURL,
                  $interval,
                  MsgDelay,
                  $location,
                  $routeParams,
                  $route,
                  GoogleMap) {



            $scope.showModal = false;
            $scope.modalBox = {
                title : 'Transaction Details',
                class : 'business-manager-modal',
                editMode : false,
                locationList : [],
                tx : {
                    orderAmount : 0.00,
                    trnNo : '',
                    ezeidTid : 0,

                    TID : 0,
                    functionType : 0, // Function Type will be 0 for sales
                    ezeid : '',
                    statusType : 0,
                    notes : '',
                    locId : '',
                    country : '',
                    state : '',
                    city : '',
                    area : '',
                    contactInfo : '',
                    deliveryAddress : '',
                    nextAction : 0,
                    nextActionDateTime : '',
                    taskDateTime : '',
                    folderRule : 0,
                    message : '',
                    messageType : ($rootScope._userInfo.SalesItemListType) ? $rootScope._userInfo.SalesItemListType : 0,
                    latitude : 0,
                    longitude : 0,
                    duration : 0,
                    durationScale : 0,
                    itemList : []     // This is transaction item list
                }
            };

            $scope.resetModalBox = function(){
                $scope.modalBox = {
                    title : 'Transaction Details',
                    class : 'business-manager-modal',
                    locationList : [],
                    editMode : false,
                    tx : {
                        orderAmount : 0,
                        trnNo : '',
                        ezeidTid : 0,

                        TID : 0,
                        functionType : 0, // Function Type will be 0 for sales
                        ezeid : '',
                        statusType : 0,
                        notes : '',
                        locId : '',
                        country : '',
                        state : '',
                        city : '',
                        area : '',
                        contactInfo : '',
                        deliveryAddress : '',
                        nextAction : 0,
                        nextActionDateTime : '',
                        taskDateTime : '',
                        folderRule : 0,
                        message : '',
                        messageType : ($rootScope._userInfo.SalesItemListType) ? $rootScope._userInfo.SalesItemListType : 0,
                        latitude : 0,
                        longitude : 0,
                        duration : 0,
                        durationScale : 0,
                        itemList : []
                    }
                };
            };

            $scope.$watch('showModal',function(newVal,oldVal){
                if(!newVal){
                    $scope.resetModalBox();
                }
            });

            $scope.toggleModalBox = function(){

            $scope.resetModalBox();
            $scope.modalBox.editMode = false;
            $scope.showModal = !$scope.showModal;

            };

        }
    ]);
})();