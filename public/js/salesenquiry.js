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

    //To get status info
    $http({ method: 'get', url: GURL + 'ewtGetStatusType?Token='+ $rootScope._userInfo.Token + '&MasterID=123&FunctionType=1'}).success(function (data) {

        console.log(data);

        /*if ($rootScope._userInfo.Token == false) {
            var _obj = { CountryID: 0, CountryName: '--Country--', ISDCode: '####' };
            data.splice(0, 0, _obj);
            profile._info.CountryID = _obj.CountryID;
        }
        profile.countries = data;*/
    });

    $('#datetimepicker1').datetimepicker({
        format: "d-M-Y  h:m A",
        hours12: false,
//        mask: true,
        timepicker:false
    });
    $('#datetimepicker1').siblings('.input-group-addon').on('click',function(){
        $('#datetimepicker1').trigger('focus');
    });

    $scope.quantity1 = 0;

    $scope.Rate1 = 5;

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

    msglist.Status = [{ id: 0, label: "Read Only" },
                      { id: 1, label: "Read, Create & Update" },
                      { id: 2, label: "Read, Create, Update & Delete" },
                      { id: 3, label: "Read, Update" },
                      { id: 4, label: "Read, Update & Delete" } ];
    msglist.NextAction = [{ id: 1, label: "ID" }, { id: 2, label: "PP" }, { id: 3, label: "DL" }, { id: 4, label: "D1" }, { id: 5, label: "D2" }, { id: 6, label: "CV" }];
});