/**
 * New ProfileController
 * @desc Includes Master Information with location adding and editing facility
 * @author Hirecraft
 * @since 05/04/2015 05:15 PM
 */
/**
 * "use strict";
 */

angular.module('ezeidApp').controller('ProfileCtrl',[
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
    'GoogleMaps',
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
            GoogleMap
        ) {
        /**
         * List of countries
         * @type {Array}
         */
        $scope.countryList = [];

        /**
         * List of states loaded based on country code
         * @type {Array}
         */
        $scope.stateList = [];

        /**
         * List of cities loaded based on states
         * @type {Array}
         */
        $scope.cityList = [];

        /**
         * Secondary Locations Available for this particular user
         * @type {Array}
         */
        $scope.secondaryLocations = [];


        $scope.workingHoursTemplateMap = [];


        $scope.workingHoursTemplates = [];


        /**
         * Array Holding information regarding editMode, viewMode and Map initialization of all locations
         * @desc First element is primary location which is always available on the server
         * @type {Array}
         */
        $scope.locationsToggleIndex = [
            {
                editMode : false,
                viewMode : false,
                isMapInitialized : false,
                savedOnServer : true,
                removeProgress : false,
                saveProgress : false
            }
        ];

        /**
         * Profile Editing Mode Flag
         * @type {boolean}
         */
        $scope.profileEditMode = false;


        /**
         * Toggles editing mode for profile
         */
        $scope.toggleProfileEditMode = function(){
            if($scope.profileEditMode){
                $scope.profileEditMode = false;
            }
            else{
                $scope.profileEditMode = true;
            }
        };

        var updateLatLngForLocations = function(lat,lng){
            if($scope.userDetails.Latitude == 0 && $scope.userDetails.Longitude == 0){
                $scope.userDetails.Latitude = lat;
                $scope.userDetails.Longitude = lng;
            }
            else{
                for(var i = 0; i < $scope.secondaryLocations.length; i++){
                    if($scope.secondaryLocations[i].Latitude == 0 && $scope.secondaryLocations[i].Longitude == 0){
                        $scope.secondaryLocations[i].Latitude = lat;
                        $scope.secondaryLocations[i].Longitude = lng;
                    }
                }
            }
        };

        var setZeroLatLngToCurrentLocation = function(){
            try{
                var googleMap = new GoogleMap();
                googleMap.getCurrentLocation().then(function(){
                    var lat = googleMap.currentMarkerPosition.latitude;
                    var lng = googleMap.currentMarkerPosition.longitude;
                    updateLatLngForLocations(lat,lng);
                },function(){
                    var lat = googleMap.currentMarkerPosition.latitude;
                    var lng = googleMap.currentMarkerPosition.longitude;
                    updateLatLngForLocations(lat,lng);
                });
            }
            catch(ex){
                console.error('Google maps library not found');
            }
        };

        /**
         * If user wants the data to be refreshed,
         * In case it will load data initially from server again
         */
        $scope.dataReloadAgain = function(){

//            $scope.dataProgressLoader.dataLoadError = false;
//            $scope.dataProgressLoader.dataLoadComplete = false;
//            $scope.dataProgressLoader.dataLoadInProgress = true;
            $scope.$emit('$preLoaderStart');

            $scope.loadCountries().then(function(){
                $scope.loadWorkingHourTemplates().then(function(workingHourTemplates){
                    $scope.loadUserDetails().then(function(userDetails){
                        var countryId = ($scope.userDetails.CountryID) ? $scope.userDetails.CountryID : $scope.countryList[0].CountryID;
                        $scope.loadStates(countryId).then(function(stateList){
                            $scope.stateList = stateList;
                            var stateId = ($scope.userDetails.StateID) ? $scope.userDetails.StateID : $scope.stateList[0].StateID;
                            $scope.loadCities($scope.userDetails.StateID).then(function(cityList){
                                $scope.cityList = cityList;
                                $scope.loadSecondaryLocations().then(function(){

                                    $scope.dataProgressLoader.dataLoadInProgress = false;
                                    $scope.dataProgressLoader.dataLoadError = false;
                                    $scope.dataProgressLoader.dataLoadComplete = true;
                                    $scope.$emit('$preLoaderStop');

                                    setZeroLatLngToCurrentLocation();



                                },function(){
                                    $scope.dataProgressLoader.dataLoadInProgress = false;
                                    $scope.dataProgressLoader.dataLoadError = true;
                                    $scope.dataProgressLoader.dataLoadComplete = false;
                                    $scope.$emit('$preLoaderStop');
                                });
                            },function(){
                                $scope.dataProgressLoader.dataLoadComplete = false;
                                $scope.dataProgressLoader.dataLoadInProgress = false;
                                $scope.dataProgressLoader.dataLoadError = true;
                                $scope.$emit('$preLoaderStop');
                            });
                        },function(){
                            $scope.dataProgressLoader.dataLoadComplete = false;
                            $scope.dataProgressLoader.dataLoadInProgress = false;
                            $scope.dataProgressLoader.dataLoadError = true;
                            $scope.$emit('$preLoaderStop');
                        });
                    },function(){
                        $scope.dataProgressLoader.dataLoadComplete = false;
                        $scope.dataProgressLoader.dataLoadInProgress = false;
                        $scope.dataProgressLoader.dataLoadError = true;
                        $scope.$emit('$preLoaderStop');
                    });
                },function(){
                    $scope.dataProgressLoader.dataLoadComplete = false;
                    $scope.dataProgressLoader.dataLoadInProgress = false;
                    $scope.dataProgressLoader.dataLoadError = true;
                    $scope.$emit('$preLoaderStop');
                });

            },function(){
                $scope.dataProgressLoader.dataLoadComplete = false;
                $scope.dataProgressLoader.dataLoadInProgress = false;
                $scope.dataProgressLoader.dataLoadError = true;
                $scope.$emit('$preLoaderStop');
            });
        };



        /**
         * Loads country list from server
         * @returns {promise|*}
         */
        $scope.loadCountries = function(){
            var promiseResolved = false;
            var defer = $q.defer();
            $http({
                url : GURL + 'ewmGetCountry',
                method : 'GET',
                params : {
                    LangID : 1
                }
            }).success(function(resp){
                    // ////console.log('Country List');
                    // ////console.log(JSON.stringify(resp));
                    promiseResolved = true;
                    if(resp && resp.length > 0 && resp !== 'null'){
                        $scope.countryList = resp;

                        defer.resolve(true);
                    }
                    else{
                        defer.resolve(false);
                    }
            }).error(function(err){
                promiseResolved = true;
                defer.reject(err);
            });

            $timeout(function(){
                if(!promiseResolved){
                    defer.reject();
                }
            },10000);

            return defer.promise;
        };

        /**
         * Loads list of Secondary Locations from server
         * @returns {promise|*}
         */
        $scope.loadSecondaryLocations = function(){
            var promiseResolved = false;
            var defer = $q.defer();
            $http({
                url : GURL + 'ewtGetSecondaryLoc',
                method : 'GET',
                params : {
                    Token : $rootScope._userInfo.Token
                }
            }).success(function(resp){
                    // ////console.log('Secondary Location List');
                    // ////console.log(JSON.stringify(resp));
                    promiseResolved = true;
                    if(resp && resp.length > 0 && resp !== 'null'){
                        for(var i = 0; i < resp.length; i++){
                            $scope.locationsToggleIndex[i+1] = {
                                viewMode : false,
                                editMode : false,
                                isMapInitialized: false,
                                savedOnServer : true,
                                removeProgress : false,
                                saveProgress : false
                            };
                        }
                        $scope.secondaryLocations = resp;
                        defer.resolve(true);
                    }
                    else{
                        defer.resolve(false);
                    }
            }).error(function(err){
                promiseResolved = true;
                defer.reject(err);
            });
            $timeout(function(){
                if(!promiseResolved){
                    defer.reject();
                }
            },10000);
            return defer.promise;
        };


        /**
         * Load States based on Country
         * @param countryId
         * @returns {promise|*}
         */
        $scope.loadStates = function(countryId){
            var promiseResolved = false;
            var defer = $q.defer();
            $http({
                url : GURL + 'ewmGetState',
                method : 'GET',
                params : {
                    LangID : 1,
                    CountryID : countryId
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
                    promiseResolved = true;
                    defer.reject(err);
                });
            $timeout(function(){
                if(!promiseResolved){
                    defer.reject();
                }
            },10000);
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
                if(resp && resp.length > 0 && resp !== 'null'){
                    $scope.workingHoursTemplateMap = resp;
                    for(var i in resp){
                        $scope.workingHoursTemplates[resp[i].TID] = resp[i].TemplateName;
                    }
                    defer.resolve(resp);

                }
                    else{
                    defer.resolve([]);
                }
            }).error(function(err){
                defer.reject();
            });
            return defer.promise;
        };


        $scope.loadWorkingHourTemplates().then(function(){
            $scope.$emit('$preLoaderStart');
            $scope.dataReloadAgain();
        },function(){
            $scope.$emit('$preLoaderStop');
        });



}]);
