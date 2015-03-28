angular.module('ezeidApp').controller('ProfileController', ['$rootScope', '$scope', '$http', '$q', '$timeout', 'Notification', '$filter', '$window','GURL','$interval','ScaleAndCropImage',function ($rootScope, $scope, $http, $q, $timeout, Notification, $filter, $window,GURL,$interval,ScaleAndCropImage) {

    $scope.showForm = true;
    $scope.showProgress = false;
    $scope.showError = false;

    var profile = this;
    profile._info = {};
    profile.categories = [];
    profile.countries = [];
    profile.states = [];
    var showCurrentLocation = true;
    $scope.isCloseButtonClicked = false;
    var isCancelButton = true;
    profile._info.ParkingStatus = 0;

    $scope.typeInfo = [
        {PropName:'Unique ID',IsBuFree:'glyphicon glyphicon-ok green',IsBuPaid:'glyphicon glyphicon-ok green',IsIndividual:'glyphicon glyphicon-ok green',IsPublic:'glyphicon glyphicon-ok green'},
        {PropName:'Store complete Profile',IsBuFree:'glyphicon glyphicon-ok green',IsBuPaid:'glyphicon glyphicon-ok green',IsIndividual:'glyphicon glyphicon-ok green',IsPublic:'glyphicon glyphicon-ok green'},
        {PropName:'Product Advertising Banners',IsBuFree:'glyphicon glyphicon-remove red',IsBuPaid:'glyphicon glyphicon-ok green',IsIndividual:'glyphicon glyphicon-ban-circle red',IsPublic:'glyphicon glyphicon-remove red'},
        {PropName:'Store Documents to share',IsBuFree:'glyphicon glyphicon-ok green',IsBuPaid:'glyphicon glyphicon-ok green',IsIndividual:'glyphicon glyphicon-ok green',IsPublic:'glyphicon glyphicon-remove red'},
        {PropName:'Store Multiple Addresses : Locations',IsBuFree:'glyphicon glyphicon-ok green',IsBuPaid:'glyphicon glyphicon-ok green',IsIndividual:'glyphicon glyphicon-ok green',IsPublic:'glyphicon glyphicon-ok green'},
        {PropName:'Index your Business on Business Finder',IsBuFree:'glyphicon glyphicon-remove red',IsBuPaid:'glyphicon glyphicon-ok green',IsIndividual:'glyphicon glyphicon-ban-circle red',IsPublic:'glyphicon glyphicon-exclamation-sign yellow'},
        {PropName:'Business Functions',IsBuFree:'',IsBuPaid:'',IsIndividual:'',IsPublic:''},
        {PropName:'  - Sales Enquiry / Home Delivery Form',IsBuFree:'glyphicon glyphicon-remove red',IsBuPaid:'glyphicon glyphicon-ok green',IsIndividual:'glyphicon glyphicon-ban-circle red',IsPublic:'glyphicon glyphicon-ban-circle red'},
        {PropName:'  - Reservation Form',IsBuFree:'glyphicon glyphicon-remove red',IsBuPaid:'glyphicon glyphicon-ok green',IsIndividual:'glyphicon glyphicon-ban-circle red',IsPublic:'glyphicon glyphicon-ban-circle red'},
        {PropName:'  - Service/Support Request Form',IsBuFree:'glyphicon glyphicon-remove red',IsBuPaid:'glyphicon glyphicon-ok green',IsIndividual:'glyphicon glyphicon-ban-circle red',IsPublic:'glyphicon glyphicon-ban-circle red'},
        {PropName:'  - Receive Resumes from Jobseekers',IsBuFree:'glyphicon glyphicon-remove red',IsBuPaid:'glyphicon glyphicon-ok green',IsIndividual:'glyphicon glyphicon-ban-circle red',IsPublic:'glyphicon glyphicon-ban-circle red'},
        {PropName:'  - Send Bulk Sales Enquiries',IsBuFree:'glyphicon glyphicon-remove red',IsBuPaid:'glyphicon glyphicon-ok green',IsIndividual:'glyphicon glyphicon-ban-circle red',IsPublic:'glyphicon glyphicon-ban-circle red'},
        {PropName:'  - Bulk Mails to Jobseekers',IsBuFree:'glyphicon glyphicon-remove red',IsBuPaid:'glyphicon glyphicon-ok green',IsIndividual:'glyphicon glyphicon-ban-circle red',IsPublic:'glyphicon glyphicon-ban-circle red'},
        {PropName:'CRM Software - Web & Mobile Apps',IsBuFree:'glyphicon glyphicon-remove red',IsBuPaid:'glyphicon glyphicon-ok green',IsIndividual:'glyphicon glyphicon-ban-circle red',IsPublic:'glyphicon glyphicon-ban-circle red'}
    ];

    $scope.isTypeSelected  = false;
    $scope.showNoteToPaidUser  = false;

    $scope._selectUserType = function(_type)
    {
        $scope.isTypeSelected  = true;
        if(_type==1)
        {
            profile._info.IDTypeID=2;
            profile._info.SelectionType=1;
        }
        else if(_type==2)
        {
            $scope.showNoteToPaidUser  = true;
            profile._info.IDTypeID=2;
            profile._info.SelectionType=2;
        }
        else if(_type==3)
        {
            profile._info.IDTypeID=1;
            profile._info.SelectionType=0;
        }
        else if(_type==4)
        {
            profile._info.IDTypeID=3;
            profile._info.SelectionType=0;
        }
    }



    $('#datetimepicker1').datetimepicker({
        format: 'd-M-Y',
        hours12: false,
        maxDate: 0,
        timepicker : false
    });
    $('#datetimepicker1').siblings('.input-group-addon').on('click',function(){
        $('#datetimepicker1').trigger('focus');
    });

    var map;
    var mapOptions;
    var marker;
    var markers = [];

    var MsgDelay = 2000;
    var isBusinessIcon = 0; // 1 = icon is for business Type
    var isReSizeImage = false;



    profile.setPicture = function(bigPic,smallPic){
        profile._info.Picture = bigPic;
        if(typeof(smallPic) !== "undefined" || null || ""){
            profile._info.Icon = smallPic;
        }
    };

    $scope.clickPicture = function(){
        $scope.isShowCamera = false;
        //Webcam.reset();

        Webcam.snap( function(data_uri) {

            //Resize the image and set it as logo if the user is individual

            profile._info.Picture = data_uri;

            profile._info.PictureFileName = 'camera-snap-1.jpg'
            if (profile._info.IDTypeID !== 2) {
                //Big size image
                var canvas1 = document.createElement('canvas');
                /******************* Preparing icon file for camera snapshot ***************/
                var image1 = new Image();
                image1.src = data_uri;
                image1.height = 90;
                image1.width = 77;
                var ctx1 = canvas1.getContext("2d");
                ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
                canvas1.width = image1.width;
                canvas1.height = image1.height;
                ctx1.drawImage(image1, 0, 0, image1.width, image1.height);
                $rootScope.BigImage = canvas1.toDataURL("image/jpeg", 0.7);
                profile._info.Picture = $rootScope.BigImage;


                var canvas = document.createElement('canvas');
                /******************* Preparing icon file for camera snapshot ***************/
                var image = new Image();
                image.src = data_uri;
                image.height = 40;
                image.width = 40;
                var ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0, image.width, image.height);
                $rootScope.smallImage = canvas.toDataURL("image/jpeg", 0.7);
                /******************* Preparing icon file for camera snapshot ends ***************/
                profile._info.Icon = $rootScope.smallImage;

            } else {

                var canvas = document.createElement('canvas');
                /******************* Preparing icon file for camera snapshot ***************/
                var image = new Image();
                image.src = data_uri;
                image.height = 90;
                image.width = 279;
                var ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0, image.width, image.height);
                $rootScope.BigImage = canvas.toDataURL("image/jpeg", 0.7);
                /******************* Preparing icon file for camera snapshot ends ***************/
                profile._info.Icon = " ";
                profile._info.Picture = $rootScope.BigImage;


                profile._info.IconFileName = 'camera-snap-1.jpg';
            }
            Webcam.reset();
        });
    };
    var webCamErrorHandler = function(){
        $scope.isShowCamera = false;
        Notification.error({message:'Webcam is not present',delay:MsgDelay});
    };
    /***************************** Camera Code ends **********************************/
    if ($rootScope._userInfo) {
    }
    else {
        if (typeof (Storage) !== "undefined") {
            var encrypted = localStorage.getItem("_token");
            if (encrypted) {
                var decrypted = CryptoJS.AES.decrypt(encrypted, "EZEID");
                var Jsonstring = decrypted.toString(CryptoJS.enc.Utf8);
                if (Jsonstring) {
                    $rootScope._userInfo = JSON.parse(Jsonstring);
                }
            }
            else {
                $rootScope._userInfo = {
                    IsAuthenticate: false,
                    Token: '',
                    FirstName: '',
                    Type:'',
                    Icon:''
                };
            }
        } else {
            // Sorry! No Web Storage support..
            $rootScope._userInfo = {
                IsAuthenticate: false,
                Token: '',
                FirstName: '',
                Type:'',
                Icon:''
            };
            alert('Sorry..! Browser does not support');
            window.location.href = "#/home";
        }
    }

    $http({ method: 'get', url: GURL + 'ewmGetCountry?LangID=1' }).success(function (data) {
        if ($rootScope._userInfo.Token == false) {
            var _obj = { CountryID: 0, CountryName: '--Country--', ISDCode: '####' };
            data.splice(0, 0, _obj);
            profile._info.CountryID = _obj.CountryID;
        }
        profile.countries = data;
    });

    $scope.reloadAgain = function(){
        $scope.showForm = false;
        $scope.showProgress = true;
        $scope.showError = false;


        var promise = GetUserDetails();

        promise.then(function(promiseStatus){
            if(promiseStatus){
                $scope.showProgress = false;
                $scope.showError = false;
                $scope.showForm = true;
            }
            else{
                $scope.showForm = false;
                $scope.showProgress = false;
                $scope.showError = true;
            }
        });
    };

    $scope.$watch('_userInfo.IsAuthenticate', function () {
        if ($rootScope._userInfo.IsAuthenticate == true) {

            $scope.showForm = false;
            $scope.showProgress = true;
            $scope.showError = false;




            var promise = GetUserDetails();

            promise.then(function(promiseStatus){
                if(promiseStatus){
                    $scope.showProgress = false;
                    $scope.showError = false;
                    $scope.showForm = true;
                }
                else{
                    $scope.showForm = false;
                    $scope.showProgress = false;
                    $scope.showError = true;
                }
            });

            $scope.isTypeSelected  = true;
            $scope.heading = 'Update Profile';
        }
        else {
            $scope.isTypeSelected  = false;
            $scope.heading = 'Create New Profile';
            profile._info = {};
            profile._info.IDTypeID = 1;
            profile._info.NameTitleID = 1;
            profile._info.ParkingStatus = 0;
            profile._info.OpenStatus = 1;
        }
    });

    /**
     * Added for confirmation box while navigating to other
     */
    $scope.$on('$locationChangeStart',function(event,next,current){

        console.log($rootScope._userInfo.isFirstTime);

        if(!$rootScope._userInfo.isFirstTime)
        {
            if (!$scope.UserForm.$dirty) return;
            if(!isCancelButton) return;
            var confirm = $window.confirm('Are you sure you want to discard the changes without saving?');
            // Preventing them from navigating away
            if(!confirm){
                try{
                    event.defaultPrevented();
                }
                catch(ex){
                    event.preventDefault();
                }
            }
        }
        else
        {
            $rootScope._userInfo.isFirstTime = false;
        }


    });


    /***************************** Camera Code ***************************************/
    $scope.isShowCamera = false;
    console.log($rootScope._userInfo);
    Webcam.set({
        // live preview size
        /*width: 250,*/

        width: ($rootScope._userInfo.UserType == 1) ? 77 : 280,
        height: 90,

        // device capture size
        /*dest_width: 250,*/
        dest_width: ($rootScope._userInfo.UserType == 1) ? 77 : 280,
        dest_height: 90,

        // final cropped size
        crop_width: ($rootScope._userInfo.UserType == 1) ? 77 : 280,
        crop_height: 90,


        // format and quality
        image_format: 'jpeg',
        jpeg_quality: 92
    });
    Webcam.on('error',function(){
        $scope.isShowCamera = false;
        Notification.error({message:'Camera not found',delay:MsgDelay});
    });

    $scope.showCamera = function(){
        $scope.isShowCamera = true;
        Webcam.attach( '#camera' );
    };

    $scope.hideCamera = function(){
        Webcam.reset();
        $scope.isShowCamera = false;
    };


    if($rootScope._userInfo.IsAuthenticate){
        $scope.heading = 'Update Profile';
        showCurrentLocation = false;
    }
    else
    {
        $scope.heading = 'Create New Profile';
        showCurrentLocation = true;
    }

    //Custom Methods
    /**
     * Returning promise for Identifying if data is successfully loaded or not
     * @returns {promise|*}
     * @constructor
     */
    function GetUserDetails() {
        //$rootScope.IsIdAvailable = true;
        var defer = $q.defer();
        var promiseResolved = false;

        $http({
            method: 'get',
            url: GURL + 'ewtGetUserDetails?Token=' + $rootScope._userInfo.Token
        }).success(function (data) {
                if(data && data.length > 0 && data !== "null"){
                    profile.getStates(data[0].CountryID,false);
                    profile._info = data[0];
                    profile._info.StateID = data[0].StateID;
                    profile._info.CountryID = data[0].CountryID;
                    profile._info.ISDMobileNumber = data[0].ISDMobileNumber;
                    profile._info.ISDPhoneNumber = data[0].ISDPhoneNumber;
                    profile._info.Latitude = data[0].Latitude;
                    profile._info.Longitude = data[0].Longitude;
                    profile._info.EZEID = data[0].EZEID;
                    profile._info.PIN = data[0].PIN;
                    profile._info.ParkingStatus = data[0].ParkingStatus;


                    if(!profile._info.PIN)
                    {
                        profile._info.SecurePin = false;
                    }
                    else
                    {
                        profile._info.SecurePin = true;
                    }

                    profile._info.SalesEnquiryButton =  profile._info.SalesEnquiryButton == 1 ? true : false;
                    profile._info.HomeDeliveryButton = profile._info.HomeDeliveryButton == 1 ? true : false;
                    profile._info.ReservationButton = profile._info.ReservationButton == 1 ? true : false;
                    profile._info.SupportButton = profile._info.SupportButton == 1 ? true : false;
                    profile._info.CVButton = profile._info.CVButton == 1 ? true : false;
                    profile._info.DOB = data[0].DOB;
                    // profile._info.DOB = $filter('date')(new Date(data[0].DOB), 'dd-MMM-yyyy');
                    defer.resolve(true);
                    try{
                        $timeout(function(){
                            initialize();
                        },2000)

                    }
                    catch(ex){}

                }
                else{
                    defer.resolve(false);
                }
                promiseResolved = true;
            }).error(function(err){
                defer.resolve(false);
            });
        /**
         * If promise is not resolved in 10 sec. explicitly the promise will be resolved with error and
         * user will see error message to load data again
         */
        $timeout(function(){
            if(!promiseResolved){
                defer.resolve(false);
            }
        },10000);

        return defer.promise;
    }

    if (!$rootScope._userInfo.IsAuthenticate) {
        initialize();
    }

    //Created by Abhishek for pop-up html(terms and condition)
    this.openTermsAndConditionForm=function(){
        $('#Terms_popup').css({'position':'fixed'});
        $('#Terms_popup > div').css({'margin-top':'0%'});
        $('#Terms_popup').slideDown();
    };
    this.closedTermsAndConditionForm=function(){
        $('#Terms_popup').slideUp();
    }
    this.CheckisIDAvailable = function () {

        $scope.disableAvalabilityButton = true;
        $scope.showNoteToPaidUser  = false;
        /* var sEzeid = profile._info.EZEID;
         var lastTwo = sEzeid.substr(sEzeid.length - 2);
         if(lastTwo != "ap")
         {*/
        $http({
            method: 'get',
            url: GURL + 'ewGetEZEID?EZEID=' + profile._info.EZEID
        }).success(function (data) {
                profile._info.IsIDAvailable = data.IsIdAvailable;
            });
        /* }
         else
         {
         profile._info.IsIDAvailable = false;
         }*/
    };

    this.ezeidBoxClicked = function () {
        $scope.disableAvalabilityButton = false;
    };

    //if secure pin checkbox is uncheck remove PIN Value
    this.securePinCliked = function () {
        if(!profile._info.SecurePin)
        {
            profile._info.PIN = "";
        }
    };


    //Maps
    function initialize() {

        var initialLocation;
        var currentLoc = new google.maps.LatLng(12.295810, 76.639381);

        map = new google.maps.Map(document.getElementById('map-canvas'), {
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            Zoom: 16
        });

        var ClocBtn = (document.getElementById('mapCloc'));
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(ClocBtn)

        if ($rootScope._userInfo.IsAuthenticate == true) {
            initialLocation = new google.maps.LatLng(profile._info.Latitude, profile._info.Longitude);
            PlaceCurrentLocationMarker(initialLocation);

        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(FindCurrentLocation);
            }
        }

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

        //// Create the search box and link it to the UI element.
        var input = (document.getElementById('txtSearch'));
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        var searchBox = new google.maps.places.SearchBox((input));

        // Listen for the event fired when the user selects an item from the
        // pick list. Retrieve the matching places for that item.
        google.maps.event.addListener(searchBox, 'places_changed', function () {
            var places = searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }
            for (var i = 0, marker; marker = markers[i]; i++) {
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

        // Bias the SearchBox results towards places that are within the bounds of the
        // current map's viewport.
        google.maps.event.addListener(map, 'bounds_changed', function () {
            var bounds = map.getBounds();
            searchBox.setBounds(bounds);
        });

        google.maps.event.addListenerOnce(map, 'idle', function () {
            if(profile.IsSearchPending){
                profile.getSearch();
            }
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
        profile._info.CityTitle = "";
        profile._info.PostalCode = "";

        angular.forEach(results, function (mapResultValue, index) {

            if (mapResultValue.types[0] == 'locality') {
                if (profile._info.CityTitle != "") {
                    profile._info.CityTitle += "," + mapResultValue.long_name;
                    // $scope.$apply();
                } else {
                    profile._info.CityTitle = mapResultValue.long_name;
                    // $scope.$apply();
                }
            }

            if (mapResultValue.types[0] == 'administrative_area_level_1') {
                if (profile._info.State!= "") {
                    profile._info.State = mapResultValue.long_name;
                    //  $scope.$apply();
                } else {
                    profile._info.State = mapResultValue.long_name;
                    //$scope.$apply();
                }
            }

            if (mapResultValue.types[0] == 'postal_code') {
                if (profile._info.PostalCode != "") {
                    profile._info.PostalCode += "," + mapResultValue.long_name;
                    //$scope.$apply();
                } else {
                    profile._info.PostalCode = mapResultValue.long_name;
                    //  $scope.$apply();
                }
            }

            if (mapResultValue.types[0] == 'country') {
                if (profile._info.Country != "") {
                    profile._info.Country = mapResultValue.long_name;
                    //$scope.$apply();
                } else {
                    profile._info.Country = mapResultValue.long_name;
                    //  $scope.$apply();
                }
            }

        });


        //   if( profile._info.CountryID == null || profile._info.CountryID == "")
        //   {
        var countryFileredString = $filter('filter')(profile.countries, profile._info.Country)
        for (var key in countryFileredString)
        {
            if(profile._info.Country == countryFileredString[key].CountryName)
            {
                profile._info.CountryID = countryFileredString[key].CountryID;
                profile._info.ISDMobileNumber = countryFileredString[key].ISDCode;
                profile._info.ISDPhoneNumber = countryFileredString[key].ISDCode;
            }
        }
        //  }
        updateState(profile._info.CountryID,true);
        getISDCode(profile._info.CountryID);
        // }
    }

    $scope.stateFilter = function()
    {
        var statesString = $filter('filter')(profile.states, profile._info.State);
        profile._info.StateID = statesString[0].StateID;
    }


    this.isMapInitialized = function () {
//        if (profile.mapInit == false) {
//            initialize();
//            profile.mapInit = true;
//        }
    };
    this.SearchOnMap = function (Query) {
        var request = {
            query: Query
        };
        service = new google.maps.places.PlacesService(map);
        service.textSearch(request, getMapSearchResults);
    };

    function getMapSearchResults(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            if (results.length > 0) {
                var place = results[0];
                profile._info.Latitude = place.geometry.location.k;
                profile._info.Longitude = place.geometry.location.D;
                var loc = new google.maps.LatLng(profile._info.Latitude, profile._info.Longitude);
                PlaceCurrentLocationMarker(loc);
                getReverseGeocodingData(profile._info.Latitude, profile._info.Longitude);
            }
        }
        else {
            Notification.error({ message: 'No Results found..!', delay: MsgDelay });
        }
    }
    function PlaceCurrentLocationMarker(location) {
        if (marker != undefined) {
            marker.setMap(null);
        }
        map.setCenter(location);
        marker = new google.maps.Marker({
            position: location,
            title: "Current Location",
            draggable: true,
            map: map,
            icon: 'images/you_are_here.png'
        });
        google.maps.event.addListener(marker, 'dragend', function (e) {
            profile._info.Latitude = marker.getPosition().k;
            profile._info.Longitude = marker.getPosition().D;
            getReverseGeocodingData(marker.getPosition().k, marker.getPosition().D);
            // myinfowindow.setContent('<h6>You are here</h6>');
            //   myinfowindow.open(map, marker);
        });
    }
    function FindCurrentLocation(position) {
        if (showCurrentLocation) {
            var initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            PlaceCurrentLocationMarker(initialLocation);
            profile._info.Latitude = position.coords.latitude;
            profile._info.Longitude = position.coords.longitude;
            getReverseGeocodingData(profile._info.Latitude, profile._info.Longitude);
        }
    };
    this.getMyLocation = function () {
        if (navigator.geolocation) {
            showCurrentLocation = true;
            navigator.geolocation.getCurrentPosition(FindCurrentLocation);
        }
    };

    $http({ method: 'get', url: GURL + 'ewmGetCategory?LangID=1' }).success(function (data) {
        var _obj = { CategoryID: 0, CategoryTitle: '--Category--' };
        data.splice(0, 0, _obj);
        profile.categories = data;
        profile._info.CategoryID = _obj.CategoryID;
    });


    $http({ method: 'get', url: GURL + 'ewmGetMTitle?LangID=1' }).success(function (data) {
        profile.Titles = data;
    });

    this.getStates = function (CountryID,stateFilter) {
        stateFilter = (stateFilter == "") ? false : true;
        // if stateFilter = 0 don't called stateFilter()  and if stateFilter = 1 called stateFilter()
        getISDCode(CountryID);
        updateState(CountryID,stateFilter);
    };
    this.getCities = function (StateID) {
        $http({ method: 'get', url: GURL + 'ewmGetCity?LangID=1&StateID=' + StateID }).success(function (data) {
            profile.cities = data;
        });
    };

    function updateState(CountryID,isStateFilter)
    {
        isStateFilter = (isStateFilter == "") ? false : true;
        $http({ method: 'get', url: GURL + 'ewmGetState?LangID=1&CountryID=' + CountryID }).success(function (data) {
            if ($rootScope._userInfo.Token == false) {
                var _obj = { StateID: 0, StateName: '--State--' };
                data.splice(0, 0, _obj);
                profile._info.StateID = _obj.StateID;
            }
            profile.states = data;
            if(isStateFilter)
            {
                $scope.stateFilter();
            }
        });
    }

    //To set country ISD Code from Country Id
    function getISDCode(CountryID)
    {
        var countryData = $filter('filter')(profile.countries, CountryID);
        for (var key in countryData)
        {
            if(profile._info.Country == countryData[key].CountryName)
            {
                profile._info.ISDMobileNumber = countryData[key].ISDCode;
                profile._info.ISDPhoneNumber = countryData[key].ISDCode;
            }
        }
    }



    function isValidate()
    {
        var notificationMessage = "";
        var errorList  = [];
        // Check validations
        if(!profile._info.EZEID)
        {
            errorList.push('EZEID is Required');
        }

        if(profile._info.PIN)
        {
            if(profile._info.PIN != ""){
                if(profile._info.PIN<100)
                {
                    errorList.push('Pin should greater or equal 100');
                }
            }
        }

        if($scope.disableAvalabilityButton == false)
        {
            errorList.push('First to Check EZE ID availability');
        }

        if(!profile._info.Password && $rootScope._userInfo.IsAuthenticate == false)
        {
            errorList.push('Password is Required');
        }
        if(!profile._info.CPassword && $rootScope._userInfo.IsAuthenticate == false)
        {
            errorList.push('Re-Enter Password is Required');
        }
        if(profile._info.Password != profile._info.CPassword && $rootScope._userInfo.IsAuthenticate == false)
        {
            errorList.push('Password Mismatch');
        }
        if(profile._info.IDTypeID  == '2')
        {
            if(!profile._info.CompanyName)
            {
                notificationMessage += notificationMessage != "" ? ", Company Name Required " : "Company Name Required";
                errorList.push('Company Name Required');
            }
        }
        else
        {
            if(!profile._info.FirstName)
            {
                notificationMessage += notificationMessage != "" ? ", First Name Required " : "First Name Required";
                errorList.push('First Name Required');
            }
        }
//                if(!profile._info.FirstName)
//                {
//                    notificationMessage += notificationMessage != "" ? ", First Name Required " : "First Name Required";
//                    errorList.push('First Name Required');
//                }
//                if(!profile._info.LastName)
//                {
//                    errorList.push(' Last Name Required ');
//                }
        if(!profile._info.AddressLine1)
        {
            errorList.push(' Address1 Required');
        }
        if(!profile._info.CountryID)
        {
            errorList.push('Country Required');
        }
        if(!profile._info.StateID)
        {
            errorList.push('State Required');
        }
        if(!profile._info.CityTitle)
        {
            errorList.push(' City Required ');
        }
        if(!profile._info.PostalCode)
        {
            errorList.push('PostalCode Required ');
        }
        if(!profile._info.MobileNumber)
        {
            errorList.push('Mobile Number Required ');
        }
        if(profile._info.isWrongEmailPattern)
        {
            errorList.push('Not valid email!');
        }
        if(profile._info.isWrongEmailPatternSales)
        {
            errorList.push('Not valid email!');
        }
        if(profile._info.isWrongEmailPatternHome)
        {
            errorList.push('Not valid email!');
        }
        if(profile._info.isWrongEmailPatternReservation)
        {
            errorList.push('Not valid email!');
        }
        if(profile._info.isWrongEmailPatternSupport)
        {
            errorList.push('Not valid email!');
        }
        if(profile._info.isWrongEmailPatternCV)
        {
            errorList.push('Not valid email!');
        }

        if(profile._info.IDTypeID  == '1')
        {
            if(!profile._info.DOB)
            {
                errorList.push('Date of birth Required ');
            }
        }

        if(errorList.length>0){
            for(var i = errorList.length; i>0;i--)
            {
                Notification.error({ message: errorList[i-1], delay: MsgDelay });
            }
        };
        //Return false if errorList is greater than zero
        return (errorList.length>0)? false : true;
    }

    function isBasicValidate()
    {
        var notificationMessage = "";
        var errorList  = [];
        // Check validations
        if(!profile._info.EZEID)
        {
            errorList.push('EZEID is Required');
        }

        if(profile._info.PIN)
        {
            if(profile._info.PIN != ""){
                if(profile._info.PIN<100)
                {
                    errorList.push('Pin should greater or equal 100');
                }
            }
        }

        if($scope.disableAvalabilityButton == false)
        {
            errorList.push('First to Check EZE ID availability');
        }

        if(!profile._info.Password && $rootScope._userInfo.IsAuthenticate == false)
        {
            errorList.push('Password is Required');
        }
        if(!profile._info.CPassword && $rootScope._userInfo.IsAuthenticate == false)
        {
            errorList.push('Re-Enter Password is Required');
        }
        if(profile._info.Password != profile._info.CPassword && $rootScope._userInfo.IsAuthenticate == false)
        {
            errorList.push('Password Mismatch');
        }
        if(profile._info.IDTypeID  == '2')
        {
            if(!profile._info.CompanyName)
            {
                notificationMessage += notificationMessage != "" ? ", Company Name Required " : "Company Name Required";
                errorList.push('Company Name Required');
            }
        }
        else
        {
            if(!profile._info.FirstName)
            {
                notificationMessage += notificationMessage != "" ? ", First Name Required " : "First Name Required";
                errorList.push('First Name Required');
            }
        }
//                if(!profile._info.LastName)
//                {
//                    errorList.push(' Last Name Required ');
//                }
        if(errorList.length>0){
            for(var i = errorList.length; i>0;i--)
            {
                Notification.error({ message: errorList[i-1], delay: MsgDelay });
            }
        };
        //Return false if errorList is greater than zero
        return (errorList.length>0)? false : true;
    }

    this.saveBasicRegistration = function (UserForm){
        if(isBasicValidate())
        {
            var sEzeid = profile._info.EZEID;
            var lastTwo = sEzeid.substr(sEzeid.length - 2);
            if(lastTwo != "ap")
            {
//                        // create/Save profile
//                        profile._info.SalesEnquiryButton =  profile._info.SalesEnquiryButton == true ? 1 : 0;
//                        profile._info.HomeDeliveryButton = profile._info.HomeDeliveryButton == true ? 1 : 0;
//                        profile._info.ReservationButton = profile._info.ReservationButton == true ? 1 : 0;
//                        profile._info.SupportButton = profile._info.SupportButton == true ? 1 : 0;
//                        profile._info.CVButton = profile._info.CVButton == true ? 1 : 0;
//                        profile._info.Gender = (profile._info.Gender == undefined || profile._info.Gender == null )? 2 : profile._info.Gender ;

                profile._info.OperationType = 1;

//                if(profile._info.IDTypeID == 1)
//                {
//                    profile._info.Icon = $rootScope.smallImage;
//                }
//                else
//                {
//                    if(isBusinessIcon == 1)
//                    {
//                        profile._info.Icon = $rootScope.smallImage;
//                    }
//                }

                profile._info.LanguageID = 1;
                profile._info.IDTypeID = parseInt(profile._info.IDTypeID, 10);
                profile._info.Token = $rootScope._userInfo.Token;

                var sTokenString = "";
                sTokenString = profile._info.Token;
                $http({
                    method: "POST",
                    url: GURL + 'ewSavePrimaryEZEData',
                    data: JSON.stringify(profile._info),
                    headers: { 'Content-Type': 'application/json' }
                }).success(function (data) {
                        if (data.IsAuthenticate) {
                            $rootScope._userInfo = data;

                            var userName = data.FirstName;
                            if(userName.length >= 15)
                            {
                                userName = userName.substring(0,12);
                                userName = userName+ "...";
                            }
                            $rootScope._userInfo.userName = userName ;
                            $rootScope._userInfo.isFirstTime = true;

                            if (typeof (Storage) !== "undefined") {
                                var encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), "EZEID");
                                localStorage.setItem("_token", encrypted);
                            } else {
                                alert('Sorry..! Browser does not support');
                                window.location.href = "#/home";
                            }
                            document.getElementById("EZEID").className = "form-control emptyBox";
                            document.getElementById("password").className = "form-control emptyBox";
                            document.getElementById("re-password").className = "form-control emptyBox";
                            document.getElementById("FName").className = "form-control emptyBox";
                            document.getElementById("LName").className = "form-control emptyBox";
                            document.getElementById("streeName").className = "form-control emptyBox";
                            document.getElementById("city").className = "form-control emptyBox";
                            document.getElementById("postalCode").className = "form-control emptyBox";
                            document.getElementById("mobile_phone").className = "form-control emptyBox";

                            getISDCode(profile._info.CountryID);
                            if (sTokenString == "")
                            {
                                $scope.isCloseButtonClicked = true;
                                window.location.href = "#/congratulations";
                            }
                            else
                            {
                                $scope.isCloseButtonClicked = true;
                                window.location.href = "#/home";
                                Notification.success({ message: "Updated...", delay: MsgDelay });
                            }
                        }
                        else
                        {
                            if (UserForm.$valid) {
                                Notification.error({ message: "Registration failed", delay: MsgDelay });
                            }
                        }
                    });
            }
            else
            {
                Notification.error({ message: "Not available...", delay: MsgDelay });
                profile._info.IsIDAvailable = false;
            }
        }
    }


    //Save and Update Primary Registration
    this.savePrimaryRegistration = function (UserForm) {
        isCancelButton = false;
        if(isValidate())
        {
            var sEzeid = profile._info.EZEID;
            var lastTwo = sEzeid.substr(sEzeid.length - 2);
            if(lastTwo != "ap")
            {
                profile._info.OperationType = 2;
                // create/Save profile
                profile._info.SalesEnquiryButton =  profile._info.SalesEnquiryButton == true ? 1 : 0;
                profile._info.HomeDeliveryButton = profile._info.HomeDeliveryButton == true ? 1 : 0;
                profile._info.ReservationButton = profile._info.ReservationButton == true ? 1 : 0;
                profile._info.SupportButton = profile._info.SupportButton == true ? 1 : 0;
                profile._info.CVButton = profile._info.CVButton == true ? 1 : 0;
                profile._info.Gender = (profile._info.Gender == undefined || profile._info.Gender == null )? 2 : profile._info.Gender ;
                // profile._info.Picture = $rootScope.BigImage;

                console.log(profile._info.Picture);

                if(profile._info.IDTypeID == 1)
                {
                    profile._info.Icon = $rootScope.smallImage;
                }
                else
                {
                    if(isBusinessIcon == 1)
                    {
                        profile._info.Icon = $rootScope.smallImage;
                    }
                }
                profile._info.LanguageID = 1;
                profile._info.IDTypeID = parseInt(profile._info.IDTypeID, 10);
                profile._info.Token = $rootScope._userInfo.Token;

                var sTokenString = "";
                sTokenString = profile._info.Token;

                $('#CV_popup').slideDown();

                $http({
                    method: "POST",
                    url: GURL + 'ewSavePrimaryEZEData',
                    data: JSON.stringify(profile._info),
                    headers: { 'Content-Type': 'application/json' }
                }).success(function (data) {
                        if (data.IsAuthenticate) {
                            $rootScope._userInfo = data;

                            var userName = data.FirstName;
                            if(userName.length >= 15)
                            {
                                userName = userName.substring(0,12);
                                userName = userName+ "...";
                            }
                            $rootScope._userInfo.userName = userName ;

                            if (typeof (Storage) !== "undefined") {
                                var encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), "EZEID");
                                localStorage.setItem("_token", encrypted);
                            } else {
                                alert('Sorry..! Browser does not support');
                                window.location.href = "#/home";
                            }
                            document.getElementById("EZEID").className = "form-control emptyBox";
                            document.getElementById("password").className = "form-control emptyBox";
                            document.getElementById("re-password").className = "form-control emptyBox";
                            document.getElementById("FName").className = "form-control emptyBox";
                            document.getElementById("LName").className = "form-control emptyBox";
                            document.getElementById("streeName").className = "form-control emptyBox";
                            document.getElementById("city").className = "form-control emptyBox";
                            document.getElementById("postalCode").className = "form-control emptyBox";
                            document.getElementById("mobile_phone").className = "form-control emptyBox";

                            getISDCode(profile._info.CountryID);
                            if (sTokenString == "")
                            {
                                $scope.isCloseButtonClicked = true;
                                window.location.href = "#/congratulations";
                            }
                            else
                            {
                                $scope.isCloseButtonClicked = true;
                                window.location.href = "#/home";
                                Notification.success({ message: "Updated...", delay: MsgDelay });
                                // Upload CV Dialog with link
                                // $('#Help_popup').slideDown();
                            }
                        }
                        else {
                            if (UserForm.$valid) {
                                Notification.error({ message: "Registration failed", delay: MsgDelay });
                            }
                        }
                    });
            }
            else
            {
                Notification.error({ message: "Not available...", delay: MsgDelay });
                profile._info.IsIDAvailable = false;
            }
        }
        else
        {
            // Notification.error({ message: notificationMessage, delay: MsgDelay });
        }
    };

    this.closeRegistrationForm = function () {
        $scope.isCloseButtonClicked = true;
        window.location.href = "#/home";
    }


    /**
     * Upload Image From service
     * @param image
     *
     */
    $scope.uploadImageFromService = function(elem){
        var userType = profile._info.IDTypeID;
        var image = $(elem)[0].files[0];
        var fileName = image.name;

        profile._info.PictureFileName =  fileName;

        var imageHeight = 90;
        var imageWidth = 280;
        if(userType == 1){
            imageWidth = 77;
        }
        ScaleAndCropImage.covertToBase64(image).then(function(imageUrl){
            var scaledImageUrl = ScaleAndCropImage.scalePropotional(imageUrl,imageHeight,imageWidth);
            var finalImage = ScaleAndCropImage.cropImage(scaledImageUrl,imageHeight,imageWidth);

            profile._info.Picture = finalImage;
            if(userType == 1 && 0){
                profile._info.IconFileName = fileName;
                var scImageUrl = ScaleAndCropImage.scalePropotional(imageUrl,40,40);
                var iconImg = ScaleAndCropImage.cropImage(scImageUrl,40,40);
                profile._info.Icon = iconImg;
                $rootScope.smallImage = iconImg;
            }
        });

    };
    //Upload Picture
   /* $scope.uploadImageForEditLocation = function (image) {
        profile._info.PictureFileName = image[0].name;
        fileToDataURL(image[0]).then(function (dataURL) {

            //  profile._info.Picture = dataURL;
            if (!profile._info.IDTypeID == 2) {
                profile._info.Icon = $rootScope.smallImage;
                *//* profile._info.Icon = "";
                 profile._info.IconFileName = "";*//*
            } else {
                profile._info.IconFileName = image[0].name;
            }
        });

    };

    var fileToDataURL = function (file) {
        var deferred = $q.defer();
        var reader = new FileReader();
        reader.onload = function (e) {
            deferred.resolve(e.target.result);
        };
        reader.readAsDataURL(file);
        return deferred.promise;
    };*/


    //Upload Icon
    $scope.uploadIcon = function (image) {
        isBusinessIcon = 1;
        profile._info.Icon = $rootScope.smallImage;
        profile._info.IconFileName = image[0].name;
        // Notification.success({ message: "Saved...", delay: MsgDelay });
    };

    this.closeAddPhotoForEditLocation = function () {
        if ($rootScope._userInfo.IsAuthenticate == false) {
            profile._info.Picture = "";
            profile._info.PictureFileName = "";
        }
    };

    this.fileSizeConvert = function (bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    };

    profile.parkingStatus = [{ id: 0, label: "Parking Status" },{ id: 1, label: "Public Parking" }, { id: 2, label: "Valet Parking" }, { id: 3, label: "No parking" }];
    profile.gender = [{ id: 0, label: "Male" }, { id: 1, label: "Female" }, { id: 2, label: "Unspecified" }];

    $scope.$on("$destroy", function(){
        delete map;
    });
}]);

