// Search Controller
angular.module('ezeidApp').controller('SearchController', [
    '$http',
    '$rootScope',
    '$scope',
    '$compile',
    '$timeout',
    'Notification',
    '$filter',
    '$location',
    '$window',
    '$q',
    '$interval',
    'GURL',
    'MsgDelay',
    '$routeParams',
    function ($http, $rootScope, $scope, $compile, $timeout, Notification, $filter, $location, $window, $q, $interval,GURL,MsgDelay,$routeParams) {

   /* if(Object.keys($routeParams).length > 0){
        if(typeof($routeParams['SearchType']) !== "undefined" && $routeParams['SearchType'] !== null && $routeParams['SearchType'] !== "")
        {
            SearchSec.Criteria.SearchType = $routeParams.SearchType;
        }
        if(typeof($routeParams['Keywords']) !== "undefined" && $routeParams['Keywords'] !== null && $routeParams['Keywords'] !== ""){
            SearchSec.Criteria.Keywords = $routeParams.Keywords;
        }
        if(typeof($routeParams['Proximity']) !== "undefined" && $routeParams['Proximity'] !== null && $routeParams['Proximity'] !== ""){
            SearchSec.Criteria.Proximity = $routeParams.Proximity;
        }
        if(typeof($routeParams['Latitude']) !== "undefined" && $routeParams['Latitude'] !== null && $routeParams['Latitude'] !== ""){
               SearchSec.Criteria.Latitude = $routeParams.Latitude;
        }
        if(typeof($routeParams['Longitude']) !== "undefined" && $routeParams['Longitude'] !== null && $routeParams['Longitude'] !== ""){
            SearchSec.Criteria.Longitude = $routeParams.Longitude;
        }
        if(typeof($routeParams['Rating']) !== "undefined" && $routeParams['Rating'] !== null && $routeParams['Rating'] !== ""){
            SearchSec.Criteria.Rating = $routeParams.Rating;
        }
        if(typeof($routeParams['ParkingStatus']) !== "undefined" && $routeParams['ParkingStatus'] !== null && $routeParams['ParakingStatus'] !== ""){
            SearchSec.Criteria.ParkingStatus = $routeParams.ParkingStatus;
        }
        if(typeof($routeParams['HomeDelivery']) !== "undefined" && $routeParams['HomeDelivery'] !== null && $routeParams['HomeDelivery'] !== ""){
            SearchSec.Criteria.HomeDelivery = $routeParams.HomeDelivery;
        }
        if(typeof($routeParams['OpenStatus']) !== "undefined" && $routeParams['OpenStatus'] !== null && $routeParams['OpenStatus'] !== ""){
            SearchSec.Criteria.OpenStatus = $routeParams.OpenStatus;
        }
    }*/

 /*   var routeP = {
        "Token":"324b580dca99786fa9f1",
        "SearchType":"1",
        "Keywords":"krunal",
        "SCategory":0,
        "Proximity":1,
        "Latitude":12.933687899999999,
        "Longitude":77.57361209999999,
        "Rating":"1,2,3,4,5",
        "ParkingStatus":0,
        "HomeDelivery":0,
        "OpenStatus":0,
        "CurrentDate":"2015-03-28 04:33"
    };*/

    var map;
    var marker;
    var markers = [];
    var labels = [];

    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();
    var myinfowindow = new google.maps.InfoWindow({
        content: ''
    });
    var service;
    var x = new Date();
    var today = moment(x.toISOString()).utc().format('DD-MMM-YYYY hh:mm A');

    var currentBanner = 1;
    var Miliseconds = 8000;
    var RefreshTime = Miliseconds;
    var AutoRefresh = true;
    var rating = [1,2,3,4,5];
    $scope.showWorkingHourModel = false;
    $scope.showLoadingImage = false;
    $scope.allBanners = [];

    $('#datetimepicker1').datetimepicker({
        format: "d-M-Y  h:m A",
        hours12: false,
        minDate: 0
    });
    $('#datetimepicker1').siblings('.input-group-addon').on('click',function(){
        $('#datetimepicker1').trigger('focus');
    });

    $rootScope.$watch('_userInfo.IsAuthenticate',function(oldval,newval){
        try{
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
                $(".ezeid-map-label").remove();
                // labels[i].setMap(null);
            }
        }
        catch(ex){}
    });

    function getQueryStringValue(key) {
        return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    }

    var SearchSec = this;

    SearchSec.IsShowForm = false;
    SearchSec.IsFilterRowVisible = true;
    SearchSec.nextButton = true;
    SearchSec.previousButton =  true;
    SearchSec.categories = [];
    SearchSec.proximities = [];
    SearchSec.holiday = [];
    $scope.selectedList = [];
    $scope.form_rating = 0;

    SearchSec.mInfo = {};
    var userType = "";
    SearchSec.mInfo.InfoTab = false;
    $scope.showInfoTab = false;

    SearchSec.showSearchWindow = true;
    SearchSec.showInfoWindow = false;
    SearchSec.showResultWindow = false;

    SearchSec.showResultTab = false;
    SearchSec.searchResult = [];

    SearchSec.Criteria = {
        Token: '',
        SearchType: '2',
        Keywords: '',
        SCategory: 0,
        Proximity: 50,
        Latitude: $rootScope.CLoc.CLat,
        Longitude: $rootScope.CLoc.CLong
    };

    $scope.isMapLoaded = false;         //Set to true with map event 'idle'
    $scope.isMapReady = false;          //Set to true when map canvas is drawn and map is fully visible

    SearchSec.Placeholder = 'Type Keywords to locate products or services.';
    $scope.showSmallBanner = false;
    $scope.ShowLinks = false;

    $scope.showStar1 = true;
    $scope.showStar2 = true;
    $scope.showStar3 = true;
    $scope.showStar4 = true;
    $scope.showStar5 = true;

    $scope.member = {roles: []};
    $scope.selected_items = [];

    // show search Tab
    $scope.showSearchTab = function(){
        SearchSec.showSearchWindow = true;
        SearchSec.showInfoWindow = false;
        SearchSec.showResultWindow = false;
    };
    // show info Tab
    $scope.showInfoWindowTab = function(){
        SearchSec.showSearchWindow = false;
        SearchSec.showInfoWindow = true;
        SearchSec.showResultWindow = false;
    };

    // show result Tab Window
    $scope.showResultWindow = function(){
        SearchSec.showSearchWindow = false;
        SearchSec.showInfoWindow = false;
        SearchSec.showResultWindow = true;
    };

  //  $scope.ShowInfoWindow = false;

    function initialize () {
        // Create the search box and link it to the UI element.

        directionsDisplay = new google.maps.DirectionsRenderer();
        var initialLocation;
        var currentLoc = new google.maps.LatLng(12.295810, 76.639381);
        map = new google.maps.Map(document.getElementById('map-canvasH'), {
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            Zoom: 15
        });
        $scope.gMap = map;
        var ClocBtn = (document.getElementById('mapClocH'));
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(ClocBtn)
        var input = /** @type {HTMLInputElement} */(document.getElementById('txtSearch'));
        var input1 = $("#txtSearch")[0];

        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        //getReverseGeocodingData(12.295810, 76.639381);

        /********** Google Maps autocomplete **************/
        var options = {
            types: ['establishment']
        };

        autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete,'place_changed',function(){
            var place = autocomplete.getPlace();
            $rootScope.CLoc.CLat = place.geometry.location.k;
            $rootScope.CLoc.CLong = place.geometry.location.D;

            var loc = new google.maps.LatLng($rootScope.CLoc.CLat, $rootScope.CLoc.CLong);
            PlaceCurrentLocationMarker(loc);
        });
        /********** Google Maps autocomplete ends *********/

        var searchBox = new google.maps.places.SearchBox(
            /** @type {HTMLInputElement} */(input));
        //directionsDisplay.setMap(map);
        // Try W3C Geolocation (Preferred)
        if (navigator.geolocation) {
            browserSupportFlag = true;
            navigator.geolocation.getCurrentPosition(FindCurrentLocation, function () {
                handleNoGeolocation();
            });
        }
        // Browser doesn't support Geolocation
        else {
            handleNoGeolocation();
        }

        function handleNoGeolocation() {
            initialLocation = currentLoc;
            map.setCenter(initialLocation);
            PlaceCurrentLocationMarker(initialLocation);
            //PlaceMarker(initialLocation);
        }

        // Listen for the event fired when the user selects an item from the
        // pick list. Retrieve the matching places for that item.
        google.maps.event.addListener(searchBox, 'places_changed', function () {
            var places = searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }
            for (var i = 0, marker; marker = markers[i]; i++) {
                $(".ezeid-map-label").remove();
                marker.setMap(null);
            }

            // For each place, get the icon, place name, and location.
            markers = [];
            var bounds = new google.maps.LatLngBounds();
            if (places.length > 0) {

                var place = places[0];
                $rootScope.CLoc.CLat = place.geometry.location.k;
                $rootScope.CLoc.CLong = place.geometry.location.D;
                var loc = new google.maps.LatLng($rootScope.CLoc.CLat, $rootScope.CLoc.CLong);
                PlaceCurrentLocationMarker(loc);
            }
        });

        //Map Right click Listener
        google.maps.event.addListener(map, 'rightclick', function(event) {
            $rootScope.CLoc = {
                CLat : 0,
                CLong : 0
            };
            var lat = event.latLng.lat();
            var lng = event.latLng.lng();

            $rootScope.CLoc.CLat = lat;
            $rootScope.CLoc.CLong = lng;
            var loc = new google.maps.LatLng($rootScope.CLoc.CLat, $rootScope.CLoc.CLong);
            PlaceCurrentLocationMarker(loc);
        });

        // Bias the SearchBox results towards places that are within the bounds of the
        // current map's viewport.
        google.maps.event.addListener(map, 'bounds_changed', function () {
            var bounds = map.getBounds();
            searchBox.setBounds(bounds);
        });

        google.maps.event.addListenerOnce(map, 'idle', function () {

            $scope.isMapLoaded = true;
            $timeout(function(){
                $scope.isMapReady = true;
            },2000);
            if(SearchSec.IsSearchPending){
                SearchSec.getSearch();
            }
        });
        $(window).resize(function() {
            google.maps.event.trigger(map, "resize");
        });
    }

    function getReverseGeocodingData(lat, lng) {
        var latlng = new google.maps.LatLng(lat, lng);
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'latLng': latlng }, function (results, status) {
            if (status !== google.maps.GeocoderStatus.OK) {
            }
            if (status == google.maps.GeocoderStatus.OK) {
                getAddressForLocation(results[0].address_components);
            }
        });
    }

    function getAddressForLocation(results) {
       $scope.Address = "";
        angular.forEach(results, function (mapResultValue, index) {
            if (mapResultValue.types[0] == 'street_number') {
                $scope.Address = mapResultValue.long_name + ', ';
            }
            if (mapResultValue.types[0] == 'route') {
                /*$scope.Address += ", " + mapResultValue.long_name;*/
                $scope.Address += mapResultValue.long_name;
            }
            if (mapResultValue.types[0] == 'neighborhood') {
                $scope.Address += ", " + mapResultValue.long_name;
            }
            if (mapResultValue.types[0] == 'sublocality_level_3') {
                $scope.Address += ", " + mapResultValue.long_name;
            }
            if (mapResultValue.types[0] == 'sublocality_level_2') {
                $scope.Address += ", " + mapResultValue.long_name;
            }
            if (mapResultValue.types[0] == 'sublocality_level_1') {
                $scope.Address += ", " + mapResultValue.long_name;
            }
            if (mapResultValue.types[0] == 'locality') {
                $scope.Address += ", " + mapResultValue.long_name;
            }
        });

        if($scope.Address.length >= 48)
        {
            $scope.Address = $scope.Address.substring(0,45);
            $scope.Address = $scope.Address+ "...";
        }
        else
        {
            $scope.Address = $scope.Address;
        }
    }
