
angular.module('ezeidApp').controller('LocationsController', function ($rootScope, $scope, $http, $q, $timeout, Notification, $filter, $interval, $window) {

    var SLocCtrl = this;
    var map;
    var mapOptions;
    var isCancelButton = true;
    SLocCtrl.profile = {};
    $scope.isMapLoaded = false;
//    var myinfowindow = new google.maps.InfoWindow({
//        content: ''
//    });

    /**
     * Added for confirmation box while navigating to other
     */
    $scope.$on('$locationChangeStart',function(event,next,current){
        if (!$scope.SecLocForm.$dirty) return;
        if(!isCancelButton) return;
        if(SLocCtrl.IsShowForm){
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
    });


    var marker;
    var markers = [];

    var MsgDelay = 2000;
    SLocCtrl.IsShowForm = false;
    SLocCtrl.LocationsList = [];
    SLocCtrl._locInfo = {};
    SLocCtrl.mapInit = false;
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
                    Type: '',
                    Icon: ''
                };
            }
        } else {
            // Sorry! No Web Storage support..
            $rootScope._userInfo = {
                IsAuthenticate: false,
                Token: '',
                FirstName: '',
                Type: '',
                Icon: ''
            };
            alert('Sorry..! Browser does not support');
            window.location.href = "/";
        }
    }

    $scope.$watch('_userInfo.IsAuthenticate', function () {
        if ($rootScope._userInfo.IsAuthenticate == true) {
            getSecondaryLoc();
            GetUserDetails();
        } else {

            SLocCtrl.profile._info = {};
            SLocCtrl.profile._info.IDTypeID = 1;
            SLocCtrl.profile._info.NameTitleID = 1;
            SLocCtrl.profile._info.ParkingStatus = 1;
            SLocCtrl.profile._info.OpenStatus = 1;
            window.location.href = "/";
        }
    });

    
     /***************************** Camera Code ***************************************/
        $scope.isShowCamera = false;
        

        Webcam.set({
				// live preview size
				width: 250,
				height: 200,
				
				// device capture size
				dest_width: 250,
				dest_height: 200,
				
				// final cropped size
				crop_width: 200,
				crop_height: 200,
				
				// format and quality
				image_format: 'jpeg',
				jpeg_quality: 92
			});

        $scope.showCamera = function(){
            $scope.isShowCamera = true;
            Webcam.attach( '#camera' );
        };

        $scope.hideCamera = function(){
            Webcam.reset();
            $scope.isShowCamera = false;
        }
        
        $scope.clickPicture = function(){
                $scope.isShowCamera = false;
                //Webcam.reset();
                
                Webcam.snap( function(data_uri) {
                        SLocCtrl._locInfo.Picture = data_uri;

                    // shut down camera, stop capturing
                    Webcam.reset();
                });
              };
        
        /***************************** Camera Code ends **********************************/
    
    //Custom Methods
        function GetUserDetails() {
            //$rootScope.IsIdAvailable = true;
            $http({
                method: 'get',
                url: GURL + 'ewtGetUserDetails?Token=' + $rootScope._userInfo.Token
            }).success(function (data) {
                    SLocCtrl.profile._info = data[0];
             });
        }


    this.openNewLocationForm = function (secLocForm) {

        document.getElementById("mobile_phone").className = "form-control emptyBox";
        document.getElementById("Location").className = "form-control emptyBox";
        document.getElementById("streeName").className = "form-control emptyBox";
        document.getElementById("cities").className = "form-control emptyBox";
        document.getElementById("postalCode").className = "form-control emptyBox";
      //  var stateId = SLocCtrl._locInfo.StateID;
        SLocCtrl._locInfo = {};

        SLocCtrl.IsShowForm = true;
        SLocCtrl.editSecLocEnb=false;

        SLocCtrl._locInfo.TID = 0;
       // SLocCtrl._locInfo.StateID = stateId;
        SLocCtrl._locInfo.WorkingHours = "";
        SLocCtrl._locInfo.SalesEnquiryMailID = "";
        SLocCtrl._locInfo.HomeDeliveryMailID = "";
        SLocCtrl._locInfo.ReservationMailID = "";
        SLocCtrl._locInfo.SupportMailID = "";
        SLocCtrl._locInfo.CVMailID = "";
        SLocCtrl._locInfo.LaptopSLNO = "";
        SLocCtrl._locInfo.VehicleNumber = "";
        SLocCtrl._locInfo.SalesEnquiryButton = 0;
        SLocCtrl._locInfo.HomeDeliveryButton = 0;
        SLocCtrl._locInfo.ReservationButton = 0;
        SLocCtrl._locInfo.SupportButton = 0;
        SLocCtrl._locInfo.CVButton = 0;



        if(!map){
            initialize1();
        }
        else{
            navigator.geolocation.getCurrentPosition(FindCurrentLocation, function () {
                handleNoGeolocation();
            });
        }
        //To set by default selected
         SLocCtrl._locInfo.ParkingStatus = 0;
         SLocCtrl._locInfo.OpenStatus = 1;
    };
    this.openEditSecLocForm = function (row,index) {

         //var stateId = SLocCtrl._locInfo.StateID;
      //  SLocCtrl._locInfo.StateID = stateId;

        SLocCtrl._locInfo = SLocCtrl.LocationsList[index];

        SLocCtrl.editSecLocEnb = true;
        //SLocCtrl._locInfo = row;
        SLocCtrl.IsShowForm = true;
        SLocCtrl._locInfo.TID = row.TID == null || row.TID == undefined ? row.LocationID : row.TID;

        SLocCtrl._locInfo.SalesEnquiryButton =  SLocCtrl._locInfo.SalesEnquiryButton == 1 ? true : false;
        SLocCtrl._locInfo.HomeDeliveryButton = SLocCtrl._locInfo.HomeDeliveryButton == 1 ? true : false;
        SLocCtrl._locInfo.ReservationButton = SLocCtrl._locInfo.ReservationButton == 1 ? true : false;
        SLocCtrl._locInfo.SupportButton = SLocCtrl._locInfo.SupportButton == 1 ? true : false;
        SLocCtrl._locInfo.CVButton = SLocCtrl._locInfo.CVButton == 1 ? true : false;
        try{
            if(!map){
                initialize1();
            }
            else{
                var pos = new google.maps.LatLng(SLocCtrl._locInfo.Latitude,SLocCtrl._locInfo.Longitude);
                PlaceCurrentLocationMarker(pos);
                map.setZoon(15);
                var bounds = new google.maps.LatLngBounds();
                bounds.extend(pos);
                map.fitBounds(bounds);
                
            }
        }
        catch(ex)
        {}

    };
    this.deleteSecLoc = function (row) {
        row.Token = $rootScope._userInfo.Token;
        row.TID = row.TID == null || row.TID == undefined ? row.LocationID : row.TID;
        $http({
            method: "POST",
            url: GURL + 'ewDeleteLocation',
            data: JSON.stringify({ TID: row.TID, Token: row.Token }),
            headers: { 'Content-Type': 'application/json' }
        }).success(function (data) {
            if (data.IsDeleted == true) {
                var index = SLocCtrl.LocationsList.indexOf(row);
                if (index !== -1) {
                    SLocCtrl.LocationsList.splice(index, 1);
                }
                Notification.success({ message: "Deleted...", delay: MsgDelay });
            } else {
                Notification.error({ message: "Sorry..! not delete", delay: MsgDelay });
            }
        });
    };

    function isValidate()
    {
        var notificationMessage = "";
        var errorList  = [];
        // Check validations
        if(SLocCtrl._locInfo.PIN)
        {
            if(SLocCtrl._locInfo.PIN != ""){
                if(SLocCtrl._locInfo.PIN<100)
                {
                     errorList.push('Pin should greater or equal 100');
                }
            }
        }
        if(!SLocCtrl._locInfo.AddressLine1)
        {
            errorList.push(' Address1 Required');
        }
        if(!SLocCtrl._locInfo.CountryID)
        {
            errorList.push('Country Required');
        }
        if(!SLocCtrl._locInfo.StateID)
        {
            errorList.push('State Required');
        }
        if(!SLocCtrl._locInfo.CityTitle)
        {
            errorList.push('City Required ');
        }
        if(!SLocCtrl._locInfo.PostalCode)
        {
            errorList.push('PostalCode Required ');
        }
        if(!SLocCtrl._locInfo.MobileNumber)
        {
            errorList.push('Mobile Number Required ');
        }

        if(SLocCtrl._locInfo.isWrongEmailPattern)
        {
            errorList.push('Not valid email!');
        }
        if(SLocCtrl._locInfo.isWrongEmailPatternSales)
        {
            errorList.push('Not valid email!');
        }
        if(SLocCtrl._locInfo.isWrongEmailPatternHome)
        {
            errorList.push('Not valid email!');
        }
        if(SLocCtrl._locInfo.isWrongEmailPatternReservation)
        {
            errorList.push('Not valid email!');
        }
        if(SLocCtrl._locInfo.isWrongEmailPatternSupport)
        {
            errorList.push('Not valid email!');
        }
        if(SLocCtrl._locInfo.isWrongEmailPatternCV)
        {
            errorList.push('Not valid email!');
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

    this.saveNewLoc = function (secLocForm) {

        if(isValidate())
        {
            SLocCtrl._locInfo.Icon = $rootScope.smallImage;
            SLocCtrl._locInfo.Token = $rootScope._userInfo.Token;
            // SLocCtrl._locInfo.TID = 0;
            SLocCtrl._locInfo.PIN = SLocCtrl._locInfo.PIN  == "" ? "" : SLocCtrl._locInfo.PIN;
            SLocCtrl._locInfo.Altitude = 0;

            SLocCtrl._locInfo.SalesEnquiryButton =  SLocCtrl._locInfo.SalesEnquiryButton == true ? 1 : 0;
            SLocCtrl._locInfo.HomeDeliveryButton = SLocCtrl._locInfo.HomeDeliveryButton == true ? 1 : 0;
            SLocCtrl._locInfo.ReservationButton = SLocCtrl._locInfo.ReservationButton == true ? 1 : 0;
            SLocCtrl._locInfo.SupportButton = SLocCtrl._locInfo.SupportButton == true ? 1 : 0;
            SLocCtrl._locInfo.CVButton = SLocCtrl._locInfo.CVButton == true ? 1 : 0;
            $http({
                method: "POST",
                url: GURL + 'ewmAddLocation',
                data: JSON.stringify(SLocCtrl._locInfo),
                headers: { 'Content-Type': 'application/json' }
            }).success(function (data) {

                    isCancelButton = false;

                    document.getElementById("Location").className = "form-control emptyBox";
                    document.getElementById("streeName").className = "form-control emptyBox";
                    document.getElementById("cities").className = "form-control emptyBox";
                    document.getElementById("postalCode").className = "form-control emptyBox";
                    document.getElementById("mobile_phone").className = "form-control emptyBox";

                    if (data != 'null') {

                    //    SLocCtrl.LocationsList.push(data[0]);
                    //    SLocCtrl.IsShowForm = false;

                        SLocCtrl._locInfo = angular.copy(SLocCtrl._locInfo= []);
                        $scope.SecLocForm.$setPristine();

                        getSecondaryLoc();
                        GetUserDetails();

                        window.location.href = '#/addloc';
                        SLocCtrl.IsShowForm = false;


                        Notification.success({ message: "Saved... ", delay: MsgDelay });
                    } else {
                        Notification.error({ message: "Sorry..! not saved", delay: MsgDelay });
                    }
                });
        }
    };
    this.updateNewLoc = function (secLocForm) {

        if(isValidate())
        {

        SLocCtrl._locInfo.Token = $rootScope._userInfo.Token;

        SLocCtrl._locInfo.SalesEnquiryButton =  SLocCtrl._locInfo.SalesEnquiryButton == true ? 1 : 0;
        SLocCtrl._locInfo.HomeDeliveryButton = SLocCtrl._locInfo.HomeDeliveryButton == true ? 1 : 0;
        SLocCtrl._locInfo.ReservationButton = SLocCtrl._locInfo.ReservationButton == true ? 1 : 0;
        SLocCtrl._locInfo.SupportButton = SLocCtrl._locInfo.SupportButton == true ? 1 : 0;
        SLocCtrl._locInfo.CVButton = SLocCtrl._locInfo.CVButton == true ? 1 : 0;

        $http({
            method: "POST",
            url: GURL + 'ewmAddLocation',
            data: JSON.stringify(SLocCtrl._locInfo),
            headers: { 'Content-Type': 'application/json' }
        }).success(function (data) {
            if (data != 'null') {
                getSecondaryLoc();
                SLocCtrl.IsShowForm = false;
                Notification.success({ message: "Saved...", delay: MsgDelay });

                document.getElementById("Location").className = "form-control emptyBox";
                document.getElementById("streeName").className = "form-control emptyBox";
                document.getElementById("block").className = "form-control emptyBox";
                document.getElementById("cities").className = "form-control emptyBox";
                document.getElementById("postalCode").className = "form-control emptyBox";
                document.getElementById("mobile_phone").className = "form-control emptyBox";

            } else {
                Notification.error({ message: "Sorry..! not saved", delay: MsgDelay });
            }
        });

        }
    };

    //get Locations Function
    function getSecondaryLoc() {
        $http({
            method: 'get',
            url: GURL + 'ewtGetSecondaryLoc?Token=' + $rootScope._userInfo.Token
        }).success(function (data) {
            if (data != 'null') {
                SLocCtrl.LocationsList = data;
                SLocCtrl._locInfo.StateID = data[0].StateID;

                SLocCtrl.getStates(data[0].CountryID);
                //SLocCtrl.getCities(data[0].StateID);
              }
        });
    }

    this.closeNewLoc = function (secLocForm) {
        if (!$scope.SecLocForm.$dirty) {
            if (!$rootScope._userInfo.IsAuthenticate) {
                secLocForm.$setPristine(true);
            }
            SLocCtrl.IsShowForm = false;
            return;
        }


        var confirm = $window.confirm('Are you sure you want to discard the changes without saving?');
        // Preventing them from navigating away
        if(!confirm){
            return;
        }
        secLocForm.$setPristine(true);
        SLocCtrl.IsShowForm = false;
    };

    this.closeLocationForm = function () {
        window.location.href = "#/";

    }

    //Maps
    function initialize1() {

        var initialLocation;
        var currentLoc = new google.maps.LatLng(12.295810, 76.639381);
        map = new google.maps.Map(document.getElementById('map-canvasl'), {
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            Zoom: 16
        });

        
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
        
        
        google.maps.event.addListenerOnce(map, 'idle', function () {

            $scope.isMapLoaded = true;
            
            /************************************ Added *************************************/
            
                            //// Create the search box and link it to the UI element.
            var input = (document.getElementById('txtSearch1'));

           // console.log(input);
            map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

            var searchBox = new google.maps.places.SearchBox((input));
            var ClocBtn = (document.getElementById('mapClocl'));

            map.controls[google.maps.ControlPosition.TOP_RIGHT].push(ClocBtn);

            if (JSON.stringify(SLocCtrl._locInfo) != '{}') {
                initialLocation = new google.maps.LatLng(SLocCtrl._locInfo.Latitude, SLocCtrl._locInfo.Longitude);
                PlaceCurrentLocationMarker(initialLocation);                
            } else {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(FindCurrentLocation);
                }
            }
            
            /*____________________________________________________________________________*/
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
//                    $rootScope.CLoc.CLat = place.geometry.location.lat();
//                    $rootScope.CLoc.CLong = place.geometry.location.lng();
//                    
                    SLocCtrl._locInfo.Latitude = place.geometry.location.lat();
                    SLocCtrl._locInfo.Longitude = place.geometry.location.lng();
                    
                    var loc = new google.maps.LatLng(SLocCtrl._locInfo.Latitude, SLocCtrl._locInfo.Longitude);
                    PlaceCurrentLocationMarker(loc);
                }
            });

            /*____________________________________________________________________________*/
            
            /*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
            // Bias the SearchBox results towards places that are within the bounds of the
            // current map's viewport.
            google.maps.event.addListener(map, 'bounds_changed', function () {
                var bounds = map.getBounds();
                searchBox.setBounds(bounds);
            });

            /*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
            
            /************************************ Added ends ********************************/
            //   console.log("IDLE ONCE");
            if(SLocCtrl.IsSearchPending){
                SLocCtrl.getSearch();
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
                //console.log(status);
            }
            if (status == google.maps.GeocoderStatus.OK) {
                getAddressForLocation(results[0].address_components);
            }
        });
    }
    function getAddressForLocation(results) {

       // SLocCtrl._locInfo.AddressLine1 = "";
       // SLocCtrl._locInfo.AddressLine2 = "";
        //SLocCtrl._locInfo.CountryID = "";
        //  SLocCtrl._locInfo.StateID = "";
        SLocCtrl._locInfo.CityTitle  = "";
        SLocCtrl._locInfo.PostalCode = "";

        angular.forEach(results, function (mapResultValue, index) {

            /*if (mapResultValue.types[0] == 'street_number') {
                SLocCtrl._locInfo.AddressLine1 = mapResultValue.long_name;
               // $scope.$apply();
            }
            if (mapResultValue.types[0] == 'route') {
                if (SLocCtrl._locInfo.AddressLine1 != "") {
                    SLocCtrl._locInfo.AddressLine1 += "," + mapResultValue.long_name;
                 //   $scope.$apply();
                } else {
                    SLocCtrl._locInfo.AddressLine1 = mapResultValue.long_name;
                  //  $scope.$apply();
                }
            }
            if (mapResultValue.types[0] == 'neighborhood') {
                if (SLocCtrl._locInfo.AddressLine1 != "") {
                    SLocCtrl._locInfo.AddressLine1 += "," + mapResultValue.long_name;
                  //  $scope.$apply();
                } else {
                    SLocCtrl._locInfo.AddressLine1 = mapResultValue.long_name;
                  //  $scope.$apply();
                }
            }
            if (mapResultValue.types[0] == 'sublocality_level_3') {
                if (SLocCtrl._locInfo.AddressLine2 != "") {
                    SLocCtrl._locInfo.AddressLine2 += "," + mapResultValue.long_name;
                  //  $scope.$apply();
                } else {
                    SLocCtrl._locInfo.AddressLine2 = mapResultValue.long_name;
                  //  $scope.$apply();
                }
            }
            if (mapResultValue.types[0] == 'sublocality_level_2') {
                if (SLocCtrl._locInfo.AddressLine2 != "") {
                    SLocCtrl._locInfo.AddressLine2 += "," + mapResultValue.long_name;
                   // $scope.$apply();
                } else {
                    SLocCtrl._locInfo.AddressLine2 = mapResultValue.long_name;
                  //  $scope.$apply();
                }
            }
            if (mapResultValue.types[0] == 'sublocality_level_1') {
                if (SLocCtrl._locInfo.AddressLine2 != "") {
                    SLocCtrl._locInfo.AddressLine2 += "," + mapResultValue.long_name;
                  //  $scope.$apply();
                } else {
                    SLocCtrl._locInfo.AddressLine2 = mapResultValue.long_name;
                  //  $scope.$apply();
                }
            }*/

            if (mapResultValue.types[0] == 'locality') {
                if (SLocCtrl._locInfo.CityTitle  != "") {
                    SLocCtrl._locInfo.CityTitle  += "," + mapResultValue.long_name;
                   // $scope.$apply();
                } else {
                    SLocCtrl._locInfo.CityTitle  = mapResultValue.long_name;
                   // $scope.$apply();
                }
            }

            if (mapResultValue.types[0] == 'administrative_area_level_1') {
                if (SLocCtrl._locInfo.State!= "") {
                    SLocCtrl._locInfo.State = mapResultValue.long_name;
                    //  $scope.$apply();
                } else {
                    SLocCtrl._locInfo.State = mapResultValue.long_name;
                    //$scope.$apply();
                }
            }

            if (mapResultValue.types[0] == 'postal_code') {
                if (SLocCtrl._locInfo.PostalCode != "") {
                    SLocCtrl._locInfo.PostalCode += "," + mapResultValue.long_name;

                   // $scope.$apply();
                } else {
                    SLocCtrl._locInfo.PostalCode = mapResultValue.long_name;
                   // $scope.$apply();
                }
            }
            if (mapResultValue.types[0] == 'country') {
                if (SLocCtrl._locInfo.Country != "") {
                    SLocCtrl._locInfo.Country = mapResultValue.long_name;

                    //$scope.$apply();
                } else {
                    SLocCtrl._locInfo.Country = mapResultValue.long_name;
                    //  $scope.$apply();
                }
            }

        });

       // if( SLocCtrl._locInfo.CountryID == null || SLocCtrl._locInfo.CountryID == "")
       // {
            var countryFileredString = $filter('filter')(SLocCtrl.countries, SLocCtrl._locInfo.Country)


            for (var key in countryFileredString)
            {
                if(SLocCtrl._locInfo.Country == countryFileredString[key].CountryName)
                {
                    SLocCtrl._locInfo.CountryID = countryFileredString[key].CountryID;
                    SLocCtrl._locInfo.ISDMobileNumber = countryFileredString[key].ISDCode;
                    SLocCtrl._locInfo.ISDPhoneNumber = countryFileredString[key].ISDCode;
                }
            }
       // }
        updateState(SLocCtrl._locInfo.CountryID);
        getISDCode(SLocCtrl._locInfo.CountryID);

    }

    $scope.stateFilter = function()
    {
        var statesString = $filter('filter')(SLocCtrl.states, SLocCtrl._locInfo.State)
        SLocCtrl._locInfo.StateID = statesString[0].StateID;
    }

    this.isMapInitialized = function () {
         if (SLocCtrl.mapInit == false) {
             if(!map){
                initialize1();
            }
            SLocCtrl.mapInit = true;
        }
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
                SLocCtrl._locInfo.Latitude = place.geometry.location.k;
                SLocCtrl._locInfo.Longitude = place.geometry.location.D;
                var loc = new google.maps.LatLng(SLocCtrl._locInfo.Latitude, SLocCtrl._locInfo.Longitude);
                PlaceCurrentLocationMarker(loc);
                getReverseGeocodingData(SLocCtrl._locInfo.Latitude, SLocCtrl._locInfo.Longitude);
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

            SLocCtrl._locInfo.Latitude = marker.getPosition().k;
            SLocCtrl._locInfo.Longitude = marker.getPosition().D;
            getReverseGeocodingData(marker.getPosition().k, marker.getPosition().D);
            //myinfowindow.setContent('<h6>You are here</h6>');
            //myinfowindow.open(map, marker);
        });
    }
    function FindCurrentLocation(position) {

        if(SLocCtrl._locInfo.TID == 0)
        {
            initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            PlaceCurrentLocationMarker(initialLocation);

            SLocCtrl._locInfo.Latitude = position.coords.latitude;
            SLocCtrl._locInfo.Longitude = position.coords.longitude;
            getReverseGeocodingData(SLocCtrl._locInfo.Latitude, SLocCtrl._locInfo.Longitude);
        }

    };
    this.getMyLocation = function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(FindCurrentLocation);
        }
    };


    $http({ method: 'get', url: GURL + 'ewmGetCountry?LangID=1' }).success(function (data) {
        if ($rootScope._userInfo.Token == false) {
            var _obj = { CountryID: 0, CountryName: '--Country--', ISDCode: '' };
            data.splice(0, 0, _obj);
            SLocCtrl._locInfo.CountryID = _obj.CountryID;
        }
        SLocCtrl.countries = data;
    });

    this.getStates = function (CountryID) {
        getISDCode(CountryID);
        updateState(CountryID);
    };

    function updateState(CountryID)
    {

        $http({ method: 'get', url: GURL + 'ewmGetState?LangID=1&CountryID=' + CountryID }).success(function (data) {

            if ($rootScope._userInfo.Token == false) {
                var _obj = { StateID: 0, StateName: '--State--' };
                data.splice(0, 0, _obj);
                SLocCtrl._locInfo.StateID = _obj.StateID;
            }
            SLocCtrl.states = data;
            $scope.stateFilter();
        });
    }

       //To set country ISD Code from Country Id
    function getISDCode(CountryID)
    {
        var countryData = $filter('filter')(SLocCtrl.countries, CountryID);

        for (var key in countryData)
        {
            if(CountryID == countryData[key].CountryID)
            {
                //SLocCtrl._locInfo.CountryID = countryData[key].CountryID;
                SLocCtrl._locInfo.ISDMobileNumber = countryData[key].ISDCode;
                SLocCtrl._locInfo.ISDPhoneNumber = countryData[key].ISDCode;
            }
        }
/*
        SLocCtrl._locInfo.ISDMobileNumber = countryData[0].ISDCode;
        SLocCtrl._locInfo.ISDPhoneNumber = countryData[0].ISDCode;*/
    }

    this.getCities = function (StateID) {

        $http({ method: 'get', url: GURL + 'ewmGetCity?LangID=1&StateID=' + StateID }).success(function (data) {
            var _obj = { CityD: 0, CityName: '--City--' };
            SLocCtrl.cities = data;
        });
    };


    /*SLocCtrl.parkingStatus = [{ id: 0, label: "Select Parking Status" }, { id: 1, label: "Parking Available" },
        { id: 2, label: "Public Parking" }, { id: 3, label: "Valet Parking" }, { id: 4, label: "No parking" }];*/

    SLocCtrl.parkingStatus = [{ id: 0, label: "Parking Status" },
        { id: 1, label: "Public Parking" }, { id: 2, label: "Valet Parking" }, { id: 3, label: "No parking" }];

    //imageUpload
    $scope.uploadImageForOtherLocation = function (image) {
        SLocCtrl._locInfo.PictureFileName = image[0].name;
            fileToDataURL(image[0]).then(function (dataURL) {

                SLocCtrl._locInfo.Picture = dataURL;

            if (!SLocCtrl._locInfo.IDTypeID == 2) {
                SLocCtrl._locInfo.Icon = "";
                SLocCtrl._locInfo.IconFileName = "";
            } else {
                SLocCtrl._locInfo.Icon = $rootScope.smallImage;
                SLocCtrl._locInfo.IconFileName = image[0].name;
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
        };

});
