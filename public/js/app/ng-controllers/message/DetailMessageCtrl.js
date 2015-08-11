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
            console.log("detail message");
            if(typeof msgId == undefined || !msgId > 0)
            {
                /* redirect to inbox page */
                redirectInboxPage();
            }

            $scope.messageData = [];

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
                loadFullMessageApi().then(function(data){
                        console.log(data);
                    $scope.messageData = data;
                },
                function()
                {
                    redirectInboxPage();
                });
            }

            /**
             * redirect to inbox page
             */
            function redirectInboxPage()
            {
                //$location.url('/message');
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
        }]);