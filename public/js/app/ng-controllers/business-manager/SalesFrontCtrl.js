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


            /* modal box for getting sales details */
            $scope.salesModal = {
                title: 'Sales Enquiry',
                class: 'business-manager-modal'
            };



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



            /**
             * Preparing data for saving transaction
             * @param tx
             * @param editMode
             */
            var prepareSaveTransaction = function(editMode){

                /**
                 * @todo Implement Validations
                 * 1. Access Rights and permission
                 * 2. Format of Dates, aciton types and status
                 * 3. Amount
                 * @type {{TID: number, Token: *, MessageText: string, Status: number, TaskDateTime: string, Notes: string, LocID: *, Country: string, State: string, City: string, Area: string, FunctionType: number, Latitude: number, Longitude: number, EZEID: string, ContactInfo: string, FolderRuleID: number, Duration: number, DurationScales: number, NextAction: number, NextActionDateTime: string, ItemsList: Array, DeliveryAddress: string}}
                 */
                var preparedTx = {
                    TID : ($scope.modalBox.tx.TID) ? $scope.modalBox.tx.TID : 0,
                    Token : $rootScope._userInfo.Token,
                    MessageText : $scope.modalBox.tx.message,
                    Status : $scope.modalBox.tx.statusType,
                    TaskDateTime : (!editMode) ? moment().format('DD MMM YYYY hh:mm:ss') : $scope.modalBox.tx.taskDateTime,
                    Notes : $scope.modalBox.tx.notes,
                    LocID : ($scope.modalBox.tx.locId) ? $scope.modalBox.tx.locId : 0,
                    Country : $scope.modalBox.tx.country,
                    State : $scope.modalBox.tx.state,
                    City : $scope.modalBox.tx.city,
                    Area : $scope.modalBox.tx.area,
                    FunctionType : 0,   // For sales
                    Latitude : $scope.modalBox.tx.latitude,
                    Longitude : $scope.modalBox.tx.longitude,
                    EZEID : $scope.modalBox.tx.ezeid,
                    ContactInfo : $scope.modalBox.tx.contactInfo,
                    FolderRuleID : ($scope.modalBox.tx.folderRule) ? $scope.modalBox.tx.folderRule : 0,
                    Duration : 0,
                    DurationScales : 0,
                    NextAction : ($scope.modalBox.tx.nextAction) ? $scope.modalBox.tx.nextAction : 0,
                    NextActionDateTime : ($scope.modalBox.tx.nextActionDateTime) ? $scope.modalBox.tx.nextActionDateTime : moment().format('DD MMM YYYY hh:mm:ss'),
                    ItemsList: JSON.stringify($scope.modalBox.tx.itemList),
                    DeliveryAddress : (!editMode) ? ($scope.modalBox.tx.address + $scope.modalBox.tx.area + $scope.modalBox.tx.city +
                    $scope.modalBox.tx.state + $scope.modalBox.tx.country) : $scope.modalBox.tx.deliveryAddress
                };
                return preparedTx;
            };


        }
    ]);
})();