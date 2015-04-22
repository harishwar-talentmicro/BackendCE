angular.module('ezeidApp').controller('BlackListWhiteListController',[
    '$http', '$rootScope', '$scope', '$timeout', 'Notification', '$filter', '$q','GURL' ,
    function($http, $rootScope, $scope, $timeout, Notification, $filter, $q,GURL){

    var blacklist = this;
    blacklist._info={};
    blacklist.msgs = [];
    var MsgDelay = 2000;
    blacklist._info.Tag = "";
    blacklist._info.RelationType = "";

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
            window.location.href = "/";
        }
    }

    $scope.$watch('_userInfo.IsAuthenticate', function () {
        if ($rootScope._userInfo.IsAuthenticate == true) {
            getBlackWhiteListInfo();

       } else {
            window.location.href = "/";
        }
    });

    /**
     * Function for converting UTC time from server to LOCAL timezone
     */
    var convertTimeToLocal = function(timeFromServer,dateFormat){
        if(!dateFormat){
            dateFormat = 'DD-MMM-YYYY hh:mm A';
        }
        var mom1 = moment(timeFromServer,dateFormat);
        var ret =  mom1.add((mom1.utcOffset()),'m').format(dateFormat);
        return ret;
    };

    /**
     * Function for converting LOCAL time (local timezone) to server time
     */
    var convertTimeToUTC = function(localTime,dateFormat){
        if(!dateFormat){
            dateFormat = 'DD-MMM-YYYY hh:mm A';
        }
        return moment(localTime).utc().format(dateFormat);
    };

    function getBlackWhiteListInfo() {
         $http({
            method: 'get',
            url: GURL + 'ewtGetWhiteBlackList?Token=' + $rootScope._userInfo.Token
        }).success(function (data) {
                 if (data != 'null')
                 {
                     blacklist.msgs = [];
                     for (var i = 0; i < data.length; i++) {
                            data[i].CreatedDate = convertTimeToLocal(data[i].CreatedDate,'DD-MMM-YYYY');
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

      //Below code is for getting relationship type
      $http({ method: 'get', url: GURL + 'ewmGetRelationType?LangID=1' }).success(function (data) {
         blacklist.Relations = data;
       });

    //Add To Black list / White list
    function addToWhiteListBlackList()
    {
        blacklist._info.RelationType = blacklist._info.RelationType == "" || !blacklist._info.RelationType ? 0 : blacklist._info.RelationType;
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
                    //Check for already in list or not
                    $http({ method: 'get', url: GURL + 'ewtGetWhiteListCount?Token='+ $rootScope._userInfo.Token + '&EZEID=' + blacklist._info.EZEID + '&List=' + blacklist._info.List }).success(function (data) {

                        if(data.WhiteListCount == 0)
                        {
                            //Add To Black list / White list
                            addToWhiteListBlackList();
                        }
                        else
                        {
                            // Confirm Popup open
                            $('#confirmChange').slideDown();
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
    this.closeDeleteConfirmDialog = function () {
        $scope.recordtoDelete = "";
        $('#confirmDelete').slideUp();
    };

    //close addConfirmConfirmDialog
    this.closeAddConfirmDialog = function () {
        blacklist._info.List = "";
        blacklist._info.RelationType = "";
        blacklist._info.EZEID = "";
        blacklist._info.Tag = "";
        $('#confirmChange').slideUp();
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
}]);