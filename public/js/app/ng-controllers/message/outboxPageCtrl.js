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

            console.log("SAi1");
            console.log($routeParams.action);
            console.log("SAi2");

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

            $scope.modalAddGroupVisible = false;
            /* toggle Add/edit Group Popup */
            $scope.modalAddGroupVisibility = function (code) {
                $scope.modalAddGroupVisible = !$scope.modalAddGroupVisible;
                resetDefaultSettings();
                if(parseInt(code) == 1)//Create new group
                {
                    $scope.groupFormVisible = true;
                    $scope.groupCreateBtnVisible = true;
                    $scope.groupMemberVisible = false;
                    $scope.groupDescVisible = false;
                    $scope.joinGroupBtnVisible = false;
                    $scope.editGroupBtnVisible = false;
                    $scope.deleteGroupBtnVisible = false;
                    ////////////////////////////////////
                    resetModule();
                    $scope.module.createGroup = true;
                }
                else if(code == 2)//join group
                {
                    $scope.groupFormVisible = true;
                    $scope.groupCreateBtnVisible = false;
                    $scope.groupMemberVisible = false;
                    $scope.groupDescVisible = false;
                    $scope.joinGroupBtnVisible = true;
                    $scope.editGroupBtnVisible = false;
                    $scope.deleteGroupBtnVisible = false;
                    ////////////////////////////////////
                    resetModule();
                    $scope.module.joinGroup = true;
                }
                else if(code == 3)//edit group
                {
                    $scope.groupFormVisible = true;
                    $scope.groupCreateBtnVisible = false;
                    $scope.groupMemberVisible = false;
                    $scope.groupDescVisible = false;
                    $scope.joinGroupBtnVisible = false;
                    $scope.editGroupBtnVisible = true;
                    $scope.deleteGroupBtnVisible = false;
                    ////////////////////////////////////
                    resetModule();
                    $scope.module.editGroup = true;
                }
            };

            /* modal box for loading Add/edit/join Group */
            $scope.modal = {
                title: 'Groups',
                class: 'business-manager-modal'
            };


            /***********************************************************************************************************
             /***********************************************************************************************************
             /***********************************************************************************************************
             * GROUP JS goes here
             /***********************************************************************************************************
             /***********************************************************************************************************
             /***********************************************************************************************************/


            /***********************************************************************************************************
             * All Initialization goes here
             * @type {string[]}
             */
            $scope.isGroupAdmin = false;
            $scope.isMember = false;
            $scope.isNewGroup = true;
            $scope.isGroupNameUnique = false;
            $scope.groupActionBtn = [
                "Delete Group",
                "Leave Group",
                "Create Group"
            ];

            $scope.isPublicGroup = false;


            /* module visibility variable *//////////////////////////////
            $scope.groupFormVisible = true;
            $scope.groupCreateBtnVisible = true;
            $scope.groupMemberVisible = false;
            $scope.groupDescVisible = false;
            $scope.joinGroupBtnVisible = true;
            $scope.editGroupBtnVisible = false;
            $scope.deleteGroupBtnVisible = false;
            /////////////////////////////////////////////////////////////
            ///////////////////MODULES///////////////////////////////////
            $scope.module = [
                {
                    joinGroup : false,
                    createGroup : false,
                    editGroup : false,
                    viewGroup : false
                }
            ];

            $scope.relationArr = [
                "No Relation",
                "Friend",
                "Colleague",
                "Business",
                "Classmate",
                "Mentor/Teacher",
                "Family",
                "Community"
            ];


            $scope.dummyMember = [
                {
                    name: "ashley",
                    relation: 3,
                    tid:4
                },
                {
                    name: "allex",
                    relation: 5,
                    tid:6
                },
                {
                    name: "jacob",
                    relation: 3,
                    tid:7
                },
            ];


            /////////////////////////////////////////////////////////////

            resetSuggestions();
            resetDefaultSettings();

            /**
             * Validate the group's relation to the logged in user
             */
            $scope.groupSearchAction = function()
            {
                var groupName = $('#group-name').val();
                if(!parseInt(groupName.length) > 0)
                {
                    negetiveGroupNameAction();
                    return ;
                }
                console.log('hello');
                //For group creation module
                if($scope.module.createGroup)
                {
                    checkGroupNameUniqueness(groupName);
                }
                else if($scope.module.editGroup)
                {
                    /* call API for fetching suggestion */
                    getSuggestionList(groupName);
                }
                else if($scope.module.viewGroup)
                {
                    /* call API for fetching suggestion */
                    getSuggestionList(groupName);
                }
                else if($scope.module.joinGroup)
                {
                    /* call API for fetching suggestion */
                    getSuggestionList(groupName);
                }
            }

            /**
             * Get the group type
             * 0: group
             * 1: EZEOne ID
             */
            function getGroupNameType(groupName)
            {
                var grp = groupName.toString();
                var grpArr = grp.split("");
                if(grpArr[0] == '@')
                {
                    return 1;
                }
                else
                {
                    return 0;
                }
            }

            /**
             * Action when group name is already exists or name alreay there
             */
            function negetiveGroupNameAction()
            {
                $scope.isGroupNameUnique = false;
                changeCheckBtn(1);
                $scope.groupDescVisible = false;
                return;
            }

            /**
             * API call for checking weather the group name is unique or not
             */
            function checkGroupNameUniqueness(groupName)
            {
                $http({
                    url : GURL + 'validate_groupname',
                    method : "GET",
                    params :{
                        group_name:groupName,
                        token : $rootScope._userInfo.Token,
                        group_type: getGroupNameType(groupName)
                    }
                }).success(function(resp){

                    $scope.$emit('$preLoaderStop');
                    console.log(resp.data[0].status);
                    if(resp.data[0].status && resp.data[0].status == -1)
                    {
                        $scope.isGroupNameUnique = true;
                        changeCheckBtn(2);
                        $scope.groupDescVisible = true;
                    }
                    else
                    {
                        negetiveGroupNameAction();
                    }
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                });
            }

            /**
             * Event to trigger event on change of access control
             */
            $scope.accessCtrlChange = function(val)
            {
                $scope.accessToken = val;
            }

            /**
             * API call to get the suggestion list
             */
            function getSuggestionList(keyword)
            {
                $http({
                    url : GURL + 'suggestion_list',
                    method : "GET",
                    params :{
                        keywordsForSearch:keyword,
                        token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){

                    $scope.$emit('$preLoaderStop');
                    if(resp.data)
                    {
                        moduleWiseAction(1,resp.data);
                    }
                    else
                    {
                        moduleWiseAction(2,resp.data);
                    }
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                    defer.resolve();
                });
            }

            /**
             * Module-wise ACTIONS based on the search result
             * 1:Found result
             * 2:No result Found
             */
            function moduleWiseAction(resType,data)
            {
                if(parseInt(resType) == 1)//Result Found
                {
                    setSuggestionListData(data);
                }
                else//No Result Found
                {
                    $scope.groupSuggestionOpen = false;
                    changeCheckBtn(1);
                    console.log("No result found");
                }
            }

            /**
             * set the response data and show suggestion list
             */
            function setSuggestionListData(data)
            {
                /* show suggestions if the request is not for creating new group */
                $scope.groupSuggestionOpen = true;
                $scope.suggestedGroup = data;
            }

            /**
             * reset the data for group suggestions
             */
            function resetSuggestions()
            {
                $scope.suggestedGroup = [];
            }

            /**
             * reset all default settings
             */
            function resetDefaultSettings()
            {
                $scope.groupSuggestionOpen = false;
                $scope.checkBtnIcon = 1;//1:fa-search,2:fa-check
                $scope.accessToken = 2;
                $scope.groupName = "";
                $('#group-name').val($scope.groupName);
                $scope.isGroupNameUnique = true;
            }

            /**
             * Reset modules
             */
            function resetModule()
            {
                $scope.module = [
                    {
                        joinGroup : false,
                        createGroup : false,
                        editGroup : false,
                        viewGroup : false
                    }
                ];
            }

            /**
             * Select a group from a suggestion list
             */
            $scope.selectGroupFromSuggestionList = function(index)
            {
                var isAdmin = parseInt($scope.suggestedGroup[index].isAdmin) > 0?true:false;
                var isMember = parseInt($scope.suggestedGroup[index].isMember) > 0?true:false;
                /* populate the input box with the selected input */
                $scope.groupName = $scope.suggestedGroup[index].GroupName;
                $('#group-name').val($scope.groupName);
                /* close the suggestion */
                $scope.groupSuggestionOpen = false;
                /* change the check btn icon */
                changeCheckBtn(2);
            }

            /**
             * Change the check btn
             */
            function changeCheckBtn(code)
            {
                $scope.checkBtnIcon = code;
            }

            /**
             * Create a group
             */
            $scope.createGroupRequest = function()
            {
                $http({
                    url : GURL + 'create_group',
                    method : "POST",
                    params :{
                        token : $rootScope._userInfo.Token,
                        group_name:grp,
                        group_type:grp,
                        about_group:grp,
                        auto_join:grp,
                        member_id:grp,
                    }
                }).success(function(resp){

                    $scope.$emit('$preLoaderStop');
                    if(resp.data)
                    {
                        moduleWiseAction(1,resp.data);
                    }
                    else
                    {
                        moduleWiseAction(2,resp.data);
                    }
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                    defer.resolve();
                });
            }
        }]);