/**
 * Controller to manage all the functionaloties in OUTBOX
 *
 * @author: Sandeep[EZE ID]
 * @since 20150526
 */
angular.module('ezeidApp').
    controller('outboxPageCtrl', [
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
            $scope.result = '';


            /* All Variable declaration goes here */
            $scope.resultPerPage = 5;
            $scope.nextResultId = 0;
            $scope.totalResult = false;
            $scope.paginationStatus = false;
            $scope.paginationNext = false;
            $scope.paginationPrevious = false;
            $scope.activeDetailedTransaction = '';
            $scope.activeDetailedTransactionContent = '';



            getTransactionHistory();
            /* http request to get all the transaction history */
            function getTransactionHistory()
            {
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'get_outbox_messages',
                    method : "GET",
                    params :{
                        Token : $rootScope._userInfo.Token,
                        pagesize:$scope.resultPerPage,
                        pagecount:$scope.nextResultId
                    }
                }).success(function(resp){

                    $scope.$emit('$preLoaderStop');
                    if(resp.status)
                    {
                        if(!$scope.totalResult)
                        {
                            totalResult = resp.data.count;
                            resetPaginationStatus();
                        }

                        $scope.result = resp.data;
                    }
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                });

            }

            $scope.convertTimeToLocal = function(dateTime)
            {
                return UtilityService.convertTimeToLocal(dateTime)
            }

            /* toggle modal visibility */
            $scope.modalVisible = false;
            $scope.modalVisibility = function () {
                /* toggle map visibility status */
                $scope.modalVisible = !$scope.modalVisible;
            };

            /* detail modal goes here */
            $scope.modalBox = {
                title : 'Message Details',
                class : 'business-manager-modal'
            };

            $scope.initiateDetail = function(tid)
            {
                $scope.modalVisibility();
                setDetailedTransaction(tid);
                setBasicTransactionInfo(tid);
            };

            /**
             * Reset the pagination status
             */
            function resetPaginationStatus()
            {
                if($scope.totalResult <= $scope.resultPerPage)
                {
                    $scope.paginationStatus = false;
                }
                else
                {
                    $scope.paginationStatus = true;
                }
            }

            /**
             * pagination: show next result
             */
            $scope.getNextResultPage = function()
            {
                $scope.nextResultId += $scope.resultPerPage;
                /* just get the next result */
                getTransactionHistory();
                reConfigurePaginationButton();
            }

            /**
             * Pagination: show previous 20 results
             */
            $scope.getPreviousResultPage = function()
            {
                $scope.nextResultId -= $scope.resultPerPage;
                /* just get the next result */
                getTransactionHistory();
                reConfigurePaginationButton();
            }

            /**
             * Reset the status of the pagination button
             */
            function reConfigurePaginationButton()
            {
                if(($scope.nextResultId+$scope.resultPerPage) > $scope.totalResult)
                {
                    $scope.paginationNext = false;
                    $scope.paginationPrevious = true;
                }
                else if(($scope.nextResultId+$scope.resultPerPage) < $scope.totalResult && ($scope.nextResultId+$scope.resultPerPage) > $scope.resultPerPage)
                {
                    $scope.paginationNext = true;
                    $scope.paginationPrevious = true;
                }
                else
                {
                    $scope.paginationNext = true;
                    $scope.paginationPrevious = false;
                }
            }

            /**
             * Get the details of a particular transaction
             */
            function setDetailedTransaction(tid)
            {
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'ewtGetTranscationItems',
                    method : "GET",
                    cache: false,
                        params :{
                        Token : $rootScope._userInfo.Token,
                        MessageID: tid
                    }
                }).success(function(resp){

                    $scope.$emit('$preLoaderStop');
                    if(resp.status)
                    {
                        console.log(resp);
                    }
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                });
            }

            /**
             * Set the details of the current selected
             */
            function setBasicTransactionInfo()
            {
                
            }

        }]);