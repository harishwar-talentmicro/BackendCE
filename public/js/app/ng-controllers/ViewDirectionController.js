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

                var img = canvas.toDataURL("image/jpg");
                img = img.replace('data:image/png;base64,', '');
                finalImageSrc = 'data:image/jpg;base64,' + img;

                // // console.log(img);

                $('#googlemapbinary').attr('src', finalImageSrc);
                return false;
            }
        });
    }

    // EMail direction Html
    viewDirection.emailHtml = function () {

        if($rootScope._userInfo.IsAuthenticate == false)
        {
            $('#SignIn_popup').slideDown();
        }
        else
        {
            $('#SalesEnquiryRequest_popup').slideDown();
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

    //  $http({ method: 'get', url: GURL + 'ewtSendBulkMailer?Token=' + $rootScope._userInfo.Token + '&TID=""&TemplateID=""&ToMailID='+ viewDirection._info.ToMailID +'&Attachment='+ finalImageSrc +'&AttachmentFileName=ViewDirection'}).success(function (data)
        $http({ method: 'post', url: GURL + 'ewtSendBulkMailer', data: { Token: $rootScope._userInfo.Token, TID: "", TemplateID: "", ToMailID: viewDirection._info.ToMailID, Attachment: finalImageSrc, AttachmentFileName :'ViewDirection.jpg'} }).success(function (data)
        {
            if (data != 'null')
            {
                viewDirection._info.FromEmailID = "";
               // document.getElementById("FromEmailID").className = "form-control emptyBox";
                Notification.success({message: "Mail are submitted for transmitted..", delay: MsgDelay});
                $window.localStorage.removeItem("searchResult");
                $scope.showEmailForm = false;
            }
            else
            {
                // Notification.error({ message: 'Invalid key or not found…', delay: MsgDelay });
                Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                $window.localStorage.removeItem("searchResult");
            }
        });
    };

}]);
