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


            /**
             * Logged in user cannot use this module as he is not having the required permissions for it
             */
            var moduleIndex = $scope.modules.indexOfWhere('type','sales');
            var permission = parseInt($scope.modules[moduleIndex].permission);
            if(permission.isNaN || permission === 0 )
            {
                $location.path('/business-manager');
            };


            $scope.$emit('$preLoaderStart');


            $(document).on('click','.popover-close',function(){
                $('*[data-toggle="popover"]').popover('hide');
            });

            $scope.pageNumber = 1;
            $scope.statusType = null;
            $scope.txList = [];
            $scope.totalPages = 1;
            $scope.txStatusTypes = [];
            $scope.txActionTypes = [];

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

            $scope.editModes = [];


            /**
             * Toggles the edit mode for particular transaction
             * Inline editing
             * @param index
             */
            $scope.toggleAllEditMode = function(index){
                console.log(index);
                if(typeof(index) === "undefined")
                {
                    index = -1;
                }
                for(var c = 0; c < $scope.editModes.length; c++){
                    if(c === index){
                        $scope.editModes[c] = true;
                    }
                    else{
                        $scope.editModes[c] = false;
                    }
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


            /**
             * Loads all transactions
             * @param pageNo
             * @param statusType
             * @returns {*}
             */
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

                        for(var a = 0; a < resp.Result.length; a++){
                            $scope.editModes.push(false);
                        }
                    }
                    else{

                        $scope.txList = [];
                    }
                    defer.resolve(resp);
                }).error(function(err){
                    defer.reject();
                });
                return defer.promise;
            };


            /**
             * Load Transaction Action Types
             * @returns {*}
             */
            $scope.loadTxActionTypes = function(){
                var defer = $q.defer();
                $http({
                    url : GURL + 'ewtGetActionType',
                    method : 'GET',
                    params : {
                        Token : $rootScope._userInfo.Token,
                        FunctionType : 0    // For Sales
                    }
                }).success(function(resp){
                    if(resp && resp !== 'null' && resp.length > 0){
                        /**
                         * Change
                         * 1. $scope.totalPages
                         * 2. $scope.pageNumber
                         * 3. $scope.txList
                         */
                        $scope.txActionTypes = resp;
                    }
                    else{

                        $scope.txActionTypes = [];
                    }
                    defer.resolve(resp);
                }).error(function(err){
                    defer.reject();
                });
                return defer.promise;
            };


            /**
             * Load Transaction Status Types
             * @returns {*}
             */
            $scope.loadTxStatusTypes = function(){
                var defer = $q.defer();
                $http({
                    url : GURL + 'ewtGetStatusType',
                    method : 'GET',
                    params : {
                        Token : $rootScope._userInfo.Token,
                        FunctionType : 0    // For Sales
                    }
                }).success(function(resp){
                    if(resp && resp !== 'null' && resp.length > 0){
                        /**
                         * Change
                         * 1. $scope.totalPages
                         * 2. $scope.pageNumber
                         * 3. $scope.txList
                         */
                        $scope.txStatusTypes = resp;
                    }
                    else{

                        $scope.txStatusTypes = [];
                    }
                    defer.resolve(resp);
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


            $scope.loadTxActionTypes().then(function(){
                $scope.loadTxStatusTypes().then(function(){
                    $scope.loadTransaction().then(function(){
                        $scope.$emit('$preLoaderStop');
                    },function(){
                        $scope.$emit('$preLoaderStop');
                    });
                },function(){
                    $scope.$emit('$preLoaderStop');
                });
            },function(){
                $scope.$emit('$preLoaderStop');
            });



        }]);

})();
