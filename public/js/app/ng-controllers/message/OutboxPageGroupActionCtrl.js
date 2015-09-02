/**
 * Controller to manage group actions
 *
 * @author: Sandeep[EZE ID]
 * @since 20150526
 */
angular.module('ezeidApp').
    controller('OutboxPageGroupActionCtrl', [
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
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            //////////////////////////////////////////CREATE GROUP//////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////INITIALIZATIONS/////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            $scope.modalAddGroupVisible = false;
            $scope.isGroupAdmin = false;
            $scope.isMember = false;
            $scope.isNewGroup = true;
            $scope.isGroupNameUnique = false;
            $scope.groupActionBtn = [
                "Delete Group",
                "Leave Group",
                "Create Group"
            ];
            $scope.memberStatus = [
                "Pending Request",
                "Active Member",
                "Rejected",
                "Left Group",
                "Removed"
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

            /* join group module */
            $scope.isAdmin = false;
            $scope.isMember = false;
            $scope.noSuggestionError = false;
            $scope.emptyGroupNameStringError = false;
            $scope.groupAdminMsg = false;
            $scope.groupJoinResponseBtn = false;
            $scope.pendingRequestMsg = false;

            /* module visibility variable */
            $scope.groupFormVisible = true;
            $scope.groupCreateBtnVisible = true;
            $scope.groupMemberVisible = false;
            $scope.groupMemberFormVisible = false;
            $scope.groupDescVisible = false;
            $scope.joinGroupBtnVisible = false;
            $scope.editGroupBtnVisible = false;
            $scope.deleteGroupBtnVisible = false;
            $scope.ezeOneValidationStatus = 0;
            $scope.ezeOneMembershipStatus = -1;
            $scope.isLoggedInUserRequeser = -1;
            $scope.currentGroupId = -1;
            $scope.groupDeleteBtn = false;


            /* modal box for loading Add/edit/join Group */
            $scope.joinGroupModal = {
                title: 'Groups',
                class: 'business-manager-modal',
                visible: false
            };

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///////////////////MODULES//////////////////////////////////////////////////////////////////////////////////
            $scope.module = [
                {
                    joinGroup: false,
                    createGroup: false,
                    editGroup: false,
                    viewGroup: false,
                    requestContact: false
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


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////default calls///////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            resetSuggestions();
            resetDefaultSettings();

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////THE MASTER FUNCTION/////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            $scope.hideMainModal = function()
            {
                $scope.joinGroupModal.visible = false;
            }

            $scope.toggleJoinGroupModal = function()
            {
                $scope.joinGroupModal.visible = !$scope.joinGroupModal.visible;
            }


            /* toggle Add/edit Group Popup */
            $scope.modalAddGroupVisibility = function (code) {
                //$scope.modalAddGroupVisible = !$scope.modalAddGroupVisible;
                $scope.groupNameDisable = false;
                resetDefaultSettings();
                if (parseInt(code) == 1)//Create new group
                {
                    $scope.groupFormVisible = true;
                    $scope.groupCreateBtnVisible = true;
                    $scope.groupDescVisible = false;
                    $scope.editGroupBtnVisible = false;
                    $scope.deleteGroupBtnVisible = false;
                    $scope.isAdmin = true;
                    ////////////////////////////////////
                    resetModule();
                    $scope.module.createGroup = true;
                }
                else if (code == 2)//join group
                {
                    $scope.groupFormVisible = true;
                    $scope.groupCreateBtnVisible = false;
                    $scope.groupDescVisible = false;
                    $scope.editGroupBtnVisible = false;
                    $scope.deleteGroupBtnVisible = false;
                    ////////////////////////////////////
                    resetModule();
                    $scope.module.joinGroup = true;
                }
                else if (code == 3)//edit group
                {
                    $scope.groupFormVisible = true;
                    $scope.groupCreateBtnVisible = false;
                    $scope.groupDescVisible = false;
                    $scope.editGroupBtnVisible = true;
                    $scope.deleteGroupBtnVisible = false;
                    ////////////////////////////////////
                    resetModule();
                    $scope.module.editGroup = true;
                }
            };

            /**
             *  Arrow key controls
             * @param keyId: ID of the pressed key
             */
            function arrowKeyControl(key)
            {

            }

            $scope.groupSubscriptionKeyPressEvent = function(keyId)
            {
                if(parseInt(keyId) == 13)
                    $scope.groupSearchAction();
                else if(parseInt(keyId) == 38 || parseInt(keyId) == 40)
                    arrowKeyControl(keyId);
            }
            /**
             * Validate the group's relation to the logged in user [called from DOM]
             */
            $scope.groupSearchAction = function () {
                var groupName = $('#group-name').val();
                if (!parseInt(groupName.length) > 0) {
                    emptyGroupNameAction();
                    enteredGroupNameInValidAction();
                    return;
                }
                //For group creation module
                if ($scope.module.createGroup) {
                    checkGroupNameUniqueness(groupName);
                }
                else if ($scope.module.editGroup) {
                    /* call API for fetching suggestion */
                    getSuggestionList(groupName);
                }
                else if ($scope.module.viewGroup) {
                    /* call API for fetching suggestion */
                    getSuggestionList(groupName);
                }
                else if ($scope.module.joinGroup) {
                    /* call API for fetching suggestion */
                    getSuggestionList(groupName);
                }
            }

            /**
             * Get the group type
             * 0: group
             * 1: EZEOne ID
             */
            function getGroupNameType(groupName) {
                var grp = groupName.toString();
                var grpArr = grp.split("");
                if (grpArr[0] == '@') {
                    return 1;
                }
                else {
                    return 0;
                }
            }

            /**
             * Action when group name is already exists or name alreay there
             */
            function emptyGroupNameAction() {
                $scope.emptyGroupNameStringError = true;
                $scope.isGroupNameUnique = false;
                changeCheckBtn(1);
                $scope.groupDescVisible = false;
                return;
            }

            /**
             * API call for checking weather the group name is unique or not
             */
            function checkGroupNameUniqueness(groupName) {

                var defer = $q.defer();
                var groupType = getGroupNameType(groupName);
                var groupId = getGroupNameType(groupName) == 0 ? $scope.activeGroupId : null;

                validateGroupNameApi(groupName,groupType,groupId).then(function(data){

                        if(!data)
                        {
                            defer.reject();
                            return defer.promise;
                        }

                        if (data[0].status && data[0].status == -1 || data[0].userstatus > 1) {
                            /* Group name is Unique: passed the validity test! */
                            $scope.isGroupNameUnique = true;
                            changeCheckBtn(2);
                            $scope.groupDescVisible = true;
                            $scope.saveGroupBtnDisabled = false;
                            $('#group-check-btn').focus();
                        }
                        else {
                            /* already existing group name */
                            emptyGroupNameAction();
                            $scope.saveGroupBtnDisabled = true;
                        }

                        defer.resolve(data);
                    },
                    function(){
                        //Error Occured
                        Notification.error({message: "Something went wrong! Check your connection", delay: MsgDelay});
                        defer.reject();
                    });

                return defer.promise;
            }

            /**
             * Event to trigger event on change of access control
             */
            $scope.accessCtrlChange = function (val) {
                $scope.accessToken = val;
            }

            /**
             * reset all default settings
             */
            function resetDefaultSettings() {
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
                $scope.groupRelationShipFormVisibility = false;
                $scope.joinGroupBtnVisible = false;
                $scope.leaveGroupBtnVisible = false;
                $scope.groupAdminMsg = false;
                $scope.groupMemberVisible = false;
                $scope.groupMemberFormVisible = false;
                $scope.isAdmin = false;
                $scope.isMember = false;
                $scope.groupJoinResponseBtn = false;
                $scope.pendingRequestMsg = false;
                $scope.groupDeleteBtn = false;
            }

            /**
             * Reset modules
             */
            function resetModule() {
                $scope.module = [
                    {
                        joinGroup: false,
                        createGroup: false,
                        editGroup: false,
                        viewGroup: false,
                        requestContact: false
                    }
                ];
            }

            /**
             * Change the check btn
             */
            function changeCheckBtn(code) {
                $scope.checkBtnIcon = code;
            }

            /**
             * Create a group API calls [called from DOM]
             */
            $scope.createGroupRequest = function () {
                var groupName = $('#group-name').val();
                var groupType = getGroupNameType(groupName);
                $http({
                    url: GURL + 'create_group',
                    method: "POST",
                    data: {
                        token: $rootScope._userInfo.Token,
                        group_name: groupName,
                        group_type: groupType,
                        about_group: $scope.modalBox.groupDesc,
                        auto_join: $scope.modalBox.isPublicGroup ? 1 : 0,
                        tid: 0
                    }
                }).success(function (resp) {
                    $scope.$emit('$preLoaderStop');
                    if (resp.data.id && resp.data.id > 0) {
                        $scope.activeGroupId = resp.data.id;
                        $scope.groupNameDisable = true;
                        toggleCreateGroupFormVisibility(1);
                        /* append group */
                        appendGroupList(resp.data);
                    }
                }).error(function (err) {
                    $scope.$emit('$preLoaderStop');
                    Notification.error({message: "Something went wrong! Check your connection", delay: MsgDelay});
                });
            }

            /**
             * Toggle visibility of (description and public checkbox) with (member - add form)
             */
            function toggleCreateGroupFormVisibility(code) {

                if (parseInt(code) === 1) {
                    /* show group table */
                    $scope.groupMemberVisible = true;
                    $scope.groupMemberFormVisible = true;
                    /* hide description & public check Box */
                    $scope.groupDescVisible = false;
                    /* hide create group btn */
                    $scope.groupCreateBtnVisible = false;
                }
                else /* hide member add-form module */
                {
                    /* hide group table */
                    $scope.groupMemberVisible = false;
                    $scope.groupMemberFormVisible = false;
                    /* show  description & public check Box */
                    $scope.groupDescVisible = true;
                }
            }

            $scope.validateGroupMember = function (memberEzeoneId) {
                var ezeone = parseInt(getGroupNameType(memberEzeoneId)) == 0 ? "@" + memberEzeoneId : memberEzeoneId;
                $('#ezeone-id').val(ezeone);

                validateGroupMember(ezeone, $scope.activeGroupId).then(function (data) {

                    if(!data)
                        return;

                    $scope.ezeOneMembershipStatus = data.userstatus;
                    if (data.status && data.status == -1) {
                        /* Group name is Unique: passed the validity test! */
                        ezeOneValidationAction(1);
                        $scope.activeEzeOneId = data.masterid;
                        $scope.activeEzeOneName = data.name;
                    }
                    else if (data.status && data.status == -2) {
                        /* EZEONE does not exists */
                        ezeOneValidationAction(2);
                        $scope.activeEzeOneId = 0;
                        $scope.activeEzeOneName = "";
                        Notification.error({message: "EZEONE doesn't exists in the system", delay: MsgDelay});
                    }
                    else {
                        ezeOneValidationAction(3);
                        $scope.activeEzeOneId = 0;
                        $scope.activeEzeOneName = "";

                        if ($scope.ezeOneMembershipStatus == 1)
                        {
                            Notification.error({
                                message: "You are already connected to this user/group",
                                delay: MsgDelay
                            });
                        }
                        else if ($scope.ezeOneMembershipStatus == 0)
                        {
                            Notification.error({
                                message: "You are already sent a request to JOIN",
                                delay: MsgDelay
                            });
                        }
                        else if ($scope.ezeOneMembershipStatus > 1)
                        {
                            /* Group name is Unique: passed the validity test! */
                            ezeOneValidationAction(1);
                            $scope.activeEzeOneId = data.masterid;
                            $scope.activeEzeOneName = data.name;
                        }
                    }

                });
            }

            /**
             * API call for validating EZEONE ID [called from DOM]
             * @return: 1: valid [test passed],
             *          2: invalid ezeone
             *          3: mapping already exists
             */
            $scope.validateEzeOneId = function (ezeone) {
                var ezeone = parseInt(getGroupNameType(ezeone)) == 0 ? "@" + ezeone : ezeone;
                $('#ezeone-id').val(ezeone);

                var groupId = null;
                if ($scope.module.join) {
                    groupId = $scope.activeGroupId;
                }

                /**
                 * Validate the group name and take appropriate ACTION
                 */
                validateGroupNameApi(ezeone,1,groupId).then(function(data){
                    if(!data)
                        return;

                    $scope.ezeOneValidationStatus = data[0].status;//Status of the user
                    $scope.ezeOneMembershipStatus = data[0].userstatus;//Current status of the status
                    $scope.isLoggedInUserRequeser = data[0].isrequester;//1: logged in person is the requester

                    $scope.currentGroupId = data[0].GroupID;

                    if (data[0].userstatus && data[0].userstatus == -1) {
                        /* Group name is Unique: passed the validity test! */
                        ezeOneValidationAction(1);
                        $scope.activeEzeOneId = data[0].masterid;
                        $scope.activeEzeOneName = data[0].name;
                    }
                    ////////////////////////////////////////////////////////////////////////////////////////////////////
                    ////////////////////////////////////////////////////////////////////////////////////////////////////
                    //////////////////////////////////////**DOUBT**//////////////////////////////////////////////////
                    ////////////////////////////////////////////////////////////////////////////////////////////////////
                    ////////////////////////////////////////////////////////////////////////////////////////////////////
                    else if (data[0].userstatus && data[0].userstatus == -2) {//-2?????????
                        /* EZEONE does not exists */
                        ezeOneValidationAction(2);
                        $scope.activeEzeOneId = 0;
                        $scope.activeEzeOneName = "";
                        Notification.error({message: "EZEONE doesn't exists in the system", delay: MsgDelay});
                    }
                    else {
                        ezeOneValidationAction(3);
                        $scope.activeEzeOneId = 0;
                        $scope.activeEzeOneName = "";
                        if ($scope.ezeOneMembershipStatus == 1)
                            Notification.error({
                                message: "You are already connected to this user/group",
                                delay: MsgDelay
                            });
                    }
                },function(){
                    //Error Occured
                    Notification.error({message: "Something went wrong! Check your connection", delay: MsgDelay});
                });
            }


            /**
             * Take action on the basis of the response you got from the validation of the EZEONE ID
             */
            function ezeOneValidationAction(code) {
                $scope.addMemberDisabled = false;
                if (parseInt(code) === 1) {
                    $scope.addMemberDisabled = true;
                    $scope.isEzeOneIdValid = true;
                    $scope.addMemberDisabled = false;
                    $('#ezeone-relationship').focus();
                }
                else {
                    $scope.isEzeOneIdValid = false;
                    $scope.addMemberDisabled = true;
                }
            }

            /**
             * invalidate ezeoneId
             */
            $scope.invalidateEzeOneId = function () {
                $scope.addMemberDisabled = true;
            }

            $scope.invalidateGroupId = function () {
                $scope.saveGroupBtnDisabled = true;
            }

            /**
             * Add individual member into group member[called from DOM]
             */
            $scope.addMember = function () {
                if (!parseInt($scope.activeEzeOneId) > 0) {
                    Notification.error({message: "Please select the group member once again", delay: MsgDelay});
                    return;
                }
                /* check for repetition */
                var index = parseInt($scope.groupMember.indexOfWhere('id', $scope.activeEzeOneId));
                if (index >= 0) {
                    if($scope.groupMember[index].status == 1)
                    {
                        Notification.error({message: "You can't add the same member again", delay: MsgDelay});
                        return;
                    }
                }
                var temp = {
                    name: $scope.activeEzeOneName,
                    relation: $scope.modalBox.selectedRelation,
                    id: $scope.activeEzeOneId,
                    status: 0,
                    requester: 1
                };

                /* check if the added ezeone id is not a logged in user */
                if ($scope.activeEzeOneId == $rootScope._userInfo.TID) {
                    Notification.error({
                        message: "You are the owner of the group, Try adding someone else",
                        delay: MsgDelay
                    });
                    return;
                }

                /* Add group member */
                addMemberAndGroupMembershipRequestApiCall(1).then(function () {
                        $scope.groupMember.push(temp);
                        clearAddMemberForm();
                    },
                    function () {
                        Notification.error({
                            message: "Failed to add this mmember, Please try again  later",
                            delay: MsgDelay
                        });
                    });
            }

            /**
             * clear add-member form
             */
            function clearAddMemberForm() {
                $scope.activeEzeOneName = "";
                $scope.modalBox.selectedRelation = 0;
                $scope.activeEzeOneId = 0;
                $('#ezeone-id').val('');
                $scope.addMemberDisabled = true;
            }


            /**
             * Remove individual member from group[called from DOM]
             */
            $scope.removeGroupMember = function (id) {
                var index = $scope.groupMember.indexOfWhere('id', id);
                if (index >= 0) {
                    var data = $scope.groupMember[index];
                    var type = 0;//Group
                    updateMemberStatusApiCall(data.id, 4, type).then(function () {
                            $scope.groupMember.splice(index, 1);
                        },
                        function () {
                            Notification.error({
                                message: "Failed to remove this member, Try again later",
                                delay: MsgDelay
                            });
                        });

                    return;
                }

            }

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////API CALLS///////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            /**
             * Add member API call
             * @param: 1: group owner, 2: other users
             */
            function addMemberAndGroupMembershipRequestApiCall(requester) {
                var defer = $q.defer();
                $scope.$emit('$preLoaderStart');
                $http({
                    url: GURL + 'group_members',
                    method: "POST",
                    data: {
                        group_id: $scope.activeGroupId,
                        member_id: $scope.activeEzeOneId,
                        relation_type: $scope.modalBox.selectedRelation,
                        requester: requester
                    }
                }).success(function (resp) {
                    if (resp.status) {
                        $scope.$emit('$preLoaderStop');
                        defer.resolve();
                    }
                    else {
                        defer.reject();
                    }
                }).error(function (err) {
                    $scope.$emit('$preLoaderStop');
                    Notification.error({message: "Something went wrong! Check your connection", delay: MsgDelay});
                    defer.resolve();
                });
                return defer.promise;
            }

            /**
             * Remove member API call
             */
            function updateMemberStatusApiCall(masterId, status,type) {
                var defer = $q.defer();
                $scope.$emit('$preLoaderStart');
                $http({
                    url: GURL + 'user_status',
                    method: "PUT",
                    data: {
                        token: $rootScope._userInfo.Token,
                        group_type:type,
                        group_id: $scope.activeGroupId,
                        master_id: masterId,
                        status: status
                    }
                }).success(function (resp) {
                    if (resp.status) {
                        $scope.$emit('$preLoaderStop');
                        defer.resolve();
                    }
                    else {
                        defer.reject();
                    }
                }).error(function (err) {
                    $scope.$emit('$preLoaderStop');
                    Notification.error({message: "Something went wrong! Check your connection", delay: MsgDelay});
                    defer.resolve();
                });
                return defer.promise;
            }


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////JOIN GROUP & LEAVE GROUP////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            /**
             * API call to get the suggestion list
             */
            function getSuggestionList(keyword) {
                $http({
                    url: GURL + 'suggestion_list',
                    method: "GET",
                    params: {
                        keywordsForSearch: keyword,
                        token: $rootScope._userInfo.Token
                    }
                }).success(function (resp) {

                    $scope.$emit('$preLoaderStop');
                    if (resp.data) {
                        moduleWiseAction(1, resp.data);
                    }
                    else {
                        moduleWiseAction(2, resp.data);
                    }
                }).error(function (err) {
                    $scope.$emit('$preLoaderStop');
                    Notification.error({message: "Something went wrong! Check your connection", delay: MsgDelay});
                });
            }

            /**
             * Module-wise ACTIONS based on the search result
             * 1:Found result
             * 2:No result Found
             */
            function moduleWiseAction(resType, data) {
                if (parseInt(resType) == 1)//Result Found
                {
                    setSuggestionListData(data);
                    $scope.noSuggestionError = false;
                }
                else//No Result Found
                {
                    $scope.groupSuggestionOpen = false;
                    changeCheckBtn(1);

                    $scope.noSuggestionError = true;
                    enteredGroupNameInValidAction();
                }
            }

            /**
             * set the response data and show suggestion list
             */
            function setSuggestionListData(data) {
                /* show suggestions if the request is not for creating new group */
                $scope.groupSuggestionOpen = true;
                $scope.suggestedGroup = data;
            }

            /**
             * reset the data for group suggestions
             */
            function resetSuggestions() {
                $scope.suggestedGroup = [];
            }

            /**
             * Select a group from a suggestion list [called from DOM]
             */
            $scope.selectGroupFromSuggestionList = function (index) {
                var isAdmin = parseInt($scope.suggestedGroup[index].isAdmin) > 0 ? true : false;
                var isMember = parseInt($scope.suggestedGroup[index].Status) == 1 ? true : false;
                var isJoinRequestPending = parseInt($scope.suggestedGroup[index].Status) == 0 ? true : false;
                /* populate the input box with the selected input */
                $scope.groupName = $scope.suggestedGroup[index].GroupName;
                $scope.activeGroupId = $scope.suggestedGroup[index].tid;
                $scope.activeGroupAutoJoinStatus = $scope.suggestedGroup[index].autojoin;
                $('#group-name').val($scope.groupName);
                /* close the suggestion */
                $scope.groupSuggestionOpen = false;
                /* change the check btn icon */
                changeCheckBtn(2);
                /* set access rights */
                $scope.isAdmin = isAdmin;
                $scope.isMember = isMember;
                $scope.isJoinRequestPending = isJoinRequestPending;

                var isRequester = 0;
                /* get the data if the user is the requester or not */
                validateGroupMember($rootScope._userInfo.ezeone_id,$scope.activeGroupId).then(function(data){
                        if(!data)
                            Notification.error({message: "Error occured, Try again later", delay: MsgDelay});

                        isRequester = data.isrequester;
                        /* show the remaining form */
                        enteredGroupNameValidAction(isRequester);
                    },
                    function(){
                        Notification.error({message: "Error occured, Try again later", delay: MsgDelay});
                    });
            }

            /**
             * Join group btn click action[called from DOM]
             */
            $scope.requestJoinGroup = function () {
                /* setting the basic details for API call */
                $scope.activeEzeOneId = $rootScope._userInfo.TID;
                $scope.modalBox.selectedRelation = $scope.modalBox.selectedJoinGroupRelation;

                /* API call for requesting to join group */
                addMemberAndGroupMembershipRequestApiCall(2).then(function () {
                        $scope.modalAddGroupVisible = false;

                        //If it is a public group add in the group list LIVE DATA
                        var msg = " requested to join ";
                        if($scope.activeGroupAutoJoinStatus)
                        {
                            addLiveGroupOnRequestToPublicGroup();
                            msg = " joined ";
                        }

                        Notification.success({message: "You've successfully "+msg+" this group", delay: MsgDelay});
                    },
                    function () {
                        Notification.error({message: "Failed to join this group, Try again later", delay: MsgDelay});
                    });
            }

            function addLiveGroupOnRequestToPublicGroup()
            {
                var data = [];
                data.groupId = $scope.activeGroupId;
                data.groupName = $scope.groupName;
                appendGroupList(data,data.groupName,data.groupId,0);
            }

            /**
             * Decides what will happen when group name is VALID
             */
            function enteredGroupNameValidAction(isRequester) {
                /* reset the whole form */
                resetJoinGroupForm();

                /* if MEMBER: give information */
                if ($scope.isMember && !$scope.isAdmin) {

                    $scope.leaveGroupBtnVisible = true;
                    return;
                }
                /* if ADMIN: load all group member */
                if ($scope.isAdmin) {

                    $scope.groupDeleteBtn = true;
                    /* populate group member data */
                    getGroupMembersApi().then(function (data) {
                        setGroupData(data);
                    });
                    /* make the group member visible */
                    $scope.groupMemberVisible = true;
                    $scope.groupMemberFormVisible = true;

                    $scope.groupAdminMsg = true;
                    return;
                }

                /* if the logged in user have already made a request */
                if ($scope.isJoinRequestPending && isRequester) {
                    Notification.error({message: "You have already requested this group's admin to connect", delay: MsgDelay});
                    /* reset the form */
                    $scope.groupName = "";
                    $('#group-name').val('');
                    resetJoinGroupForm();
                    return;
                }
                /* if the request is pending */
                if ($scope.isJoinRequestPending) {

                    $scope.groupJoinResponseBtn = true;
                    $scope.pendingRequestMsg = true;
                    return;
                }

                //JOIN GROUP MODULES
                /* enable relationship dropdown */
                $scope.groupRelationShipFormVisibility = true;
                /* enable join button */
                $scope.joinGroupBtnVisible = true;
            }


            /**
             * reset join group forms
             */
            function resetJoinGroupForm() {
                /* form to join group */
                $scope.groupRelationShipFormVisibility = false;
                $scope.joinGroupBtnVisible = false;
                /* hide members */
                $scope.groupMemberVisible = false;
                $scope.groupMemberFormVisible = false;
                /* messages */
                $scope.groupAdminMsg = false;
                $scope.leaveGroupBtnVisible = false;
                /* hide join group response buttons */
                $scope.groupJoinResponseBtn = false;
                $scope.pendingRequestMsg = false;
            }

            /**
             * Set all the data of the group members
             */
            function setGroupData(data) {
                if (!data.length > 0) {
                    return;
                }
                /* Inserting data in to member data */
                $scope.groupMember = [];
                data.forEach(function (val) {
                    var temp = {
                        name: val.name,
                        relation: val.RelationType,
                        id: val.MemberID,
                        status: val.Status,
                        requester: val.requester
                    };
                    $scope.groupMember.push(temp);
                });
            }

            /**
             * Get all the group members of a group
             */
            function getGroupMembersApi() {
                var defer = $q.defer();
                $http({
                    url: GURL + 'members_list',
                    method: "GET",
                    params: {
                        group_id: $scope.activeGroupId
                    }
                }).success(function (resp) {
                    if (resp.data) {
                        defer.resolve(resp.data);
                    }
                    else {
                        defer.reject();
                    }
                }).error(function (err) {
                    $scope.$emit('$preLoaderStop');
                    Notification.error({message: "Something went wrong! Check your connection", delay: MsgDelay});
                    defer.resolve();
                });
                return defer.promise;
            }

            /**
             * Decides what will happen when group name is INVALID
             */
            function enteredGroupNameInValidAction() {
                /* disable relationship dropdown */
                $scope.groupRelationShipFormVisibility = false;
                /* disable join button */
                $scope.joinGroupBtnVisible = false;
                /* if admin: load all group member */
                $scope.groupAdminMsg = false;
                /* if member: hide leave group button disabled */
                $scope.leaveGroupBtnVisible = false;
            }

            /**
             * Leave group[called from DOM]
             */
            $scope.leaveGroup = function () {

                var cnf = confirm("Are you sure?");

                if(!cnf)
                    return;

                var type = 0;//Group
                updateMemberStatusApiCall($rootScope._userInfo.TID, 3, type).then(function () {
                        $scope.modalAddGroupVisible = false;

                        /* remove this group from the group list */
                        spliceGroupList($scope.activeGroupId);

                        Notification.success({message: "You've successfully left this group", delay: MsgDelay});
                    },
                    function () {
                        Notification.error({message: "Failed to leave the group, Try again later", delay: MsgDelay});
                    });
            }

            /**
             * response to the join group request
             * 1:Accept
             * 2:Reject
             * 3:cancel
             */
            $scope.joinGroupResponse = function (response, id) {
                var msgType = "rejected";
                var userId = $rootScope._userInfo.TID;
                if (parseInt(response) === 1) {
                    msgType = "accepted";
                }

                if (id)//Called from admin-side
                {
                    /* update the member list data */
                    updateMemberListLiveData(response, id);
                    userId = id;
                }

                if(typeof id == undefined)
                {
                    /* close the modal in any of the case */
                    $scope.toggleJoinGroupModal();
                }

                /* don't execute further if cancel is clicked */
                if (parseInt(response) === 3)
                    return;

                /* append the group list if the user have accepted the group join request */
                if(!id && parseInt(response) == 1)
                {
                    var groupId = $scope.activeGroupId;
                    var index = $scope.pendingRequestData.indexOfWhere('GroupID',groupId);
                    var data = $scope.pendingRequestData[index];
                    appendGroupList(data,data.GroupName,data.GroupID);
                }

                /* removing the pending request notifications */
                if(!id && parseInt(response) < 3)
                {
                    splicePendingRequest($scope.activeGroupId);
                }

                var type = 0;//Group
                /* send an API request with the new status */
                updateMemberStatusApiCall(userId, response, type).then(function () {
                        Notification.success({
                            message: "You have " + msgType + " the Group Join request!",
                            delay: MsgDelay
                        });
                    },
                    function () {
                        Notification.error({
                            message: "Failed to respond to the group joining request, Try again later",
                            delay: MsgDelay
                        });
                    });
            }

            /**
             * Update the live membership data
             */
            function updateMemberListLiveData(status, id) {
                var index = $scope.groupMember.indexOfWhere('id', id);
                if ($scope.groupMember[index]) {
                    $scope.groupMember[index].status = status;
                }
            }


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////EDIT ADMIN'S NAME///////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            ////////////////////////////////////INITIALIZATION//////////////////////////////////////////////////////////
            /* edit group modal goes here */
            $scope.editGroupModalBox = {
                title: 'Edit Group',
                class: 'business-manager-modal',
                groupName: '',
                groupDesc: '',
                isPublicGroup: false
            };
            $scope.editGroupModalVisibility = false;

            $scope.currentGroup = {
                groupId: 0,
                groupType: 0,
                groupName: ""
            };

            $scope.validateGroupNameError = {
                status : 3,
                nameErrorVisibility:false
            };
            $scope.validateGroupError = [
                "Error occured, Try again later",
                "Group name is not unique",
                "Group name can not be empty",
                "New and old group name is same"
            ];

            ////////////////////////////////////ACTION//////////////////////////////////////////////////////////////////

            /**
             * toggling the visibility of group edit form
             * @param groupIndex
             * @param groupTid
             */
            $scope.toggleEditGroupModalVisibility = function (groupIndex, groupTid) {
                $scope.editGroupModalVisibility = !$scope.editGroupModalVisibility;

                /* if the modal box is opening: populate the name of the group */
                if ($scope.editGroupModalVisibility) {
                    $scope.currentGroup.groupName = $scope.editGroupModalBox.groupName = $scope.groupListData[groupIndex].GroupName;
                    $scope.currentGroup.groupId = groupTid;
                    setGroupInfo();
                }

                /* take the API Call to get the description and other data *///@todo
                //Set the group type
            };

            /**
             * set the group informations
             * @returns {boolean}
             */
            function setGroupInfo()
            {
                if(!$scope.currentGroup.groupId)
                    return false;

                getGroupInformation($scope.currentGroup.groupId,0).then(function(data){
                    if(!data)
                        return false;

                    $scope.editGroupModalBox.groupDesc = data[0].aboutgroup;
                    $scope.editGroupModalBox.isPublicGroup = data[0].autojoin == 0?false:true;
                });
            }


            /**
             * action associated with the updation of the group
             */
            $scope.updateGroup = function () {

                updateGroupData(0).then(function (data) {
                        Notification.success({message: "Group data updated successfully!", delay: MsgDelay});
                        /* close modal box */
                        $scope.editGroupModalVisibility = false;
                        /* update live data */
                        updateLiveGroupName(data.id,data.groupName);
                    },
                    function () {
                        Notification.error({message: "Errro occured, Try again later", delay: MsgDelay});
                    });
            }

            /**
             * Update the group's name in the group list
             * @param groupId: ID of the group which is recently updated
             * @param groupName: New name of the group
             */
            function updateLiveGroupName(groupId,groupName)
            {
                var index = $scope.groupListData.indexOfWhere('GroupID',groupId);
                /* update the name of the group */
                $scope.groupListData[index].GroupName = groupName;
            }

            /**
             * Error visibility togglingig associated with the group name VALIDATION
             * @param name
             */
            $scope.validateGroup = function(name)
            {
                $scope.validateGroupNameError.nameErrorVisibility = false;
                if(!name.length > 0)
                {
                    $scope.validateGroupNameError.nameErrorVisibility = true;
                    $scope.validateGroupNameError.status = 2;//Empty string
                    return;
                }
                if(basicGroupNameValidation(name))
                {
                    checkGroupNameUniqueness(name).then(function(data){
                        if(!data[0].status)
                        {
                            $scope.validateGroupNameError.nameErrorVisibility = true;
                            $scope.validateGroupNameError.status = 0;//Internal error occured
                        }
                        else if(data[0].status == -1)
                        {
                            $scope.validateGroupNameError.status = 4;//Group validation PASSED
                        }
                        else
                        {
                            $scope.validateGroupNameError.status = 1;//Group Name already existing
                            $scope.validateGroupNameError.nameErrorVisibility = true;
                        }
                    });
                }
                else
                {
                    $scope.validateGroupNameError.status = 3;//Same name
                    //$scope.validateGroupNameError.nameErrorVisibility = true;
                }
            }

            /**
             * Basic group name validation and look for duplication of new and old group name
             * @param name
             * @returns {boolean}
             */
            function basicGroupNameValidation(name)
            {
                if($scope.currentGroup.groupName == name)
                    return false;

                return true;
            }

            /**
             * Delete a group
             */
            $scope.deleteGroup = function()
            {
                var groupId = $scope.activeGroupId;
                var cnf = confirm("Are you sure?");

                if(!cnf)
                    return;

                deleteGroupApi(groupId).then(function(){
                        Notification.success({ message: "Group deleted successfully", delay: MsgDelay });

                        //Remove a group from group list
                        spliceGroupList(groupId);

                        //Close the modal box
                        $scope.joinGroupModal.visible = false;
                    },
                    function(){
                        Notification.error({ message: "Internel error occured! try again later", delay: MsgDelay });
                    });
            }

            /**
             * remove a particular group from the group list
             * @param groupId
             */
            function spliceGroupList(groupId,isIndividual)
            {
                if(!groupId)
                    return;

                var listData = $scope.groupListData;
                if(isIndividual)
                    listData = $scope.individualMember;

                var index = listData.indexOfWhere('GroupID',groupId);
                /* remove */
                listData.splice(index,1);
            }

            /**
             * Append in the meain group list
             * @param data
             */
            function appendGroupList(data,groupName,groupId,isAdmin)
            {
                if(!data)
                    return;

                var grpName = data.groupName;
                var grpId = data.id;

                if(groupName)
                {
                    grpName = groupName;
                    grpId = groupId;
                }

                var admin = 1;
                if(isAdmin != undefined)
                    admin = isAdmin;

                var temp = {
                    AdminID: $rootScope._userInfo.ezeone_id,
                    GroupID: grpId,
                    GroupName: grpName,
                    GroupType: 0,
                    MemberID: $rootScope._userInfo.ezeone_id,
                    Status: 1,
                    isAdmin: admin,
                    requester: 1
                };
                /* push in to the group list */
                $scope.groupListData.push(temp);
            }

            /**
             * Remove pending request
             * @param groupId
             */
            function splicePendingRequest(groupId)
            {
                if(!groupId)
                    return;

                var index = $scope.pendingRequestData.indexOfWhere('GroupID',groupId);
                /* remove */
                $scope.pendingRequestData.splice(index,1);
                /* decrease the count */
                $scope.pendingRequestCount--;
            }

            /**
             * Remove a contact from the contact list
             * @param groupId: group ID of the contact to be removed
             */
            $scope.removeContact = function(groupId)
            {
                var cnf = confirm("Are you sure?");

                if(!cnf)
                    return;

                $scope.activeGroupId = groupId;
                var masterId = $rootScope._userInfo.TID;
                var type = 1;//Ezeone
                updateMemberStatusApiCall(masterId, 4,type).then(function () {
                        spliceGroupList(groupId,true);
                        Notification.success({ message: "You have successfully removed this connection!", delay: MsgDelay });
                    },
                    function(){
                        Notification.error({ message: "Error occured! Try again later", delay: MsgDelay });
                    });
            }
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////API/////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            /**
             * Validate group member
             * @param memberEzeoneId
             * @param groupId
             * @returns {*}
             */
            function validateGroupMember(memberEzeoneId,groupId)
            {
                $scope.$emit('$preLoaderStart');
                var defer = $q.defer();
                $http({
                    url : GURL + 'validate_group_member',
                    method : "GET",
                    params :{
                        token : $rootScope._userInfo.Token,
                        ezeone_id: memberEzeoneId,
                        group_id: groupId
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
             * Update group data
             * @param groupType - 0:group, 1:Ezeone
             * @returns {*}
             */
            function updateGroupData(groupType)
            {
                $scope.$emit('$preLoaderStart');
                var defer = $q.defer();
                $http({
                    url : GURL + 'create_group',
                    method : "POST",
                    data :{
                        token : $rootScope._userInfo.Token,
                        group_name:$scope.editGroupModalBox.groupName,
                        group_type:groupType,
                        about_group:$scope.editGroupModalBox.groupDesc,
                        auto_join:$scope.editGroupModalBox.isPublicGroup?1:0,
                        tid:$scope.currentGroup.groupId
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

            /**
             * get the group details of a group or individual
             * @param tid of group or individual
             * @param type  - 0 :GroupInfo ID, 1 :Ezeone ID, 2 :Message ID
             * @returns {*}
             */
            function getGroupInformation(tid,type)
            {
                $scope.$emit('$preLoaderStart');
                var defer = $q.defer();
                $http({
                    url : GURL + 'group_info',
                    method : "GET",
                    params :{
                        token : $rootScope._userInfo.Token,
                        group_id : tid,
                        type : type
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

            /**
             * Validate the group name
             * @param ezeone: name of the group
             * @param groupType: 1:EZEONE, 2:Group ID
             * @param groupId: 0-New ,1-* Existing
             * @returns {*}
             */
            function validateGroupNameApi(ezeone,groupType,groupId)
            {
                $scope.$emit('$preLoaderStart');
                var defer = $q.defer();
                $http({
                    url: GURL + 'validate_groupname',
                    method: "GET",
                    params: {
                        group_name: ezeone,
                        token: $rootScope._userInfo.Token,
                        group_type: groupType,
                        group_id: groupId
                    }
                }).success(function (resp) {
                    $scope.$emit('$preLoaderStop');
                    if(!resp.status)
                    {
                        defer.reject();
                        return defer.promise;
                    }
                    defer.resolve(resp.data);
                }).error(function (err) {
                    $scope.$emit('$preLoaderStop');
                    Notification.error({message: "Something went wrong! Check your connection", delay: MsgDelay});
                    defer.reject();
                });
                return defer.promise;
            }

            /**
             * Api call for deleting a group
             * @param groupId: geroup Id of the group which has to be deleted
             * @returns {*}
             */
            function deleteGroupApi(groupId)
            {
                $scope.$emit('$preLoaderStart');
                var defer = $q.defer();
                $http({
                    url: GURL + 'group',
                    method: "delete",
                    params: {
                        token: $rootScope._userInfo.Token,
                        group_id: groupId
                    }
                }).success(function (resp) {
                    $scope.$emit('$preLoaderStop');
                    if(!resp.status)
                    {
                        defer.reject();
                        return defer.promise;
                    }
                    defer.resolve(resp.data);
                }).error(function (err) {
                    $scope.$emit('$preLoaderStop');
                    Notification.error({message: "Something went wrong! Check your connection", delay: MsgDelay});
                    defer.reject();
                });
                return defer.promise;
            }
        }
    ]);