angular.module('ezeidApp').controller('BusinessManagerCtrl',[
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
    '$route',
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
        $route
        ) {

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

        $scope.activeTemplate = null;
        $scope.activeModule = null;


        var modules = [
            {
                title : ($rootScope._userInfo.SalesModuleTitle) ? $rootScope._userInfo.SalesModuleTitle : 'Sales',
                permission : ($rootScope._userInfo.UserModuleRights) ? $rootScope._userInfo.UserModuleRights[0] : 0,
                listType : ($rootScope._userInfo.SalesItemListType) ? $rootScope._userInfo.SalesItemListType : 0,
                message : ($rootScope._userInfo.SalesFormMsg) ? $rootScope._userInfo.SalesFormMsg : '',
                icon : 'glyphicon glyphicon-stats',
                type : 'sales'
            },
            {
                title : ($rootScope._userInfo.AppointmentModuleTitle) ? $rootScope._userInfo.AppointmentModuleTitle :'Reservation',
                permission : ($rootScope._userInfo.UserModuleRights) ? $rootScope._userInfo.UserModuleRights[1] : 0,
                listType : ($rootScope._userInfo.ReservationItemListType) ? $rootScope._userInfo.ReservationItemListType : 0,
                message : ($rootScope._userInfo.ReservationFormMsg) ? $rootScope._userInfo.ReservationFormMsg : '',
                icon : 'glyphicon glyphicon-calendar',
                type : 'reservation'
            },
            {
                title : ($rootScope._userInfo.HomeDeliveryModuleTitle) ? $rootScope._userInfo.HomeDeliveryModuleTitle : 'Home Delivery',
                permission : ($rootScope._userInfo.UserModuleRights) ? $rootScope._userInfo.UserModuleRights[2] : 0,
                listType : ($rootScope._userInfo.HomeDeliveryItemListType) ? $rootScope._userInfo.HomeDeliveryItemListType : 0,
                message : ($rootScope._userInfo.HomeDeliveryFormMsg) ? $rootScope._userInfo.HomeDeliveryFormMsg : '',
                icon : 'glyphicon glyphicon-cutlery',
                type : 'home-delivery'
            },
            {
                title : ($rootScope._userInfo.ServiceModuleTitle) ? $rootScope._userInfo.ServiceModuleTitle : 'Service',
                permission : ($rootScope._userInfo.UserModuleRights) ? $rootScope._userInfo.UserModuleRights[3] : 0,
                listType : 1,
                message : ($rootScope._userInfo.ServiceFormMsg) ? $rootScope._userInfo.ServiceFormMsg : '',
                icon : 'glyphicon glyphicon-dashboard',
                type : 'service'
            },
            {
                title : ($rootScope._userInfo.CVModuleTitle) ? $rootScope._userInfo.CVModuleTitle :'Resume',
                permission : ($rootScope._userInfo.UserModuleRights) ? $rootScope._userInfo.UserModuleRights[4] : 0,
                listType : 1,
                message : ($rootScope._userInfo.CVFormMsg) ? $rootScope._userInfo.CVFormMsg : '',
                freshers : ($rootScope._userInfo.FreshersAccepted) ? true : false,
                icon : 'glyphicon glyphicon-briefcase',
                type : 'resume'
            }
        ];


        $scope.modules = $filter('moduleFilter')(modules);


        if(!$routeParams['subview']){
          if($scope.modules.length < 1){
            $location.path('/');
          }
          else
          {
              if($scope.modules[0].permission > 0){
                  $location.path('/business-manager/'+$scope.modules[0].type);
              }
              else{
                  var message = 'You do not have permission to access any business module !' +
                      ' Please enable the access right from configuration';
                  if($rootScope._userInfo.MasterID){
                      message = 'You don not have permission to access any business module ! Please ask your administrator for access rights';
                  }
                  Notification.error({ message : message, delay : MsgDelay});
                  $location.path('/');
              }
          }
        }
        else{
            switch($routeParams['subview']){
                case 'sales':
                    $scope.activeTemplate = 'html/business-manager/sales/sales.html';
                    $scope.activeModule = 'sales';
                    break;
                case 'reservation':
                    $scope.activeTemplate = 'html/business-manager/reservation/reservation.html';
                    $scope.activeModule = 'reservation';
                    break;
                case 'home-delivery':
                    $scope.activeTemplate = 'html/business-manager/home-delivery/home-delivery.html';
                    $scope.activeModule = 'home-delivery';
                    break;
                case 'service':
                    $scope.activeTemplate = 'html/business-manager/service/service.html';
                    $scope.activeModule = 'service';
                    break;
                case 'resume' :
                    $scope.activeTemplate = 'html/business-manager/resume/resume.html';
                    $scope.activeModule = 'resume';
                    break;
                default:
                  if($scope.modules.length < 1){
                    $location.path('/');
                  }
                  else
                  {
                    $location.path('/business-manager/'+$scope.modules[0].type);
                    $scope.activeModule = null;
                  }
                  break;
            }
        }


        /**
         * Initializes business manager after loading configuration
         */
        var init = function(){
            $scope.count = [1,2,3,4,5,6,7,8,9,10];
        };


        $scope.masterUser = null;



        /**
         * Load master user details (in case of sub user)
         * @param masterId
         * @returns {*}
         */
        $scope.loadMaster = function(masterId){
            var defer = $q.defer();
            $http({
                url : GURL + 'ewtGetSearchInformation',
                params : {
                    Token : ($rootScope._userInfo.Token) ? $rootScope._userInfo.Token : 2,
                    TID : masterId,
                    CurrentDate : moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                }
            }).success(function(resp){
                    if(resp && resp.length > 0 && resp !== 'null'){
                        $scope.masterUser = resp[0];
                        defer.resolve(resp);
                    }
                    else{
                        defer.reject();
                    }
            }).error(function(err){
                    defer.reject();
            });
            return defer.promise;
        };

        if($rootScope._userInfo.IDTypeID && $rootScope._userInfo.IDTypeID !== 2){
            $location.path('/');
        }
        else{
            /**
             * If user is subuser then load details of master user and find if he is verified or not
             */
            //if($rootScope._userInfo.MasterID){
            //    $scope.$broadcast('$preLoaderStart');
            //
            //    /**
            //     * @todo MasterID is fetching wrong details
            //     * Fix that by telling Gowri to make a new API call for fetching master details from subuser to
            //     * Check that EZEID is verified or not
            //     */
            //
            //    $scope.loadMaster($rootScope._userInfo.MasterID).then(function(){
            //        $scope.$broadcast('$preLoaderStop');
            //        /**
            //         * Uncomment code below once @todo is done
            //         *
            //         */
            //
            //        if($scope.masterUser.EZEIDVerifiedID !== 2){
            //            $location.path('/');
            //        }
            //        else{
            //            init();
            //        }
            //        //init();
            //    },function(){
            //        Notification.error({ message : 'An error occurred', delay : MsgDelay});
            //        $location.path('/');
            //    });
            //}
            //
            //else{
                if($rootScope._userInfo.Verified !== 2){
                    /**
                     * If EZEID is not verified user will not be able to use business manager
                     */
                    $location.path('/');
                }
                else{
                    init();
                }
            //}
        };








        /**
         * Opens the link
         * @param link
         */
        $scope.openLink = function(link){
            $location.path(link);
        };




    }]);
