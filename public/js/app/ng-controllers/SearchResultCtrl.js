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

angular.module('ezeidApp').
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
            $route
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


            /* Star ratings reso. */

            $scope.selectSearchStar = function(index)
            {
                $scope.searchStars[index] = !$scope.searchStars[index];
            }

            $scope.searchStarArr = [
                ["a","b","c","d","e"],
                ["a","b","c","d"],
                ["a","b","c"],
                ["a","b"],
                ["a"]
            ];

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

            //Set all the serach parameters
            $scope.params = $routeParams;
            $scope.searchStars = [false,false,false,false,false];
            var starRating = $scope.params.rating.split(',');
            for(var i=0;i<starRating.length;i++)
            {
                $scope.searchStars[starRating[i]-1] = true;
            }


          /*  if($scope.params.searchType != 1)
            {
                $scope.showDownloadLink = false;
            }*/

            if(($scope.params.searchType == 1) && (!$rootScope._userInfo.IsAuthenticate))
            {
                $scope.showLoginText = true;
                Notification.error({ message : 'Please login to search for EZEID', delay : MsgDelay});
            }
            else
            {
                $scope.showDownloadLink = false;
                $scope.showLoginText = false;
                // To get search key result
                getSearchKeyWord($scope.params);
            }

           /* // To get search key result
            getSearchKeyWord($scope.params);*/

            //find out range of the ratings
            var initialVal = $routeParams.rating[0]?$routeParams.rating[0]:1;
            var finalVal = 5;
            for(var i=0; i < $routeParams.rating.length; i++)
            {
                finalVal = $routeParams.rating[i];
            }

            /* checks for initial and final value */
            //var initial = !isNaN(initialVal) && parseInt(initialVal) >= 1?initialVal:1;
            //var final = !isNaN(finalVal) && parseInt(finalVal) <= 5?finalVal:5;
            var initial = initialVal;
            var final = finalVal;

            //var slider = $("#range_29").data("ionRangeSlider");
            //slider.update({
            //    from: initial,
            //    to: final
            //});



            //Below function is for getting key word search result
            function getSearchKeyWord(_filterValue)
            {
                $scope.showDownloadLink = false;
                var CurrentDate = moment().format('YYYY-MM-DD HH:mm:ss');
                if(!$rootScope._userInfo){
                    $rootScope._userInfo = {};
                }
                if(!$rootScope._userInfo.Token)
                {
                    $rootScope._userInfo.Token = 2;
                }

                /* set the value of the search term */
                $scope.defaultSearchTerm = _filterValue.searchTerm;

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
                    CurrentDate:CurrentDate
                } }).success(function (data) {
                    $rootScope.$broadcast('$preLoaderStop');

                    /* put the maps coordinates in array */
                    $scope.coordinatesArr = [];
                    /* count the result */
                    var count = 0;
                    if(data != 'null'){

                        for(var i=0; i<data.length; i++)
                        {
                            count++;
                            coordinates.push([data[i].Latitude,data[i].Longitude,data[i].CompanyName]);
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

                var modifyValue = [
                    'homeDelivery',
                    'parkingStatus',
                    'openStatus'
                ];
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
                    },function(){
                        populateMarkers();
                    });

                });

                var populateMarkers = function(){
                    googleMap.resizeMap();
                    googleMap.toggleMapControls();

                    /* place markers on map */
                   var markerImage = '../../images/business-icon_48.png';
                    for(var i=0;i < $scope.coordinatesArr.length;i++)
                    {
                        if($scope.coordinatesArr[i][0] != 0 || $scope.coordinatesArr[i][0] != 0)
                        {
                            var pos = googleMap.createGMapPosition($scope.coordinatesArr[i][0],$scope.coordinatesArr[i][1]);
                            var marker = googleMap.createMarker(pos,$scope.coordinatesArr[i][2],markerImage,false,null);
                            googleMap.placeMarker(marker);
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
                        },500);
                    }
                }
            };

            // To check and uncheck All check box
            $scope.toggleCheckboxAll = function(){

                /* toggle the select all variable's value */
                $scope.selectAll = !$scope.selectAll;

                /* chechk all the check boxes */
                if($scope.selectAll)
                {
                    $scope.selectedList = [];
                    selectedAllResult = 1;

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
            $scope.redirectFullPage = function(searchType,tid)
            {
                /* redirect to full detail page */
                $location.url('/searchDetails?searchType='+searchType+'&TID='+tid);
            }

            /**
             Select random colors for search result list tiles
             /

             /* make an array of colors for tiles */
            var colorArray = [
                "orange",
                "green",
                "cyan",
                "pink",
                "bg-orange-shade-1",
                "bg-green-shade-1",
                "bg-blue-shade-1",
                "bg-blue-shade-2",
                "bg-orange-shade-2"
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
        }
    ]);