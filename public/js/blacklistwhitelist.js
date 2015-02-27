angular.module('ezeidApp').controller('BlackListWhiteListController', function($http, $rootScope, $scope, $timeout, Notification, $filter, $q){

    var blacklist = this;
    blacklist._info={};
    blacklist.msgs = [];
    var MsgDelay = 2000;
    blacklist._info.Tag = "";

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

    $scope.$watch('_userInfo.IsAuthenticate', function () {
        if ($rootScope._userInfo.IsAuthenticate == true) {
            getBlackWhiteListInfo();

       } else {
            window.location.href = "#/";
        }
    });

    function getBlackWhiteListInfo() {
         $http({
            method: 'get',
            url: GURL + 'ewtGetWhiteBlackList?Token=' + $rootScope._userInfo.Token
        }).success(function (data) {
                 if (data != 'null')
                 {
                     blacklist.msgs = [];
                     for (var i = 0; i < data.length; i++) {
                        // data[i].AccessDate = convertTimeToLocal(data[i].AccessDate,'DD-MMM-YYYY hh:mm A');
                         blacklist.msgs.push(data[i]);
                        // showPaging = data[0]['NextPage'];
                     }
                 }
                 else
                 {
                     blacklist.msgs = [];
                     Notification.error({ message: "No List found..!", delay: MsgDelay });
                 }
            });
    }
      //Below code is for getting relation type
      $http({ method: 'get', url: GURL + 'ewmGetRelationType?LangID=1' }).success(function (data) {
         blacklist.Relations = data;
       });

    //Add EZE Id to black/white list
    this.addToBlackWhiteList=function(){

       //first check EZEID available or not
        $http({
            method: 'get',
            url: GURL + 'ewGetEZEID?EZEID=' + blacklist._info.EZEID
        }).success(function (data) {
                if(data.IsIdAvailable)
                {
                    Notification.error({ message: 'Not Added..!', delay: MsgDelay });
                }
                else
                {
                    blacklist._info.Tag = blacklist._info.Tag == "" || !blacklist._info.Tag ? 0 : blacklist._info.Tag;
                    blacklist._info.Token = $rootScope._userInfo.Token;
                    $http({ method: 'post', url: GURL + 'ewtSaveWhiteBlackList', data: blacklist._info }).success(function (data) {
                        if (data.IsSuccessfull) {
                            Notification.success({ message: 'Saved...', delay: MsgDelay });
                            blacklist._info.List = "";
                            blacklist._info.RelationType = "";
                            blacklist._info.EZEID = "";
                            blacklist._info.Tag = "";
                            getBlackWhiteListInfo();
                        }
                        else {
                            Notification.error({ message: 'Sorry..! not saved ', delay: MsgDelay });
                        }
                   });
                }
             });
    };

    //open DeleteConfirmDialog
    this.openDeleteConfirmDialog = function (_TID) {
            $scope.recordtoDelete = _TID;
            $('#confirmDelete').slideDown();
    };
    //close DeleteConfirmDialog
    this.closeDeleteConfirmDialog = function (_TID) {
        $scope.recordtoDelete = "";
        $('#confirmDelete').slideUp();
    };

    // Delete record from list
    this.deleteFormList=function(){
       var dataToDelete = {
           TID: $scope.recordtoDelete,
           Token: $rootScope._userInfo.Token
        };
        $http({ method: 'post', url: GURL + 'ewtDeleteWhiteBlackList', data: dataToDelete }).success(function (data) {
            if (data.IsSuccessfull) {
                $scope.recordtoDelete = "";
                $('#confirmDelete').slideUp();
                getBlackWhiteListInfo();
                Notification.success({ message: 'Deleted...', delay: MsgDelay });
            }
            else {
                $scope.recordtoDelete = "";
                Notification.error({ message: 'Sorry..! not deleted ', delay: MsgDelay });
            }
        });
    };

    blacklist.listType = [{ id: 2, label: "Black List" }, { id: 1, label: "White List" }];
    blacklist.Tags = [{ id: 1, label: "ID" }, { id: 2, label: "PP" }, { id: 3, label: "DL" }, { id: 4, label: "D1" }, { id: 5, label: "D2" }, { id: 6, label: "CV" }];
});