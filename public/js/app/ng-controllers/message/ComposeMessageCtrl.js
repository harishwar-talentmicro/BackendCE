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
            $scope.visibilityReceiverErrorMsg = false;

            /* Error messages goes here */
            $scope.errorMsgArr = [
                "Invalid Ezeone",
                "You are not connected to this user/group",
                "No result found",
                "group/ezeone id already exists in receiver's list"
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
                $scope.visibilityReceiverErrorMsg = false;
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
                if(!keyword || !keyword.length > 1)
                {
                    return;
                }
                /* check if the keyword is group name or ezeone id */
                var keyType = getGroupNameType(keyword);//0:Group,1:Ezeone
                if(parseInt(keyType) == 0)//get suggestion list
                {
                    groupSuggestionList(keyword,1);
                }
                else if(parseInt(keyType) == 1)//Ezeone just check the validation
                {
                    groupSuggestionList(keyword,2);
                }
            }

            /**
             * reset all validation flags before searching
             */
            function resetKeywordValidation()
            {
                $scope.visibilityHtml.groupSuggestion = false;
                $scope.visibilityReceiverErrorMsg = false;
            }

            /**
             * Gives a suggestion list to the enterd group
             * and it is connected to the logged in user
             *
             * @type:1-group,2-individual
             */
            function groupSuggestionList(keyword,type)
            {
                var data = [];
                $scope.groupSuggestionList = [];
                if(parseInt(type) == 1)
                {
                    data = $scope.groupListData;
                }
                else
                {
                    data = $scope.individualMember;
                }

                var count = 0;
                data.forEach(function(data){
                    if(data.GroupName.toLowerCase().indexOf(keyword) >= 0)
                    {
                        $scope.groupSuggestionList.push(data);
                    }
                });

                if($scope.groupSuggestionList.length > 0)
                {
                    /* open up suggestion list */
                    $scope.visibilityHtml.groupSuggestion = true;
                }
                else
                {
                    showErroMsg(2);
                }
                return;
                //getGroupSuggestionApi(keyword).then(function(data){
                //    if(data && data.length > 0)
                //    {
                //        /* populate suggestion data */
                //        $scope.groupSuggestionList = data;
                //        /* open up suggestion list */
                //        $scope.visibilityHtml.groupSuggestion = true;
                //    }
                //        else{
                //        showErroMsg(2);
                //    }
                //},
                //function(){
                //    showErroMsg(2);
                //});
            }

            /**
             * responsible for showing error message during ezeone id or group validation
             * @param msgId
             */
            function showErroMsg(msgId)
            {
                $scope.visibilityReceiverErrorMsg = true;
                $scope.currentErrorMsg = msgId;
            }

            /**
             * reset all the flags
             */
            function resetVisibilityFlags()
            {
                $scope.visibilityReceiverErrorMsg = false;
                $scope.groupSuggestionList = [];
            }

            /**
             * select one of the suggestion
             * @param index
             */
            $scope.selectGroupSuggestion = function(index)
            {
                $scope.composeMsg.MessageTo = "";
                $scope.visibilityHtml.groupSuggestion = false;

                var selectedGroupName = $scope.groupSuggestionList[index].GroupName;
                /* check for duplicate receiver */
                if($scope.receiverArr.indexOfWhere("GroupName",selectedGroupName) >=0)
                {
                    showErroMsg(3);
                    return;
                }

                /* append the receiver's list */
                $scope.receiverArr.push($scope.groupSuggestionList[index]);

            }

            /**
             * check if the receiver is already existing
             * @param index
             */
            $scope.removeReceiver = function(index)
            {
                $scope.receiverArr.splice(index,1);
            }

            $scope.removeMessage = function()
            {
                $scope.visibilityReceiverErrorMsg = false;
            }
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////API CALLS///////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            //function getGroupSuggestionApi(keyword)
            //{
            //    var defer = $q.defer();
            //    $http({
            //        url : GURL + 'suggestion_list',
            //        method : "GET",
            //        params :{
            //            keywordsForSearch:keyword,
            //            token : $rootScope._userInfo.Token
            //        }
            //    }).success(function(resp){
            //        defer.resolve(resp.data);
            //    }).error(function(err){
            //        $scope.$emit('$preLoaderStop');
            //        Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
            //        defer.resolve();
            //    });
            //    return defer.promise;
            //}

        }]);