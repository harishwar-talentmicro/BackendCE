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

            /**
             * Returns comma separted string of the list passed in form
             * [{id : 1, label : 'New'},{id : 2, label : 'Meething}}]
             * @param list
             * @returns {*}
             */
            var convertToString = function(list){
                if(!list){
                    return '';
                }
                var arr = [];
                for(var ct = 0; ct < list.length; ct++){
                    arr.push(list[ct].id);
                }
                console.log(arr);
                var str = arr.join(',');
                console.log(str);
                return str;
            };

            var todayDate = moment().format('DD-MMM-YYYY hh:mm A');
            var dateOneMonthBefore = moment(todayDate,'DD-MMM-YYYY hh:mm A').subtract(1,'month').format('DD-MMM-YYYY hh:mm A');


            $scope.reportFromDate = dateOneMonthBefore;
            $scope.reportToDate = todayDate;

            $scope.userList = [];
            $scope.statusList = [];
            $scope.probabilityList = [
                {id : 1, label : 'Less Likely'},
                {id : 2, label : 'Likely'},
                {id : 3, label : 'More Likely'},
                {id : 4, label : 'Definite'}
            ];

            $scope.selectedProbabilities = [
                {id : 1},
                {id : 2},
                {id : 3},
                {id : 4}
            ];
            $scope.selectedUsers = [];
            $scope.selectedStatus = [];

            $scope.reportData = {
                from_date : moment($scope.reportFromDate,'DD-MMM-YYYY hh:mm A').format('YYYY-MM-DD HH:mm'),
                to_date : moment($scope.reportToDate,'DD-MMM-YYYY hh:mm A').format('YYYY-MM-DD HH:mm'),
                stages : [],
                transactions : [],
                total_amount : 0,
                total_items : 0,
                funnel : [],
                probabilities : convertToString($scope.selectedProbabilities)
            };

            var watchDates = function(){
                $scope.$watch('reportFromDate',function(n,v){
                    if(n !== v){
                        var mFromDate = moment(n,'DD-MMM-YYYY hh:mm A');
                        var mToDate = moment($scope.reportToDate,'DD-MMM-YYYY hh:mm A');
                        if(mFromDate.isValid()){
                            if(mToDate.diff(mFromDate,'seconds') < 1){
                                $scope.reportToDate = mFromDate.format('DD-MMM-YYYY hh:mm A');
                            }
                        }
                    }
                });
                $scope.$watch('reportToDate',function(n,v){
                    if(n !== v){
                        var mFromDate = moment(n,'DD-MMM-YYYY hh:mm A');
                        var mToDate = moment($scope.reportToDate,'DD-MMM-YYYY hh:mm A');
                        if(mToDate.isValid()){
                            if(mToDate.diff(mFromDate,'seconds') < 1){
                                $scope.reportFromDate = mToDate.format('DD-MMM-YYYY hh:mm A');
                            }
                        }
                    }
                });
            };



            var reportData = null;

            var loadStatusFlags = {
                subuserData : false,
                statusData : false
            };

            /**
             * Tests whether all the loading is done by seeing the status of load flags
             * @param callback
             */
            var testLoadStatusFlagsDone = function(callback){
                var st = true;
                if(!loadStatusFlags){
                    if(typeof(callback) == 'function'){
                        callback();
                    }
                    return;
                }
                for(var prop in loadStatusFlags){
                    if(loadStatusFlags.hasOwnProperty(prop)){
                        st *= loadStatusFlags[prop];
                    }
                }
                if(st){
                    if(typeof(callback) == 'function'){
                        callback();
                    }
                }
            };


            /**
             * Loads list of users(subusers) for fetching out their folder rights
             * @returns {*}
             */
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
                        for(var i = 0; i < resp.length; i++){
                            var name = (resp[i].FirstName) ? resp[i].EZEID + '('+resp[i].FirstName+')' : resp[i].EZEID;
                            $scope.userList.push({ id : parseInt(resp[i].TID), label : name});
                        }
                        $scope.selectedUsers = angular.copy($scope.userList);
                    }
                    defer.resolve(resp);
                }).error(function(err,statusCode){
                    defer.resolve([]);
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
                        for(var ct = 0; ct < resp.length; ct++){
                            var name = resp[ct].StatusTitle;
                            $scope.statusList.push({ id : parseInt(resp[ct].TID), label : name});
                        }

                        $scope.selectedStatus = angular.copy($scope.statusList);
                    }
                    else{

                        $scope.statusList = [];
                    }
                    defer.resolve([]);
                }).error(function(err){
                    defer.reject();
                });
                return defer.promise;
            };


            $scope.prepareReport = function(){
                $scope.loadReportData(
                    $scope.reportFromDate,
                    $scope.reportToDate,
                    convertToString($scope.selectedStatus),
                    convertToString($scope.selectedProbabilities),
                    convertToString($scope.selectedUsers)
                ).then(function(resp){
                        $scope.reportData = resp;
                },function(){});
            };


            /**
             * Loads the report data from server
             * @param fromDate
             * @param toDate
             * @param stages
             * @param probabilities
             * @param userIds
             */
            $scope.loadReportData = function(fromDate,toDate,stages,probabilities,userIds){
                var defer = $q.defer();
                $http({
                    url : GURL + 'sales_statistics',
                    method : 'GET',
                    params : {
                        token : $rootScope._userInfo.Token,
                        from_date : moment($scope.reportFromDate,'DD-MMM-YYYY hh:mm A').format('YYYY-MM-DD HH:mm:ss'),
                        to_date : moment($scope.reportToDate,'DD-MMM-YYYY hh:mm A').format('YYYY-MM-DD HH:mm:ss'),
                        stages : stages,
                        probabilities : (probabilities) ? '0,'+probabilities : 0,
                        user : userIds
                    }
                }).success(function(resp,statusText,statusCode){
                    if(resp){
                        if(resp.status){
                            if(resp.data){
                                defer.resolve(resp.data);
                            }
                        }
                        else{
                            Notification.error({
                                title : 'Error',
                                message : 'An error occurred! Please try again',
                                delay : MsgDelay
                            });
                            defer.reject([]);
                        }
                    }
                    else{
                        Notification.error({
                            title : 'Error',
                            message : 'An error occurred! Please try again',
                            delay : MsgDelay
                        });
                        defer.reject([]);
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
                    defer.reject([]);
                });
                return defer.promise;
            };

            var loadInitialReportData = function(){
                $scope.loadReportData(
                    $scope.reportFromDate,
                    $scope.reportToDate,
                    convertToString($scope.selectedStatus),
                    convertToString($scope.selectedProbabilities),
                    convertToString($scope.selectedUsers)
                );
            };

            var init = function(){
                $scope.loadTxStatusTypes().then(function(){
                    loadStatusFlags.statusData = true;
                    testLoadStatusFlagsDone(loadInitialReportData);

                },function(){
                    loadStatusFlags.statusData = true;
                    testLoadStatusFlagsDone(loadInitialReportData);
                });


                getSubUserList().then(function(){
                    loadStatusFlags.subuserData = true;
                    testLoadStatusFlagsDone(loadInitialReportData);
                },function(){
                    loadStatusFlags.subuserData = true;
                    testLoadStatusFlagsDone(loadInitialReportData);
                });
            };

            /**
             * Settings for Mutli select control (used for folder rules in view)
             * @type {{smartButtonMaxItems: number, smartButtonTextConverter: Function}}
             */
            $scope.multiSelectDropDownSettings = {
                smartButtonMaxItems: 0,
                smartButtonTextConverter: function(itemText, originalItem) {
                    return itemText;
                }
            };

            /**
             * Settings for Mutli select control (used for folder rules in view)
             * @type {{smartButtonMaxItems: number, smartButtonTextConverter: Function}}
             */
            $scope.multiSelectDropDownSettings1 = {
                smartButtonMaxItems: 0,
                smartButtonTextConverter: function(itemText, originalItem) {
                    return itemText;
                }
            };

            $scope.multiSelectTransTextUser = {buttonDefaultText: 'Select Users',dynamicButtonTextSuffix : 'selected'};
            $scope.multiSelectTransTextStatus = {buttonDefaultText: 'Select Stages',dynamicButtonTextSuffix : 'selected'};
            $scope.multiSelectTransTextProbability = {buttonDefaultText: 'Select Probabilities',dynamicButtonTextSuffix : 'selected'};

            init();

        }]);
})();