
angular.module('ezeidApp').controller('bulksalesController', function($http, $rootScope, $scope, Notification, GURL){

    var salesEnquiry = this;
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
    $scope.formTitle = "Bulk Sales Enquiry";

    // Create new mail template
    salesEnquiry.addNewTemplateForm = function () {
       // window.location.href = "#/create-template";
        $scope.formTitle = "Create mail template";
        $scope.showCreateMailTemplate = true;

    };

    // save mail template
    salesEnquiry.saveMailTemplate = function () {
        console.log("Sai123");
    };

});