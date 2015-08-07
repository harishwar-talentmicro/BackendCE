/**
 * Controller to manage all the functionaloties in OUTBOX
 *
 * @author: Sandeep[EZE ID]
 * @since 20150526
 */
angular.module('ezeidApp').
    controller('OutboxPageCtrl', [
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
            /* defaultly getting all the transactions for SALES module */
            $scope.presentSelectedModule = 0;
            $scope.groupDesc1 = "";

            /* All Variable declaration goes here */
            $scope.resultPerPage = 5;
            $scope.nextResultId = 0;
            $scope.totalResult = false;
            $scope.paginationStatus = false;
            $scope.paginationNext = false;
            $scope.paginationPrevious = false;
            $scope.activeTransactionBasicInfo = '';
            $scope.activeTransactionDetailedInfo = '';
            $scope.permissiontype = '';

            /* Loading the messages */
            $scope.dashBoardMsg = [];

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////GET GROUPS & INDIVIDUALS////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            $scope.groupListData = [];
            $scope.individualMember = [];

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////Default Function Calls//////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            loadDashBoardMessages();

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////ACTION//////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            $scope.inboxListing = "html/message/inbox.html";
            $scope.composeMessage = "html/message/composeMessage.html";
            $scope.detailMessage = "html/message/detailMessage.html";

            $scope.chatMessage = "html/chat/chatMessage.html";

            if($routeParams.action)
            {
                if($routeParams.action == 'compose')
                {
                    $scope.activeTemplate = $scope.composeMessage;
                    $scope.titleText = "Compose";
                }
                else if ($routeParams.action == 'inbox')
                {
                    $scope.activeTemplate = $scope.inboxListing;
                    $scope.titleText = "Inbox";
                }
                else if ($routeParams.action == 'details')
                {
                    $scope.activeTemplate = $scope.detailMessage;
                    $scope.titleText = "Details";
                }
                else
                {
                    $scope.activeTemplate = $scope.inboxListing;
                    $scope.titleText = "Inbox";
                }
            }
            else
            {
                // Default Inbox is selected
                $scope.activeTemplate = $scope.inboxListing;
                $scope.titleText = "Inbox";
            }

            /* initialization fot getting all the transaction history */
            getTransactionHistory().then(function(){
                reConfigurePaginationButton();
            });

            /**
             * getting all the groups of the logged in user
             */
            getGroups();

            /* http request to get all the transaction history */
            function getTransactionHistory()
            {
                var defer = $q.defer();
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'get_outbox_messages',
                    method : "GET",
                    params :{
                        Token : $rootScope._userInfo.Token,
                        pagesize:$scope.resultPerPage,
                        pagecount:$scope.nextResultId,
                        functiontype:$scope.presentSelectedModule
                    }
                }).success(function(resp){

                    $scope.$emit('$preLoaderStop');
                    if(resp.status)
                    {
                        if(!$scope.totalResult && resp.data.length > 0)
                        {
                            $scope.totalResult = resp.data[0].count;
                            resetPaginationStatus();
                        }
                        $scope.result = resp.data;
                        defer.resolve();
                    }
                    else
                    {
                        $scope.result = [];
                    }
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                    defer.resolve();
                });
                return defer.promise;
            }

            $scope.convertTimeToLocal = function(dateTime)
            {
                return UtilityService.convertTimeToLocal(dateTime)
            }

            $scope.checkIfEmpty = function(val,alternateText)
            {
                return UtilityService.checkIfEmpty(val,alternateText);
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
                class : 'business-manager-modal',
                groupDesc : '',
                isPublicGroup : false,
                selectedRelation:0,
                selectedJoinGroupRelation:0
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
                //$scope.$emit('$preLoaderStart');
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
                    $scope.activeTransactionDetailedInfo = resp;

                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                });
            }

            /**
             * Set the details of the current selected
             */
            function setBasicTransactionInfo(tid)
            {
                console.log($scope.result);
                /* getting the index of the clicked transaction, with the given tid */
                var selectedIndex = $scope.result.indexOfWhere('tid',tid);
                /* set basic info based on the index */
                $scope.activeTransactionBasicInfo = $scope.result[selectedIndex];
                /* set access rights */
                $scope.accessRight = $scope.activeTransactionBasicInfo.itemlisttype;
            }

            /**
             * Change the result for the selected module
             */
            $scope.changeSelectedModule = function(moduleId)
            {
                /* change the present selected module */
                $scope.presentSelectedModule = moduleId;
                /* change the outbox result and reconfigure pagination button */
                getTransactionHistory().then(function(){
                    reConfigurePaginationButton();
                });
            }

            /* modal box for loading Add/edit/join Group */
            $scope.modal = {
                title: 'Groups',
                class: 'business-manager-modal'
            };


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////GET GROUPS & INDIVIDUALS////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /**
             * Get all the groups
             */
            function getGroups()
            {
                getGroupApiCall().then(function(data){
                    data.forEach(function(val){
                        if(val.GroupType == 1)//Individual group
                        {
                            setIndividualMemerList(val);
                        }
                        else//normal group
                        {
                            setGroupListData(val);
                        }
                    });
                    console.log($scope.groupList);
                });
            }

            /**
             * set individual member data//@todo
             */
            function setIndividualMemerList(data)
            {
                $scope.individualMember.push(data);
            }

            /**
             * set group data
             */
            function setGroupListData(data)
            {
                $scope.groupListData.push(data);
            }
            /**
             * Call group ApI calls for getting all the groups of the logged in user
             */
            function getGroupApiCall()
            {
                var defer = $q.defer();
                $http({
                    url : GURL + 'group_list',
                    method : "GET",
                    params :{
                        token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){
                    $scope.$emit('$preLoaderStop');
                    defer.resolve(resp.data);
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                    defer.resolve();
                });

                return defer.promise;
            }

            /**
             * Load all the recent messages
             */
            function loadDashBoardMessages()
            {
                loadMessageApi().then(function(data){
                    $scope.dashBoardMsg = data;
                });

            }

            /**
             * Call load messages API
             */
            function loadMessageApi()
            {
                var defer = $q.defer();
                $http({
                    url : GURL + 'messagebox',
                    method : "GET",
                    params :{
                        token : $rootScope._userInfo.Token,
                        ezeone_id : $rootScope._userInfo.ezeone_id
                    }
                }).success(function(resp){
                    $scope.$emit('$preLoaderStop');
                    defer.resolve(resp.data);
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                    defer.resolve();
                });
                return defer.promise;
            }
        }]);