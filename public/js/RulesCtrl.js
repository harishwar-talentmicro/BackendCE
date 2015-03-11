/**
 * Created by admin on 6/3/15.
 */
angular.module('ezeidApp').controller('RulesCtrl',['$scope','$interval','$http','Notification','$rootScope','$filter',function($scope,$interval,$http,Notification,$rootScope,$filter){
    //Initially First Tab is selected
    $scope.selectedTab = 1;

    //Open Modal box for user
    $scope.showModal = false;

    $scope.openModalBox = function(event){
        //@todo Add facility to detect new addition or rule editing
        $scope.showModal = !$scope.showModal;
    };

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
        'Do not search Admin Areas and take decision on CountryIDs itself',
        'Search & match based on Administrate_area_level_1 of google maps and the area name should be one among the AdminLevelNames that are comma separated',
        'Search & match based on Administrate_area_level_2 of google maps and the area name should be one among the AdminLevelNames that are comma separated',
        'Search & match based on Administrate_area_level_3 of google maps and the area name should be one among the MappedNames that are comma separated'
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
            latitude : 0,
            longitude : 0,
            proximity : 0,
            status : 1          //By default, status is Active (1 is Inactive, 2 is Active)
        }
    };

    /**
     * Container for all rules
     * @type {Array}
     */
    $scope.rules = [];

    //@todo Add code for master user loading
    //@todo add code for rule addition and updation
    //@todo add code for viewing rule
    //@todo add code for map load
}]);