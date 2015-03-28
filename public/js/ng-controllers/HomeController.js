/**
 * HomeController (for HomePage)
 */
angular.module('ezeidApp').controller('HomeController', function ($rootScope, $http,$scope,GURL,MsgDelay) {
    $rootScope.CLoc = {
        CLat: 12.295810,
        CLong: 76.639381
    };

    if ($rootScope._userInfo) {

    }
    else {
        if (typeof (Storage) !== "undefined") {
            var encrypted = localStorage.getItem("_token");
            if (encrypted) {
                var decrypted = CryptoJS.AES.decrypt(encrypted, "EZEID");
                var Jsonstring = null;
                try{
                    Jsonstring = decrypted.toString(CryptoJS.enc.Utf8);
                }
                catch(ex){}
                if (Jsonstring) {
                    $rootScope._userInfo = JSON.parse(Jsonstring);
                }
            }
            else {
                $rootScope._userInfo = {
                    IsAuthenticate: false,
                    Token: '',
                    FirstName: '',
                    Type: '',
                    Icon: ''
                };
            }
        } else {
            // Sorry! No Web Storage support..
            $rootScope._userInfo = {
                IsAuthenticate: false,
                Token: '',
                FirstName: '',
                Type: '',
                Icon: ''
            };
            alert('Sorry..! Browser does not support');
            window.location.href = "#/";
        }
    }

    $('#datetimepicker1').datetimepicker({
        format: "d-M-Y  h:m A",
        hours12: false
    });
    $('#datetimepicker1').siblings('.input-group-addon').on('click',function(){
        $('#datetimepicker1').trigger('focus');
    });


    /**
     * Opens Help Popup when help link is clicked
     */
    $scope.openHelpPopup = function(){
        $('#Help_popup').css({'position':'fixed'});
        $('#Help_popup > div').css({'margin-top':'0%'});
        $('#Help_popup').slideDown();
    };
    $scope.closeHelpPopup = function(){
        $('#Help_popup').slideUp();
    }
});
