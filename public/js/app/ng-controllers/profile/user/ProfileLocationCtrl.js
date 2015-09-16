angular.module('ezeidApp').controller('ProfileLocationCtrl',[
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
    'ScaleAndCropImage',
    'MsgDelay',
    '$location',
    '$routeParams',
    'GoogleMaps',
    'CountryISDList',
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
        ScaleAndCropImage,
        MsgDelay,
        $location,
        $routeParams,
        GoogleMap,
        CountryISDList
    ) {

        $scope.countryISDList = CountryISDList;
        $scope.editLocationDetails = {};


        $scope.setISDPhoneNumber = function(number){
            $scope.editLocationDetails.ISDPhoneNumber = number;
        };

        $scope.setISDMobileNumber = function(number){
            $scope.editLocationDetails.ISDMobileNumber = number;
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

        var loadFlags = {
            map : false,
            location : false,
            userDetails : false
        };

        /**
         * Checking load flags and executing the callback on all load flags true
         * @param cb
         */
        var checkLoadFlags = function(cb){
            var statusFlag = true;
            if(loadFlags){
                for(var prop in loadFlags){
                    if(loadFlags.hasOwnProperty(prop)){
                        statusFlag *= loadFlags[prop];
                    }
                }
                if(statusFlag){
                    if(typeof(cb)== "function"){
                        cb();
                    }
                }
            }
        };


        /**
         * Calling new API for loading user details
         * i.e. user_details_new
         */
        $scope.loadNewUserDetails = function(){
            var defer = $q.defer();
            $http({
                method : "GET",
                url : GURL + "user_details_new",
                params : {
                    token : $rootScope._userInfo.Token
                }
            }).success(function(resp){
                loadFlags.userDetails = true;
                if(resp && resp !== 'null'){
                    if(resp.status){
                        for(var x=0; x < resp.data.locationcount; x++){
                            $scope.locCount.push({ id : x});
                        }
                        defer.resolve(resp);

                    }
                    else{
                        defer.resolve(resp);
                    }
                }
                else{
                    defer.resolve(null);
                }
            }).error(function(err){
                loadFlags.userDetails = true;
                defer.resolve(null);
            });
            return defer.promise;
        };



        $scope.locDetails = {};
        var googleMap = new GoogleMap();
        googleMap.createMap('map-location',$scope,"findCurrentLocation()");

        googleMap.renderMap();
        googleMap.mapIdleListener().then(function(){
            googleMap.pushMapControls($scope.setEditCurrentLocation);
            googleMap.listenOnMapControls($scope.setEditCurrentLocation,$scope.setEditCurrentLocation);
            googleMap.resizeMap();

            loadFlags.map = true;

            checkLoadFlags($scope.placeLocationMarkers);

            //var marker = googleMap.createMarker(pos,title,null,false,null);
            //googleMap.placeMarker(marker);

        });

        $scope.findCurrentLocation = function(){
            googleMap.getCurrentLocation().then(function(){
                $scope.editLocationDetails.Latitude = googleMap.currentMarkerPosition.latitude;
                $scope.editLocationDetails.Longitude = googleMap.currentMarkerPosition.longitude;
                googleMap.clearAllMarkers();
                var pos = googleMap.createGMapPosition(
                    $scope.editLocationDetails.Latitude,
                    $scope.editLocationDetails.Longitude
                );
                var marker = googleMap.createMarker(pos,'Location 1',null,true,$scope.setEditCurrentLocation);
                googleMap.placeMarker(marker);


            },function(){
                googleMap.clearAllMarkers();
                var pos = googleMap.createGMapPosition(
                    $scope.editLocationDetails.Latitude,
                    $scope.editLocationDetails.Longitude
                );
                var marker = googleMap.createMarker(pos,'Location 1',null,true,$scope.setEditCurrentLocation);
                googleMap.placeMarker(marker);


                /**
                 * Reverse Geolocation API call to get city, state, country and PIN code
                 */
                googleMap.getReverseGeolocation(lat,lng).then(function(results){
                    var geolocationAddress = googleMap.parseReverseGeolocationData(results.data);
                    var countryIndex = $scope.countryList.indexOfWhere('CountryName',geolocationAddress.country);
                    /**
                     * If country is changed then load new list of state for the new country
                     */

                    $scope.editLocationDetails.CountryName = $scope.countryList[countryIndex].CountryName;
                    $scope.editLocationDetails.ISDMobileNumber = $scope.countryList[countryIndex].ISDCode;
                    $scope.editLocationDetails.ISDPhoneNumber = $scope.countryList[countryIndex].ISDCode;

                    /**
                     * If country is changed then only load states
                     */
                    if($scope.countryList[countryIndex].CountryID !== $scope.editLocationDetails.CountryID){
                        $scope.editLocationDetails.CountryID = $scope.countryList[countryIndex].CountryID;

                        $scope.loadStates($scope.countryList[countryIndex].CountryID).then(function(stateList){
                            if(stateList.length > 0){
                                $scope.stateList = stateList;
                            }
                            var stateIndex = $scope.stateList.indexOfWhere('StateName',geolocationAddress.state);
                            var xIndex = stateList.indexOfWhere('StateName',geolocationAddress.state);
                            if(stateIndex === -1){
                                stateIndex = 0;
                            }

                            $timeout(function(){
                                $scope.editLocationDetails.StateID = $scope.stateList[stateIndex].StateID;
                            },1000);
                            $scope.editLocationDetails.CityTitle = geolocationAddress.city;
                            $scope.editLocationDetails.PostalCode = geolocationAddress.postalCode;

                        });
                    }
                    else{
                        $scope.editLocationDetails.CountryID = $scope.countryList[countryIndex].CountryID;

                        var stateIndex = $scope.stateList.indexOfWhere('StateName',geolocationAddress.state);
                        if(stateIndex === -1){
                            stateIndex = 0;
                        }

                        $timeout(function(){
                            $scope.editLocationDetails.StateID = $scope.stateList[stateIndex].StateID;
                        },500);
                        $scope.editLocationDetails.StateTitle = $scope.stateList[stateIndex].StateName;
                        $scope.editLocationDetails.CityTitle = geolocationAddress.city;
                        $scope.editLocationDetails.PostalCode = geolocationAddress.postalCode;
                        $scope.editLocationDetails.CountryName = $scope.countryList[countryIndex].CountryName;
                    }
                });
            });
        };

        $scope.setEditCurrentLocation = function(lat,lng){
            $scope.editLocationDetails.Latitude = lat;
            $scope.editLocationDetails.Longitude = lng;
            googleMap.clearAllMarkers();
            var pos = googleMap.createGMapPosition(
                $scope.editLocationDetails.Latitude,
                $scope.editLocationDetails.Longitude
            );
            var marker = googleMap.createMarker(pos,'Location 1',null,true,$scope.setEditCurrentLocation);
            googleMap.placeMarker(marker);


            /**
             * Reverse Geolocation API call to get city, state, country and PIN code
             */
            googleMap.getReverseGeolocation(lat,lng).then(function(results){
                var geolocationAddress = googleMap.parseReverseGeolocationData(results.data);
                var countryIndex = $scope.countryList.indexOfWhere('CountryName',geolocationAddress.country);
                /**
                 * If country is changed then load new list of state for the new country
                 */

                $scope.editLocationDetails.CountryName = $scope.countryList[countryIndex].CountryName;
                $scope.editLocationDetails.ISDMobileNumber = $scope.countryList[countryIndex].ISDCode;
                $scope.editLocationDetails.ISDPhoneNumber = $scope.countryList[countryIndex].ISDCode;

                /**
                 * If country is changed then only load states
                 */
                if($scope.countryList[countryIndex].CountryID !== $scope.editLocationDetails.CountryID){
                    $scope.editLocationDetails.CountryID = $scope.countryList[countryIndex].CountryID;

                    $scope.loadStates($scope.countryList[countryIndex].CountryID).then(function(stateList){
                        if(stateList.length > 0){
                            $scope.stateList = stateList;

                        }
                        var stateIndex = $scope.stateList.indexOfWhere('StateName',geolocationAddress.state);
                        var xIndex = stateList.indexOfWhere('StateName',geolocationAddress.state);
                        if(stateIndex === -1){
                            stateIndex = 0;
                        }

                        $timeout(function(){
                            $scope.editLocationDetails.StateID = $scope.stateList[stateIndex].StateID;
                        },500);
                        $scope.editLocationDetails.CityTitle = geolocationAddress.city;
                        $scope.editLocationDetails.PostalCode = geolocationAddress.postalCode;

                    });
                }
                else{
                    $scope.editLocationDetails.CountryID = $scope.countryList[countryIndex].CountryID;

                    var stateIndex = $scope.stateList.indexOfWhere('StateName',geolocationAddress.state);
                    if(stateIndex === -1){
                        stateIndex = 0;
                    }

                    $timeout(function(){
                        $scope.editLocationDetails.StateID = $scope.stateList[stateIndex].StateID;
                    },500);
                    $scope.editLocationDetails.StateTitle = $scope.stateList[stateIndex].StateName;
                    $scope.editLocationDetails.CityTitle = geolocationAddress.city;
                    $scope.editLocationDetails.PostalCode = geolocationAddress.postalCode;
                    $scope.editLocationDetails.CountryName = $scope.countryList[countryIndex].CountryName;
                }
            });
            
        };


        /**
         * Callback which is executed after map and location details are loaded properly
         */
        $scope.placeLocationMarkers = function(){
            if($scope.editLocationDetails.Latitude == 0 && $scope.editLocationDetails.Latitude == 0){
                googleMap.getCurrentLocation().then(function(){
                    $scope.editLocationDetails.Latitude = googleMap.currentMarkerPosition.latitude;
                    $scope.editLocationDetails.Longitude = googleMap.currentMarkerPosition.longitude;

                    var pos = googleMap.createGMapPosition(
                        $scope.editLocationDetails.Latitude,
                        $scope.editLocationDetails.Longitude
                    );
                    var marker = googleMap.createMarker(pos,'Location 1',null,true,$scope.setEditCurrentLocation);
                    googleMap.placeMarker(marker);
                });
            }
            else{
                var pos = googleMap.createGMapPosition(
                    $scope.editLocationDetails.Latitude,
                    $scope.editLocationDetails.Longitude
                );
                var marker = googleMap.createMarker(pos,'Location 1',null,true,$scope.setEditCurrentLocation);
                googleMap.placeMarker(marker);
            }

        };
        
        /**
         * Calling new API for loading user details
         * i.e. user_details_new
         */
        $scope.loadLocationDetails = function(){
            var defer = $q.defer();
            $http({
                method : "GET",
                url : GURL + "location_details",
                params : {
                    token : $rootScope._userInfo.Token,
                    seq_no : $scope.activeLoc
                }
            }).success(function(resp) {
                if (resp && resp !== 'null') {
                    if(resp.status){
                        $scope.editLocationDetails = $scope.prepareEditLocation(resp.data);
                        var stateId = resp.data.StateID;
                        var templateId = (resp.data.HcalID) ? resp.data.HcalID : 0;
                        $timeout(function(){
                            $scope.editLocationDetails.TemplateID = templateId.toString();
                        },2000);
                        $scope.loadStates($scope.editLocationDetails.CountryID).then(function(){

                            console.log(stateId);
                            console.log($scope.editLocationDetails);
                            console.log('Loading states');
                            $scope.editLocationDetails.StateID = 0;
                            $timeout(function(){
                                console.log($scope.editLocationDetails);
                                console.log('Timeout Executed');
                                $scope.editLocationDetails.StateID =  stateId;
                                console.log($scope.editLocationDetails);
                            },500);
                        });
                        loadFlags.location = true;
                        checkLoadFlags($scope.placeLocationMarkers);
                    }
                    else{
                        Notification.error({title : 'Unable to load location details',delay : MsgDelay});
                    }
                    console.log(resp);
                    defer.resolve(resp);
                }
                else{
                    Notification.error({title : 'Unable to load location details',delay : MsgDelay});
                }
            }).error(function(err){
                Notification.error({title : 'Unable to load location details',delay : MsgDelay});
            });
            return defer.promise;
        };

        $scope.prepareEditLocation = function(data){
            data.TID = data.tid;
            data.TemplateID = 0;
            return data;
        };

        $scope.loadEditStateList = function(){
            checkLoadFlags(function(){
                $scope.loadStates($scope.editLocationDetails.CountryID).then(function(stateList){
                    if(stateList && stateList.length > 0 && stateList !== 'null'){
                        $scope.stateList = stateList;
                        $timeout(function(){
                            $scope.editLocationDetails.StateID = stateList[0].StateID;
                        },500);
                    }
                    else{
                        Notification.error({
                            message : 'Unable to load list of states/provinces',
                            delay : MsgDelay
                        });
                    }
                }, function(){
                    Notification.error({
                        message : 'Unable to load list of states/provinces',
                        delay : MsgDelay
                    });
                });
            });
        };


        var validateLocation = function(data){
            var error =  [];
            if((!data.Latitude) &&  (!data.longitude)){
                error.push('latitude, longitude');
            }

            if(!data.AddressLine1){
                error.push('address');
            }

            if(!data.PostalCode){
                error.push('postal code');
            }


            if(!data.CityTitle){
                error.push('city');
            }


            if(!data.StateID){
                error.push('state');
            }


            if(!data.CountryID){
                error.push('country');
            }

            if(error.length){
                Notification.error({ title : 'Error' ,message : 'Please check '+ error.join(', '), delay : MsgDelay});
                return false;
            }
            else{
                return true;
            }
        };

        $scope.saveLocation = function(seqNo){
            var data  = {
                Token : $rootScope._userInfo.Token,
                TID : ($scope.editLocationDetails.TID) ? $scope.editLocationDetails.TID : 0,
                LocTitle : (seqNo) ? $scope.editLocationDetails.LocTitle : 'Primary Location',
                Latitude : ($scope.editLocationDetails.Latitude) ? $scope.editLocationDetails.Latitude : 12.9667,
                Longitude : ($scope.editLocationDetails.Longitude) ? $scope.editLocationDetails.Longitude : 77.5667,
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
                ParkingStatus : $scope.editLocationDetails.ParkingStatus,
                TemplateID : ($scope.editLocationDetails.TemplateID) ? $scope.editLocationDetails.TemplateID : 0
            };

            if(!validateLocation(data)){
                return false;
            }

            $scope.$emit('$preLoaderStart');
            $http({
                url : GURL + 'ewmAddLocation',
                method : 'POST',
                data : data
            }).success(function(resp) {
                $scope.$emit('$preLoaderStop');
                if (resp && resp.length > 0) {
                    Notification.success({title : 'Success', message : 'Your location details are saved successfully',delay : MsgDelay});
                }
            }).error(function(err,statusCode){
                $scope.$emit('$preLoaderStop');
                var msg = { title : 'Error', message : "An error occurred ! Please try again", delay : MsgDelay};
                if(!statusCode){
                    msg = { title : 'Connection Lost', message : "Unable to reach the server ! Please check your connection", delay : MsgDelay};
                }
                Notification.error(msg);
            });
        };


        $scope.$emit('$preLoaderStart');
        $scope.masterInit(function(){
            $scope.loadNewUserDetails().then(function(){

                if(parseInt($rootScope._userInfo.Verified)){
                    $scope.loadLocationDetails().then(function(){
                        $scope.$emit('$preLoaderStop');
                    },function(){
                        $scope.$emit('$preLoaderStop');
                    });
                }

                else{
                    console.log('I ame xecuting');

                    $timeout(function(){
                        googleMap.getCurrentLocation().then(function() {
                            $scope.editLocationDetails.Latitude = googleMap.currentMarkerPosition.latitude;
                            $scope.editLocationDetails.Longitude = googleMap.currentMarkerPosition.longitude;
                            googleMap.clearAllMarkers();
                            var pos = googleMap.createGMapPosition(
                                $scope.editLocationDetails.Latitude,
                                $scope.editLocationDetails.Longitude
                            );
                            var marker = googleMap.createMarker(pos, 'Location 1', null, true, $scope.setEditCurrentLocation);
                            googleMap.placeMarker(marker);


                            /**
                             * Reverse Geolocation API call to get city, state, country and PIN code
                             */
                            googleMap.getReverseGeolocation(googleMap.currentMarkerPosition.latitude,googleMap.currentMarkerPosition.longitude).then(function(results){
                                var geolocationAddress = googleMap.parseReverseGeolocationData(results.data);
                                var countryIndex = $scope.countryList.indexOfWhere('CountryName',geolocationAddress.country);
                                /**
                                 * If country is changed then load new list of state for the new country
                                 */

                                $scope.editLocationDetails.CountryName = $scope.countryList[countryIndex].CountryName;
                                $scope.editLocationDetails.ISDMobileNumber = $scope.countryList[countryIndex].ISDCode;
                                $scope.editLocationDetails.ISDPhoneNumber = $scope.countryList[countryIndex].ISDCode;

                                /**
                                 * If country is changed then only load states
                                 */
                                if($scope.countryList[countryIndex].CountryID !== $scope.editLocationDetails.CountryID){
                                    $scope.editLocationDetails.CountryID = $scope.countryList[countryIndex].CountryID;

                                    $scope.loadStates($scope.countryList[countryIndex].CountryID).then(function(stateList){
                                        if(stateList.length > 0){
                                            $scope.stateList = stateList;
                                        }
                                        var stateIndex = $scope.stateList.indexOfWhere('StateName',geolocationAddress.state);
                                        var xIndex = stateList.indexOfWhere('StateName',geolocationAddress.state);
                                        if(stateIndex === -1){
                                            stateIndex = 0;
                                        }

                                        $timeout(function(){
                                            $scope.editLocationDetails.StateID = $scope.stateList[stateIndex].StateID;
                                        },1000);
                                        $scope.editLocationDetails.CityTitle = geolocationAddress.city;
                                        $scope.editLocationDetails.PostalCode = geolocationAddress.postalCode;

                                    });
                                }
                                else{
                                    $scope.editLocationDetails.CountryID = $scope.countryList[countryIndex].CountryID;

                                    var stateIndex = $scope.stateList.indexOfWhere('StateName',geolocationAddress.state);
                                    if(stateIndex === -1){
                                        stateIndex = 0;
                                    }

                                    $timeout(function(){
                                        $scope.editLocationDetails.StateID = $scope.stateList[stateIndex].StateID;
                                    },500);
                                    $scope.editLocationDetails.StateTitle = $scope.stateList[stateIndex].StateName;
                                    $scope.editLocationDetails.CityTitle = geolocationAddress.city;
                                    $scope.editLocationDetails.PostalCode = geolocationAddress.postalCode;
                                    $scope.editLocationDetails.CountryName = $scope.countryList[countryIndex].CountryName;
                                }
                            });

                        });
                    },3000);

                }

            },function(){
                $scope.$emit('$preLoaderStop');
            });
        });

        $timeout(function(){
            $scope.$emit('$preLoaderStop');
        },7000);
    }
]);