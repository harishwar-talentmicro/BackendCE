angular.module('ezeidApp').controller('ModuleSettingsCtrl',['$q','$scope','$interval','$http','Notification','$rootScope','$filter',function($q,$scope,$interval,$http,Notification,$rootScope,$filter){
    $scope.inactiveBrochureImage = 'images/brochure-absent.png';
    $scope.activeBrochureImage = 'images/brochure-present.png';
    $scope.brochureImage = 'images/brochure-present.png';
    /**
     * Data Refresh Interval List
     * (Automatic Generation)
     */
    $scope.refreshIntervalList = [];
    for(var i = 1; i < 1441; i++){
        $scope.refreshIntervalList.push(i);
    }


    /**
     * Access Rights mapping
     * @type {Array}
     */
    $scope.accessRights = [
        {value : 0, title : 'Hidden'},   //0
        {value : 1, title : 'Read Only'},    //1
        {value : 2, title : 'Read, Create and Update'}, //2
        {value : 3, title : 'Read, Create, Update and Delete'}, //3
        {value : 4, title : 'Read and Update'},  //4
        {value : 5, title : 'Read, Update and Delete'}   //5
    ];

    /**
     * Item List Types
     * Format to display items to end users (Sales and Home Delivery Items)
     * @type {Array}
     */
    $scope.itemListTypes = [
        {value : 0, title : 'Message Only'},   //0
        {value : 1, title : 'Item Only'},    //1
        {value : 2, title : 'Item and Picture'}, //2
        {value : 3, title : 'Item, Picture and Quantity'}, //3
        {value : 4, title : 'Item, Picture, Quantity and Rate'}  //4
    ];

    $scope.reservationDisplayFormat = [
        {value : 0, title : 'Hours (30 min slots)'},   //0
        {value : 1, title : 'Days'},    //1
        {value : 2, title : 'Months'} //2
    ];

    /**
     * Business Settings Variables from service
     * @type {{categories: Array}}
     */
    $scope.business = {
        categories : []
    };

    /**
     * Basic Modal Declaration
     * @type {{sales: {title: string, accessRight: number}, reservation: {title: string, accessRights: number}, homeDelivery: {title: string, accessRights: number}, service: {title: string, accessRights: number}, resume: {title: string, accessRights: number}}}
     */
    $scope.settings = {
        sales : {
            title : '',
            defaultFormMsg : '',
            accessRight : 0,
            itemListType : 0       // 0: Message, 1: Item, 2: Item+picture, 3: Item+picture+quantity, 4: Item + picture + quantity + rate

        },
        reservation : {
            title : '',
            defaultFormMsg : '',
            accessRight : 0,
            displayFormat : 0 // 0 : Hours (30 min slot), 1 : Days, 2 : Months
        },
        homeDelivery : {
            title : '',
            defaultFormMsg : '',
            accessRight : 0,
            itemListType : 1

        },
        service : {
            title : '',
            defaultFormMsg : '',
            accessRight : 0,
            itemListType : 1

        },
        resume : {
            title : '',
            defaultFormMsg : '',
            accessRight : 0,
            itemListType : 1,    //Hardcoded, will always be an item only
            keywords : ""
        },

        business : {
            dataRefreshInterval : 5,
            brochureFileName : "",
            brochureMimeType : "",
            brochureFileData : "",
            keywords : "",
            category : null
        }
    };


    $scope.loadSettings = function(){
        //@todo Load business settings from _userInfo
    };

    $scope.saveSettings = function(){
        console.log($scope.settings);
        //@todo call service to save settings
    };

    $scope.uploadBrochure = function(){
        //@todo Write code for brochure upload
    };


    $scope.selectBrochure = function(){
        $("#brochure-file-upload").trigger('click');
    };

    $scope.loadCategories = function(){
        $http({
            url : '/ewmGetCategory',
            method : "GET",
            params : {
                LangID : 1
            }
        }).success(function(resp){
                if(resp && resp.length>0){
                    $scope.business.categories = resp;
                }
            }).error(function(err){

            });
    };

    $scope.loadCategories();

    //@todo write method for brochure base64 conversion and upload option( in HTML view also)
    //@todo Separate call is present for File upload(already separate API Service is present for file upload)


}]);