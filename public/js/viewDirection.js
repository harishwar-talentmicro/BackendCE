angular.module('ezeidApp').controller('viewDirectionController',['$http', '$rootScope', '$scope', '$q', 'Notification',  '$timeout', '$window', 'GURL', function($http, $rootScope, $scope, $q, Notification, $timeout, $window, GURL){

    var viewDirection = this;
    viewDirection._info = {};
    var MsgDelay = 2000;
    $scope.showEmailForm = false;
    var map;
    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();
    var directtionLatLong;

    var finalImageSrc = "";

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
         map = new google.maps.Map(document.getElementById('map-canvasH'),mapOptions);

        directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById('directions-panel'));

        $(window).resize(function() {
            google.maps.event.trigger(map, "resize");
        });

        /*------------- Below code is for Drow Direction ------------*/

        directtionLatLong = JSON.parse($window.localStorage.getItem("directionLocation"));

        var request = {
             origin: directtionLatLong.startLat+","+directtionLatLong.startLong,
             destination: directtionLatLong.endLat+","+directtionLatLong.endLong,
             travelMode: google.maps.TravelMode.DRIVING
         };


       /* var request = {
            origin: '12.94223,77.574838',
            destination: '12.894854,77.60277300000007',
            travelMode: google.maps.TravelMode.DRIVING
        };*/



         directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);

                $timeout(function(){
                    convertasbinaryimage();
                },8000);
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
                finalImageSrc = 'data:image/png;base64,' + img;

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
    viewDirection.closeEmailDialouge = function () {
        $scope.showEmailForm = false;
        viewDirection._info.FromEmailID = "";
        document.getElementById("FromEmailID").className = "form-control emptyBox";
    };

    //  EMail direction image
    viewDirection.emailDirectionImage = function () {
        console.log(viewDirection._info);

        $http({ method: 'get', url: GURL + 'ewtSendBulkMailer?Token=' + $rootScope._userInfo.Token + '&TID='+ Tids + '&TemplateID='+ salesEnquiry._info.TID }).success(function (data)
        {
            if (data != 'null')
            {
                salesEnquiry._info = {};

                $scope.formTitle = "Bulk Sales Enquiry";
                $scope.showCreateMailTemplate = false;

                document.getElementById("FromName").className = "form-control emptyBox";
                document.getElementById("FromEmailID").className = "form-control emptyBox";
                document.getElementById("Title").className = "form-control emptyBox";
                document.getElementById("Subject").className = "form-control emptyBox";
                document.getElementById("Body").className = "form-control emptyBox";

                Notification.success({message: "Mails are submitted for transmitted..", delay: MsgDelay});
                $window.localStorage.removeItem("searchResult");
            }
            else
            {
                // Notification.error({ message: 'Invalid key or not found…', delay: MsgDelay });
                $window.localStorage.removeItem("searchResult");
            }
        });

       $http({ method: 'post', url: GURL + 'ewtSendBulkMail', data: { TokenNo: $rootScope._userInfo.Token,  Attachement:  finalImageSrc, FromEmail: viewDirection._info.FromEmailID } }).success(function (data)
       {
            if (data.IsSuccessfull) {

                viewDirection._info.FromEmailID = "";
                Notification.success({ message: 'Message send success', delay: MsgDelay });
                $scope.showEmailForm = false;
                document.getElementById("FromEmailID").className = "form-control emptyBox";
            }
            else {
                Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
            }
        });

    };

}]);
