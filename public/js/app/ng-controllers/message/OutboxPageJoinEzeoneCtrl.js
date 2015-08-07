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
                $scope.visibilityMsg = {
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
             * Toggle visibility of the modal box for joinig request/response
             */
            $scope.toggleEzeoneModalVisibility = function()
            {
                $scope.modalAddEzeoneVisible = !$scope.modalAddEzeoneVisible;
            }

            /**
             * check if the ezeOneValidationStatus have changed its value
             * & Validate EzeoneId API call response
             *
             * @response:
             * 1:mapping already exists
             * -1:valid EZEID and no connection exists
             * -2:Invalid EZEID
             */
            $scope.$watch('ezeOneValidationStatus',function(){
                /* append @ if it is not there */
                var keyword = $scope.ezeOneModalBox.ezeone;
                var ezeone = parseInt(getGroupNameType(keyword)) ==  0?"@"+keyword:keyword;
                $scope.ezeOneModalBox.ezeone = ezeone;
                var membershipStatus = $scope.ezeOneMembershipStatus;
                /* take suitable action */
                resetVisibilityVar();
                hideAllMsg();
                hideConnectFormElements();
                hideJoinGroupResponseForm();
                if(parseInt($scope.ezeOneValidationStatus) == -1)//Valid Ezeid proceed
                {
                    $scope.visibilityBtn.connectBtn = true;
                    $scope.visibilityForm.relation = true;
                    $scope.isEzeOneIdValid = true;
                }
                else if(parseInt($scope.ezeOneValidationStatus) == 1)//mapping already exists
                {
                    if(membershipStatus == 1)
                    {
                        $scope.visibilityMsg.alreadyMemberMsg = true;
                    }
                    else if(membershipStatus == 0 && $scope.isLoggedInUserRequeser == 0)
                    {
                        $scope.visibilityForm.groupJoinRequestForm = true;
                    }
                    else if(membershipStatus == 0 && $scope.isLoggedInUserRequeser == 1)
                    {
                        $scope.visibilityMsg.alreadyRequestedMsg = true;
                    }
                    $scope.isEzeOneIdValid = true;
                }
            });

            /**
             * Hide the already member msg
             */
            function hideAllMsg()
            {
                $scope.visibilityMsg.alreadyMemberMsg = false;
                $scope.visibilityMsg.alreadyRequestedMsg = false;
            }
            /**
             * Hide the connect btn
             */
            function hideConnectFormElements()
            {
                $scope.visibilityMsg.connectBtn = false;
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