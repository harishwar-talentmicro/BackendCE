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
        'GoogleMaps',
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
            GoogleMap
            )
        {
            /**
             * searchType
             * 0 : EZEID
             * 1 : Keyword
             * 2 : Job Keyword
             * @type {{searchType: number}}
             */

            var placeDetail = [];
            var searchTypeArr = ["EZEID","Keywords","Job Keywords"];

            /* splice array as index [0] is there, with empty value */
            $scope.searchType = searchTypeArr;

            var placeHolder = [
                "Type EZEID here",
                "Type keywords to locate products and services",
                "Type Job Skill Keywords to locate employers"
            ];

            $scope.placeHolderText = placeHolder;

            $scope.searchParams = {
                searchType : 2,
                searchTerm : '',
                proximity : 0,
                rating : '1,2,3,4,5',
                homeDelivery : false,
                parkingStatus : 0,
                openStatus : false
            };

            var ratingArr = [];
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
                    var ratingTo = parseInt(obj.to);
                    var ratingFrom = parseInt(obj.from);
                    for(var ci = ratingFrom; ci <= ratingTo; ci++)
                    {
                        arr.push(ci);
                    }
                    $scope.searchParams.rating = arr.join();
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

            var handleNoGeolocation = function(){
                console.log('No Geolocation data');
            };

            $scope.googleMap = new GoogleMap();

            var promise = $scope.googleMap.getCurrentLocation()
                promise.then(function(resp){
                if(resp){
                    $scope.googleMap.getReverseGeolocation($scope.googleMap.currentMarkerPosition.latitude,
                        $scope.googleMap.currentMarkerPosition.longitude).then(function(resp){
                            $scope.placeDetail = $scope.googleMap.parseReverseGeolocationData(resp.data);

                        },function(){

                        });
                }
                else{
                    handleNoGeolocation();
                }
            },function(){
                handleNoGeolocation();
            });



        }]);
