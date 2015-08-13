/**
 * Responsible for loading and do various action on outbox message
 *
 * @author: Sandeep[EZE ID]
 * @since 20150812
 */
angular.module('ezeidApp').
    controller('OutboxMessageCtrl', [
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
            UtilityService
        ) {
            console.log("outbox message loaded");
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////INITIALIZATIONS/////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /* Loading the messages */
            $scope.outboxMsg = [];
            /* pagination settings */
            $scope.pageSize = 10;
            $scope.pageCount = 0;
            $scope.totalMessage = 0;
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////DEFAULT CALLS///////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            loadOutboxMessage();

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////ACTION//////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function loadOutboxMessage()
            {
                loadOutboxMessageApi().then(function(data){
                    if(!data.length > 0)
                        return;

                    $scope.totalMessage = data[0].count;
                    $scope.outboxMsg = data;
                    paginationVisibility();
                });
            };


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////PAGINATION CODE/////////////////////////////////////////////////////////////////
            /**
             * load the next results
             */
            $scope.paginationNextClick = function()
            {
                $scope.pageCount += $scope.pageSize;
                /* trigger next results */
                loadOutboxMessage();
                paginationVisibility();
            }

            /**
             * load the previous results
             */
            $scope.paginationPreviousClick = function()
            {
                $scope.pageCount -= $scope.pageSize;
                /* trigger previous results */
                loadOutboxMessage();
                paginationVisibility();
            }

            /**
             * Toggle the visibility of the pagination buttons
             */
            $scope.paginationNextVisibility = true;
            $scope.paginationPreviousVisibility = true;
            function paginationVisibility()
            {
                var totalResult = parseInt($scope.totalMessage);
                var currentCount = parseInt($scope.pageCount);
                var resultSize = parseInt($scope.pageSize);

                /* initial state */
                if((totalResult < (currentCount+resultSize)) && currentCount == 0)
                {
                    $scope.paginationNextVisibility = false;
                    $scope.paginationPreviousVisibility = false;
                }
                else if(currentCount == 0)
                {
                    $scope.paginationNextVisibility = true;
                    $scope.paginationPreviousVisibility = false;
                }
                else if((currentCount + resultSize) >= totalResult)
                {
                    $scope.paginationNextVisibility = false;
                    $scope.paginationPreviousVisibility = true;

                }
                else{
                    $scope.paginationNextVisibility = true;
                    $scope.paginationPreviousVisibility = true;

                }
            };

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////API CALLS///////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            /**
             * Api call for loading all the messages which user have ever sent to some one
             */
            function loadOutboxMessageApi()
            {
                var defer = $q.defer();
                $http({
                    url : GURL + 'outbox_messages',
                    method : "GET",
                    params :{
                        token : $rootScope._userInfo.Token,
                        ezeone_id:$rootScope._userInfo.ezeone_id,
                        page_size: $scope.pageSize,
                        page_count:$scope.pageCount

                    }
                }).success(function(resp){

                    $scope.$emit('$preLoaderStop');

                    if(!resp.status)
                    {
                        defer.reject();
                        return defer.promise;
                    }

                    defer.resolve(resp.data);
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                    defer.reject();
                });
                return defer.promise;
            }


        }
    ]);