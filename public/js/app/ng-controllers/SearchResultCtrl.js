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
            var isResultNumber = 1; /* 1: Results,0:no results */

            //Below line is for Loading img
            $scope.$emit('$preLoaderStart');

            //Set all the serach parameters
            $scope.params = $routeParams;

            // To get search key result
            getSearchKeyWord($scope.params);


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
                    $scope.params.rating = arr.join();
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

                    /* status to check if there is some result */

                    $scope.isResultNumber = (data == 'null')?0:1;

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

            /**
             * Search for a keywod
             */
            $scope.searchKey = function(e){

                if(e.charCode === 13 && $scope.params.searchTerm.length > 0){
                    $scope.initiateSearch();
                }
            };

            /**
             * Master search function
             */
            $scope.initiateSearch = function(e){
                if($scope.params.searchTerm.length < 1){
                    return false;
                }

                var modifyValue = [
                    'homeDelivery',
                    'parkingStatus',
                    'openStatus'
                ];
                var searchStr = "";
                for(var prop in $scope.params){
                    if($scope.params.hasOwnProperty(prop)){
                        if(modifyValue.indexOf(prop) !== -1){
                            var val = ($scope.params[prop] == true) ? 1:0;
                            var attr = prop + '=' + val +'&'
                            searchStr += attr;
                        }
                        else{
                            searchStr += (prop + '=' + encodeURIComponent($scope.params[prop])+'&');
                        }
                    }
                }
                $location.url('/searchResult?'+searchStr);
            };
        }
    ]);