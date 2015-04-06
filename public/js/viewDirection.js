angular.module('ezeidApp').controller('viewDirectionController',['$http', '$rootScope', '$scope', '$q', 'Notification',  '$timeout', '$window', 'GURL', function($http, $rootScope, $scope, $q, Notification, $timeout, $window, GURL){

    var viewDirection = this;
    viewDirection._info = {};
    var MsgDelay = 2000;
    $scope.showEmailForm = false;

    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();

    initialize();

   if ($rootScope._userInfo) {
    }
    else {
        if (typeof (Storage) !== "undefined") {
            var encrypted = localStorage.getItem("_token");
            if (encrypted) {
                var decrypted = CryptoJS.AES.decrypt(encrypted, "EZEID");
                var Jsonstring = decrypted.toString(CryptoJS.enc.Utf8);
                if (Jsonstring) {
                    $rootScope._userInfo = JSON.parse(Jsonstring);
                }
            }
            else {
                $rootScope._userInfo = {
                    IsAuthenticate: false,
                    Token: '',
                    FirstName: '',
                    Type:'',
                    Icon:''
                };
            }
        } else {
            // Sorry! No Web Storage support..
            $rootScope._userInfo = {
                IsAuthenticate: false,
                Token: '',
                FirstName: '',
                Type:'',
                Icon:''
            };
            alert('Sorry..! Browser does not support');
            window.location.href = "/home";
        }
    }

    function initialize () {
        directionsDisplay = new google.maps.DirectionsRenderer();
        var mapOptions = {
            zoom: 15,
            center : new google.maps.LatLng(12.295810, 76.639381)
        };
        /* center: new google.maps.LatLng(41.850033, -87.6500523)*/
         map = new google.maps.Map(document.getElementById('map-canvasH'),
            mapOptions);


        directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById('directions-panel'));

        $(window).resize(function() {
            google.maps.event.trigger(map, "resize");
        });

        /*------------- Below code is for Drow Direction ------------*/
        var lat1 = parseFloat('12.94223');
        var lng1 = parseFloat('17777.574838');
        var latlng1 = new google.maps.LatLng(lat1, lng1);
        var latlng1 = new google.maps.LatLng(lat1, lng1);

        var lat2 = parseFloat('12.894854');
        var lng2 = parseFloat('17777.60277300000007');
        var latlng2 = new google.maps.LatLng(lat2, lng2);

       // $rootScope.startLatLong = new google.maps.LatLng($rootScope.CLoc.CLat, $rootScope.CLoc.CLong);
      //  $rootScope.endLatLong = new google.maps.LatLng(data.Latitude, data.Longitude);


      /*  var request = {
            origin: '12.94223,77.574838',
            destination: '12.894854,77.60277300000007',
            travelMode: google.maps.TravelMode.DRIVING
        };*/




      //  var start = new google.maps.LatLng($rootScope.CLoc.CLat, $rootScope.CLoc.CLong);

        console.log("SAi 222");
        console.log($rootScope);

      /*  var request = {
            origin: start,
            destination: $rootScope.endLatLong,
            travelMode: google.maps.TravelMode.DRIVING
        };*/

        directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);

                $timeout(function(){
                    convertasbinaryimage();
                },4000);

            }
        });
        /*-------------------- Direction Over --------------------------------*/

    }



    function convertasbinaryimage()
    {
        html2canvas(document.getElementById("googlemap"), {

            useCORS: true,

            onrendered: function(canvas) {
                var img = canvas.toDataURL("image/png");
                img = img.replace('data:image/png;base64,', '');
                var finalImageSrc = 'data:image/png;base64,' + img;
                $('#googlemapbinary').attr('src', finalImageSrc);
                return false;
            }
        });
    }

    // EMail direction Html
    viewDirection.emailHtml = function () {
        $scope.showEmailForm = true;
    };

    // Print direction Html
    viewDirection.printHtml = function () {
        $scope.showEmailForm = false;

            var printContents = document.getElementById("googlemapimage").innerHTML;
            var popupWin = window.open('', '_blank', 'width=300,height=300');
            popupWin.document.open()
            popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + printContents + '</html>');
            popupWin.document.close();


    };

    //  Close EMail direction dialogue
    viewDirection.closeEmailDialougr = function () {
        $scope.showEmailForm = false;
    };

    //  EMail direction image
    viewDirection.emailDirectionImage = function () {
        alert("mailed...");
    };

}]);
