angular.module('ezeidApp').controller('ShowMapViewCtrl',[
    '$http',
    '$rootScope',
    '$scope',
    '$q',
    'Notification',
    '$timeout',
    '$window',
    '$location',
    '$routeParams',
    'GURL',
    'GoogleMaps',
    function(
        $http,
        $rootScope,
        $scope,
        $q,
        Notification,
        $timeout,
        $window,
        $location,
        $routeParams,
        GURL,
        GoogleMaps
        )
    {
        var viewDirection = this;
        var MsgDelay = 2000;
        $scope.showMapWithMarker = true;
        var loadMapFirstTime = true;

        var directionsDisplay;
        var directtionLatLong;

        /* integrate google map */
        var googleMap = new GoogleMaps();
        $scope.$emit('$preLoaderStart');

        function getStaticMap()
        {
            document.getElementById('my-image-id').src = "https://maps.googleapis.com/maps/api/staticmap?zoom=12&size=800x500&markers=color:blue%7Clabel:C%7C"+$scope.lat+","+$scope.lng+"&markers=color:red%7Clabel:A%7C"+$routeParams.endLat+","+$routeParams.endLong;
            $scope.$emit('$preLoaderStop');
        }


        googleMap.getCurrentLocation().then(function(){
            $scope.lat = googleMap.currentMarkerPosition.latitude;
            $scope.lng = googleMap.currentMarkerPosition.longitude;

            getStaticMap();
        });

        $scope.userLat = $routeParams.endLat;

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
                        googleMap.setMarkersInBounds();
                    },false);

                },function(){
                });
            });

            var pos = null;
            var title = '';
            var containerElement = '';

            pos = googleMap.createGMapPosition(
                $routeParams.endLat,
                $routeParams.endLong
            );

            title = 'Primary Location';
            containerElement = 'map-location-0';

           // $scope.userLat = $routeParams.endLat;

            if($routeParams.endLat)
            {
                var markerImage = $routeParams.IDTypeID == 1 ? 'images/Individual-Icon_48.png' : 'images/business-icon_48.png';
                var marker = googleMap.createMarker(pos,title,markerImage,false,null);
                googleMap.placeMarker(marker);
            }

            $timeout(function(){
                googleMap.setMarkersInBounds();
                $rootScope.$broadcast('$preLoaderStop');
            },1000);
        };

        $scope.plotRoute = function()
        {
            $scope.showMapWithMarker = false;
            $scope.$emit('$preLoaderStart');

            if(loadMapFirstTime)
            {
                loadMapFirstTime = false;
                initializeMap();
            }
            else
            {
                $scope.$emit('$preLoaderStop');
            }

            $timeout(function(){
                googleMap.clearAllMarkers();

                googleMap.renderDirection('directionPannel',googleMap.currentMarkerPosition.latitude,googleMap.currentMarkerPosition.longitude,$routeParams.endLat,$routeParams.endLong);
                googleMap.placeCurrentLocationMarker();
                googleMap.setMarkersInBounds();

            },2000);

        };

        //Show direction in view direction page
        $scope.showDirections = function () {
            var params = '?endLat='+$routeParams.endLat+'&endLong='+$routeParams.endLong+'&startLat='+googleMap.currentMarkerPosition.latitude+'&startLong='+googleMap.currentMarkerPosition.longitude+'&showbasicmap=1';
            $location.url('/viewdirection'+params);
        };



}]);