//    google.maps.event.addDomListener(window, 'load', initialize);

    function PlaceCurrentLocationMarker(location) {
        if (marker != undefined) {
            marker.setMap(null);
            $(".ezeid-map-label").remove();
        }
        map.setCenter(location);
        marker = new google.maps.Marker({
            position: location,
            title: "Current Location",
            draggable: true,
            map: map,
            icon: 'images/you_are_here.png'
        });

        getReverseGeocodingData(marker.getPosition().k, marker.getPosition().D);

        google.maps.event.addListener(marker, 'dragend', function (e) {

            $rootScope.CLoc.CLat = marker.getPosition().k;
            $rootScope.CLoc.CLong = marker.getPosition().D;
            getReverseGeocodingData(marker.getPosition().k, marker.getPosition().D);
//                myinfowindow.setContent('<h6>You are here</h6>');
            //myinfowindow.open(map, marker);
        });
    }
    this.getMyLocation = function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(FindCurrentLocation);
        }
    };
    function FindCurrentLocation(position) {
        initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        $rootScope.CLoc = {
            CLat: position.coords.latitude,
            CLong: position.coords.longitude
        };
        PlaceCurrentLocationMarker(initialLocation);
    }
    function PlaceMarker(positions) {
        directionsDisplay.setMap(null);
        for (var i = 0, Cmarker; Cmarker = markers[i]; i++) {
            Cmarker.setMap(null);
            $(".ezeid-map-label").remove();
        }
        markers = [];

        //Latitude Longitude list for setting up all markers in map display (setting bounds to display all markers in map)
        var latLngList = [];
        latLngList.push(new google.maps.LatLng($rootScope.CLoc.CLat, $rootScope.CLoc.CLong));
        if (positions != null) {
            for (var i = 0; i < positions.length; i++) {
                var _item = positions[i];
                var mapIcon;
                mapIcon = '/images/Indi_user.png';
                var businessIcon = 'images/business-icon_48.png';
                var individualIcon = 'images/Individual-Icon_48.png';
                var pos = new google.maps.LatLng(_item.Latitude, _item.Longitude);
                //Pushing position of markers to fit in bounds
                latLngList.push(pos);
                var mTitle = (_item.IDTypeID == 2 && _item.CompanyName !== "")? _item.CompanyName : _item.Name;
                var marker = new google.maps.Marker({
                    position: pos,
                    map: map,
                    icon: (_item.IDTypeID == 2) ? businessIcon : individualIcon,
                    label : mTitle,
                    title: mTitle
                });

                var label = new Label({
                    map: map
                });

                $(".ezeid-map-label").remove();

                label.bindTo('position', marker, 'position');
                label.bindTo('text', marker, 'label');

                $(".ezeid-map-label").remove();

                var currentPos = google.maps.LatLng($rootScope.CLoc.CLat,$rootScope.CLoc.CLong);
                map.setCenter(currentPos);
                labels.push(label);
                markers.push(marker);
                google.maps.event.addListener(marker, 'click', (function (_item) {

                    return function () {

                        $scope.showLoadingImage = true;
                        SearchSec.showSearchWindow = false;
                        SearchSec.showInfoWindow = true;
                        SearchSec.showResultWindow = false;

                        $scope.ShowInfoWindow = true;
                        $scope.ShowLinks = true;
                        $scope.showSmallBanner = true;
                        $scope.AddressForInfoTab = "";
                        var sen = this;

                        getSearchInformation(_item);

                    }
                })(_item));
            }

            //Setting up map bounds to display all markers
            var bounds = new google.maps.LatLngBounds ();
            //  Go through each...
            for (var i = 0, LtLgLen = latLngList.length; i < LtLgLen; i++) {
                //  And increase the bounds to take this point
                bounds.extend (latLngList[i]);
            }
            //  Fit these bounds to the map
            map.fitBounds (bounds);
        }
    }

    $http({ method: 'get', url: GURL + 'ewmGetCategory?LangID=1' }).success(function (data) {
        var _obj = { CategoryID: 0, CategoryTitle: '--Any--' };
        data.splice(0, 0, _obj);
        SearchSec.categories = data;
    });

    $http({ method: 'get', url: GURL + 'ewmGetProxmity?LangID=1' }).success(function (data) {
        SearchSec.proximities = data;
        if(!map){
            initialize();
        }
    });

    SearchSec.OpenStatuses = [ { id: 1, label: "Open" }, { id: 2, label: "Closed" }];

    SearchSec.isEZEIDselected = function (value) {

        if (SearchSec.Criteria.SearchType == 1)
        {
            SearchSec.Placeholder = 'Type EZE ID here.';

            SearchSec.showResultTab = false;
            SearchSec.showSearchWindow = true;
            SearchSec.showInfoWindow = false;
            SearchSec.showResultTab = false;
        }
        else if(SearchSec.Criteria.SearchType == 2)
        {
            SearchSec.Placeholder = 'Type Keywords to locate products or services.';
            //  SearchSec.showSmallBanner = true;
        }
        else
        {
            SearchSec.Placeholder = 'Type Job skill keywords to locate employers.';
            //  SearchSec.showSmallBanner = false;
        }
        $scope.searchType = 2;

        return value === SearchSec.Criteria.SearchType;
    };

    SearchSec.isIndividualUser = function (value) {
        return value === parseInt(SearchSec.mInfo.IDTypeID);
    };

    SearchSec.getSearch = function () {

        $scope.SearchResultCount= "";
        $scope.ShowNoDataFound = false;
        SearchSec.Criteria.Rating = rating.toString();
        SearchSec.IsSearchButtonClicked = true;
        SearchSec.IsShowForm = false;
        SearchSec.Criteria.ParkingStatus = SearchSec.Criteria.ParkingStatus1 == true ? 1 : 0;
        SearchSec.Criteria.HomeDelivery = SearchSec.Criteria.HomeDelivery1 == true ? 1 : 0;
        SearchSec.Criteria.OpenStatus = SearchSec.Criteria.OpenStatus1 == true ? 1 : 0;
        var currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
        $scope.AddressForInfoTab = "";
        AutoRefresh = false;

        SearchSec.Criteria.CurrentDate = currentDate;


       // if ($rootScope._userInfo.IsAuthenticate == true || SearchSec.Criteria.SearchType == 2 && SearchSec.IsSearchButtonClicked || SearchSec.Criteria.SearchType == 3 && SearchSec.IsSearchButtonClicked) {

            if($rootScope._userInfo.Token == "")
            {
                $rootScope._userInfo.Token = 2;
                $scope.Token = 2;
            }
            else
            {
                // console.log($rootScope._userInfo.Token);
            }

            SearchSec.Criteria.Latitude = $rootScope.CLoc.CLat;
            SearchSec.Criteria.Longitude = $rootScope.CLoc.CLong;
            SearchSec.Criteria.Token = $rootScope._userInfo.Token;

            $http({ method: 'post', url: GURL + 'ewSearchByKeywords', data: SearchSec.Criteria }).success(function (data) {
               if (data != 'null' && data.length>0)
               {
                   $scope.SearchResultCount = data.length;
                   $window.localStorage.removeItem("searchResult");
                   $window.localStorage.removeItem("selectedTids");
                   $window.localStorage.setItem("searchResult", JSON.stringify(data));

                   if(SearchSec.Criteria.SearchType == 2 || SearchSec.Criteria.SearchType == 3)
                   {
                       SearchSec.showResultTab = true;
                       SearchSec.searchResult = data;
                   }

                   if(($rootScope._userInfo.IsAuthenticate == true || data[0].IDTypeID > 1) && data[0].Latitude != undefined )
                   {
                      try{
                           PlaceMarker(data);
                       }
                       catch(ex){
                           if(!map){
                               initialize();
                           }
                           $scope.$watch('isMapLoaded',function(var1,var2){
                               if(var2){
                                   PlaceMarker(data);
                               }
                           });
                       }
                   }

                    var _item = data[0];
                    if(data[0].Filename)
                    {
                        if($rootScope._userInfo.IsAuthenticate == true || data[0].IDTypeID > 1)
                        {
                            SearchSec.IsShowForm = true;
                            SearchSec.downloadData = data[0];
                            SearchSec.IsFilterRowVisible = false;

                            var downloadUrl = "/ewtGetSearchDocuments?Token="+$rootScope._userInfo.Token+"&&Keywords="+SearchSec.Criteria.Keywords;
                            $window.open(downloadUrl, '_blank');
                            /* var win = window.open(downloadUrl, '_blank');
                             win.focus();*/
                        }
                        else
                        {
                            //Redirect to Login page
                            $('#SignIn_popup').slideDown();
                            $rootScope.defer = $q.defer();
                            var prom = $rootScope.defer.promise;
                            prom.then(function(d){
                                SearchSec.getSearch();
                            });
                        }
                    }
                    else
                    {
                         if($rootScope._userInfo.IsAuthenticate == true || data[0].IDTypeID == 2 && SearchSec.Criteria.SearchType == 1)
                         {
                               $http({ method: 'get', url: GURL + 'ewtGetSearchInformation',
                                   params : {
                                       Token : $rootScope._userInfo.Token,
                                       TID : _item.TID,
                                       CurrentDate : SearchSec.Criteria.CurrentDate
                                   }
                                   }).success(function (data) {

                                if (data != 'null') {

                                  if(data.length == 1 && SearchSec.Criteria.SearchType == 1)
                                    {
                                        $scope.showInfoTab = true;
                                        $scope.selectTab('info');
                                        $scope.ShowInfoWindow = true;
                                        SearchSec.showSearchWindow = false;
                                        SearchSec.showInfoWindow = true;
                                        SearchSec.showResultWindow = false;
                                        $scope.ShowLinks = true;
                                        $scope.showSmallBanner = true;
                                   }
                                    else
                                    {
                                        $scope.selectTab('map');
                                    }
                                    $timeout(function () {
                                        SearchSec.mInfo = data[0];

                                        //Set Visibal module
                                        $scope.showSalesEnquiry = SearchSec.mInfo.VisibleModules[0];
                                        $scope.showHomeDelivery = SearchSec.mInfo.VisibleModules[1];
                                        $scope.shoReserVation = SearchSec.mInfo.VisibleModules[2];
                                        $scope.showServiceRequest = SearchSec.mInfo.VisibleModules[3];
                                        $scope.showSendCv = SearchSec.mInfo.VisibleModules[4];



                                        //Below lines are to show address in info tab
                                        $scope.AddressForInfoTab = (SearchSec.mInfo.AddressLine1 != "") ? SearchSec.mInfo.AddressLine1 +', ' : "";
                                        $scope.AddressForInfoTab += (SearchSec.mInfo.AddressLine2 != "") ? SearchSec.mInfo.AddressLine2 +', ' : "";
                                        $scope.AddressForInfoTab += (SearchSec.mInfo.CityTitle != "") ? SearchSec.mInfo.CityTitle +', ' : "";
                                        $scope.AddressForInfoTab += (SearchSec.mInfo.CountryTitle != "") ? SearchSec.mInfo.CountryTitle +', ' : "";
                                        $scope.AddressForInfoTab += (SearchSec.mInfo.PostalCode != "") ? SearchSec.mInfo.PostalCode : "";

                                        if(SearchSec.mInfo.ParkingStatus==0)
                                        {
                                            SearchSec.parkingTitle = "Parking Status";
                                        }
                                        if(SearchSec.mInfo.ParkingStatus==1)
                                        {
                                            SearchSec.parkingTitle = "Public Parking";
                                        }
                                        if(SearchSec.mInfo.ParkingStatus==2)
                                        {
                                            SearchSec.parkingTitle = "Vallet Parking";
                                        }
                                        if(SearchSec.mInfo.ParkingStatus==3)
                                        {
                                            SearchSec.parkingTitle = "No parking";
                                        }

                                        if (!/^(f|ht)tps?:\/\//i.test(data[0].Website)) {
                                            // url = "http://" + data[0].Website;
                                            //  SearchSec.mInfo.Website = url;
                                            SearchSec.mInfo.Website = data[0].Website;
                                        }

                                        //Call for banner
                                        AutoRefresh = true;
                                        //  getBanner(1);
                                        if (SearchSec.Criteria.SearchType == 1)
                                        {
                                            getBanner(1);
                                            //getAllBanners();
                                           // console.log(SearchSec.mInfo);
                                        }

                                        $scope.form_rating = data[0].Rating;
                                        SearchSec.mInfo.Banners = data[0].Banners;

                                        if(SearchSec.mInfo.IDTypeID == 2)
                                        {
                                            SearchSec.reservationPlaceHolder = "Reservation requirement details";
                                        }
                                        else
                                        {
                                            SearchSec.reservationPlaceHolder = "Appointment requirement details";
                                        }
                                    });
                                }
                                else {
                                    // Notification.error({ message: 'Invalid key or not found…', delay: MsgDelay });
                                    $scope.ShowNoDataFound = true;
                                }
                            });

                                /******************** Code for checking map load and handling it with reload ****************/
                                //MapIsLoaded variable is set by map eventListener idle

                              /*  try{
                                    PlaceMarker(data);
                                }
                                catch(ex){
                                    if(!map){
                                        initialize();
                                    }
                                    $scope.$watch('isMapLoaded',function(var1,var2){
                                        if(var2){
                                            PlaceMarker(data);
                                        }
                                    });
                                }*/

                         }
                        else
                         {
                                 if( SearchSec.Criteria.SearchType < 2 )
                                 {
                                     //Redirect to Login page
                                     $('#SignIn_popup').slideDown();
                                     $rootScope.defer = $q.defer();
                                     var prom = $rootScope.defer.promise;
                                     prom.then(function(d){
                                         SearchSec.getSearch();
                                     });
                                 }
                         }


                        //If map is not loaded wait for few seconds and then try to reload it and then place marker

                        /*********************Code for checking map load and handling it with reload ends ****************/
                    }
                    // PlaceMarker(data);//older one
                }
                else {
                    // Notification.error({ message: 'Invalid key or not found…', delay: MsgDelay });
                    $scope.ShowNoDataFound = true;
                    try{
                        PlaceMarker(null);
                        $(".ezeid-map-label").remove();
                    }

                    catch(ex){
                        if(!map){
                            initialize();
                        }
                        $scope.$watch('isMapLoaded',function(var1,var2){
                            if(var2){
                                PlaceMarker(null);
                                $(".ezeid-map-label").remove();
                            }
                        });
                    }
                    //PlaceMarker(null);
                }
            });
    };

    /**
     * Selects a particular tab
     */
    $scope.infoClass = "";
    $scope.mapClass = "";
    $scope.adClass = "level-1";
    $scope.selectTab = function (tabName){
        if(tabName == 'info')
        {
            $scope.infoClass = "level-1";
            $scope.mapClass = "";
            $scope.adClass = "";
        }
        if(tabName == 'ad')
        {
            $scope.infoClass = "";
            $scope.mapClass = "";
            $scope.adClass = "level-1";
        }

        if(tabName == 'map')
        {
            if($scope.isMapReady && $scope.isMapLoaded)
            {
                $scope.infoClass = "";
                $scope.mapClass = "level-1";
                $scope.adClass = "";
            }
            else{
                Notification.error({message:'Map is loading! Please wait..',delay:MsgDelay});
            }
        }
    };

    //Auto refresh Banner
    $interval(function() {

        if(AutoRefresh == true && SearchSec.IsSearchButtonClicked && SearchSec.mInfo.EZEID && $scope.showInfoTab && SearchSec.mInfo.Banners != 1)
        {
            currentBanner = currentBanner + 1;

            if(currentBanner <= SearchSec.mInfo.Banners)
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

    //call for previous banner
     SearchSec.getPreviousBanner = function () {
         currentBanner = currentBanner - 1;
         if(currentBanner >= 1)
         {
             getBanner(currentBanner);
             RefreshTime = Miliseconds;
         }
     };

     //call for next banner
     SearchSec.getNextBanner = function () {
     currentBanner = currentBanner + 1;
         if(currentBanner <= SearchSec.mInfo.Banners)
         {
             getBanner(currentBanner);
             RefreshTime = Miliseconds;
         }
     };

      function getAllBanners()
      {
          $scope.allBanners = [];
          for (var i = 1; i <= SearchSec.mInfo.Banners; i++) {
              $http({ method: 'get', url: GURL + 'ewtGetBannerPicture?Token=' + $rootScope._userInfo.Token +'&SeqNo='+i+'&Ezeid='+SearchSec.mInfo.EZEID+'&StateTitle='+ SearchSec.mInfo.StateTitle+'&LocID='+SearchSec.mInfo.LocID}).success(function (data) {

                  if (data.Picture != 'null') {
                      SearchSec.mInfo.BannerImage = data.Picture;
                      $scope.allBanners.push(data);
                  }
                  else
                  {
                    // Notification.error({ message: "No Message found..!", delay: MsgDelay });
                  }
              });
          }
      }

    function getBanner(_requestedBannerValue){
        if(SearchSec.mInfo.EZEID)
        {
            $http({ method: 'get', url: GURL + 'ewtGetBannerPicture?Token=' + $rootScope._userInfo.Token +'&SeqNo='+_requestedBannerValue+'&Ezeid='+SearchSec.mInfo.EZEID+'&StateTitle='+ SearchSec.mInfo.StateTitle+'&LocID='+SearchSec.mInfo.LocID}).success(function (data) {

                if (data.Picture != 'null') {
                     SearchSec.mInfo.BannerImage = data.Picture;
                     if(currentBanner >= SearchSec.mInfo.Banners)
                     {
                         //Disable next button
                         SearchSec.nextButton = false;
                     }
                     else
                     {
                         //Enable next button
                         SearchSec.nextButton = true;
                     }

                     if(currentBanner <= 1)
                     {
                         //Disabled previous button
                         SearchSec.previousButton = false;
                     }
                     else
                     {   //Enable previous burron
                         SearchSec.previousButton = true;
                     }
                }
                else
                {
                    msgSen.showMoreButton = false;
                    Notification.error({ message: "No Message found..!", delay: MsgDelay });
                }
            });
        }
    }

    function getMapSearchResults(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            if (results.length > 0) {
                var place = results[0];
                $rootScope.CLoc.CLat = place.geometry.location.k;
                $rootScope.CLoc.CLong = place.geometry.location.D;
                var loc = new google.maps.LatLng($rootScope.CLoc.CLat, $rootScope.CLoc.CLong);
                PlaceCurrentLocationMarker(loc);
            }
        }
        else {
            Notification.error({ message: 'No Results found..!', delay: MsgDelay });
        }
    }

    SearchSec.getdirections = function (data) {
        $scope.selectTab('map');
        var start = new google.maps.LatLng($rootScope.CLoc.CLat, $rootScope.CLoc.CLong);
        var end = new google.maps.LatLng(data.Latitude, data.Longitude);
        directionsDisplay.setMap(map);
        var request = {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING
        };
        directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            }
        });
    };

    //View Directions
    SearchSec.viewDirections = function (data) {

      var start = new google.maps.LatLng($rootScope.CLoc.CLat, $rootScope.CLoc.CLong);
      var end = new google.maps.LatLng(data.Latitude, data.Longitude);

      var userLoc = {
            startLat: $rootScope.CLoc.CLat,
            startLong: $rootScope.CLoc.CLong,
            endLat: data.Latitude,
            endLong : data.Longitude
        };

        $window.localStorage.setItem("directionLocation", JSON.stringify(userLoc));

        window.location.href = "/viewdirection";
        //  $location.path("/viewdirection");
    };

    //open Sales Enquiry form
    SearchSec.openSalesEnquiryForm = function () {
        if($rootScope._userInfo.Token == 2)
        {
            $('#SignIn_popup').slideDown();
        }
        else
        {
            $('#SalesEnquiryRequest_popup').slideDown();
        }
    };

    SearchSec.sendSalesEnquiry = function () {
        if ($rootScope._userInfo.IsAuthenticate == true) {
            var currentTaskDate = moment().format('DD-MMM-YYYY hh:mm A');
            $http({ method: 'post', url: GURL + 'ewtSaveMessage', data: { TokenNo: $rootScope._userInfo.Token, ToMasterID: SearchSec.mInfo.TID, MessageType: 1, Message: SearchSec.salesMessage, TaskDateTime: today, LocID :SearchSec.mInfo.LocID,CurrentTaskDate: currentTaskDate } }).success(function (data) {
                if (data.IsSuccessfull) {
                    $('#SalesEnquiryRequest_popup').slideUp();
                    SearchSec.salesMessage = "";
                    Notification.success({ message: 'Message send success', delay: MsgDelay });
                }
                else {
                    Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                }
            });
        }
        else {
            //Redirect to Login page
            $('#SignIn_popup').slideDown();
        }
    };

    // Close Sales Enquiry Form
    SearchSec.closeSalesEnquiryForm = function () {
        $('#SalesEnquiryRequest_popup').slideUp();
        SearchSec.salesMessage = "";
    };

    //open Message form
    SearchSec.openSendMessageForm = function () {
        $('#sendMessage_popup').slideDown();
    };

    SearchSec.sendUserMessage = function () {
        if ($rootScope._userInfo.IsAuthenticate == true) {
            var currentTaskDate = moment().format('DD-MMM-YYYY hh:mm A');
            $http({ method: 'post', url: GURL + 'ewtSaveMessage', data: { TokenNo: $rootScope._userInfo.Token, ToMasterID: SearchSec.mInfo.TID, MessageType: 0, Message: SearchSec.SendMessage, TaskDateTime: today, LocID :SearchSec.mInfo.LocID,CurrentTaskDate: currentTaskDate } }).success(function (data) {
                if (data.IsSuccessfull) {
                    $('#sendMessage_popup').slideUp();
                    SearchSec.SendMessage = "";
                    Notification.success({ message: 'Message send success', delay: MsgDelay });
                }
                else {
                    Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                }
            });
        }
        else {
            //Redirect to Login page
            $('#SignIn_popup').slideDown();
        }
    };

    // Close Send Message Form
    SearchSec.closeSendMessageForm = function () {
        $('#sendMessage_popup').slideUp();
        SearchSec.SendMessage = "";
    };

    //open home delivery form
    SearchSec.openHomeDeliverForm = function () {

        if($rootScope._userInfo.Token == 2)
        {
            $('#SignIn_popup').slideDown();
        }
        else
        {
            $('#HomeDelivery_popup').slideDown();
        }
    };

    //Send Home Delivery
    SearchSec.sendHomeDelivery = function () {
        if ($rootScope._userInfo.IsAuthenticate == true) {
            var currentTaskDate = moment().format('DD-MMM-YYYY hh:mm A');
            $http({ method: 'post', url: GURL + 'ewtSaveMessage', data: { TokenNo: $rootScope._userInfo.Token, ToMasterID: SearchSec.mInfo.TID, MessageType: 2, Message: SearchSec.HomeDeliverMessage, TaskDateTime: today, LocID :SearchSec.mInfo.LocID,CurrentTaskDate : currentTaskDate } }).success(function (data) {

                if (data.IsSuccessfull) {
                    $('#HomeDelivery_popup').slideUp();
                    SearchSec.HomeDeliverMessage = "";
                    Notification.success({ message: 'Message send success', delay: MsgDelay });
                }
                else {
                    Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                }
            });
        }
        else {
            //Redirect to Login page
            $('#SignIn_popup').slideDown();
        }
    };

    // Close HomeDeliver Form
    SearchSec.closeHomeDeliverForm = function () {
        SearchSec.HomeDeliverMessage = "";
        $('#HomeDelivery_popup').slideUp();
    };

    //open Reservation form
    SearchSec.openReservationForm = function () {
        document.getElementById("reservationMessage").className = "form-control fixTextArea emptyBox";
        if($rootScope._userInfo.Token == 2)
        {
            $('#SignIn_popup').slideDown();
        }
        else
        {
            $('#Reservation_popup').slideDown();
        }
    };

    //Send Reservation
    SearchSec.sendReservation = function (messageType) {
        if ($rootScope._userInfo.IsAuthenticate == true) {

            /**
             * Converting LOCAL Time to UTC Time
             */
            var dateTime = moment(SearchSec.ReservationDateTime,"DD-MMM-YYYY hh:mm A").utc().format('DD-MMM-YYYY hh:mm A');
            var currentTaskDate = moment().format('DD-MMM-YYYY hh:mm A');
            $http({ method: 'post', url: GURL + 'ewtSaveMessage', data: { TokenNo: $rootScope._userInfo.Token, ToMasterID: SearchSec.mInfo.TID, MessageType: messageType, Message: SearchSec.ReservationMessage, TaskDateTime: dateTime, LocID :SearchSec.mInfo.LocID,CurrentTaskDate: currentTaskDate } }).success(function (data) {
                if (data.IsSuccessfull) {
                    document.getElementById("reservationMessage").className = "form-control fixTextArea emptyBox";
                    SearchSec.ReservationMessage = "";
                    SearchSec.ReservationDateTime = "";
                    Notification.success({ message: 'Message send success', delay: MsgDelay });
                    $('#Reservation_popup').slideUp();
                }
                else {
                    Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                }
            });
        }
        else {
            //Redirect to Login page
            $('#SignIn_popup').slideDown();
        }
    };

    // Close Reservation Form
    SearchSec.closeReservationForm = function () {
        $('#Reservation_popup').slideUp();
        document.getElementById("reservationMessage").className = "form-control fixTextArea emptyBox";
        SearchSec.ReservationDateTime = "";
    };

    //open Service Request form
    SearchSec.openServiceRequestForm = function () {
        if($rootScope._userInfo.Token == 2)
        {
            $('#SignIn_popup').slideDown();
        }
        else
        {
            $('#ServiceRequest_popup').slideDown();
        }
    };

    //Send Service Request
    SearchSec.sendServiceRequest = function () {
        if ($rootScope._userInfo.IsAuthenticate == true) {
            var currentTaskDate = moment().format('DD-MMM-YYYY hh:mm A');
            $http({ method: 'post', url: GURL + 'ewtSaveMessage', data: { TokenNo: $rootScope._userInfo.Token, ToMasterID: SearchSec.mInfo.TID, MessageType: 4, Message: SearchSec.ServiceRequestMessage, TaskDateTime: today, LocID :SearchSec.mInfo.LocID,CurrentTaskDate : currentTaskDate } }).success(function (data) {

                if (data.IsSuccessfull) {
                    $('#ServiceRequest_popup').slideUp();
                    SearchSec.ServiceRequestMessage = "";
                    Notification.success({ message: 'Message send success', delay: MsgDelay });
                }
                else {
                    Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                }
            });
        }else {
            //Redirect to Login page
            $('#SignIn_popup').slideDown();
        }
    };

    // Close Service Request Form
    SearchSec.closeServiceRequestForm = function () {
        $('#ServiceRequest_popup').slideUp();
        SearchSec.ServiceRequestMessage = "";
    };

    //open CV form
    SearchSec.openCVForm = function() {
        if($rootScope._userInfo.Token == 2)
        {
            $('#SignIn_popup').slideDown();
        }
        else
        {
            $('#CV_popup').slideDown();
        }
    };

    SearchSec.closeMappingPopup = function() {
        $('#Maping_popup').slideUp();
    };

    //Send CV Request
    SearchSec.sendCV = function () {
        if ($rootScope._userInfo.IsAuthenticate == true) {
            var currentTaskDate = moment().format('DD-MMM-YYYY hh:mm A');
            $http({ method: 'post', url: GURL + 'ewtSaveMessage', data: { TokenNo: $rootScope._userInfo.Token, ToMasterID: SearchSec.mInfo.TID, MessageType: 5, Message: "", TaskDateTime: today, LocID :SearchSec.mInfo.LocID, CurrentTaskDate: currentTaskDate } }).success(function (data) {

                if (data.IsSuccessfull) {
                    SearchSec.ServiceRequestMessage = "";
                    $('#CV_popup').slideUp();
                    Notification.success({ message: 'CV send success', delay: MsgDelay });
                }
                else {
                    Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                }
            });
        }
        else {
            //Redirect to Login page
            $('#SignIn_popup').slideDown();
        }
    };

    //check for CV is uploaded by user or not
    SearchSec.checkForCVAvailability = function () {
        SearchSec.showCVSendButton = "";
        if ($rootScope._userInfo.IsAuthenticate == true)
        {
            $http({ method: 'post', url: GURL + 'ewtCheckCV', data: { Token: $rootScope._userInfo.Token } }).success(function (data) {
                if (data.IsSuccessfull)
                {
                    SearchSec.sendCV();
                }
                else
                {
                    $('#CV_popup').slideUp();
                    Notification.error({ message: 'Sorry..! CV is not uploaded... ', delay: MsgDelay });
                }
            });
        }
        else {
            //Redirect to Login page
            $('#SignIn_popup').slideDown();
        }
    };

    //Star Clicked .. add rating
    SearchSec.addRatting = function (ratingValue,starColor) {
        if(ratingValue == 1)
        {
            if(starColor == 'yellow')
            {
                $scope.showStar1 = false;
                //Remove value from array
                var index = rating.indexOf(1);
                if (index >= 0) {
                    rating.splice( index, 1 );
                }
            }
            else
            {
                $scope.showStar1 = true;
                //Add value in array
                rating.push(1);
            }
        }
        if(ratingValue == 2)
        {
            if(starColor == 'yellow')
            {
                $scope.showStar2 = false;

                //Remove value from array
                var index = rating.indexOf(2);
                if (index >= 0) {
                    rating.splice( index, 1);
                }
            }
            else
            {
                $scope.showStar2 = true;
                //Add value in array
                rating.push(2);
            }
        }
        if(ratingValue == 3)
        {
            if(starColor == 'yellow')
            {
                $scope.showStar3 = false;


                //Remove value from array
                var index = rating.indexOf(3);
                if (index >= 0) {
                    rating.splice( index, 1);
                }
            }
            else
            {
                $scope.showStar3 = true;
                //Add value in array
                rating.push(3);
            }
        }
        if(ratingValue == 4)
        {
            if(starColor == 'yellow')
            {
                $scope.showStar4 = false;

                //Remove value from array
                var index = rating.indexOf(4);
                if (index >= 0) {
                    rating.splice( index, 1 );
                }
            }
            else
            {
                $scope.showStar4 = true;
                //Add value in array
                rating.push(4);
            }
        }
        if(ratingValue == 5)
        {
            if(starColor == 'yellow')
            {
                $scope.showStar5 = false;

                //Remove value from array
                var index = rating.indexOf(5);
                if (index >= 0) {
                    rating.splice( index, 1 );
                }
            }
            else
            {
                $scope.showStar5 = true;
                //Add value in array
                rating.push(5);
            }
        }
        //SearchSec.Criteria.Rating = rating.toString();
    };

    // Close CV Form
    SearchSec.closeCVForm = function () {
        $('#CV_popup').slideUp();
    };

    //close download form
    SearchSec.closeDownloadForm = function () {
        $('#download_popup').slideUp();
        SearchSec.IsFilterRowVisible = true;
        SearchSec.IsShowForm = false;
    };

    //close download form
    SearchSec.SearchTypeKeyWord = function () {

        SearchSec.IsShowForm = false;
        SearchSec.IsFilterRowVisible = true;
    };

    // Would write the value of the QueryString-variable called name to the console
    var Qstr = getQueryStringValue("ID");

    if (Qstr != "") {
        SearchSec.Criteria.Keywords = Qstr;
        SearchSec.IsSearchPending = true;
        SearchSec.Criteria.SearchType = "1";
    }

    if($routeParams.ezeid){

        SearchSec.Criteria.Keywords = $routeParams.ezeid;
//      SearchSec.Criteria.SearchType = "1";
        SearchSec.Criteria.SearchType = 1;
        SearchSec.getSearch();
    }
    //open working hour popup
    SearchSec.openWorkingHourPopup = function () {

        if($rootScope._userInfo.Token == 2)
        {
            $('#SignIn_popup').slideDown();
        }
        else
        {
            $scope.showWorkingHourModel = true;
            $http({ method: 'get', url: GURL + 'ewtGetWorkingHrsHolidayList?Token=' + $rootScope._userInfo.Token + '&LocID=' + SearchSec.mInfo.LocID }).success(function (data)
            {
                if (data != 'null')
                {
                    if(data.WorkingHours != "")
                    {
                        $scope.Mo1 = data.WorkingHours[0].MO1;
                        $scope.Mo2 = data.WorkingHours[0].MO2;
                        $scope.Mo3 = data.WorkingHours[0].MO3;
                        $scope.Mo4 = data.WorkingHours[0].MO4;

                        $scope.Tu1 = data.WorkingHours[0].TU1;
                        $scope.Tu2 = data.WorkingHours[0].TU2;
                        $scope.Tu3 = data.WorkingHours[0].TU3;
                        $scope.Tu4 = data.WorkingHours[0].TU4;

                        $scope.We1 = data.WorkingHours[0].WE1;
                        $scope.We2 = data.WorkingHours[0].WE2;
                        $scope.We3 = data.WorkingHours[0].WE3;
                        $scope.We4 = data.WorkingHours[0].WE4;

                        $scope.Th1 = data.WorkingHours[0].TH1;
                        $scope.Th2 = data.WorkingHours[0].TH2;
                        $scope.Th3 = data.WorkingHours[0].TH3;
                        $scope.Th4 = data.WorkingHours[0].TH4;

                        $scope.Fr1 = data.WorkingHours[0].FR1;
                        $scope.Fr2 = data.WorkingHours[0].FR2;
                        $scope.Fr3 = data.WorkingHours[0].FR3;
                        $scope.Fr4 = data.WorkingHours[0].FR4;

                        $scope.Sa1 = data.WorkingHours[0].SA1;
                        $scope.Sa2 = data.WorkingHours[0].SA2;
                        $scope.Sa3 = data.WorkingHours[0].SA3;
                        $scope.Sa4 = data.WorkingHours[0].SA4;

                        $scope.Su1 = data.WorkingHours[0].SU1;
                        $scope.Su2 = data.WorkingHours[0].SU2;
                        $scope.Su3 = data.WorkingHours[0].SU3;
                        $scope.Su4 = data.WorkingHours[0].SU4;
                    }

                    if(data.HolidayList != "")
                    {
                        SearchSec.holiday = data.HolidayList;
                    }
                }
                else
                {
                    // Notification.error({ message: 'Invalid key or not found…', delay: MsgDelay });

                }
            });

           // $('#WorkingHour_popup').slideDown();
        }
    };
   /* // Close  working hour popup
    SearchSec.closeWorkingHourPopup = function () {
        $('#WorkingHour_popup').slideUp();
    };*/

    // show result Tab Window
    $scope.getSearchInfo = function(_item){
        SearchSec.showSearchWindow = false;
        SearchSec.showInfoWindow = true;
        SearchSec.showResultWindow = false;

        $scope.ShowLinks = true;
        getSearchInformation(_item);
    };

    function getSearchInformation(_item)
    {
        var currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
        $http({ method: 'get', url: GURL + 'ewtGetSearchInformation?Token=' + $rootScope._userInfo.Token + '&TID=' + _item.TID + '&CurrentDate=' + currentDate}).success(function (data) {

            if (data != 'null') {
                $timeout(function () {
                    $scope.showLoadingImage = false;
                    SearchSec.mInfo = data[0];

                    $scope.showSalesEnquiry = SearchSec.mInfo.VisibleModules[0];
                    $scope.showHomeDelivery = SearchSec.mInfo.VisibleModules[1];
                    $scope.shoReserVation = SearchSec.mInfo.VisibleModules[2];
                    $scope.showServiceRequest = SearchSec.mInfo.VisibleModules[3];
                    $scope.showSendCv = SearchSec.mInfo.VisibleModules[4];

                    //Below lines are to show address in info tab
                    $scope.AddressForInfoTab = (SearchSec.mInfo.AddressLine1 != "") ? SearchSec.mInfo.AddressLine1 +', ' : "";
                    $scope.AddressForInfoTab += (SearchSec.mInfo.AddressLine2 != "") ? SearchSec.mInfo.AddressLine2 +', ' : "";
                    $scope.AddressForInfoTab += (SearchSec.mInfo.CityTitle != "") ? SearchSec.mInfo.CityTitle +', ' : "";
                    $scope.AddressForInfoTab += (SearchSec.mInfo.CountryTitle != "") ? SearchSec.mInfo.CountryTitle +', ' : "";
                    $scope.AddressForInfoTab += (SearchSec.mInfo.PostalCode != "") ? SearchSec.mInfo.PostalCode : "";

                    if (!/^(f|ht)tps?:\/\//i.test(data[0].Website)) {
                        // url = "http://" + data[0].Website;
                        SearchSec.mInfo.Website = data[0].Website;
                    }

                    $scope.showInfoTab = true;
                    $scope.selectTab('info');

                    //Call for banner
                    SearchSec.IsSearchButtonClicked = true;
                    AutoRefresh = true;
                    getBanner(1);
                   // getAllBanners();
                });
            }
            else {
                Notification.error({ message: 'No Results found..!', delay: MsgDelay });
            }
        });
    }
        // To get and remove value of check box
        $scope.toggleCheckbox = function(event){
            var elem = event.currentTarget;
            var val = $(elem).data('tid');
            if($(elem).is(":checked")){
               $scope.selectedList.push(val);
            }
            else{
                var index = $scope.selectedList.indexOf(val);
                $scope.selectedList.splice(index,1);
           }
        };

        $rootScope.$on('$locationChangeStart',function(){

            $window.localStorage.setItem("selectedTids", JSON.stringify($scope.selectedList));
        });

}]);
