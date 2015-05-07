(function(){
    angular.module('ezeidApp').controller('SalesCtrl',[
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
        function (
            $rootScope,
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
            $route
            ) {


            $(document).on('click','.popover-close',function(){
                $('*[data-toggle="popover"]').popover('hide');
            });

            $scope.pageNumber = 1;
            $scope.statusType = null;
            $scope.txList = [];
            $scope.totalPages = 1;

            $scope.showModal = false;
            $scope.modalBox = {
              title : 'Transaction Details',
              class : 'business-manager-modal',
              tx : {
                  orderAmount : 0,
                  trnNo : '',

                  TID : 0,
                  functionType : 0, // Function Type will be 0 for sales
                  ezeid : '',
                  statusType : 0,
                  notes : '',
                  locId : 0,
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

            /**
             * Modal Box toggle
             * @param e
             */
            $scope.toggleModalBox = function(e){
                if(e){
                    /**
                     * Fill the information of Current Transaction
                     */
                }
                $scope.showModal = !$scope.showModal;
            };

            $scope.resetModalBox = function(){
                $scope.modalBox = {
                    title : 'Transaction Details',
                    class : 'business-manager-modal',
                    tx : {
                        orderAmount : 0,
                        trnNo : '',

                        TID : 0,
                        functionType : 0, // Function Type will be 0 for sales
                        ezeid : '',
                        statusType : 0,
                        notes : '',
                        locId : 0,
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



            $scope.loadTransaction = function(pageNo,statusType){
                var defer = $q.defer();
                if(!pageNo){
                    pageNo = 1;
                }
                if(!statusType){
                    statusType = null;
                }
                $http({
                    url : GURL + 'ewtGetTranscation',
                    method : 'GET',
                    params : {
                        Token : $rootScope._userInfo.Token,
                        Page : pageNo,
                        Status : (statusType) ? statusType : '',
                        FunctionType : 0    // For Sales
                    }
                }).success(function(resp){
                    if(resp && resp !== 'null'){
                        /**
                         * Change
                         * 1. $scope.totalPages
                         * 2. $scope.pageNumber
                         * 3. $scope.txList
                         */
                        $scope.totalPage = resp.TotalPage;
                        $scope.pageNumber = pageNo;
                        $scope.txList = resp.Result;
                    }
                    else{

                        $scope.txList = [];
                    }
                    defer.resolve(resp);
                    Notification.success({ message : JSON.stringify(resp), delay : MsgDelay});
                }).error(function(err){
                    defer.reject();
                });
                return defer.promise;
            };

            $scope.$watch('pageNumber',function(newVal,oldVal){
                if(newVal !== oldVal)
                {
                    $scope.$broadcast('$preLoaderStart');
                    $scope.loadTransaction(newVal,$scope.statusType).then(function(){
                        $scope.$broadcast('$preLoaderStop');
                    },function(){
                        $scope.$broadcast('$preLoaderStop');
                    });
                }
            });
            $scope.$emit('$preLoaderStop');
            $scope.loadTransaction().then(function(){
                $scope.$emit('$preLoaderStart');
            },function(){
                $scope.$emit('$preLoaderStop');
            });

        }]);

})();
