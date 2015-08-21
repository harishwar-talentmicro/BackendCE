(function () {


    /**
     * Returns index of Object from array based on Object Property
     * @param key
     * @returns {number}
     */
    Array.prototype.indexOfWhere = function(key,value){
        var resultIndex = -1;
        var found = false;
        for(var i = 0; i < this.length; i++){
            for(var prop in this[i]){
                if(this[i].hasOwnProperty(key) && this[i][key] === value){
                    resultIndex = i;
                    found = true;
                    break;
                }
            }
            if(found){
                break;
            }
        }
        return resultIndex;
    };



    var ezeid = angular.module('ezeidApp',
        [
            'ngHeader',
            'ngRoute',
            'ngFooter',
            'ui-notification',
            'angularjs-dropdown-multiselect',
            'ngTouch',
            'ngAnimate',
            'ui.calendar',
            'textAngular'
        ]);

    //ezeid.value('GURL',"/");
    ezeid.value('GURL',"http://104.199.128.226:3001/api/");
    ezeid.value('MURL',"https://ms2.ezeone.com/stomp");

    ezeid.value('MsgDelay',2000);

    /**
     * These routes will be password protected, only authenticated users can access these routes
     */
    ezeid.value('CLOSED_ROUTES',[
        '/business-manager',
        '/business-manager/:subview',
        '/profile-manager',
        '/profile-manager/:subview',
        '/message',
        '/message/:action',
        '/compose-message',
        '/job',
        '/jobdetail',
        '/appliedjob',
        '/access-history',
        '/:ezeond/sales',
        '/:ezeone/home_delivery',
        '/:ezeone/helpdesk',
        '/:ezeone/resume',
        '/:ezeone/reservation'
    ]);

    /**
     * These routes will not consider whether user is authenticated or not
     * and user can navigate to these routes as public routes whether logged in or not
     * The only difference between normal open routes and this is that it adds up the _userInfo to $rootScope if
     * user is logged in
     */
    ezeid.value('OPEN_ROUTES',[
        '/searchDetails'
    ]);

    /**
     * These routes will not be navigated when user is logged in
     * for eg. User cannot open signup page while he is logged in
     */
    ezeid.value('UNAUTHORIZED_ROUTES',[
        '/signup',
        '/reset_password/:ezeone/:reset_code'
    ]);

    ezeid.value('MsgDelay',5000);


    ezeid.value('$queryLsToken',(function(){
        if(typeof(localStorage) !== "undefined"){
            try {
                var encrypted = localStorage.getItem("_token");
                if (encrypted) {
                    var decrypted = CryptoJS.AES.decrypt(encrypted, "EZEID");
                    var jsonString = {};
                    try {
                        jsonString = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
                    }
                    catch (ex) {
                    }
                    return jsonString;
                }
                else {
                    return {};
                }
            }
            catch(ex){
                return {};
            }
        }
        else{
            alert('You are using and outdated browser! Please upgrade to newer browser');
            return {};
        }
    })());

    /*Mxg*/
    ezeid.value('$notify',(function(){
        /**
         *
         * @param userName
         * @param token
         * @param groupId
         * @param icallBack: connection ccallback - called post connection
         * @param dcallBack: On disconnection
         * @param mcallBack: on message arrival
         * @param url
         */
        var x = function(userName, token, groupId, icallBack, dcallBack, mcallBack, url){
            /********************** WebStomp Code (MQTT) *********************************/
            if((typeof(icallBack)).toString() !== "function"){
                icallBack = function(){
                    console.log('No callback passed to icallBack');
                };
            }

            if((typeof(dcallBack)).toString() !== "function"){
                dcallBack = function(){
                    console.log('No callback passed to dcallBack');
                };
            }
            if((typeof(mcallBack)).toString() !== "function"){
                mcallBack = function(m){
                    console.log('No callback passed to mcallBack');
                    console.log(m);
                };
            }

            var username = userName,
                password = token,
                vhost    = "/",
                url      = url,
                queue    = "topic"; // To translate mqtt topics to
            // stomp we change slashes
            // to dots


            // Use SockJS
            Stomp.WebSocketClass = SockJS;
            var ws = new SockJS(url);
            var client = Stomp.over(ws);
            client.heartbeat.outgoing = 0;
            client.heartbeat.incoming = 0;

            console.log('I executed');


            var on_connect = function (){
                client.subscribe("/"+queue+"/."+groupId,function(m){
                    mcallBack(m);
                });
                icallBack();
            };

            var on_connection_error = function (){

                dcallBack();//reconnection try @todo
            };

            // Connect
            client.connect(
                username,
                password,
                on_connect,
                on_connection_error,
                vhost
            );
            /********************** WebStomp Code (MQTT) end *********************************/

        };
        return x;
    })());


    ezeid.value('CONSTATUS',false);

    /**
     * HTTP Interceptor for detecting token expiry
     * Reloads the whole page in case of Unauthorized response from api
     */
    ezeid.factory('ezeidInterceptor',['$rootScope','$timeout','$q',function($rootScope,$timeout,$q){
        return {
            responseError : function(respErr){
                if(respErr.status === 401 && respErr.statusText === 'Unauthorized'){
                    try{
                        localStorage.removeItem("_token");
                    }
                    catch(ex)
                    {

                    }
                    $rootScope._userInfo = null;
                    $rootScope.IsIdAvailable = false;
                    document.cookie = "login=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
//                    Notification.error({message:'Your session has expired! Please login to continue',delay:4000});
                    $timeout(function(){
                        //Reloading page on token expiry
                        window.location.reload(true);
                    },500);
                }

                if(respErr.status === 0 && respErr.statusText === ''){
                    respErr.statusText = 'Unable to resolve domain';
                    respErr.data = 'Check your internet connection';
                }
                return( $q.reject( respErr ) );
            }
        };
    }]);



    ezeid.config(['$routeProvider','$httpProvider','$locationProvider',function($routeProvider,$httpProvider,$locationProvider){

        angular.element(function () {
            angular.element('[data-toggle="popover"]').popover()
        });

        $routeProvider
            .when('/',{
                templateUrl: 'html/landing.html',
                controller : 'LandingPageCtrl'
            })
            .when('/wyswyg',{
                templateUrl : 'html/wyswyg.html',
                controller : 'WYSWYGCtrl'
            })
            .when('/messages',{templateUrl: 'html/messages.html'})
            .when('/access-history',{templateUrl: 'html/accesshistory.html'})
            .when('/busslist',{templateUrl: 'html/businesslist.html'})
            .when('/terms',{templateUrl: 'html/terms.html'})
            .when('/help',{templateUrl: 'html/help.html'})
            .when('/legal',{templateUrl: 'html/legal.html'})
            .when('/salesenquiry',{templateUrl: 'html/salesenquiry.html'})
            .when('/bulksalesenquiry',{templateUrl : 'html/bulksalesenquiry.html'})
            .when('/mapView',{templateUrl : 'html/mapPopView.html'})
            .when('/showmapview',{templateUrl : 'html/showmapview.html'})
            .when('/viewdirection',{templateUrl : 'html/viewdirection.html'})
            .when('/signup',{
                templateUrl : 'html/sign-up/sign-up-wizard.html',
                controller : 'SignUpWizardCtrl'
            })
            .when('/business-manager/:subview',{
                templateUrl : 'html/business-manager/business-manager.html',
                controller : 'BusinessManagerCtrl'
            })
            .when('/business-manager',{
                templateUrl : 'html/business-manager/business-manager.html',
                controller : 'BusinessManagerCtrl'
            })
            .when('/profile-manager/:subview',{
                templateUrl : 'html/profile/profile-manager.html',
                controller : 'ProfileManagerCtrl'
            })
            .when('/profile-manager',{
                redirectTo : '/profile-manager/user'
            })
            .when('/landing',{
                templateUrl: 'html/landing.html',
                controller : 'LandingPageCtrl'
            })
            .when('/searchResult',{
                templateUrl: 'html/result.html',
                controller : 'SearchResultCtrl'
            })
            .when('/searchDetails',{
                templateUrl: 'html/informationDetail.html',
                controller : 'InformationDetailCtrl'
            })
            .when('/message/:action',{
                templateUrl: 'html/message/outbox.html',
                controller : 'OutboxPageCtrl'
            })
            .when('/message',{
                templateUrl: 'html/message/outbox.html',
                controller : 'OutboxPageCtrl'
            })
            .when('/appliedjob',{
                templateUrl: 'html/job/applied-job.html',
                controller : 'AppliedJobCtrl'
            })
            .when('/jobappliedsuccess',{
                templateUrl: 'html/job/job-applied-success.html',
                controller : 'JobAppliedSuccessCtrl'
            })
            .when('/jobsearch',{
                templateUrl: 'html/job/job-search-result.html',
                controller : 'JobSearchResultCtrl'
            })
            .when('/jobdetail',{
                templateUrl: 'html/job/job-detail.html',
                controller : 'JobDetailCtrl'
            })
            .when('/payment',{
                templateUrl: 'html/payment-api.html',
                controller : 'paymentApiCtrl'
            })

            .when('/reset_password/:ezeone/:reset_code',{
                templateUrl : 'html/reset_password.html',
                controller : 'ResetPasswordCtrl'
            })
            .when('/:ezeone/sales',{
                templateUrl : 'html/business-manager/sales/sales-front.html',
                controller : 'SalesFrontCtrl'
            })
            .when('/:ezeone/reservation',{
                templateUrl : 'html/business-manager/reservation/reservation-front.html'
            })
            .when('/:ezeone/home_delivery',{
                templateUrl : 'html/business-manager/home-delivery/home-delivery-front.html',
                controller : 'HomeDeliveryFrontCtrl'
            })
            .when('/:ezeone/helpdesk',{
                templateUrl : 'html/business-manager/service/service-front.html',
                controller : 'ServiceFrontCtrl'
            })
            .when('/:ezeone/resume',{
                templateUrl : 'html/business-manager/resume/resume-front.html',
                controller : 'ResumeFrontCtrl'
            })
            .when('/:ezeone',{
                templateUrl : 'html/informationDetail.html',
                controller : 'InformationDetailCtrl'
            })
            .otherwise({redirectTo : '/'});
        $locationProvider.html5Mode(true);
        $httpProvider.interceptors.push("ezeidInterceptor");
    }]);

    /***
     * @ezeid Configuring Route access based on authentication
     */
    ezeid.run(['$location','$rootScope','CLOSED_ROUTES','$routeParams','$timeout',
        'UNAUTHORIZED_ROUTES','OPEN_ROUTES','$queryLsToken', '$notify','MURL','Notification','CONSTATUS',
        function($location,$rootScope,CLOSED_ROUTES,$routeParams,$timeout,
                 UNAUTHORIZED_ROUTES,OPEN_ROUTES,$queryLsToken,$notify,MURL,Notification,CONSTATUS){

            var dataProgress = false;
            var htmlProgress = false;
            $rootScope.unreadMessageCount = 0;

            $rootScope.navigateHome = function(){
                $location.path('/');
            };


            $rootScope.$on('$includeContentRequested',function(){
                htmlProgress = true;
                if(!dataProgress){
                    if($('#progress-overlay').hasClass('hidden')){
                        $('#progress-overlay').removeClass('hidden');
                    }
                }

            });

            $rootScope.$on('$includeContentLoaded',function(){
                htmlProgress = false;
                if(!dataProgress){
                    if(!$('#progress-overlay').hasClass('hidden')){

                        $('#progress-overlay').addClass('hidden');
                    }
                }

            });

            $rootScope.$on('$preLoaderStart',function(){
                dataProgress = true;
                if(!htmlProgress){
                    if($('#progress-overlay').hasClass('hidden')){
                        $('#progress-overlay').removeClass('hidden');
                    }
                }

            });

            $rootScope.$on('$preLoaderStop',function(){
                dataProgress = false;
                if(!htmlProgress){
                    if(!$('#progress-overlay').hasClass('hidden')){
                        $('#progress-overlay').addClass('hidden');
                    }
                }

            });


            var stompInit = function(){
                /**
                 * Fetching userInfo From local storage here if userInfo is not found in $rootScope
                 */
                if($rootScope._userInfo){
                    if($rootScope._userInfo.group_id){
                        if(!CONSTATUS){
                            var notificationFn = $notify;

                            $timeout(function(){

                                notificationFn($rootScope._userInfo.ezeid, $rootScope._userInfo.Token, $rootScope._userInfo.group_id, function(){
                                    // On Connection Time if you want to display anything after connection
                                    CONSTATUS = true;
                                }, function(){
                                    // On disconnection Time if you want to do anything after diconnection
                                    //Try to reconnect
                                    console.log("Connection Failed! Trying to reconnect..");
                                    //Reconnection attempt goes here

                                }, function(m){
                                    // On message arrival Time if you want to do anything after message arrival
                                    // m.body is JSON object stringified, parse this json and you will get exact format written in
                                    // message structure document
                                    console.log("------");
                                    console.log(m.body);

                                }, MURL);
                            },2000);
                        }

                    }
                }
            };

            stompInit();

            /**
             * Checking login while navigating to different pages
             */

            $rootScope.$on('$routeChangeStart',function(event,next,current){
                if($('#progress-overlay').hasClass('hidden')){
                    $('#progress-overlay').removeClass('hidden');
                }
                /**
                 * Fetching userInfo From local storage here if userInfo is not found in $rootScope
                 */
                if(!$rootScope._userInfo){
                    $rootScope._userInfo = $queryLsToken;
                }


                stompInit();

                if(!$rootScope._userInfo.IsAuthenticate){
                    $rootScope._userInfo = {};
                }

                var requestedRoute = '';

                try{
                    requestedRoute = next.$$route.originalPath
                }
                catch(ex){
                    /**
                     * In case if user has opened up the site index he will not be having any requestedRoute
                     * then in that case let him navigate
                     */
                    return;
                }

                /**
                 * Checking requestedRoute presence in our configured route lists
                 */

                if(OPEN_ROUTES.indexOf(requestedRoute) !== -1){
                    /**
                     * If route is Open then let him navigate it
                     */
                    return;
                }

                else if(CLOSED_ROUTES.indexOf(requestedRoute) !== -1){
                    /**
                     * If user is authenticated let him navigate
                     */
                    if($rootScope._userInfo.IsAuthenticate){
                        return;
                    }
                    /**
                     * If user is not logged in then redirect him to home page
                     */
                    else{
                        $rootScope._userInfo = undefined;
                        $location.path('/');
                    }
                }

                else if(UNAUTHORIZED_ROUTES.indexOf(requestedRoute) !== -1){
                    /**
                     * If user is authenticated don't let him navigate to this route
                     */
                    if($rootScope._userInfo.IsAuthenticate){
                        $location.path('/');
                    }
                    /**
                     * If user is not logged in then only let him navigate to this page
                     */
                    else{
                        return;
                    }
                }
                /**
                 * The route which is not added anywhere is considered as publicly open route
                 * and let him navigate to it without checking whether he is logged in or not
                 */
                else{
                    return;
                }

            });

            $rootScope.$on('$routeChangeSuccess',function(){
                if($('#progress-overlay').hasClass('hidden')){
                    $('#progress-overlay').removeClass('hidden');
                }
            });


        }]);
    /************************************** Run Configuration ends here ****************************/
})();