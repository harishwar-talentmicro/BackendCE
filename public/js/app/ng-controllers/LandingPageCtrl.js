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
            /**
             * searchType
             * 0 : EZEID
             * 1 : Keyword
             * 2 : Job Keyword
             * @type {{searchType: number}}
             */
            $scope.searchType = [
                'EZEID',
                'Keywords',
                'Job Keywords'
            ];

            $scope.placeHolderText = [
                'Type EZEID here',
                'Type keywords to locate products and services',
                'Type Job Skill Keywords to locate employers'
            ];

            $scope.searchParams = {
                searchType : 1,
                searchTerm : '',
                proximity : 50,
                rating : '1,2,3,4,5',
                homeDelivery : false,
                parkingStatus : 0,
                openStatus : false
            };

            $("#range_29").ionRangeSlider({
                type: "double",
                min: 1,
                max: 5,
                step: 1,
                grid: true,
                grid_snap: true,
                keyboard : true,
                onChange : function(obj){
                    var arr = [];
                    for(var ci = obj.from; obj <= obj.to; ci++)
                    {
                        arr.push(ci);
                    }
                    $scope.searchParams.rating = arr.concat(',');
                }
            });

            $scope.isFilterShown = false;

            $scope.toggleFilterContainer = function(e){
                    $scope.isFilterShown = !$scope.isFilterShown;
            };

            /**
             * Triggers Search
             */
            $scope.triggerSearch = function(){
                if($scope.searchParams.searchTerm.length < 1){
                    return false;
                }
                var modifyValue = [
                    'homeDelivery',
                    'parkingStatus',
                    'openStatus'
                ];
                var searchStr = "";
                for(var prop in $scope.searchParams){
                    if($scope.searchParams.hasOwnProperty(prop)){
                        if(modifyValue.indexOf(prop) !== -1){
                            var val = ($scope.searchParams[prop]) ? 1 : 0;
                            var attr = prop + '=' + val +'&'
                            searchStr += attr;
                        }
                        else{
                            searchStr += (prop + '=' + encodeURIComponent($scope.searchParams[prop])+'&');
                        }
                    }
                }

                $location.url('/searchResult?'+searchStr);
            };


            /**
             * Check enter key press in search box
             * @param e
             */
            $scope.checkEnterKey = function(e){
                if(e.charCode === 13 && $scope.searchParams.searchTerm.length > 0){
                    $scope.triggerSearch();
                }
            };



        }]);
