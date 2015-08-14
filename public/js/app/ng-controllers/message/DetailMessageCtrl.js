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
            ////////////////////////////////////INITIALIZATION//////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            var msgId = $routeParams.msg;

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
                redirectInboxPage();
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

            $scope.pageSize = 10;
            $scope.pageCount = 0;
            $scope.totalResult = 0;
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////DEFAULT CALLS///////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            loadFullViewMessage();
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////ACTION//////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            /**
             * Load the full view of the message [includes threads of chatting]
             */
            function loadFullViewMessage()
            {
                /* load normal messages based on msg ID */

                if(!$routeParams.id)
                {
                    loadFullMessageApi().then(function(data){
                            console.log(data);
                            $scope.messageData = data;
                        },
                        function()
                        {
                            redirectInboxPage();
                        });
                    return;
                }
                /* load message specific to group or Ezeone id *///@todo
                else
                {
                    loadGroupMessageThreadApi().then(function(data){
                            console.log(data);
                            if(!data.length > 0)
                                return;

                            console.log(data);
                            $scope.messageData = data;
                            console.log($scope.messageData);
                        },
                        function(){
                            console.log("Invalide Code");
                        });
                }
            }

            /**
             * redirect to inbox page
             */
            function redirectInboxPage()
            {
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

            function setReplyMessageData()
            {
                console.log($scope.messageData);
                /* load the reply data in the form */
                $scope.receiverArr = [];
                if(!$scope.messageData || !$scope.messageData.length > 0)
                {
                    return false;
                }

                var groupName = "";
                /**
                 * Getting the index of that message from all the array of messages to whom the logged In user would R.E.P.L.Y
                 */

                index = takeLatestGroupIndexFromMsg();

                /* Fetching out the name of the sender */
                if($scope.messageData[index].grouptype == 1)//1:EZEONE,0:Group
                    groupName = $scope.messageData[index].name;
                else
                    groupName = $scope.messageData[index].sender;

                /* FOR prepoulating receiver list in reply message DOM */
                var temp = {
                    GroupID:$scope.messageData[index].GroupID,
                    GroupType:$scope.messageData[index].grouptype,
                    GroupName:groupName
                };

                $scope.receiverArr.push(temp);
                $scope.responseMsgId = msgId;
            }

            /**
             * Traverse the message and get the sender ID
             * @returns {*|number}
             */
            function takeLatestGroupIndexFromMsg()
            {
                console.log($scope.messageData);
                var loggedInId = $rootScope._userInfo.TID;
                for(var i = 0; i < $scope.messageData.length; i++)
                {
                    console.log(parseInt($scope.messageData[i].senderid), loggedInId)
                    if(parseInt($scope.messageData[i].senderid) !== loggedInId)
                    {
                        return i;
                    }
                }
            }

            /**
             * Get appropriate index from group message array
             */
            function getGroupDataIndex()
            {
                if($routeParams.id)
                {
                    console.log("Hi");
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
                        console.log(data);
                    },
                    function(){
                        Notification.error({ message: "Download Failed! Try again later", delay: MsgDelay });
                    });
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
                var defer = $q.defer();
                $http({
                    url : GURL + 'message_full_view',
                    method : "GET",
                    params :{
                        token : $rootScope._userInfo.Token,
                        tid: msgId
                    }
                }).success(function(resp){
                    if(!resp.status)
                    {
                        defer.reject();
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
                var defer = $q.defer();
                var msgId;
                $http({
                    url : GURL + 'load_group_message',
                    method : "GET",
                    params :{
                        token : $rootScope._userInfo.Token,
                        id: groupId,
                        group_type: groupType,
                        page_size: $scope.pageSize,
                        page_count: $scope.pageCount
                    }
                }).success(function(resp){
                    if(!resp.status)
                    {
                        defer.reject();
                        return defer.promise;
                    }
                    defer.resolve(resp.data.messages);
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