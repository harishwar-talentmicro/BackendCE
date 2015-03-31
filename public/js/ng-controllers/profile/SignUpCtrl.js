/**
 * Sign up Controller
 * @name SignUpCtrl
 * Manages signup functionality
 */

angular.module('ezeidApp').controller('SignUpCtrl', ['$rootScope', '$scope', '$http', '$q', '$timeout', 'Notification', '$filter', '$window','GURL','$interval','ScaleAndCropImage',function ($rootScope, $scope, $http, $q, $timeout, Notification, $filter, $window,GURL,$interval,ScaleAndCropImage) {

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
     * Visibility settting for registering ezeid whose availability is already checked
     * (this block is visibile while user is claiming his ezeid and all other blocks will be hidden)
     * @type {boolean}
     */
    $scope.isEzeidSaveBlockVisible = false;


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


}]);
