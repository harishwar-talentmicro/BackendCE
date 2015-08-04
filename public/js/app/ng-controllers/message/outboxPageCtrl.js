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
                class : 'business-manager-modal',
                groupDesc : '',
                isPublicGroup : false,
                selectedRelation:0
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
            $scope.groupNameDisable = false;
            /* post creation of group */
            $scope.activeGroupId = 0;
            $scope.isEzeOneIdValid = true;
            /* Add member */
            $scope.addMemberDisabled = true;
            $scope.saveGroupBtnDisabled = true;
            $scope.activeEzeOneId = 0;
            $scope.activeEzeOneName = "";
            $scope.isAdmin = false;

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
                    viewGroup : false,
                    requestContact : false
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


            $scope.groupMember = [];


            ///////////////////////////////////////////////////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////////////////////////

            resetSuggestions();
            resetDefaultSettings();


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
                    $scope.isAdmin = true;
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



            /**
             * Validate the group's relation to the logged in user [called from DOM]
             */
            $scope.groupSearchAction = function()
            {
                var groupName = $('#group-name').val();
                if(!parseInt(groupName.length) > 0)
                {
                    negetiveGroupNameAction();
                    return ;
                }
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
                    if(resp.data[0].status && resp.data[0].status == -1)
                    {
                        /* Group name is Unique: passed the validity test! */
                        $scope.isGroupNameUnique = true;
                        changeCheckBtn(2);
                        $scope.groupDescVisible = true;
                        $scope.saveGroupBtnDisabled = false;
                        $('#group-check-btn').focus();
                    }
                    else
                    {
                        /* already existing group name */
                        negetiveGroupNameAction();
                        $scope.saveGroupBtnDisabled = true;
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
                $scope.activeGroupId = 0;
                $scope.activeEzeOneId = 0;
                $scope.activeEzeOneName = "";
                $scope.groupSuggestionOpen = false;
                $scope.checkBtnIcon = 1;//1:fa-search,2:fa-check
                $scope.accessToken = 2;
                $scope.groupName = "";
                $('#group-name').val($scope.groupName);
                $scope.isGroupNameUnique = true;
                $scope.addMemberDisabled = true;
                $scope.saveGroupBtnDisabled = true;
                $scope.groupMember = [];
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
                        viewGroup : false,
                        requestContact : false
                    }
                ];
            }

            /**
             * Select a group from a suggestion list [called from DOM]
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
             * Create a group API calls [called from DOM]
             */
            $scope.createGroupRequest = function()
            {
                var groupName = $('#group-name').val();
                var groupType = getGroupNameType(groupName);
                $http({
                    url : GURL + 'create_group',
                    method : "POST",
                    data :{
                        token : $rootScope._userInfo.Token,
                        group_name:groupName,
                        group_type:groupType,
                        about_group:$scope.modalBox.groupDesc,
                        auto_join:$scope.modalBox.isPublicGroup?1:0,
                        tid:0
                    }
                }).success(function(resp){

                    $scope.$emit('$preLoaderStop');
                    if(resp.data.id && resp.data.id > 0)
                    {
                        $scope.activeGroupId = resp.data.id;
                        $scope.groupNameDisable = true;
                        toggleCreateGroupFormVisibility(1);
                    }
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                });
            }

            /**
             * Toggle visibility of (description and public checkbox) with (member - add form)
             */
            function toggleCreateGroupFormVisibility(code)
            {

                if(parseInt(code) === 1)
                {
                    /* show group table */
                    $scope.groupMemberVisible = true;
                    /* hide description & public check Box */
                    $scope.groupDescVisible = false;
                    /* hide create group btn */
                    $scope.groupCreateBtnVisible = false;
                }
                else /* hide member add-form module */
                {
                    /* hide group table */
                    $scope.groupMemberVisible = false;
                    /* show  description & public check Box */
                    $scope.groupDescVisible = true;
                }
            }

            /**
             * API call for validating EZEONE ID [called from DOM]
             * @return: 1: valid [test passed],
             *          2: invalid ezeone
             *          3: mapping already exists
             */
            $scope.validateEzeOneId = function(ezeone)
            {
                console.log(ezeone);
                var ezeone = parseInt(getGroupNameType(ezeone)) ==  0?"@"+ezeone:ezeone;
                $('#ezeone-id').val(ezeone);
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'validate_groupname',
                    method : "GET",
                    params :{
                        group_name:ezeone,
                        token : $rootScope._userInfo.Token,
                        group_type: 1
                    }
                }).success(function(resp){
                    $scope.$emit('$preLoaderStop');
                    if(resp.data[0].status && resp.data[0].status == -1)
                    {
                        /* Group name is Unique: passed the validity test! */
                        ezeOneValidationAction(1);
                        $scope.activeEzeOneId = resp.data[0].masterid;
                        $scope.activeEzeOneName = resp.data[0].name;
                    }
                    else if(resp.data[0].status && resp.data[0].status == -2)
                    {
                        /* EZEONE does not exists */
                        ezeOneValidationAction(2);
                        $scope.activeEzeOneId = 0;
                        $scope.activeEzeOneName = "";
                        Notification.error({ message: "EZEONE doesn't exists in the system", delay: MsgDelay });
                    }
                    else
                    {
                        ezeOneValidationAction(3);
                        $scope.activeEzeOneId = 0;
                        $scope.activeEzeOneName = "";
                        Notification.error({ message: "You are already connected to this user", delay: MsgDelay });
                    }
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                });
            }


            /**
             * Take action on the basis of the response you got from the validation of the EZEONE ID
             */
            function ezeOneValidationAction(code)
            {
                $scope.addMemberDisabled = false;
                if(parseInt(code) === 1)
                {
                    $scope.addMemberDisabled = true;
                    $scope.isEzeOneIdValid = true;
                    $scope.addMemberDisabled = false;
                    $('#ezeone-relationship').focus();
                }
                else
                {
                    $scope.isEzeOneIdValid = false;
                    $scope.addMemberDisabled = true;
                }
            }

            /**
             * invalidate ezeoneId
             */
            $scope.invalidateEzeOneId = function()
            {
                $scope.addMemberDisabled = true;
            }

            $scope.invalidateGroupId = function()
            {
                $scope.saveGroupBtnDisabled = true;
            }

            /**
             * Add individual member into group member
             */

            $scope.addMember = function()
            {
                if(!parseInt($scope.activeEzeOneId)>0)
                {
                    Notification.error({ message: "Please select the group member once again", delay: MsgDelay });
                    return;
                }
                /* check for repetition */
                if(parseInt($scope.groupMember.indexOfWhere('id',$scope.activeEzeOneId)) >= 0)
                {
                    Notification.error({ message: "You can't add the same member again", delay: MsgDelay });
                    return;
                }
                var temp = {
                    name:$scope.activeEzeOneName,
                    relation:$scope.modalBox.selectedRelation,
                    id:$scope.activeEzeOneId
                };
                /* Add group member */
                addMemberApiCall().then(function(){/////////////////////////////@todo
                    $scope.groupMember.push(temp);
                    addMemberForm();
                });
            }

            /**
             * clear add-member form
             */
            function addMemberForm()
            {
                $scope.activeEzeOneName = "";
                $scope.modalBox.selectedRelation = 0;
                $scope.activeEzeOneId = 0;
                $('#ezeone-id').val('');
                $scope.addMemberDisabled = true;
            }

            /**
             * Remove a group member  while creating group
             */
            $scope.removeMemberAtGroupCreation = function(id)
            {
                var index = $scope.groupMember.indexOfWhere('id',id);
                console.log(index);
                if(index >= 0)
                {
                    $scope.groupMember.splice(index,1);
                    return;
                }
                Notification.error({ message: "Failed to remove this member, Try again later", delay: MsgDelay });
            }

            /**
             * Add member API call
             */
            function addMemberApiCall()
            {
                var defer = $q.defer();
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'create_group',
                    method : "POST",
                    data :{
                        group_id : $scope.activeGroupId,
                        member_id : $scope.activeEzeOneId,
                        relation_type : $scope.modalBox.selectedRelation
                    }
                }).success(function(resp){

                    $scope.$emit('$preLoaderStop');
                    console.log(resp);
                    defer.resolve();
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                    defer.resolve();
                });
                return defer.promise;
            }

            /**
             * Remove member API call
             */
            function removeMemberApiCall()
            {

            }
        }]);