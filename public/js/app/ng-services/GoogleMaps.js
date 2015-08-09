/**
 * Google Maps Service
 *
 * @author Indrajeet
 *
 * @desc Service can be used to create multiple maps in single page applications
 * without having a problem of map not loading correctly after navigation to different routes in SPA
 *
 * @usage
 * var googleMap = new GoogleMap();
 * googleMap.setSettings({
 *      mapElementClass : "col-lg-12 col-md-12 col-sm-12 col-xs-12 bottom-clearfix",
 *      searchElementClass : "form-control pull-left pac-input",
 *      currentLocationElementClass : "link-btn pac-loc",
 *      controlsContainerClass : "col-lg-6 col-md-6'"
 * });
 * googleMap.createMap("map-container",$scope,"findCurrentLocation()");
 *
 * googleMap.renderMap();
 *
 * googleMap.mapIdleListener().then(function(){
 *      googleMap.pushMapControls();
 *      googleMap.listenOnMapControls();
 *      googleMap.getCurrentLocation();
 *      googleMap.placeCurrentLocationMarker();
 *      googleMap.resizeMap();
 * });
 *
 *
 *
 *
 */
angular.module('ezeidApp').factory('GoogleMaps',['$q','$timeout','$compile',function($q,$timeout,$compile){

    /**
     * Preparing HTML for Map
     * @param cssSettings
     * @param locationFinderFunction
     * @returns {string}
     */
    function getMapHtml(cssSettings,locationFinderFunction){
        var mapHtml = '<div class="'+cssSettings.controlsContainerClass+'">'+
            '<img id="'+cssSettings.currentLocationElementId+'"' +
            ' class="'+cssSettings.currentLocationElementClass+'" ng-click="'+locationFinderFunction+'" ' +
            'src="images/myloc.png" data-toggle="tooltip" data-placement="bottom" title="Current Location" />'+
            '<input id="'+cssSettings.searchElementId+'" class="'+cssSettings.searchElementClass+'" ' +
            'type="text" placeholder="Search Location" autocomplete="on">'+
            '</div>'+
            '<div id="'+cssSettings.mapElementId+'" class="'+cssSettings.mapElementClass+'">'+
            '</div>';
        return mapHtml;
    }

    /**
     * Google Map Wrapper Object
     * @constructor
     */
    function GoogleMap(){

    }

    /**
     * Property tells that map is ready or not
     * @type {boolean}
     */
    GoogleMap.prototype.isReady = false;

    /**
     * Initial Settings for Classes and Id's of map wrapper instance
     * @type {{mapElementClass: string, mapElementId: string, searchElementClass: string, searchElementId: string, currentLocationElementClass: string, currentLocationElementId: string, controlsContainerClass: string}}
     */
    GoogleMap.prototype.settings = {
        mapElementClass : 'col-lg-12 col-md-12 col-sm-12 col-xs-12 bottom-clearfix map-canvas',
        mapElementId : '',
        searchElementClass : 'form-control pull-left pac-input',
        searchElementId : '',
        currentLocationElementClass : 'link-btn pac-loc',
        currentLocationElementId : '',
        controlsContainerClass : 'col-lg-6 col-md-6'

    };

    /**
     * Google Map Instance
     * @type {string}
     */
    GoogleMap.prototype.map = '';
    /**
     * List of Markers on map
     * @type {Array}
     */
    GoogleMap.prototype.markerList = [];

    /**
     * Places Search box reference from google map
     * @type {null}
     */
    GoogleMap.prototype.searchBox = null;

    /**
     * Creates map HTML and bind it with scope
     * @param mapContainerId
     * @param $scope
     * @param locationFinderFunction
     */
    GoogleMap.prototype.createMap = function(mapContainerId,$scope,locationFinderFunction){
        var eid = Date.now() + '-' + (Math.floor(Math.random() * (10 - 1)) + 1);
        this.settings.mapElementId = 'ezeid-gmap-map-'+ eid;
        this.settings.searchElementId = 'ezeid-gmap-search-'+eid;
        this.settings.currentLocationElementId = 'ezeid-gmap-cloc-'+eid;

        var mapHtml = getMapHtml(this.settings,locationFinderFunction);

        if($('#'+mapContainerId).length > 0){
            $('#'+mapContainerId).append(mapHtml);
            if($scope){
                $compile($('#'+mapContainerId).contents())($scope);
            }
            else{
                console.error('GoogleMaps.js : Argument $scope is undefined ');
            }
        }
        else{
            try{
                console.error('GoogleMaps.js : mapContainerId not found ');
            }
            catch(ex){

            }
        }
    };

    /**
     * Current Marker Position of Map
     * @type {{latitude: number, longitude: number}}
     */
    GoogleMap.prototype.currentMarkerPosition = {
        lat : 12.933616,
        lng : 77.573546
    };

    /**
     * Google map Options
     * @type {{center: {lat: number, lng: number}, zoom: number}}
     */
    GoogleMap.prototype.mapOptions = {
        center : {
            lat : 12.933616,
            lng : 77.573546
        },
        zoom : 14
    };

    GoogleMap.prototype.currentLocationMarker = null;
    GoogleMap.prototype.currentMarkerDragCallBack = null;
    GoogleMap.prototype.currentMarkerPlaceCallback = null;

    /**
     * Setting Initial settings
     * @desc Allows to change css classes for map canvas, search box, current location button
     * @param obj
     */
    GoogleMap.prototype.setSettings = function(obj){
        if(obj.hasOwnProperty('mapElementClass')){
            this.settings.mapElementClass = obj.mapElementClass;
        }

        if(obj.hasOwnProperty('searchElementClass')){
            this.settings.searchElementClass = obj.searchElementClass;
        }
        if(obj.hasOwnProperty('currentLocationElementClass')){
            this.settings.currentLocationElementClass = obj.currentLocationElementClass;
        }

        if(obj.hasOwnProperty('controlsContainerClass')){
            this.settings.controlsContainerClass = obj.controlsContainerClass;
        }
    };

    /**
     * Creates a marker on the map
     * @param position
     * @param title
     * @param icon
     * @param draggable
     * @param dragListener
     * @returns {Marker}
     */
    GoogleMap.prototype.createMarker = function(position,title,icon,draggable,dragListener,labelText,markerData){
        var marker = new google.maps.Marker({
            position: position,
            title:title,
            draggable: (draggable)? draggable: false,
            icon: (icon)? icon :  'images/you_are_here.png',
            data : markerData,
            label : (labelText) ? labelText : title
        });
        if(dragListener){
            google.maps.event.addListener(marker,'dragend',function(){
                dragListener(marker.position.lat(),marker.position.lng());
            });
        }
        return marker;
    };

    /**
     * Creates google map instance
     */
    GoogleMap.prototype.renderMap = function(){
        this.map = new google.maps.Map(document.getElementById(this.settings.mapElementId),this.mapOptions);
    };

    /**
     * Listen to map idle event and when the event is fired it tells that map is now loaded
     * @returns {promise|*}
     */
    GoogleMap.prototype.mapIdleListener = function(){
        var defer = $q.defer();
        google.maps.event.addListenerOnce(this.map, 'idle', function () {
            this.isReady = true;
            defer.resolve(true);
        });
        return defer.promise;
    };

    GoogleMap.prototype.toggleMapControls = function(){
        var defer = $q.defer();
        if($('#'+this.settings.searchElementId).is(':visible')){
            $('#'+this.settings.searchElementId).hide();
            $('#'+this.settings.currentLocationElementId).hide();
        }
        else{
            $('#'+this.settings.searchElementId).show();
            $('#'+this.settings.currentLocationElementId).show();
        }
        $timeout(function(){
            defer.resolve(true);
        },1000);
        return defer.promise;
    };
    /**
     * Pushing map controls onto the map
     */
    GoogleMap.prototype.pushMapControls = function(){
        var searchElem = (document.getElementById(this.settings.searchElementId));
        var clocBtn = (document.getElementById(this.settings.currentLocationElementId));
        this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(clocBtn);
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchElem);
        this.searchBox = new google.maps.places.SearchBox((searchElem));
    };

    /**
     * Adding google map search box control without adding google maps
     * @param searchElementId
     */
    GoogleMap.prototype.addSearchBox = function(searchElementId){
        var searchElem = (document.getElementById(searchElementId));
        this.searchBox = new google.maps.places.SearchBox((searchElem));
    };

    GoogleMap.prototype.addAutoComplete = function(elementId,options){
        var autocompleteElem = document.getElementById(elementId);
        if(typeof(options) == 'object'){
            options = {};
        }
        this.autoComplete = new google.maps.places.Autocomplete(autocompleteElem,options)
    };


    GoogleMap.prototype.listenOnMapControls = function(locationChangeCallback,callback,isMap){
        if(typeof(isMap) == "undefined"){
            isMap = true;
        }
        var _this = this;
        if(typeof(locationChangeCallback) == "undefined"){
            locationChangeCallback = null;
        }
        ////console.log(_this.searchBox);
        google.maps.event.addListener(_this.searchBox,'places_changed',function(){
            var places = _this.searchBox.getPlaces();
            if (places.length == 0) {
                return;
            }

            var bounds = new google.maps.LatLngBounds();
            var place = places[0];
            var image = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            if(isMap){
                _this.clearAllMarkers();
                //$scope.triggerLocationChange(place.geometry.location.lat(),place.geometry.location.lng());
                var marker = _this.createMarker(place.geometry.location,place.name,'images/you_are_here.png',true,locationChangeCallback);
                _this.markerList.push(marker);
                _this.placeMarker(marker);
                bounds.extend(place.geometry.location);

                _this.map.fitBounds(bounds);
                if(_this.map.getZoom() > 15){ _this.map.setZoom(14);}
            }

            if(callback){
                callback(place.geometry.location.lat(),place.geometry.location.lng());
            }
        });

        if(isMap){
            google.maps.event.addListener(_this.map, 'bounds_changed', function() {
                var bounds = _this.map.getBounds();
                _this.searchBox.setBounds(bounds);
            });
        }


    };

    GoogleMap.prototype.clearAllMarkers = function(){
        for (var i = 0, marker; marker = this.markerList[i]; i++) {
            marker.setMap(null);
        }
        try{
            GoogleMap.currentLocationMarker = null;
        }
        catch(ex){

        }
    };

    GoogleMap.prototype.getCurrentLocation = function(){
        var _this = this;
        var defer = $q.defer();
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function(currentLocation){
                _this.currentMarkerPosition.latitude = currentLocation.coords.latitude;
                _this.currentMarkerPosition.longitude = currentLocation.coords.longitude;
                defer.resolve(true);
            },function(){_this.handleNoGeolocation(defer)});
        } else{
            _this.handleNoGeolocation(defer);
        };
        return defer.promise;
    };

    GoogleMap.prototype.handleNoGeolocation = function(promise){
        var currentLoc = new google.maps.LatLng(this.currentMarkerPosition.latitude,this.currentMarkerPosition.longitude);
        if(this.map){
            this.map.setCenter(currentLoc);
        }
        promise.resolve(false);
    };

    GoogleMap.prototype.createGMapPosition = function(latitude,longitude){
        var pos =  new google.maps.LatLng(latitude,longitude);
        return pos;
    };

    GoogleMap.prototype.placeMarker = function(marker,dragCallback,callback,labelFlag){

        if(dragCallback){
            google.maps.event.addListener(marker,'dragend',function(){
                dragCallback(marker.position.lat(),marker.position.lng());
            });
        }

        marker.setMap(this.map);
        this.markerList.push(marker);
        this.setMarkersInBounds();
        this.map.setCenter(marker.getPosition());
        this.map.setZoom(15);
        if(callback){
            callback(marker.position.lat(),marker.position.lng());
        }

        if(labelFlag){
            try{
                var label = new Label({
                    map: this.map
                });
                label.bindTo('position', marker, 'position');
                label.bindTo('text', marker, 'label');
            }
            catch(ex){
                console.error('Label extended library not defined');
            }
        }

    };

    GoogleMap.prototype.removeCurrentLocationMarker = function(){
        try{
            this.currentLocationMarker.setMap(null);
        }
        catch(ex){
            //console.error('Currrent Marker removal unsuccessful');
        }

    };

    GoogleMap.prototype.placeCurrentLocationMarker = function(dragCallback,callback,clearMarkers){
        if(typeof(dragCallback) == "undefined" || typeof(dragCallback) == "null"){
            dragCallback = null;
        }
        else{
            if(dragCallback){
                GoogleMap.currentMarkerDragCallBack = dragCallback;
            }
            else{
                dragCallback = (GoogleMap.currentMarkerDragCallBack) ? GoogleMap.currentMarkerDragCallBack : null;
            }
        }


        if(typeof(clearMarkers) == "undefined"){
            this.clearAllMarkers();
        }
        else{
            if(clearMarkers){
                this.clearAllMarkers();
            }
        }

        this.removeCurrentLocationMarker();

        var currentLocation = new google.maps.LatLng(this.currentMarkerPosition.latitude,this.currentMarkerPosition.longitude);
        var marker = this.createMarker(currentLocation,'Your current location',null,true,dragCallback);
        this.currentLocationMarker = marker;
        this.placeMarker(marker);
        this.map.setCenter(currentLocation);
        this.map.setZoom(14);
        if(callback){
            this.currentMarkerPlaceCallback = callback;
            $timeout(function(){
                callback(marker.position.lat(),marker.position.lng());
            },2000);
        }
        else{
            if(this.currentMarkerDragCallBack){
               this.currentMarkerDragCallBack(marker.position.lat(),marker.position.lng());
            }
        }
    };

    GoogleMap.prototype.resizeMap = function(){
        google.maps.event.trigger(this.map, "resize");
        if(this.markerList.length > 0){
            this.map.setCenter(this.markerList[0].getPosition());
        }
    };


    GoogleMap.prototype.setMarkersInBounds = function(){
        var bounds = new google.maps.LatLngBounds();
        for(var i = 0; i < this.markerList.length; i++){
            bounds.extend(this.markerList[i].position);
        }
        this.map.fitBounds(bounds);
    };


    /**
     * Get reverse geolocation address components using Google Reverse Geolocation API
     * @param lat
     * @param lng
     */
    GoogleMap.prototype.getReverseGeolocation = function(lat,lng){
        var defer = $q.defer();
        var latLng = new google.maps.LatLng(lat,lng);
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({latLng: latLng},function(results,status){
            if(status === google.maps.GeocoderStatus.OK){
                if(results && results.length > 0){
                    defer.resolve({data : results, message : 'Results found'})
                }
                else{
                    defer.resolve({data : null, message : 'No results found'});
                }
            }
            else{
                defer.reject();
            }
        });
        return defer.promise;
    };

    /**
     * Parses Google Reverse Geolocation API Result
     * @param geocoderResults
     * @returns {{city: string, state: string, country: string, postalCode: string}}
     */
    GoogleMap.prototype.parseReverseGeolocationData = function(geocoderResults){

        var returnObj = {
            city : '',
            state : '',
            country : '',
            postalCode : '',
            area : '',
            sublocality2 : '',
            sublocality3 : '',
            route : ''
        };

        ////console.log(geocoderResults);

        if(geocoderResults && geocoderResults.length > 0){

            var results = geocoderResults[0]['address_components'];
            try{
                angular.forEach(results,function(result,index){
                    switch(result.types[0]){
                        case 'locality':
                            returnObj.city = (returnObj.city) ? (returnObj.city + ', ' + result.long_name) : result.long_name;
                            break;
                        case 'administrative_area_level_1':
                            returnObj.state =  (result.long_name) ? result.long_name : '';
                            break;
                        case 'postal_code':
                            returnObj.postalCode = (result.long_name) ? result.long_name : '';
                            break;
                        case 'country':
                            returnObj.country = (result.long_name) ? result.long_name : '';
                            break;
                        case 'sublocality_level_1':
                            returnObj.area = (result.long_name) ? result.long_name : '';
                            break;
                        case 'sublocality_level_2':
                            returnObj.sublocality2 = (result.long_name) ? result.long_name : '';
                            break;
                        case 'sublocality_level_3':
                            returnObj.sublocality3 = (result.long_name) ? result.long_name : '';
                            break;
                        case 'route':
                            returnObj.route = (result.long_name) ? result.long_name : '';
                            break;
                        default :
                            break;
                    }

                });
            }
            catch(ex){
                console.error('Geolocation data parsing error : '+ ex);
            }
        }

        ////console.log(returnObj);

        return returnObj;
    };


    GoogleMap.prototype.addMapEventListener = function(eventListenerArgs){
        if(!eventListenerArgs){
            return;
        }
        if(eventListenerArgs.length > 0){
            eventListenerArgs.forEach(function(evntArg,index){

            });
        }
    };

    /**
     * Render direction on map
     */
    GoogleMap.prototype.renderDirection = function(directionPanelId,startLatitude,startLongitude,endLatitude,endLongitude){
        var _this = this;
        var directionsDisplay = new google.maps.DirectionsRenderer();;
        var directionsService = new google.maps.DirectionsService();

        directionsDisplay.setMap(_this.map);
        directionsDisplay.setPanel(document.getElementById('directions-panel'));

        var start = _this.createGMapPosition(startLatitude,startLongitude);
        var end = _this.createGMapPosition(endLatitude,endLongitude);

        var request = {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING
        };
        directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            }
        });

    };

    /**
     * Creates address string from parsed geolocation data object
     * @param addressObject
     */
    GoogleMap.prototype.createAddressFromGeolocation = function(addressObject,options){
        var props = ['route','sublocality3','sublocality2','area','city','state','country','postalCode'];
        if(!options){
            options = {
                route : true,
                sublocality3 : true,
                sublocality2 : true,
                area : true,
                city : true,
                state : true,
                country : true,
                postalCode : true
            };
        }

        if(options){
            for(var a = 0; a < props.length; a++){
                if(typeof(options[props[a]]) == "null" || typeof(options[props[a]]) == "undefined"){
                    options[props[a]] = true;
                }
            }
        }

        var addressString = '';
        if(options.route && addressObject.route){
            addressString += addressObject.route + ', '
        }

        if(!addressObject){
            return addressString;
        }
        if(options.sublocality3 && addressObject.sublocality3){
            addressString += addressObject.sublocality3 + ', ';
        }

        if(options.sublocality2 && addressObject.sublocality2){
            addressString += addressObject.sublocality2 + ', ';
        }

        if(options.area && addressObject.area){
            addressString += addressObject.area + ', ';
        }

        if(options.city && addressObject.city){
            addressString += addressObject.city + ', ';
        }

        if(options.state && addressObject.state){
            addressString += addressObject.state + ', ';
        }

        if(options.country && addressObject.country){
            addressString += addressObject.country + ', ';
        }

        if(options.postalCode && addressObject.postalCode){
            addressString += addressObject.postalCode + ', ';
        }
        if(addressString.length > 0){
            addressString = addressString.substr(0,addressString.length -2);
        }
        return addressString;
    };


    return GoogleMap;


}]);