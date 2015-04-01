/**
 * Sign up Controller
 * @name SignUpCtrl
 * Manages signup functionality
 */

angular.module('ezeidApp').controller('SignUpCtrl', ['$rootScope', '$scope', '$http', '$q', '$timeout', 'Notification', '$filter', '$window','GURL','$interval','ScaleAndCropImage','MsgDelay','$location',function ($rootScope, $scope, $http, $q, $timeout, Notification, $filter, $window,GURL,$interval,ScaleAndCropImage,MsgDelay,$location) {

    $("#datetimepicker1").datetimepicker({
        format: 'd-M-Y',
        timepicker : false,
        mask: true,
        hours12: false,
        maxDate: 0,
        maxDate : '+1970/01/02'
    });
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
     * Selects a plan (signup business type)
     * @param userType
     * @param selectionType
     */
    $scope.selectPlan = function(userType,planSelectionType){
        $scope.userType = userType;
        $scope.planSelectionType = planSelectionType;

        $scope.isSignUpTypeBlockVisible = false;
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

        $scope.signUpForm.$setPristine();
    };



    /**
     * Go back to select Plan once again
     */
    $scope.goBack = function(){
        $scope.resetForm();
        $scope.signUpForm.$setPristine();
        $scope.isSignUpTypeBlockVisible = true;
        $scope.isEzeidCheckBlockVisible = false;
    }


    /**
     * Checking EZEID Availability Here
     */
    $scope.checkEzeidAvailability = function(){

        var defer = $q.defer();

        $scope.isEzeidCheckInProgress = true;
        $http({
            method: 'GET',
            url: GURL + 'ewGetEZEID',
            params : {
                EZEID : $scope.ezeid
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

    /**
     *  Primary Registration and SignUp Process
     */
    $scope.doSignUp = function(){
        $scope.checkEzeidAvailability().then(function(resp){
            if(!$scope.isEzeidAvailable){
                return false;
            }
            var signUpData = {
                IDTypeID : $scope.userType ,
                EZEID : $scope.ezeid ,
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
                MobileNumber : '' ,
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
                Gender : null ,
                DOB : $scope.dateOfBirth ,
                OperationType : null ,
                SelectionType : $scope.planSelectionType ,
                ParkingStatus : null
            };


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
                        $rootScope._userInfo = sResp;
                        if (typeof (Storage) !== "undefined") {
                            var encrypted = CryptoJS.AES.encrypt(JSON.stringify(sResp), "EZEID");
                            localStorage.setItem("_token", encrypted);
                            Notification.success({ message : 'Your EZEID - '+$scope.ezeid + ' have been generated successfully ! Please fill up you details to proceed', delay : MsgDelay});
                            $location.path('/editprofile');
                        } else {
                            Notification.error({ message : 'Browser not supported ! Upgrade your browser', delay : MsgDelay});
                            $location.path('/');
                        }
                    }
                 }
                 else{
                     Notification.error({ message : 'An error occured during registration ! Try again', delay : MsgDelay});
                 }
            }).error(function(sErr){
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
    })

    /**
     * Validates the basic signup data before signing in
     */
    $scope.validateSignUpData = function(){

    };


    /**
     * Closes the form and send back user to home page
     */
    $scope.closeForm = function(){
        $location.path('/');
    };

}]);
