/**
 * Controller to manage all the functionaloties in OUTBOX
 *
 * @author: Krunal[EZE One]
 * @since 20150715
 */
angular.module('ezeidApp').
    controller('ComposeMessageCtrl', [
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
        'MsgDelay',
        '$location',
        '$routeParams',
        'UtilityService',
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
            $location,
            $routeParams,
            UtilityService
        ) {
            //var composeMsg = this;
            $scope.composeMsg = {};

            $scope.sendMessage = function()
            {
                console.log($scope.composeMsg);
            };



        }]);