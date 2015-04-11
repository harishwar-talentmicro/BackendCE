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
                    if(this[i].hasOwnProperty(key) && this[i][key] === value){
                        console.log('prop '+prop + '  value : '+value);
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

        /**
         * List of states loaded in Editing mode based on country ID
         * @type {Array}
         */
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
                console.log('Line 125 map initialization in progress');
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

                console.log('container-element');
                console.log(containerElement);
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
            mapList['map'+index].getCurrentLocation().then(function(){
                mapList['map'+index].placeCurrentLocationMarker($scope.setEditCurrentLocation);
            });
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
                /**
                 * If country is changed then load new list of state for the new country
                 */

                if($scope.countryList[countryIndex].CountryID !== $scope.editLocationDetails.CountryID){
                    $scope.editLocationDetails.CountryID = $scope.countryList[countryIndex].CountryID;
                    $scope.editLocationDetails.CountryName = $scope.countryList[countryIndex].CountryName;
                    $scope.loadStates($scope.countryList[countryIndex].CountryID).then(function(stateList){
                        if(stateList.length > 1){
                            $scope.editStateList = stateList;
                        }
                        var stateIndex = $scope.editStateList.indexOfWhere('StateTitle',geolocationAddress.state);
                        if(stateIndex === -1){
                            stateIndex = 0;
                        }
                        $scope.editLocationDetails.CountryID = $scope.countryList[countryIndex].CountryID;
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
                    $scope.editLocationDetails.CountryName = $scope.countryList[countryIndex].CountryName;
                }
            });
        };


        /**
         * Details of Location currently in editing mode
         * @type {{LocTitle: string, TID: number, AddressLine1: string, AddressLine2: string, CityID: string, StateID: string, CityTitle: string, StateTitle: string, CountryID: number, CountryName: string, ISDPhoneNumber: string, PhoneNumber: string, ISDMobileNumber: string, MobileNumber: string, ParkingStatus: string, Website: string, Picture: string, PictureFileName: string, PostalCode: string, Latitude: number, Longitude: number, Altitude: number}}
         */
        $scope.editLocationDetails = {
            LocTitle : 'New Location',
            TID : 0,
            AddressLine1 : '',
            AddressLine2 : '',
            CityID : '',
            StateID : '',
            CityTitle : '',
            StateTitle : '',
            CountryID : 1,
            CountryName : 'Afghanistan',
            ISDPhoneNumber : '',
            PhoneNumber: '',
            ISDMobileNumber : '',
            MobileNumber : '',
            ParkingStatus : 0,
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
            $scope.toggleAllLocations(index);
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
                    console.log($scope.editLocationDetails);
                    for(var prop in $scope.editLocationDetails){
                        if($scope.editLocationDetails.hasOwnProperty(prop)){
                            for(var prop1 in $scope.secondaryLocations[index-1]){
                                if(prop === prop1){
                                    $scope.editLocationDetails[prop] = $scope.secondaryLocations[index-1][prop];
                                }
                            }
                        }
                    }
                    console.log($scope.editLocationDetails);
                    $scope.placeEditModeMarker(index);

                });
            }


        };


        $scope.saveLocation = function(locIndex){
            if(locIndex === 0 ){
                var userDetails = angular.copy($scope.userDetails);
                for(var prop in $scope.editLocationDetails){
                    if($scope.editLocationDetails.hasOwnProperty(prop)){
                        for(var prop1 in userDetails){
                            if(userDetails.hasOwnProperty(prop1) && prop1 === prop){
                                userDetails[prop] = $scope.editLocationDetails[prop];
                            }
                        }
                    }
                }

                var data = {
                    IDTypeID : userDetails.IDTypeID,
                    EZEID : userDetails.EZEID,
                    Password : '',
                    FirstName : userDetails.FirstName,
                    LastName : userDetails.LastName,
                    CompanyName : userDetails.CompanyName,
                    JobTitle : userDetails.JobTitle,
                    CategoryID : 0,
                    FunctionID : 0,
                    RoleID : 0,
                    LanguageID : 1,
                    NameTitleID : 0,
                    Latitude : (userDetails.Latitude) ? userDetails.Latitude : 0,
                    Longitude : (userDetails.Longitude) ? userDetails.Longitude : 0,
                    Altitude : (userDetails.Altitude) ? userDetails.Altitude : 0,
                    AddressLine1 : userDetails.AddressLine1,
                    AddressLine2 : userDetails.AddressLine2,
                    Area : (userDetails.Area) ? $scope.editUserDetails.Area : '',
                    CityTitle : userDetails.CityTitle,
                    StateID : userDetails.StateID,
                    CountryID : userDetails.CountryID,
                    PostalCode : userDetails.PostalCode,
                    PIN : (userDetails.PIN) ? userDetails.PIN : '',
                    PhoneNumber : userDetails.PhoneNumber,
                    MobileNumber : userDetails.MobileNumber,
                    EMailID : userDetails.EMailID,
                    Picture  : userDetails.Picture,
                    PictureFileName : userDetails.PictureFileName,
                    Website : (userDetails.Website) ? userDetails.Website : '',
                    AboutCompany: (userDetails.AboutCompany) ? userDetails.AboutCompany : '',
                    Keywords : (userDetails.Keywords) ? userDetails.Keywords : '',
                    Token : $rootScope._userInfo.Token,
                    Icon : (userDetails.Icon) ? userDetails.Icon :'',
                    IconFileName : (userDetails.IconFileName) ? userDetails.IconFileName :'',
                    ISDPhoneNumber : userDetails.ISDPhoneNumber,
                    ISDMobileNumber : userDetails.ISDMobileNumber,
                    Gender : userDetails.Gender,
                    DOB : userDetails.DOB,
                    OperationType : 'U',
                    SelectionType : ($scope.IDTypeID === 2) ?
                        ((userDetails.SelectionType === 1 || userDetails.SelectionType === 2) ?
                            userDetails.SelectionType : 1) : 0,
                    ParkingStatus : userDetails.ParkingStatus

                };

                $http({
                    url : GURL + 'ewSavePrimaryEZEData',
                    method : 'POST',
                    data : data
                }).success(function(resp){
                    if(resp && resp !== null && resp !== 'null'){
                        if(resp.IsAuthenticate){

                            /**
                             * Updating primaryLocation properties with new primaryLocation details from Edit Mode
                             */
                            for(var prop in userDetails){
                                if(userDetails.hasOwnProperty(prop)){
                                    for(var prop1 in $scope.userDetails){
                                        if($scope.userDetails.hasOwnProperty(prop1) && prop1 === prop){
                                            $scope.userDetails[prop] = userDetails[prop];
                                        }
                                    }
                                }
                            }

                            Notification.success({
                                message: 'Primary Location Details saved successfully',
                                delay : MsgDelay
                            });
                            $scope.locationsToggleIndex[locIndex].editMode = false;
                            /**
                             * Resetting edit mode data
                             */
                            $scope.resetEditLocationDetails();
                        }
                        else{
                            Notification.error({
                                message: 'An error occured while saving primary location details ! Try again',
                                delay : MsgDelay
                            });
                        }
                    }
                    else{
                        Notification.error({
                            message: 'An error occured while saving primary location details ! Try again',
                            delay : MsgDelay
                        });
                    }
                        /**
                         * @todo 1. Add logic to toggleEditMode after the location is successfully saved
                         *  2. Copy the new userDetails to $scope.userDetails Object
                         */
                }).error(function(err){
                    Notification.error({
                        message: 'An error occured while saving primary location details ! Try again',
                        delay : MsgDelay
                    });
                });

            }

            /**
             * If location is secondary
             */
            else{
                    var data  = {
                        Token : $rootScope._userInfo.Token,
                        TID : ($scope.editLocationDetails.TID) ? $scope.editLocationDetails.TID : 0,
                        LocTitle : $scope.editLocationDetails.LocTitle,
                        Latitude : $scope.editLocationDetails.Latitude,
                        Longitude : $scope.editLocationDetails.Longitude,
                        Altitude : 0,
                        AddressLine1 : $scope.editLocationDetails.AddressLine1,
                        AddressLine2 : $scope.editLocationDetails.AddressLine2,
                        CityTitle : $scope.editLocationDetails.CityTitle,
                        StateID : $scope.editLocationDetails.StateID,
                        CountryID : $scope.editLocationDetails.CountryID,
                        PostalCode : $scope.editLocationDetails.PostalCode,
                        PIN : '',
                        PhoneNumber : $scope.editLocationDetails.PhoneNumber,
                        MobileNumber : $scope.editLocationDetails.MobileNumber,
                        Picture : $scope.editLocationDetails.Picture,
                        PictureFileName : ($scope.editLocationDetails.PictureFileName) ? $scope.editLocationDetails.PictureFileName : 'default.jpg' ,
                        Website : $scope.editLocationDetails.Website,
                        ISDPhoneNumber : $scope.editLocationDetails.ISDPhoneNumber,
                        ISDMobileNumber : $scope.editLocationDetails.ISDMobileNumber,
                        ParkingStatus : $scope.editLocationDetails.ParkingStatus
                    }
                    $http({
                        url : GURL + 'ewmAddLocation',
                        method : 'POST',
                        data : data
                    }).success(function(resp){
                            if(resp && resp.length > 0){
                                for(var prop in $scope.editLocationDetails){
                                    if($scope.editLocationDetails.hasOwnProperty(prop)){
                                        for(var prop1 in $scope.secondaryLocations[locIndex-1]){
                                            if($scope.secondaryLocations[locIndex-1].hasOwnProperty(prop1) && prop1 === prop){
                                                $scope.secondaryLocations[locIndex-1][prop] = $scope.editLocationDetails[prop];
                                            }
                                        }
                                    }
                                }

                                Notification.success({
                                    message: 'Secondary Location Details saved successfully',
                                    delay : MsgDelay
                                });
                                $scope.locationsToggleIndex[locIndex].editMode = false;
                                /**
                                 * Resetting edit mode data
                                 */
                                $scope.resetEditLocationDetails();

                            }

                            else{
                                Notification.success({
                                    message: 'An error occurred while saving secondary location ! Please try again',
                                    delay : MsgDelay
                                });
                            }

                        }).error(function(err){
                            Notification.error({
                                message: 'An error occurred while saving secondary location ! Please try again',
                                delay : MsgDelay
                            });
                            console.log(err);
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
         * Add a new secondary location locally
         * to be saved on server
         */
        $scope.addSecondaryLocation = function(){
            var locIndex = $scope.locationsToggleIndex.indexOfWhere('savedOnServer',false);

            if(locIndex !== -1){
                $scope.toggleAllLocations(locIndex);
                $timeout(function(){
                    $scope.toggleMapControls(locIndex);
                    $scope.editLocation(locIndex);
                },4000);
                return;
            }
            var newLoc = angular.copy($scope.editLocationDetails);
            var initialLength = $scope.locationsToggleIndex.length; //3

            $scope.locationsToggleIndex.length += 1; //4 now prev 3
            $scope.secondaryLocations.length += 1;  //3 now prev 2

            $scope.locationsToggleIndex[initialLength] = {
                viewMode : false,
                editMode : false,
                isMapInitialized : false,
                savedOnServer: false,
                removeProgress : false,
                saveProgress : false
            };
            $scope.secondaryLocations[initialLength-1] =  newLoc;

            $scope.locationsToggleIndex[initialLength].viewMode = true;
            $scope.locationsToggleIndex[initialLength].editMode = true;

            $timeout(function(){
                $scope.initializeMap(initialLength);
                $timeout(function(){
                    $scope.editLocation(initialLength);
                    $scope.toggleMapControls(initialLength);
                },2000);
            },1000);
        };


        /**
         * Deletes a secondary Location
         * @param locIndex
         */
        $scope.deleteSecondaryLocation = function(locIndex){
            if(locIndex < 1){
                return 0;
            }

            if(!$scope.locationsToggleIndex[locIndex].savedOnServer){
                $scope.locationsToggleIndex[locIndex].removeProgress = true;
                $timeout(function(){
                    delete mapList['map'+locIndex];
                    $scope.locationsToggleIndex.splice(locIndex,1);
                    $scope.secondaryLocations.splice(locIndex - 1,1);
                },2000);
            }

            else{
                $scope.locationsToggleIndex[locIndex].removeProgress = true;
                $http({
                    url : GURL + 'ewDeleteLocation',
                    method : 'POST',
                    data : {
                        Token : $rootScope._userInfo.Token,
                        TID : $scope.secondaryLocations[locIndex-1].TID
                    }
                }).success(function(resp){
                    if(resp && resp !== 'null' && resp.hasOwnProperty('IsDeleted')){
                        if(resp.IsDeleted){
                            delete mapList['map'+locIndex];
                            $scope.locationsToggleIndex.splice(locIndex,1);
                            $scope.secondaryLocations.splice(locIndex - 1,1);
                            Notification.success({ message : 'Location removed successfully', delay : MsgDelay});
                        }
                        else{
                            Notification.error({ message : 'Error occured while removing location! Try again', delay : MsgDelay});
                        }
                    }
                    else{
                        Notification.error({ message : 'Error occured while removing location! Try again', delay : MsgDelay});
                    }
                }).error(function(err){
                        Notification.error({ message : 'Error occured while removing location! Try again', delay : MsgDelay});
                });
            }
        };

        /**
         * Validates secondary location data before saving
         * @param locIndex
         */
        $scope.validateSecondaryLocation = function(locIndex){
            var validateResult = true;
            /**
             * @todo Validate secondary location data before saving here
             */
            return validateResult;
        };


        $scope.resetEditLocationDetails = function(){
            $scope.editLocationDetails = {
                LocTitle : 'New Location',
                TID : 0,
                AddressLine1 : '',
                AddressLine2 : '',
                CityID : '',
                StateID : '',
                CityTitle : '',
                StateTitle : '',
                CountryID : 1,
                CountryName : 'Afghanistan',
                ISDPhoneNumber : '',
                PhoneNumber: '',
                ISDMobileNumber : '',
                MobileNumber : '',
                ParkingStatus : 0,
                Website : '',
                Picture : '',
                PictureFileName : '',
                PostalCode : '',
                Latitude : 0,
                Longitude : 0,
                Altitude : 0
            };

        };

    }]);

