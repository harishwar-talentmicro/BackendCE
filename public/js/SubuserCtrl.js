/**
 * Created by admin on 6/3/15.
 */


angular.module('ezeidApp').controller('SubuserCtrl',['$scope','$rootScope','$http','Notification','$filter','MsgDelay','$interval','GURL',function($scope,$rootScope,$http,Notification,$filter,MsgDelay,$interval,GURL){
    $(document).on('click','.popover-close',function(){
        $('*[data-toggle="popover"]').popover('hide');
    });


    /**
     * Removes a unique value from array
     * @param value
     * @param arrayList
     * @returns {*}
     */
    function removeFromArray(value,arrayList){
        if(arrayList.length < 1){
            return arrayList;
        }
        var valueIndex = arrayList.indexOf(value);
        if(valueIndex === -1){
            return arrayList;
        }
        try{
            arrayList.splice(valueIndex,1);
        }
        catch(ex){

        }
        return arrayList;
    };

    /**
     * Main EZEID logged in as business user and having verified status
     * @type {null}
     */
    $scope.masterUser = null;

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
     * Sub user Status Mapping
     * @type {{1: string, 2: string}}
     */
    $scope.status = {
        2 : "Inactive",
        1 : "Active"
    };

    $scope.rules = [];


    /**
     * Subuser list (to be replaced with data from server)
     * @type {Array}
     */
    $scope.subusers = [];

    /**
     * Modal Box with empty data
     * @type {{ezeid: string, userName: string, accessRights: {sales: number, reservation: number, homeDelivery: number, service: number, resume: number}, rules: {sales: Array, reservation: Array, homeDelivery: Array, service: Array, resume: Array}, status: number}}
     */
    $scope.modalBox = {
        title : "Add new subuser",
        userIndex : null,
        ezeidExists : false,        // If this EZEID is already in subuser list(while editing the subusers)
        availabilityCheck : false,  //If checked the availability of EZEID or not
        isEzeidAvailable : false,   // Shows that EZEID exists or not
        PersonalID : 0,
        subuser : {
            ezeid : "",
            userName : "",
            TID : 0,
            accessRights : {
                sales: 0,
                reservation : 0,
                homeDelivery : 0,
                service : 0,
                resume : 0
            },
            rules : {
                sales : [],
                reservation : [],
                homeDelivery : [],
                service : [],
                resume : []
            },
            status : 1,
            salesEmail : "",
            reservationEmail : "",
            homeDeliveryEmail : "",
            serviceEmail : "",
            resumeEmail : ""
        }
    };

    //Open Modal box for user
    $scope.showModal = false;
    $scope.toggleModalBox = function(event){
        if(event){
            var element = event.currentTarget;
            var userIndex = $(element).data('index');
            $scope.modalBox.userIndex = userIndex;
            $scope.modalBox.subuser = $scope.subusers[userIndex];
            $scope.modalBox.title = "Update Subuser";
            $scope.modalBox.ezeidExists = true;
            $scope.modalBox.isEzeidAvailable = true;
            var callback = function(){
                $scope.modalBox.subuser = $scope.subusers[userIndex];
            };
            $scope.checkAvailability(callback);
            console.log($scope.modalBox.subuser);
        }
        else{
            $scope.resetModalData();
        }
        $scope.showModal = !$scope.showModal;
    };


    /**
     * Resetting Modal Data to initial state
     */
    $scope.resetModalData = function(){
        $scope.modalBox = {
            title : "Add new subuser",
            userIndex : null,
            ezeidExists : false,        // If subuser creation is new then false else true for updating user
            availabilityCheck : false,  //If checked the availability of EZEID or not
            isEzeidAvailable : false,   // Status of EZEID exists or not after checking availability
            PersonalID : 0,
            subuser : {
                ezeid : "",
                userName : "",
                TID : 0,
                accessRights : {
                    sales: 0,
                    reservation : 0,
                    homeDelivery : 0,
                    service : 0,
                    resume : 0
                },
                rules : {
                    sales : [],
                    reservation : [],
                    homeDelivery : [],
                    service : [],
                    resume : []
                },
                status : 2,
                salesEmail : "",
                reservationEmail : "",
                homeDeliveryEmail : "",
                serviceEmail : "",
                resumeEmail : ""
            }
        };
    };

    /**
     * Finds that rule is present for particular user loaded in modal or not
     * @param ruleId
     * @param functionType
     * @returns {boolean}
     */
    $scope.findRuleForSubuser = function(ruleId,functionType){
        console.log(ruleId);
        console.log(functionType);
        var ruleMapping = ['sales','reservation','homeDelivery','service','resume'];
        var fType = parseInt(functionType);

        if($scope.modalBox.subuser.rules[ruleMapping[fType]].length < 1){
            return false;

        }
        var index = $scope.modalBox.subuser.rules[ruleMapping[fType]].indexOf(ruleId.toString());
        if(index !== -1){
            return true;
        }
        else{
            return false;
        }
    };

    /**
     * CheckAvailability
     * @param callback
     */

    $scope.checkAvailability = function(callback){
        $http({
            url : GURL + 'ewtEZEIDPrimaryDetails',
            params : {
                EZEID : $scope.modalBox.subuser.ezeid,
                Token : $rootScope._userInfo.Token
            },
            method : "GET"
        }).success(function(resp){
                if(resp.length > 0){
                    if(resp[0].hasOwnProperty('TID')){
                        $scope.modalBox.isEzeidAvailable = true;
                        if(typeof(callback) !== "undefined"){
                            callback();
                        }
                        else{
                            $scope.modalBox.PersonalID = resp[0].TID;
                            $scope.modalBox.subuser.firstName = resp[0].FirstName;
                            $scope.modalBox.subuser.lastName = resp[0].LastName;
                        }
                    }
                    else{
                        $scope.modalBox.isEzeidAvailable = false;
                    }
                }
                else{
                    $scope.modalBox.isEzeidAvailable = false;
                }
                $scope.modalBox.availabilityCheck = true;
        }).error(function(err){
                Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
        });
    };


    /**
     * Adding and Removing Rules From a particular user
     * @param event
     * @param type  // Integer 0: Sales, 1 : Reservation, 2 : HomeDelivery, 3 : Service, 4 : Resume
     */
    $scope.toggleRule = function(event,type){
        var elem = $(event.currentTarget);
        var ruleTid = elem.data('tid');
        if(!elem[0].checked)
        {
            // Will remove from the array list here
            switch(type){
                case 0:
                    $scope.modalBox.subuser.rules.sales = removeFromArray(ruleTid,$scope.modalBox.subuser.rules.sales);
                    break;
                case 1:
                    $scope.modalBox.subuser.rules.reservation = removeFromArray(ruleTid,$scope.modalBox.subuser.rules.reservation);
                    break;
                case 2:
                    $scope.modalBox.subuser.rules.homeDelivery = removeFromArray(ruleTid,$scope.modalBox.subuser.rules.homeDelivery);
                    break;
                case 3:
                    $scope.modalBox.subuser.rules.service = removeFromArray(ruleTid,$scope.modalBox.subuser.rules.service);
                    break;
                case 4:
                    $scope.modalBox.subuser.rules.resume = removeFromArray(ruleTid,$scope.modalBox.subuser.rules.resume);
                    break;
                default:
                    break;
            }
        }
        else{
            // Will add to array list here
            switch(type){
                case 0:
                    $scope.modalBox.subuser.rules.sales.push(ruleTid);
                    break;
                case 1:
                    $scope.modalBox.subuser.rules.reservation.push(ruleTid);
                    break;
                case 2:
                    $scope.modalBox.subuser.rules.homeDelivery.push(ruleTid);
                    break;
                case 3:
                    $scope.modalBox.subuser.rules.service.push(ruleTid);
                    break;
                case 4:
                    $scope.modalBox.subuser.rules.resume.push(ruleTid);
                    break;
                default:
                    break;
            }

        }
    };


    /**
     * Validates subuser data
     */
    $scope.validateSubUser = function(){
        //@todo Validates subuser data before saving
    };

    /**
     * Add and update subuser to server
     */
    $scope.saveSubUser = function(){
        console.log($scope.modalBox.subuser.rules.sales);
        var data = {
            Token : $rootScope._userInfo.Token,

            PersonalID : $scope.modalBox.subuser.ezeid,

            TID : $scope.modalBox.subuser.TID,
            UserName  : $scope.masterUser.EZEID+'.'+$scope.modalBox.subuser.userName,
            Status : $scope.modalBox.subuser.status,
            FirstName : $scope.modalBox.subuser.firstName,
            LastName : $scope.modalBox.subuser.lastName,

            AccessRights :
                $scope.modalBox.subuser.accessRights.sales + '' +
                $scope.modalBox.subuser.accessRights.reservation + '' +
                $scope.modalBox.subuser.accessRights.homeDelivery + '' +
                $scope.modalBox.subuser.accessRights.service + '' +
                $scope.modalBox.subuser.accessRights.resume,

            SalesEmail : $scope.modalBox.subuser.salesEmail,
            ReservationEmail : $scope.modalBox.subuser.reservationEmail,
            HomeDeliveryEmail : $scope.modalBox.subuser.homeDeliveryEmail,
            ServiceEmail :  $scope.modalBox.subuser.serviceEmail,
            ResumeEmail : $scope.modalBox.subuser.resumeEmail,
            SalesRules : $scope.modalBox.subuser.rules.sales.join(','),
            ReservationRules : $scope.modalBox.subuser.rules.reservation.join(','),
            HomeDeliveryRules : $scope.modalBox.subuser.rules.homeDelivery.join(','),
            ServiceRules : $scope.modalBox.subuser.rules.service.join(','),
            ResumeRules : $scope.modalBox.subuser.rules.resume.join(',')
        };
        console.log(data);

        $http({
            url : GURL + 'ewtCreateSubUser',
            method : "POST",
            data : data
        }).success(function(resp){
                if(resp && resp.hasOwnProperty("IsSuccessfull")){
                    Notification.success({ message : "User saved successfully", delay : MsgDelay});
                    /**
                     * Reloading all users once again to fetch the TID of newly added user (for updating purposes)
                     *
                     */
                    $scope.toggleModalBox();
                    $scope.loadSubuserList();
                }
                else{
                    Notification.error({ message : "An error occured while saving user !", delay : MsgDelay});
                }
        }).error(function(err){
                Notification.error({ message : "An error occured while saving user !", delay : MsgDelay});
        });
    };


    /**
     * Function type count for loading rules based on functionType
     * @type {number}
     */
    $scope.functionTypeCount = 0;
    /**
     * Load all rules present for the Master EZEID
     * Recursive calls for fetching all rule types based on FunctionType(Sales : 0, Reservation : 1,..)
     * Loading SubuserList after loading all types of rules
     */
    $scope.loadAllRules = function(){
        $http({
            url : GURL + 'ewtGetFolderList',
            method : "GET",
            params : {
                Token : $rootScope._userInfo.Token,
                MasterID : $rootScope._userInfo.MasterID,
                FunctionType : $scope.functionTypeCount
            }
        }).success(function(resp){
                $scope.functionTypeCount += 1;
                if(resp && resp.length > 0 && resp !== "null"){
                    console.log(resp);
                        for(var i = 0; i < resp.length; i++){
                            console.log(resp[i]);
                            $scope.rules.push(resp[i]);
                        }

                }
                if($scope.functionTypeCount < 5){
                    $scope.loadAllRules();
                }
                else{
                    $scope.loadSubuserList();
                }

            }).error(function(err){
                Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
            });
    };

    /**
     * Loads list of subusers
     */
    $scope.loadSubuserList = function(){
        $scope.subusers = [];
        $http({
            url : GURL + 'ewtGetSubUserList',
            method : "GET",
            params : {
                Token : $rootScope._userInfo.Token,
                MasterID : $scope.masterUser.MasterID
            }
        }).success(function(resp){
            if(resp && resp.length > 0)
            {
                console.log(resp);
                for(var i = 0; i < resp.length ; i++){
                    var subuser = {
                        userName : (resp[i].EZEID.split(".").pop()),
                        TID : resp[i].TID,
                        ezeid : resp[i].PersonalEZEID,
                        firstName : resp[i].FirstName,
                        lastName : resp[i].LastName,
                        accessRights : {
                            'sales' : (resp[i].UserModuleRights.split(''))[0],
                            'reservation' : (resp[i].UserModuleRights.split(''))[1],
                            'homeDelivery' : (resp[i].UserModuleRights.split(''))[2],
                            'service' : (resp[i].UserModuleRights.split(''))[3],
                            'resume' : (resp[i].UserModuleRights.split(''))[4]
                        },
                        rules : {
                            sales : (resp[i].SalesIDs.length > 0) ? resp[i].SalesIDs.split(',') : [],
                            reservation : (resp[i].ReservationIDs.length > 0) ? resp[i].ReservationIDs.split(','): [],
                            homeDelivery : (resp[i].HomeDeliveryIDs.length > 0) ? resp[i].HomeDeliveryIDs.split(',') : [],
                            service : (resp[i].ServiceIDs.length > 0) ? resp[i].ServiceIDs.split(',') : [],
                            resume : (resp[i].ResumeIDs.length > 0) ? resp[i].ResumeIDs.split(',') : []
                        },
                        status : resp[i].StatusID,
                        salesEmail : resp[i].SalesMailID,
                        reservationEmail : resp[i].ReservationMailID,
                        homeDelivery : resp[i].HomeDeliveryMailID,
                        serviceEmail : resp[i].ServiceMailID,
                        resumeEmail : resp[i].CVMailID

                    };
                    $scope.subusers.push(subuser);
                }
            }
            else{
                Notification.error({ message: "No subusers added ", delay : MsgDelay});
            }
        }).error(function(err){
                Notification.error({ message: "No subusers added ", delay : MsgDelay});
        });
    };

    /**
     * Getting Master User Details
     * Then calling loadRules Function to load all rules
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
                    $scope.loadAllRules();
                }
            }).error(function(err){
                Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
            });

    };

    /**
     * Initial Function call after controller initialization
     * Will call loadAllRules()
     */
    $scope.getMasterUserDetails();

}]);