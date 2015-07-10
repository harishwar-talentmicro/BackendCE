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
        '$route',
        'UtilityService',
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
            $routeParams,
            $route,
            UtilityService
            )
        {
            if($rootScope._userInfo){
                if(!$rootScope._userInfo.IsAuthenticate){
                    var unregister = $rootScope.$watch('_userInfo',function(newVal,oldVal){
                        if(newVal){
                            if(newVal.hasOwnProperty('IsAuthenticate')){
                                if(newVal.IsAuthenticate){
                                    unregister();
                                    $route.reload();
                                }
                            }
                        }
                    });
                }
            }

            //Below line is for Loading img
            $scope.$emit('$preLoaderStart');

            var destroyModalDetailsWatcher = null;

            $scope.SearchInfo = {};
            var currentBanner = 1;
            var Miliseconds = 8000;
            var RefreshTime = Miliseconds;
            $scope.nextButton = true;
            $scope.previousButton =  true;
            var AutoRefresh = true;
            var x = new Date();
            var today = moment(x.toISOString()).utc().format('DD-MMM-YYYY hh:mm A');
            $scope.activeTemplate = "";
            $scope.showWorkingHourModel = false;
            $scope.showMapPopupModel = false;
            $scope.showDetailsModal = false;
            $scope.form_rating = 0;

            /**
             * Function for converting UTC time from server to LOCAL timezone
             */
            var convertTimeToLocal = function(timeFromServer,dateFormat,returnFormat){
                if(!dateFormat){
                    dateFormat = 'DD-MMM-YYYY hh:mm A';
                }
                if(!returnFormat){
                    returnFormat = dateFormat;
                }
                var x = new Date(timeFromServer);
                var mom1 = moment(x);
                return mom1.add((mom1.utcOffset()),'m').format(returnFormat);
            };

            function selectedTimeUtcToLocal(selectedTime)
            {
                var x = new Date();
                var today = moment(x.toISOString()).utc().format('DD-MMM-YYYY');

                var currentTaskDate = moment(today+' '+selectedTime).format('DD-MMM-YYYY H:mm');
                return convertTimeToLocal(currentTaskDate,'DD-MMM-YYYY H:mm',"H:mm");
            }

            $scope.modalBox = {
                title : 'EZEID Map',
                class : 'business-manager-modal'
            };
             var ezeone = $routeParams.ezeone;

            getSearchInformation(ezeone).then(function(){
                    var visibleStr = ($scope.SearchInfo.VisibleModules) ? $scope.SearchInfo.VisibleModules.toString() : null;
                    var visibleModules = (visibleStr) ? ((visibleStr.length == 5) ? visibleStr : '22222') : '22222';
                    if($routeParams['sales'] && (visibleModules[0] == 1)){
                        $timeout(function(){
                            $scope._salesModalTitle = $scope.SearchInfo.EZEID;
                            $scope._toggleSalesModal();
                        },1000);
                    }

                    else if($routeParams['reservation'] && (visibleModules[1] == 1)){
                        $timeout(function(){
                            $scope._reservationModalTitle = $scope.SearchInfo.EZEID;
                            $scope._toggleReservationModal();
                        },1000);
                    }

                    else if($routeParams['homeDelivery'] && (visibleModules[2] == 1)){
                        $timeout(function(){
                            $scope._homeDeliveryTitle = $scope.SearchInfo.EZEID;
                            $scope._toggleHomeDeliveryModal();
                        },1000);
                    }
                    else if($routeParams['service'] && (visibleModules[3] == 1)){
                        $timeout(function(){
                            $scope._serviceModalTitle = $scope.SearchInfo.EZEID;
                            $scope._toggleServiceModal();
                        },1000);
                    }

                    else if($routeParams['resume'] && (visibleModules[4] == 1)){
                        $timeout(function(){
                            $scope._resumeModalTitle = $scope.SearchInfo.EZEID;
                            $scope._toggleResumeModal();
                        },1000);
                    }

                });
          //  }

            var convertTimeToUTC = function(localTime,dateFormat){
                if(!dateFormat){
                    dateFormat = 'DD-MMM-YYYY hh:mm A';
                }
                return moment(localTime).utc().format(dateFormat);
            };

            //Below function is for getting search information
            function getSearchInformation(_ezeone)
            {
                var today = moment().format('YYYY-MM-DD HH:mm:ss');
                var CurrentDate = UtilityService.convertTimeToUTC(today);

                var defer = $q.defer();
                $scope.SearchInfo = {};
                $scope.AddressForInfoTab = "";
                AutoRefresh = false;
                    if(!$rootScope._userInfo)
                {
                    $rootScope._userInfo = {};
                }

                if(!$rootScope._userInfo.IsAuthenticate){
                    /*$rootScope._userInfo.Token = 2;*/
                    $rootScope._userInfo.Token = " ";
                    $scope.Token = 2;
                }

                $http({ method: 'get',
                    url: GURL + 'ewtGetSearchInformationNew?Token=' + $rootScope._userInfo.Token + '&ezeTerm='+_ezeone+'&CurrentDate='+CurrentDate}).success(function (data) {

                        if (data && data != 'null')
                        {
                            $rootScope.$broadcast('$preLoaderStop');
                            $timeout(function () {
                                $scope.SearchInfo = data[0];
                                $scope.showDetailsModal = true;

                                destroyModalDetailsWatcher = $scope.$watch('showDetailsModal',function(newVal,oldVal){
                                    if(!newVal){
                                        //Below line is for Loading img
                                        if(!$scope.businessModalOpen){
                                            $scope.$emit('$preLoaderStart');
                                            $timeout(function(){

                                                $window.history.back();
                                            },500);

                                        }
                                    }
                                });

                                if($scope.SearchInfo.IDTypeID == 2)
                                {
                                    getAboutComapny();
                                }

                                $scope.showSalesEnquiry = $scope.SearchInfo.VisibleModules[0];
                                $scope.shoReserVation = $scope.SearchInfo.VisibleModules[1];
                                $scope.showHomeDelivery = $scope.SearchInfo.VisibleModules[2];
                                $scope.showServiceRequest = $scope.SearchInfo.VisibleModules[3];
                                $scope.showSendCv = $scope.SearchInfo.VisibleModules[4];

                                //Below lines are to show address in info tab
                                $scope.AddressForInfoTab = ($scope.SearchInfo.AddressLine1 != "") ? $scope.SearchInfo.AddressLine1 +', ' : "";
                                $scope.AddressForInfoTab += ($scope.SearchInfo.AddressLine2 != "") ? $scope.SearchInfo.AddressLine2 +', ' : "";
                                $scope.AddressForInfoTab += ($scope.SearchInfo.CityTitle != "") ? $scope.SearchInfo.CityTitle +', ' : "";
                                $scope.AddressForInfoTab += ($scope.SearchInfo.CountryTitle != "") ? $scope.SearchInfo.CountryTitle +', ' : "";
                                $scope.AddressForInfoTab += ($scope.SearchInfo.PostalCode != "") ? $scope.SearchInfo.PostalCode : "";

                                $window.localStorage.setItem("myLocation",$scope.SearchInfo.Latitude+","+$scope.SearchInfo.Longitude );

                                if($scope.SearchInfo.ParkingStatus==0)
                                {
                                    $scope.parkingTitle = "Parking Status";
                                }
                                if($scope.SearchInfo.ParkingStatus==1)
                                {
                                    $scope.parkingTitle = "Public Parking";
                                }
                                if($scope.SearchInfo.ParkingStatus==2)
                                {
                                    $scope.parkingTitle = "Vallet Parking";
                                }
                                if($scope.SearchInfo.ParkingStatus==3)
                                {
                                    $scope.parkingTitle = "No parking";
                                }

                                $scope.form_rating = data[0].Rating;

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
                                defer.resolve();
                            });
                        }
                        else
                        {
                            $rootScope.$broadcast('$preLoaderStop');
                            $location.url('/');
                        }
                    })
                    .error(function(data, status, headers, config) {
                        defer.reject();
                        if ((data == 'null') || (!data))
                        {
                           $location.url('/');
                        }  $rootScope.$broadcast('$preLoaderStop');
                    });
                return defer.promise;
            }

            //Below function is for getting about company
            function getAboutComapny()
            {
                $http({ method: 'get', url: GURL + 'ewtCompanyProfile?TID=' + $scope.SearchInfo.TID}).success(function (data) {
                    if (data.Result.length > 0) {
                        $scope.companyTagLine = data.Result[0].TagLine;

                        console.log($scope.companyTagLine);
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
                $http({ method: 'get', url: GURL + 'ewtGetBannerPicture?SeqNo='+_requestedBannerValue+'&Ezeid='+$scope.SearchInfo.EZEID+'&StateTitle='+ $scope.SearchInfo.StateTitle+'&LocID='+$scope.SearchInfo.LocID}).success(function (data) {

                   /* if (data.Picture != 'null') {*/
                    if(data)
                    {
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
                       // Notification.error({ message: "No Banner found..!", delay: MsgDelay });
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

            //open Reservation form
            $scope.openReservationForm = function (_Ezeid)
            {
                if(!$rootScope._userInfo.Token){
                    $('#SignIn_popup').slideDown();
                }
                if($rootScope._userInfo.Token == " ")
                {
                    $('#SignIn_popup').slideDown();
                }
                else
                {
                    var params = '?ezeone='+_Ezeid;
                    $timeout(function(){
                        var url = '/'+_Ezeid+'/reservation'+'?name='+$scope.SearchInfo.CompanyName;
                        //$location.url('/'+_Ezeid+'/service-reservation'+'&name='+$scope.SearchInfo.CompanyName);
                        $location.url(url);
                        //$location.url('/service-reservation'+params+'&name='+$scope.SearchInfo.CompanyName);
                    },500);
                    destroyModalDetailsWatcher();
                    $scope.showDetailsModal = false;
                }
            };


            $scope.getdirections = function (data) {
                var userLoc = {
                    endLat: data.Latitude,
                    endLong : data.Longitude,
                    IDTypeID : data.IDTypeID
                };

                //$window.localStorage.setItem("myLocation", JSON.stringify(userLoc));

                var params = '?endLat='+data.Latitude+'&endLong='+data.Longitude+'&IDTypeID='+data.IDTypeID;
                $location.url('/mapView'+params);

            };

            //open working hour popup
            $scope.openWorkingHourPopup = function () {
                if($rootScope._userInfo.Token == " ")
                {
                    $('#SignIn_popup').slideDown();
                }
                else
                {
                    $http({ method: 'get', url: GURL + 'ewtGetWorkingHrsHolidayList?Token=' + $rootScope._userInfo.Token + '&LocID=' + $scope.SearchInfo.LocID }).success(function (data)
                    {
                        $scope.showWorkingHourModel = true;
                        if (data != 'null')
                        {
                            if(data.WorkingHours != "")
                            {
                                $scope.Mo1 = (data.WorkingHours[0].MO1 == "00:00") ? '08:00' : selectedTimeUtcToLocal(data.WorkingHours[0].MO1);
                                $scope.Mo2 = (data.WorkingHours[0].MO2 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].MO2);
                                $scope.Mo3 = (data.WorkingHours[0].MO3 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].MO3);
                                $scope.Mo4 = (data.WorkingHours[0].MO4 == "00:00") ? '21:00' : selectedTimeUtcToLocal(data.WorkingHours[0].MO4);

                                $scope.Tu1 = (data.WorkingHours[0].TU1 == "00:00") ? '08:00' : selectedTimeUtcToLocal(data.WorkingHours[0].TU1);
                                $scope.Tu2 = (data.WorkingHours[0].TU2 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].TU2);
                                $scope.Tu3 = (data.WorkingHours[0].TU3 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].TU3);
                                $scope.Tu4 = (data.WorkingHours[0].TU4 == "00:00") ? '21:00' : selectedTimeUtcToLocal(data.WorkingHours[0].TU4);

                                $scope.We1 = (data.WorkingHours[0].WE1 == "00:00") ? '08:00' : selectedTimeUtcToLocal(data.WorkingHours[0].WE1);
                                $scope.We2 = (data.WorkingHours[0].WE2 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].WE2);
                                $scope.We3 = (data.WorkingHours[0].WE3 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].WE3);
                                $scope.We4 = (data.WorkingHours[0].WE4 == "00:00") ? '21:00' : selectedTimeUtcToLocal(data.WorkingHours[0].WE4);

                                $scope.Th1 = (data.WorkingHours[0].TH1 == "00:00") ? '08:00' : selectedTimeUtcToLocal(data.WorkingHours[0].TH1);
                                $scope.Th2 = (data.WorkingHours[0].TH2 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].TH2);
                                $scope.Th3 = (data.WorkingHours[0].TH3 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].TH3);
                                $scope.Th4 = (data.WorkingHours[0].TH4 == "00:00") ? '21:00' : selectedTimeUtcToLocal(data.WorkingHours[0].TH4);

                                $scope.Fr1 = (data.WorkingHours[0].FR1 == "00:00") ? '08:00' : selectedTimeUtcToLocal(data.WorkingHours[0].FR1);
                                $scope.Fr2 = (data.WorkingHours[0].FR2 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].FR2);
                                $scope.Fr3 = (data.WorkingHours[0].FR3 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].FR3);
                                $scope.Fr4 = (data.WorkingHours[0].FR4 == "00:00") ? '21:00' : selectedTimeUtcToLocal(data.WorkingHours[0].FR4);

                                $scope.Sa1 = (data.WorkingHours[0].SA1 == "00:00") ? '08:00' : selectedTimeUtcToLocal(data.WorkingHours[0].SA1);
                                $scope.Sa2 = (data.WorkingHours[0].SA2 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].SA2);
                                $scope.Sa3 = (data.WorkingHours[0].SA3 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].SA3);
                                $scope.Sa4 = (data.WorkingHours[0].SA4 == "00:00") ? '21:00' : selectedTimeUtcToLocal(data.WorkingHours[0].SA4);

                                $scope.Su1 = (data.WorkingHours[0].SU1 == "00:00") ? '08:00' : selectedTimeUtcToLocal(data.WorkingHours[0].SU1);
                                $scope.Su2 = (data.WorkingHours[0].SU2 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].SU2);
                                $scope.Su3 = (data.WorkingHours[0].SU3 == "00:00") ? '13:00' : selectedTimeUtcToLocal(data.WorkingHours[0].SU3);
                                $scope.Su4 = (data.WorkingHours[0].SU4 == "00:00") ? '21:00' : selectedTimeUtcToLocal(data.WorkingHours[0].SU4);
                            }

                            if(data.HolidayList != "")
                            {
                                $scope.holiday = data.HolidayList;
                            }
                        }
                        else
                        {
                            // Notification.error({ message: 'Invalid key or not found…', delay: MsgDelay });
                        }
                    });
                    // $('#WorkingHour_popup').slideDown();
                }
            };

            /**
             * @author Indrajeet
             * @description New Sales Module Integration
             */
            $scope._salesModalTitle = 'Sales Enquiry Form';
            $scope._showSalesModal = false;
            $scope._toggleSalesModal = function(){

                if(!$rootScope._userInfo.Token)
                 {
                    $('#SignIn_popup').slideDown();
                 }
                 else if($rootScope._userInfo.Token == " ")
                 {
                    $('#SignIn_popup').slideDown();
                 }
                 else
                 {
                    $location.url('/'+$scope.SearchInfo.EZEID+'/sales');
                 }
            };

            $scope._toggleReservationModal = function(){
                /**
                 * @todo
                 * Open Reservation Modal
                 */
            };

            $scope._homeDeliveryModalTitle = 'Home Delivery Order Form';
            $scope._showHomeDeliveryModal = false;
            $scope._toggleHomeDeliveryModal = function(){
                if(!$rootScope._userInfo.Token)
                {
                    $('#SignIn_popup').slideDown();
                }
                else if($rootScope._userInfo.Token == " ")
                {
                    $('#SignIn_popup').slideDown();
                }
                else{
                    $location.url('/'+$scope.SearchInfo.EZEID+'/home_delivery');
                }
            };

            $scope._serviceModalTitle = 'Helpdesk Form';
            $scope._showServiceModal = false;
            $scope._toggleServiceModal = function(){
                if(!$rootScope._userInfo.Token)
                {
                    $('#SignIn_popup').slideDown();
                }
                else if($rootScope._userInfo.Token == " ")
                {
                    $('#SignIn_popup').slideDown();
                }
                else{
                    $location.url('/'+$scope.SearchInfo.EZEID+'/helpdesk');
                }
            };

            $scope._resumeModalTitle = 'Submit Resume Application';
            $scope._showResumeModal = false;
            $scope._toggleResumeModal = function(){

                if(!$rootScope._userInfo.Token)
                {
                    $('#SignIn_popup').slideDown();
                }
                else if($rootScope._userInfo.Token == " ")
                {
                    $('#SignIn_popup').slideDown();
                }
                else {
                    $location.url('/'+$scope.SearchInfo.EZEID+'/resume');
                }

            };

            $scope.businessModalOpen = false;

            $scope.$watch('_showSalesModal',function(n){
                if(!n){
                    $scope.businessModalOpen = false;
                    $scope.showDetailsModal = true;
                }
            });

            $scope.$watch('_showHomeDeliveryModal',function(n){
                if(!n){
                    $scope.businessModalOpen = false;
                    $scope.showDetailsModal = true;
                }
            });

            $scope.$watch('_showServiceModal',function(n){
                if(!n){
                    $scope.businessModalOpen = false;
                    $scope.showDetailsModal = true;
                }
            });

            $scope.$watch('_showResumeModal',function(n){
                if(!n){
                    $scope.businessModalOpen = false;
                    $scope.showDetailsModal = true;
                }
            });

        }
    ]);