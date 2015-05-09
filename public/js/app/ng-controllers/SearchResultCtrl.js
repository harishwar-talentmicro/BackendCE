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
            //Below line is for Loading img
            $scope.$emit('$preLoaderStart');

            // To get search key result
            getSearchKeyWord($routeParams);


            //Below function is for getting key word search result
            function getSearchKeyWord(_filterValue)
            {
                var CurrentDate = moment().format('YYYY-MM-DD HH:mm:ss');
                if($rootScope._userInfo.Token == "")
                {
                    $rootScope._userInfo.Token = 2;
                }

                $http({ method: 'post', url: GURL + 'ewSearchByKeywords', data: {
                                                                                    SearchType:_filterValue.searchType,
                                                                                    Keywords:_filterValue.searchTerm,
                                                                                    Token: $rootScope._userInfo.Token,
                                                                                    SCategory:0,
                                                                                    Proximity:_filterValue.proximity,
                                                                                    Latitude:12.295810,
                                                                                    Longitude:76.639381,
                                                                                    ParkingStatus:_filterValue.parkingStatus,
                                                                                    OpenStatus:_filterValue.openStatus,
                                                                                    Rating:_filterValue.rating,
                                                                                    HomeDelivery:_filterValue.homeDelivery,
                                                                                    CurrentDate:CurrentDate
                } }).success(function (data) {
                    $rootScope.$broadcast('$preLoaderStop');
                       console.log(data);
                    if (data != 'null' && data.length>0)
                    {
                        $scope.SearchResultCount = data.length;
                        $window.localStorage.setItem("searchResult", JSON.stringify(data));
                        if(data[0].Filename)
                        {
                            if($rootScope._userInfo.IsAuthenticate == true || data[0].IDTypeID > 1)
                            {
                                var downloadUrl = "/ewtGetSearchDocuments?Token="+$rootScope._userInfo.Token+"&&Keywords="+_filterValue.searchTerm;
                                $window.open(downloadUrl, '_blank');
                            }
                            else
                            {
                                //Redirect to Login page
                                $('#SignIn_popup').slideDown();
                                $rootScope.defer = $q.defer();
                                var prom = $rootScope.defer.promise;
                                prom.then(function(d){
                                    //SearchSec.getSearch();
                                });
                            }
                        }

                    }

                });

            }


        }
]);