/**
 * Controller to manage all the functionaloties in OUTBOX
 *
 * @author: Sandeep[EZE ID]
 * @since 20150526
 */
angular.module('ezeidApp').
    controller('outboxPageCtrl', [
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
            var ws = new SockJS(url);
            var client = Stomp.over(ws);
            client.heartbeat.outgoing = 0;
            client.heartbeat.incoming = 0;

            console.log('I executed');

            // Use SockJS
            Stomp.WebSocketClass = SockJS;
            var token = "93b3b2f1-3c3a-11e5-8e61-42010af056e4";
            /*
             var username = "sripad",
             password = "123456",*/
            var username = "@ind1",
                password = token,
                vhost    = "/",
                url      = "https://ms2.ezeone.com/stomp",
                queue    = "topic"; // To translate mqtt topics to
            // stomp we change slashes
            // to dots



            var on_connect = function (){
                client.subscribe("/topic/.152",function(m){
                    console.log('Message received');
                    console.log(m);
                });
            };
            var on_connection_error = function (){};



            // Connect
                client.connect(
                    username,
                    password,
                    on_connect,
                    on_connection_error,
                    vhost
                );


        }]);