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

            resizeTile();
            
            var placeDetail = [];
            var searchTypeArr = ["EZEOne ID", "Keywords", "Employers", "Jobs"];

            /* setting default search opptions to OFF */
            $scope.parkingStatus = 0;
            $scope.openStatus = 0;
            $scope.homeDelivery = 0;


            var mapLatitude;
            var mapLongitude;

            /* Star ratings reso. */
            $scope.stars = [true, true, true, true, true];
            $scope.selectStar = function (index) {
                $scope.stars[index] = !$scope.stars[index];
            }

            /* dummy array for creating star rating STARS */
            $scope.starArr = [
                ["a"],
                ["a","b"],
                ["a","b","c"],
                ["a","b","c","d"],
                ["a","b","c","d","e"],
            ];

            /* convert star ratings to comma seperated string */


            $scope.getStars = function () {
                var starStr = [];
                for (var i = 0; i < 5; i++) {
                    if ($scope.activeRating[i]) {
                        starStr.push(i + 1);
                    }
                }
                return starStr.join(",");
            }

            /**
             * get experience
             */
            $scope.getExperience = function()
            {
                var experience = $('#experience').val();
                if(parseInt(experience) > 0)
                {
                    return experience;
                }
                return null;
            }

            /**
             * Get all job types and convert them to comma seperated string
             */
            $scope.getJobType = function()
            {
                var jobTypeStr = [];
                for (var i = 0; i < 8; i++)
                {
                    if ($scope.activeJobType[i])
                    {
                        jobTypeStr.push(i);
                    }
                }
                return jobTypeStr.join(",");
            }

            /* splice array as index [0] is there, with empty value */
            $scope.searchType = searchTypeArr;

            var placeHolder = [
                "Type EZEOne ID to view information",
                "Type Products/Service names to find Business(s)",
                "",
                "Type your Skills to locate nearest Jobs"
            ];

            /* basic settings for searching */
            //$scope.activeSearchType = 2;
            //$scope.activeProximity = 0;//Defaultly ANY proximity is selected
            $scope.activeRating = [true,true,true,true,true];//Checkboxes for star rating
            $scope.activeJobType = [true,true,true,true,true,true,true,true];//Checkboxes for job type


            $scope.placeHolderText = placeHolder;

            /* for normal search keyword */
            $scope.searchParams = {
                searchType: 2,
                searchTerm: '',
                proximity: 0,
                rating: '1,2,3,4,5',
                homeDelivery: false,
                parkingStatus: false,
                openStatus: false,
                promotionsOnly: false,
                experience:'',
                //jobType:'1,2,3,4,5,6',
                lat: '12.93',
                lng: '77.57'
            };

            ///* for job search keyword */
            //$scope.jobSearchParams = {
            //    searchTerm: '',
            //    proximity: 0,
            //    experience:0,
            //    jobType:'1,2,3,4,5,6',
            //    lat: '12.93',
            //    lng: '77.57'
            //};

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

                var modifyValue = [
                    'homeDelivery',
                    'parkingStatus',
                    'openStatus',
                    'promotionsOnly'
                ];
                $scope.searchParams.rating = $scope.getStars();
                $scope.searchParams.jobType = $scope.getJobType();
                $scope.searchParams.experience = $scope.getExperience();

                var searchStr;
                if(parseInt($scope.searchParams.searchType) === 4)//For job search
                {
                    if(!$rootScope._userInfo.IsAuthenticate)
                    {
                        var defer = $q.defer();
                        $rootScope.loginPromise = defer;
                        $timeout(function ()
                        {
                            angular.element('#SignIn_popup').css({'position':'fixed'});
                            angular.element('#SignIn_popup > .window_page').css({'position':'relative'});
                            angular.element('#SignIn_popup').slideDown();
                        },2000);

                        defer.promise.then(function()
                        {
                            searchStr = getJobSearchTermString(modifyValue);
                            $location.url('/jobsearch?' + searchStr);
                        });
                    }
                    else
                    {
                        searchStr = getJobSearchTermString(modifyValue);
                        $location.url('/jobsearch?' + searchStr);
                    }


                      //  searchStr = getJobSearchTermString(modifyValue);
                     //   $location.url('/jobsearch?' + searchStr);

                }
                else//For all other search
                {
                    searchStr = getSearchtermString(modifyValue);
                    $location.url('/searchResult?' + searchStr);
                }
            };

            /**
             * Get the string to search a normal search term
             */
            function getSearchtermString(modifyValue)
            {
                var searchStr = "";
                for (var prop in $scope.searchParams) {
                    if ($scope.searchParams.hasOwnProperty(prop)) {
                        if(prop.toString() == 'experience' || prop.toString() == 'jobType')
                        {
                            continue;
                        }
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
                return searchStr;
            }

            /**
             * Get the string to search JOBs
             */
            function getJobSearchTermString(modifyValue)
            {
                var searchStr = "";
                for (var prop in $scope.searchParams) {
                    if ($scope.searchParams.hasOwnProperty(prop)) {

                        if(
                            prop.toString() == 'promotionsOnly' ||
                            prop.toString() == 'openStatus' ||
                            prop.toString() == 'parkingStatus' ||
                            prop.toString() == 'homeDelivery' ||
                            prop.toString() == 'rating' ||
                            prop.toString() == 'searchType')
                        {
                            continue;
                        }

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
                return searchStr;
            }

            /**
             * Check enter key press in search box
             * @param e
             */
            $scope.checkEnterKey = function (e) {

                if (e.charCode === 13 && $scope.searchParams.searchTerm.length > 0) {
                    $scope.triggerSearch();
                }
                else{
                    $timeout(function(){
                        var a  = $filter('filter')(suggestion,$scope.searchParams.searchTerm);
                        $scope.KeyWords = $filter('filter')(suggestion,$scope.searchParams.searchTerm);
                    },100);
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
                return;
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

            /* reset the filters [star-filter][filter] */
            $scope.resetFilter = function()
            {
                /* uncheck all the filters */
                $('.filter').prop('checked','');

                /* check all the filters */
                $('.star-filter').prop('checked','checked');
                /* set proximity to ANY */
                $('.proximity').val('0');
            }

            /**
             * Initiate tool tip
             */
            $('[data-toggle="tooltip"]').tooltip();

            /* set Auto Completed key word to text field */
            $scope.setAutoCompeted = function(_item)
            {
                $('#searchTextField').val(_item);
                $scope.searchParams.searchTerm = _item;
            };

            var suggestion = [
                '24 x 7 Physician Doctor',
                'Pharmacy',
                'Breakfast',
                'Lunch',
                'Fast Food',
                'Fine Dining',
                'Mall',
                'Pub',
                'Bar & Restaurant',
                'Cofee Shop',
                'SPA',
                'Salon'
            ];

            $scope.KeyWords = [];

            /* on hover change the explanation text in "FOR BUSINESS" */
            $('.hover-tile').mouseenter(function(){
                $('.fr-text').removeClass('hidden');
                $('#desc-text').html($(this).data('text'))});

            $('.hover-tile').mouseout(function(){$('.fr-text').addClass('hidden')});


            /**
             * code for toggling the search options
             */
            $scope.mainToggleStatus = false;
            toggleSearchOptions();
            function toggleSearchOptions()
            {
                $('.advance-filter-btn').click(
                    function(){$('.advance-search').slideToggle("slow",function(){
                        if(!$scope.mainToggleStatus)
                        {
                            $scope.mainToggleStatus = !$scope.mainToggleStatus;
                            $('.advance-filter-btn').children().removeClass('fa-arrow-circle-down').addClass('fa-arrow-circle-up');
                            return;
                        }
                        else
                        {
                            $scope.mainToggleStatus = !$scope.mainToggleStatus;
                            $('.advance-filter-btn').children().removeClass('fa-arrow-circle-up').addClass('fa-arrow-circle-down');
                            return;
                        }

                    })});

                $('.search-option').click(function(){$('.search-option-content').slideToggle("fast",function(){})});
                $('.search-proximity').click(function(){$('.search-proximity-content').slideToggle("fast",function(){})});
                $('.search-rating').click(function(){$('.search-rating-content').slideToggle("fast",function(){})});
                $('.job-type').click(function(){$('.job-type-content').slideToggle("fast",function(){})});
                $('.search-experience').click(function(){$('.search-experience-content').slideToggle("fast",function(){})});
            }

            /**
             * activate search type
             */
            $scope.changeSeacrhType = function(searchType)
            {
                changeSearchFilterVisibility(searchType);
                $scope.searchParams.searchType = searchType;
                if(parseInt(searchType) ===  1)
                {
                    $('.advance-filter-btn').hide();
                    $('.advance-search').hide();
                }
                else
                {
                    $('.advance-filter-btn').show();
                    if(parseInt(searchType) ===  4)
                    {
                        if(!$rootScope._userInfo.IsAuthenticate)
                        {
                            $timeout(function ()
                            {
                                angular.element('#SignIn_popup').css({'position':'fixed'});
                                angular.element('#SignIn_popup > .window_page').css({'position':'relative'});
                                angular.element('#SignIn_popup').slideDown();
                            },2000);
                        }
                    }
                }
            };

            /* change different search option status */
            $scope.changeSearchOptions = function(opt) {
                if (parseInt(opt) === 1) {
                    $scope.searchParams.parkingStatus = !$scope.searchParams.parkingStatus;
                }
                else if (parseInt(opt) === 2) {
                    $scope.searchParams.homeDelivery = !$scope.searchParams.homeDelivery;
                }
                else if (parseInt(opt) === 3) {
                    $scope.searchParams.openStatus = !$scope.searchParams.openStatus;
                }
                else
                {
                    $scope.searchParams.promotionsOnly = !$scope.searchParams.promotionsOnly;
                }
            };

            /**
             * Change the proximity
             */
            $scope.changeProximity = function(proximity)
            {
                $scope.searchParams.proximity = proximity;
            };


            /**
             * Change the active star rating
             */
            $scope.changeActiveRating = function(ratingId)
            {
                $scope.activeRating[ratingId] = !$scope.activeRating[ratingId];
            }

            /**
             * Change the visibility of different filters on the basis of search type
             */
            function changeSearchFilterVisibility(searchOption)
            {
                hideAllSearchOptions();
                switch(searchOption)
                {
                    case 1://EZEOne ID selected
                    {
                        /* do nothing */
                        return;
                    }
                    case 2://Keywords selected
                    {
                        /* enable: Proximity, Search Options & Star Ratings */
                        $('.opt-1').removeClass('hidden');
                        $('.opt-2').removeClass('hidden');
                        $('.opt-3').removeClass('hidden');
                        return;
                    }
                    case 3://Employers selected
                    {
                        /* enable: Proximity & Ratings */
                        $('.opt-1').removeClass('hidden').css('width',"49.7%");
                        $('.opt-3').removeClass('hidden').css('width',"49.7%");

                        $('.drop-down-2').css('padding-left','50.1%');
                        return;
                    }
                    case 4://Job selected
                    {
                        /* enable: Proximity, Job Types & Experience */
                        $('.opt-1').removeClass('hidden');
                        $('.opt-4').removeClass('hidden');
                        $('.opt-5').removeClass('hidden');
                        return;
                    }
                }
            }

            /**
             * hide all the filters from the search bar
             */
            function hideAllSearchOptions()
            {
                $('.opt').each(function(){
                    if(!$(this).hasClass('hidden'))
                    {
                        $(this).addClass('hidden');
                    }
                    $(this).removeAttr('style');
                });
            }

            /**
             * Toggle the text when the screen-size is smaller
             */
            toggleTextOnScreenSize();
            function toggleTextOnScreenSize()
            {
                var screenSize = $(window).width();
                if(parseInt(screenSize) < 500)
                {
                    $('.normal-view-text').hide();
                    $('.mobile-view-text').show();
                }
                else
                {
                    $('.normal-view-text').show();
                    $('.mobile-view-text').hide();
                }
            }

            /**
             * change the value of Job-types
             * @param jobType: the checkbox ID
             */
            $scope.changeJobType = function(jobType)
            {
                $scope.activeJobType[jobType] = !$scope.activeJobType[jobType];
            }

            $scope.hideAll = function()
            {
                $('.search-option-content').slideUp();
                $('.search-proximity-content').slideUp();
                $('.search-rating-content').slideUp();
            }


            function resizeTile()
            {
                var height = $('.init-tile-5').height();
                $('.individual-box').height(height);
            }
        }]);

