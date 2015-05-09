angular.module('ezeidApp').controller('mapPopController',['$http', '$rootScope', '$scope', '$q', 'Notification',  '$timeout', '$window', 'GURL', function($http, $rootScope, $scope, $q, Notification, $timeout, $window, GURL){

    console.log("sai777");
    var map;
    var marker;
    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();
    var service;

    initialize();

    function initialize() {
        console.log("sai888");
        directionsDisplay = new google.maps.DirectionsRenderer();
        var myLatlng = new google.maps.LatLng(-34.397, 150.644);
        var myOptions = {
            zoom: 8,
            center: myLatlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        map = new google.maps.Map(document.getElementById("map-canvasH1"), myOptions);
    }

    /*function initialize () {
        var initialLocation;
        directionsDisplay = new google.maps.DirectionsRenderer();
        var currentLoc = new google.maps.LatLng(12.295810, 76.639381);
        var mapOptions = {
            zoom: 15,
            center : new google.maps.LatLng(12.295810, 76.639381)
        };
        *//* center: new google.maps.LatLng(41.850033, -87.6500523)*//*
         map = new google.maps.Map(document.getElementById('map-canvasH1'));

        directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById('directions-panel'));

        $(window).resize(function() {
            google.maps.event.trigger(map, "resize");
        });

        if (navigator.geolocation) {
            console.log("sai50");
            navigator.geolocation.getCurrentPosition(FindCurrentLocation, function () {
                console.log("sai51");
                handleNoGeolocation();
            });
        }
        // Browser doesn't support Geolocation
        else {
            handleNoGeolocation();
        }

        function handleNoGeolocation() {
            console.log("sai52");
            initialLocation = currentLoc;
            map.setCenter(initialLocation);
        }

        function FindCurrentLocation(position) {
            console.log(position);
            initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            $rootScope.CLoc = {
                CLat: position.coords.latitude,
                CLong: position.coords.longitude
            };

        }
        *//*------------- Below code is for Drow Direction ------------*//*

        directtionLatLong = JSON.parse($window.localStorage.getItem("directionLocation"));

        var request = {
             origin: directtionLatLong.startLat+","+directtionLatLong.startLong,
             destination: directtionLatLong.endLat+","+directtionLatLong.endLong,
             travelMode: google.maps.TravelMode.DRIVING
         };

         directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);


            }
        });
        *//*-------------------- Direction Over --------------------------------*//*
    }*/
}]);
