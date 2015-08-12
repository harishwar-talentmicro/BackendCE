/**
 * Responsible for loading and do various action on outbox message
 *
 * @author: Sandeep[EZE ID]
 * @since 20150812
 */
angular.module('ezeidApp').
    controller('OutboxMessageCtrl', [
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
            console.log("outbox message loaded");
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////INITIALIZATIONS/////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /* Loading the messages */
            $scope.outboxMsg = [];

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////DEFAULT CALLS///////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            loadOutboxMessage();

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////ACTION//////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function loadOutboxMessage()
            {
                loadOutboxMessageApi().then(function(data){
                    $scope.outboxMsg = data;
                });
            };

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////API CALLS///////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            /**
             * Api call for loading all the messages which user have ever sent to some one
             */
            function loadOutboxMessageApi()
            {
                var defer = $q.defer();
                $http({
                    url : GURL + 'outbox_messages',
                    method : "GET",
                    params :{
                        token : $rootScope._userInfo.Token,
                        ezeone_id:$rootScope._userInfo.ezeone_id
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