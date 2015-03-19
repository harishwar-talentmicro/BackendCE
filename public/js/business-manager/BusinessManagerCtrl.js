/**
 * BusinessManagerCtrl
 * @desc BusinessManager Master Controller : Controls selection of manager based on settings
 */
angular.module('ezeidApp').controller('BusinessManagerCtrl',['$scope','$rootScope','MsgDelay','GURL','$http','$interval','Notification',function($scope,$rootScope,MsgDelay,GURL,$http,$interval,Notification){

    /**
     * Module (Prototype)
     * @param type => (Integer) 0: Sales, 1 : Reservation, 2 : Home Delivery, 3 : Service, 4 : Resume
     * @param title => (String) Custom Title given by user
     * @param enabled => Boolean
     * @param listType => (Integer) 0 : Only Message, 1 : Item Only , 2 : Item+Picture, 3 : Item+Picture+Qty, 4 : Item+Picture+Qty+Rate
     * @param userAccess => (Integer) 0 : Hidden, 1: Read Only, 2 : Read+Create+Update, 3 : Read+Create+Update+Delete, 4 : Read+Update, 5:  Read+Update+Delete
     * @constructor
     */
    function Module(type,title,enabled,listType,userAccess,defaultFormMsg){
        if(typeof(type) == "undefined" ||
            typeof(title) == "undefined" ||
            typeof(enabled) == "undefined" ||
            typeof(listType) == "undefined" || typeof(userAccess) == "undefined")
        {
            console.log("Module object creation unsuccessful ! Missing parameters");
        }
        this.type = type;
        this.title = (title) ? title : 'No title';
        this.enabled = (enabled) ? true : false;
        this.listType = (listType == 0 || listType == 1 || listType == 2 || listType == 3 || listType == 4) ? listType : 0;
        this.userAccess = 0;
        this.defaultFormMsg = defaultFormMsg;
        this.cssClass = '';
    }

    /**
     * HTML Templates to be loaded based on module
     * @type {Array}
     */
    $scope.templates = [
        'html/business-manager/sales/sales.html',
        'html/business-manager/reservation/reservation.html',
        'html/business-manager/home-delivery/home-delivery.html',
        'html/business-manager/service/service.html',
        'html/business-manager/resume/resume.html'
    ];

    /**
     * List of Modules
     * @type {Array}
     */
    $scope.modules = [];
    /**
     * Get a module by its type
     * @param type
     * @returns {*}
     */
    $scope.getModuleByType = function(type){
        if($scope.modules.length < 0){
            return null;
        }
        var result = null;
        for(var i = 0; i < $scope.modules.length; i++){
            if($scope.modules[i].type == type){
                result =  $scope.modules[i];
                break;
            }
        }
        return result;
    };

    /**
     * Index of Current Active Module Selected
     * @type {number}
     */
    $scope.selectedModule = 0;
    $scope.currentTemplate = 'html/business-manager/loading.html';
    /**
     * Selecting a module and loading it's view
     * @param moduleIndex
     */
    $scope.selectModule = function(moduleIndex){
        var index = parseInt(moduleIndex.moduleIndex);
        $scope.selectedModule = index;
        $scope.resetSelectedModules();
        $scope.modules[index].cssClass = 'active';
        $scope.currentTemplate = $scope.templates[$scope.modules[index].type];
        console.log($scope.currentTemplate);
    };

    $scope.resetSelectedModules = function(){
        for(var i = 0; i < $scope.modules.length; i++){
            $scope.modules[i].cssClass = '';
        }
    };

    $scope.activeModule = null;
    $scope.selectActive = function(moduleType){

    };

    /**
     * Load master(company) configuration set for this user and create module objects
     * Only make module objects for those modules which are accessible to him and are enabled for this user
     */
    $scope.loadConfig = function(){
        console.log($rootScope._userInfo);
        var resp = [];
        resp[0] = $rootScope._userInfo;
        console.log(resp[0]);
        var userModuleRights = resp[0].UserModuleRights.split("");

        /**
         * Module Visibilities are only used for end users(whether owner want to show the module or not to end users)
         */

        if(userModuleRights[0] > 0){
            var salesModule = new Module(0,resp[0].SalesModuleTitle,true,resp[0].SalesItemListType,userModuleRights[0],resp[0].SalesFormMsg);
            $scope.modules.push(salesModule);
        }
        if(userModuleRights[1] > 0){
            var reservationModule = new Module(1,resp[0].AppointmentModuleTitle,true,resp[0].ReservationDisplayFormat,userModuleRights[1],resp[0].ReservationFormMsg);
            $scope.modules.push(reservationModule);
        }

        if(userModuleRights[2] > 0){
            var homeDeliveryModule = new Module(2,resp[0].HomeDeliveryModuleTitle,true,resp[0].HomeDeliveryItemListType,userModuleRights[2],resp[0].HomeDeliveryFormMsg);
            $scope.modules.push(homeDeliveryModule);
        }

        if(userModuleRights[3] > 0){
            var serviceModule = new Module(3,resp[0].ServiceModuleTitle,true,1,userModuleRights[3],resp[0].ServiceFormMsg);
            $scope.modules.push(serviceModule);
        }

        if(userModuleRights[4] > 0){
            var resumeModule = new Module(4,resp[0].CVModuleTitle,true,1,userModuleRights[4], resp[0].ResumeFormMsg);
            $scope.modules.push(resumeModule);
        }

        // Setting first module as active
        if($scope.modules.length > 1){
            $scope.modules[0].cssClass = 'active';
            $scope.currentTemplate = $scope.templates[$scope.modules[0].type];
        }
        console.log($scope.modules);
    };

    $scope.loadConfig();

}]);