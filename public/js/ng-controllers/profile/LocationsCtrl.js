/**
 * ProfileEdit Controller
 * @desc Manages Functionality related to Edit Profile section
 * This inherits scope from Parent and uses value of the models from parent
 */
angular.module('ezeidApp').controller('LocationsCtrl',[
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
    '$compile',
    'GoogleMaps',
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
        $compile,
        GoogleMaps
        ) {

        $scope.locationsToggleIndex = [
            { editMode : false, viewMode : false}
        ];

        $scope.gMap = {
            map : null,
            markerList : [],
            searchBox : null,
            currentMarkerPosition:{
                latitude : -34.392,
                longitude: -37.921
            },
            mapOptions: {
                center: { lat: -34.397, lng: 150.644},
                zoom: 14
            },
            // Sets to true when map is loaded successfully
            isMapReady : false,
            /**
             * Array of functions which should be executed after map load
             */
            deferredTasks: [],
            /**
             * Task Status, if they are running true else false
             */
            deferTaskStatus : false,
            deferPromise : null,
            deferMaxCount : 5,
            deferCount : 0,
            /**
             * Render Map in the DOM
             * @param mapElementId: id of HTML element
             */
            renderMap : function(mapElementId){
                if(!$scope.gMap.map){
                    $scope.gMap.map = new google.maps.Map(document.getElementById(mapElementId),$scope.gMap.mapOptions);
                }
            },

            mapIdleListener : function(){
                var defer = $q.defer();
                if($scope.gMap.map){
                    google.maps.event.addListenerOnce($scope.gMap.map, 'idle', function () {
                        $scope.gMap.isMapReady = true;
                        defer.resolve(true);
                    });
                }
                return defer.promise;
            },

            /**
             * Pushes map controls over the map and activates them
             *
             */
            pushMapControls : function(){
                var deferTask = function(){
                    var elem = document.getElementById('pac-input');
                    var ClocBtn = (document.getElementById('pac-loc'));
                    $scope.gMap.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(ClocBtn)
                    $scope.gMap.map.controls[google.maps.ControlPosition.TOP_LEFT].push(elem);
                    $scope.gMap.searchBox = new google.maps.places.SearchBox((elem));
                };
                deferTask();
            },
            /**
             * Add listens to map controls added using above function
             */
            listenOnMapControls : function(){
                var deferTask = function(){
                    google.maps.event.addListener($scope.gMap.searchBox,'places_changed',function(){
                        var places = $scope.gMap.searchBox.getPlaces();
                        if (places.length == 0) {
                            return;
                        }

                        $scope.gMap.clearAllMarkers();

                        var bounds = new google.maps.LatLngBounds();
                        var place = places[0];
                        var image = {
                            url: place.icon,
                            size: new google.maps.Size(71, 71),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(17, 34),
                            scaledSize: new google.maps.Size(25, 25)
                        };
                        //$scope.triggerLocationChange(place.geometry.location.lat(),place.geometry.location.lng());
                        var marker = $scope.gMap.createMarker(place.geometry.location,place.name,'images/you_are_here.png',true,$scope.changeLocCoordinates);
                        $scope.gMap.markerList.push(marker);
                        $scope.gMap.placeMarker(marker);
                        bounds.extend(place.geometry.location);

                        $scope.gMap.map.fitBounds(bounds);
                        if($scope.gMap.map.getZoom() > 15){ $scope.gMap.map.setZoom(14);}
                    });
                    google.maps.event.addListener($scope.gMap.map, 'bounds_changed', function() {
                        var bounds = $scope.gMap.map.getBounds();
                        $scope.gMap.searchBox.setBounds(bounds);
                    });
                };
                if($scope.gMap.isMapReady){
                    deferTask();
                }
                else{
                    $scope.gMap.deferredTasks.push(deferTask);
                }
            },
            /**
             * Finds current location using Browser Geolocation API
             * Sets currentLocation coordinates in currentMarkerPosition
             */
            getCurrentLocation : function(){
                if(navigator.geolocation){
                    navigator.geolocation.getCurrentPosition(function(currentLocation){
                        $scope.gMap.currentMarkerPosition.latitude = currentLocation.coords.latitude;
                        $scope.gMap.currentMarkerPosition.longitude = currentLocation.coords.longitude;
                    },this.handleNoGeolocation)
                } else this.handleNoGeolocation();
            },
            /**
             * Handling Gelocation disabled or not present
             * Sets currentLocation coordinates in currentMarkerPosition
             */
            handleNoGeolocation: function(){
                var currentLoc = new google.maps.LatLng($scope.gMap.currentMarkerPosition.latitude,$scope.gMap.currentMarkerPosition.longitude);
                var deferTask = function(){
                    $scope.gMap.map.setCenter(currentLoc);
                };
                if($scope.gMap.isMapReady){
                    deferTask();
                }else{
                    $scope.gMap.deferredTasks(deferTask);
                }
            },
            /**
             * Places Current Location marker on map
             */
            placeCurrentLocationMarker : function(dragListernerCallback){
                if(typeof(dragListernerCallback) == "undefined"){
                    dragListernerCallback = null;
                }
                var deferTask = function(){
                    $scope.gMap.clearAllMarkers();
                    //$scope.triggerLocationChange($scope.gMap.currentMarkerPosition.latitude,$scope.gMap.currentMarkerPosition.longitude);
                    var currentLocation = new google.maps.LatLng($scope.gMap.currentMarkerPosition.latitude,$scope.gMap.currentMarkerPosition.longitude);
                    var marker = $scope.gMap.createMarker(currentLocation,'Your current location',null,true,dragListernerCallback);
                    $scope.gMap.placeMarker(marker);
                    $scope.gMap.map.setCenter(currentLocation);
                    $scope.gMap.map.setZoom(14);
                };
                if($scope.gMap.isMapReady){
                    deferTask();
                }
                else{
                    $scope.gMap.deferredTasks.push(deferTask);
                }
            },
            /**
             * Creates google maps position object using LatLng function
             * @param latitude
             * @param longitude
             * @returns pos: Google Maps position(location) object
             */
            createGMapPosition : function(latitude,longitude){
                var pos =  new google.maps.LatLng(latitude,longitude);
                return pos;
            },
            /**
             * Creates a marker on the map and add it to marker list simultaneously
             * @param position: Google LatLng position on which marker should be placed
             * @param title: Title to appear on tip of marker
             * @param icon: Marker Icon image
             * @param draggable: True or false to enable marker dragging on map
             * @param dragListener: Function callback to trigger when marker is dragged
             * @return marker: Returns a newly created marker
             */
            createMarker : function(position,title,icon,draggable,dragListener){
                var marker = new google.maps.Marker({
                    position: position,
                    title:title,
                    draggable: (draggable)? draggable: false,
                    icon: (icon)? icon :  'images/you_are_here.png'
                });
                if(dragListener){
                    google.maps.event.addListener(marker,'dragend',dragListener);
                }
                return marker;
            },

            /**
             * Places marker on the map created using createMarker Functions
             * @param marker
             */
            placeMarker: function(marker){
                var deferTask = function(){
                    google.maps.event.addListener(marker,'dragend',$scope.changeLocCoordinates);
                    marker.setMap($scope.gMap.map);
                    $scope.gMap.markerList.push(marker);
                    $scope.gMap.setMarkersInBounds();
                    $scope.gMap.map.setCenter(marker.getPosition());
                    $scope.gMap.map.setZoom(15);
                };
                if($scope.gMap.isMapReady){
                    deferTask();
                }
                else{

                    $scope.gMap.deferredTasks.push(deferTask);
                }
            },
            /**
             * Clear all markers from map
             */
            clearAllMarkers : function(){
                var deferTask = function(){
                    for (var i = 0, marker; marker = $scope.gMap.markerList[i]; i++) {
                        marker.setMap(null);
                    }
                    $scope.gMap.markerList = [];
                };
                if($scope.gMap.isMapReady){
                    deferTask();
                }
                else{
                    $scope.gMap.deferredTasks.push(deferTask);
                }
            },
            /**
             * Adding listener for map resizing event
             */
            resizeMap : function(){
                var deferTask = function(){
                    google.maps.event.trigger($scope.gMap.map, "resize");
                    $scope.gMap.map.setCenter($scope.gMap.markerList[0].getPosition());
                };
                if($scope.gMap.isMapReady){
                    deferTask();
                }
                else{
                    $scope.gMap.deferredTasks.push(deferTask);
                }
            },

            /**
             * Set markers inside the map bounds
             */
            setMarkersInBounds : function(){
                var bounds = new google.maps.LatLngBounds();
                for(var i = 0; i < $scope.gMap.markerList.length; i++){
                    bounds.extend($scope.gMap.markerList[i].position);
                }
                $scope.gMap.map.fitBounds(bounds);
            },

            /**
             * Get Reverse Geolocation Data
             * @param lat
             * @param lng
             */

            getReverseGeolocation : function(lat,lng,callback){
                var geocoder = new google.maps.Geocoder();
                if(!geocoder){
                    console.log('Geocoder API not present (JS missing)');
                    return;
                }
                var geoCoderDetails = [];
                var latlng = new google.maps.LatLng(lat, lng);
                geocoder.geocode({'latLng': latlng}, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
//                    console.log(JSON.stringify(results));
                        if (results[1]) {
                            $scope.modalBox.geoCoderDetails =  results;
                        } else {

                        }
                    } else {
                    }
                });
            },

            /**
             * Execute the tasks (on regular interval) which doesn't completed instantaneously because map load doesn't finished
             * Delaying the tasks and then executing them
             * Max Execution is only 5 times for performance
             */
            executeDeferred : function(){
                $interval(function(){
                    if(!$scope.gMap.deferTaskStatus){
                        if($scope.gMap.deferCount < $scope.gMap.deferMaxCount)
                        {
                            $interval.cancel($scope.gMap.deferPromise);
                            $scope.gMap.deferPromise = undefined;
                        }
                        var remainingTasks = [];
                        $scope.gMap.deferTaskStatus = true;
                        $scope.gMap.deferredTasks.forEach(function(elem,index){
                            try{
                                $scope.gMap.deferredTasks[index]();
                            }
                            catch(ex){
                                remainingTasks.push($scope.gMap.deferTaskStatus[index]);
                            }
                        });
                        $scope.gMap.deferredTasks = [];
                        $scope.gMap.deferTaskStatus = false;
                        $scope.gMap.deferCount++;
                    }
                },1000);
            }
        };

