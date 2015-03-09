angular.module('ezeidApp').controller('salesenquiryController', function($http, $rootScope, $scope, Notification, $filter, $q, $timeout){

    var msglist = this;
    msglist._info={};
    msglist.msgs = [];
    var itemList  = [];
    var MsgDelay = 2000;
    msglist._info.StatusFilter = 1;

    var map;
    var mapOptions;
    var marker;
    var markers = [];
    var showCurrentLocation = true;
    //$scope.showAddNoteBox = true;
    msglist._info.StatusFilter = 1;

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
            window.location.href = "#/";
        }
    }

    $scope.Tab1Title = "Sales Enquiry";
    $scope.Tab2Title = "Sales Enquiry2";
    $scope.Tab3Title = "Sales Enquiry3";
    $scope.Tab4Title = "Sales Enquiry4";

    //To get Status info
    $http({ method: 'get', url: GURL + 'ewtGetStatusType?Token='+ $rootScope._userInfo.Token + '&MasterID=251&FunctionType=0'}).success(function (data) {

         if (data != 'null') {
            // console.log(data);
            msglist.Status = data;
             msglist._info.StatusFilter = data[0].TID;
        }
    });

    //To get Next Action info
    $http({ method: 'get', url: GURL + 'ewtGetActionType?Token='+ $rootScope._userInfo.Token + '&MasterID=251&FunctionType=0'}).success(function (data) {
       // console.log(data);
        if (data != 'null') {

            msglist.NextAction = data;
          }
    });

    $('#datetimepicker1').datetimepicker({
        format: "d-M-Y  h:m A",
        hours12: false,
//        mask: true,
        timepicker:false
    });
    $('#datetimepicker1').siblings('.input-group-addon').on('click',function(){
        $('#datetimepicker1').trigger('focus');
    });

    $scope.quantity = 0;
    $scope.rate = 0;
   /* $scope.amount = $scope.quantity * $scope.rate;*/


    /*$scope.quantity0 = 0;
    $scope.quantity1 = 1;*/

    $scope.toggleModal = function(){
        getItemList();
        $scope.showModal = !$scope.showModal;
    };

    $scope.openRequesterPopup = function(){
        $scope.showModal2 = !$scope.showModal2;
        $timeout(function(){initialize(); $scope.val = true}, 1000);
    };

    $scope.toggleTitleModal = function(){
        $scope.showModalTitle = !$scope.showModalTitle;
    };

    //$scope.longString = "Item Title";

    //open SalesEnquiryForm
    msglist.openAddNewSalesEnquiryForm = function () {
        $('#addNewSalesEnquiryForm_popup').slideDown();
    };

    //close SalesEnquiryForm
    msglist.closeAddNewSalesEnquiryForm = function () {
        $('#addNewSalesEnquiryForm_popup').slideUp();
    };

    //To get all Items
    function getItemList() {
       $http({
            method: 'get',
            url: GURL + 'ewtItemList?Token=' + $rootScope._userInfo.Token+ '&MasterID=251&FunctionType=0'
        }).success(function (data) {
            //   console.log(data);
               console.log(data);
               if (data != 'null') {


                  /* for (var i = 0; i < data.length; i++) {
                       data[i].itemCheckBoxSelected = false;
                       data[i].itemQty = 0;
                       msglist.msgs.push(data[i]);
                   }*/
                   msglist.itemList = data;
                   $scope.showAddNoteBox = false;
               }
               else
               {
                   console.log("Sai2");
                   //show Add Note text area
                  //$scope.showAddNoteBox = true;
                   $scope.showAddNoteBox = false;
               }

            });
    }

    //add remove item to array on change of check box
    $scope.addToItemList = function(_checked, tID, quantity, rate, amount){

         itemList[tID] = {
            quantity : quantity,
            rate : rate,
            amount : amount
        };

        console.log(itemList);
     };

    //deacrease Top quantitiy
    $scope.decriesTopQuantity = function(){

        if($scope.quantity != 0)
        {
            $scope.quantity = $scope.quantity - 1;
        }
    };

    //increase Top quantitiy
    $scope.increaseTopQuantity = function(){

        $scope.quantity = $scope.quantity + 1;
            };



    //deacrease quantitiy
    $scope.decriesQuantity = function(qty, index){

        if(qty != 0)
        {
            qty = qty - 1;
            msglist.msgs[index].itemQty = qty;
        }
    };

    //increase quantitiy
    $scope.increaseQuantity = function(qty, index){
        qty = qty + 1;
        msglist.msgs[index].itemQty = qty;
    };

    //Add Sales Enquiry
    msglist.addSalesEnquiry = function (event) {


        console.log(msglist._info);
       /* var elem = $(event.currentTarget);
        console.log(elem.data('itemName'));
        console.log(elem.data('itemQty'));
        console.log(elem.data('itemRate'));*/

       /* if ($rootScope._userInfo.IsAuthenticate == true) {
            var currentTaskDate = moment().format('DD-MMM-YYYY hh:mm A');
            $http({ method: 'post', url: GURL + 'ewtSaveTranscationItems', data: { Token: $rootScope._userInfo.Token, MessageID: 251, ItemID: 1, Qty: 2, Rate: 5, Amount :10,Duration: 2 } }).success(function (data) {
             //   console.log(data);
                *//*if (data.IsSuccessfull) {
                    $('#SalesEnquiryRequest_popup').slideUp();
                    SearchSec.salesMessage = "";
                    Notification.success({ message: 'Message send success', delay: MsgDelay });
                }
                else {
                    Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                }*//*
            });
        }
        else {
            //Redirect to Login page
            $('#SignIn_popup').slideDown();
        }*/
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
           /* initialLocation = new google.maps.LatLng(profile._info.Latitude, profile._info.Longitude);*/
            initialLocation = new google.maps.LatLng(12.295810, 76.639381);
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
           /* if(profile.IsSearchPending){
                profile.getSearch();
            }*/
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

        });
    }

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
                /*profile._info.Latitude = place.geometry.location.k;
                profile._info.Longitude = place.geometry.location.D;*/
                var loc = new google.maps.LatLng(place.geometry.location.k, place.geometry.location.D);
                PlaceCurrentLocationMarker(loc);
                getReverseGeocodingData(place.geometry.location.k, place.geometry.location.D);
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
           /* profile._info.Latitude = marker.getPosition().k;
            profile._info.Longitude = marker.getPosition().D;*/
            getReverseGeocodingData(marker.getPosition().k, marker.getPosition().D);
            // myinfowindow.setContent('<h6>You are here</h6>');
            //   myinfowindow.open(map, marker);
        });
    }
    function FindCurrentLocation(position) {
        if (showCurrentLocation) {
            initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            PlaceCurrentLocationMarker(initialLocation);
            /*profile._info.Latitude = position.coords.latitude;
            profile._info.Longitude = position.coords.longitude;*/
           // getReverseGeocodingData(profile._info.Latitude, profile._info.Longitude);
        }
    };
    this.getMyLocation = function () {
        if (navigator.geolocation) {
            showCurrentLocation = true;
            navigator.geolocation.getCurrentPosition(FindCurrentLocation);
        }
    };
    $scope.modalTitle = "Sales Item";
});