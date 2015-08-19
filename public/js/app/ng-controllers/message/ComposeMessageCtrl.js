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
        'FileToBase64',
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
            UtilityService,
            FileToBase64
        ) {

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////INITIALIZATIONS/////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            $scope.composeMsg = [];
            /* title variable */
            $scope.titleText = "MESSAGE";
            /* visibility */
            $scope.visibilityHtml = {
                groupSuggestion:false,
                disabledSendBtn:false
            };
            $scope.visibilityReceiverErrorMsg = false;
            $scope.visibilityMsgBodyErrorMsg = false;
            $scope.composeMsg.Priority = 0;
            /* Error messages goes here */
            $scope.errorMsgArr = [
                "Invalid Ezeone",
                "You are not connected to this user/group",
                "No result found",
                "group/ezeone id already exists in receiver's list",
                "Please add atleast one receiver",
                "Message body can't be empty"
            ];

            /* PRIORITY */
            $scope.priority = [
                "High",
                "Medium",
                "Low"
            ];
            $scope.currentErrorMsg = 0;
            $scope.currentMsgBodyErrorMsg = 0;

            /* group suggestion list */
            $scope.groupSuggestionList = [];

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////DEFAULT CALLS///////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            if(!$scope.detailMessagModuleLoaded)
                resetDefault();
            /* attachments declarations */
            resetAttachment();
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////ACTION//////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            /**
             * Reset all the values to there default settings on page load
             */
            function resetDefault()
            {
                $scope.currentErrorMsg = 0;
                $scope.currentMsgBodyErrorMsg = 0;

                $scope.groupSuggestionList = [];
                $scope.receiverArr = [];
                $scope.visibilityReceiverErrorMsg = false;
                $scope.visibilityMsgBodyErrorMsg = false;
                $scope.visibilityHtml.groupSuggestion = false;

                $scope.responseMsgId = 0;
                console.log("All compose message data cleared");
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
                /* validate date */
                if(!validateTargetAndExpiryDate())
                {
                    $scope.composeMsg.TargetDate = undefined;
                    $scope.composeMsg.ExpiryDate = undefined;
                    return;
                }

                var previousMsgId = $scope.responseMsgId;
                /* validate message content */
                if(!validateMessageContent())
                {
                    return;
                }
                /* create the smart parameters for sending a message */
                var data = createCommaSeperatedReceiverId();

                /* call the API and send message */
                composeMessageApi(data.toId,data.toIdType,previousMsgId).then(function(){
                        //Message successfully thrown
                        Notification.success({ message: "Message sent successfully!", delay: MsgDelay });
                        $location.url('/message');
                    },
                    function(){
                        //Throw Error Notification
                        Notification.error({ message: "Error occured! Please try again later.", delay: MsgDelay });
                    });
            }

            /**
             * Validate the target and expiry date
             */
            function validateTargetAndExpiryDate()
            {
                var targetDate = $scope.composeMsg.TargetDate;
                var expiryDate = $scope.composeMsg.ExpiryDate;
                var targetDateTimeStamp = new Date(targetDate).getTime();
                var expiryDateTimeStamp = new Date(expiryDate).getTime();
                var currentTimeStamp = new Date().getTime();

                if(targetDate && !expiryDate)
                {
                    return true;
                }

                if(!targetDate && expiryDate)
                {
                    Notification.error({ message: "You can't have an Expiry date without a Target date", delay: MsgDelay });
                    return false;
                }

                if((parseInt(expiryDateTimeStamp) < parseInt(currentTimeStamp)) ||
                    (parseInt(currentTimeStamp) < parseInt(currentTimeStamp)))
                {
                    Notification.error({ message: "Expiry date or Target date can not be in past", delay: MsgDelay });
                    return false;
                }

                if(parseInt(expiryDateTimeStamp) < parseInt(targetDateTimeStamp))
                {
                    Notification.error({ message: "Target date can not be bigger than Expiry date", delay: MsgDelay });
                    return false;
                }
                return true;
            }

            /**
             * convert the receiver array in to comma seperated string
             * @returns {*}
             */
            function createCommaSeperatedReceiverId()
            {
                /* validations */
                if(!$scope.receiverArr)
                {
                    return false;
                }

                if(!$scope.receiverArr.length > 0)
                {
                    return false;
                }
                /* convert to comma seperated string */
                toIdArr = [];
                toIdTypeArr = [];


                $scope.receiverArr.forEach(function(data)
                {
                    toIdArr.push(data.GroupID);
                    toIdTypeArr.push(data.GroupType);
                });

                return {
                    "toId":toIdArr.join(","),
                    "toIdType":toIdTypeArr.join(",")
                };

            }


            /**
             * validate if all the required parameters available for sending the message
             * @returns {boolean}
             */
            function validateMessageContent()
            {
                /* receiver array should not be empty */
                if(!$scope.receiverArr.length > 0)
                {
                    showErroMsg(4);
                    return false;
                }

                /* check if the message is not empty */
                if(typeof $scope.composeMsg.MessageBody == undefined || !$scope.composeMsg.MessageBody)
                {
                    showMsgBodyError(5);
                    return false;
                }

                if(!$scope.composeMsg.MessageBody.length > 0)
                {
                    showMsgBodyError(5);
                    return false;
                }
                return true;
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
                $scope.visibilityMsgBodyErrorMsg = false;
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

                if(!$scope.groupListData || !$scope.individualMember)
                {
                    return;
                }

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

            function showMsgBodyError(msgId)
            {
                $scope.visibilityMsgBodyErrorMsg = true;
                $scope.currentMsgBodyErrorMsg = msgId;
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

                var temp = {
                    GroupID:$scope.groupSuggestionList[index].GroupID,
                    GroupType:$scope.groupSuggestionList[index].GroupType,
                    GroupName:$scope.groupSuggestionList[index].GroupName
                };
                /* append the receiver's list */
                $scope.receiverArr.push(temp);
            }

            /**
             * Triggers file attachment selection by generating a click event on the file input (attachment hidden field)
             */
            $scope.triggerFileAttachment = function(){
                $timeout(function(){
                    $('#tx-attachment').trigger('click');
                },1000);
            };

            /**
             * Function fired when file is selected from the input
             */
            $scope.attachDocument = function(){
                var elem = $('#tx-attachment');
                var attachmentFile = angular.element(elem)[0].files;

                if(parseInt(attachmentFile[0].size/(1024*1024)) > 2){
                    Notification.error({ title : 'File size exceeds', message : 'Maximum file size allowed is 2 MB', delay : MsgDelay});
                }
                else{
                    $scope.file.attachmentName = attachmentFile[0].name;
                    $scope.file.attachmentMimeType = attachmentFile[0].type;
                    $scope.visibilityHtml.disabledSendBtn = true;//Disable send btn
                    FileToBase64.fileToDataUrl(attachmentFile).then(function(data){
                        $scope.file.attachment  = data;
                        $scope.visibilityHtml.disabledSendBtn = false;
                    });
                }
                console.log(attachmentFile);
            };

            function resetAttachment()
            {
                $scope.file = {
                    attachmentName:"",
                    attachmentMimeType:"",
                    attachment:""
                };
            }

            $scope.resetAttachmentData = function()
            {
                resetAttachment();
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

            $scope.removeMsgBodyError = function()
            {
                $scope.visibilityMsgBodyErrorMsg = false;
            }

            $scope.removeMsgBodyError = function()
            {
                $scope.visibilityMsgBodyErrorMsg = false;
            }
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////API CALLS///////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////


            /**
             * API call for sending a message to a user or group
             * @param toId
             * @param toIdType
             * @param previousMsgId
             * @returns {*}
             */
            function composeMessageApi(toId,toIdType,previousMsgId)
            {
                $scope.$emit('$preLoaderStart');
                var defer = $q.defer();
                $http({
                    url : GURL + 'compose_message',
                    method : "POST",
                    data :{
                        token : $rootScope._userInfo.Token,
                        message:$scope.composeMsg.MessageBody,
                        attachment :$scope.file.attachment,
                        mime_type:$scope.file.attachmentMimeType,
                        priority:$scope.composeMsg.Priority,
                        attachment_filename :$scope.file.attachmentName,
                        target_date :UtilityService._convertTimeToServer($scope.composeMsg.TargetDate,"DD-MMM-YYYY H:m","YYYY-MM-DD H:m"),
                        expiry_date :UtilityService._convertTimeToServer($scope.composeMsg.ExpiryDate,"DD-MMM-YYYY H:m","YYYY-MM-DD H:m"),
                        previous_messageID:previousMsgId,
                        to_id:toId,
                        id_type :toIdType//1: individual, 2: group

                    }
                }).success(function(resp){

                    $scope.$emit('$preLoaderStop');
                    if(!resp.status)
                    {
                        defer.reject();
                    }

                    if(resp.data)
                    {
                        defer.resolve(resp.data);
                    }

                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                    defer.reject();
                });

                return defer.promise;
            }
        }]);