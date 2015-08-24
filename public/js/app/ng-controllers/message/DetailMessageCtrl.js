/**
 * Controller to manage all the functionaloties in OUTBOX
 *
 * @author: Krunal[EZE One]
 * @since 20150717
 */
angular.module('ezeidApp').
    controller('DetailMessageCtrl', [
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
        '$anchorScroll',
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
            $anchorScroll
        ) {
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////INITIALIZATION//////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            var msgId = $scope.msgId = $routeParams.msg;

            $scope.isThreadRedirectionBtnVisible = false;
            if(msgId)
                $scope.isThreadRedirectionBtnVisible = true;

            /* set group id */
            var groupId = 0;
            if(typeof $routeParams.id !== undefined)
                groupId = $routeParams.id;

            /* set group type */
            var groupType = 0;//0:Group,1:Ezeone
            if(typeof $routeParams.type !== undefined)
                groupType = $routeParams.type;

            /* Validations */
            if((typeof msgId == undefined && !parseInt(msgId) > 0 ) || (typeof $routeParams.id == undefined  && !parseInt(msgId) > 0 ))
            {
                /* redirect to inbox page */
                //redirectInboxPage();
            }

            /* PRIORITY */
            $scope.priority = [
                "High",
                "Medium",
                "Low"
            ];

            $scope.messageData = [];
            $scope.composeMessageTemplate = "";
            $scope.detailMessagModuleLoaded = true;
            $scope.responseMsgId = 0;
            /* pushing group data */
            $scope.isGroupLoaded = false;
            $scope.groupDetailsData = [];

            $scope.groupName = "";//////////////////@todo

            $scope.groupData = {
                name:"",
                id:0,
                desc:"",
                type:0,//0-group, 1-individual, 2-msgid
                date:"",
                isPublic:0
            }

            $scope.pageSize = 10;
            $scope.pageCount = 0;
            $scope.totalResult = 0;

            $scope.module = {
                group:false,
                ezeone:false
            };

            $scope.msg = {
                pageSize:5,
                pageCount:0,
                totalResult:0,
                paginationNextVisibility:false,
                paginationPreviousVisibility:false
            };
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////DEFAULT CALLS///////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            loadFullViewMessage();
            populateGroupInfo();
            $scope.unreadFun;
            $scope.getUnreadMessageCount();
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////ACTION//////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            /**
             * Load the full view of the message [includes threads of chatting]
             */
            function loadFullViewMessage()
            {
                /* load normal messages based on msg ID */
                if($routeParams.id)
                {
                    loadGroupMessage();
                }
                /* load message specific to group or Ezeone id *///@todo
                else
                {
                    loadFullViewMessageCall();
                }

                /* set the group data */

            }

            /**
             * Load full view of a inbox message
             */
            function loadFullViewMessageCall()
            {
                loadFullMessageApi().then(function(data){
                        if(!data)
                            return;

                        $scope.module.ezeone = true;

                        if(data[0].count)
                            $scope.msg.totalResult = data[0].count;
                        /* re configure pagination for inbox-message visibility */
                        msgPaginationVisibility();

                        $scope.messageData = data;
                    },
                    function()
                    {
                        redirectInboxPage();
                    });
            }

            /**
             * Get the group messages
             */
            function loadGroupMessage()
            {
                loadGroupMessageThreadApi().then(function(data){

                        $scope.module.group = true;

                        var message = data;
                        if($routeParams.type == 0)
                        {
                           message = data.messages;
                        }

                        if(!message || !message.length > 0)
                        {
                            $scope.totalMessage = 0;
                            paginationVisibility();
                            return;
                        }

                        $scope.totalMessage = message[0].count;

                        /* pagination reconfigration */
                        paginationVisibility();

                        if($routeParams.type && $routeParams.type == 0)
                        {
                            message = data.messages;
                            $scope.isGroupLoaded = true;
                        }
                        else
                        {
                            $scope.isGroupLoaded = false;
                        }

                        if(!message.length > 0)
                            return;

                        message = reverseArray(message);
                        $scope.messageData = message;
                    },
                    function(){
                        redirectInboxPage();
                    });
            }

            function reverseArray(data)
            {
                if(!data || !data.length > 0)
                    return;

                var arr = [];
                var len = data.length;
                for(var i = 0;i < len;i++)
                {
                    arr.push(data[len - (i+1)]);
                }


                return arr;
            }

            /**
             * redirect to inbox page
             */
            function redirectInboxPage()
            {
                Notification.error({ message: "Error Occured! Try again later", delay: MsgDelay });
                $location.url('/message');
            }

            /**
             * Load form to reply a group or individual message
             */
            $scope.loadReplyMsgForm = function()
            {
                setReplyMessageData();
                $scope.composeMessageTemplate = "html/message/composeMessage.html";
            }

            /**
             * Get appropriate index from group message array
             */
            function getGroupDataIndex()
            {
                if($routeParams.id)
                {
                    var index = $scope.messageData.indexOfWhere('GroupID',$routeParams.id);
                    return index;
                }
            }

            /**
             * Initiate Download attachment
             */
            $scope.initiateDownload = function(tid)
            {
                downloadAttachmentApi(tid).then(function(data){
                        if(!data)
                            return;
                        /* Download Attachment */
                        data.Attachment = data.Attachment.split('base64,')[1];
                        downloadBlob(data.Attachment, data.filename, data.mime_type);
                    },
                    function(){
                        Notification.error({ message: "Download Failed! Try again later", delay: MsgDelay });
                    });
            }

            /**
             * Function for downloading blob
             * @param data
             * @param mimeType
             * @param fileName
             */

            var downloadBlob = function (data, fileName,mimeType) {
                $timeout(function(){
                    console.log('a');
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.style = "display: none";
                    var blob = UtilityService._convertBase64ToBlob(data,mimeType);
                    if(!blob)
                        console.log("Error Occured");
                    console.log(blob);
                    var url = window.URL.createObjectURL(blob);
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    window.URL.revokeObjectURL(url);
                },1000);

            };

            /**
             * populate the basic info of group at the begining of the chat
             */
            function populateGroupInfo()
            {
                var type = 2;
                var msgId = 0;

                if($routeParams.msg)
                    msgId = $routeParams.msg;
                else if($routeParams.id && $routeParams.type)
                {
                    type = $routeParams.type;
                    msgId = $routeParams.id;
                }
                /* set id and type */
                $scope.groupData.type = type;
                $scope.groupData.id = msgId;

                getGroupInformation(msgId,type).then(function(data){
                    setGroupData(data);
                });
            }

            function setGroupData(data)
            {
                if(!data)
                    return;

                if($routeParams.msg)
                {
                    $scope.groupData.name = data[0].sender;
                    $scope.groupData.date = data[0].createddate;
                }
                else if($routeParams.id && $routeParams.type == 0)
                {
                    $scope.isGroupLoaded = true;
                    $scope.groupData.name = data[0].groupname;
                    $scope.groupData.desc = data[0].aboutgroup;
                    $scope.groupData.isPublic = data[0].autojoin;
                    $scope.groupData.date = data[0].createddate;

                }
                else if($routeParams.id && $routeParams.type == 1)
                {
                    $scope.groupData.name = data[0].name;
                }
                /* set the GROUP ID for which the message has to be sent as REPLY */
                $scope.groupData.id = data[0].groupid;
                /* set message type */
                $scope.groupData.type = data[0].idtype;
            }

            function setReplyMessageData()
            {
                $scope.receiverArr = [];
                /* set the receiver's data */
                var temp = {
                    GroupID:$scope.groupData.id,
                    GroupType:$scope.groupData.type,
                    GroupName:$scope.groupData.name
                };

                $scope.receiverArr.push(temp);
            }

            //////////////////////////////////////PAGINATION for groups/////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /**
             * load the next results
             */
            $scope.paginationNextClick = function()
            {
                $scope.pageCount += $scope.pageSize;
                /* trigger next results */
                loadMorePagination();
                paginationVisibility();
            }

            /**
             * load the previous results
             */
            $scope.paginationPreviousClick = function()
            {
                $scope.pageCount -= $scope.pageSize;
                /* trigger previous results */
                //loadOutboxMessage();
                paginationVisibility();
            }

            /**
             * Toggle the visibility of the pagination buttons
             */
            $scope.paginationNextVisibility = true;
            $scope.paginationPreviousVisibility = true;
            function paginationVisibility()
            {
                console.log("pagination called");
                var totalResult = parseInt($scope.totalMessage);
                var currentCount = parseInt($scope.pageCount);
                var resultSize = parseInt($scope.pageSize);

                /* initial state */
                if((totalResult < (currentCount+resultSize)) && currentCount == 0)
                {
                    $scope.paginationNextVisibility = false;
                    $scope.paginationPreviousVisibility = false;
                }
                else if(currentCount == 0)
                {
                    $scope.paginationNextVisibility = true;
                    $scope.paginationPreviousVisibility = false;
                }
                else if((currentCount + resultSize) >= totalResult)
                {
                    $scope.paginationNextVisibility = false;
                    $scope.paginationPreviousVisibility = true;

                }
                else{
                    $scope.paginationNextVisibility = true;
                    $scope.paginationPreviousVisibility = true;
                }
            };

            function loadMorePagination()
            {
                if($routeParams.id)
                {
                    loadGroupMessageThreadApi().then(function(data){
                        var message = data;
                        if($routeParams.type == 0)
                        {
                            message = data.messages;
                        }
                        if(!message || !message.length > 0)
                            return;

                        //message = reverseArray(message);
                        message.forEach(function(data){
                            $scope.messageData.unshift(data);
                        });
                    });
                }
            }

            /**
             * Responsible for redirecting to message-thread page
             */
            $scope.redirectToMessageThread = function()
            {
                if(!$scope.messageData || !$scope.messageData.length > 0)
                    return;

                var receiverId = $rootScope._userInfo.TID;
                //console.log("------");
                //console.log($scope.messageData);
                //console.log(receiverId);
                var index = $scope.messageData.indexOfWhere('receiverid',receiverId);
                console.log(index);
                if(index == -1)
                    return;

                /* get group Id and group type */
                var groupId = $scope.messageData[index].redirectionid;
                var groupType = $scope.messageData[index].grouptype;
                if(!groupId || parseInt(groupType) == NaN)
                    return;

                /* final redirection */
                $location.url('/message/details?id='+groupId+'&type='+groupType);
            }
            //////////////////////////////////////PAGINATION for INBOX//////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /**
             * load the next results
             */
            $scope.msgPaginationNextClick = function()
            {
                $scope.msg.pageCount += $scope.msg.pageSize;
                /* trigger next results */
                msgLoadMorePagination();
                msgPaginationVisibility();
            }

            /**
             * load the previous results
             */
            $scope.msgPaginationPreviousClick = function()
            {
                $scope.msg.pageCount -= $scope.msg.pageSize;
                /* trigger previous results */
                msgPaginationVisibility();
            }

            /**
             * Toggle the visibility of the pagination buttons
             */
            $scope.msg.paginationNextVisibility = true;
            $scope.msg.paginationPreviousVisibility = true;
            function msgPaginationVisibility()
            {
                console.log("pagination called");
                var totalResult = parseInt($scope.msg.totalResult);
                var currentCount = parseInt($scope.msg.pageCount);
                var resultSize = parseInt($scope.msg.pageSize);

                /* initial state */
                if((totalResult < (currentCount+resultSize)) && currentCount == 0)
                {
                    $scope.msg.paginationNextVisibility = false;
                    $scope.msg.paginationPreviousVisibility = false;
                }
                else if(currentCount == 0)
                {
                    $scope.msg.paginationNextVisibility = true;
                    $scope.msg.paginationPreviousVisibility = false;
                }
                else if((currentCount + resultSize) >= totalResult)
                {
                    $scope.msg.paginationNextVisibility = false;
                    $scope.msg.paginationPreviousVisibility = true;

                }
                else{
                    $scope.msg.paginationNextVisibility = true;
                    $scope.msg.paginationPreviousVisibility = true;
                }
                console.log((currentCount + resultSize) ,totalResult);
                console.log( $scope.msg.paginationNextVisibility,$scope.msg.paginationPreviousVisibility);
            };

            function msgLoadMorePagination()
            {
                if($routeParams.msg)
                {
                    loadFullMessageApi().then(function(data){

                        var message = data;
                        if($routeParams.type == 0)
                        {
                            message = data.messages;
                        }
                        if(!message || !message.length > 0)
                            return;

                        //message = reverseArray(message);
                        message.forEach(function(data){
                            $scope.messageData.push(data);
                        });
                    });
                }
            }

            $scope.anchorScroll = function()
            {
                $location.hash('compose-message');
                $('#compose-message').click();
                $anchorScroll();
            }

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////API CALLS///////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            /**
             * API calls to laod the full view of message
             * @returns {*}
             */
            function loadFullMessageApi()
            {
                $scope.$emit('$preLoaderStart');
                var defer = $q.defer();
                $http({
                    url : GURL + 'message_full_view',
                    method : "GET",
                    params :{
                        token : $rootScope._userInfo.Token,
                        tid: msgId,
                        page_size: $scope.msg.pageSize,
                        page_count: $scope.msg.pageCount
                    }
                }).success(function(resp){
                    $scope.$emit('$preLoaderStop');
                    if(!resp.status)
                    {
                        defer.reject();
                        return defer.promise;
                    }
                    else if(resp.data)
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

            /**
             * Api call on loading all the messages of a GROUP or INDIVIDUAL
             */
            function loadGroupMessageThreadApi()
            {
                $scope.$emit('$preLoaderStart');
                var defer = $q.defer();
                var msgId;
                $http({
                    url : GURL + 'load_group_message',
                    method : "GET",
                    params :{
                        token : $rootScope._userInfo.Token,
                        id: $routeParams.id,
                        group_type: $routeParams.type,
                        page_size: $scope.pageSize,
                        page_count: $scope.pageCount
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
             * Api call for download attachment
             * @param tid : id of the message for which download has to be done
             * @returns {*}
             */
            function downloadAttachmentApi(tid)
            {
                $scope.$emit('$preLoaderStart');
                var defer = $q.defer();
                var msgId;
                $http({
                    url : GURL + 'message_attachment',
                    method : "GET",
                    params :{
                        token : $rootScope._userInfo.Token,
                        tid : tid
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
        }]);