/**
 * Sign up Controller
 * @name SignUpCtrl
 * Manages signup functionality
 *
 * "use strict";
 */

angular.module('ezeidApp').
    controller('SignUpWizardCtrl', [
        '$rootScope',
        '$scope',
        '$http',
        '$q',
        '$timeout',
        'Notification',
        '$filter',
        '$window',
        'GURL',
        '$interval',
        'ScaleAndCropImage',
        'MsgDelay',
        '$location',
        function (
            $rootScope,
            $scope,
            $http,
            $q,
            $timeout,
            Notification,
            $filter,
            $window,
            GURL,
            $interval,
            ScaleAndCropImage,
            MsgDelay,
            $location
        )
        {

            /**
             * Visibility setting for feature list type block
             * (show list of features available based on signup type, it will be visible firstly by default when user in not signed in)
             * First block to be visible during signup process
             * @type {boolean}
             */
            $scope.isSignUpTypeBlockVisible = true;

            /**
             * Visibility setting for check ezeid availability block
             * (if business plan selected then this block becomes visible and everything else hides up )
             * @type {boolean}
             */
            $scope.isEzeidCheckBlockVisible = false;

            /**
             * Progress Indicator for EZEID Availability Check call
             * @type {boolean}
             */
            $scope.isEzeidCheckInProgress = false;

            /**
             * Visibility settting for registering ezeid whose availability is already checked
             * (this block is visibile while user is claiming his ezeid and all other blocks will be hidden)
             * @type {boolean}
             */
            $scope.isEzeidAvailabilityChecked = false;

            /**
             * EZEID is available to be blocked on not
             * @type {boolean}
             */
            $scope.isEzeidAvailable = false;

            /**
             * CompanyName will be visible for both Business and Individual as 'CompanyName' Only
             * But in case of public user it will considered as 'Name of Public Place'
             * @type {string}
             */
            $scope.companyName = "";

            /**
             * About
             * @desc
             * In case of Business User, about will be considered as 'About Company'
             * In case of Individual User, about will be considered as 'Job Title'
             * In case of Public Place, about will be considered as 'About Public Place'
             * @type {string}
             */
            $scope.about = "";

            /**
             * Master Email for this EZEID
             * @type {string}
             */
            $scope.email = "";

            /**
             * EZEID Password
             * @type {string}
             */
            $scope.password = "";

            /**
             * EZEID Reentered Password
             * @type {string}
             */
            $scope.repassword = "";

            /**
             * EZEID PIN For user
             * @type {string}
             */

            $scope.pin = "";


            /**
             * User has selected the PIN Checkbox to create a pin
             * @type {boolean}
             */
            $scope.isPinApplicable = false;


            /**
             * Date of Birth for Individual
             * @type {string}
             */
            $scope.dateOfBirth = '';


            /**
             * Terms and Conditions Accepted or not
             * @type {boolean}
             */
            $scope.termsAccepted = false;

            /**
             * UserType describes type of user like business, individual or public place
             * @type {number}
             */
            $scope.userType = 1;

            /**
             * PlanSelectionType describes which typeof plan user has chosen like free : 1, paid : 2, not applicable : 0
             * @type {number}
             */
            $scope.planSelectionType = 0;

            $scope.showBusinnessSelectionType = false;

            $scope.validateFlag = true;

            $scope.selectionString = '';

            /**
             * Feature list for feature list type block
             * @type {{primary: Array, functions: Array}}
             */
            $scope.signUpFeatures = {
                primary : [
                    {name:'Unique ID',businessFree:'glyphicon glyphicon-ok green',businessPaid:'glyphicon glyphicon-ok green',individual:'glyphicon glyphicon-ok green',publicPlace:'glyphicon glyphicon-ok green'},
                    {name:'Store complete Profile',businessFree:'glyphicon glyphicon-ok green',businessPaid:'glyphicon glyphicon-ok green',individual:'glyphicon glyphicon-ok green',publicPlace:'glyphicon glyphicon-ok green'},
                    {name:'Product Advertising Banners',businessFree:'glyphicon glyphicon-remove red',businessPaid:'glyphicon glyphicon-ok green',individual:'glyphicon glyphicon-ban-circle red',publicPlace:'glyphicon glyphicon-remove red'},
                    {name:'Store Documents to share',businessFree:'glyphicon glyphicon-ok green',businessPaid:'glyphicon glyphicon-ok green',individual:'glyphicon glyphicon-ok green',publicPlace:'glyphicon glyphicon-remove red'},
                    {name:'Store Multiple Addresses : Locations',businessFree:'glyphicon glyphicon-ok green',businessPaid:'glyphicon glyphicon-ok green',individual:'glyphicon glyphicon-ok green',publicPlace:'glyphicon glyphicon-ok green'},
                    {name:'Index your Business on Business Finder',businessFree:'glyphicon glyphicon-remove red',businessPaid:'glyphicon glyphicon-ok green',individual:'glyphicon glyphicon-ban-circle red',publicPlace:'glyphicon glyphicon-exclamation-sign yellow'}
                ],
                functions : [
                    {name:'  - Sales Enquiry / Home Delivery Form',businessFree:'glyphicon glyphicon-remove red',businessPaid:'glyphicon glyphicon-ok green',individual:'glyphicon glyphicon-ban-circle red',publicPlace:'glyphicon glyphicon-ban-circle red'},
                    {name:'  - Reservation Form',businessFree:'glyphicon glyphicon-remove red',businessPaid:'glyphicon glyphicon-ok green',individual:'glyphicon glyphicon-ban-circle red',publicPlace:'glyphicon glyphicon-ban-circle red'},
                    {name:'  - Service/Support Request Form',businessFree:'glyphicon glyphicon-remove red',businessPaid:'glyphicon glyphicon-ok green',individual:'glyphicon glyphicon-ban-circle red',publicPlace:'glyphicon glyphicon-ban-circle red'},
                    {name:'  - Receive Resumes from Jobseekers',businessFree:'glyphicon glyphicon-remove red',businessPaid:'glyphicon glyphicon-ok green',individual:'glyphicon glyphicon-ban-circle red',publicPlace:'glyphicon glyphicon-ban-circle red'},
                    {name:'  - Send Bulk Sales Enquiries',businessFree:'glyphicon glyphicon-remove red',businessPaid:'glyphicon glyphicon-ok green',individual:'glyphicon glyphicon-ban-circle red',publicPlace:'glyphicon glyphicon-ban-circle red'},
                    {name:'  - Bulk Mails to Jobseekers',businessFree:'glyphicon glyphicon-remove red',businessPaid:'glyphicon glyphicon-ok green',individual:'glyphicon glyphicon-ban-circle red',publicPlace:'glyphicon glyphicon-ban-circle red'},
                    {name:'CRM Software - Web & Mobile Apps',businessFree:'glyphicon glyphicon-remove red',businessPaid:'glyphicon glyphicon-ok green',individual:'glyphicon glyphicon-ban-circle red',publicPlace:'glyphicon glyphicon-ban-circle red'}
                ]
            };

            /**
             * Error Text Messages
             * @type {{}}
             */
            $scope.error = {
                firstName : '',
                lastName : '',
                companyName : '',
                about : '',
                dateOfBirth : '',
                email : '',
                password : ''
            };



            /**
             * Selects a plan (signup business type)
             * @param userType
             * @param selectionType
             */
            $scope.selectPlan = function(userType,planSelectionType){
                $scope.userType = userType;
                $scope.planSelectionType = planSelectionType;

                $scope.isSignUpTypeBlockVisible = false;
                if(parseInt($scope.userType) == 2){
                    $scope.showBusinnessSelectionType = true;
                }
                else{
                    $scope.selectionString = (parseInt($scope.userType) == 1) ? 'You are signing up as an individual'
                        : 'You are signing up as a public place';
                    $scope.isEzeidCheckBlockVisible = true;
                }

            };

            $scope.selectPlanSelectionType = function(planSelectionType){
                $scope.selectionString = (parseInt(planSelectionType) == 2) ? 'You are signing up as a business (paid listing)'
                    : 'You are signing up as a business (free listing)';
                $scope.showBusinnessSelectionType = false;
                $scope.planSelectionType = planSelectionType;
                $scope.isEzeidCheckBlockVisible = true;
            };


            /**
             * Status of Terms and Condition box, open : true, close : false
             * @type {boolean}
             */
            $scope.isTermsBoxOpen = false;
            /**
             * Terms and Condition Popup Box to be Opened From here
             */
            $scope.toggleTermsAndConditions = function(){
                if($scope.isTermsBoxOpen){
                    $scope.isTermsBoxOpen = false;
                    $('#Terms_popup').slideUp();
                }
                else{
                    $scope.isTermsBoxOpen = true;
                    $('#Terms_popup').css({'position':'fixed'});
                    $('#Terms_popup > div').css({'margin-top':'0%'});
                    $('#Terms_popup').slideDown();
                }

            };

            /**
             * Reset the form to default values
             */
            $scope.resetForm = function(){
                $scope.userType = 1;
                $scope.planSelectionType = 0;
                $scope.email = "";
                $scope.ezeid = "";
                $scope.dateOfBirth = "";
                $scope.companyName = "";
                $scope.about = "";
                $scope.password = "";
                $scope.repassword = "";
                $scope.firstName = "";
                $scope.lastName = "";
                $scope.pin = "";
                $scope.isEzeidAvailable = false;
                $scope.isEzeidAvailabilityChecked = false;
                $scope.isEzeidCheckInProgress = false;
                $scope.isPinApplicable = false;
                $scope.dateOfBirth = "";
                $scope.termsAccepted = false;
                $scope.gender = 2;

                $scope.signUpForm.$setPristine();
            };



            /**
             * Go back to select Plan once again
             */
            $scope.goBack = function(){
                $scope.resetForm();
                $scope.signUpForm.$setPristine();
                $scope.isSignUpTypeBlockVisible = true;
                $scope.showBusinnessSelectionType = false;
                $scope.isEzeidCheckBlockVisible = false;
            };


            /* toggle modal visibility */
            $scope.modalVisible = false;
            $scope.modalVisibility = function () {
                /* toggle map visibility status */
                $scope.modalVisible = !$scope.modalVisible;
            };

            /* detail modal goes here */
            $scope.modalBox = {
                title : 'Features',
                class : 'business-manager-modal'
            };



            /**
             * Don not allow ezeid with last two characters as AP(ap)
             * @desc For area partner puposes
             * @param ezeid
             * @returns {boolean}
             */
            $scope.doNotAllowEzeidAp = function(ezeid){
                if(ezeid.length > 3)
                {
                    var ap = ezeid.slice(-2);
                    if(ap === 'AP' || ap === 'ap'){
                        return false;
                    }
                }
                return true;
            };

            /**
             * Function to check if user has entered ezeid according to free listing constraints
             * Free listing EZEID should have a digit as last character of EZEID
             * @param ezeid
             * @returns {boolean}
             */
            $scope.doNotAllowPremiumEzeid = function(ezeid){
                // ////////////console.log($scope.userType);
                // ////////////console.log($scope.planSelectionType);
                if($scope.userType === 2 && $scope.planSelectionType === 2){
                    return true;
                }
                else{
                    var lastCh = ezeid.slice(-1);
                    var lastDigit = parseInt(lastCh);
                    if(!isNaN(lastDigit)){
                        return true;
                    }
                    else{
                        return false;
                    }
                }

            };



            /**
             * Checking EZEID Availability Here
             */
            $scope.checkEzeidAvailability = function(){

                $scope.isEzeidCheckInProgress = true;

                var defer = $q.defer();
                var apCheck = $scope.doNotAllowEzeidAp($scope.ezeid);
                var premiumCheck = $scope.doNotAllowPremiumEzeid($scope.ezeid);
                if(!(apCheck && premiumCheck)){
                    $timeout(function(){
                        $scope.isEzeidAvailabilityChecked = true;
                        $scope.isEzeidAvailable = false;
                        $scope.isEzeidCheckInProgress = false;
                        defer.resolve({IsIdAvailable : false});
                    },2000);
                    return defer.promise;
                }


                $http({
                    method: 'GET',
                    url: GURL + 'ewGetEZEID',
                    params : {
                        EZEID : ($scope.ezeid) ? (($scope.ezeid[0] == '@') ? $scope.ezeid : '@'+$scope.ezeid) : ''
                    }
                }).success(function (resp) {
                    if(resp  && resp !== 'null' && resp.hasOwnProperty('IsIdAvailable')){
                        $scope.isEzeidAvailabilityChecked = true;
                        $scope.isEzeidAvailable = resp.IsIdAvailable;
                        $scope.isEzeidCheckInProgress = false;
                        if(!$scope.isEzeidAvailable){
                            Notification.error({ message: $scope.ezeid + ' is unavailable', delay: MsgDelay });
                        }
                        defer.resolve(resp);
                    }
                    else{
                        Notification.error({ message: 'An error occured ! Please try again later', delay: MsgDelay });
                    }

                }).error(function(err){
                    $scope.isEzeidCheckInProgress = false;
                    Notification.error({ message: err, delay: MsgDelay });
                    defer.reject(err);
                });

                return defer.promise;
            };

            var test = "";

            $scope.validateSignUpData = function(){
                var validationStatus = true;



                if($scope.password.length < 4){
                    $scope.error.password = '*Password should be minimum 4 characters';
                    validationStatus *= false;
                }

                if($scope.password !== $scope.repassword){
                    $scope.error.password = '*Passwords didn\'t matched';
                    validationStatus *= false;
                }


                if(!$scope.companyName){
                    $scope.error.companyName = '*Company Name cannot be empty';
                    validationStatus *= false;
                }

                if(typeof($scope.companyName) !== "undefined"){
                    if($scope.companyName.length < 1){
                        $scope.error.companyName = "*Company Name cannot be empty";
                        validationStatus *= false;
                    }
                }

                if($scope.userType != 3)
                {
                    var emailPattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                    var emailRegEx = new RegExp(emailPattern);
                    if($scope.email.length > 0 && !(emailRegEx.test($scope.email))){
                        $scope.error.email = '*Email ID is invalid';
                        validationStatus *= false;
                    }

                    //if(!$scope.firstName){
                    //    $scope.error.firstName = '*First Name cannot be empty';
                    //    validationStatus *= false;
                    //}
                    //
                    //if(typeof($scope.firstName) !== "undefined"){
                    //    if($scope.firstName.length < 1){
                    //        $scope.error.firstName = "*First Name cannot be empty";
                    //        validationStatus *= false;
                    //    }
                    //}

                    //if(!$scope.lastName){
                    //    $scope.error.lastName = 'Last Name cannot be empty';
                    //    validationStatus *= false;
                    //}

                    //if(typeof($scope.lastName) !== "undefined"){
                    //    if($scope.lastName.length < 1){
                    //        $scope.error.lastName = "First Name cannot be empty";
                    //        validationStatus *= false;
                    //    }
                    //}

                    //if(!$scope.about){
                    //    $scope.error.about = ($scope.userType === 1 || $scope.userType === 2) ?
                    //        'Please enter tagline about your company' : 'Please enter tagline about public place';
                    //    validationStatus *= false;
                    //}

                    //if(typeof($scope.about) !== "undefined"){
                    //    if($scope.about.length < 1){
                    //        $scope.error.about = ($scope.userType === 1 || $scope.userType === 2) ?
                    //            '*Please enter tagline for your company' : 'Please enter tagline for public place';
                    //        validationStatus *= false;
                    //    }
                    //}

                    //if($scope.userType === 1 && typeof($scope.dateOfBirth) === "undefined"){
                    //    $scope.error.dateOfBirth = '*Please enter your date of Birth'
                    //    validationStatus *= false;
                    //}

                    //    if(($scope.userType === 2) && ((!$scope.mobile) && (!$scope.email))){
                    //        ////////////console.log('Email or Mobile cannot be empty');
                    //        $scope.error.email = '*Either Mobile or email is mandatory ! Please fill any one of them';
                    //        validationStatus *= false;
                    //    }
                }



                if($scope.isPinApplicable){
                    var parsePin = parseInt($scope.pin);
                    if(isNaN(parsePin)){
                        $scope.error.pin = "*PIN should be between 100 to 999";
                        validationStatus *= false;
                    }
                    else{
                        if(!(parsePin > 99 && parsePin < 1000)){
                            validationStatus *= false;
                            $scope.error.pin = "*PIN should be between 100 to 999";
                        }
                    }

                }
                return validationStatus;

            };

            /**
             * Creates basic configuration settings
             * 1. Status Types
             * 2. Action Types
             * 3.
             */

            var createBasicConf = function(token){
                var defer = $q.defer();
                var actionCompleteFlag = false;
                var statusCompleteFlag = false;
                /**
                 * Checks the completion of generating the basic configuration settings or not
                 */
                var checkCompletion  = function(){
                    if(actionCompleteFlag && statusCompleteFlag){
                        defer.resolve();
                    }
                };


                var actionData = [
                    {
                        Token : token,
                        TID : 0,
                        ActionTitle : 'Follow Up',
                        Status : 1,
                        FunctionType : 0
                    },
                    {
                        Token : token,
                        TID : 0,
                        ActionTitle : 'Call',
                        Status : 1,
                        FunctionType : 0
                    },
                    {
                        Token : token,
                        TID : 0,
                        ActionTitle : 'Meeting',
                        Status : 1,
                        FunctionType : 0
                    },
                    {
                        Token : token,
                        TID : 0,
                        ActionTitle : 'Deliver',
                        Status : 1,
                        FunctionType : 2
                    },
                    {
                        Token : token,
                        TID : 0,
                        ActionTitle : 'Pack',
                        Status : 1,
                        FunctionType : 2
                    },
                    {
                        Token : token,
                        TID : 0,
                        ActionTitle : 'Followup',
                        Status : 1,
                        FunctionType : 3
                    },
                    {
                        Token : token,
                        TID : 0,
                        ActionTitle : 'Repair',
                        Status : 1,
                        FunctionType : 3
                    },

                    {
                        Token : token,
                        TID : 0,
                        ActionTitle : 'Followup',
                        Status : 1,
                        FunctionType : 4
                    },
                    {
                        Token : token,
                        TID : 0,
                        ActionTitle : 'Phone Call',
                        Status : 1,
                        FunctionType : 4
                    },
                    {
                        Token : token,
                        TID : 0,
                        ActionTitle : 'Telephonic Interview',
                        Status : 1,
                        FunctionType : 3
                    },
                    {
                        Token : token,
                        TID : 0,
                        ActionTitle : 'Face to Face Interview',
                        Status : 1,
                        FunctionType : 3
                    }
                ];
                var actionCount = 0;
                var createActionTypes = function(){
                    $http({
                        url : GURL + 'ewmSaveActionType',
                        data : actionData[actionCount],
                        method : 'POST'
                    }).success(function(resp){
                        if(actionCount < (actionData.length - 1)){
                            actionCount++;
                            createActionTypes();
                        }
                        else{
                            actionCompleteFlag = true;
                            checkCompletion();
                        }
                    }).error(function(resp){
                        if(actionCount < actionData.length){
                            actionCount++;
                            createActionTypes();
                        }
                        else{
                            actionCompleteFlag = true;
                            checkCompletion();
                        }
                    });
                };

                createActionTypes();

                var statusCount = 0;
                var createPrimaryStatusTypes = function(masterId){
                    var statusData = [
                        {
                            Token : token,
                            TID : 0,
                            StatusTitle : 'In-process',
                            MasterID : masterId,
                            FunctionType : 0,
                            ProgressPercent : 10,
                            Status : 1,
                            NotificationMsg : 'Your enquiry is under process',
                            NotificationMailMsg: 'Your enquiry is under process',
                            StatusValue : 1
                        },
                        {
                            Token : token,
                            TID : 0,
                            StatusTitle : 'Closed',
                            MasterID : masterId,
                            FunctionType : 1,
                            ProgressPercent : 100,
                            Status : 1,
                            NotificationMsg : 'Your reservation is closed successfully',
                            NotificationMailMsg: 'Your reservation is closed successfully',
                            StatusValue : 10
                        },
                        {
                            Token : token,
                            TID : 0,
                            StatusTitle : 'Dropped',
                            MasterID : masterId,
                            FunctionType : 1,
                            ProgressPercent : 100,
                            Status : 1,
                            NotificationMsg : 'Your reservation is cancelled',
                            NotificationMailMsg: 'Your reservation is cancelled',
                            StatusValue : 11
                        },
                        {
                            Token : token,
                            TID : 0,
                            StatusTitle : 'No Show',
                            MasterID : masterId,
                            FunctionType : 1,
                            ProgressPercent : 100,
                            Status : 1,
                            NotificationMsg : 'Your reservation was unattended by you',
                            NotificationMailMsg: 'Your reservation was unattended by you',
                            StatusValue : 12
                        },
                        {
                            Token : token,
                            TID : 0,
                            StatusTitle : 'Accepted',
                            MasterID : masterId,
                            FunctionType : 0,
                            ProgressPercent : 20,
                            Status : 1,
                            NotificationMsg : 'Your enquiry is accepted !',
                            NotificationMailMsg: 'Your enquiry is accepted !',
                            StatusValue : 2
                        },
                        {
                            Token : token,
                            TID : 0,
                            StatusTitle : 'Cancelled',
                            MasterID : masterId,
                            FunctionType : 0,
                            ProgressPercent : 100,
                            Status : 1,
                            NotificationMsg : 'Your enquiry is cancelled !',
                            NotificationMailMsg: 'Your enquiry is cancelled !',
                            StatusValue : 11
                        },
                        {
                            Token : token,
                            TID : 0,
                            StatusTitle : 'In-process',
                            MasterID : masterId,
                            FunctionType : 2,
                            ProgressPercent : 40,
                            Status : 1,
                            NotificationMsg : 'Your order is being prepared !',
                            NotificationMailMsg: 'Your order is being prepared !',
                            StatusValue : 4
                        },
                        {
                            Token : token,
                            TID : 0,
                            StatusTitle : 'Dropped',
                            MasterID : masterId,
                            FunctionType : 3,
                            ProgressPercent : 100,
                            Status : 1,
                            NotificationMsg : 'Your ticket is dropped !',
                            NotificationMailMsg: 'Your order is dropped !',
                            StatusValue : 11
                        },
                        {
                            Token : token,
                            TID : 0,
                            StatusTitle : 'Under inspection',
                            MasterID : masterId,
                            FunctionType : 3,
                            ProgressPercent : 30,
                            Status : 1,
                            NotificationMsg : 'Your issue is under inspection !',
                            NotificationMailMsg: 'Your issue is under inspection !',
                            StatusValue : 3
                        },
                        {
                            Token : token,
                            TID : 0,
                            StatusTitle : 'Dropped',
                            MasterID : masterId,
                            FunctionType : 2,
                            ProgressPercent : 100,
                            Status : 1,
                            NotificationMsg : 'Your order is cancelled !',
                            NotificationMailMsg: 'Your order is cancelled !',
                            StatusValue : 11
                        },
                        {
                            Token : token,
                            TID : 0,
                            StatusTitle : 'Screened',
                            MasterID : masterId,
                            FunctionType : 4,
                            ProgressPercent : 10,
                            Status : 1,
                            NotificationMsg : 'Your resume is under screening !',
                            NotificationMailMsg: 'Your resume is under screening !',
                            StatusValue : 1
                        },
                        {
                            Token : token,
                            TID : 0,
                            StatusTitle : 'Shortlisted',
                            MasterID : masterId,
                            FunctionType : 4,
                            ProgressPercent : 20,
                            Status : 1,
                            NotificationMsg : 'Your resume is shortlisted',
                            NotificationMailMsg: 'Your resume is shorlisted !',
                            StatusValue : 2
                        },
                        {
                            Token : token,
                            TID : 0,
                            StatusTitle : 'Interview-1',
                            MasterID : masterId,
                            FunctionType : 4,
                            ProgressPercent : 30,
                            Status : 1,
                            NotificationMsg : 'Interview Level 1 is scheduled',
                            NotificationMailMsg: 'Interview Level 1 is scheduled !',
                            StatusValue : 4
                        },
                        {
                            Token : token,
                            TID : 0,
                            StatusTitle : 'Interview-2',
                            MasterID : masterId,
                            FunctionType : 4,
                            ProgressPercent : 40,
                            Status : 1,
                            NotificationMsg : 'Interview Level 2 is scheduled',
                            NotificationMailMsg: 'Interview Level 2 is scheduled ',
                            StatusValue : 4
                        },
                        {
                            Token : token,
                            TID : 0,
                            StatusTitle : 'Interview-3',
                            MasterID : masterId,
                            FunctionType : 4,
                            ProgressPercent : 50,
                            Status : 1,
                            NotificationMsg : 'Interview Level 3 is scheduled',
                            NotificationMailMsg: 'Interview Level 3 is scheduled !',
                            StatusValue : 5
                        },
                        {
                            Token : token,
                            TID : 0,
                            StatusTitle : 'Documents Received',
                            MasterID : masterId,
                            FunctionType : 4,
                            ProgressPercent : 80,
                            Status : 1,
                            NotificationMsg : 'Your documents are received successfully',
                            NotificationMailMsg: 'Your documents are received successfully',
                            StatusValue : 6
                        },
                        {
                            Token : token,
                            TID : 0,
                            StatusTitle : 'Joined',
                            MasterID : masterId,
                            FunctionType : 4,
                            ProgressPercent : 100,
                            Status : 1,
                            NotificationMsg : 'You have started working',
                            NotificationMailMsg: 'Your have started working',
                            StatusValue : 10
                        },
                        {
                            Token : token,
                            TID : 0,
                            StatusTitle : 'Dropped-Hire in Future',
                            MasterID : masterId,
                            FunctionType : 4,
                            ProgressPercent : 100,
                            Status : 1,
                            NotificationMsg : 'Your application is rejected currently but you can apply in future',
                            NotificationMailMsg: 'Your application is rejected currently but you can apply in future',
                            StatusValue : 10
                        },
                        {
                            Token : token,
                            TID : 0,
                            StatusTitle : 'Dropped-Do not Hire in Future',
                            MasterID : masterId,
                            FunctionType : 4,
                            ProgressPercent : 100,
                            Status : 1,
                            NotificationMsg : 'Your application is rejected',
                            NotificationMailMsg: 'Your application is rejected',
                            StatusValue : 11
                        },
                        {
                            Token : token,
                            TID : 0,
                            StatusTitle : 'Quit',
                            MasterID : masterId,
                            FunctionType : 4,
                            ProgressPercent : 100,
                            Status : 1,
                            NotificationMsg : 'You quit the job',
                            NotificationMailMsg: 'Your quit the job',
                            StatusValue : 10
                        },

                    ];


                    var createStatus = function(masterId){
                        $http({
                            url : GURL + 'ewmSaveStatusType',
                            data : statusData[statusCount],
                            method : 'POST'
                        }).success(function(resp){
                            if(statusCount < (statusData.length -1)){
                                statusCount++;
                                createStatus(masterId);
                            }
                            else{
                                statusCompleteFlag = true;
                                checkCompletion();
                            }
                        }).error(function(err){
                            statusCompleteFlag = true;
                            checkCompletion();
                        });
                    };

                    createStatus(masterId);
                };


                $http({
                    url : GURL + 'ewtGetUserDetails',
                    method : "GET",
                    params :{
                        Token : token
                    }
                }).success(function(resp) {
                    if (resp.length > 0 && resp !== 'null') {
                        var masterId = resp[0].MasterID;
                        createPrimaryStatusTypes(masterId);
                    }
                    else{
                        statusCompleteFlag = true;
                        checkCompletion();
                    }
                }).error(function(err){
                    statusCompleteFlag = true;
                    checkCompletion();
                });



                return defer.promise;
            };

            /**
             *  Primary Registration and SignUp Process
             */
            $scope.doSignUp = function(){
                $scope.$emit('$preLoaderStart');
                $scope.checkEzeidAvailability().then(function(resp){
                    if(!$scope.isEzeidAvailable){
                        $scope.$emit('$preLoaderStop');
                        return false;
                    }

                    var validation = $scope.validateSignUpData();
                    if(!validation){
                        // ////////////console.log($scope.error);
                        $scope.$emit('$preLoaderStop');
                        Notification.error({
                            message : 'Please check all the errors before registration',
                            delay : MsgDelay
                        });
                        return false;
                    }

                    var signUpData = {
                        IDTypeID : $scope.userType ,
                        EZEID : ($scope.ezeid) ? (($scope.ezeid[0] == '@') ? $scope.ezeid : '@'+$scope.ezeid) : '',
                        Password : $scope.password ,
                        FirstName : $scope.firstName,
                        LastName : $scope.lastName ,
                        CompanyName : $scope.companyName ,
                        JobTitle : ($scope.userType == 1) ? $scope.about : '' ,
                        CategoryID : 0 ,
                        FunctionID : 0 ,
                        RoleID : 0 ,
                        LanguageID : 1 ,
                        NameTitleID : 0 ,
                        Latitude : 0 ,
                        Longitude : 0 ,
                        Altitude : 0 ,
                        AddressLine1 : '' ,
                        AddressLine2 : '' ,
                        Area : '' ,
                        CityTitle : '' ,
                        StateID : '' ,
                        CountryID : '' ,
                        PostalCode : '' ,
                        PIN : $scope.pin ,
                        PhoneNumber : '' ,
                        MobileNumber : $scope.mobile ,
                        EMailID : $scope.email ,
                        Picture : '' ,
                        PictureFileName : '' ,
                        WebSite : '' ,
                        AboutCompany : ($scope.userType !== 1) ? $scope.about : '' ,
                        Keywords : null ,
                        Token : null ,
                        Icon : null ,
                        IconFileName : null ,
                        ISDPhoneNumber : null ,
                        ISDMobileNumber : null ,
                        Gender : $scope.gender ,
                        DOB : $scope.dateOfBirth ,
                        OperationType : 1 ,
                        SelectionType : $scope.planSelectionType ,
                        ParkingStatus : null
                    };
                    // ////////////console.log($scope.error);



                    $http({
                        method: "POST",
                        url: GURL + 'ewSavePrimaryEZEData',
                        data: JSON.stringify(signUpData),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).success(function(sResp){
                        if(sResp && sResp.hasOwnProperty('IsAuthenticate') && sResp !== 'null'){
                            if(sResp.IsAuthenticate){

                                if (typeof (Storage) !== "undefined") {
                                    //sResp.userName = (sResp.IDTypeID == 1) ? sResp.FirstName : sResp.CompanyName;
                                    //if(sResp.userName.length > 15){
                                    //    sResp.userName = sResp.userName.substring(0,12)+'...';
                                    //}
                                    if(!sResp.userName){
                                        sResp.userName = $scope.ezeid;
                                    }
                                    var encrypted = CryptoJS.AES.encrypt(JSON.stringify(sResp), "EZEID");

                                    localStorage.setItem("_token", encrypted);
                                    document.cookie="login=1; expires=Thu, 18 Dec 2016 12:00:00 UTC; path=/";

                                    if($scope.userType == 2){
                                        createBasicConf(sResp.Token).then(function(){
                                            $scope.$emit('$preLoaderStop');
                                            $rootScope._userInfo = sResp;
                                            $rootScope._userInfo.userName = sResp.userName;
                                            Notification.success({ message : 'Your EZEOne - '+$scope.ezeid + ' have been generated successfully ! Please fill up you details to proceed', delay : MsgDelay});
                                            $location.path('/profile-manager/user');
                                        },function(){
                                            $scope.$emit('$preLoaderStop');
                                            $rootScope._userInfo = sResp;
                                            $rootScope._userInfo.userName = sResp.userName;
                                            Notification.success({ message : 'Your EZEOne - '+$scope.ezeid + ' have been generated successfully ! Please fill up you details to proceed', delay : MsgDelay});
                                            $location.path('/profile-manager/user');
                                        });
                                    }
                                    else{
                                        $scope.$emit('$preLoaderStop');
                                        $rootScope._userInfo = sResp;
                                        $rootScope._userInfo.userName = sResp.userName;
                                        Notification.success({ message : 'Your EZEOne - '+$scope.ezeid + ' have been generated successfully ! Please fill up you details to proceed', delay : MsgDelay});
                                        $location.path('/profile-manager/user');
                                    }

                                } else {
                                    $scope.$emit('$preLoaderStop');
                                    Notification.error({ message : 'Browser not supported ! Upgrade your browser', delay : MsgDelay});
                                    $location.path('/');
                                }
                            }
                        }
                        else{
                            $scope.$emit('$preLoaderStop');
                            Notification.error({ message : 'An error occured during registration ! Try again', delay : MsgDelay});
                        }
                    }).error(function(sErr){
                        $scope.$emit('$preLoaderStop');
                        Notification.error({ message : 'An error occured during registration ! Try again', delay : MsgDelay});
                    });
                })
            };


            /**
             * Setting up pin empty if checkbox is unticked
             */
            $scope.$watch('isPinApplicable',function(newVal,oldVal){
                if(!newVal){
                    $scope.pin = '';
                }
            });

            $rootScope.$watch('_userInfo',function(newVal){
                if(newVal){
                    if(newVal.IsAuthenticate){
                        $location.path('/profile-manager/user');
                    }
                }
            });


            /**
             * Closes the form and send back user to home page
             */
            $scope.closeForm = function(){
                $location.path('/');
            };

        }]);
