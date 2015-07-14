/*
 * Created by admin on 6/5/15.
 */
/**
 * Sign up Controller
 * @name SignUpCtrl
 * Manages signup functionality
 *
 * "use strict";
 */

var res = angular.module('ezeidApp').
    controller('SearchResultCtrl', [
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
        'GoogleMaps',
        '$route',
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
            GoogleMap,
            $route,
            UtilityService
        )
        {
            $scope.resultPerPage = 20;

            var selectAll = false;
            var isResultNumber = 1; /* 1: Results,0:no results */
            var coordinatesArr = [];
            var coordinates = [];
            $scope.searchListMapFlag = false;//1: List, 2:Flag
            var selectedAllResult = 0;
            $scope.selectedList = [];
            $scope.searchResult = [];
            $scope.defaultSearchTerm = '';
            $scope.showLoginText = false;
            /* check box status array */
            $scope.checkBoxStatus = [];

            $scope.modalBox = {
                title : 'EZEOne Map',
                class : 'business-manager-modal'
            };

            /* Star ratings reso. */
            $scope.selectSearchStar = function(index)
            {
                $scope.searchStars[index] = !$scope.searchStars[index];
            }

            /* dummy array for creating star rating STARS */
            $scope.searchStarArr = [
                ["a"],
                ["a","b"],
                ["a","b","c"],
                ["a","b","c","d"],
                ["a","b","c","d","e"]
            ];

            $scope.isSearchInProgress = false;

            var placeHolder = [
                "Type EZEID here",
                "Type keywords to locate products and services",
                "Type Job Skill Keywords to locate employers"
            ];
            var searchTypeArr = ["EZEOne ID", "Keywords", "Job Keywords"];

            $scope.searchType = searchTypeArr;

            $scope.placeHolderText = placeHolder;

            /**
             * Function for converting LOCAL time (local timezone) to server time
             */
            var convertTimeToUTC = function(localTime,dateFormat){
                if(!dateFormat){
                    dateFormat = 'DD-MMM-YYYY hh:mm A';
                }
                return moment(localTime).utc().format(dateFormat);
            };

            /* convert star ratings to comma seperated string */
            $scope.getSearchStars = function()
            {
                var starStr = [];
                for(var i=0;i<5;i++)
                {
                    if($scope.searchStars[i])
                    {
                        starStr.push(i+1);
                    }
                }
                return starStr.join(",");
            }

            //Below line is for Loading img
            $scope.$emit('$preLoaderStart');

            //To Call current url, after login from current page
            if($rootScope._userInfo){
                if(!$rootScope._userInfo.IsAuthenticate){
                    var unregister = $rootScope.$watch('_userInfo',function(newVal,oldVal){
                        if(newVal){
                            if(newVal.hasOwnProperty('IsAuthenticate')){
                                if(newVal.IsAuthenticate){
                                    unregister();
                                    $route.reload();
                                }
                            }
                        }
                    });
                }
            }


            /* make the filter to 0 */
            $scope.changeParkingStatus = function(e)
            {
                $scope.params.parkingStatus = $scope.params.parkingStatus == 0?1:0;
            }
            $scope.changeOpenStatus = function()
            {

                $scope.params.openStatus = $scope.params.openStatus == 0?1:0;
            }
            $scope.changeHomeDelivery = function()
            {
                $scope.params.homeDelivery = $scope.params.homeDelivery == 0?1:0;
            }

            //Set all the serach parameters
            $scope.params = $routeParams;

            $scope.searchParams = $routeParams;
            /* set the lat - long in case the user directly coming to this page */
            $rootScope.coordinatesLat = $routeParams.lat;
            $rootScope.coordinatesLng = $routeParams.lng;


            $scope.searchStars = [false,false,false,false,false];
            var starRating = $scope.params.rating.split(',');
            for(var i=0;i<starRating.length;i++)
            {
                $scope.searchStars[starRating[i]-1] = true;
            }

            //if(($scope.params.searchType == 1) && (!$rootScope._userInfo.IsAuthenticate))
            //{
            //    $scope.showLoginText = true;
            //    Notification.error({ message : 'Please login to search for EZEOne', delay : MsgDelay});
            //    $scope.$emit('$preLoaderStop');
            //}
            //else
            //{
                $scope.showDownloadLink = false;
                $scope.showLoginText = false;
                // To get search key result
                getSearchKeyWord($scope.params);
            //}

            //find out range of the ratings
            var initialVal = $routeParams.rating[0]?$routeParams.rating[0]:1;
            var finalVal = 5;
            for(var i=0; i < $routeParams.rating.length; i++)
            {
                finalVal = $routeParams.rating[i];
            }

            var initial = initialVal;
            var final = finalVal;


            //Below function is for getting key word search result
            function getSearchKeyWord(_filterValue,isTotalNumberRequired)
            {
                var defer = $q.defer();
                /* check for the flag [isTotalNumberRequired] */
                var total = 0;
                var totalStatus = false;
                /* setting the parameters for getting the total number of result */
                if(typeof(isTotalNumberRequired) != undefined && isTotalNumberRequired > 0)
                {
                    totalStatus = true;
                    total = 1;/* It would only fetch the total result */
                }

                /* setting the parameter for implementing pagination */
                var pagecount = 0;
                if($scope.currentStartResultId > 0)
                {
                    pagecount = $scope.currentStartResultId;
                }

                $scope.showDownloadLink = false;
                var today = moment().format('YYYY-MM-DD HH:mm:ss');
                var CurrentDate = UtilityService.convertTimeToUTC(today);

                if(!$rootScope._userInfo){
                    $rootScope._userInfo = {};
                }
                if(!$rootScope._userInfo.Token)
                {
                    $rootScope._userInfo.Token = 2;
                }
                /* set the value of the search term */
                $scope.defaultSearchTerm = _filterValue.searchTerm;
                $scope.$emit('$preLoaderStart');
                $scope.isSearchInProgress = true;
                $http({ method: 'post', url: GURL + 'ewSearchByKeywords', data: {
                    SearchType:_filterValue.searchType,
                    Keywords:_filterValue.searchTerm,
                    Token: $rootScope._userInfo.Token,
                    SCategory:0,
                    Proximity:_filterValue.proximity,
                    Latitude:_filterValue.lat,
                    Longitude:_filterValue.lng,
                    ParkingStatus:_filterValue.parkingStatus,
                    OpenStatus:_filterValue.openStatus,
                    Rating:_filterValue.rating,
                    HomeDelivery:_filterValue.homeDelivery,
                    CurrentDate:CurrentDate,
                    pagecount:pagecount,
                    isPagination:1,
                    pagesize:$scope.resultPerPage
                } }).success(function (data) {
                    $scope.isSearchInProgress = false;
                    $scope.$emit('$preLoaderStop');
                    /* set the total count */
                    $scope.totalResult = data['totalcount'];

                    if(parseInt(_filterValue.searchType) == 1 && (!$rootScope._userInfo.IsAuthenticate)) {
                        if (data.hasOwnProperty('totalcount cond')) {
                            if (parseInt(data.Result[0].IDTypeID) == 1) {
                                $('#SignIn_popup').css({'position':'fixed'});
                                $('#SignIn_popup > .window_page').css({'position':'relative'});
                                $('#SignIn_popup').slideDown();
                                $rootScope.loginPromise = $q.defer();
                                $rootScope.loginPromise.promise.then(function(){
                                    getSearchKeyWord($scope.params);
                                });
                                Notification.error({
                                    title: 'Login Required',
                                    message: 'Please login to search individuals',
                                    delay: MsgDelay
                                });
                                return;
                            }
                        }
                        else if (data.length == 1) {
                            if (parseInt(data[0].IDTypeID) == 1) {
                                $('#SignIn_popup').css({'position':'fixed'});
                                $('#SignIn_popup > .window_page').css({'position':'relative'});
                                $('#SignIn_popup').slideDown();
                                $rootScope.loginPromise = $q.defer();
                                $rootScope.loginPromise.promise.then(function(){
                                    getSearchKeyWord($scope.params);
                                });

                                Notification.error({
                                    title: 'Login Required',
                                    message: 'Please login to search for individual documents',
                                    delay: MsgDelay
                                });
                                return;
                            }
                        }
                    }

                    var result = data['Result'];

                    $rootScope.$broadcast('$preLoaderStop');
                    /* put the maps coordinates in array */
                    $scope.coordinatesArr = [];
                    /* count the result */
                    var count = 0;

                    if(result && result !== 'null'){

                        $window.localStorage.setItem("searchResult", JSON.stringify(result));

                        var link = '';
                        var searchType = $routeParams.searchType;
                        for(var i=0; i<result.length; i++)
                        {
                            count++;
                            link = "/searchDetails?searchType="+searchType+"&TID="+result[i].TID;
                            coordinates.push([result[i].Latitude,result[i].Longitude,result[i].CompanyName,link]);
                            $scope.checkBoxStatus.push(false);
                        }
                        $scope.coordinatesArr = coordinates;
                    }
                    $scope.searchCount = count;

                    /* status to check if there is some result */
                    $scope.isResultNumber = (result && result !== 'null') ? ((result.length > 0) ? 1 : 0) : 0;

                    $scope.searchListData = (result && result !== 'null') ? ((result.length > 0) ? result : []) : [];

                    /* document downloading code block */
                    if (data && data != 'null' && data.length>0)
                    {
                        $scope.SearchResultCount = data.length;

                       // $window.localStorage.setItem("searchResult", JSON.stringify(data));
                        if(data[0].Filename)
                        {
                            $scope.isResultNumber = true;
                            if(($rootScope._userInfo.IsAuthenticate == true) && (data[0].IDTypeID == 1))
                            {
                                $scope.showDownloadLink = true;
                                $scope.downloadData = data[0];

                                var downloadUrl = "/ewtGetSearchDocuments?Token="+$rootScope._userInfo.Token+"&&Keywords="+_filterValue.searchTerm;
                                $window.open(downloadUrl, '_blank');
                            }
                            else
                            {
                                $scope.showDownloadLink = true;
                                $scope.downloadData = data[0];
                                var downloadUrl = "/ewtGetSearchDocuments?Token="+$rootScope._userInfo.Token+"&&Keywords="+_filterValue.searchTerm;
                                $window.open(downloadUrl, '_blank');
                                ////Redirect to Login page
                                //$('#SignIn_popup').slideDown();
                                //$rootScope.defer = $q.defer();
                                //var prom = $rootScope.defer.promise;
                                //prom.then(function(d){
                                //});
                            }
                            $scope.searchListData = null;
                            $scope.searchCount = 0;
                        }
                    }
                    else{
                        $timeout(function(){
                            $scope.$emit('$preLoaderStop');
                        },1500);
                    }
                    /* put a little delay */

                    defer.resolve();
                }).error(function(){
                    $scope.isSearchInProgress = false;
                    Notification.error({ message : 'An error occurred', delay : MsgDelay});
                    $scope.$emit('$preLoaderStop');
                    defer.resolve();
                });
                return defer.promise;
            }


            /**
             * Master search function
             */
            $scope.initiateSearch = function(e){

                /* check if the search term is not empty */
                if($scope.params.searchTerm.length < 1){
                    return false;
                }
                /* check if the user is logged in and the search type is 1[EZEID] */
                /*if(!$rootScope._userInfo.IsAuthenticate && $scope.params.searchType == 1)
                 {
                 *//* through error *//*
                 Notification.error({ message : 'Please login to search for EZEID', delay : MsgDelay});
                 return false;
                 }*/

                /* update the coordinates */
                $scope.params.lat = $rootScope.coordinatesLat;
                $scope.params.lng = $rootScope.coordinatesLng;

                var modifyValue = [
                    'homeDelivery',
                    'parkingStatus',
                    'openStatus'
                ];
                /* check and set all the filter values */
                $scope.checkAndSetFilterValues();

                var searchStr = "";
                $scope.params.rating = $scope.getSearchStars();
                for(var prop in $scope.params){
                    if($scope.params.hasOwnProperty(prop)){
                        if(modifyValue.indexOf(prop) !== -1){
                            var val = ($scope.params[prop] == true) ? 1:0;
                            var attr = prop + '=' + val +'&'
                            searchStr += attr;
                        }
                        else{
                            searchStr += (prop + '=' + encodeURIComponent($scope.params[prop])+'&');
                        }
                    }
                }

                $location.url('/searchResult?'+searchStr);
            };

            var isMapInitialized = false;

            $scope.$watch('searchListMapFlag',function(a,b){

            });


            /* integrate google map */
            var googleMap = new GoogleMap();

            /* Callback function for get current location functionality */
            $scope.findCurrentLocation = function(){
                googleMap.getCurrentLocation().then(function(){
                    googleMap.placeCurrentLocationMarker(null,null,true);
                },function(){
                    googleMap.placeCurrentLocationMarker(null,null,true);
                });
            };

            /* Get the current location string */
            var promise = googleMap.getCurrentLocation()
            promise.then(function (resp) {
                if (resp) {

                    /* push the coordinates on to the API for getting the location string */
                    if($scope.params.lat != 'undefined' || $scope.params.lng != 'undefined')//If lat-lng is set in URL
                    {
                        var coordinates = getSearchedCoordinates($scope.params.lat,$scope.params.lng);
                    }
                    else//If lat-lng is not set in URL
                    {
                        var coordinates = getSearchedCoordinates(googleMap.currentMarkerPosition.latitude,googleMap.currentMarkerPosition.longitude);
                    }


                    googleMap.getReverseGeolocation(coordinates[0],coordinates[1]).then(function (resp) {
                        if (resp) {
                            $rootScope.coordinatesLat = googleMap.currentMarkerPosition.latitude;
                            $rootScope.coordinatesLng = googleMap.currentMarkerPosition.longitude;
                            placeDetail = googleMap.parseReverseGeolocationData(resp.data);

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
                            $scope.locationString = googleMap.createAddressFromGeolocation(placeDetail,options);
                            $scope.location = googleMap.createAddressFromGeolocation(placeDetail,options);
                            /* Setting up default lattitude & longitude of the map */
                            $scope.searchParams.lat = googleMap.currentMarkerPosition.latitude;
                            $scope.searchParams.lng = googleMap.currentMarkerPosition.longitude;
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
                googleMap.getCurrentLocation().then(function(){
                    googleMap.placeCurrentLocationMarker(null,null,false);
                },function(){
                    googleMap.placeCurrentLocationMarker(null,null,false);
                });
            };

            /* Detailed map with all the search result markers */
            var initializeMap = function(){
                googleMap.setSettings({
                    mapElementClass : "col-lg-12 col-md-12 col-sm-12 col-xs-12 bottom-clearfix class-map-ctrl",
                    searchElementClass : "form-control pull-left pac-input",
                    currentLocationElementClass : "link-btn pac-loc",
                    controlsContainerClass : "col-lg-6 col-md-6'"
                });

                googleMap.createMap("map-ctrl",$scope,"findCurrentLocation()");
                googleMap.renderMap();

                googleMap.mapIdleListener().then(function(){
                    googleMap.pushMapControls();
                    googleMap.listenOnMapControls();
                    googleMap.getCurrentLocation().then(function(){
                        googleMap.placeCurrentLocationMarker();
                        populateMarkers();
                        googleMap.setMarkersInBounds();
                    },function(){
                        populateMarkers();
                        googleMap.setMarkersInBounds();
                    });

                });

                /* populates the map marker for search result */
                var populateMarkers = function(){
                    googleMap.resizeMap();
                    googleMap.setMarkersInBounds();
                    //googleMap.toggleMapControls();

                    /* place markers on map */
                    var markerImage = '../../images/business-icon_48.png';
                    for(var i=0;i < $scope.coordinatesArr.length;i++)
                    {
                        if($scope.coordinatesArr[i][0] != 0 || $scope.coordinatesArr[i][0] != 0)
                        {
                            var pos = googleMap.createGMapPosition($scope.coordinatesArr[i][0],$scope.coordinatesArr[i][1]);
                            var marker = googleMap.createMarker(pos,$scope.coordinatesArr[i][2],markerImage,false,null,$scope.coordinatesArr[i][2],$scope.coordinatesArr[i][3]);
                            googleMap.placeMarker(marker,null,null,true,function(link){
                                $window.location.href = link;
                            });
                        }
                    }

                    googleMap.setMarkersInBounds();
                };
            };
            var toggleSearchResult = function(param)
            {
                $scope.searchListMapFlag = param;
            };

            $scope.toggleMapView = function(flag){
                $scope.searchListMapFlag = flag;
                if(!isMapInitialized){
                    initializeMap();
                    isMapInitialized = true;
                }
                else{
                    if(flag){
                        $timeout(function(){
                            googleMap.resizeMap();
                            googleMap.setMarkersInBounds();
                        },500);
                    }
                }
            };

            $scope.checkAllIcons = function()
            {
                for(var i=0;i<$scope.checkBoxStatus.length;i++)
                {
                    $scope.checkBoxStatus[i] = true;
                }
            }

            $scope.uncheckAllIcons = function()
            {
                for(var i=0;i<$scope.checkBoxStatus.length;i++)
                {
                    $scope.checkBoxStatus[i] = false;
                }
            }

            // To check and uncheck All check box
            $scope.toggleCheckboxAll = function(){

                /* toggle the select all variable's value */
                $scope.selectAll = !$scope.selectAll;

                /* chechk all the check boxes */
                if($scope.selectAll)
                {
                    $scope.selectedList = [];
                    selectedAllResult = 1;

                    $scope.checkAllIcons();

                    $scope.searchResult = JSON.parse($window.localStorage.getItem("searchResult"));
                    if(!$scope.searchResult)
                    {
                        $scope.selectedList = [];
                    }
                    else
                    {
                        for (var i = 0; i < $scope.searchResult.length; i++) {
                            $scope.selectedList.push($scope.searchResult[i].TID);
                        }

                        $('.result-checkbox').each(function( index ) {
                            $(this).prop('checked',true);
                        });
                    }
                }
                /* uncheck all the check boxes */
                else{
                    $scope.uncheckAllIcons();
                    selectedAllResult = 0;
                    $scope.selectedList = [];

                    $('.result-checkbox').each(function( index ) {
                        $(this).prop('checked',false);
                    });
                }
            };

            // To get and remove value of check box
            $scope.toggleCheckbox = function(event){
                var elem = event.currentTarget;
                var val = $(elem).data('tid');
                var id = $(elem).data('id');
                $scope.checkBoxStatus[id] = !$scope.checkBoxStatus[id];
                if($(elem).is(":checked")){
                    $scope.selectedList.push(val);

                    if($scope.selectedList.length === $scope.searchResult.length)
                    {
                        $scope._selectAll = true;
                    }
                    else
                    {
                        $scope.selectAll = false;
                    }
                }
                else{
                    var index = $scope.selectedList.indexOf(val);
                    $scope.selectedList.splice(index,1);

                    if($scope.selectedList.length === $scope.searchResult.length)
                    {
                        $scope._selectAll = true;
                    }
                    else
                    {
                        $scope._selectAll = false;
                    }
                }
                $scope.selectAll = $scope._selectAll;
            };

            $rootScope.$on('$locationChangeStart',function(){
                $window.localStorage.setItem("selectedTids", JSON.stringify($scope.selectedList));
            });

            /* redirect to full details page */
            $scope.redirectFullPage = function(searchType,tid,sales,reservation,homeDelivery,service,resume)
            {
                /* redirect to full detail page */

                var params = '?searchType='+searchType+'&TID='+tid;

                if(sales){
                    params += '&sales=true';
                }
                else if(reservation){
                    params += '&reservation=true';
                }
                else if(homeDelivery){
                    params += '&homeDelivery=true';
                }
                else if(service){
                    params += '&service=true';
                }
                else if(resume){
                    params += '&resume=true';
                }

                $location.url('/searchDetails'+params);
            }

            /**
             Select random colors for search result list tiles
             /

             /* make an array of colors for tiles */
            var colorArray = [
                "metro-bg-1",
                "metro-bg-2",
                "metro-bg-3",
                "metro-bg-4",
                "metro-bg-5",
                "metro-bg-6",
                "metro-bg-7",
                "metro-bg-8"
            ];
            $scope.oldColorValue = 0;
            /* generate a random color string */
            $scope.count = 0;
            $scope.random = function(){
                var num = getRandomNumber(colorArray.length);
                if(num != $scope.oldColorValue)
                {
                    $scope.oldColorValue = num;
                    return colorArray[num];
                }
                else
                {
                    return $scope.random();
                }
            };

            var getRandomNumber = function(len)
            {
                return Math.floor(Math.random() * len);
            };


            /**
             * Script responsible for flipping-tiles, It should be loaded after every component is loaded in the page
             */
            $rootScope.$on('$includeContentLoaded', function() {
                $timeout(function(){
                    $(".flip-card").flip({
                        trigger: "hover"
                    });

                },500);
            });

            /**
             * Warning! : Don't Change the function flipping card [responsible for flipping tiles]
             */
            $scope.flipping_card = function()
            {

                $timeout(function(){
                    $(".flip-card").flip({
                        trigger: "hover"
                    });
                },1000);
            }

            /* Basic Kms closed */
            $scope.distanceFilter = function(dist)
            {
                if(dist > 99999)
                {
                    return '99999+ ';
                }
                else if(dist > 10)
                {
                    return Math.round(dist);
                }
                else
                {
                    return dist;
                }
            }

            /* make an address string */
            $scope.makeAddress = function(AddressLine1,AddressLine2,city)
            {
                var addressArr = [AddressLine1,AddressLine2,city];
                return UtilityService.getAddressString(addressArr,35);
            }

            $scope.showDirectionMapPopup = function(Latitude,Longitude,IDTypeID){
                var params = '?endLat='+Latitude+'&endLong='+Longitude+'&IDTypeID='+IDTypeID;
                $location.url('/showmapview'+params);
            };



            /* check and set the value of filter-checkboxes */
            $scope.checkAndSetFilterValues = function()
            {
                var openStatus = $('.chkOpenStatus').prop('checked');
                var homeDelivery = $('.chkHomeDelivery').prop('checked');
                var parkingStatus = $('.chkShowParking').prop('checked');

                $scope.params.parkingStatus = parkingStatus?1:0;
                $scope.params.homeDelivery = homeDelivery?1:0;
                $scope.params.openStatus = openStatus?1:0;
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

            /**
             * Load map in the modal box to change the preferred search location
             * @type {boolean}
             */
            var isModalMapInitialized = false;
            $scope.modalVisible = false;
            $scope.modalVisibility = function () {
                /* toggle map visibility status */
                $scope.modalVisible = !$scope.modalVisible;
            };

            $scope.$watch('modalVisible', function (newVal, oldVal) {
                if (newVal) {
                    /* check for the map initialzation */
                    if (!isModalMapInitialized) {
                        /* initialize map */
                        initializeModalMap();
                        isModalMapInitialized = true;
                    }
                    else {
                        $timeout(function () {
                            googleMap.resizeMap();
                            googleMap.setMarkersInBounds();
                        }, 1500);
                    }
                }
            });

            /* status bit for opening up advance filter option */
            $scope.isFilterShown = false;

            $scope.toggleFilterContainer = function (e) {
                $scope.isFilterShown = !$scope.isFilterShown;
            };

            /* load map in MODAL box for changing the searc */
            var initializeModalMap = function () {
                googleMap.setSettings({
                    mapElementClass: "col-lg-12 col-md-12 col-sm-12 col-xs-12 bottom-clearfix class-map-ctrl-style1",
                    searchElementClass: "form-control pull-left pac-input",
                    currentLocationElementClass: "link-btn pac-loc",
                    controlsContainerClass: "col-lg-6 col-md-6'"
                });
                googleMap.createMap("modal-map-ctrl", $scope, "findCurrentLocation()");

                googleMap.renderMap();
                googleMap.mapIdleListener().then(function () {
                    googleMap.pushMapControls();
                    googleMap.listenOnMapControls(getNewCoordinates, getNewCoordinates);

                    /* place the present location marker on map */
                    if($routeParams['lat']){
                        googleMap.currentMarkerPosition.latitude = $routeParams['lat'];
                        googleMap.currentMarkerPosition.longitude = $routeParams['lng'];
                        googleMap.placeCurrentLocationMarker(getNewCoordinates);

                        /* if this modal box map is opened from search result page: Add marker for additional */
                        googleMap.resizeMap();
                    }
                    else{
                        googleMap.getCurrentLocation().then(function (e) {

                            googleMap.placeCurrentLocationMarker(getNewCoordinates);

                            /* if this modal box map is opened from search result page: Add marker for additional */
                            googleMap.resizeMap();
                            googleMap.setMarkersInBounds();
                        }, function () {

                        });
                    }


                });
            };

            /* update the coordinates on drag event of map marker */
            var getNewCoordinates = function (lat, lng) {
                $rootScope.coordinatesLat = $scope.searchParams.lat = lat;
                $rootScope.coordinatesLng = $scope.searchParams.lng = lng;

                /* get new location string */
                googleMap.getReverseGeolocation(lat, lng).then(function (resp) {
                    if (resp) {

                        placeDetail = googleMap.parseReverseGeolocationData(resp.data);

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
                        $scope.locationString = googleMap.createAddressFromGeolocation(placeDetail,options);

                        $scope.location = googleMap.createAddressFromGeolocation(placeDetail,options);
                    }
                });

            };

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /////////////////////////////////Implement Pagination///////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /* pagination settings goes here */
            //$scope.totalResult = 0;
            $scope.currentStartResultId = 0;
            $scope.isPagination = 1;//Want pagination
            $scope.paginationNext = true;
            $scope.paginationPrevious = true;

            /**
             * Get the total result of the searched parameters
             */
            $scope.$watch('totalResult',function(n,v){
                if(n !== v){
                    if($scope.totalResult <= 20)
                    {
                        $scope.paginationNext = false;
                        $scope.paginationPrevious = false;
                    }
                    else
                    {
                        $scope.paginationPrevious = false;
                        $scope.paginationNext = true;
                    }

                    /**
                     * Temporary fix
                     */
                    if($routeParams.searchType == 1)
                    {
                        $scope.paginationNext = false;
                        $scope.paginationPrevious = false;
                    }
                }
            });

            /**
             * pagination: show next 20 result
             */
            $scope.getNextResultPage = function()
            {
                $scope.currentStartResultId += 20;
                /* just get the next result */
                getSearchKeyWord($scope.params);
                reConfigurePaginationButton();
            }

            /**
             * Pagination: show previous 20 results
             */
            $scope.getPreviousResultPage = function()
            {
                $scope.currentStartResultId -= 20;
                /* just get the next result */
                getSearchKeyWord($scope.params);
                reConfigurePaginationButton();
            }

            /**
             * Reset the status of the pagination button
             */
            function reConfigurePaginationButton()
            {
                if(($scope.currentStartResultId+20) > $scope.totalResult)
                {
                    $scope.paginationNext = false;
                    $scope.paginationPrevious = true;
                }
                else if(($scope.currentStartResultId+20) < $scope.totalResult && ($scope.currentStartResultId+20) > 20)
                {
                    $scope.paginationNext = true;
                    $scope.paginationPrevious = true;
                }
                else
                {
                    $scope.paginationNext = true;
                    $scope.paginationPrevious = false;
                }
            }

            /**
             * refine the module visibility: if there are more then 3 modules are visible show only 3
             * @param val: the original module visibility eg: 11111 or 11010
             * @returns {string} 11100 or 10011 : the number of 1s can't be more than 3
             */
            $scope.refineModuleVisibility = function(val,tid)
            {
                if(val != null) {
                    val = val.split("");
                    var count = 0;
                    for(var i=0; i<val.length; i++)
                    {
                        if(val[i] == 1 && count < 3)
                        {
                            count++;
                        }
                        else
                        {
                            val[i] = 0;
                        }
                    }
                    val = val.join(",");
                    return val.replace(/,/g,'');
                }
            }

            /**
             * Function to redirect to desired url
             */
            $scope.redirectUrl = function(url,userTypeId){
                if(userTypeId && (parseInt(userTypeId) == 2 || parseInt(userTypeId) == 3)){
                    $location.url(url);
                    return;
                }
                if(!$rootScope._userInfo.Token || $rootScope._userInfo.Token == 2){
                    $('#SignIn_popup').css({'position':'fixed'});
                    $('#SignIn_popup > .window_page').css({'position':'relative'});
                    $('#SignIn_popup').slideDown();
                    $rootScope.loginPromise = $q.defer();
                    $rootScope.loginPromise.promise.then(function(){
                        $location.url(url);
                    });
                    return;
                }
                $location.url(url);
            };

            /**
             * Get appropriate company name or the user name, depending upon the search type
             */
            $scope.getCompanyOrIndividualName = function(companyName, name, idTypeId)
            {
                if(parseInt($routeParams.searchType) == 1 && parseInt(idTypeId) == 1)//its Ezeone ID
                {
                    return name != ''?UtilityService.truncate(name,38):'___';
                }
                else
                {
                    return companyName != ''?UtilityService.truncate(companyName,38):'___';
                }
            }

            /**
             * Get the sequence number
             */
            $scope.getSequenceNumber = function(seqNo)
            {
                if(parseInt(seqNo) != 0)
                {
                    return '.L'+seqNo;
                }
                return '';
            }


            /**
             * Search for a keywod
             */
            $scope.searchKey = function(e){
                if(e.charCode === 13 && $scope.params.searchTerm.length > 0){
                    $scope.initiateSearch();
                }
                else{
                    $timeout(function(){
                        var a  = $filter('filter')(suggestion,$scope.params.searchTerm);
                        $scope.KeyWords = $filter('filter')(suggestion,$scope.params.searchTerm);
                    },100);
                }

            };

            /* set Auto Completed key word to text field */
            $scope.setAutoCompeted = function(_item)
            {
                $('#searchTextField').val(_item);
                $scope.params.searchTerm = _item;
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



        }
    ]);