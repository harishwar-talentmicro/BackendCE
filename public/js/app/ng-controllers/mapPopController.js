angular.module('ezeidApp').controller('mapPopController',[
    '$http',
    '$interval',
    '$rootScope',
    '$scope',
    '$q',
    'Notification',
    '$timeout',
    'MsgDelay',
    '$window',
    '$location',
    'GURL',
    'GoogleMaps',
    function($http,
             $interval,
             $rootScope,
             $scope,
             $q,
             Notification,
             $timeout,
             MsgDelay,
             $window,
             $location,
             GURL,
             GoogleMaps){


        var directtionLatLong;
        /* integrate google map */
        var googleMap = new GoogleMaps();

        $scope.findCurrentLocation = function(){
            googleMap.getCurrentLocation().then(function(){
                googleMap.placeCurrentLocationMarker(null,null,true);
            },function(){
                googleMap.placeCurrentLocationMarker(null,null,true);
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
                googleMap.listenOnMapControls(function(lat,lng){
                    googleMap.currentMarkerPosition.latitude = lat;
                    googleMap.currentMarkerPosition.longitude = lng;
                },function(lat,lng){
                    googleMap.currentMarkerPosition.latitude = lat;
                    googleMap.currentMarkerPosition.longitude = lng;
                });
                googleMap.getCurrentLocation().then(function(){
                    googleMap.resizeMap();
                    googleMap.placeCurrentLocationMarker(function(lat,lng){
                        googleMap.currentMarkerPosition.latitude = lat;
                        googleMap.currentMarkerPosition.longitude = lng;
                    },function(lat,lng){
                        googleMap.currentMarkerPosition.latitude = lat;
                        googleMap.currentMarkerPosition.longitude = lng;
                    });

                },function(){

                });

            });
        };

        // To initialize map
        initializeMap();

        //To show route
        $scope.plotRoute = function () {
            googleMap.clearAllMarkers();
            directtionLatLong = JSON.parse($window.localStorage.getItem("myLocation"));

            var userLoc = {
                startLat: googleMap.currentMarkerPosition.latitude,
                startLong : googleMap.currentMarkerPosition.longitude
            };
            $window.localStorage.setItem("userCurrentLoc", JSON.stringify(userLoc));

            googleMap.renderDirection('directionPannel',googleMap.currentMarkerPosition.latitude,googleMap.currentMarkerPosition.longitude,directtionLatLong.endLat,directtionLatLong.endLong);
            googleMap.placeCurrentLocationMarker();
        };

        //Show direction in view direction page
        $scope.showDirections = function () {
            //$location.path("/viewdirection");

         //   $window.localStorage.setItem("directionLocation",$scope.SearchInfo.Latitude+","+$scope.SearchInfo.Longitude );
            $window.location.href = "/viewdirection";
        };
}]);
