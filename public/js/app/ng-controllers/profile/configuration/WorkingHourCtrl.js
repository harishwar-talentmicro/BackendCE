
angular.module('ezeidApp').controller('WorkingHourCtrl',['$scope','$rootScope','$http','Notification','$filter','MsgDelay','$interval','GURL',function($scope,$rootScope,$http,Notification,$filter,MsgDelay,$interval,GURL){

    var workingHours = this;
    $scope.result = [];
    $scope.mInfo = {};
    $scope.saveInfo = {};
    $scope.showAddWorkingHourForm = false;
    getWorkingHours();

    /**
     * Function for converting UTC time from server to LOCAL timezone
     */
    var convertTimeToLocal = function(timeFromServer,dateFormat,returnFormat){
        if(!dateFormat){
            dateFormat = 'DD-MMM-YYYY hh:mm A';
        }
        if(!returnFormat){
            returnFormat = dateFormat;
        }
        var x = new Date(timeFromServer);
        var mom1 = moment(x);
        return mom1.add((mom1.utcOffset()),'m').format(returnFormat);
    };

    /**
     * Function for converting LOCAL time (local timezone) to server time
     */
    var convertTimeToUTC = function(localTime,dateFormat,returnFormat){
        if(!dateFormat){
            dateFormat = 'DD-MMM-YYYY hh:mm A';
        }
        if(!returnFormat){
            returnFormat = dateFormat;
        }
        return moment(localTime,dateFormat).utc().format(returnFormat);
    };

    $scope.numbersOnly = function(evt){
        if(evt.keyCode < 48 || evt.keyCode > 57){
            evt.preventDefault();
            return;
        }
    };

    function getWorkingHours()
    {
        $http({ method: 'get', url: GURL + 'ewtWorkingHours',
            params : {
                Token : $rootScope._userInfo.Token
            }
        }).success(function (data) {
                console.log(data);
               if (data != 'null')
                {
                   $scope.result = data;
                }
                else
                {
                   $scope.result = [];
                }
            });
    }

    $scope.openAddWorkingHourForm = function(){
        $scope.showAddWorkingHourForm = true;
    };

    $scope.cancleAddWorkingHours = function(){
        $scope.showAddWorkingHourForm = false;
    };

    function selectedTimeToUtc(selectedTime)
    {
        var x = new Date();
        var today = moment(x.toISOString()).utc().format('DD-MMM-YYYY');

        var currentTaskDate = moment(today+' '+selectedTime).format('DD-MMM-YYYY H:mm');
        return convertTimeToUTC(currentTaskDate,'DD-MMM-YYYY H:mm',"H:mm");
    }

    $scope.addWorkingHours = function(){

        $scope.saveInfo.MO1 = ($scope.mInfo.MO1) ? selectedTimeToUtc($scope.mInfo.MO1) : "";
        $scope.saveInfo.MO2 = ($scope.mInfo.MO2) ? selectedTimeToUtc($scope.mInfo.MO2) : "";
        $scope.saveInfo.MO3 = ($scope.mInfo.MO3) ? selectedTimeToUtc($scope.mInfo.MO3) : "";
        $scope.saveInfo.MO4 = ($scope.mInfo.MO4) ? selectedTimeToUtc($scope.mInfo.MO4) : "";

        $scope.saveInfo.TU1 = ($scope.mInfo.TU1) ? selectedTimeToUtc($scope.mInfo.TU1) : "";
        $scope.saveInfo.TU2 = ($scope.mInfo.TU2) ? selectedTimeToUtc($scope.mInfo.TU2) : "";
        $scope.saveInfo.TU3 = ($scope.mInfo.TU3) ? selectedTimeToUtc($scope.mInfo.TU3) : "";
        $scope.saveInfo.TU4 = ($scope.mInfo.TU4) ? selectedTimeToUtc($scope.mInfo.TU4) : "";

        $scope.saveInfo.WE1 = ($scope.mInfo.WE1) ? selectedTimeToUtc($scope.mInfo.WE1) : "";
        $scope.saveInfo.WE2 = ($scope.mInfo.WE2) ? selectedTimeToUtc($scope.mInfo.WE2) : "";
        $scope.saveInfo.WE3 = ($scope.mInfo.WE3) ? selectedTimeToUtc($scope.mInfo.WE3) : "";
        $scope.saveInfo.WE4 = ($scope.mInfo.WE4) ? selectedTimeToUtc($scope.mInfo.WE4) : "";

        $scope.saveInfo.TH1 = ($scope.mInfo.TH1) ? selectedTimeToUtc($scope.mInfo.TH1) : "";
        $scope.saveInfo.TH2 = ($scope.mInfo.TH2) ? selectedTimeToUtc($scope.mInfo.TH2) : "";
        $scope.saveInfo.TH3 = ($scope.mInfo.TH3) ? selectedTimeToUtc($scope.mInfo.TH3) : "";
        $scope.saveInfo.TH4 = ($scope.mInfo.TH4) ? selectedTimeToUtc($scope.mInfo.TH4) : "";

        $scope.saveInfo.FR1 = ($scope.mInfo.FR1) ? selectedTimeToUtc($scope.mInfo.FR1) : "";
        $scope.saveInfo.FR2 = ($scope.mInfo.FR2) ? selectedTimeToUtc($scope.mInfo.FR2) : "";
        $scope.saveInfo.FR3 = ($scope.mInfo.FR3) ? selectedTimeToUtc($scope.mInfo.FR3) : "";
        $scope.saveInfo.FR4 = ($scope.mInfo.FR4) ? selectedTimeToUtc($scope.mInfo.FR4) : "";

        $scope.saveInfo.SA1 = ($scope.mInfo.SA1) ? selectedTimeToUtc($scope.mInfo.SA1) : "";
        $scope.saveInfo.SA2 = ($scope.mInfo.SA2) ? selectedTimeToUtc($scope.mInfo.SA2) : "";
        $scope.saveInfo.SA4 = ($scope.mInfo.SA4) ? selectedTimeToUtc($scope.mInfo.SA4) : "";
        $scope.saveInfo.SA3 = ($scope.mInfo.SA3) ? selectedTimeToUtc($scope.mInfo.SA3) : "";

        $scope.saveInfo.SU1 = ($scope.mInfo.SU1) ? selectedTimeToUtc($scope.mInfo.SU1) : "";
        $scope.saveInfo.SU2 = ($scope.mInfo.SU2) ? selectedTimeToUtc($scope.mInfo.SU2) : "";
        $scope.saveInfo.SU3 = ($scope.mInfo.SU3) ? selectedTimeToUtc($scope.mInfo.SU3) : "";
        $scope.saveInfo.SU4 = ($scope.mInfo.SU4) ? selectedTimeToUtc($scope.mInfo.SU4) : "";

        $scope.saveInfo.WorkingHrsTemplate = $scope.mInfo.WorkingHrsTemplate;
       /* $scope.saveInfo.SpilloverTime = ($scope.mInfo.SpilloverTime == undefined) ? 0 : $scope.mInfo.SpilloverTime;*/
        $scope.saveInfo.SpilloverTime = 0;
        $scope.saveInfo.TID = 0;
        $scope.saveInfo.Token = $rootScope._userInfo.Token;

        $http({
                method: "POST",
                url: GURL + 'ewtWorkingHours',
                data:$scope.saveInfo
              }).success(function (data) {
                if(data.IsSuccessfull) {
                    $scope.mInfo = {}
                    getWorkingHours();
                    $scope.showAddWorkingHourForm = false;
                    Notification.success({message: "Working Hours saved successfully", delay: MsgDelay});
                }
                else
                {
                    Notification.error({ message: "An error occurred while saving working hours! Please try again", delay: MsgDelay });
                }
            });
         };

        $scope.deleteWorkingHourTemplate = function(_TID){
        $http({ method: 'delete', url: GURL + 'ewtWorkingHours',
                params : {
                    Token : $rootScope._userInfo.Token,
                    TID: _TID
                }
            }).success(function (data) {
                    if(data.IsSuccessfull)
                    {
                        getWorkingHours();
                    }
                });
        };

        function getWorkingHourForEdit()
        {
            $http({ method: 'get', url: GURL + 'ewtWorkingHours',
                params : {
                    Token : $rootScope._userInfo.Token,
                    
                }
            }).success(function (data)
                {
                    console.log(data);
                    if (data != 'null')
                    {
                        $scope.result = data;
                    }
                    else
                    {
                        $scope.result = [];
                    }
                });
        }

        //Edit Working Hours
        $scope.editWorkingHourTemplate = function(_TID){

            console.log(_TID);
            $scope.showAddWorkingHourForm = true;
            getWorkingHourForEdit();

        };

}]);