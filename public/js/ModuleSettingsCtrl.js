angular.module('ezeidApp').controller('ModuleSettingsCtrl',['$q','$scope','$interval','$http','Notification','$rootScope','$filter',function($q,$scope,$interval,$http,Notification,$rootScope,$filter){
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
            accessRight : 0,
            itemListType : 0       // 0: Message, 1: Item, 2: Item+picture, 3: Item+picture+quantity, 4: Item + picture + quantity + rate

        },
        reservation : {
            title : '',
            accessRight : 0,
            displayFormat : 0 // 0 : Hours (30 min slot), 1 : Days, 2 : Months
        },
        homeDelivery : {
            title : '',
            accessRight : 0,
            itemListType : 1

        },
        service : {
            title : '',
            accessRight : 0,
            itemListType : 1

        },
        resume : {
            title : '',
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


    //@todo write method for brochure base64 conversion and upload option( in HTML view also)
    //@todo Separate call is present for File upload(already separate API Service is present for file upload)


}]);