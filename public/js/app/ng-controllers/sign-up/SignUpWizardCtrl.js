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
        'CountryISDList',
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
            $location,
            CountryISDList
        )
        {
            /**
             * Default is India
             * @type {string}
             */
            $scope.ISDMobile = '+91';
            $scope.countryISDList = CountryISDList;
            $scope.setISDMobileNumber = function(number){
                $scope.ISDMobile = number;
            };

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
            $scope.dateOfBirth = moment().add(18,'y').format("YYYY-MM-DD");


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
                    $scope.selectionString = (parseInt($scope.userType) == 1) ? 'You are signing up as an Individual'
                        : 'You are signing up as a public place';
                    $scope.isEzeidCheckBlockVisible = true;
                }

            };

            $scope.selectPlanSelectionType = function(planSelectionType){
                $scope.selectionString = (parseInt(planSelectionType) == 2) ? 'You are signing up as a Business (Paid listing)'
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
                $scope.error = {};
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

                if(parseInt($scope.userType) == 2){
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
                }



                if(parseInt($scope.userType) !== 3)
                {
                    var emailPattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                    var emailRegEx = new RegExp(emailPattern);

                    var contactInfoStatus = false;

                    if($scope.email){
                        if(!(emailRegEx.test($scope.email))){
                            $scope.error.email = '*Email ID is invalid';
                            validationStatus *= false;
                        }
                        else{
                            contactInfoStatus = true;
                        }
                    }

                    if($scope.mobile){
                        if($scope.ISDMobile){
                            contactInfoStatus = true;
                        }
                    }

                    if(!contactInfoStatus){
                        $scope.error.email = '*Please enter email or mobile number';
                    }



                    if($scope.userType == 1){
                        if(!$scope.firstName){
                            $scope.error.firstName = '*First Name cannot be empty';
                            validationStatus *= false;
                        }

                        if(typeof($scope.firstName) !== "undefined"){
                            if($scope.firstName.length < 1){
                                $scope.error.firstName = "*First Name cannot be empty";
                                validationStatus *= false;
                            }
                        }

                    }


                    if(parseInt($scope.userType) === 1){
                        if(!moment($scope.dateOfBirth).isValid()){
                            $scope.error.dateOfBirth = '*Please enter your date of Birth'
                            validationStatus *= false;
                        }

                    }


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

                console.log($scope.dateOfBirth);

                if(parseInt($scope.userType) === 1){
                    if(moment($scope.dateOfBirth).isValid()){

                    }
                    else{
                        validationStatus *= false;
                        $scope.error.dateOfBirth = 'Please enter valid date of birth';
                    }
                }
                return validationStatus;

            };

            var createBasicConf = function(token){
                var deferx  = $q.defer();
                $timeout(function(){
                    deferx.resolve();
                },200);
                return deferx.promise;
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
                        DOB : moment($scope.dateOfBirth).format('YYYY-MM-DD') ,
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
                                    sResp.ezeid = $scope.ezeid;
                                    if(!sResp.userName){
                                        sResp.userName = $scope.ezeid;
                                    }
                                    console.log(sResp);
                                    var encrypted = CryptoJS.AES.encrypt(JSON.stringify(sResp), "EZEOneID");

                                    localStorage.setItem("_token", encrypted);
                                    document.cookie="login=1; expires=Thu, 18 Dec 2016 12:00:00 UTC; path=/";

                                    if($scope.userType == 2){
                                        createBasicConf(sResp.Token).then(function(){
                                            $scope.$emit('$preLoaderStop');
                                            $rootScope._userInfo = sResp;
                                            $rootScope._userInfo.userName = sResp.userName;
                                            Notification.success({ message : 'Your EZEOne - '+$scope.ezeid + ' have been generated successfully ! Please fill up your details to proceed', delay : MsgDelay});
                                            $location.path('/profile-manager/new');
                                        },function(){
                                            $scope.$emit('$preLoaderStop');
                                            $rootScope._userInfo = sResp;
                                            $rootScope._userInfo.userName = sResp.userName;
                                            $rootScope._userInfo.ezeid = $scope.ezeid;
                                            Notification.success({ message : 'Your EZEOne - '+$scope.ezeid + ' have been generated successfully ! Please fill up your details to proceed', delay : MsgDelay});
                                            $location.path('/profile-manager/new');

                                            console.log($rootScope._userInfo);
                                        });
                                    }
                                    else{
                                        $scope.$emit('$preLoaderStop');
                                        $rootScope._userInfo = sResp;
                                        console.log($rootScope._userInfo);
                                        $rootScope._userInfo.userName = sResp.userName;
                                        $rootScope._userInfo.ezeid = $scope.ezeid;
                                        Notification.success({ message : 'Your EZEOne - '+$scope.ezeid + ' have been generated successfully ! Please fill up your details to proceed', delay : MsgDelay});
                                        $location.path('/profile-manager/new');
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
                        if(parseInt(newVal.Verified) === 0){
                            $location.path('/profile-manager/new');
                        }
                        else{
                            $location.path('/');
                        }

                    }
                }
            });


            /**
             * Closes the form and send back user to home page
             */
            $scope.closeForm = function(){
                $location.path('/');
            };



            $scope.today = function() {
                $scope.dateOfBirth = moment().subtract(10,'years').toDate();
            };
            $scope.today();

            $scope.clear = function () {
                $scope.dateOfBirth = null;
            };

            // Disable weekend selection
            $scope.disabled = function(date, mode) {
                return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
            };

            $scope.toggleMin = function() {
                $scope.minDate = $scope.minDate ? null : moment().subtract(100,'years').toDate();
            };
            $scope.toggleMin();
            $scope.maxDate = new Date();

            $scope.open = function($event) {
                $scope.status.opened = true;
            };

            $scope.dateOptions = {
                formatYear: 'yy',
                startingDay: 1
            };

            $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
            $scope.format = $scope.formats[0];

            $scope.status = {
                opened: false
            };

            var tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            var afterTomorrow = new Date();
            afterTomorrow.setDate(tomorrow.getDate() + 2);
            $scope.events =
                [
                    {
                        date: tomorrow,
                        status: 'full'
                    },
                    {
                        date: afterTomorrow,
                        status: 'partially'
                    }
                ];

            $scope.getDayClass = function(date, mode) {
                if (mode === 'day') {
                    var dayToCheck = new Date(date).setHours(0,0,0,0);

                    for (var i=0;i<$scope.events.length;i++){
                        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

                        if (dayToCheck === currentDay) {
                            return $scope.events[i].status;
                        }
                    }
                }

                return '';
            };

            $timeout(function(){
                $scope.gender = 2;
            },1000);


        }]);
