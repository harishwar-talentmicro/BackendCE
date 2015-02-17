    var disclaimer = angular.module('ClaimerApp', ['ngHeader','ngFooter']);

    //Global Controller
    disclaimer.controller('HomeController', function ($rootScope, $http) {
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
                        FirstName: ''
                    };
                }
            } else {
                // Sorry! No Web Storage support..
                $rootScope._userInfo = {
                    IsAuthenticate: false,
                    Token: '',
                    FirstName: ''
                };
                alert('Sorry..! Browser does not support');
                window.location.href = "index.html";
            }
        }
    });
