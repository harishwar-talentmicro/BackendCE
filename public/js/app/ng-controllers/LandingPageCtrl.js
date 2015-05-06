/**
 * Sign up Controller
 * @name SignUpCtrl
 * Manages signup functionality
 *
 * "use strict";
 */

angular.module('ezeidApp').
    controller('LandingPageCtrl', [
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
            )
        {

            $("#range_29").ionRangeSlider({
                type: "double",
                min: 1,
                max: 5,
                step: 1,
                grid: true,
                grid_snap: true,
                keyboard : true,
                onChange : function(obj){
                    /**
                     * Values can be captured when this input is changed
                     * var fromRange = obj.from ; var toRange = obj.to;
                     */

                }
            });

            $scope.isFilterShown = false;

            $scope.toggleFilterContainer = function(e){
                    $scope.isFilterShown = !$scope.isFilterShown;
            };




        }]);
