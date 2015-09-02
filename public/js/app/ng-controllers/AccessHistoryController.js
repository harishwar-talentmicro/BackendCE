
/***
 * HistoryController
 */
angular.module('ezeidApp').controller('HistoryController',[
    '$scope', '$rootScope', '$http', 'Notification', '$filter', '$interval','GURL','MsgDelay','$location',
    function ($scope, $rootScope, $http, Notification, $filter, $interval,GURL,MsgDelay,$location) {
    var msgSen = this;
    var MsgDelay = 2000;
    msgSen.msgs = [];

    //Pagination settings
    $scope.pageSize = 10;//Results per page
    $scope.pageCount = 0;//Everything starts with a 0 - 10,20,30 etc.
    $scope.totalResult = 0;//Total results
    $scope.resultThisPage = 0;//Total results you got this page

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
            }
            else {
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
          //  LoadHistory(_pageValue);
            LoadHistory();
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

   /* function LoadHistory(_pageValue){*/
    function LoadHistory(){
        msgSen.msgs = [];
        $http({
            method: 'get',

            url : GURL + 'ewtGetAccessHistory',
            method : 'GET',
            params : {
                TokenNo : $rootScope._userInfo.Token,
                page_size : $scope.pageSize,
                page_count : $scope.pageCount
            }
       }).success(function (data)
        {

            if (data.status)
            {
                $scope.totalResult = data.count;
                $scope.resultThisPage = data.data.length;
                $scope.paginationVisibility();

                for (var i = 0; i < data.data.length; i++)
                {
                    data.data[i].AccessDate = convertTimeToLocal(data.data[i].AccessDate,'DD-MMM-YYYY hh:mm A');
                    msgSen.msgs.push(data.data[i]);
                }
            }
            else
            {
                msgSen.showMoreButton = false;
                Notification.error({ message: "No History found..!", delay: MsgDelay });
            }
        });
    }


    /* redirect to full details page */
    $scope.redirectFullPage = function(ezeoneId)
    {
        /* redirect to full detail page */
        $location.url('/'+ezeoneId);
    };

        /*Code for pagging*/
        /**
         * Incerement the page count of the pagination after every pagination: NEXT
         */
        function incrementPageCount()
        {
            $scope.pageCount += $scope.pageSize;
        }

        /**
         * Decrement the page count of the pagination after every pagination: PREVIOUS
         */
        function decrementPageCount()
        {
            $scope.pageCount -= $scope.pageSize;
        }

        /**
         * load the next results
         */
        $scope.paginationNextClick = function()
        {
            $scope.pageCount += $scope.pageSize;
            LoadHistory();
            $scope.paginationVisibility();
        };

        /**
         * load the previous results
         */
        $scope.paginationPreviousClick = function()
        {
            $scope.pageCount -= $scope.pageSize;
            LoadHistory();
            $scope.paginationVisibility();
        };

        /**
         * Toggle the visibility of the pagination buttons
         */
        $scope.paginationPreviousVisibility = true;
        $scope.paginationNextVisibility = true;

        $scope.paginationVisibility = function()
        {
            var totalResult = parseInt($scope.totalResult);
            var currentCount = parseInt($scope.pageCount);
            var resultSize = parseInt($scope.pageSize);

            /* initial state */
            if((totalResult <= (currentCount+resultSize)) && currentCount == 0)
            {
                $scope.paginationNextVisibility = false;
                $scope.paginationPreviousVisibility = false;
            }
            else if(currentCount == 0)
            {
                $scope.paginationNextVisibility = true;
                $scope.paginationPreviousVisibility = false;
            }
            else if((currentCount + resultSize) >= totalResult)
            {
                $scope.paginationNextVisibility = false;
                $scope.paginationPreviousVisibility = true;
            }
            else
            {
                $scope.paginationNextVisibility = true;
                $scope.paginationPreviousVisibility = true;
            }
        };



}]);
