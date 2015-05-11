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
        '/signup'
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
            .when('/busslist',{templateUrl: 'html/businesslist.html'})
            .when('/terms',{templateUrl: 'html/terms.html'})
            .when('/help',{templateUrl: 'html/help.html'})
            .when('/legal',{templateUrl: 'html/legal.html'})
            .when('/blackwhitelist',{templateUrl: 'html/blacklistwhitelist.html'})
            .when('/salesenquiry',{templateUrl: 'html/salesenquiry.html'})
            .when('/bulksalesenquiry',{templateUrl : 'html/bulksalesenquiry.html'})
            .when('/viewdirection',{templateUrl : 'html/viewdirection.html'})
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
    ezeid.run(['$location','$rootScope','CLOSED_ROUTES','$routeParams','$timeout','UNAUTHORIZED_ROUTES','OPEN_ROUTES','$queryLsToken',
        function($location,$rootScope,CLOSED_ROUTES,$routeParams,$timeout,UNAUTHORIZED_ROUTES,OPEN_ROUTES,$queryLsToken){

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

        $rootScope.$on('$routeChangeStart',function(event,next,current){
            /**
             * Fetching userInfo From local storage here if userInfo is not found in $rootScope
             */
            if(!$rootScope._userInfo){
                $rootScope._userInfo = $queryLsToken;
            }

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


    }]);
    /************************************** Run Configuration ends here ****************************/
})();