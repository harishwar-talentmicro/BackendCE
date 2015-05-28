/**
 * Created by admin on 6/3/15.
 *
 * @todo Incomplete
 */
angular.module('ezeidApp').controller('RulesCtrl',['$scope','$interval','$http','Notification',
    '$rootScope','$filter','$timeout','MsgDelay','GURL','$q',
    function($scope,$interval,$http,Notification,$rootScope,$filter,$timeout,MsgDelay,GURL,$q){


        $scope.selectedTab = 1;

        $scope.showModal = false;
        $scope.masterUser = null;
        $scope.rules = [];

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

        $scope.ruleTypes = [
            'Area name based match',
            'Proximity based match',
            'EZEID\'s linked'
        ];


        var prepareEditModeData = function(data){
            var rule = {
                TID: 14,
                MasterID: ($scope.masterUser)? $scope.masterUser.MasterID : 0 ,
                FolderTitle: data.FolderTitle,
                RuleFunction: $scope.selectedTab - 1;
                RuleType: data.RuleType
                CountryIDs: ""
                MatchAdminLevel: 1
                MappedNames: ""
                Latitude: 21
                Longitude: 34
                Proximity: 1000
                DefaultFolder: 0
                FolderStatus: 1
                SeqNoFrefix: "r1"
                RunningSeqNo: 19
                CreatedDate: null
                LUDate: null
            };
        };

        $scope.toggleModalBox = function(ruleId){
            $scope.resetModalData();
        };



        $scope.modalBox = {
            title : 'Add New Rule',
            editMode : false,
            rule : {
                TID : 0 ,
                MasterID : ($scope.masterUser)? $scope.masterUser.MasterID : 0 ,
                FolderTitle : '' ,
                RuleFunction : $scope.selectedTab ,
                RuleType : 0 ,
                CountryID : 0 ,
                MatchAdminLevel : 0 ,
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
                rule : {
                    TID : 0 ,
                    MasterID : ($scope.masterUser)? $scope.masterUser.MasterID : 0 ,
                    FolderTitle : '' ,
                    RuleFunction : $scope.selectedTab ,
                    RuleType : 0 ,
                    CountryID : 0 ,
                    MatchAdminLevel : 0 ,
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
