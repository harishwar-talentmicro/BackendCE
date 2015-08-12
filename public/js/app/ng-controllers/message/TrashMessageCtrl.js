/**
 * Responsible for loading and do various action on outbox message
 *
 * @author: Sandeep[EZE ID]
 * @since 20150812
 */
angular.module('ezeidApp').
    controller('TrashMessageCtrl', [
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
            console.log("trash message loaded");
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////INITIALIZATIONS/////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /* Loading the messages */
            $scope.trashMsg = [];

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////DEFAULT CALLS///////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            loadTrashMessages();
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////ACTION//////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function loadTrashMessages()
            {
                loadTrashMessageApi().then(function(data)
                {
                   var temp = data;
                    if(temp)
                        $scope.trashMsg.push(temp);
                });
            }


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////API CALLS///////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            /**
             * Api call for getting all the trashed messages
             */
            function loadTrashMessageApi()
            {
                var defer = $q.defer();
                $http({
                    url : GURL + 'messagebox',
                    method : "GET",
                    params :{
                        token : $rootScope._userInfo.Token,
                        ezeone_id : $rootScope._userInfo.ezeone_id,
                        trash:1
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