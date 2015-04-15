angular.module('ezeidApp').controller('ProfileManagerCtrl',[
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


        $scope.dataProgressLoader = {
            dataLoadInProgress : true,
            dataLoadError : false,
            dataLoadComplete : false
        };

        /**
         * UserDetails Model
         * @type {null}
         */
        $scope.userDetails = null;

        /**
         * Progress Status Flag for loading data initially
         * @type {boolean}
         */
        $scope.dataLoadInProgress = true;

        /**
         * Service Call Fails to load data then the flag sets to true
         * @type {boolean}
         */
        $scope.dataLoadError = false;

        /**
         * Service Call Completed to load data, then this flag set to true
         * @type {boolean}
         */
        $scope.dataLoadComplete = false;

        /**
         * Loads user details initially
         * @returns {promise|*}
         */
        $scope.loadUserDetails = function(){
            var promiseResolved = false;
            var defer = $q.defer();
            $http({
                url : GURL + 'ewtGetUserDetails',
                method : 'GET',
                params : {
                    Token : $rootScope._userInfo.Token
                }
            }).success(function(resp){
                    console.log('User Details');
                    console.log(JSON.stringify(resp));
                    promiseResolved = true;
                    if(resp && resp.length > 0 && resp !== 'null'){
                        defer.resolve(true);
                        $scope.userDetails = resp[0];
                    }
                    else{
                        defer.resolve(false);
                    }
                }).error(function(err){
                    promiseResolved = true;
                    defer.reject(err);
                });
            $timeout(function(){
                if(!promiseResolved){
                    defer.reject();
                }
            },10000);

            return defer.promise;
        };

        $scope.loadUserDetails();

        console.log($routeParams);
        if(!$routeParams['subview']){
            $location.path('/profile-manager/user');
        }
        else{
            switch($routeParams['subview']){
                case 'user':
                    $scope.activeTemplate = '/tpl/profile-template.html';
                    break;
                case 'password':
                    $scope.activeTemplate = '/tpl/password-template.html';
                    break;
                case 'weblinks':
                    $scope.activeTemplate = '/tpl/weblinks-template.html';
                    break;
                case 'configuration1':
                    $scope.activeTemplate = '/tpl/configuration-template.html';
                    break;
                case 'configuration' :
                    $scope.activeTemplate = 'html/profile/configuration/configuration.html';
                    break;
                default:
                    $location.path('/profile-manager/user');
                    break;
            }
        }



    }]);