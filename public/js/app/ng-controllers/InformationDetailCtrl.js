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
            //console.log($rootScope);
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
            var TID = 592;//254;

            // To get search information
            getSearchInformation(TID);

            //Below function is for getting search information
            function getSearchInformation(_TID)
            {
                $scope.SearchInfo = {};
                AutoRefresh = false;
                if($rootScope._userInfo.Token == "")
                {
                    $rootScope._userInfo.Token = 2;
                    $scope.Token = 2;
                }
                $http({ method: 'get', url: GURL + 'ewtGetSearchInformation?Token=' + $rootScope._userInfo.Token + '&TID=' + _TID + '&CurrentDate=' + currentDate}).success(function (data) {
                    $rootScope.$broadcast('$preLoaderStop');
                    console.log(data);
                    if (data != 'null') {
                        $timeout(function () {
                            $scope.SearchInfo = data[0];
                            $scope.showSalesEnquiry = $scope.SearchInfo.VisibleModules[0];
                            $scope.showHomeDelivery = $scope.SearchInfo.VisibleModules[1];
                            $scope.shoReserVation = $scope.SearchInfo.VisibleModules[2];
                            $scope.showServiceRequest = $scope.SearchInfo.VisibleModules[3];
                            $scope.showSendCv = $scope.SearchInfo.VisibleModules[4];

                            //Call for banner
                            AutoRefresh = true;
                            getBanner(1);

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


    }
]);