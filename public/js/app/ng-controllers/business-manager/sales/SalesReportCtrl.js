(function() {
    angular.module('ezeidApp').controller('SalesReportCtrl', [
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
        'UtilityService',
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
                  GoogleMap,
                  UtilityService) {

            var todayDate = moment().format('DD-MMM-YYYY hh:mm A');
            var dateOneMonthBefore = moment(todayDate,'DD-MMM-YYYY hh:mm A').subtract(1,'month').format('DD-MMM-YYYY hh:mm A');

            var reportData = null;

            $scope.loadReportData = function(fromDate,toDate,stages,probabilities,userIds){
                $http({
                    url : GURL + 'sales_statistics',
                    method : 'GET',
                    params : {
                        token : $rootScope._userInfo.Token,
                        from_date : '',
                        to_date : '',
                        stages : '',
                        probabilities : '',
                        user : ''
                    }
                }).success(function(resp,statusText,statusCode){
                    if(resp){
                        if(resp.status){
                            if(resp.data){

                            }
                        }
                        else{
                            Notification.error({
                                title : 'Error',
                                message : 'An error occurred! Please try again',
                                delay : MsgDelay
                            });
                        }
                    }
                    else{
                        Notification.error({
                            title : 'Error',
                            message : 'An error occurred! Please try again',
                            delay : MsgDelay
                        });
                    }

                }).error(function(err,statusText,statusCode){
                    if(!statusCode){
                        Notification.error({
                            title : 'Connection Lost',
                            message : 'Unable to reach server ! Please check your connection',
                            delay : MsgDelay});
                    }
                    else{
                        Notification.error({
                            title : 'Error',
                            message : 'An error occurred! Please try again',
                            delay : MsgDelay
                        });
                    }
                });
            };


            /**
             * Folders which are assigned to logged in user and are selected by him
             * to load transacation based on it
             * @type {string}
             */
            $scope.myFolders = [];


            /**
             * Folders applicable to the user who logged in
             * @type {Array}
             */
            $scope.userFolders = [];
            var userFoldersList = [];
            var userFoldersLoaded = false;
            var allFoldersLoaded = false;


            var assignUserFolders = function(){
                for(var b=0; b < userFoldersList.length;b++){
                    var _findex = $scope.txFolderRules.indexOfWhere('TID',userFoldersList[b]);
                    if(_findex !== -1){
                        var folder = angular.copy($scope.txFolderRules[_findex]);
                        folder.id = parseInt(folder.TID);
                        folder.label = folder.FolderTitle;
                        $scope.userFolders.push(folder);
                        $scope.myFolders.push({ id : folder.id});
                    }
                }
            };

            var getSubUserList = function(){
                var defer = $q.defer();
                $http({
                    url : GURL + 'ewtGetSubUserList',
                    method : 'GET',
                    params : {
                        MasterID : $rootScope._userInfo.MasterID,
                        Token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){
                    if(resp && resp.length > 0 && resp !== 'null'){
                        var index = resp.indexOfWhere('EZEID',$rootScope._userInfo.ezeid);
                        if(index !== -1){
                            var userFolders = (resp[index].SalesIDs) ? resp[index].SalesIDs.split(',') : [];
                            ////console.log(userFolders);
                            for(var b=0;b<userFolders.length;b++){
                                userFolders[b] = parseInt(userFolders[b]);
                            }
                            userFoldersList = userFolders;
                        }
                    }
                    userFoldersLoaded = true;
                    if(allFoldersLoaded && userFoldersLoaded){
                        assignUserFolders();
                    }
                    defer.resolve(resp);
                }).error(function(err,statusCode){
                    $scope.userFolders = [];
                    userFoldersLoaded = true;
                    if(allFoldersLoaded && userFoldersLoaded){
                        assignUserFolders();
                    }
                    defer.resolve([]);
                });
                return defer.promise;
            };

            /**
             * Loads FolderRules for Sales
             * @return {*|promise}
             */
            $scope.loadFolderRules = function(){
                var defer = $q.defer();
                $http({
                    url : GURL + 'ewtGetFolderList',
                    method : 'GET',
                    params : {
                        Token : $rootScope._userInfo.Token,
                        FunctionType : 0    // Sales
                    }
                }).success(function(resp){
                    if(resp && resp !== 'null' && resp.length > 0){
                        $scope.txFolderRules = resp;
                        defer.resolve(resp);
                    }
                    else{
                        defer.resolve([]);
                    }
                    allFoldersLoaded  = true;
                    if(allFoldersLoaded && userFoldersLoaded){
                        assignUserFolders();
                    }
                }).error(function(err){
                    defer.reject();
                    allFoldersLoaded = true;
                    if(allFoldersLoaded && userFoldersLoaded){
                        assignUserFolders();
                    }
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
                    $scope.filterStatusTypes = [
                        {TID : -2, StatusTitle : 'All'},
                        {TID : -1, StatusTitle : 'All Open'}
                    ];
                    $scope.filterStatusTypes = $scope.filterStatusTypes.concat(resp);

                    defer.resolve(resp);
                }).error(function(err){
                    defer.reject();
                });
                return defer.promise;
            };




            $scope.reportFromDate = dateOneMonthBefore;
            $scope.reportToDate = todayDate;

        }])
})();