
/***
 * HistoryController
 */
angular.module('ezeidApp').controller('HistoryController',[
    '$scope', '$rootScope', '$http', 'Notification', '$filter', '$interval','GURL','MsgDelay',
    function ($scope, $rootScope, $http, Notification, $filter, $interval,GURL,MsgDelay) {
    var msgSen = this;
    var _pageValue = 1;
    var MsgDelay = 2000;
    msgSen.msgs = [];
    var showPaging = "N";

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
            LoadHistory(_pageValue);
        }
        else {
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

    function LoadHistory(_pageValue){

        $http({ method: 'get', url: GURL + 'ewtGetAccessHistory?TokenNo=' + $rootScope._userInfo.Token + '&Page='+_pageValue }).success(function (data) {

            if (data != 'null') {
                for (var i = 0; i < data.length; i++) {
                    data[i].AccessDate = convertTimeToLocal(data[i].AccessDate,'DD-MMM-YYYY hh:mm A');
                    msgSen.msgs.push(data[i]);
                    showPaging = data[0]['NextPage'];
                }
                if(showPaging == 'Y')
                {
                    msgSen.showMoreButton = true;
                }
                else
                {
                    msgSen.showMoreButton = false;
                }
            }
            else
            {
                msgSen.showMoreButton = false;
                Notification.error({ message: "No History found..!", delay: MsgDelay });
            }
        });
    }

    //More button click
    this.getMoreHistory = function (){
        _pageValue = _pageValue + 1;
        LoadHistory(_pageValue);
    };
}]);
