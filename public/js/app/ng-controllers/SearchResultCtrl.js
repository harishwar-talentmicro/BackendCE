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

            //Set all the serach parameters
            $scope.params = $routeParams;

            //set the ion range slider to the initial value
            $("#range_29").ionRangeSlider({
                type: "double",
                min: 1,
                max: 5,
                step: 1,
                grid: true,
                grid_snap: true,
                keyboard : true,
                onChange : function(obj){
                    var arr = [];
                    var toRating = parseInt(obj.to);
                    var fromRating = parseInt(obj.from);
                    for(var ci = fromRating; ci <= toRating   ; ci++)
                    {
                        arr.push(ci);
                    }
                    $scope.params.rating = arr.concat(',');
                }
            });

            //find out range of the ratings
            var initialVal = $routeParams.rating[0]?$routeParams.rating[0]:1;
            var finalVal = initialVal;
            for(var i=0; i < $routeParams.rating.length; i++)
            {
                finalVal = $routeParams.rating[i];
            }

            /* checks for initial and final value */
            var initial = !isNaN(initialVal) && parseInt(initialVal) >= 1?initialVal:1;
            var final = !isNaN(finalVal) && parseInt(finalVal) <= 5?finalVal:1;

            var slider = $("#range_29").data("ionRangeSlider");
            slider.update({
                from: initial,
                to: final
            });



            //Below function is for getting key word search result
            function getSearchKeyWord(_filterValue)
            {
                var CurrentDate = moment().format('YYYY-MM-DD HH:mm:ss');
                if(!$rootScope._userInfo){
                    $rootScope._userInfo = {};
                }
                if(!$rootScope._userInfo.Token)
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
                    $scope.searchListData = data;
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

            /**
             * Select random colors for search result list tiles
             */

            /* make an array of colors for tiles */
            var colorArray = ["orange","green","blue","pink"];

            /* generate a random color string */
            $scope.random = function(){
                var rand = colorArray[Math.floor(Math.random() * colorArray.length)];
                return rand;
            };
        }
    ]);