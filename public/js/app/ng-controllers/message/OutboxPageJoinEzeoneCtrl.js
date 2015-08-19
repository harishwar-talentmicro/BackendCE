/**
 * Controller to manage Ezeone actions
 *
 * @author: Sandeep[EZE ID]
 * @since 20150526
 */
angular.module('ezeidApp').
    controller('OutboxPageJoinEzeoneCtrl', [
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
            ////////////////////////////////////INITIALIZATIONS/////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            /* modalbox */
            $scope.modalAddEzeoneVisible = false;

            /* detail modal goes here */
            $scope.ezeOneModalBox = {
                title : 'Connect',
                class : 'business-manager-modal',
                groupDesc : '',
                ezeone:'',
                relation:0

            };

            /* variables for request for connection */
            $scope.activeEzeOneId = -1;
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////Default Functions///////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            resetVisibilityVar();


            /**
             * reset all the visibility variables
             */
            function resetVisibilityVar()
            {
                /* visibility flags for msg */
                $scope.visibilityReceiverErrorMsg = {
                    alreadyMemberMsg:false,
                    alreadyRequestedMsg:false
                };

                /* visibility flag for buttons */
                $scope.visibilityBtn = {
                    connectBtn:false
                }

                /* visibility flag for form element */
                $scope.visibilityForm = {
                    relation:false,
                    groupJoinRequestForm:false
                }
            }
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////ACTION//////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            /**
             * reset all the data for EZEONE request form
             */
            $scope.resetEzoeoneRequestForm = function()
            {
                console.log("Hello MOtoto");
                $scope.ezeOneModalBox.ezeone = "";
                resetVisibilityVar();
                hideAllMsg();
                hideConnectFormElements();
                hideJoinGroupResponseForm();
            }

            /**
             * Toggle visibility of the modal box for joinig request/response
             */
            $scope.toggleEzeoneModalVisibility = function()
            {
                $scope.modalAddEzeoneVisible = !$scope.modalAddEzeoneVisible;
                return;
            }

            $scope.validateEzeone = function(keyword)
            {
                /* append @ if it is not there */
                var keyword = $scope.ezeOneModalBox.ezeone;
                var ezeone = parseInt(getGroupNameType(keyword)) ==  0?"@"+keyword:keyword;
                $scope.ezeOneModalBox.ezeone = ezeone;
                if(ezeone.toUpperCase() == $rootScope._userInfo.ezeone_id)
                {
                    Notification.error({ message: "You can't connect to yourself, Try again with some other EZEONE ID", delay: MsgDelay });
                }

                validateEzeone(ezeone).then(function(val){
                    if(val[0])
                    {
                        validateEzeoneResponseActivity(val[0]);
                        $scope.currentGroupId = val[0].GroupID;
                        $scope.activeEzeOneId = val[0].masterid;
                    }

                });
            }

            /**
             * Does the activity on the basis of response from validation API
             */
            function validateEzeoneResponseActivity(data){
                if(!data)
                    return;
                var membershipStatus = parseInt(data.userstatus);
                /* take suitable action */
                resetVisibilityVar();
                hideAllMsg();
                hideConnectFormElements();
                hideJoinGroupResponseForm();
                if(parseInt(data.status) == -1 || membershipStatus > 1)//Valid Ezeid proceed
                {
                    $scope.visibilityBtn.connectBtn = true;
                    $scope.visibilityForm.relation = true;
                    $scope.isEzeOneIdValid = true;
                }
                else if(parseInt(data.status) == 1)//mapping already exists
                {
                    if(membershipStatus == 1)
                    {
                        $scope.visibilityReceiverErrorMsg.alreadyMemberMsg = true;
                    }
                    else if(membershipStatus == 0 && data.isrequester == 0)
                    {
                        $scope.visibilityForm.groupJoinRequestForm = true;
                    }
                    else if(membershipStatus == 0 && data.isrequester == 1)
                    {
                        $scope.visibilityReceiverErrorMsg.alreadyRequestedMsg = true;
                    }
                    $scope.isEzeOneIdValid = true;
                }
                else if(data.status == -2)
                {
                    $scope.isEzeOneIdValid = false;
                }
            };

            /**
             * Hide the already member msg
             */
            function hideAllMsg()
            {
                $scope.visibilityReceiverErrorMsg.alreadyMemberMsg = false;
                $scope.visibilityReceiverErrorMsg.alreadyRequestedMsg = false;
            }
            /**
             * Hide the connect btn
             */
            function hideConnectFormElements()
            {
                $scope.visibilityReceiverErrorMsg.connectBtn = false;
                $scope.visibilityForm.relation = false;
            }

            /**
             * Hide the joinGroup response form
             */
            function hideJoinGroupResponseForm()
            {
                $scope.visibilityForm.groupJoinRequestForm = false;
            }

            /**
             * Get the group type
             * 0: group
             * 1: EZEOne ID
             */
            function getGroupNameType(groupName)
            {
                if(!groupName)
                {
                    return;
                }
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
             * Connect to Ezeone request
             */
            $scope.connectToEzeOne = function()
            {
                $scope.modalAddEzeoneVisible = !$scope.modalAddEzeoneVisible;
                /* send an API request with the new status */
                connectionRequestApi().then(function(){
                        Notification.success({ message: "You have successfuly send a request to connect you", delay: MsgDelay });
                    },
                    function(){
                        Notification.error({ message: "Error Occured, Try again later", delay: MsgDelay });
                    });
            }

            /**
             * Send a request to connect to yourself API Call
             */
            function connectionRequestApi()
            {
                var defer = $q.defer();
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'message_request',
                    method : "POST",
                    data :{
                        token : $rootScope._userInfo.Token,
                        group_name:$rootScope._userInfo.ezeone_id,
                        group_type:1,
                        auto_join:0,
                        relation_type:$scope.ezeOneModalBox.relation,
                        user_id:$scope.activeEzeOneId
                    }
                }).success(function(resp){
                    if(resp.status)
                    {
                        $scope.$emit('$preLoaderStop');
                        defer.resolve();
                    }
                    else
                    {
                        defer.reject();
                    }
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                    defer.resolve();
                });
                return defer.promise;
            }

            /**
             * saves the individual response for connect request
             * @param ezeoneId
             * @param status
             */
            $scope.individualMemberJoinResponse = function(status,groupId)
            {
                $scope.modalAddEzeoneVisible = !$scope.modalAddEzeoneVisible;
                var msgType = "rejected";
                if(parseInt(status) === 1)
                {
                    msgType = "accepted";
                }

                /* manage the notifications and group list */
                individualConnectNotification(status,groupId);

                /* Dont proceed for CANCEL status */
                if(parseInt(status) === 3)
                    return;

                joinResponseApi(status,groupId).then(function(){
                    Notification.success({ message: "You have successfuly "+msgType+" the group join request!", delay: MsgDelay });
                },function(){
                    Notification.error({ message: "Error occured! Try again later", delay: MsgDelay });
                });
            }

            /**
             * handles the ezeone's response for connection
             * @param status
             * @param groupId
             */
            function individualConnectNotification(status,groupId)
            {
                if(status == 1)
                {
                    var index = $scope.pendingRequestData.indexOfWhere('GroupID',groupId);
                    var data = $scope.pendingRequestData[index];
                    appendIndividualList(data);
                }
                /* reduce the pending request notification */
                splicePendingRequest(groupId);
            }

            /**
             * Decrease the pending request count
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
             * Append in the meain group list
             * @param data
             */
            function appendIndividualList(data)
            {
                if(!data)
                    return;

                var temp = {
                    AdminID: $rootScope._userInfo.ezeone_id,
                    GroupID: data.GroupID,
                    GroupName: data.GroupName,
                    GroupType: 0,
                    MemberID: $rootScope._userInfo.ezeone_id,
                    Status: 1,
                    isAdmin: 1,
                    requester: 1
                };
                /* push in to the group list */
                $scope.individualMember.push(temp);
            }

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////API CALLS///////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            /**
             * Api call for getting the user response
             * @param status
             * @param groupId
             * @returns {*}
             */
            function joinResponseApi(status,groupId)
            {
                var defer = $q.defer();
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'user_status',
                    method : "PUT",
                    data :{
                        token : $rootScope._userInfo.Token,
                        group_id : groupId,
                        master_id : $rootScope._userInfo.TID,
                        status : status
                    }
                }).success(function(resp){
                    if(resp.status)
                    {
                        $scope.$emit('$preLoaderStop');
                        defer.resolve();
                    }
                    else
                    {
                        defer.reject();
                    }
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                    defer.resolve();
                });
                return defer.promise;
            }

            function validateEzeone(ezeone)
            {
                var defer = $q.defer();
                $http({
                    url : GURL + 'validate_groupname',
                    method : "GET",
                    params :{
                        group_name:ezeone,
                        token : $rootScope._userInfo.Token,
                        group_type: 1
                    }
                }).success(function(resp) {
                    if(!resp.status)
                    {
                        defer.reject();
                        return defer.promise;
                    }
                    defer.resolve(resp.data);
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                    defer.resolve();
                });
                return defer.promise;
            }

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////EZEONE: JOIN  REQUEST///////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////EZEONE: JOIN  RESPONSE///////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

        }
    ]);