
angular.module('ezeidApp').controller('CongratulationsController',['$http', '$rootScope', '$scope', 'Notification', 'GURL',
    function($http, $rootScope, $scope, Notification, GURL){

    var profile = this;
    profile._info = {};
    // set default ..public place
    profile._info.IDTypeID =3;
    if ($rootScope._userInfo) {
    }
    else {
        if (typeof (Storage) !== "undefined") {
            var encrypted = localStorage.getItem("_token");
            if (encrypted) {
                var decrypted = CryptoJS.AES.decrypt(encrypted, "EZEID");
                var Jsonstring = decrypted.toString(CryptoJS.enc.Utf8);
                if (Jsonstring) {
                    $rootScope._userInfo = JSON.parse(Jsonstring);
                }
            }
            else {
                $rootScope._userInfo = {
                    IsAuthenticate: false,
                    Token: '',
                    FirstName: '',
                    Type:'',
                    Icon:''
                };
            }
        } else {
            // Sorry! No Web Storage support..
            $rootScope._userInfo = {
                IsAuthenticate: false,
                Token: '',
                FirstName: '',
                Type:'',
                Icon:''
            };
            alert('Sorry..! Browser does not support');
            window.location.href = "index.html";
        }
    }

    $scope.$watch('_userInfo.IsAuthenticate', function () {
        if ($rootScope._userInfo.IsAuthenticate == true) {
            GetUserDetails();
        }
    });

    //Custom Methods
    function GetUserDetails() {
        //$rootScope.IsIdAvailable = true;
        $http({
            method: 'get',
            url: GURL + 'ewtGetUserDetails?Token=' + $rootScope._userInfo.Token
        }).success(function (data) {
                 profile._info = data[0];
            });
    }

}]);