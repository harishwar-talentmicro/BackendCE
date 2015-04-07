/**
 * ProfileEdit Controller
 * @desc Manages Functionality related to Edit Profile section
 * This inherits scope from Parent and uses value of the models from parent
 */
angular.module('ezeidApp').controller('LocationsCtrl',[
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

        $scope.locationsToggleIndex = [
            { editMode : false, viewMode : false}
        ];

        $scope.toggleLocations = function(locationIndex,editMode){
            var toggleIndex = $scope.locationsToggleIndex[locationIndex];

            if(toggleIndex.viewMode && editMode){
                $scope.locationsToggleIndex[toggleIndex].viewMode = true;
                $scope.locationsToggleIndex[toggleIndex].editMode = true;
            }
            else if(toggleIndex.viewMode && toggleIndex.editMode){
                $scope.locationsToggleIndex[toggleIndex].editMode = false;
                $scope.locationsToggleIndex[toggleIndex].viewMode = true;
            }

            else if(toggleIndex.viewMode){
                $scope.locationsToggleIndex[toggleIndex].editMode = false;
                $scope.locationsToggleIndex[toggleIndex].viewMode = false;
            }

            else{
                $scope.locationsToggleIndex[toggleIndex].viewMode = true;
            }
        }

    }]);