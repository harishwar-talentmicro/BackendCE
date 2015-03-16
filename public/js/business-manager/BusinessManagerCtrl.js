/**
 * BusinessManagerCtrl
 * @desc BusinessManager Master Controller : Controls selection of manager based on settings
 */
angular.module('ezeidApp').controller('BusinessManagerCtrl',['$scope','$rootScope','MsgDelay','GURL','$http','$interval','Notification',function($scope,$rootScope,MsgDelay,GURL,$http,$interval,Notification){

    /**
     * List of Modules
     * title : User Custom Title
     * enabled : User enabled from settings or not
     * listType : List Type selected for each module in setttings
     * @type {Array}
     */

    /**
     * Module (Prototype)
     * @param type => (Integer) 0: Sales, 1 : Reservation, 2 : Home Delivery, 3 : Service, 4 : Resume
     * @param title => (String) Custom Title given by user
     * @param enabled => Boolean
     * @param listType => (Integer) 0 : Only Message, 1 : Item Only , 2 : Item+Picture, 3 : Item+Picture+Qty, 4 : Item+Picture+Qty+Rate
     * @param userAccess => (Integer) 0 : Hidden, 1: Read Only, 2 : Read+Create+Update, 3 : Read+Create+Update+Delete, 4 : Read+Update, 5:  Read+Update+Delete
     * @constructor
     */
    function Module(type,title,enabled,listType,userAccess){
        if(typeof(type) == "undefined" ||
            typeof(title) == "undefined" ||
            typeof(enabled) == "undefined" ||
            typeof(listType) == "undefined" || typeof(userAccess) == "undefined")
        {
            console.log("Module object creation unsuccessful ! Missing parameters");
        }
            this.type = type,
            this.title = (title) ? title : 'No title',
            this.enabled = (enabled) ? true : false;
            this.listType = (listType == 0 || listType == 1 || listType == 2 || listType == 3 || listType == 4) ? listType : 0;
            this.userAccess = 0
    }




    $scope.modules = [];

    $scope.activeModule = null;
    $scope.selectActive = function(moduleType){

    };

    /**
     * Load master(company) configuration set for this user and create module objects
     * Only make module objects for those modules which are accessible to him and are enabled for this user
     */
    $scope.loadConfig = function(){
        console.log($rootScope._userInfo);
    };

    /**
     * Load settings from server for particular business user
     */
    $scope.loadSettings = function(){
        $http({
            url : GURL + 'ewtGetConfig',
            method : "GET",
            params : {
                Token : $rootScope._userInfo.Token
            }
        }).success(function(resp){
                if(resp && resp.length > 0){

                    var moduleVisibilities = resp[0].VisibleModules.split("");
                    var userAccessRights = resp[0].
                    if(moduleVisibilities[0] === 1){
                        var salesModule = new Module(0,resp[0].SalesTitle,true,resp[0].SalesItemListType,0);
                    }
                    if(moduleVisibilities[1] === 1){
                        var salesModule = new Module(0,resp[0].ReservationTitle,true,resp[0].ReservationDisplayFormat,0);
                    }

                    if(moduleVisibilities[2] === 1){
                        var salesModule = new Module(0,resp[0].HomeDeliveryTitle,true,resp[0].HomeDeliveryItemListType,0);
                    }

                    if(moduleVisibilities[3] === 1){
                        var salesModule = new Module(0,resp[0].ServiceTitle,true,1,0);
                    }

                    if(moduleVisibilities[4] === 1){
                        var salesModule = new Module(0,resp[0].ResumeTitle,true,1,0);
                    }

                    $scope.settings.sales.title = resp[0].SalesTitle;
                    $scope.settings.sales.defaultFormMsg = resp[0].SalesFormMsg;
                    $scope.settings.sales.visibility = resp[0].VisibleModules.split("")[0];
                    $scope.settings.sales.itemListType = resp[0].SalesItemListType;


                    $scope.settings.reservation.title = resp[0].ReservationTitle;
                    $scope.settings.reservation.defaultFormMsg = resp[0].ReservationFormMsg;
                    $scope.settings.reservation.visibility = resp[0].VisibleModules.split("")[1];;
                    $scope.settings.reservation.displayFormat = resp[0].ReservationDisplayFormat;


                    $scope.settings.homeDelivery.title = resp[0].HomeDeliveryTitle;
                    $scope.settings.homeDelivery.defaultFormMsg = resp[0].HomeDeliveryFormMsg;
                    $scope.settings.homeDelivery.visibility = resp[0].VisibleModules.split("")[2];;
                    $scope.settings.homeDelivery.itemListType = resp[0].HomeDeliveryItemListType;

                    $scope.settings.service.title = resp[0].ServiceTitle;
                    $scope.settings.service.defaultFormMsg = resp[0].ServiceFormMsg;
                    $scope.settings.service.visibility= resp[0].VisibleModules.split("")[3];;


                    $scope.settings.resume.title = resp[0].ResumeTitle;
                    $scope.settings.resume.defaultFormMsg = resp[0].ResumeFormMsg;
                    $scope.settings.resume.visibility = resp[0].VisibleModules.split("")[4];;
                    $scope.settings.resume.keywords = resp[0].ResumeKeyword;



                    $scope.settings.business.dataRefreshInterval = resp[0].DataRefreshInterval;
                    $scope.settings.business.brochureFileName = resp[0].BrochureFileName;
                    $scope.settings.business.brochureMimeType= "";
                    $scope.settings.business.brochureFileData = "";
                    $scope.settings.business.keywords = "";
                    $scope.settings.business.category = resp[0].BusinessCategoryID;
                    $scope.settings.resume.freshersAccepted = (resp[0].FreshersAccepted === 1) ? true : false;
                }
                console.log(resp);
            }).error(function(err){
                console.log(err);
            });
    };

    $scope.loadConfig();

}]);