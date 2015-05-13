"use strict"
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
            var mapLatitude;
            var mapLongitude;

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
                openStatus : false,
                lat:'12.93',
                lng:'77.57'
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

                /* check if the search term is not empty */
                if($scope.searchParams.searchTerm.length < 1){
                    return false;
                }
                /* check if the user is logged in and the search type is 1[EZEID] */
                if(!$rootScope._userInfo.IsAuthenticate && $scope.searchParams.searchType == 1)
                {
                    /* through error */
                    Notification.error({ message : 'Please login to search for EZEID', delay : MsgDelay});
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
                            if(resp){
                                console.log(resp);
                                placeDetail = $scope.googleMap.parseReverseGeolocationData(resp.data);
                                $scope.locationString = placeDetail.city != ''?'Your current location is: '+placeDetail.area+", "+placeDetail.city+", "+placeDetail.state:'';
                                /* Setting up default lattitude & longitude of the map */
                                $scope.searchParams.lat = $scope.googleMap.currentMarkerPosition.latitude;
                                $scope.searchParams.lng = $scope.googleMap.currentMarkerPosition.longitude;
                            }
                        },function(){

                        });
                }
                else{
                    handleNoGeolocation();
                }
            },function(){
                handleNoGeolocation();
            });


            /* Load the map in the modal box */
            /* Google map integration */
            var initializeMap = function(){
                $scope.googleMap.setSettings({
                    mapElementClass : "col-lg-12 col-md-12 col-sm-12 col-xs-12 bottom-clearfix class-map-ctrl-style1",
                    searchElementClass : "form-control pull-left pac-input",
                    currentLocationElementClass : "link-btn pac-loc",
                    controlsContainerClass : "col-lg-6 col-md-6'"
                });
                $scope.googleMap.createMap("modal-map-ctrl",$scope,"findCurrentLocation()");

                $scope.googleMap.renderMap();

                $scope.googleMap.mapIdleListener().then(function(){
                    $scope.googleMap.pushMapControls();
                    $scope.googleMap.listenOnMapControls(getNewCoordinates,getNewCoordinates);
                    $scope.googleMap.resizeMap();
                    /* place the present location marker on map */
                    $scope.googleMap.getCurrentLocation().then(function(e){
                        $scope.googleMap.placeCurrentLocationMarker(getNewCoordinates);
                        $scope.googleMap.resizeMap();
                    },function(){
                        //populateMarkers();
                    });

                });
            };

            /* update the coordinates on drag event of map marker */
            var getNewCoordinates = function(lat,lng)
            {
                console.log(lat);
                $scope.searchParams.lat = lat;
                $scope.searchParams.lng = lng;

                /* get new location string */
                $scope.googleMap.getReverseGeolocation(lat,lng).then(function(resp){
                        if(resp){

                            placeDetail = $scope.googleMap.parseReverseGeolocationData(resp.data);
                            $scope.locationString = placeDetail.city != ''?'Your preferred search location is: '+placeDetail.area+", "+placeDetail.city+", "+placeDetail.state:'';
                        }
                    });

            };

            var isMapInitialized = false;
            $scope.modalVisible = false;
            $scope.modalVisibility = function()
            {
                /* toggle map visibility status */

                $scope.modalVisible = !$scope.modalVisible;
            };

            $scope.$watch('modalVisible',function(newVal,oldVal){

                if(newVal)
                {
                    /* check for the map initialzation */
                    if(!isMapInitialized){
                        /* initialize map */
                        initializeMap();
                        isMapInitialized = true;
                    }
                    else{
                        $timeout(function(){
                            $scope.googleMap.resizeMap();
                        },1500);
                    }
                }

            });


            $scope.modal = {
                title : 'Change Your Searched Location',
                class : 'business-manager-modal'
            };






        }]);
