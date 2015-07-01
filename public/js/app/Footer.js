var FooterApp = angular.module('ngFooter', []).controller('footerCtrl', [
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
    '$location',
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
        $location
    ) {
        $scope.modalBox = {
            title : 'Legal',
            class : 'business-manager-modal'
        };

        $scope.showDetailsModal = false;

        $scope.modalVisibility = function()
        {
            /* toggle map visibility status */

            $scope.showDetailsModal = !$scope.showDetailsModal;
        };
    }
]);

FooterApp.directive('footerSection', function () {
    return {


        restrict: 'EA',
        templateUrl: 'directives/Footer.html',
        controller: function ($location) {
            this.ContactUS = function () {
                //window.location.href = "TALENTMICRO";
                $location.path('/TALENTMICRO');
            };

            this.closeLegal = function() {
                $("#Legal_popup").slideUp();
            };
        },
        controllerAs: 'FooterCtrl',
        link: function () {
            $('#legal-link').click(function(){
                //////////console.log("sai");
                $('#Legal_popup').slideDown();
            });
            $('#legal-popup-close').click(function(){
                $("#Legal_popup").slideUp();
            });
        }

    };




});