angular.module('ezeidApp').controller('ProfileMasterCtrl',[
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
    'ScaleAndCropImage',
    'MsgDelay',
    '$location',
    '$routeParams',
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
        ScaleAndCropImage,
        MsgDelay,
        $location,
        $routeParams
    ) {
        $scope.dataProgressLoader.dataLoadInProgress = false;
        $scope.dataProgressLoader.dataLoadError = false;
        $scope.dataProgressLoader.dataLoadComplete = true;


        $scope.pageUserDetails = "html/profile/user/user-details.html";
        $scope.pageLocationDetails = "html/profile/user/location-details.html";
        $scope.activeSubTemplate = $scope.pageUserDetails;

        $scope.activeLoc = 0;

        $scope.locCount = [];


        $scope.changeActive = function(locationIndex,isLocationFlag){
            if(isLocationFlag){
                $scope.activeSubTemplate = $scope.pageLocationDetails;
                $scope.activeLoc = locationIndex;
            }
            else{
                $scope.activeSubTemplate = $scope.pageUserDetails;
            }
        };


        /**
         * Loading countries
         */
        $scope.loadCountries = function(){
            var defer = $q.defer();
            $http({
                url : GURL + 'ewmGetCountry',
                method : 'GET',
                params : {
                    LangID : 1
                }
            }).success(function(resp){
                if(resp && resp.length > 0 && resp !== 'null'){
                    $scope.countryList = resp;

                    defer.resolve(true);
                }
                else{
                    defer.resolve(false);
                }
            }).error(function(err){
                defer.reject(err);
            });
            return defer.promise;
        };

        $scope.loadStates = function(countryId){
            var defer = $q.defer();
            $http({
                url : GURL + 'ewmGetState',
                method : 'GET',
                params : {
                    LangID : 1,
                    CountryID : countryId
                }
            }).success(function(resp){
                if(resp && resp.length > 0 && resp !== 'null'){
                    defer.resolve(resp);
                }
                else{
                    defer.resolve([]);
                }
            }).error(function(err){
                defer.reject(err);
            });
            return defer.promise;
        };


        /**
         * Load Cities based on State
         * @param stateId
         * @returns {promise|*}
         */
        $scope.loadCities = function(stateId){
            var promiseResolved = false;
            var defer = $q.defer();
            $http({
                url : GURL + 'ewmGetCity',
                method : 'GET',
                params : {
                    LangID : 1,
                    StateID : stateId
                }
            }).success(function(resp){
                promiseResolved = true;
                if(resp && resp.length > 0 && resp !== 'null'){
                    defer.resolve(resp);
                }
                else{
                    defer.resolve([]);
                }
            }).error(function(err){
                defer.reject(err);
            });
            $timeout(function(){
                promiseResolved = true;
                if(!promiseResolved){
                    defer.reject();
                }
            },10000);
            return defer.promise;
        };

        $scope.loadWorkingHourTemplates =  function(){
            var defer = $q.defer();

            $http({
                method : "GET",
                url : GURL + "ewtWorkingHours",
                params : {
                    Token : $rootScope._userInfo.Token
                }
            }).success(function(resp){
                if(resp && resp !== 'null'){
                    if(resp.length > 0){
                        $scope.workingHoursTemplateMap = resp;
                        for(var i in resp){
                            $scope.workingHoursTemplates[resp[i].TID] = resp[i].TemplateName;
                        }
                        defer.resolve(resp);
                    }
                }
                else{
                    defer.resolve([]);
                }
            }).error(function(err){
                defer.resolve([]);
            });
            return defer.promise;
        };



    }]);