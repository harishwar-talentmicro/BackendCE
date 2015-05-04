(function(){
    angular.module('ezeidApp').controller('SalesCtrl',[
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


            $scope.showModal = false;


            $(document).on('click','.popover-close',function(){
                $('*[data-toggle="popover"]').popover('hide');
            });


            $scope.toggleModalBox = function(){
              console.log('hello');
              console.log($scope.showModal);
              $scope.showModal = !$scope.showModal;
              console.log($scope.showModal);
            };


        }]);

        })();
