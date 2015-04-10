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
            $location
        ) {

        /**
         * Progress Status Flag for loading data initially
         * @type {boolean}
         */
        $scope.dataLoadInProgress = true;

        /**
         * Service Call Fails to load data then the flag sets to true
         * @type {boolean}
         */
        $scope.dataLoadError = false;

        /**
         * Service Call Completed to load data, then this flag set to true
         * @type {boolean}
         */
        $scope.dataLoadComplete = false;


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
         * UserDetails Model
         * @type {null}
         */
        $scope.userDetails = null;

        /**
         * Secondary Locations Available for this particular user
         * @type {Array}
         */
        $scope.secondaryLocations = [];


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
                savedOnServer : true
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

        /**
         * If user wants the data to be refreshed,
         * In case it will load data initially from server again
         */
        $scope.dataReloadAgain = function(){

            $scope.dataLoadError = false;
            $scope.dataLoadComplete = false;
            $scope.dataLoadInProgress = true;

            $scope.loadCountries().then(function(){
                $scope.loadUserDetails().then(function(){
                    var countryId = ($scope.userDetails.CountryID) ? $scope.userDetails.CountryID : $scope.countryList[0].CountryID;
                    $scope.loadStates(countryId).then(function(stateList){
                        $scope.stateList = stateList;
                        var stateId = ($scope.userDetails.StateID) ? $scope.userDetails.StateID : $scope.stateList[0].StateID;
                        $scope.loadCities($scope.userDetails.StateID).then(function(cityList){
                            $scope.cityList = cityList;
                            $scope.loadSecondaryLocations().then(function(){

                                $scope.dataLoadInProgress = false;
                                $scope.dataLoadError = false;
                                $scope.dataLoadComplete = true;
                            });
                        });
                    });
                });
            });
        };



        /**
         * Loads country list from server
         * @returns {promise|*}
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
                    console.log('Country List');
                    console.log(JSON.stringify(resp));
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

        /**
         * Loads user details initially
         * @returns {promise|*}
         */
        $scope.loadUserDetails = function(){
            var defer = $q.defer();
            $http({
                url : GURL + 'ewtGetUserDetails',
                method : 'GET',
                params : {
                    Token : $rootScope._userInfo.Token
                }
            }).success(function(resp){
                    console.log('User Details');
                    console.log(JSON.stringify(resp));
                    if(resp && resp.length > 0 && resp !== 'null'){
                        defer.resolve(true);
                        $scope.userDetails = resp[0];
                    }
                    else{
                        defer.resolve(false);
                    }
            }).error(function(err){
                defer.reject(err);
            });
            return defer.promise;
        };

        /**
         * Loads list of Secondary Locations from server
         * @returns {promise|*}
         */
        $scope.loadSecondaryLocations = function(){
            var defer = $q.defer();
            $http({
                url : GURL + 'ewtGetSecondaryLoc',
                method : 'GET',
                params : {
                    Token : $rootScope._userInfo.Token
                }
            }).success(function(resp){
                    console.log('Secondary Location List');
                    console.log(JSON.stringify(resp));
                    if(resp && resp.length > 0 && resp !== 'null'){
                        for(var i = 0; i < resp.length; i++){
                            $scope.locationsToggleIndex[i+1] = {
                                viewMode : false,
                                editMode : false,
                                isMapInitialized: false,
                                savedOnServer : true
                            };
                        }
                        $scope.secondaryLocations = resp;
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


        /**
         * Load States based on Country
         * @param countryId
         * @returns {promise|*}
         */
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
            var defer = $q.defer();
            $http({
                url : GURL + 'ewmGetCity',
                method : 'GET',
                params : {
                    LangID : 1,
                    StateID : stateId
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


        $scope.dataReloadAgain();

}]);
