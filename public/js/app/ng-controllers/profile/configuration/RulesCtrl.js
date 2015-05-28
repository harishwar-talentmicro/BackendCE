/**
 * Created by admin on 6/3/15.
 *
 * @todo Incomplete
 */
angular.module('ezeidApp').controller('RulesCtrl',['$scope','$interval','$http','Notification',
    '$rootScope','$filter','$timeout','MsgDelay','GURL','$q','GoogleMaps',
    function($scope,$interval,$http,Notification,$rootScope,$filter,$timeout,MsgDelay,GURL,$q,GoogleMap){


        $scope.selectedTab = 1;

        $scope.showModal = false;
        $scope.masterUser = null;
        $scope.rules = [];
        $scope.ruleFunctionTypes = [
            'Sales',
            'Reservation',
            'Home Delivery',
            'Service',
            'Resume'
        ];

        $scope.matchAdminLevels = [
//        'Do not search Admin Areas and take decision on CountryIDs itself',
//        'Search & match based on Administrate_area_level_1 of google maps and the area name should be one among the AdminLevelNames that are comma separated',
//        'Search & match based on Administrate_area_level_2 of google maps and the area name should be one among the AdminLevelNames that are comma separated',
//        'Search & match based on Administrate_area_level_3 of google maps and the area name should be one among the MappedNames that are comma separated'
            'Match based on Admin Level 0 (Country)',
            'Match based on Admin Level 1 (State)',
            'Match based on Admin Level 2 (City)',
            'Match based on Admin Level 3 (Area)'
        ];

        $scope.matchAdminLevelMappedName = [
            'country',
            'state',
            'city',
            'area'
        ];

        $scope.ruleTypes = [
            'Area name based match',
            'Proximity based match',
            'EZEID\'s linked'
        ];



        var googleMap = null;
        var isMapInitialized = false;


        $scope.changeLatLng = function(lat,lng){
            $scope.modalBox.rule.Latitude = lat;
            $scope.modalBox.rule.Longitude = lng;
            $scope.$digest();

            $timeout(function(){
                if(googleMap){
                    googleMap.getReverseGeolocation(lat,lng).then(function(resp){
                        if(resp.data){
                            var geoData = googleMap.parseReverseGeolocationData(resp.data);
                            $scope.modalBox.tempMappedName = geoData[$scope.matchAdminLevelMappedName[$scope.modalBox.rule.MatchAdminLevel]];
                        }
                        else{
                            $scope.modalBox.tempMappedName = '';
                            Notification.error({ message : 'Unable to detect location details',delay : MsgDelay});
                        }
                    },function(){
                        $scope.modalBox.tempMappedName = '';
                        Notification.error({ message : 'Unable to detect location details',delay : MsgDelay});
                    });
                }
            },500);
        };

        var createRuleMap = function(){
            try{
                if(!isMapInitialized){
                    isMapInitialized = true;
                    googleMap = new GoogleMap();
                    googleMap.getCurrentLocation().then(function(){
                        googleMap.createMap('conf-rules-map-container',$scope,'findCurrentLocation()');
                        googleMap.renderMap();
                        googleMap.mapIdleListener().then(function() {
                            googleMap.pushMapControls($scope.changeLatLng);
                            googleMap.listenOnMapControls($scope.changeLatLng, $scope.changeLatLng);
                            googleMap.placeCurrentLocationMarker($scope.changeLatLng,$scope.changeLatLng,true);
                            //googleMap.resizeMap();
                        });
                    },function(){
                        googleMap.createMap('conf-rules-map-container',$scope,'findCurrentLocation()');
                        googleMap.renderMap();
                        googleMap.mapIdleListener().then(function() {
                            googleMap.pushMapControls($scope.changeLatLng);
                            googleMap.listenOnMapControls($scope.changeLatLng, $scope.changeLatLng);
                            googleMap.placeCurrentLocationMarker($scope.changeLatLng,$scope.changeLatLng,true);
                            //googleMap.resizeMap();
                        });
                    });

                }
                else{
                    googleMap.resizeMap();
                }
            }
            catch(ex){
                console.log(ex);
                Notification.error({ message : 'Error loading google maps', delay : MsgDelay});
            }
        };






        var prepareEditModeData = function(data){
            var rule = {
                TID: 14,
                MasterID: ($scope.masterUser)? $scope.masterUser.MasterID : 0 ,
                FolderTitle: data.FolderTitle,
                RuleFunction: $scope.selectedTab - 1,
                RuleType: data.RuleType,
                CountryID: data.CountryIDs,
                MatchAdminLevel: data.MatchAdminLevel,
                MappedNames: data.MappedNames,
                Latitude: data.Latitude,
                Longitude: data.Longitude,
                Proximity: data.Proximity,
                DefaultFolder: data.DefaultFolder,
                FolderStatus: data.FolderStatus,
                SeqNoFrefix: data.SeqNoFreFix
            };
            return rule;
        };

        $scope.toggleModalBox = function(ruleId){
            $scope.resetModalData();
            if(ruleId){
                var index = $scope.rules.indexOfWhere('TID',ruleId);
                if(index !== -1){
                    $scope.modalBox.rule = prepareEditModeData($scope.rules[index]);
                    $scope.modalBox.ediMode  = true;
                    $scope.modalBox.title  = 'Edit Rule';
                }
            }
            $scope.showModal = true;
            $timeout(function(){
                createRuleMap();
            },2000);
        };

        /**
         * Adding a watcher on showModal to remove MappedNames in case MatchAdminLevel changes
         */
        $scope.$watch('showModal',function(newVal){
            var destroy = null;
            if(newVal){
                $timeout(function(){
                    /**
                     * On change of MatchAdminLevel clear the mappedNames
                     */
                    destroy = $scope.$watch('modalBox.rule.MatchAdminLevel',function(){
                        $scope.modalBox.rule.MappedNames = '';
                    });
                },1000);
            }
            else{
                if(destroy){
                    destroy();
                }
            }
        });


        /**
         * Add $scope.modalBox.tempMappedName to MappedNames model in $scope.modalBox
         * so that multiple countries, states, cities and areas can be mapped into one rule easily
         */
        $scope.addMappedName = function(){
            if(!$scope.tempMappedName){
                return false;
            }
            var currentMappedNames = ($scope.modalBox.rule.MappedNames) ? $scope.modalBox.rule.MappedNames : '';
            if(currentMappedNames && currentMappedNames.length > 0){
                var mappedNames = currentMappedNames.split(',');
                mappedNames.push($scope.modalBox.tempMappedName);
                $scope.modalBox.rule.MappedNames = mappedNames.join(',');
                $scope.modalBox.tempMappedName = '';
            }
            else{
                $scope.modalBox.rule.MappedNames = $scope.modalBox.tempMappedName;
                $scope.modalBox.tempMappedName = '';
            }
        };



        $scope.modalBox = {
            title : 'Add New Rule',
            editMode : false,
            tempMappedName : '',
            rule : {
                TID : 0 ,
                MasterID : ($scope.masterUser)? $scope.masterUser.MasterID : 0 ,
                FolderTitle : '' ,
                RuleFunction : $scope.selectedTab - 1 ,
                RuleType : 0,
                CountryID : 0,
                MatchAdminLevel : 0,
                MappedNames : '' ,
                Latitude : 0 ,
                Longitude : 0 ,
                Proximity : 0 ,
                DefaultFolder : 0 ,
                FolderStatus : 1 ,
                SeqNoFrefix : ''
            }
        };

        $scope.resetModalData = function(){
            $scope.modalBox = {
                title : 'Add New Rule',
                editMode : false,
                tempMappedName : '',
                rule : {
                    TID : 0 ,
                    MasterID : ($scope.masterUser)? $scope.masterUser.MasterID : 0 ,
                    FolderTitle : '' ,
                    RuleFunction : $scope.selectedTab - 1 ,
                    RuleType : 0,
                    CountryID : 0,
                    MatchAdminLevel : 0,
                    MappedNames : '' ,
                    Latitude : 0 ,
                    Longitude : 0 ,
                    Proximity : 0 ,
                    DefaultFolder : 0 ,
                    FolderStatus : 1 ,
                    SeqNoFrefix : ''
                }
            };
        };


        /**
         * Getting Master User Details
         * Then calling loadRules Function to load all statuses
         */
        $scope.getMasterUserDetails = function(){
            var defer = $q.defer();

            $http({
                url : GURL + 'ewtGetUserDetails',
                method : "GET",
                params :{
                    Token : $rootScope._userInfo.Token
                }
            }).success(function(resp){
                if(resp && resp.length>0 && resp !== null){
                    $scope.masterUser = resp[0];
                    defer.resolve(resp[0]);
                }
                else{
                    defer.resolve();
                }
            }).error(function(err){
                defer.reject();
                Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
            });

            return defer.promise;
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
                if(resp && resp.length > 0 && resp !== 'null'){
                    $scope.countryList = resp;

                    defer.resolve(resp);
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
         * Function Type count for rules
         * @type {number}
         */
        var functionCount = 0;

        /**
         * Loads all Rules from server
         */
        $scope.loadAllRules = function(){
            var defer = $q.defer();
            $http({
                url : GURL + 'ewtGetUserwiseFolderList',
                method : 'GET',
                params : {
                    Token : $rootScope._userInfo.Token,
                    RuleFunction : functionCount
                }
            }).success(function(resp){
                if(functionCount = 0){
                    $scope.rules = [];
                }
                if(resp && resp !== 'null' && resp.length > 0){
                    $scope.rules.concat(resp);
                }
                if(functionCount > 4){
                    functionCount = 0;
                    defer.resolve();
                }
                else{
                    functionCount++;
                    $scope.loadAllRules();
                }
            }).error(function(err){
                if(functionCount > 4){
                    functionCount = 0;
                    defer.resolve();
                }
                else{
                    functionCount++;
                    $scope.loadAllRules();

                }
            });
        };





    }]);
