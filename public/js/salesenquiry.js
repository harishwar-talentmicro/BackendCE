angular.module('ezeidApp').controller('salesenquiryController', function($http, $rootScope, $scope, Notification, $filter, $q){

    var msglist = this;
    msglist._info={};
    msglist.msgs = [];
    var MsgDelay = 2000;

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
            window.location.href = "#/";
        }
    }


    $('#datetimepicker1').datetimepicker({
        format: "d-M-Y  h:m A",
        hours12: false,
//        mask: true,
        timepicker:false
    });
    $('#datetimepicker1').siblings('.input-group-addon').on('click',function(){
        $('#datetimepicker1').trigger('focus');
    });


    $scope.toggleModal = function(){
        $scope.showModal = !$scope.showModal;
    };
    $scope.longString = "01234567890123456789";


    //open SalesEnquiryForm
    msglist.openAddNewSalesEnquiryForm = function () {
        $('#addNewSalesEnquiryForm_popup').slideDown();
    };

    //close SalesEnquiryForm
    msglist.closeAddNewSalesEnquiryForm = function () {
        $('#addNewSalesEnquiryForm_popup').slideUp();
    };

});