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
                $http({
                    url: GURL + 'validate_groupname',
                    method: "GET",
                    params: {
                        group_name: groupName,
                        token: $rootScope._userInfo.Token,
                        group_type: getGroupNameType(groupName),
                        group_id: getGroupNameType(groupName) == 0 ? $scope.activeGroupId : null
                    }
                }).success(function (resp) {

                    $scope.$emit('$preLoaderStop');
                    if (resp.data[0].status && resp.data[0].status == -1) {
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
                    defer.resolve(resp.data);
                }).error(function (err) {
                    $scope.$emit('$preLoaderStop');
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

                    if (data.userstatus && data.userstatus == -1) {
                        /* Group name is Unique: passed the validity test! */
                        ezeOneValidationAction(1);
                        $scope.activeEzeOneId = data.masterid;
                        $scope.activeEzeOneName = data.name;
                    }
                    else if (data.userstatus && data.userstatus == -2) {
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
                $scope.$emit('$preLoaderStart');
                $http({
                    url: GURL + 'validate_groupname',
                    method: "GET",
                    params: {
                        group_name: ezeone,
                        token: $rootScope._userInfo.Token,
                        group_type: 1,
                        group_id: groupId
                    }
                }).success(function (resp) {
                    $scope.$emit('$preLoaderStop');
                    $scope.ezeOneValidationStatus = resp.data[0].status;
                    $scope.ezeOneMembershipStatus = resp.data[0].userstatus;
                    $scope.isLoggedInUserRequeser = resp.data[0].isrequester;
                    $scope.currentGroupId = resp.data[0].GroupID;
                    if (resp.data[0].userstatus && resp.data[0].userstatus == -1) {
                        /* Group name is Unique: passed the validity test! */
                        ezeOneValidationAction(1);
                        $scope.activeEzeOneId = resp.data[0].masterid;
                        $scope.activeEzeOneName = resp.data[0].name;
                    }
                    else if (resp.data[0].userstatus && resp.data[0].userstatus == -2) {
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
                }).error(function (err) {
                    $scope.$emit('$preLoaderStop');
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
                if (parseInt($scope.groupMember.indexOfWhere('id', $scope.activeEzeOneId)) >= 0) {
                    Notification.error({message: "You can't add the same member again", delay: MsgDelay});
                    return;
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
                console.log($scope.groupMember);
                var index = $scope.groupMember.indexOfWhere('id', id);
                if (index >= 0) {
                    var data = $scope.groupMember[index];
                    updateMemberStatusApiCall(data.id, 4).then(function () {
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
            function updateMemberStatusApiCall(masterId, status) {
                var defer = $q.defer();
                $scope.$emit('$preLoaderStart');
                $http({
                    url: GURL + 'user_status',
                    method: "PUT",
                    data: {
                        token: $rootScope._userInfo.Token,
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
                    console.log("No result found");
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
                $('#group-name').val($scope.groupName);
                /* close the suggestion */
                $scope.groupSuggestionOpen = false;
                /* change the check btn icon */
                changeCheckBtn(2);
                /* set access rights */
                $scope.isAdmin = isAdmin;
                $scope.isMember = isMember;
                $scope.isJoinRequestPending = isJoinRequestPending;
                /* show the remaining form */
                enteredGroupNameValidAction();
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
                        Notification.success({message: "You successfully joined this group", delay: MsgDelay});
                    },
                    function () {
                        Notification.error({message: "Failed to join this group, Try again later", delay: MsgDelay});
                    });
            }

            /**
             * Decides what will happen when group name is VALID
             */
            function enteredGroupNameValidAction() {
                /* reset the whole form */
                resetJoinGroupForm();

                /* if MEMBER: give information */
                if ($scope.isMember && !$scope.isAdmin) {
                    console.log("Is member");
                    $scope.leaveGroupBtnVisible = true;
                    return;
                }
                /* if ADMIN: load all group member */
                if ($scope.isAdmin) {
                    console.log("isAdmin");
                    /* populate group member data */
                    getGroupMembersApi().then(function (data) {
                        setGroupData(data);
                    });
                    /* make the group member visible */
                    $scope.groupMemberVisible = true;
                    $scope.groupMemberFormVisible = true;

                    $scope.groupAdminMsg = true;
                    console.log("hello" + $scope.groupRelationShipFormVisibility + " " + $scope.joinGroupBtnVisible);
                    return;
                }

                /* if the request is pending */
                if ($scope.isJoinRequestPending) {
                    console.log("pending");
                    $scope.groupJoinResponseBtn = true;
                    $scope.pendingRequestMsg = true;
                    return;
                }
                console.log("normal");
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
                updateMemberStatusApiCall($rootScope._userInfo.TID, 3).then(function () {
                        $scope.modalAddGroupVisible = false;
                        Notification.success({message: "You successfully left this group", delay: MsgDelay});
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
                else//called from the user side
                {
                    /* close the modal in any of the case */
                    $scope.modalAddGroupVisible = false;
                }

                /* don't execute furthur if cancel is clicked */
                if (parseInt(response) === 3)
                    return;

                /* send an API request with the new status */
                updateMemberStatusApiCall(userId, response).then(function () {
                        Notification.success({
                            message: "You have successfuly " + msgType + " the group join request!",
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

                updateGroupData(0).then(function () {
                        Notification.success({message: "Group data updated successfully!", delay: MsgDelay});
                        /* close modal box */
                        $scope.editGroupModalVisibility = false;
                    },
                    function () {
                        Notification.error({message: "Errro occured, Try again later", delay: MsgDelay});
                    });
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
                    if(!resp.status)
                    {
                        defer.reject();
                        return defer.promise;
                    }
                    defer.resolve();
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
        }
    ]);