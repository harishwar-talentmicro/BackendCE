angular.module('ezeidApp').controller('viewDirectionController',['$http', '$rootScope', '$scope', '$q', 'Notification',  '$timeout', '$window', 'GURL', function($http, $rootScope, $scope, $q, Notification, $timeout, $window, GURL){

    var viewDirection = this;
    viewDirection._info = {};
    var MsgDelay = 2000;
    $scope.showEmailForm = false;
    var map;
    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();
    var directtionLatLong;

    var marker;
    var initialLocation;
    var finalImageSrc = "";

    $scope.isPrintEnabled = false;
        $timeout(function(){
            initialize();
        },1000);


    function initialize () {
      //  $scope.$emit('$preLoaderStart');
        directionsDisplay = new google.maps.DirectionsRenderer();
        var currentLoc = new google.maps.LatLng(12.295810, 76.639381);
        var mapOptions = {
            zoom: 15,
            center : currentLoc
        };

        map = new google.maps.Map(document.getElementById('map-canvasH'),mapOptions);
        var ClocBtn = (document.getElementById('mapClocH'));
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(ClocBtn)
        var input = (document.getElementById('txtSearch'));
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        var autocomplete = new google.maps.places.Autocomplete(input, {
            types: ["geocode"]
        });


        google.maps.event.addListener(autocomplete,'place_changed',function(){
            var place = autocomplete.getPlace();

            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);
            }

            $rootScope.CLoc.CLat = place.geometry.location.lat();
            $rootScope.CLoc.CLong = place.geometry.location.lng();

            var loc = new google.maps.LatLng($rootScope.CLoc.CLat, $rootScope.CLoc.CLong);
            PlaceCurrentLocationMarker(loc);

            if (place.length == 0) {
                return;
            }
        });

        directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById('directions-panel'));

        $(window).resize(function() {
            google.maps.event.trigger(map, "resize");
        });

        /*------------- Below code is for Drow Direction ------------*/

      var userStartDirecttionLatLong = JSON.parse($window.localStorage.getItem("userCurrentLoc"));

        directtionLatLong = JSON.parse($window.localStorage.getItem("myLocation"));
        var request = {
            origin: userStartDirecttionLatLong.startLat+","+userStartDirecttionLatLong.startLong,
            destination: directtionLatLong.endLat+","+directtionLatLong.endLong,
            travelMode: google.maps.TravelMode.DRIVING
        };

        directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);


            }
        });

        google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {
            // ... CALLBACK
                google.maps.event.addListener(map,'tilesloaded',function(){
                            convertasbinaryimage().then(function(){
                                $timeout(function(){
                                    $scope.isPrintEnabled = true;
                                },15000);
                            });
                }
            );

        });

        // Try W3C Geolocation (Preferred)
        if (navigator.geolocation) {
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
        }

        /*-------------------- Direction Over --------------------------------*/
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
        google.maps.event.trigger(map, "resize");
        map.setCenter(location);
    }

    $scope.getMyLocation = function(){
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(FindCurrentLocation);
        }
    };

    function FindCurrentLocation(position) {
        initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        $rootScope.CLoc = {
            CLat: position.coords.latitude,
            CLong: position.coords.longitude
        };
        PlaceCurrentLocationMarker(initialLocation);
    }



    function convertasbinaryimage()
    {
        var defer = $q.defer();
        html2canvas(document.getElementById("googlemap"), {
            useCORS: true,
            proxy : '//maps.googlemaps.com',
            onrendered: function(canvas) {
                var img = canvas.toDataURL("image/jpg");
                img = img.replace('data:image/png;base64,', '');
                finalImageSrc = 'data:image/jpg;base64,' + img;
                $('#googlemapbinary').attr('src', finalImageSrc);
               // $rootScope.$broadcast('$preLoaderStop');
                defer.resolve();
                return false;
            }
        });
        return defer.promise;
    }

    // EMail direction Html
    viewDirection.emailHtml = function () {
     if(!$rootScope._userInfo.IsAuthenticate)
        {
            $('#SignIn_popup').slideDown();
        }
        else
        {
            // $('#SalesEnquiryRequest_popup').slideDown();
            $scope.showEmailForm = true;
        }
    };

    // Print direction Html
    viewDirection.printHtml = function () {
        $scope.showEmailForm = false;

        var printContents = document.getElementById("googlemapimage").innerHTML;
        var popupWin = window.open('', '_blank', 'width=300,height=300');
        popupWin.document.open();
        popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + printContents + '</html>');
        popupWin.document.close();
    };

    //  Close EMail direction dialogue
    viewDirection.closeEmailDialouge = function () {
        $scope.showEmailForm = false;
        document.getElementById("ToMailID").className = "form-control emptyBox";
        viewDirection._info.FromEmailID = "";
    };

    //  EMail direction image
    viewDirection.emailDirectionImage = function () {
        $http({ method: 'post', url: GURL + 'ewtSendBulkMailer', data: { Token: $rootScope._userInfo.Token, TID: "", TemplateID: "", ToMailID: viewDirection._info.ToMailID, Attachment: finalImageSrc, AttachmentFileName :'ViewDirection.jpg'} }).success(function (data)
        {
            if (data != 'null')
            {
                viewDirection._info.FromEmailID = "";
                viewDirection._info.ToMailID = "";
                Notification.success({message: "Mail are submitted for transmitted..", delay: MsgDelay});
                $window.localStorage.removeItem("searchResult");
                $scope.showEmailForm = false;
            }
            else
            {
                Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                $window.localStorage.removeItem("searchResult");
            }
        });
    };

}]);
