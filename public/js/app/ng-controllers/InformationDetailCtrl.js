/**
 * InformationDetail Controller
 *
 */

angular.module('ezeidApp').
    controller('InformationDetailCtrl', [
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
        '$location',
        '$routeParams',
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
            $location,
            $routeParams
            )
    {
            $scope.$emit('$preLoaderStart');
           // console.log($rootScope);
            //Below line is for Loading img
            $scope.SearchInfo = {};
            var currentBanner = 1;
            var Miliseconds = 8000;
            var RefreshTime = Miliseconds;
            $scope.nextButton = true;
            $scope.previousButton =  true;
            var AutoRefresh = true;
            var currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
            var x = new Date();
            var today = moment(x.toISOString()).utc().format('DD-MMM-YYYY hh:mm A');
            $scope.activeTemplate = "html/mapPopView.html";

        $scope.modalBox = {
            title : 'Transaction Details',
            class : 'business-manager-modal'
        }


        var map;
        var marker;
        var directionsDisplay;
        var directionsService = new google.maps.DirectionsService();
        var service;

            var TID = 592; //254;

        /*initialize();

        function initialize() {
            directionsDisplay = new google.maps.DirectionsRenderer();
            var myLatlng = new google.maps.LatLng(-34.397, 150.644);
            var myOptions = {
                zoom: 8,
                center: myLatlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }
            map = new google.maps.Map(document.getElementById("map-canvasH1"), myOptions);
        }*/

       /* function initialize () {
            console.log("sai21");
            // Create the search box and link it to the UI element.
            directionsDisplay = new google.maps.DirectionsRenderer();
            var initialLocation;
            var currentLoc = new google.maps.LatLng(12.295810, 76.639381);
            map = new google.maps.Map(document.getElementById('map-canvasH1'), {
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                Zoom: 15
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

            $(window).resize(function() {
                google.maps.event.trigger(map, "resize");
            });
        }

        function PlaceCurrentLocationMarker(location) {
            if (marker != undefined) {
                marker.setMap(null);
                $(".ezeid-map-label").remove();
            }
            map.setCenter(location);
            marker = new google.maps.Marker({
                position: location,
                title: "Current Location",
                draggable: true,
                map: map,
                icon: 'images/you_are_here.png'
            });
           // getReverseGeocodingData(marker.position.lat(), marker.position.lng());

            google.maps.event.addListener(marker, 'dragend', function (e) {
                $rootScope.CLoc.CLat = marker.position.lat();
                $rootScope.CLoc.CLong = marker.position.lng();
          //      getReverseGeocodingData($rootScope.CLoc.CLat, $rootScope.CLoc.CLong);
            });
        }

        function FindCurrentLocation(position) {
            initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            $rootScope.CLoc = {
                CLat: position.coords.latitude,
                CLong: position.coords.longitude
            };

          // PlaceCurrentLocationMarker(initialLocation);
        }*/
           // To get search information
            getSearchInformation(TID);

            //Below function is for getting search information
            function getSearchInformation(_TID)
            {
                $scope.SearchInfo = {};
                $scope.AddressForInfoTab = "";
                AutoRefresh = false;
                if($rootScope._userInfo.Token == "")
                {
                    $rootScope._userInfo.Token = 2;
                    $scope.Token = 2;
                }
                $http({ method: 'get', url: GURL + 'ewtGetSearchInformation?Token=' + $rootScope._userInfo.Token + '&TID=' + _TID + '&CurrentDate=' + currentDate}).success(function (data) {
                    $rootScope.$broadcast('$preLoaderStop');
                   // console.log(data);
                    if (data != 'null') {
                        $timeout(function () {
                            $scope.SearchInfo = data[0];
                            $scope.showSalesEnquiry = $scope.SearchInfo.VisibleModules[0];
                            $scope.showHomeDelivery = $scope.SearchInfo.VisibleModules[1];
                            $scope.shoReserVation = $scope.SearchInfo.VisibleModules[2];
                            $scope.showServiceRequest = $scope.SearchInfo.VisibleModules[3];
                            $scope.showSendCv = $scope.SearchInfo.VisibleModules[4];

                            //Below lines are to show address in info tab
                            $scope.AddressForInfoTab = ($scope.SearchInfo.AddressLine1 != "") ? $scope.SearchInfo.AddressLine1 +', ' : "";
                            $scope.AddressForInfoTab += ($scope.SearchInfo.AddressLine2 != "") ? $scope.SearchInfo.AddressLine2 +', ' : "";
                            $scope.AddressForInfoTab += ($scope.SearchInfo.CityTitle != "") ? $scope.SearchInfo.CityTitle +', ' : "";
                            $scope.AddressForInfoTab += ($scope.SearchInfo.CountryTitle != "") ? $scope.SearchInfo.CountryTitle +', ' : "";
                            $scope.AddressForInfoTab += ($scope.SearchInfo.PostalCode != "") ? $scope.SearchInfo.PostalCode : "";


                            //Call for banner
                            AutoRefresh = true;
                            getBanner(1);
                            /*if(!map){
                                initialize();
                            }*/

                            if($scope.SearchInfo.IDTypeID == 2)
                            {
                                $scope.reservationPlaceHolder = "Reservation requirement details";
                            }
                            else
                            {
                                $scope.reservationPlaceHolder = "Appointment requirement details";
                            }
                        });
                    }
                    else
                    {
                        Notification.error({ message: 'No Results found..!', delay: MsgDelay });
                    }
                });
            }

            //Auto refresh Banner
            $interval(function() {

                if(AutoRefresh == true && $scope.SearchInfo.Banners != 1)
                {
                    currentBanner = currentBanner + 1;
                    if(currentBanner <= $scope.SearchInfo.Banners)
                    {
                        getBanner(currentBanner);
                    }
                    else
                    {
                        currentBanner = 1;
                        getBanner(currentBanner);
                    }
                }
            },RefreshTime);

            //False when navigate to other page
            $scope.$on('$locationChangeStart', function( event ) {
                AutoRefresh = false;
            });
            // To get banner
            function getBanner(_requestedBannerValue)
            {

                $http({ method: 'get', url: GURL + 'ewtGetBannerPicture?Token=' + $rootScope._userInfo.Token +'&SeqNo='+_requestedBannerValue+'&Ezeid='+$scope.SearchInfo.EZEID+'&StateTitle='+ $scope.SearchInfo.StateTitle+'&LocID='+$scope.SearchInfo.LocID}).success(function (data) {

                    if (data.Picture != 'null') {
                        $scope.SearchInfo.BannerImage = data.Picture;
                        if(currentBanner >= $scope.SearchInfo.Banners)
                        {
                            //Disable next button
                            $scope.nextButton = false;
                        }
                        else
                        {
                            //Enable next button
                             $scope.nextButton = true;
                        }

                        if(currentBanner <= 1)
                        {
                            //Disabled previous button
                             $scope.previousButton = false;
                        }
                        else
                        {   //Enable previous button
                             $scope.previousButton = true;
                        }
                    }
                    else
                    {
                       Notification.error({ message: "No Banner found..!", delay: MsgDelay });
                    }
                });
            }

            //call for previous banner
            $scope.getPreviousBanner = function(){
                currentBanner = currentBanner - 1;
                if(currentBanner >= 1)
                {
                    getBanner(currentBanner);
                    RefreshTime = Miliseconds;
                }
            };

            //call for next banner
            $scope.getNextBanner = function () {
                currentBanner = currentBanner + 1;
                if(currentBanner <= $scope.SearchInfo.Banners)
                {
                    getBanner(currentBanner);
                    RefreshTime = Miliseconds;
                }
            };

            //open Sales Enquiry form
            $scope.openSalesEnquiryForm = function () {
                if($rootScope._userInfo.Token == 2)
                {
                    $('#SignIn_popup').slideDown();
                }
                else
                {
                    $('#SalesEnquiryRequest_popup').slideDown();
                }
            };

            $scope.sendSalesEnquiry = function () {
                if ($rootScope._userInfo.IsAuthenticate == true) {
                    var currentTaskDate = moment().format('DD-MMM-YYYY hh:mm A');
                    $http({ method: 'post', url: GURL + 'ewtSaveMessage', data: { TokenNo: $rootScope._userInfo.Token, ToMasterID: $scope.SearchInfo.TID, MessageType: 1, Message: $scope.salesMessage, TaskDateTime: today, LocID :$scope.SearchInfo.LocID,CurrentTaskDate: currentTaskDate } }).success(function (data) {
                        if (data.IsSuccessfull) {
                            $('#SalesEnquiryRequest_popup').slideUp();
                            $scope.salesMessage = "";
                            Notification.success({ message: 'Message send success', delay: MsgDelay });
                        }
                        else {
                            Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                        }
                    });
                }
                else
                {
                    //Redirect to Login page
                    $('#SignIn_popup').slideDown();
                }
            };

            // Close Sales Enquiry Form
            $scope.closeSalesEnquiryForm = function () {
                $('#SalesEnquiryRequest_popup').slideUp();
                $scope.salesMessage = "";
            };

            //open home delivery form
            $scope.openHomeDeliverForm = function () {

                if($rootScope._userInfo.Token == 2)
                {
                    $('#SignIn_popup').slideDown();
                }
                else
                {
                    $('#HomeDelivery_popup').slideDown();
                }
            };

            //Send Home Delivery
            $scope.sendHomeDelivery = function () {
                if ($rootScope._userInfo.IsAuthenticate == true) {
                    var currentTaskDate = moment().format('DD-MMM-YYYY hh:mm A');
                    $http({ method: 'post', url: GURL + 'ewtSaveMessage', data: { TokenNo: $rootScope._userInfo.Token, ToMasterID: $scope.SearchInfo.TID, MessageType: 2, Message: $scope.HomeDeliverMessage, TaskDateTime: today, LocID :$scope.SearchInfo.LocID,CurrentTaskDate : currentTaskDate } }).success(function (data) {

                        if (data.IsSuccessfull) {
                            $('#HomeDelivery_popup').slideUp();
                            $scope.HomeDeliverMessage = "";
                            Notification.success({ message: 'Message send success', delay: MsgDelay });
                        }
                        else {
                            Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                        }
                    });
                }
                else {
                    //Redirect to Login page
                    $('#SignIn_popup').slideDown();
                }
            };

            // Close HomeDeliver Form
            $scope.closeHomeDeliverForm = function () {
                $scope.HomeDeliverMessage = "";
                $('#HomeDelivery_popup').slideUp();
            };

            //open Reservation form
            $scope.openReservationForm = function () {
            document.getElementById("reservationMessage").className = "form-control fixTextArea emptyBox";
            if($rootScope._userInfo.Token == 2)
            {
                $('#SignIn_popup').slideDown();
            }
            else
            {
                $('#Reservation_popup').slideDown();
            }
        };

            //Send Reservation
            $scope.sendReservation = function (messageType) {
                if ($rootScope._userInfo.IsAuthenticate == true) {

                    /**
                     * Converting LOCAL Time to UTC Time
                     */
                    var dateTime = moment($scope.ReservationDateTime,"DD-MMM-YYYY hh:mm A").utc().format('DD-MMM-YYYY hh:mm A');
                    var currentTaskDate = moment().format('DD-MMM-YYYY hh:mm A');
                    $http({ method: 'post', url: GURL + 'ewtSaveMessage', data: { TokenNo: $rootScope._userInfo.Token, ToMasterID: $scope.SearchInfo.TID, MessageType: messageType, Message: $scope.ReservationMessage, TaskDateTime: dateTime, LocID :$scope.SearchInfo.LocID,CurrentTaskDate: currentTaskDate } }).success(function (data) {
                        if (data.IsSuccessfull) {
                            document.getElementById("reservationMessage").className = "form-control fixTextArea emptyBox";
                            $scope.ReservationMessage = "";
                            $scope.ReservationDateTime = "";
                            Notification.success({ message: 'Message send success', delay: MsgDelay });
                            $('#Reservation_popup').slideUp();
                        }
                        else {
                            Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                        }
                    });
                }
                else {
                    //Redirect to Login page
                    $('#SignIn_popup').slideDown();
                }
            };

            // Close Reservation Form
            $scope.closeReservationForm = function () {
                $('#Reservation_popup').slideUp();
                document.getElementById("reservationMessage").className = "form-control fixTextArea emptyBox";
                $scope.ReservationDateTime = "";
            };

            //open Service Request form
            $scope.openServiceRequestForm = function () {
                if($rootScope._userInfo.Token == 2)
                {
                    $('#SignIn_popup').slideDown();
                }
                else
                {
                    $('#ServiceRequest_popup').slideDown();
                }
            };

            //Send Service Request
            $scope.sendServiceRequest = function () {
                if ($rootScope._userInfo.IsAuthenticate == true) {
                    var currentTaskDate = moment().format('DD-MMM-YYYY hh:mm A');
                    $http({ method: 'post', url: GURL + 'ewtSaveMessage', data: { TokenNo: $rootScope._userInfo.Token, ToMasterID: $scope.SearchInfo.TID, MessageType: 4, Message: $scope.ServiceRequestMessage, TaskDateTime: today, LocID :$scope.SearchInfo.LocID,CurrentTaskDate : currentTaskDate } }).success(function (data) {

                        if (data.IsSuccessfull) {
                            $('#ServiceRequest_popup').slideUp();
                            $scope.ServiceRequestMessage = "";
                            Notification.success({ message: 'Message send success', delay: MsgDelay });
                        }
                        else {
                            Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                        }
                    });
                }else {
                    //Redirect to Login page
                    $('#SignIn_popup').slideDown();
                }
            };

            // Close Service Request Form
            $scope.closeServiceRequestForm = function () {
                $('#ServiceRequest_popup').slideUp();
                $scope.ServiceRequestMessage = "";
            };

        //open CV form
        $scope.openCVForm = function() {
            if($rootScope._userInfo.Token == 2)
            {
                $('#SignIn_popup').slideDown();
            }
            else
            {
                $('#CV_popup').slideDown();
            }
        };
        //Send CV Request
        function sendCV() {
            if ($rootScope._userInfo.IsAuthenticate == true) {
                var currentTaskDate = moment().format('DD-MMM-YYYY hh:mm A');
                $http({ method: 'post', url: GURL + 'ewtSaveMessage', data: { TokenNo: $rootScope._userInfo.Token, ToMasterID: $scope.SearchInfo.TID, MessageType: 5, Message: "", TaskDateTime: today, LocID :$scope.SearchInfo.LocID, CurrentTaskDate: currentTaskDate } }).success(function (data) {

                    if (data.IsSuccessfull) {
                        $('#CV_popup').slideUp();
                        Notification.success({ message: 'CV send success', delay: MsgDelay });
                    }
                    else {
                        Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                    }
                });
            }
            else {
                //Redirect to Login page
                $('#SignIn_popup').slideDown();
            }
        };

        //check for CV is uploaded by user or not
        $scope.checkForCVAvailability = function () {
            $scope.showCVSendButton = "";
            if ($rootScope._userInfo.IsAuthenticate == true)
            {
                $http({ method: 'post', url: GURL + 'ewtCheckCV', data: { Token: $rootScope._userInfo.Token } }).success(function (data) {
                    if (data.IsSuccessfull)
                    {
                        sendCV();
                    }
                    else
                    {
                        $('#CV_popup').slideUp();
                        Notification.error({ message: 'Sorry..! CV is not uploaded... ', delay: MsgDelay });
                    }
                });
            }
            else {
                //Redirect to Login page
                $('#SignIn_popup').slideDown();
            }
        };

        // Close CV Form
        $scope.closeCVForm = function () {
            $('#CV_popup').slideUp();
        };

        $scope.getdirections = function (data) {
            $scope.showMapPopupModel = true;

            /*var start = new google.maps.LatLng($rootScope.CLoc.CLat, $rootScope.CLoc.CLong);
            var end = new google.maps.LatLng(data.Latitude, data.Longitude);
            directionsDisplay.setMap(map);
            var request = {
                origin: start,
                destination: end,
                travelMode: google.maps.TravelMode.DRIVING
            };
            directionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                }
            });*/
        };

        //View Directions
        $scope.viewDirections = function (data) {

            var start = new google.maps.LatLng($rootScope.CLoc.CLat, $rootScope.CLoc.CLong);
            var end = new google.maps.LatLng(data.Latitude, data.Longitude);

            var userLoc = {
                startLat: $rootScope.CLoc.CLat,
                startLong: $rootScope.CLoc.CLong,
                endLat: data.Latitude,
                endLong : data.Longitude
            };

            $window.localStorage.setItem("directionLocation", JSON.stringify(userLoc));
            $window.open(GURL+"viewdirection", '_blank');
        };



    }
]);