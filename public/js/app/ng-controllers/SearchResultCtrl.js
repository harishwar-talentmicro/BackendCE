/**
 * Created by admin on 6/5/15.
 */
/**
 * Sign up Controller
 * @name SignUpCtrl
 * Manages signup functionality
 *
 * "use strict";
 */

angular.module('ezeidApp').
    controller('SearchResultCtrl', [
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

           // console.log($routeParams);
            //Below line is for Loading img
            // $scope.$emit('$preLoaderStart');

            // To get search key result
            getSearchKeyWord($routeParams);


            //Below function is for getting key word search result
            function getSearchKeyWord(_filterValue)
            {
                console.log(_filterValue);
                console.log(_filterValue.rating);

                $scope.SearchResultCount = "";
                $scope.ShowNoDataFound = false;
                var Rating = _filterValue.rating;
                var ParkingStatus = _filterValue.parkingStatus;
                var HomeDelivery = _filterValue.homeDelivery;
                var OpenStatus = _filterValue.openStatus;
                var CurrentDate = moment().format('YYYY-MM-DD HH:mm:ss');
                $scope.AddressForInfoTab = "";

                if($rootScope._userInfo.Token == "")
                {
                    $rootScope._userInfo.Token = 2;
                    $scope.Token = 2;
                }

                var Latitude = $rootScope.CLoc.CLat;
                var Longitude = $rootScope.CLoc.CLong;
                var Token = $rootScope._userInfo.Token;

                $http({ method: 'post', url: GURL + 'ewSearchByKeywords', data: {   TokenNo: $rootScope._userInfo.Token,
                                                                                    ToMasterID: SearchSec.mInfo.TID, MessageType: 1, Message: SearchSec.salesMessage, TaskDateTime: today, LocID :SearchSec.mInfo.LocID,CurrentTaskDate: currentTaskDate } }).success(function (data) {
                    $rootScope.$broadcast('$preLoaderStop');
                    if (data != 'null' && data.length>0)
                    {
                        $scope.SearchResultCount = data.length;
                        $window.localStorage.setItem("searchResult", JSON.stringify(data));

                        if(SearchSec.Criteria.SearchType == 2 || SearchSec.Criteria.SearchType == 3)
                        {
                            SearchSec.showResultTab = true;
                            SearchSec.searchResult = data;
                        }

                        if(($rootScope._userInfo.IsAuthenticate == true || data[0].IDTypeID > 1) && data[0].Latitude != undefined )
                        {
                            try{
                                PlaceMarker(data);
                            }
                            catch(ex){
                                if(!map){
                                    initialize();
                                }
                                $scope.$watch('isMapLoaded',function(var1,var2){
                                    if(var2){
                                        PlaceMarker(data);
                                    }
                                });
                            }
                        }

                        var _item = data[0];
                        if(data[0].Filename)
                        {
                            if($rootScope._userInfo.IsAuthenticate == true || data[0].IDTypeID > 1)
                            {
                                SearchSec.IsShowForm = true;
                                SearchSec.downloadData = data[0];
                                SearchSec.IsFilterRowVisible = false;

                                var downloadUrl = "/ewtGetSearchDocuments?Token="+$rootScope._userInfo.Token+"&&Keywords="+SearchSec.Criteria.Keywords;
                                $window.open(downloadUrl, '_blank');
                                /* var win = window.open(downloadUrl, '_blank');
                                 win.focus();*/
                            }
                            else
                            {
                                //Redirect to Login page
                                $('#SignIn_popup').slideDown();
                                $rootScope.defer = $q.defer();
                                var prom = $rootScope.defer.promise;
                                prom.then(function(d){
                                    SearchSec.getSearch();
                                });
                            }
                        }
                        else
                        {
                            if($rootScope._userInfo.IsAuthenticate == true || data[0].IDTypeID == 2 && (SearchSec.Criteria.SearchType == 1))
                            {
                                $rootScope.$broadcast('$preLoaderStart');
                                $http({ method: 'get', url: GURL + 'ewtGetSearchInformation',
                                    params : {
                                        Token : $rootScope._userInfo.Token,
                                        TID : _item.TID,
                                        CurrentDate : SearchSec.Criteria.CurrentDate
                                    }
                                }).success(function (data) {

                                        $rootScope.$broadcast('$preLoaderStop');
                                        if (data != 'null') {

                                            if(data.length == 1 && SearchSec.Criteria.SearchType == 1)
                                            {
                                                $scope.showInfoTab = true;
                                                $scope.selectTab('info');
                                                $scope.ShowInfoWindow = true;
                                                SearchSec.showSearchWindow = false;
                                                SearchSec.showInfoWindow = true;
                                                SearchSec.showResultWindow = false;
                                                $scope.ShowLinks = true;
                                                $scope.showSmallBanner = true;
                                            }
                                            else
                                            {
                                                $scope.selectTab('map');
                                            }
                                            $timeout(function () {
                                                SearchSec.mInfo = data[0];
                                                //Set Visibal module
                                                SearchSec.mInfo.VisibleModules = (SearchSec.mInfo.VisibleModules.length === 5) ? SearchSec.mInfo.VisibleModules : '00000';
                                                $scope.showSalesEnquiry = parseInt(SearchSec.mInfo.VisibleModules[0]);
                                                $scope.showHomeDelivery = parseInt(SearchSec.mInfo.VisibleModules[1]);
                                                $scope.shoReserVation = parseInt(SearchSec.mInfo.VisibleModules[2]);
                                                $scope.showServiceRequest = parseInt(SearchSec.mInfo.VisibleModules[3]);
                                                $scope.showSendCv = parseInt(SearchSec.mInfo.VisibleModules[4]);

                                                //Below lines are to show address in info tab
                                                $scope.AddressForInfoTab = (SearchSec.mInfo.AddressLine1 != "") ? SearchSec.mInfo.AddressLine1 +', ' : "";
                                                $scope.AddressForInfoTab += (SearchSec.mInfo.AddressLine2 != "") ? SearchSec.mInfo.AddressLine2 +', ' : "";
                                                $scope.AddressForInfoTab += (SearchSec.mInfo.CityTitle != "") ? SearchSec.mInfo.CityTitle +', ' : "";
                                                $scope.AddressForInfoTab += (SearchSec.mInfo.CountryTitle != "") ? SearchSec.mInfo.CountryTitle +', ' : "";
                                                $scope.AddressForInfoTab += (SearchSec.mInfo.PostalCode != "") ? SearchSec.mInfo.PostalCode : "";

                                                if(SearchSec.mInfo.ParkingStatus==0)
                                                {
                                                    SearchSec.parkingTitle = "Parking Status";
                                                }
                                                if(SearchSec.mInfo.ParkingStatus==1)
                                                {
                                                    SearchSec.parkingTitle = "Public Parking";
                                                }
                                                if(SearchSec.mInfo.ParkingStatus==2)
                                                {
                                                    SearchSec.parkingTitle = "Vallet Parking";
                                                }
                                                if(SearchSec.mInfo.ParkingStatus==3)
                                                {
                                                    SearchSec.parkingTitle = "No parking";
                                                }

                                                if (!/^(f|ht)tps?:\/\//i.test(data[0].Website)) {
                                                    // url = "http://" + data[0].Website;
                                                    //  SearchSec.mInfo.Website = url;
                                                    SearchSec.mInfo.Website = data[0].Website;
                                                }

                                                //Call for banner
                                                AutoRefresh = true;
                                                if (SearchSec.Criteria.SearchType == 1)
                                                {
                                                    getBanner(1);
                                                }

                                                $scope.form_rating = data[0].Rating;
                                                SearchSec.mInfo.Banners = data[0].Banners;

                                                if(SearchSec.mInfo.IDTypeID == 2)
                                                {
                                                    SearchSec.reservationPlaceHolder = "Reservation requirement details";
                                                }
                                                else
                                                {
                                                    SearchSec.reservationPlaceHolder = "Appointment requirement details";
                                                }
                                            });
                                        }
                                        else {
                                            // Notification.error({ message: 'Invalid key or not found…', delay: MsgDelay });
                                            $scope.ShowNoDataFound = true;
                                        }
                                    });

                                /******************** Code for checking map load and handling it with reload ****************/
                                //MapIsLoaded variable is set by map eventListener idle

                                /*  try{
                                 PlaceMarker(data);
                                 }
                                 catch(ex){
                                 if(!map){
                                 initialize();
                                 }
                                 $scope.$watch('isMapLoaded',function(var1,var2){
                                 if(var2){
                                 PlaceMarker(data);
                                 }
                                 });
                                 }*/

                            }
                            else
                            {
                                if( SearchSec.Criteria.SearchType < 2 )
                                {
                                    //Redirect to Login page
                                    $('#SignIn_popup').slideDown();
                                    $rootScope.defer = $q.defer();
                                    var prom = $rootScope.defer.promise;
                                    prom.then(function(d){
                                        SearchSec.getSearch();
                                    });
                                }
                            }


                            //If map is not loaded wait for few seconds and then try to reload it and then place marker

                            /*********************Code for checking map load and handling it with reload ends ****************/
                        }
                    }
                    else {
                        // Notification.error({ message: 'Invalid key or not found…', delay: MsgDelay });
                        $scope.ShowNoDataFound = true;
                        try{
                            PlaceMarker(null);
                            $(".ezeid-map-label").remove();
                        }

                        catch(ex){
                            if(!map){
                                initialize();
                            }
                            $scope.$watch('isMapLoaded',function(var1,var2){
                                if(var2){
                                    PlaceMarker(null);
                                    $(".ezeid-map-label").remove();
                                }
                            });
                        }
                    }
                });

            }


        }
]);