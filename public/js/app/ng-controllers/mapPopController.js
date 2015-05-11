angular.module('ezeidApp').controller('mapPopController',[
    '$http',
    '$rootScope',
    '$scope',
    '$q',
    'Notification',
    '$timeout',
    'MsgDelay',
    '$window',
    'GURL',
    function($http,
             $rootScope,
             $scope, $q,
             Notification,
             $timeout,
             MsgDelay,
             $window,
             GURL){

    var map;
    var marker;
    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();
    var directtionLatLong;
    var service;
    $scope.showDirectionPannel= false;
    $scope.enableButtons = false;
    $scope.showEmailForm = false;
    var finalImageSrc = "";
    $scope.ToMailID = "";
    $scope.modalBox = {
        title : 'EZEID Map',
        class : 'business-manager-modal'
    }
    $scope.ToMailID1 = "";
    initialize();

    function initialize () {
        var initialLocation;
        directionsDisplay = new google.maps.DirectionsRenderer();
        var currentLoc = new google.maps.LatLng(12.295810, 76.639381);
        var mapOptions = {
            zoom: 15,
            center :currentLoc
        };
        map = new google.maps.Map(document.getElementById('map-canvasH1'),mapOptions);
        directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById('directions-panel'));

        $(window).resize(function() {
            google.maps.event.trigger(map, "resize");
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

        function FindCurrentLocation(position) {
            initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            $rootScope.CLoc = {
                CLat: position.coords.latitude,
                CLong: position.coords.longitude
            };
            PlaceCurrentLocationMarker(initialLocation);
        }
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

    //to show route and direction panel
    $scope.getdirections = function () {
        //Below line is for Loading img
        $scope.$emit('$preLoaderStart');
        $scope.showDirectionPannel = true;
        directtionLatLong = JSON.parse($window.localStorage.getItem("myLocation"));

        /*var start = new google.maps.LatLng($rootScope.CLoc.CLat, $rootScope.CLoc.CLong);*/
        var start = new google.maps.LatLng(12.295810, 76.639381);
        var end = new google.maps.LatLng($scope.searchResult12);
        directionsDisplay.setMap(map);
        var request = {
            origin: start,
            destination: directtionLatLong.endLat+","+directtionLatLong.endLong,
            travelMode: google.maps.TravelMode.DRIVING
        };
        directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
                $timeout(function(){
                    convertasbinaryimage();
                    $scope.enableButtons = true;
                },8000);
            }
        });
    };

    // Print direction Html
    $scope.printHtml = function () {
        var printContents = document.getElementById("googlemapimage").innerHTML;
        var popupWin = window.open('', '_blank', 'width=300,height=300');
        popupWin.document.open();
        popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + printContents + '</html>');
        popupWin.document.close();
    };

    function convertasbinaryimage()
    {
        html2canvas(document.getElementById("googlemap"), {
            useCORS: true,
            onrendered: function(canvas) {

                var img = canvas.toDataURL("image/jpg");
                img = img.replace('data:image/png;base64,', '');
                finalImageSrc = 'data:image/jpg;base64,' + img;
                $('#googlemapbinary').attr('src', finalImageSrc);
                $scope.$emit('$preLoaderStop');
                return false;
            }
        });
    }

    // EMail direction Html
    $scope.emailHtml = function () {
       if($rootScope._userInfo.IsAuthenticate == false)
        {
            $('#SignIn_popup').slideDown();
            $scope.ToMailID1 = "";
        }
        else
        {
            $scope.showEmailForm = true;
        }
    };

    //  EMail direction image
    $scope.emailDirectionImage = function () {
        $http({ method: 'post', url: GURL + 'ewtSendBulkMailer', data: { Token: $rootScope._userInfo.Token, TID: "", TemplateID: "", ToMailID: $scope.ToMailID1, Attachment: finalImageSrc, AttachmentFileName :'ViewDirection.jpg'} }).success(function (data)
        {
            if (data != 'null')
            {
                $scope.FromEmailID = "";
                // document.getElementById("FromEmailID").className = "form-control emptyBox";
                Notification.success({message: "Mail are submitted for transmitted..", delay: MsgDelay});
                $window.localStorage.removeItem("searchResult");
                $scope.showEmailForm = false;
                $scope.ToMailID1 = "";
            }
            else
            {
                Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                $window.localStorage.removeItem("searchResult");
            }
        });
    };

    //  Close EMail direction dialogue
    $scope.closeEmailDialouge = function () {
        $scope.showEmailForm = false;
        document.getElementById("ToMailID").className = "form-control emptyBox";
        $scope.FromEmailID = "";
        $scope.ToMailID1 = "";
    };

}]);
