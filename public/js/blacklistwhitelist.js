angular.module('ezeidApp').controller('BlackListWhiteListController', function($http, $rootScope, $scope, $timeout, Notification, $filter, $q){

    var blacklist = this;
    blacklist._info={};
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
            window.location.href = "index.html";
        }
    }

    $scope.$watch('_userInfo.IsAuthenticate', function () {
        if ($rootScope._userInfo.IsAuthenticate == true) {
            //getBlackWhiteListInfo();
        } else {
            window.location.href = "index.html";
        }
    });

    $http({ method: 'get', url: GURL + 'ewmGetRelationType?LangID=1' }).success(function (data) {

       /* var _obj = { RelationID: 0, RelationshipTitle: '--Relation--'};
        data.splice(0, 0, _obj);
        blacklist._info.RelationID = _obj.RelationID;*/

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
                    blacklist._info.Token = $rootScope._userInfo.Token;
                    console.log(blacklist._info);
                    $http({ method: 'post', url: GURL + 'ewtSaveWhiteBlackList', data: blacklist._info }).success(function (data) {
                        console.log(data);
                    });
                }
             });
    };

    blacklist.listType = [{ id: 2, label: "Black List" }, { id: 1, label: "White List" }];
    blacklist.Tags = [{ id: 1, label: "ID" }, { id: 2, label: "PP" }, { id: 3, label: "DL" }, { id: 4, label: "D1" }, { id: 5, label: "D2" }, { id: 6, label: "CV" }];
});