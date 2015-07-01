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


        $scope.editUserDetailsError = {};

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
                if($scope.editUserDetails){

                    $scope.editUserDetails.PIN = '';
                }
            }
        });

        /**
         * Watching on profileEditMode to assign all userDetails to edit mode
         */
        $scope.$watch('profileEditMode',function(newVal,oldVal){
            if(newVal){
                $scope.editUserDetails = angular.copy($scope.userDetails);
                $scope.isPinApplicable = ($scope.editUserDetails.PIN) ? true : false;
            }
        });


        /**
         * Saves userDetails and assign them to ProfielEditCtrl userDetails Model
         * @returns {promise|*}
         */
        $scope.saveUserDetails = function(){
            /**
             * @todo Check Validations
             */

            var defer = $q.defer();
            var data = {
                IDTypeID : $scope.editUserDetails.IDTypeID,
                EZEID : $scope.editUserDetails.EZEID,
                Password : '',
                FirstName : $scope.editUserDetails.FirstName,
                LastName : $scope.editUserDetails.LastName,
                CompanyName : $scope.editUserDetails.CompanyName,
                JobTitle : $scope.editUserDetails.JobTitle,
                CategoryID : 0,
                FunctionID : 0,
                RoleID : 0,
                LanguageID : 1,
                NameTitleID : 0,
                Latitude : ($scope.editUserDetails.Latitude) ? $scope.editUserDetails.Latitude : 0,
                Longitude : ($scope.editUserDetails.Longitude) ? $scope.editUserDetails.Longitude : 0,
                Altitude : ($scope.editUserDetails.Altitude) ? $scope.editUserDetails.Altitude : 0,
                AddressLine1 : $scope.editUserDetails.AddressLine1,
                AddressLine2 : $scope.editUserDetails.AddressLine2,
                Area : ($scope.editUserDetails.Area) ? $scope.editUserDetails.Area : '',
                CityTitle : $scope.editUserDetails.CityTitle,
                StateID : $scope.editUserDetails.StateID,
                CountryID : $scope.editUserDetails.CountryID,
                PostalCode : $scope.editUserDetails.PostalCode,
                PIN : ($scope.editUserDetails.PIN) ? $scope.editUserDetails.PIN : '',
                PhoneNumber : $scope.editUserDetails.PhoneNumber,
                MobileNumber : $scope.editUserDetails.MobileNumber,
                EMailID : $scope.editUserDetails.EMailID,
                Picture  : $scope.editUserDetails.Picture,
                PictureFileName : $scope.editUserDetails.PictureFileName,
                Website : ($scope.editUserDetails.Website) ? $scope.editUserDetails.Website : '',
                AboutCompany: ($scope.editUserDetails.AboutCompany) ? $scope.editUserDetails.AboutCompany : '',
                Keywords : ($scope.editUserDetails.Keywords) ? $scope.editUserDetails.Keywords : '',
                Token : $rootScope._userInfo.Token,
                Icon : ($scope.editUserDetails.Icon) ? $scope.editUserDetails.Icon :'',
                IconFileName : ($scope.editUserDetails.IconFileName) ? $scope.editUserDetails.IconFileName :'',
                ISDPhoneNumber : $scope.editUserDetails.ISDPhoneNumber,
                ISDMobileNumber : $scope.editUserDetails.ISDMobileNumber,
                Gender : $scope.editUserDetails.Gender,
                DOB : $scope.editUserDetails.DOB,
                OperationType : 'U',
                SelectionType : ($scope.IDTypeID === 2) ?
                    (($scope.editUserDetails.SelectionType === 1 || $scope.editUserDetails.SelectionType === 2) ?
                        $scope.editUserDetails.SelectionType : 1) : 0,
                ParkingStatus : $scope.editUserDetails.ParkingStatus,
                TemplateID : ($scope.editUserDetails.TemplateID) ? $scope.editUserDetails.TemplateID : 0
            };

            $http({
                url : GURL + 'ewSavePrimaryEZEData',
                method : 'POST',
                data : data
            }).success(function(resp){
                if(resp && resp !== null && resp !== 'null'){
                    if(resp.IsAuthenticate){
                        Notification.success({ message : 'Your profile details are saved successfully', delay : MsgDelay});

                        for(var prop in $scope.editUserDetails){
                            if($scope.editUserDetails.hasOwnProperty(prop)){
                                for(var prop1 in $scope.userDetails){
                                    if(prop1 == prop){
                                        $scope.userDetails[prop] = $scope.editUserDetails[prop];
                                    }
                                }
                            }
                        }

                        $scope.toggleProfileEditMode();
                        defer.resolve(true);

                    }
                    else{
                        defer.resolve(false);
                        Notification.error({ message : 'An unknown error occurred while saving your profile details', delay : MsgDelay});
                    }
                }
                else{
                    defer.resolve(false);
                    Notification.error({ message : 'An unknown error occurred while saving your profile details', delay : MsgDelay});
                }
            }).error(function(err){
                    defer.reject();
                    Notification.error({ message : 'An unknown error occurred while saving your profile details', delay : MsgDelay});
            });

            return defer.promise;
        };



        $interval(function(){
//            // //////////console.log('userDetails');
//            // //////////console.log($scope.userDetails);
//            // //////////console.log('editUserDetails');
//            // //////////console.log($scope.editUserDetails);
//            // //////////console.log($rootScope._userInfo);
        },1000,2);


    }]);