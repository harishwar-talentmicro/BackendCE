/**
 * All controllers from App.js shifted here
 */



angular.module('ezeidApp').controller('NotifyController', function ($scope, $rootScope, $http, Notification, $filter, $interval,GURL,MsgDelay) {
    var msgSen = this;
    var _pageValue = 1;
    var MsgDelay = 2000;
    msgSen.Status={id:"0,1",label:'New/Accepted'};
    msgSen.MessageType={id:"0,1,2,3,4,5,6",label:'All'};
    msgSen.msgs = [];
    var showPaging = "N";
    var Miliseconds = 300000;
    var RefreshTime = Miliseconds;
    var AutoRefresh = true;

    $interval(function() {
        msgSen.msgs = [];
        if(AutoRefresh == true)
        {
            LoadNotifications(_pageValue);
        }

    },RefreshTime);

    this.refreshNotificationGrid=function(){
        msgSen.msgs = [];
        LoadNotifications(_pageValue);
        RefreshTime = Miliseconds;
    };

    $scope.$on('$locationChangeStart', function( event ) {
        AutoRefresh = false;
    });

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
            LoadNotifications(_pageValue);
        }
        else {
            window.location.href = "#/";
        }
    });

    /**
     * Function for converting UTC time from server to LOCAL timezone
     */
    var convertTimeToLocal = function(timeFromServer,dateFormat){
        if(!dateFormat){
            dateFormat = 'DD-MMM-YYYY hh:mm A';
        }
        var x = new Date(timeFromServer);
        var mom1 = moment(x);
        return mom1.add((mom1.utcOffset()),'m').format(dateFormat);
    };

    /**
     * Function for converting LOCAL time (local timezone) to server time
     */
    var convertTimeToUTC = function(localTime,dateFormat){
        if(!dateFormat){
            dateFormat = 'DD-MMM-YYYY hh:mm A';
        }
        return moment(localTime,dateFormat).utc().format(dateFormat);
    };

    function LoadNotifications(_pageValue){

        //_pageValue = _pageValue + 1;
        $http({ method: 'get', url: GURL + 'ewtGetMessages?TokenNo=' + $rootScope._userInfo.Token +'&Page='+_pageValue+'&Status='+msgSen.Status.id +'&MessageType='+msgSen.MessageType.id}).success(function (data) {

            //if (data.length > 0) {
            if (data != 'null') {
                for (var i = 0; i < data.length; i++) {
                    data[i].TaskDateTime = convertTimeToLocal(data[i].TaskDateTime,'DD-MMM-YYYY hh:mm A');
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
                Notification.error({ message: "No Message found..!", delay: MsgDelay });
            }
        });
    }

    this.filterStatus=function(){
        msgSen.msgs = [];
        _pageValue = 1;
        LoadNotifications(_pageValue);
    };

    this.filterMessageType=function(){
        msgSen.msgs = [];
        _pageValue = 1;
        LoadNotifications(_pageValue);
    };

    msgSen.statusDrpDwn=[{id:"0,1",label:'New/Accepted'},{id:"0",label:'New'},{id:"1",label:'Accepted'},{id:"2",label:'Completed'},{id:"3",label:'Rejected'},{id:"0,1,2,3",label:'All'}];

    msgSen.typeDrpDwn=[{id:"0",label:'Normal Message'},{id:"1",label:'Sales Enquiry'},
        {id:"2",label:'Home Delivery'},{id:"3",label:'Reservation'},{id:"4",label:'Support Request'},{id:"5",label:'CV'},{id:"6",label:'Appointment'},{id:"0,1,2,3,4,5,6",label:'All'}];


    //More button click
    this.getNotifications = function (){
        _pageValue = _pageValue + 1;
        LoadNotifications(_pageValue);
    };

    //open Add Note Form
    this.openAddNoteForm = function (_item){
        msgSen.item =_item;
        msgSen.Message =_item.Message;
        msgSen.NoteMessage =_item.Notes;
        $('#Notes_popup').slideDown();
    };

    //Send Add Note
    this.sendNote = function (_item) {
        if ($rootScope._userInfo.IsAuthenticate == true)
        {
            var sts = {
                TokenNo: $rootScope._userInfo.Token,
                Status: _item.Status,
                TID: _item.TID,
                Notes:msgSen.NoteMessage
            };
            $http({ method: 'post', url: GURL + 'ewtUpdateMessageStatus', data: sts }).success(function (data) {

                if(data.IsUpdated==true){
                    _item.Notes=msgSen.NoteMessage;
                    $('#Notes_popup').slideUp();
                    Notification.success({ message: "Saved...", delay: MsgDelay });
                }
                else
                {
                    Notification.error({ message: 'Sorry..! not saved', delay: MsgDelay });
                }
            });
        }
        else
        {
            //Redirect to Login page
            $('#SignIn_popup').slideDown();
        }
    };

    // Close Add Note
    this.closeAddNoteForm = function () {
        $('#Notes_popup').slideUp();
    };

    //btn Groups..Below code is for status button
    $scope.checkModel = {
        New: false,
        InProcess: false,
        Closed: false,
        Dropped:false
    };

    this.UpdateStatus = function (item, status) {
        var sts = {
            TokenNo: $rootScope._userInfo.Token,
            Status: status,
            TID: item.TID
        };
        $http({ method: 'post', url: GURL + 'ewtUpdateMessageStatus', data: sts }).success(function (data) {
            var _obj = data;
            if(data.IsUpdated==true){
                item.Status=status;
                Notification.success({ message: "Status updated...", delay: MsgDelay });
            }
            else
            {
                Notification.error({ message: 'Sorry..! Status not updated', delay: MsgDelay });
            }
        });
    };
});