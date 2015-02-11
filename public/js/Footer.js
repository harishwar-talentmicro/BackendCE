var FooterApp = angular.module('ngFooter', []);

FooterApp.directive('footerSection', function () {
    return {
        restrict: 'EA',
        templateUrl: 'directives/Footer.html',
        controller: function () {
            this.ContactUS = function () {
                window.location.href = "index.html?ID=TALENTMICRO";
            };
        },
        controllerAs: 'FooterCtrl',
        link: function () {
            $('#legal-link').click(function(){
                $("#Legal_popup").slideDown();
            });
            $('#legal-popup-close').click(function(){
                $("#Legal_popup").slideUp();
            });
        }
    };
});