//        var mapElem = '<div class="col-lg-6 col-md-6">'+
//            '<img id="pac-loc" class="link-btn" ng-click="findCurrentLocation()" src="images/myloc.png" data-toggle="tooltip" data-placement="bottom" title="Current Location" />'+
//            '<input id="pac-input" class="form-control pull-left" type="text" placeholder="Search Location" autocomplete="on">'+
//            '</div>'+
//            '<div id="map-canvas" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 bottom-clearfix">'+
//            '</div>'
//        $('.locations-map-container').html(mapElem);
//        $compile($('.locations-map-container'))($scope);

//        $interval(function(){
//            console.log($('#map-canvas').is(':visible'));
//            if($('#map-canvas').is(':visible')){
//                $scope.xMap = new GoogleMaps();
//                $scope.xMap.setSettings({
//                    mapElementId : 'map-canvas',
//                    searchElementId : 'pac-input',
//                    currentLocationElementId : 'pac-loc'
//                });
//
//                console.log($scope.xMap);
//                $scope.xMap.renderMap();
//                $scope.xMap.mapIdleListener().then(function(){
//                    $scope.xMap.pushMapControls();
//                    $scope.xMap.listenOnMapControls();
//                });
//                console.log($scope.xMap);
//            }
//            else{
//
//            }
//
//        },5000,1);

        $scope.$watch('locationsToggleIndex[0].viewMode',function(newVal,oldVal){
            if(newVal){
                console.log('ex');
                if(!$scope.xMap){
                    console.log('ex1');
                    $scope.xMap = new GoogleMaps();
                    $scope.xMap.createMap("map-primary-location",$scope);
                    console.log($scope.xMap);
                    $scope.xMap.renderMap();
                    $scope.xMap.mapIdleListener().then(function(){
                        $scope.xMap.pushMapControls();
                        $scope.xMap.listenOnMapControls();
                        $scope.xMap.resizeMap();
                        $scope.xMap.getCurrentLocation().then(function(){
                            $scope.xMap.placeCurrentLocationMarker();
                        });
                    });
                    console.log($scope.xMap);
                }
            }
        });


        /**
         * Finds and displays current location of user on map
         */
        $scope.findCurrentLocation = function(){
            $scope.xMap.getCurrentLocation();
            $scope.xMap.placeCurrentLocationMarker();
        };

    }]);
