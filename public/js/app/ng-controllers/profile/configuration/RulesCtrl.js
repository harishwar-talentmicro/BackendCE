/**
 * Created by admin on 6/3/15.
 *
 * @todo Incomplete
 */
angular.module('ezeidApp').controller('RulesCtrl',['$scope','$interval','$http','Notification',
    '$rootScope','$filter','$timeout','MsgDelay','GURL','$q','GoogleMaps',
    function($scope,$interval,$http,Notification,$rootScope,$filter,$timeout,MsgDelay,GURL,$q,GoogleMap){

        String.prototype.capitalizeFirstLetter = function() {
            return this.charAt(0).toUpperCase() + this.slice(1);
        };

        $scope.selectedTab = 1;

        $scope.showModal = false;
        $scope.masterUser = null;
        $scope.rules = [];
        $scope.ruleFunctionTypes = [
            'Sales',
            'Reservation',
            'Home Delivery',
            'Help Desk',
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

            //$scope.$digest();

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
                ////console.log(ex);
                Notification.error({ message : 'Error loading google maps', delay : MsgDelay});
            }
        };






        var prepareEditModeData = function(data){
            var rule = {
                TID: data.TID,
                MasterID: ($scope.masterUser)? $scope.masterUser.MasterID : 0 ,
                FolderTitle: data.FolderTitle,
                RuleFunction: $scope.selectedTab - 1,
                RuleType: data.RuleType,
                CountryID: data.CountryIDs,
                MatchAdminLevel: data.MatchAdminLevel,
                MappedNames: (data.MappedNames.length > 0) ?
                    ((data.MappedNames.split(',').length > 0) ? data.MappedNames.split(',') : [data.MappedNames]) : '',
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
                        $scope.changeLatLng($scope.modalBox.rule.Latitude,$scope.modalBox.rule.Longitude);
                    });
                },1000);
            }
            else{
                if(destroy){
                    destroy();
                }
            }
        });

        $scope.$watch('modalBox.rule.RuleType',function(newVal,oldVal){
            if(newVal !== oldVal){
                $scope.modalBox.tempMappedName = '';
                $scope.modalBox.rule.MappedNames = [];
            }
        });


        $scope.addMappedEzeid = function(){
            if(!$scope.modalBox.tempMappedName){
                ////console.log('return false');
                return false;
            }

            $scope.modalBox.tempMappedName = $scope.modalBox.tempMappedName.toUpperCase();
            $scope.modalBox.tempMappedName = $scope.modalBox.tempMappedName.replace(' ','');
            var tempIds = $scope.modalBox.tempMappedName.split(',');
            if(tempIds.length > 0){
                for(var x = 0; x < tempIds.length; x++){
                    if($scope.modalBox.rule.MappedNames.indexOf(tempIds[x])=== -1){
                        $scope.modalBox.rule.MappedNames.push(tempIds[x]);
                    }
                }
            }

        };

        $scope.$watch('modalBox.rule.RuleType',function(newVal){
            if(newVal == 2){
                $scope.modalBox.tempMappedName = '';
            }
        });
        /**
         * Add $scope.modalBox.tempMappedName to MappedNames model in $scope.modalBox
         * so that multiple countries, states, cities and areas can be mapped into one rule easily
         */
        $scope.addMappedName = function(){
            if(!$scope.modalBox.tempMappedName){
                ////console.log('return false');
                return false;
            }
            var currentMappedNames = ($scope.modalBox.rule.MappedNames) ? $scope.modalBox.rule.MappedNames : '';
            if(currentMappedNames && currentMappedNames.length > 0){
                var mappedNames = (currentMappedNames.length > 0) ? currentMappedNames : [currentMappedNames];
                if(mappedNames.indexOf($scope.modalBox.tempMappedName) == -1){
                    mappedNames.push($scope.modalBox.tempMappedName);
                    $scope.modalBox.rule.MappedNames = mappedNames;
                    $scope.modalBox.tempMappedName = '';
                }
                else{
                    Notification.error({ message : 'This area is already mapped', delay : MsgDelay});
                }

            }
            else{
                $scope.modalBox.rule.MappedNames = [$scope.modalBox.tempMappedName];
                $scope.modalBox.tempMappedName = '';
            }
        };

        $scope.removeMappedName =   function(index){
            $scope.modalBox.rule.MappedNames.splice(index,1);
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
        $scope.loadRule = function(functionCount){
            var defer = $q.defer();

            $http({
                url : GURL + 'ewtGetUserwiseFolderList',
                method : 'GET',
                params : {
                    Token : $rootScope._userInfo.Token,
                    RuleFunction : functionCount
                }
            }).success(function(resp){
                if(resp && resp !== 'null' && resp.length > 0){
                    ////console.log(resp);
                    $scope.rules = $scope.rules.concat(resp);
                }
                defer.resolve();

            }).error(function(err){
                defer.resolve();
            });
            return defer.promise;
        };


        $scope.loadAllRules = function(){
            var defer = $q.defer();

            var sLoad = false;
            var rLoad = false;
            var hdLoad = false;
            var svLoad = false;
            var rsLoad = false;

            var checkLoad = function(){
                if(sLoad && rLoad && hdLoad && svLoad && rsLoad){
                    defer.resolve();
                }
            };

            $scope.loadRule(functionCount).then(function(){
                sLoad = true;
                checkLoad();
            });
            $scope.loadRule(functionCount+1).then(function(){
                rLoad = true;
                checkLoad();
            });
            $scope.loadRule(functionCount+2).then(function(){
                hdLoad = true;
                checkLoad();
            });
            $scope.loadRule(functionCount+3).then(function(){
                svLoad = true;
                checkLoad();
            });
            $scope.loadRule(functionCount+4).then(function(){
                rsLoad = true;
                checkLoad();
            });

            return defer.promise;
        };
        /**
         * Validates rule data while saving
         * @returns {boolean}
         */
        var validateSaveRuleData = function(){
            /**
             * @todo
             * Validations Required before saving rules
             */
            var error = [];
            if(!$scope.modalBox.rule.FolderTitle){
                error.push('folder title');
            }
            if(!$scope.modalBox.rule.CountryID){
                error.push('country');
            }

            if(!$scope.modalBox.rule.SeqNoFrefix){
                error.push('prefix');
            }

            if($scope.modalBox.rule.RuleType === ''){
                error.push('rule type');
            }

            if(!$scope.modalBox.rule.FolderStatus){
                error.push('rule status');
            }

            if($scope.modalBox.rule.RuleType !== 1){
                if($scope.modalBox.rule.MappedNames.length < 1){
                    error.push('mapped names');
                }
            }

            if($scope.modalBox.rule.RuleType == 1){
                if($scope.modalBox.rule.Proximity){
                    error.push('proximity');
                }
            }


            if(error.length > 0){
                var msg = error.join(',').capitalizeFirstLetter() + ' cannot be empty';
                Notification.error({ message : msg, delay : MsgDelay});
                return false;
            }
            else{
                return true;
            }
        };

        $scope.saveRule = function(){
            if(!validateSaveRuleData()){
                return;
            }


            var ruleData = angular.copy($scope.modalBox.rule);
            ruleData.MappedNames = ruleData.MappedNames.join(',');
            ruleData.Token = $rootScope._userInfo.Token;

            $scope.$emit('$preLoaderStart');
            $http({
                url : 'ewmSaveFolderRules',
                method : "POST",
                data :ruleData
            }).success(function(resp){
                if(resp && resp !== 'null'){
                    if(resp.IsSuccessfull){
                        $scope.loadAllRules().then(function(){
                            $scope.$emit('$preLoaderStop');
                        },function(){
                            $scope.$emit('$preLoaderStop');
                        });
                        Notification.success({ message : 'Rule added successfully', delay : MsgDelay});
                        $scope.toggleModalBox();
                    }
                    else{
                        $scope.$emit('$preLoaderStop');
                        Notification.error({ message : 'An error occurred while adding rule', delay : MsgDelay});
                    }
                }
                else{
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message : 'An error occurred while adding rule', delay : MsgDelay});
                }

            }).error(function(err){
                $scope.$emit('$preLoaderStop');
                Notification.error({ message : 'An error occurred while adding rule', delay : MsgDelay});
            });
        };


        $scope.$emit('$preLoaderStart');
        $scope.loadCountries().then(function(){
            $scope.loadAllRules().then(function(){
                $scope.$emit('$preLoaderStop');
            },function(){
                $scope.$emit('$preLoaderStop');
            });
        },function(){
            $scope.$emit('$preLoaderStop');
        });




    }]);


