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
            $scope.loggedInUserEzeone = $rootScope._userInfo.ezeone_id;
            /* Loading the messages */
            $scope.dashBoardMsg = [];

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////GET GROUPS & INDIVIDUALS////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            $scope.groupListData = [];
            $scope.individualMember = [];
            /* pending list init */
            $scope.pendingRequestCount = 0;
            $scope.pendingRequestData = [];

            /* Mark as read/unread check box */
            $scope.selectedMsgIdArray = [];
            $scope.selectAllCheckBoxChecked = false;

            $scope.DashBoardOptions = [
                {
                    val:2,
                    text:"Mark as Unread"
                },  {
                    val:1,
                    text:"Mark as Read"
                },  {
                    val:3,
                    text:"Move to Trash"
                }
            ];
            $scope.markId = 0;
            $scope.filterDropDown = 0;
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////Default Function Calls//////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            loadDashBoardMessages();
            getPendingRequestUserList();

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

            /**
             * Function to MARK/UNMARK the message
             */
            $scope.checkBoxAction = function(tid)
            {
                $scope.selectAllCheckBoxChecked = false;

                if ($scope.selectedMsgIdArray[tid])
                    $scope.selectedMsgIdArray[tid] = false;
                else
                    $scope.selectedMsgIdArray[tid] = true;

                console.log($scope.selectedMsgIdArray);

            }

            /**
             * Select all check boxes of message ACTION
             */
            $scope.selectAllCheckBoxAction = function()
            {
                var totalResLength = $scope.dashBoardMsg.length;
                var count = 0;
                $scope.selectedMsgIdArray.forEach(function(data,key){
                    if($scope.selectedMsgIdArray[key])
                    {
                        count++;
                    }
                });

                if(parseInt(count) != parseInt(totalResLength))
                {
                    /* select All */
                    selectAllCheckBox();
                    $scope.selectAllCheckBoxChecked = true;
                }
                else
                {
                    /* clear all */
                    $scope.selectedMsgIdArray = [];
                    $scope.selectAllCheckBoxChecked = false;
                }
            }

            /**
             * parsing through all the checkboxes array and making each of them true
             */
            function selectAllCheckBox()
            {
                $scope.dashBoardMsg.forEach(function(data){
                    $scope.selectedMsgIdArray[data.tid] = true;
                });
            }

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////GET GROUPS & INDIVIDUALS////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /**
             * Get all the groups
             */
            function getGroups()
            {
                getGroupApiCall().then(function(data){
                    if(!data || !data.length)
                        return;

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
             * Load all the recent messages
             */
            function loadDashBoardMessages()
            {
                loadMessageApi().then(function(data){
                    $scope.dashBoardMsg = data;
                });

            }

            /**
             * get all the pending requests for the logged in user
             */
            function getPendingRequestUserList()
            {
                loadPendingRequestApi().then(function(data){
                    if(!data)
                    {
                        return;
                    }
                    $scope.pendingRequestData = data;
                    /* get the pending list count */
                    var count = 0;
                    data.forEach(function(val){
                        if(parseInt(val.requester) == 2)
                        {
                            count++;
                            $scope.pendingRequestData.push(val);
                        }
                    });
                    $scope.pendingRequestCount = count;
                });
            }

            /**
             * redirect to detail page
             */
            $scope.redirectPage  = function(msgId)
            {
                messageActivityApi(msgId,1).then(function() {
                    $location.url('/message/details?msg=' + msgId);
                });
            }


            /**
             * Message activity init.
             * @param activityType: 1:Read, 2:Unread, 3:Trash
             */
            $scope.messageActivityInit = function(activityType)
            {
                /* validation */
                if(!$scope.selectedMsgIdArray.length > 0)
                {
                    return ;
                }
                /* get csv msg id for action */
                var selectedMsgId = convertSelectedMessageToCsv(activityType);

                messageActivityApi(selectedMsgId,activityType).then(function(){
                        Notification.success({ message: "Your action is saved successfully", delay: MsgDelay });
                        $scope.selectedMsgIdArray = [];
                },
                function(){
                    Notification.error({ message: "Something went wrong! Try again later", delay: MsgDelay });
                });
            }


            /**
             * Convert selected messages id array to csv format
             * @returns {string}
             */
            function convertSelectedMessageToCsv(activityType)
            {
                var arr = [];
                /* traverse */
                $scope.selectedMsgIdArray.forEach(function(data,key){
                    if(data)
                    {
                        arr.push(key);
                        changeLiveData(key,activityType);
                    }
                });
                return arr.join(',');
            }

            /**
             * Change the live data in DOM after getting response from API call to change status
             */
            function changeLiveData(key,status)
            {
                var index = $scope.dashBoardMsg.indexOfWhere('tid',key);
                if(parseInt(status) == 3)//Move to trash || remove the list
                {
                    $scope.dashBoardMsg.splice(index,1);
                    return;
                }
                $scope.dashBoardMsg[index].status = status;
            }

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////ALL API CALLS///////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
             * Call load DASHOARD messages API
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

            /**
             * get all the messages for INBOX API
             * @param messageType:1->Group message, 0->Individual message
             * @param groupOrIndividualId: TID of the group or indivdual
             * @returns {*}
             */
            function loadGroupMsgApi(messageType,groupOrIndividualId)
            {
                var defer = $q.defer();
                $http({
                    url : GURL + 'load_group_message',
                    method : "GET",
                    params :{
                        token : $rootScope._userInfo.Token,
                        id : groupOrIndividualId,
                        group_type: messageType
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
             * Get the list of all the  groups or individuals with pending request
             * @returns {*}
             */
            function loadPendingRequestApi()
            {
                var defer = $q.defer();
                $http({
                    url : GURL + 'pending_request',
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
             * Api to handle all the request to [mark as read,mark as unread,trash]
             * @param messageId: message ID of the messages for which this request is called
             * @param status:: 1: read, 2: unread., 3:Trash
             * @param trash: 1:YES, 0: NO
             */
            function messageActivityApi(messageId,status)
            {
                var defer = $q.defer();
                $http({
                    url : GURL + 'message_activity',
                    method : "put",
                    data :{
                        token : $rootScope._userInfo.Token,
                        message_id:messageId,
                        status:status
                    }
                }).success(function(resp){
                    $scope.$emit('$preLoaderStop');
                    if(!resp.status)
                    {
                        defer.resolve(resp.status);
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
        }]);