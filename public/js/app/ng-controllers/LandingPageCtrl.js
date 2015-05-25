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
        '$routeParams',
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
            GoogleMap,
            $routeParams
        ) {
            /**
             * searchType
             * 0 : EZEID
             * 1 : Keyword
             * 2 : Job Keyword
             * @type {{searchType: number}}
             */

            var placeDetail = [];
            var searchTypeArr = ["EZEID", "Keywords", "Job Keywords"];
            var mapLatitude;
            var mapLongitude;

            /* Star ratings reso. */
            $scope.stars = [true, true, true, true, true];
            $scope.selectStar = function (index) {
                $scope.stars[index] = !$scope.stars[index];
            }

            $scope.starArr = [
                ["a"],
                ["a","b"],
                ["a","b","c"],
                ["a","b","c","d"],
                ["a","b","c","d","e"],
            ];

            /* convert star ratings to comma seperated string */
            var starStr = [];
            $scope.getStars = function () {
                for (var i = 0; i < 5; i++) {
                    if ($scope.stars[i]) {
                        starStr.push(i + 1);
                    }
                }
                return starStr.join(",");
            }

            /* splice array as index [0] is there, with empty value */
            $scope.searchType = searchTypeArr;

            var placeHolder = [
                "Type EZEID here",
                "Type keywords to locate products and services",
                "Type Job Skill Keywords to locate employers"
            ];

            $scope.placeHolderText = placeHolder;

            $scope.searchParams = {
                searchType: 2,
                searchTerm: '',
                proximity: 0,
                rating: '1,2,3,4,5',
                homeDelivery: false,
                parkingStatus: 0,
                openStatus: false,
                lat: '12.93',
                lng: '77.57'
            };

            if ($routeParams['ezeid']) {
                $scope.searchParams.searchTerm = $routeParams['ezeid'];
                $scope.searchParams.searchType = 1;
            }

            $scope.isFilterShown = false;

            $scope.toggleFilterContainer = function (e) {
                $scope.isFilterShown = !$scope.isFilterShown;
            };

            /**
             * Triggers Search
             */
            $scope.triggerSearch = function () {

                /* check if the search term is not empty */
                if ($scope.searchParams.searchTerm.length < 1) {
                    return false;
                }
                /* check if the user is logged in and the search type is 1[EZEID] */
                if (!$rootScope._userInfo.IsAuthenticate && $scope.searchParams.searchType == 1) {
                    /* through error */
                    Notification.error({message: 'Please login to search for EZEID', delay: MsgDelay});
                    return false;
                }

                var modifyValue = [
                    'homeDelivery',
                    'parkingStatus',
                    'openStatus'
                ];

                $scope.searchParams.rating = $scope.getStars();

                var searchStr = "";
                for (var prop in $scope.searchParams) {
                    if ($scope.searchParams.hasOwnProperty(prop)) {
                        if (modifyValue.indexOf(prop) !== -1) {
                            var val = ($scope.searchParams[prop]) ? 1 : 0;
                            var attr = prop + '=' + val + '&'
                            searchStr += attr;
                        }
                        else {
                            searchStr += (prop + '=' + encodeURIComponent($scope.searchParams[prop]) + '&');
                        }
                    }
                }

                $location.url('/searchResult?' + searchStr);
            };


            /**
             * Check enter key press in search box
             * @param e
             */
            $scope.checkEnterKey = function (e) {
                if (e.charCode === 13 && $scope.searchParams.searchTerm.length > 0) {
                    $scope.triggerSearch();
                }
            };

            var handleNoGeolocation = function () {

            };

            $scope.googleMap = new GoogleMap();

            var promise = $scope.googleMap.getCurrentLocation()
            promise.then(function (resp) {
                if (resp) {

                    /* get the current location coordinates and if it don't exists then update with the present Coordinates */
                    var coordinates = getSearchedCoordinates($scope.googleMap.currentMarkerPosition.latitude,$scope.googleMap.currentMarkerPosition.longitude);

                    $scope.googleMap.getReverseGeolocation(coordinates[0],coordinates[1]).then(function (resp) {
                        if (resp) {
                            $rootScope.coordinatesLat = $scope.googleMap.currentMarkerPosition.latitude;
                            $rootScope.coordinatesLng = $scope.googleMap.currentMarkerPosition.longitude;
                            placeDetail = $scope.googleMap.parseReverseGeolocationData(resp.data);

                            //$scope.locationString = placeDetail.city != '' ? 'Your current location is: ' + placeDetail.area + ", " + placeDetail.city + ", " + placeDetail.state : '';
                            var options = {
                                route : true,
                                sublocality3 : true,
                                sublocality2 : true,
                                area : true,
                                city : true,
                                state : true,
                                country : false,
                                postalCode : false
                            };
                            $scope.locationString = $scope.googleMap.createAddressFromGeolocation(placeDetail,options);
                            $scope.location = $scope.googleMap.createAddressFromGeolocation(placeDetail,options);
                            /* Setting up default lattitude & longitude of the map */
                                $scope.searchParams.lat = $scope.googleMap.currentMarkerPosition.latitude;
                            $scope.searchParams.lng = $scope.googleMap.currentMarkerPosition.longitude;
                        }
                        if ($routeParams['ezeid']) {
                            $scope.triggerSearch();
                        }
                    }, function () {
                        if ($routeParams['ezeid']) {
                            $scope.triggerSearch();
                        }
                    });
                }
                else {
                    handleNoGeolocation();
                    if ($routeParams['ezeid']) {
                        $scope.triggerSearch();
                    }
                }
            }, function () {
                if ($routeParams['ezeid']) {
                    $scope.triggerSearch();
                }
                handleNoGeolocation();
            });


            /* Callback function for get current location functionality */
            $scope.findCurrentLocation = function(){
                $scope.googleMap.getCurrentLocation().then(function(){
                    $scope.googleMap.placeCurrentLocationMarker(null,null,true);
                },function(){
                    $scope.googleMap.placeCurrentLocationMarker(null,null,true);
                });
            };

            /* Load the map in the modal box */
            /* Google map integration */
            var initializeMap = function () {
                $scope.googleMap.setSettings({
                    mapElementClass: "col-lg-12 col-md-12 col-sm-12 col-xs-12 bottom-clearfix class-map-ctrl-style1",
                    searchElementClass: "form-control pull-left pac-input",
                    currentLocationElementClass: "link-btn pac-loc",
                    controlsContainerClass: "col-lg-6 col-md-6'"
                });
                $scope.googleMap.createMap("modal-map-ctrl", $scope, "findCurrentLocation()");

                $scope.googleMap.renderMap();
                $scope.googleMap.mapIdleListener().then(function () {
                    $scope.googleMap.pushMapControls();
                    $scope.googleMap.listenOnMapControls(getNewCoordinates, getNewCoordinates);

                    /* place the present location marker on map */
                    if($routeParams['lat']){
                        $scope.googleMap.currentMarkerPosition.latitude = $routeParams['lat'];
                        $scope.googleMap.currentMarkerPosition.longitude = $routeParams['lng'];
                        $scope.googleMap.placeCurrentLocationMarker(getNewCoordinates);

                        /* if this modal box map is opened from search result page: Add marker for additional */
                        $scope.googleMap.resizeMap();
                    }
                    else{
                        $scope.googleMap.getCurrentLocation().then(function (e) {

                            $scope.googleMap.placeCurrentLocationMarker(getNewCoordinates);

                            /* if this modal box map is opened from search result page: Add marker for additional */
                            $scope.googleMap.resizeMap();
                            $scope.googleMap.setMarkersInBounds();
                        }, function () {

                        });
                    }


                });
            };

            /* place this marker if the preffered search location is different from your present location */

            var populateMarkers = function () {
                $scope.googleMap.resizeMap();
                $scope.googleMap.setMarkersInBounds();
                //$scope.googleMap.toggleMapControls();

                /* place markers on map for different searched coordinates */
                var markerImage = '../../images/business-icon_48.png';
                var pos = $scope.googleMap.createGMapPosition($routeParams.lat, $routeParams.lng);
                var marker = $scope.googleMap.createMarker(pos, "Current Searched Location", markerImage, false, null);
                $scope.googleMap.placeMarker(marker);

                $scope.googleMap.setMarkersInBounds();
            };
            /* update the coordinates on drag event of map marker */
            var getNewCoordinates = function (lat, lng) {
                $rootScope.coordinatesLat = $scope.searchParams.lat = lat;
                $rootScope.coordinatesLng = $scope.searchParams.lng = lng;

                /* get new location string */
                $scope.googleMap.getReverseGeolocation(lat, lng).then(function (resp) {
                    if (resp) {

                        placeDetail = $scope.googleMap.parseReverseGeolocationData(resp.data);

                        var options = {
                            route : true,
                            sublocality3 : true,
                            sublocality2 : true,
                            area : true,
                            city : true,
                            state : true,
                            country : false,
                            postalCode : false
                        };
                        $scope.locationString = $scope.googleMap.createAddressFromGeolocation(placeDetail,options);

                        $scope.location = $scope.googleMap.createAddressFromGeolocation(placeDetail,options);
                    }
                });

            };

            /**
             * Load map in the modal box to change the preferred search location
             * @type {boolean}
             */
            var isMapInitialized = false;
            $scope.modalVisible = false;
            $scope.modalVisibility = function () {
                /* toggle map visibility status */
                $scope.modalVisible = !$scope.modalVisible;
            };

            $scope.$watch('modalVisible', function (newVal, oldVal) {
                if (newVal) {
                    /* check for the map initialzation */
                    if (!isMapInitialized) {
                        /* initialize map */
                        initializeMap();
                        isMapInitialized = true;
                    }
                    else {
                        $timeout(function () {
                            $scope.googleMap.resizeMap();
                            $scope.googleMap.setMarkersInBounds();
                        }, 1500);
                    }
                }
            });

            /* modal box for loading map and change the searched map loacaion */
            $scope.modal = {
                title: 'Change Your Searched Location',
                class: 'business-manager-modal'
            };


            /* Star Rating Functionalities */
            $scope.star = [false, false, false, false, false];
            $scope.max = getMinStarVal();
            $scope.min = getMaxStarVal();
            $scope.click1 = false;
            $scope.click2 = false;
            $scope.starRatingFilterAction = function (starNumber) {
                $scope.star[starNumber] = !$scope.star[starNumber];
                return;
                if ($scope.click1 == false && $scope.click2 == false) {
                    $scope.click1 = starNumber;
                    return;
                }

                var max = getMaxStarVal();
                var min = getMinStarVal();
                if (starNumber < max && starNumber > min) {
                    /* fill all the intermediate stars */
                    fillStar(starNumber, max);
                }
                else if (starNumber > max) {
                    /* fill all the intermediate stars */
                    fillStar(min, starNumber);
                }
                else if (starNumber < min) {
                    fillStar(starNumber, max);
                }

            }

            /* reset the star filtering */
            function resetStarFilter() {
                for (var i = 0; i < 5; i++) {
                    $scope.star[i] = false;
                }
            }

            /* fill the stars if we get the range */
            function fillStar(start, end) {
                resetStarFilter();
                for (var i = start; i <= end; i++) {
                    $scope.star[i] = true;
                }
            }

            /* unfill stars */
            function unfillStars(value) {
                var maxVal = getMaxStarVal();
                if (value <= maxVal) {
                    /* Unfill all the stars before this value */
                    for (var i = 0; i < value; i++) {
                        $scope.star[i] = false;
                    }
                }
                else {
                    /* Unfill all the stars before this value */
                    for (var i = value; i < 5; i++) {
                        $scope.star[i] = false;
                    }
                }
            }

            /* get maximum value of stars */
            function getMaxStarVal() {
                var maxVal = 0;
                for (var i = 0; i < 5; i++) {
                    if ($scope.star == true && $scope.star > maxVal) {
                        maxVal = i;
                    }
                }
                return maxVal;
            }

            /* get minimum value of stars */
            function getMinStarVal() {
                var minVal = 0;
                for (var i = 4; i >= 0; i--) {
                    if ($scope.star == true && $scope.star < minVal) {
                        minVal = i;
                    }
                }
                return minVal;
            }

            $timeout(function () {
                var image = new Image();

                image.onload = function () {
                    $('.main-page-image').css({
                            'background': 'url(/images/bg-test.jpg)',
                            'background-size': 'cover'
                    });

                    $timeout(function(){
                        $('.landing-center').css({
                            'opacity' : 0.7
                        });
                        $('.landing-center').fadeTo(3000,1).css({
                            'background' : 'rgba(0, 0, 0, 0.5)'
                        });
                    },500);

                }
                image.src = '/images/bg-test.jpg';
            },2);

            /**
             *
             * Get the location string and perform all CHECKS
             */
            function getLocationString(area, city, state)
            {
                var str = [];
                if(typeof(area) != 'undefined' && area.length > 0)
                {
                    str.push(area);
                }

                if(typeof(city) != 'undefined' && city.length > 0)
                {
                    str.push(city);
                }

                if(typeof(state) != 'undefined' && state.length > 0)
                {
                    str.push(state);
                }

                return str.join(", ");
            }

            /* get lattitude and longitude based on present lat and lng */
            function getSearchedCoordinates(lat,lng)
            {
                if(typeof($routeParams.lat) != 'undefined' && typeof($routeParams.lng) != 'undefined')
                {
                    return [$routeParams.lat,$routeParams.lng];
                }
                else
                {
                    return [lat,lng];
                }
            }

        }]);

