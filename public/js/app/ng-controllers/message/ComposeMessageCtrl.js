/**
 * Controller to manage all the functionaloties in OUTBOX
 *
 * @author: Krunal[EZE One]
 * @since 20150715
 */
angular.module('ezeidApp').
    controller('ComposeMessageCtrl', [
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
            $scope.composeMsg = [];

            /* visibility */
            $scope.visibilityHtml = {
                groupSuggestion:false
            };
            $scope.visibilityMsg = false;

            /* Error messages goes here */
            $scope.errorMsgArr = [
                "Invalid Ezeone",
                "You are not connected to this user/group",
                "No result found",
                "Can't search an empty group or Ezeone Id"
            ];
            $scope.currentErrorMsg = 0;

            /* group suggestion list */
            $scope.groupSuggestionList = [];

            /* receiver array */
            $scope.receiverArr = [];
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////DEFAULT CALLS///////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            resetDefault();
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////ACTION//////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function resetDefault()
            {
                $scope.currentErrorMsg = 0;
                $scope.groupSuggestionList = [];
                $scope.receiverArr = [];
                $scope.visibilityMsg = false;
                $scope.visibilityHtml.groupSuggestion = false;
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
             * Initiate the process to send message
             */
            $scope.sendMessage = function()
            {

            }

            /**
             * Validate weather there is enough data to proceed with the send-message
             */
            function validateMessage()
            {

            }

            /**
             * validat weather the entered keyword is valid or not
             * @param keyword
             */
            $scope.validateEnteredEzeoneOrGroup = function(keyword)
            {
                /* reset all validation flags before searching */
                resetKeywordValidation();
                if(!keyword || !keyword.length > 0)
                {
                    showErroMsg(3);
                    return;
                }
                /* check if the keyword is group name or ezeone id */
                var keyType = getGroupNameType(keyword);//0:Group,1:Ezeone
                if(parseInt(keyType) == 0)//get suggestion list
                {
                    groupSuggestionList(keyword);
                }
                else if(parseInt(keyType) == 1)//Ezeone just check the validation
                {

                }
            }

            /**
             * reset all validation flags before searching
             */
            function resetKeywordValidation()
            {
                $scope.visibilityHtml.groupSuggestion = false;
                $scope.visibilityMsg = false;
            }

            /**
             * Gives a suggestion list to the enterd group[called from DOM]
             * and it is connected to the logged in user
             */
            function groupSuggestionList(keyword)
            {
                getGroupSuggestionApi(keyword).then(function(data){
                    if(data && data.length > 0)
                    {
                        /* populate suggestion data */
                        $scope.groupSuggestionList = data;
                        /* open up suggestion list */
                        $scope.visibilityHtml.groupSuggestion = true;
                    }
                        else{
                        showErroMsg(2);
                    }
                },
                function(){
                    showErroMsg(2);
                });
            }

            /**
             * responsible for showing error message during ezeone id or group validation
             * @param msgId
             */
            function showErroMsg(msgId)
            {
                $scope.visibilityMsg = true;
                $scope.currentErrorMsg = msgId;
            }

            /**
             * reset all the flags
             */
            function resetVisibilityFlags()
            {
                $scope.visibilityMsg = false;
                $scope.groupSuggestionList = [];
            }

            /**
             * Validate if the entered ezeone is valid and logged in user is connected
             */
            function validateEzeone()
            {

            }

            /**
             * select one of the suggestion
             * @param index
             */
            $scope.selectGroupSuggestion = function(index)
            {
                var groupType = 1;
                var name = $scope.receiverArr.GroupName;
                var groupId = $scope.receiverArr.tid;//@todo
                appendReceiverArr(groupType,name,groupId);
            }

            /**
             * append the receiver list - post validation
             * @param groupType:: 0-Ezeone, 1-Group
             * @param name
             * @param groupId
             */
            function appendReceiverArr(groupType,name,groupId)
            {

            }

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////API CALLS///////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            function getGroupSuggestionApi(keyword)
            {
                var defer = $q.defer();
                $http({
                    url : GURL + 'suggestion_list',
                    method : "GET",
                    params :{
                        keywordsForSearch:keyword,
                        token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){
                    defer.resolve(resp.data);
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                    defer.resolve();
                });
                return defer.promise;
            }

        }]);