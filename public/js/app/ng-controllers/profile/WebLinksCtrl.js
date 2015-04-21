/**
 * Weblinks Controller
 */
angular.module('ezeidApp').controller('WebLinksCtrl',[
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
    'ScaleAndCropImage',
    'MsgDelay',
    '$location',
    '$routeParams',
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
        ScaleAndCropImage,
        MsgDelay,
        $location,
        $routeParams
        ) {


        var isUserDetailsLoaded = false;
        var isWebLinksLoaded = false;

        $scope.webLinks = [];

        $scope.webLinkAddMode = false;

        /**
         * Web Link
         * @type {{TID: number, CreatedDate: string, MasterID: string, URLNo: null, URL: string}}
         */
        $scope.addWebLink =  {
            TID : 0,
            CreatedDate : '',
            MasterID : '',
            URLNo : null,
            URL : ''
        };

        /**
         * Reset web link add form
         */
        $scope.resetWebLink = function(){
            $scope.addWebLink = {
                TID : 0,
                CreatedDate : '',
                MasterID : '',
                URLNo : null,
                URL : ''
            };
        };

        /**
         * Hiding progress loader when userDetails are loaded successfully
         */
        $scope.$watch('userDetails',function(newVal,oldVal){
            if(newVal){
                if(newVal.MasterID){
                    isUserDetailsLoaded = true;
                    if(isUserDetailsLoaded && isWebLinksLoaded){
                        $scope.dataProgressLoader.dataLoadInProgress = false;
                        $scope.dataProgressLoader.dataLoadError = false;
                        $scope.dataProgressLoader.dataLoadComplete = true;
                    }
                }
            }
        });


        /**
         * Load all web links
         * @returns {promise|*}
         */

        $scope.loadWebLinks = function(){
            var defer = $q.defer();
            $http({
                url : GURL + 'ewtWebLink',
                method : 'GET',
                params : {
                    Token : $rootScope._userInfo.Token
                }
            }).success(function(resp){
                    if(resp && resp.length > 0 && resp !== 'null'){
                        $scope.webLinks = resp;
                    }
                defer.resolve(resp);
            }).error(function(err){
                Notification.error({ message : 'An error occurred while loading web links', delay : MsgDelay});
                defer.reject();
            });

            /**
             * If user details and web links are not loaded in 15 seconds error will be shown with reload button
             */
            $timeout(function(){
                if(!(isWebLinksLoaded && isUserDetailsLoaded)){
                    $scope.dataProgressLoader.dataLoadInProgress = false;
                    $scope.dataProgressLoader.dataLoadError = true;
                    $scope.dataProgressLoader.dataLoadComplete = false;
                }
            },15000);
            return defer.promise;
        };

        /**
         * Loading WebLinks
         */
        $scope.loadWebLinks().then(function(){
            isWebLinksLoaded = true;
            if(isUserDetailsLoaded && isWebLinksLoaded){
                $scope.dataProgressLoader.dataLoadInProgress = false;
                $scope.dataProgressLoader.dataLoadError = false;
                $scope.dataProgressLoader.dataLoadComplete = true;
            }
        });


        /**
         * Reloads web links data
         */
        $scope.reload  = function(){
            $scope.dataProgressLoader.dataLoadInProgress = true;
            $scope.dataProgressLoader.dataLoadError = false;
            $scope.dataProgressLoader.dataLoadComplete = false;

            isUserDetailsLoaded = false;
            isWebLinksLoaded = false;

            $scope.loadUserDetails();

            $scope.loadWebLinks().then(function(){
                isWebLinksLoaded = true;
                if(isUserDetailsLoaded && isWebLinksLoaded){
                    $scope.dataProgressLoader.dataLoadInProgress = false;
                    $scope.dataProgressLoader.dataLoadError = false;
                    $scope.dataProgressLoader.dataLoadComplete = true;
                }
            });

        };

        $scope.addWebLinkMode = function(){
            $http({
                url : GURL + 'ewtWebLink',
                method : 'POST',
                data : $scope.addWebLink
            }).success(function(resp){
                if(resp && resp !== 'null' && resp.hasOwnProperty('IsSuccessfull')){
                    if(resp.IsSuccessful){
                        Notification.success({ message : 'Web link added successfully', delay : MsgDelay});
                    }
                    else{
                        Notification.error({ message : 'An error occurred !', delay : MsgDelay});
                    }
                }
                else{
                    Notification.error({ message : 'An error occurred !', delay : MsgDelay});
                }
            }).error(function(err){
                Notification.error({ message : 'An error occurred !', delay : MsgDelay});
            });
        };


        /**
         * Validates URL pattern
         * @param url
         * @returns {boolean}
         */
        var validateURL = function(url){
           if(!url){
               return false;
           }
           var myRegExp =/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;
           return myRegExp.test(url);
        };

    }]);