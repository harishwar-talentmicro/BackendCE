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

            $scope.activeTemplate = "";
            $scope.showMapPopupModel = false;
            $scope.showDetailsModal1 = false;

            var AutoRefresh = false;
            var currentBanner = 1;
            var Miliseconds = 8000;
            var RefreshTime = Miliseconds;
            var destroyModalDetailsWatcher = null;

            $scope.modalBox = {
                title : 'EZEID Map',
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
                ["a","b","c","d","e"],
            ];

            var placeHolder = [
                "Type EZEID here",
                "Type keywords to locate products and services",
                "Type Job Skill Keywords to locate employers"
            ];
            var searchTypeArr = ["EZEID", "Keywords", "Job Keywords"];

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

            /**
             * Function for converting UTC time from server to LOCAL timezone
             */
            var convertTimeToLocal = function(timeFromServer,dateFormat,returnFormat){
                if(!dateFormat){
                    dateFormat = 'DD-MMM-YYYY hh:mm A';
                }
                if(!returnFormat){
                    returnFormat = dateFormat;
                }
                var x = new Date(timeFromServer);
                var mom1 = moment(x);
                return mom1.add((mom1.utcOffset()),'m').format(returnFormat);
            };

            function selectedTimeUtcToLocal(selectedTime)
            {
                var x = new Date();
                var today = moment(x.toISOString()).utc().format('DD-MMM-YYYY');

                var currentTaskDate = moment(today+' '+selectedTime).format('DD-MMM-YYYY H:mm');
                return convertTimeToLocal(currentTaskDate,'DD-MMM-YYYY H:mm',"H:mm");
            }


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
            if($rootScope._userInfo)
            {
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

            if(($scope.params.searchType == 1) && (!$rootScope._userInfo.IsAuthenticate))
            {
                $scope.showLoginText = true;
                Notification.error({ message : 'Please login to search for EZEID', delay : MsgDelay});
                $scope.$emit('$preLoaderStop');
            }
            else
            {
                $scope.showDownloadLink = false;
                $scope.showLoginText = false;

                getSearchKeyWord($scope.params);

                console.log($scope.params);

                if(($scope.params.TID) && ($scope.params.TID != 0))
                {
                    //call for search information
                    $scope.TID = $scope.params.TID;

                    getSearchInformation($scope.params.TID,$scope.params.searchType);
                }
            }

            // find out range of the ratings
            var initialVal = $routeParams.rating[0]?$routeParams.rating[0]:1;
            var finalVal = 5;
            for(var i=0; i < $routeParams.rating.length; i++)
            {
                finalVal = $routeParams.rating[i];
            }

            var initial = initialVal;
            var final = finalVal;

            //Below function is for getting key word search result
            function getSearchKeyWord(_filterValue)
            {
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
                    isPagination:0,
                    pagesize:0,
                    pagecount:0,
                    total:0,
                    CurrentDate:convertTimeToUTC(CurrentDate,'YYYY-MM-DD HH:mm:ss')

                } }).success(function (data) {
                     if(!$scope.TID)
                     {
                         $rootScope.$broadcast('$preLoaderStop');
                     }

                    /* put the maps coordinates in array */
                    $scope.coordinatesArr = [];
                    /* count the result */
                    var count = 0;
                    if(data != 'null'){
                        var link = '';
                        var searchType = $routeParams.searchType;
                        for(var i=0; i<data.length; i++)
                        {
                            count++;
                            link = "/searchDetails?searchType="+searchType+"&TID="+data[i].TID;
                            coordinates.push([data[i].Latitude,data[i].Longitude,data[i].CompanyName,link]);
                            $scope.checkBoxStatus.push(false);
                        }
                        $scope.coordinatesArr = coordinates;
                    }
                    $scope.searchCount = count;

                    /* status to check if there is some result */
                    $scope.isResultNumber = (data == 'null') ?0 : 1;

                    $scope.searchListData = (data == 'null') ? [] : data;
                    if (data != 'null' && data.length>0)
                    {
                        $scope.SearchResultCount = data.length;
                        $window.localStorage.setItem("searchResult", JSON.stringify(data));
                        if(data[0].Filename)
                        {
                            if(($rootScope._userInfo.IsAuthenticate == true) && (data[0].IDTypeID == 1))
                            {
                                $scope.showDownloadLink = true;
                                $scope.downloadData = data[0];

                                var downloadUrl = "/ewtGetSearchDocuments?Token="+$rootScope._userInfo.Token+"&&Keywords="+_filterValue.searchTerm;
                                $window.open(downloadUrl, '_blank');
                            }
                            else
                            {
                                //Redirect to Login page
                                $('#SignIn_popup').slideDown();
                                $rootScope.defer = $q.defer();
                                var prom = $rootScope.defer.promise;
                                prom.then(function(d){
                                });
                            }
                            $scope.searchListData = null;
                            $scope.searchCount = 0;
                        }
                    }
                    /* put a little delay */
                    $timeout(function(){
                       // $scope.$emit('$preLoaderStop');
                    },1500);

                }).error(function(){
                    Notification.error({ message : 'An error occurred', delay : MsgDelay});
                    $scope.$emit('$preLoaderStop');
                });
            }

            /**
             * Search for a keywod
             */
            $scope.searchKey = function(e){

                if(e.charCode === 13 && $scope.params.searchTerm.length > 0){
                    $scope.initiateSearch();
                }
            };

            /**
             * Master search function
             */
            $scope.initiateSearch = function(e){

                /* check if the search term is not empty */
                if($scope.params.searchTerm.length < 1){
                    return false;
                }
                /* check if the user is logged in and the search type is 1[EZEID] */
                if(!$rootScope._userInfo.IsAuthenticate && $scope.params.searchType == 1)
                {
                    /* through error */
                    Notification.error({ message : 'Please login to search for EZEID', delay : MsgDelay});
                    return false;
                }

                /* update the coordinates */
                $scope.params.lat = $rootScope.coordinatesLat;
                $scope.params.lng = $rootScope.coordinatesLng;
                $scope.params.TID = 0;

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


            /* Load the map in the modal box */
            /* Google map integration */
            var initializeMap = function () {
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
                //////console.log(googleMap);
                googleMap.getCurrentLocation().then(function(){
                    googleMap.placeCurrentLocationMarker(null,null,false);
                },function(){
                    googleMap.placeCurrentLocationMarker(null,null,false);
                });
            };

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

            /*open detail information popup*/
            $scope.openDetailInfoBox = function(_tid)
            {
                $scope.SearchInfo = {};
                $scope.nextButton = true;
                $scope.previousButton =  true;

                $scope.activeTemplate = "";
                $scope.showWorkingHourModel = false;
                $scope.showMapPopupModel = false;
                $scope.showDetailsModal = false;
                $scope.showNoticeText = true;
                $scope.form_rating = 0;
                $scope.showLoginText = false;
                $scope.showNotFound = false;
                $scope.showDetailsModal1 = false;

                if(($routeParams.searchType == 1) && (!$rootScope._userInfo.IsAuthenticate))
                {
                    $scope.showLoginText = true;
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message : 'Please login to search for EZEID', delay : MsgDelay});
                }
                else
                {
                    // $scope.showLoginText = false;

                  /*  var ams = {
                        searchType: $routeParams.searchType,
                        TID: _tid,
                        searchTerm: $routeParams.searchTerm,
                        proximity: $routeParams.proximity,
                        rating: $routeParams.rating,
                        homeDelivery: $routeParams.homeDelivery,
                        parkingStatus: $routeParams.parkingStatus,
                        openStatus: $routeParams.openStatus,
                        lat: $routeParams.lat,
                        lng: $routeParams.lng
                    };

                    console.log("sai555");
                    console.log(ams);

                    $routeParams = ams;

                    console.log("sai888");
                    console.log($routeParams);*/

                  //  getSearchInformation(_tid,$routeParams.searchType);


                     var params = '?searchType='+$routeParams.searchType+'&TID='+_tid;
                     params += '&searchTerm='+$routeParams.searchTerm;
                     params += '&proximity='+$routeParams.proximity;
                     params += '&rating='+$routeParams.rating;
                     params += '&homeDelivery='+$routeParams.homeDelivery;
                     params += '&parkingStatus='+$routeParams.parkingStatus;
                     params += '&openStatus='+$routeParams.openStatus;
                     params += '&lat='+$routeParams.lat;
                     params += '&lng='+$routeParams.lng;

                     $location.url('/searchResult'+params);
                }


            }

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
                $scope.showDetailsModal1 = true;
                // $location.url('/searchDetails'+params);
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
                //console.log('flip');

                $timeout(function(){
                    //console.log('flip');
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
                return UtilityService.getAddressString(addressArr,40);
            }

            $scope.showDirectionMapPopup = function(Latitude,Longitude,IDTypeID){


                $scope.activeTemplate = "html/mapPopView.html";
                $scope.showMapPopupModel = true;
f
                var userLoc = {
                    endLat : Latitude,
                    endLong : Longitude,
                    IDTypeID : IDTypeID
                };

                $window.localStorage.setItem("myLocation", JSON.stringify(userLoc));
            };


            $('#mapPOPUP').on('hidden.bs.modal', function () {

                $scope.showMapPopupModel = false;
                $scope.activeTemplate = "";

            })

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
                        initializeModalMap();
                        isMapInitialized = true;
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

            /* load map in modal box for changing the searc */
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

            //Below function is for getting search information
            function getSearchInformation(_TID,_SearchType)
            {
                $scope.$emit('$preLoaderStart');

                var defer = $q.defer();
                $scope.SearchInfo = {};
                $scope.AddressForInfoTab = "";
                AutoRefresh = false;
                if(!$rootScope._userInfo)
                {
                    $rootScope._userInfo = {};
                }
                if(!$rootScope._userInfo.IsAuthenticate){
                    $rootScope._userInfo.Token = 2;
                    $scope.Token = 2;
                }

                var CurrentDate = moment().format('YYYY-MM-DD HH:mm:ss');

                $http({ method: 'get',
                    url: GURL + 'ewtGetSearchInformation?Token=' + $rootScope._userInfo.Token + '&TID=' + _TID + '&SearchType=' + _SearchType + '&CurrentDate=' + convertTimeToUTC(CurrentDate,'YYYY-MM-DD HH:mm:ss')}).success(function (data) {
                        console.log("SAi123");
                        $rootScope.$broadcast('$preLoaderStop');
                        if (data && data != 'null')
                        {
                            console.log("Detail",data);
                            $timeout(function () {
                                $scope.SearchInfo = data[0];
                                $scope.showDetailsModal1 = true;

                                if($scope.SearchInfo.IDTypeID == 2)
                                {
                                    getAboutComapny();
                                }

                                if(_TID == $scope.SearchInfo.LocID)
                                {
                                    $scope.showNoticeText = false;
                                }

                                $scope.showSalesEnquiry = $scope.SearchInfo.VisibleModules[0];
                                $scope.shoReserVation = $scope.SearchInfo.VisibleModules[1];
                                $scope.showHomeDelivery = $scope.SearchInfo.VisibleModules[2];
                                $scope.showServiceRequest = $scope.SearchInfo.VisibleModules[3];
                                $scope.showSendCv = $scope.SearchInfo.VisibleModules[4];

                                //Below lines are to show address in info tab
                                $scope.AddressForInfoTab = ($scope.SearchInfo.AddressLine1 != "") ? $scope.SearchInfo.AddressLine1 +', ' : "";
                                $scope.AddressForInfoTab += ($scope.SearchInfo.AddressLine2 != "") ? $scope.SearchInfo.AddressLine2 +', ' : "";
                                $scope.AddressForInfoTab += ($scope.SearchInfo.CityTitle != "") ? $scope.SearchInfo.CityTitle +', ' : "";
                                $scope.AddressForInfoTab += ($scope.SearchInfo.CountryTitle != "") ? $scope.SearchInfo.CountryTitle +', ' : "";
                                $scope.AddressForInfoTab += ($scope.SearchInfo.PostalCode != "") ? $scope.SearchInfo.PostalCode : "";

                                $window.localStorage.setItem("myLocation",$scope.SearchInfo.Latitude+","+$scope.SearchInfo.Longitude );

                                if($scope.SearchInfo.ParkingStatus==0)
                                {
                                    $scope.parkingTitle = "Parking Status";
                                }
                                if($scope.SearchInfo.ParkingStatus==1)
                                {
                                    $scope.parkingTitle = "Public Parking";
                                }
                                if($scope.SearchInfo.ParkingStatus==2)
                                {
                                    $scope.parkingTitle = "Vallet Parking";
                                }
                                if($scope.SearchInfo.ParkingStatus==3)
                                {
                                    $scope.parkingTitle = "No parking";
                                }

                                $scope.form_rating = data[0].Rating;

                                //Call for banner
                                AutoRefresh = true;
                                getBanner(1);

                                if($scope.SearchInfo.IDTypeID == 2)
                                {
                                    $scope.reservationPlaceHolder = "Reservation requirement details";
                                }
                                else
                                {
                                    $scope.reservationPlaceHolder = "Appointment requirement details";
                                }
                               // defer.resolve();
                            });
                        }
                        else
                        {
                            $scope.showNotFound = true;
                          //  defer.reject();
                       }
                    })
                    .error(function(data, status, headers, config) {
                     //   defer.reject();
                        $rootScope.$broadcast('$preLoaderStop');
                    });
              //  return defer.promise;
            }

            //Below function is for getting about company
            function getAboutComapny()
            {
                $http({ method: 'get', url: GURL + 'ewtCompanyProfile?TID=' + $scope.SearchInfo.TID}).success(function (data) {
                    if (data.Result.length > 0) {
                        $scope.companyTagLine = data.Result[0].TagLine;
                    }
                });
            }

            //Auto refresh Banner
            $interval(function() {

                if(AutoRefresh == true && $scope.SearchInfo.Banners != 1)
                {
                    currentBanner = currentBanner + 1;
                    if(currentBanner <= $scope.SearchInfo.Banners)
                    {
                        getBanner(currentBanner);
                    }
                    else
                    {
                        currentBanner = 1;
                        getBanner(currentBanner);
                    }
                }
            },RefreshTime);

            //False when navigate to other page
            $scope.$on('$locationChangeStart', function( event ) {
                AutoRefresh = false;
            });

            // To get banner
            function getBanner(_requestedBannerValue)
            {
                $http({ method: 'get', url: GURL + 'ewtGetBannerPicture?SeqNo='+_requestedBannerValue+'&Ezeid='+$scope.SearchInfo.EZEID+'&StateTitle='+ $scope.SearchInfo.StateTitle+'&LocID='+$scope.SearchInfo.LocID}).success(function (data) {

                    if (data.Picture != 'null') {
                        $scope.SearchInfo.BannerImage = data.Picture;
                        if(currentBanner >= $scope.SearchInfo.Banners)
                        {
                            //Disable next button
                            $scope.nextButton = false;
                        }
                        else
                        {
                            //Enable next button
                            $scope.nextButton = true;
                        }

                        if(currentBanner <= 1)
                        {
                            //Disabled previous button
                            $scope.previousButton = false;
                        }
                        else
                        {   //Enable previous button
                            $scope.previousButton = true;
                        }
                    }
                    else
                    {
                        Notification.error({ message: "No Banner found..!", delay: MsgDelay });
                    }
                });
            }

            //call for previous banner
            $scope.getPreviousBanner = function(){
                currentBanner = currentBanner - 1;
                if(currentBanner >= 1)
                {
                    getBanner(currentBanner);
                    RefreshTime = Miliseconds;
                }
            };

            //call for next banner
            $scope.getNextBanner = function () {
                currentBanner = currentBanner + 1;
                if(currentBanner <= $scope.SearchInfo.Banners)
                {
                    getBanner(currentBanner);
                    RefreshTime = Miliseconds;
                }
            };

            //open working hour popup
            $scope.openWorkingHourPopup = function () {
                $scope.$emit('$preLoaderStart');
                if($rootScope._userInfo.Token == 2)
                {
                    $('#SignIn_popup').slideDown();
                    $scope.$emit('$preLoaderStop');
                }
                else
                {

                    $http({ method: 'get', url: GURL + 'ewtGetWorkingHrsHolidayList?Token=' + $rootScope._userInfo.Token + '&LocID=' + $scope.SearchInfo.LocID }).success(function (data)
                    {
                        $scope.$emit('$preLoaderStop');
                        $scope.showWorkingHourModel = true;
                        if (data != 'null')
                        {
                            if(data.WorkingHours != "")
                            {
                                $scope.Mo1 = (data.WorkingHours[0].MO1 == "00:00") ? '08:00' : selectedTimeUtcToLocal(data.WorkingHours[0].MO1);
                                $scope.Mo2 = (data.WorkingHours[0].MO2 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].MO2);
                                $scope.Mo3 = (data.WorkingHours[0].MO3 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].MO3);
                                $scope.Mo4 = (data.WorkingHours[0].MO4 == "00:00") ? '21:00' : selectedTimeUtcToLocal(data.WorkingHours[0].MO4);

                                $scope.Tu1 = (data.WorkingHours[0].TU1 == "00:00") ? '08:00' : selectedTimeUtcToLocal(data.WorkingHours[0].TU1);
                                $scope.Tu2 = (data.WorkingHours[0].TU2 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].TU2);
                                $scope.Tu3 = (data.WorkingHours[0].TU3 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].TU3);
                                $scope.Tu4 = (data.WorkingHours[0].TU4 == "00:00") ? '21:00' : selectedTimeUtcToLocal(data.WorkingHours[0].TU4);

                                $scope.We1 = (data.WorkingHours[0].WE1 == "00:00") ? '08:00' : selectedTimeUtcToLocal(data.WorkingHours[0].WE1);
                                $scope.We2 = (data.WorkingHours[0].WE2 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].WE2);
                                $scope.We3 = (data.WorkingHours[0].WE3 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].WE3);
                                $scope.We4 = (data.WorkingHours[0].WE4 == "00:00") ? '21:00' : selectedTimeUtcToLocal(data.WorkingHours[0].WE4);

                                $scope.Th1 = (data.WorkingHours[0].TH1 == "00:00") ? '08:00' : selectedTimeUtcToLocal(data.WorkingHours[0].TH1);
                                $scope.Th2 = (data.WorkingHours[0].TH2 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].TH2);
                                $scope.Th3 = (data.WorkingHours[0].TH3 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].TH3);
                                $scope.Th4 = (data.WorkingHours[0].TH4 == "00:00") ? '21:00' : selectedTimeUtcToLocal(data.WorkingHours[0].TH4);

                                $scope.Fr1 = (data.WorkingHours[0].FR1 == "00:00") ? '08:00' : selectedTimeUtcToLocal(data.WorkingHours[0].FR1);
                                $scope.Fr2 = (data.WorkingHours[0].FR2 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].FR2);
                                $scope.Fr3 = (data.WorkingHours[0].FR3 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].FR3);
                                $scope.Fr4 = (data.WorkingHours[0].FR4 == "00:00") ? '21:00' : selectedTimeUtcToLocal(data.WorkingHours[0].FR4);

                                $scope.Sa1 = (data.WorkingHours[0].SA1 == "00:00") ? '08:00' : selectedTimeUtcToLocal(data.WorkingHours[0].SA1);
                                $scope.Sa2 = (data.WorkingHours[0].SA2 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].SA2);
                                $scope.Sa3 = (data.WorkingHours[0].SA3 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].SA3);
                                $scope.Sa4 = (data.WorkingHours[0].SA4 == "00:00") ? '21:00' : selectedTimeUtcToLocal(data.WorkingHours[0].SA4);

                                $scope.Su1 = (data.WorkingHours[0].SU1 == "00:00") ? '08:00' : selectedTimeUtcToLocal(data.WorkingHours[0].SU1);
                                $scope.Su2 = (data.WorkingHours[0].SU2 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].SU2);
                                $scope.Su3 = (data.WorkingHours[0].SU3 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].SU3);
                                $scope.Su4 = (data.WorkingHours[0].SU4 == "00:00") ? '21:00' : selectedTimeUtcToLocal(data.WorkingHours[0].SU4);
                            }

                            if(data.HolidayList != "")
                            {
                                $scope.holiday = data.HolidayList;
                            }
                        }
                        else
                        {
                            // Notification.error({ message: 'Invalid key or not found…', delay: MsgDelay });
                        }
                    });
                }
            };


        }
    ]);