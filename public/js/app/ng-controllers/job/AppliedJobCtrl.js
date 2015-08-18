/**
 * Controller to view all the Applied Job
 *
 * @author: Krunal[EZE ONE]
 * @since 20150801
 */
angular.module('ezeidApp').
    controller('AppliedJobCtrl', [
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

            //Pagination settings
            $scope.pageSize = 10;//Results per page
            $scope.pageCount = 0;//Everything starts with a 0 - 10,20,30 etc.
            $scope.totalResult = 0;//Total results
            $scope.resultThisPage = 0;//Total results you got this page

            getAppliedJob();

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

            // Get Applied Job list
            function getAppliedJob()
            {
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'applied_job',
                    method : 'GET',
                    params : {
                        token : $rootScope._userInfo.Token,
                        page_size : $scope.pageSize,
                        page_count : $scope.pageCount
                    }
                }).success(function(resp){
                    $scope.$emit('$preLoaderStop');

                    if(resp.status)
                    {
                        if(resp.data.length)
                        {
                            $scope.totalResult = resp.count;
                            $scope.resultThisPage = resp.data.length;

                            $scope.paginationVisibility();

                            $scope.jobData = resp.data;
                            for(var nCount = 0; nCount < resp.data.length; nCount++)
                            {
                                /*resp.data[nCount].TaskDateTime = convertTimeToLocal(resp.data[nCount].TaskDateTime,'DD-MMM-YYYY hh:mm A','DD-MMM-YYYY hh:mm A');*/
                                  resp.data[nCount].TaskDateTime = UtilityService.convertTimeToLocal(resp.data[nCount].TaskDateTime);
                            }
                        }
                    }
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                });
            }

            /*Code for pagging*/
            /**
             * Incerement the page count of the pagination after every pagination: NEXT
             */
            function incrementPageCount()
            {
                $scope.pageCount += $scope.pageSize;
            }

            /**
             * Decrement the page count of the pagination after every pagination: PREVIOUS
             */
            function decrementPageCount()
            {
                $scope.pageCount -= $scope.pageSize;
            }

            /**
             * load the next results
             */
            $scope.paginationNextClick = function()
            {
                $scope.pageCount += $scope.pageSize;
                /* trigger next results */
                // $scope.triggerSearch(1);
                getAppliedJob();
                $scope.paginationVisibility();
            }

            /**
             * load the previous results
             */
            $scope.paginationPreviousClick = function()
            {
                $scope.pageCount -= $scope.pageSize;
                /* trigger previous results */
                // $scope.triggerSearch(1);
                getAppliedJob();
                $scope.paginationVisibility();
            }

            /**
             * Toggle the visibility of the pagination buttons
             */
            $scope.paginationPreviousVisibility = false;
            $scope.paginationNextVisibility = false;

            $scope.paginationVisibility = function()
            {
                var totalResult = parseInt($scope.totalResult);
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
                else
                {
                    $scope.paginationNextVisibility = true;
                    $scope.paginationPreviousVisibility = true;
                }
            }

        }]);