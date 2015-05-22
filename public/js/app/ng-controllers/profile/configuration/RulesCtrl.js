/**
 * Created by admin on 6/3/15.
 *
 * @todo Incomplete
 */
angular.module('ezeidApp').controller('RulesCtrl',['$scope','$interval','$http','Notification','$rootScope','$filter','$timeout','MsgDelay','GURL',function($scope,$interval,$http,Notification,$rootScope,$filter,$timeout,MsgDelay,GURL){
    //Initially First Tab is selected
    $scope.selectedTab = 1;

    /***
     * Master User Details
     * @type {null}
     */
    $scope.masterUser = null;

    /**
     * Country List
     * @type {Array}
     */
    $scope.countryList = [
    /**
     * Eg.
     * { title : 'India', value : 'IN'}
     */
    ];

    //Open Modal box for user
    $scope.isMapInitialized = false;
    $scope.showModal = false;

    // Rule Function types (functionTypes) available to the system
    $scope.ruleFunctionTypes = [
        'Sales',
        'Reservation',
        'Home Delivery',
        'Service',
        'Resume'
    ];

    // Rule Types (Area names based on match, proximity based, EZEID's linked)
    $scope.ruleTypes = [
        'Area name based match',
        'Proximity based match',
        'EZEID\'s linked'
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

    /**
     * Modal Box models and properties
     * @type {{title: string, rule: {ruleId: number, folderTitle: string, ruleFunction: number, ruleType: Array, country: string, matchAdminLevel: number, mappedNames: Array, latitude: number, longitude: number, proximity: number, status: number}}}
     */
    $scope.modalBox = {
        title : 'Add new Rule',
        rule : {
            ruleId : 0,         // TID of particular rule
            folderTitle : "",
            ruleFunction : 0,   // By default, selected rule will be for sales
            ruleType : 0,       // By default Rule Type : Area Names based on match
            country : "",
            matchAdminLevel : 0,
            mappedNames : [],
            coordinates : {
              latitude : 50.00,
              longitude : 25.00
            },
            proximity : 0,
            status : 1,
            prefix : ''//By default, status is Active (1 is Inactive, 2 is Active)
        }
    };

    /**
     * Container for all rules
     * @type {Array}
     */
    $scope.rules = [];


    /**
     * Getting Master User Details
     * Then calling loadRules Function to load all statuses
     */
    $scope.getMasterUserDetails = function(){
        $http({
            url : GURL + 'ewtGetUserDetails',
            method : "GET",
            params :{
                Token : $rootScope._userInfo.Token
            }
        }).success(function(resp){
                if(resp.length>0){
                    $scope.masterUser = resp[0];
                }
            }).error(function(err){
                Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
            });

    };

    $scope.loadRules = function(){
        $http({
            url : GURL + 'ewtGetUserwiseFolderList',
            method : 'GET',
            params : {
                Token : $rootScope._userInfo.Token,
                RuleFunction : $scope.modalBox.ruleFunctionType
            }
        }).success(function(resp){
            if(resp && resp !== 'null' && resp.length > 0){
                $scope.rules = resp;
            }
        }).error(function(err){
            Notification.error({ message : 'Error occured while loading rules'});
        });
    };

    $scope.getMasterUserDetails();


    /**
     * Finds and displays current location of user on map
     */
    $scope.findCurrentLocation = function(){

    };

    var prepareSaveRuleData = function(){
        var ruleData = {
            Token : $rootScope._userInfo.Token ,
            TID : $scope.modalBox.rule.ruleId ,
            MasterID : $scope.masterUser.MasterID ,
            FolderTitle : $scope.modalBox.rule.folderTitle ,
            RuleFunction : $scope.selectedTab ,
            RuleType : $scope.modalBox.rule.ruleType ,
            CountryID : $scope.modalBox.rule.country ,
            MatchAdminLevel : $scope.modalBox.rule.matchAdminLevel ,
            MappedNames : $scope.modalBox.rule.mappedNames.join(',') ,
            Latitude : $scope.modalBox.rule.coordinates.latitude ,
            Longitude : $scope.modalBox.rule.coordinates.longitude ,
            Proximity : $scope.modalBox.rule.proximity ,
            DefaultFolder : 0 ,
            FolderStatus : $scope.modalBox.rule.status ,
            SeqNoFrefix : $scope.modalBox.rule.prefix
        };
        return ruleData;
    };

    $scope.error = {
        ruleType : false,
        folderTitle : false,
        countryId : false,
        matchAdminLevel : false,
        mappedNames : false,
        proximity : false,
        prefix : false
    }

    var validateSaveRuleData = function(rule){
        var flag = true;
        if(!rule.ruleType){
            $scope.error.ruleType = true;
            flag *= false;
        }
        if(!rule.folderTitle){
            $scope.error.ruleType = true;
            flag *= false;
        }

        if(!rule.countryId){
            $scope.error.countryId = true;
            flag *= false;
        }

        if(rule.mappedNames.length < 1){
            $scope.error.mappedNames = true;
            flag *= false;
        }

        if(!rule.proximity){
            $scope.error.proximity = true;
            flag *= false;

        }

        if(!rule.prefix){
            $scope.error.prefix = true;
            flag *= false;

        }

        return flag;

    };

    $scope.saveRule = function(){
        if(!validateSaveRuleData($scope.modalBox.rule)){
            Notification.error({ message : 'Please check all the details properly', delay : MsgDelay});
            return;
        }

        var ruleData = prepareSaveRuleData();

        $http({
            url : 'ewmSaveFolderRules',
            method : "POST",
            data : ruleData
        }).success(function(resp){
            //console.log(resp);
        }).error(function(err){
            Notification.error({ message : 'An error occurred while adding rule', delay : MsgDelay});
        });
    };

}]);
