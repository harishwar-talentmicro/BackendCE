(function () {
    var ezeid = angular.module('ezeidApp',
        [
            'ngHeader',
            'ngRoute',
            'ngFooter',
            'ui-notification',
            'angularjs-dropdown-multiselect',
            'ngTouch',
            'ngAnimate'
        ]);

    ezeid.value('GURL',"/");
    ezeid.value('MsgDelay',2000);

    /**
     * These routes will be password protected, only authenticated users can access these routes
     */
    ezeid.value('CLOSED_ROUTES',[
        '/business-manager',
        '/business-manager/:subview',
        '/profile-manager',
        '/profile-manager/:subview'
    ]);

    /**
     * These routes will not consider whether user is authenticated or not
     * and user can navigate to these routes as public routes whether logged in or not
     */
    ezeid.value('OPEN_ROUTES',[

    ]);

    /**
     * These routes will not be navigated when user is logged in
     * for eg. User cannot open signup page while he is logged in
     */
    ezeid.value('UNAUTHORIZED_ROUTES',[
        '/signup'
    ]);

    ezeid.value('MsgDelay',5000);


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
//                    Notification.error({message:'Your session has expired! Please login to continue',delay:4000});
                    $timeout(function(){
                        //Reloading page on token expiry
                        window.location.reload(true);

                    },3000);
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
        $routeProvider.when('/index',{templateUrl: 'html/index.html'})
            .when('/',{templateUrl: 'html/home.html'})
            .when('/messages',{templateUrl: 'html/messages.html'})
            .when('/acchist',{templateUrl: 'html/accesshistory.html'})
            .when('/attachcv',{templateUrl: 'html/attachcv.html'})
            .when('/busslist',{templateUrl: 'html/businesslist.html'})
            .when('/terms',{templateUrl: 'html/terms.html'})
            .when('/help',{templateUrl: 'html/help.html'})
            .when('/legal',{templateUrl: 'html/legal.html'})
            .when('/blackwhitelist',{templateUrl: 'html/blacklistwhitelist.html'})
            .when('/salesenquiry',{templateUrl: 'html/salesenquiry.html'})
            .when('/bulksalesenquiry',{templateUrl : 'html/bulksalesenquiry.html'})
            .when('/viewdirection',{templateUrl : 'html/viewdirection.html'})
            .when('/addworkinghours',{templateUrl : 'html/working-hours.html'})
            .when('/signup',{
                templateUrl : 'html/profile/sign-up.html',
                controller : 'SignUpCtrl'
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
            .when('/home',{templateUrl: 'html/home.html'})
            .when('/:ezeid',{
                templateUrl : 'html/home.html'
            })
            .otherwise({redirectTo : '/'});
        $locationProvider.html5Mode(true);
        $httpProvider.interceptors.push("ezeidInterceptor");
    }]);

    /***
     * @ezeid Configuring Route access based on authentication
     */
    ezeid.run(['$location','$rootScope','CLOSED_ROUTES','$routeParams','$timeout','UNAUTHORIZED_ROUTES',
        function($location,$rootScope,CLOSED_ROUTES,$routeParams,$timeout,UNAUTHORIZED_ROUTES){

            $rootScope.$on('$includeContentRequested',function(){
                $rootScope.$broadcast('$preLoaderStart');
            });

            $rootScope.$on('$includeContentLoaded',function(){
                $rootScope.$broadcast('$preLoaderStop');
            });



            $rootScope.$on('$preLoaderStart',function(){
                if($('#progress-overlay').hasClass('hidden')){
                    $('#progress-overlay').removeClass('hidden');
                }
            });

            $rootScope.$on('$preLoaderStop',function(){
                $timeout(function(){
                    if(!$('#progress-overlay').hasClass('hidden')){

                        $('#progress-overlay').addClass('hidden');
                    }
                },2000);
            });

        /**
         * Checking login while navigating to different pages
         */

        $rootScope.$on("$routeChangeStart",function(event,next,current){
            try{
                if(CLOSED_ROUTES.indexOf(next.$$route.originalPath) === -1
                    &&
                    UNAUTHORIZED_ROUTES.indexOf(next.$$route.originalPath) === -1){
                    return;
                }
            }
            catch(ex){
                return;
            }
            /**
             * Checking if the user is authenticated an then routing it to particular url
             */


            if ($rootScope._userInfo) {
                if($rootScope._userInfo.IsAuthenticate){
                    try{
                        if(UNAUTHORIZED_ROUTES.indexOf(next.$$route.originalPath) !== -1){
                            /**
                             * If route is found in unauthorized routes then don't allow him to navigate to that route
                             * when he is already logged in
                             */
                            $location.path('/');
                        }

                    }
                    catch(ex){

                    }
                }
            }
            else {
                if (typeof (Storage) !== "undefined") {
                    var encrypted = localStorage.getItem("_token");
                    if (encrypted) {
                        var decrypted = CryptoJS.AES.decrypt(encrypted, "EZEID");
                        var jsonString = null;
                        try{
                            jsonString = decrypted.toString(CryptoJS.enc.Utf8);
                        }
                        catch(ex){

                        }

                        if (jsonString) {
                            $rootScope._userInfo = JSON.parse(jsonString);
                            if($rootScope._userInfo.hasOwnProperty('IsAuthenticate')){
                                if($rootScope._userInfo.IsAuthenticate == true || $rootScope._userInfo.IsAuthenticate == "true"){
                                    /**
                                     * Allow him to access the site as he is already logged in
                                     */
                                    try{
                                        if(UNAUTHORIZED_ROUTES.indexOf(next.$$route.originalPath) !== -1){
                                            /**
                                             * If route is found in unauthorized routes then don't allow him to navigate to that route
                                             * when he is already logged in
                                             */
                                            $location.path('/');
                                        }
                                    }
                                    catch(ex){
                                        return true;
                                    }

                                    /**
                                     * Allow him to access the site as he is already logged in
                                     */


                                }
                                else{
                                    if(UNAUTHORIZED_ROUTES.indexOf(next.$$route.originalPath) === -1){
                                        /**
                                         * If route is found in unauthorized routes then don't allow him to navigate to that route
                                         * when he is already logged in
                                         */
                                        $location.path('/');
                                    }
                                }
                            }
                            else{
                                if(UNAUTHORIZED_ROUTES.indexOf(next.$$route.originalPath) === -1){
                                    /**
                                     * If route is found in unauthorized routes then don't allow him to navigate to that route
                                     * when he is already logged in
                                     */
                                    $location.path('/');
                                }
                            }
                        }
                        else{
                            if(UNAUTHORIZED_ROUTES.indexOf(next.$$route.originalPath) === -1){
                                /**
                                 * If route is found in unauthorized routes then don't allow him to navigate to that route
                                 * when he is already logged in
                                 */
                                $location.path('/');
                            }
                        }
                    }
                    else {
                        $rootScope._userInfo = {
                            IsAuthenticate: false,
                            Token: '',
                            FirstName: '',
                            Type: '',
                            Icon: ''
                        };
                        if(UNAUTHORIZED_ROUTES.indexOf(next.$$route.originalPath) === -1){
                            /**
                             * If route is found in unauthorized routes then don't allow him to navigate to that route
                             * when he is already logged in
                             */
                            $location.path('/');
                        }
                    }
                }
                else {
                    // Sorry! No Web Storage support..
                    $rootScope._userInfo = {
                        IsAuthenticate: false,
                        Token: '',
                        FirstName: '',
                        Type: '',
                        Icon: ''
                    };
                    alert('Sorry..! Your browser is not supported. Upgrade to latest browser');
                    $location.path('/');
                }
            }
        });

        $rootScope.$on('$routeChangeSuccess',function(){

        });
    }]);
    /************************************** Run Configuration ends here ****************************/
})();