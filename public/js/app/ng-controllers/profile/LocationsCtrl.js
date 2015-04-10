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
    'ScaleAndCropImage',
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
        ScaleAndCropImage,
        $location,
        $compile,
        GoogleMaps
        ) {

        /**
         * Returns index of Object from array based on Object Property
         * @param key
         * @returns {number}
         */
        Array.prototype.indexOfWhere = function(key,value){
            var resultIndex = -1;
            var found = false;
            for(var i = 0; i < this.length; i++){
                for(var prop in this[i]){
                    if(this[i].hasOwnProperty(key) && this[i][prop] == value){
                        resultIndex = i;
                        found = true;
                        break;
                    }
                }
                if(found){
                    break;
                }
            }
            return resultIndex;
        };

        /**
         * Maps parking Status with its string equivalent
         * @type {Array}
         */
        $scope.parkingStatusMap = [
            '',
            'Public Parking',
            'Valet Parking',
            'No Parking'
        ];

        /**
         * Object holding a list of maps based on mapindex as key
         * For angular performance reason this value is not assigned to scope
         * to prevent watcher binding to this variable
         * @type {{}}
         */
        var mapList = {};

        $scope.editStateList = [];


        /**
         * Show and hide map using location index
         * @param index
         */
        $scope.toggleMapControls = function(index){
            mapList['map'+index].toggleMapControls();
            mapList['map'+index].clearAllMarkers();
            /**
             * Placing unmovable marker back
             */
            var pos = null;
            var title = null;
            if(index === 0){
                pos = mapList['map'+index].createGMapPosition(
                    $scope.userDetails.Latitude,
                    $scope.userDetails.Longitude
                );
                title = 'Primary Location';
            }
            else{
                pos = mapList['map'+index].createGMapPosition(
                    $scope.secondaryLocations[index-1].Latitude,
                    $scope.secondaryLocations[index-1].Longitude
                );
                title = $scope.secondaryLocations[index-1].LocTitle;
            }

            var marker = mapList['map'+index].createMarker(pos,title,null,false,null);
            mapList['map'+index].placeMarker(marker);
        };


        /**
         * Initializes the map only when user view a location first time
         * @param index
         */
        $scope.initializeMap = function(index){
            if(!$scope.locationsToggleIndex[index].isMapInitialized)
            {
                mapList['map'+index] = new GoogleMaps();
                $scope.locationsToggleIndex[index].isMapInitialized = true;

                var pos = null;
                var title = '';
                var containerElement = '';
                if(index == 0){
                    /**
                     * If locations is primary then set the coordinates from userDetails
                     * @type {*|pos}
                     */
                    pos = mapList['map'+index].createGMapPosition(
                        $scope.userDetails.Latitude,
                        $scope.userDetails.Longitude
                    );
                    title = 'Primary Location';
                    containerElement = 'map-location-0';
                }
                else {
                    /**
                     * If location is secondary get coordinates from locationList
                     */
                    pos = mapList['map'+index].createGMapPosition(
                        $scope.secondaryLocations[index-1].Latitude,
                        $scope.secondaryLocations[index-1].Longitude
                    );
                    title = $scope.secondaryLocations[index-1].LocTitle;
                    containerElement = 'map-location-'+index;
                }


                mapList['map'+index].createMap(containerElement,$scope,'findCurrentLocation('+index+')');
                mapList['map'+index].renderMap();
                mapList['map'+index].mapIdleListener().then(function(){
                    mapList['map'+index].pushMapControls($scope.setEditCurrentLocation);
                    mapList['map'+index].toggleMapControls();
                    mapList['map'+index].listenOnMapControls($scope.setEditCurrentLocation);
                    mapList['map'+index].resizeMap();

                        var marker = mapList['map'+index].createMarker(pos,title,null,false,null);
                        mapList['map'+index].placeMarker(marker);

                });
            }
            else{
                mapList['map'+index].clearAllMarkers();
                if(index == 0){
                    /**
                     * If locations is primary then set the coordinates from userDetails
                     * @type {*|pos}
                     */
                    pos = mapList['map'+index].createGMapPosition(
                        $scope.userDetails.Latitude,
                        $scope.userDetails.Longitude
                    );
                    title = 'Primary Location';
                }
                else {
                    /**
                     * If location is secondary get coordinates from locationList
                     */
                    pos = mapList['map'+index].createGMapPosition(
                        $scope.secondaryLocations[index-1].Latitude,
                        $scope.secondaryLocations[index-1].Longitude
                    );
                    title = $scope.secondaryLocations[index-1].LocTitle;
                }
                var marker = mapList['map'+index].createMarker(pos,title,null,false,null);
                mapList['map'+index].placeMarker(marker);
            }
        };

        /**
         * Closes all other locations if open
         * and opens location which is clicked to view
         * @param index
         */
        $scope.toggleAllLocations = function(index){
            $scope.locationsToggleIndex.forEach(function(location,index){
                $scope.locationsToggleIndex[index].editMode = false;
                $scope.locationsToggleIndex[index].viewMode = false;
            });
            $scope.locationsToggleIndex[index].viewMode = true;
            var countryId = (index == 0) ? $scope.userDetails.CountryID : $scope.secondaryLocations[index-1].CountryID;
            $scope.loadStates(countryId).then(function(stateList){
                $scope.editStateList = stateList;
            });

        };

        /**
         * Finds and displays current location of user on map
         */
        $scope.findCurrentLocation = function(index){
            mapList['map'+index].clearAllMarkers();
            mapList['map'+index].placeCurrentLocationMarker($scope.setEditCurrentLocation);
        };

        /**
         * Passed as Callback to all map markers for changing current position
         * @param lat
         * @param lng
         */
        $scope.setEditCurrentLocation = function(lat,lng){
            $scope.editLocationDetails.Latitude = lat;
            $scope.editLocationDetails.Longitude = lng;
            $scope.$digest();
            var gMap = new GoogleMaps();

            /**
             * Reverse Geolocation API call to get city, state, country and PIN code
             */
            gMap.getReverseGeolocation(lat,lng).then(function(results){
                var geolocationAddress = gMap.parseReverseGeolocationData(results.data);
                var countryIndex = $scope.countryList.indexOfWhere('CountryName',geolocationAddress.country);
                console.log($scope.countryList[countryIndex]);
                /**
                 * If country is changed then load new list of state for the new country
                 */
                if($scope.countryList[countryIndex].CountryID !== $scope.editLocationDetails.CountryID){
                    $scope.loadStates($scope.countryList[countryIndex].CountryID).then(function(stateList){
                        if(stateList.length > 1){
                            $scope.editStateList = stateList;
                        }
                        var stateIndex = $scope.editStateList.indexOfWhere('StateTitle',geolocationAddress.state);
                        if(stateIndex === -1){
                            stateIndex = 0;
                        }
                        $scope.editLocationDetails.StateID = $scope.editStateList[stateIndex].StateID;
                        $scope.editLocationDetails.CityTitle = geolocationAddress.city;
                        $scope.editLocationDetails.PostalCode = geolocationAddress.postalCode;
                    });
                }
                else{
                    var stateIndex = $scope.editStateList.indexOfWhere('StateName',geolocationAddress.state);
                    if(stateIndex === -1){
                        stateIndex = 0;
                    }
                    $scope.editLocationDetails.StateID = $scope.editStateList[stateIndex].StateID;
                    $scope.editLocationDetails.CityTitle = geolocationAddress.city;
                    $scope.editLocationDetails.PostalCode = geolocationAddress.postalCode;
                }
            });
        };


        $scope.editLocationDetails = {
            LocTitle : '',
            LocID : '',
            AddressLine1 : '',
            AddressLine2 : '',
            CityID : '',
            StateID : '',
            CityTitle : '',
            StateTitle : '',
            CountryID : '',
            CountryName : '',
            ISDPhoneNumber : '',
            PhoneNumber: '',
            ISDMobileNumber : '',
            MobileNumber : '',
            ParkingStatus : '',
            Website : '',
            Picture : '',
            PictureFileName : '',
            PostalCode : '',
            Latitude : 0,
            Longitude : 0,
            Altitude : 0
        };

        /**
         * Editing locations and assigning values to edit location form
         * @param index
         */

        $scope.editLocation = function(index){

            /**
             * On editing mode of location we fetch a new list of state
             * Assign the new list to $scope.editList variable
             * and then binds data to the models
             */
            if(index == 0){
                $scope.loadStates($scope.userDetails.CountryID).then(function(stateList){
                    $scope.editStateList = stateList;
                    for(var prop in $scope.editLocationDetails){
                        if($scope.editLocationDetails.hasOwnProperty(prop)){
                            for(var prop1 in $scope.userDetails){
                                if(prop === prop1){
                                    $scope.editLocationDetails[prop] = $scope.userDetails[prop];
                                }
                            }
                        }
                    }
                    $scope.placeEditModeMarker(index);
                });
            }
            else{
                $scope.loadStates($scope.secondaryLocations[index-1].CountryID).then(function(stateList){
                    $scope.editStateList  = stateList;

                    for(var prop in $scope.editLocationDetails){
                        if($scope.editLocationDetails.hasOwnProperty(prop)){
                            for(var prop1 in $scope.userDetails){
                                if(prop === prop1){
                                    $scope.editLocationDetails[prop] = $scope.secondaryLocations[index-1][prop];
                                }
                            }
                        }
                    }
                    $scope.placeEditModeMarker(index);

                });
            }


        };


        /**
         * To be called when stateList for current editing location is loaded successfully
         * and models are assigned
         * used in $scope.editLocation()
         * @param index
         */
        $scope.placeEditModeMarker = function(index){
            mapList['map'+index].clearAllMarkers();
            $scope.locationsToggleIndex[index].editMode = true;
            var pos = mapList['map'+index].createGMapPosition(
                $scope.editLocationDetails.Latitude,
                $scope.editLocationDetails.Longitude
            );

            var marker = mapList['map'+index].createMarker(pos,$scope.editLocationDetails.LocTitle,null,true,$scope.setEditCurrentLocation);

            mapList['map'+index].placeMarker(marker,$scope.setEditCurrentLocation);
        };

        /**
         * @todo saveLocation();
         */

        $scope.deleteSecondaryLocation = function(){
            /**
             * @todo Deleting secondaryLocation
             */
        };

        $scope.addSecondaryLocation = function(){
            var locIndex = $scope.locationsToggleIndex.indexOfWhere('savedOnServer',false);
            if(locIndex !== -1){
                $scope.toggleAllLocations(locIndex);
                $timeout(function(){
                    $scope.toggleMapControls(locIndex);
                    $scope.editLocation(locIndex);
                },4000);
            }
            var newLoc = angular.copy($scope.editLocationDetails);
        };

    }]);

