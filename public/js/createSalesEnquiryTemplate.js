
angular.module('ezeidApp').controller('createTemplateController', function($http, $rootScope, $scope, Notification, GURL){

    var mailTemplate = this;
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
            window.location.href = "/home";
        }
    }

    $scope.showAddTemplateFrom = false;

    //Open Add New Mail Template Form
    mailTemplate.addNewMailTemplateForm = function () {
        $scope.showAddTemplateFrom = true;
    };

    //Close Add New Mail Template Form
    mailTemplate.closeNewMailTemplateForm = function () {
        $scope.showAddTemplateFrom = false;
    };

});