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
            $scope.composeMsg = {};

            this.sendMessage = function()
            {
                console.log($scope.composeMsg);
            };



        }]);