/**
 * ProfileEdit Controller
 * @desc Manages Functionality related to Edit Profile section
 * This inherits scope from Parent and uses value of the models from parent
 */
angular.module('ezeidApp').controller('ProfileEditCtrl',[
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
        MsgDelay,
        $location
        ) {


        /**
         * Method to clone an object
         * @param obj
         * @returns {*}
         */
        function clone(obj) {
            if (null == obj || "object" != typeof obj) return obj;
            var copy = obj.constructor();
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
            }
            return copy;
        }

        /**
         * PIN is applicable to this EZEID or not
         * @type {boolean}
         */
        $scope.isPinApplicable = false;

        /**
         * Watching on pin enable checkbox, if unchecked set pin input box empty
         */
        $scope.$watch('isPinApplicable',function(newVal,oldVal){
            if(!newVal){
                $scope.editUserDetails.PIN == '';
            }
        });

        /**
         * Watching on profileEditMode to assign all userDetails to edit mode
         */
        $scope.$watch('profileEditMode',function(newVal,oldVal){
            if(newVal){
                $scope.editUserDetails = clone($scope.userDetails);
                $scope.isPinApplicable = ($scope.editUserDetails.PIN) ? true : false;
            }
        });




        /**
         * Saves userDetails and assign them to ProfielEditCtrl userDetails Model
         * @returns {promise|*}
         */
        $scope.saveUserDetails = function(){
            var defer = $q.defer();
            /**
             * @todo Save all userDetails to server
             */
            return defer.promise;
        };


//        $interval(function(){
//            console.log('userDetails');
//            console.log($scope.userDetails);
//            console.log('editUserDetails');
//            console.log($scope.editUserDetails);
//        },10000,10);


    }]);