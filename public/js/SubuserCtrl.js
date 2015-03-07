/**
 * Created by admin on 6/3/15.
 */


angular.module('ezeidApp').controller('SubuserCtrl',['$scope','$rootScope','$http','Notification','$filter',function($scope,$rootScope,$http,Notification,$filter){
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
        1 : "Inactive",
        2 : "Active"
    };

    $scope.rules = [];


    /**
     * Subuser list (to be replaced with data from server)
     * @todo load it from server and assign to this model
     * @type {Array}
     */
    $scope.subusers = [
    /**
     * Dummy Data
     */
        {
            userName : 'INDRA',
            TID : 25,
            ezeid : 'indra',
            firstName : "Indra Jeet",
            lastName : "Nagda",
            accessRights : {
                'sales' : 3,
                'reservation' : 1,
                'homeDelivery' : 3,
                'service' : 1,
                'resume' : 1
            },
            rules : {
                sales : [3,0,5],
                reservation : [2,1,5],
                homeDelivery : [1,4],
                service : [3,1],
                resume : [2,5]
            },
            status : 2,
            salesEmail : "indra.sales@hirecraft.in",
            reservationEmail : "indra.reservation@hirecraft.in",
            homeDelivery : "indra.hd@hirecraft.in",
            serviceEmail : "indra.srv@hirecraft.in",
            resumeEmail : "indra.cv@hirecraft.in"
        },
        {
            userName : 'KRUNL',
            ezeid : 'krunal11',
            TID : 42,
            firstName : "Krunal",
            lastName : "Patel",
            accessRights : {
                'sales' : 3,
                'reservation' : 3,
                'homeDelivery' : 3,
                'service' : 1,
                'resume' : 1
            },
            rules : {
                sales : [1,2,5],
                reservation : [1,3,5],
                homeDelivery : [0,2,5],
                service : [1,3],
                resume : [0,4]
            },
            status : 1,
            salesEmail : "kruanl.sales@hirecraft.in",
            reservationEmail : "krunal.reservation@hirecraft.in",
            homeDelivery : "krunal.hd@hirecraft.in",
            serviceEmail : "krunal.srv@hirecraft.in",
            resumeEmail : "krunal.cv@hirecraft.in"
        }
    ];

    /**
     * Modal Box with empty data
     * @type {{ezeid: string, userName: string, accessRights: {sales: number, reservation: number, homeDelivery: number, service: number, resume: number}, rules: {sales: Array, reservation: Array, homeDelivery: Array, service: Array, resume: Array}, status: number}}
     */
    $scope.modalBox = {
        title : "Add new subuser",
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
    $scope.openModalBox = function(event){
        if(event){
            var element = event.currentTarget;
            var userIndex = $(element).data('index');
            $scope.modalBox.subuser = $scope.subusers[userIndex];
            $scope.modalBox.title = "Update Subuser";
            $scope.modalBox.ezeidExists = true;
            $scope.modalBox.isEzeidAvailable = true;
            var callback = function(){
                $scope.modalBox.subuser = $scope.subusers[userIndex];
            };
            $scope.checkAvailability(callback());

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
                status : 1,
                salesEmail : "",
                reservationEmail : "",
                homeDeliveryEmail : "",
                serviceEmail : "",
                resumeEmail : ""
            }
        };
    };

    $scope.checkAvailability = function(callback){
        $http({
            url : '/ewtEZEIDPrimaryDetails',
            params : {
                EZEID : $scope.modalBox.subuser.ezeid,
                Token : $rootScope._userInfo.Token
            },
            method : "GET"
        }).success(function(resp){
                console.log(JSON.stringify(resp));
                if(resp.length > 0){
                    if(resp[0].hasOwnProperty('TID')){
                        $scope.modalBox.isEzeidAvailable = true;
                        $scope.modalBox.PersonalID = resp[0].TID;
                        $scope.modalBox.subuser.firstName = resp[0].FirstName;
                        $scope.modalBox.subuser.lastName = resp[0].LastName;
                        if(typeof(callback) !== "undefined"){
                            callback();
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
     * Adding and Removing Rules From model
     * @param event
     * @param type  // Integer 0: Sales, 1 : Reservation, 2 : HomeDelivery, 3 : Service, 4 : Resume
     */
    $scope.addRule = function(event,type){
        var elem = $(event.currentTarget);
        console.log(elem.data('tid'));
        var ruleTid = elem.data('tid');
        if(!elem[0].checked)
        {
            console.log('unchecked');
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
            console.log('checked');
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
     * Add and update subuser to server
     */
    $scope.saveSubUser = function(){
        console.log(JSON.stringify($scope.modalBox));
        console.log($scope.masterUser);
        var data = {
            Token : $rootScope._userInfo.Token,

            //@todo Please use master ID of user
            PersonalID : $scope.modalBox.ezeid,

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

        console.log(JSON.stringify(data));
        $http({
            url : '/ewtCreateSubUser',
            method : "POST",
            data : data
        }).success(function(resp){
            console.log(resp);
        }).error(function(err){
            console.log(err);
        });
    };



    /**
     * Load all rules present for the Master EZEID
     */
    $scope.loadAllRules = function(){
        $http({
            url : '/ewtGetFolderList',
            method : "GET",
            params : {
                Token : $rootScope._userInfo.Token,
                MasterID : $scope.masterUser.MasterID
            }
        }).success(function(resp){
                if(resp.length > 0){
                    $scope.rules = resp;
                }
            }).error(function(err){
                Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
            });
    };

    // Getting master user details
    $http({
        url : '/ewtGetUserDetails',
        method : "GET",
        params :{
            Token : $rootScope._userInfo.Token
        }
    }).success(function(resp){
            if(resp.length>0){
                $scope.masterUser = resp[0];
                $scope.loadAllRules()
            }
        }).error(function(err){
            Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
        });

}]);