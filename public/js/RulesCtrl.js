/**
 * Created by admin on 6/3/15.
 *
 * @todo Incomplete
 */
angular.module('ezeidApp').controller('RulesCtrl',['$scope','$interval','$http','Notification','$rootScope','$filter','$timeout','MsgDelay','GURL',function($scope,$interval,$http,Notification,$rootScope,$filter,$timeout,MsgDelay,GURL){
    //Initially First Tab is selected
    $scope.selectedTab = 1;

    /***
     * Master User Details
     * @type {null}
     */
    $scope.masterUser = null;

    /**
     * Country List
     * @type {Array}
     */
    $scope.countryList = [
    /**
     * Eg.
     * { title : 'India', value : 'IN'}
     */
    ];

    //Open Modal box for user
    $scope.isMapInitialized = false;
    $scope.showModal = false;
    $scope.openModalBox = function(event){
        /**
         * Called only once if the map is not initialized (opening modal box for first time)
         */
        if(!$scope.isMapInitialized){
            console.log('showmodal == false');
            /**
             * Map Related initializations
             * To initialize map on any location just call these three functions
             */
            $scope.gMap.renderMap('map-canvas');
            $scope.gMap.executeDeferred();
            $scope.gMap.mapIdleListener();
            $scope.gMap.pushMapControls();
            $scope.gMap.listenOnMapControls();
            $scope.gMap.getCurrentLocation();

            /**
             * @todo If user is editing the rule then don't find currentLocation
             * else place the marker with that particular lat lng which are in rule ( do not this for admin area and ezeid linked type)
             */
            $timeout(function(){
                $scope.gMap.placeCurrentLocationMarker($scope.changeLocCoordinates);
            },3000);

            $scope.isMapInitialized = true;
        }

        //@todo Add facility to detect new addition or rule editing

        $scope.showModal = !$scope.showModal;
        console.log($scope.showModal);
    };



    // Rule Function types (functionTypes) available to the system
    $scope.ruleFunctionTypes = [
        'Sales',
        'Reservation',
        'Home Delivery',
        'Service',
        'Resume'
    ];

    // Rule Types (Area names based on match, proximity based, EZEID's linked)
    $scope.ruleTypes = [
        'Area name based match',
        'Proximity based match',
        'EZEID\'s linked'
    ];


    $scope.matchAdminLevels = [
//        'Do not search Admin Areas and take decision on CountryIDs itself',
//        'Search & match based on Administrate_area_level_1 of google maps and the area name should be one among the AdminLevelNames that are comma separated',
//        'Search & match based on Administrate_area_level_2 of google maps and the area name should be one among the AdminLevelNames that are comma separated',
//        'Search & match based on Administrate_area_level_3 of google maps and the area name should be one among the MappedNames that are comma separated'
        'Match based on Admin Level 0 (Country)',
        'Match based on Admin Level 1 (State)',
        'Match based on Admin Level 2 (City)',
        'Match based on Admin Level 3 (Area)'
    ];

    /**
     * Modal Box models and properties
     * @type {{title: string, rule: {ruleId: number, folderTitle: string, ruleFunction: number, ruleType: Array, country: string, matchAdminLevel: number, mappedNames: Array, latitude: number, longitude: number, proximity: number, status: number}}}
     */
    $scope.modalBox = {
        title : 'Add new Rule',
        rule : {
            ruleId : 0,         // TID of particular rule
            folderTitle : "",
            ruleFunction : 0,   // By default, selected rule will be for sales
            ruleType : 0,       // By default Rule Type : Area Names based on match
            country : "",
            matchAdminLevel : 0,
            mappedNames : [],
            coordinates : {
              latitude : 50.00,
              longitude : 25.00
            },
            proximity : 0,
            status : 1          //By default, status is Active (1 is Inactive, 2 is Active)
        },
        adminArea : "",          // Admin Area kept for temporary use (to display and let user choose to add it to list of mappedNames)
        geoCoderDetails : ""    // GeoCoder API result for that particular location selected in map
    };

    /**
     * Container for all rules
     * @type {Array}
     */
    $scope.rules = [];


    /**
     * Getting Master User Details
     * Then calling loadRules Function to load all statuses
     */
    $scope.getMasterUserDetails = function(){
        $http({
            url : GURL + 'ewtGetUserDetails',
            method : "GET",
            params :{
                Token : $rootScope._userInfo.Token
            }
        }).success(function(resp){
                if(resp.length>0){
                    $scope.masterUser = resp[0];
                }
            }).error(function(err){
                Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
            });

    };

    $scope.getMasterUserDetails();
    //@todo add code for rule addition and updation
    //@todo add code for viewing rule
    //@todo add code for map load

    /**
     * Map API wrapped up to make usage simple and automatic error handling
     * @type {{map: null, markerList: Array, searchBox: null, currentMarkerPosition: {latitude: number, longitude: number}, mapOptions: {center: {lat: number, lng: number}, zoom: number}, isMapReady: boolean, deferredTasks: Array, deferTaskStatus: boolean, deferPromise: null, deferMaxCount: number, deferCount: number, renderMap: Function, mapIdleListener: Function, pushMapControls: Function, listenOnMapControls: Function, getCurrentLocation: Function, handleNoGeolocation: Function, placeCurrentLocationMarker: Function, createGMapPosition: Function, createMarker: Function, placeMarker: Function, clearAllMarkers: Function, resizeMap: Function, setMarkersInBounds: Function, executeDeferred: Function}}
     */

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
            $scope.gMap.map = new google.maps.Map(document.getElementById(mapElementId),$scope.gMap.mapOptions);
        },

        mapIdleListener : function(){
            if($scope.gMap.map){
                google.maps.event.addListenerOnce($scope.gMap.map, 'idle', function () {
                    $scope.gMap.isMapReady = true;
                });
            }
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
            if($scope.gMap.isMapReady){
                deferTask();
            }
            else{
                $scope.gMap.deferredTasks.push(deferTask);
            }
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
                    $scope.triggerLocationChange(place.geometry.location.lat(),place.geometry.location.lng());
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
                $scope.triggerLocationChange($scope.gMap.currentMarkerPosition.latitude,$scope.gMap.currentMarkerPosition.longitude);
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

    /**
     * Finds and displays current location of user on map
     */
    $scope.findCurrentLocation = function(){
        $scope.gMap.getCurrentLocation();
        $scope.gMap.placeCurrentLocationMarker($scope.changeLocCoordinates);
    };

    /**
     * This is to be passed as callback while placing a marker
     * This function will assign current marker position to
     * This function will do reverse geolocation and
     * based on the administrative area level, it will bring the country, state, city or area
     */
    $scope.changeLocCoordinates = function(event){
        $scope.triggerLocationChange(this.position.lat(),this.position.lng());
    };

    $scope.IsReverseGeolocationOn = false
    /**
     * Triggers the function when latitude and longitude gets changed on map
     * @param lat
     * @param lng
     */
    $scope.triggerLocationChange = function(lat,lng){
        if($scope.IsReverseGeolocationOn){
            $scope.modalBox.rule.coordinates.latitude = lat;
            $scope.modalBox.rule.coordinates.longitude = lng;
            console.log('I am triggerd');
            $scope.gMap.getReverseGeolocation(lat,lng);
            console.log('Geocoder Details from service');
            console.log($scope.modalBox.geoCoderDetails);
        }
        else{
            $scope.IsReverseGeolocationOn = true;
        }

    };

    $scope.saveRule = function(){
        var ruleData = {
            Token : null ,
            TID : null ,
            MasterID : null ,
            FolderTitle : null ,
            RuleFunction : null ,
            RuleType : null ,
            CountryID : null ,
            MatchAdminLevel : null ,
            MappedNames : null ,
            Latitude : null ,
            Longitude : null ,
            Proximity : null ,
            DefaultFolder : null ,
            FolderStatus : null ,
            SeqNoFrefix : null
        };

        $http({
            url : 'ewmSaveFolderRules',
            method : "POST",
            data : ruleData
        }).success(function(resp){
            console.log(resp);
        }).error(function(err){

        });
    };

}]);

/**
 * Filters administrative area level based on Option chosen
 * (Admin Area Level 0 : Country) => 0
 * (Admin Area Level 1 : State) => 1
 * (Admin Area Level 2 : City) => 2
 * (Admin Area Level 3 : Area) => 3
 */
angular.module('ezeidApp').filter('ruleAdminAreaFilter',function(){

    var adminAreaLevel = [
        "country",      //0
        "administrative_area_level_1", //1
        "administrative_area_level_2", //2
        "sublocality_level_1"          //3
    ];

    return function(geoCoderAPIResult,adminAreaLevel){
        var result = "";
        if(geoCoderAPIResult.length < 1){
            return result;
        }
//        geoCoderAPIResult[1].address_components.forEach(function(item,index){
//           if(item.types.indexOf(adminAreaLevel))
//           {
//               result = item.short_name;
//           }
//        });
        var items = geoCoderAPIResult[1].address_components;
        for(var i = 0; i < items; i++){
            if(items[i].types.indexOf(adminAreaLevel) !== -1){
                console.log(i);
                result = items[i].short_name;
                break;
            }
        }

        return result;

    };
});