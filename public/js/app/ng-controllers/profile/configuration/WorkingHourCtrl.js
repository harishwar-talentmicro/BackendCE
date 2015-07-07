
angular.module('ezeidApp').controller('WorkingHourCtrl',['$scope','$rootScope','$http','Notification','$filter','MsgDelay','$interval','GURL',function($scope,$rootScope,$http,Notification,$filter,MsgDelay,$interval,GURL){

    var workingHours = this;
    $scope.result = [];
    $scope.mInfo = {};
    $scope.saveInfo = {};
    $scope.showAddWorkingHourForm = false;
    $scope.saveInfo.TID = 0;
    var workingHourData = "";
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

    function selectedTimeUtcToLocal(selectedTime)
    {
        var x = new Date();
        var today = moment(x.toISOString()).utc().format('DD-MMM-YYYY');

        var currentTaskDate = moment(today+' '+selectedTime).format('DD-MMM-YYYY H:mm');
        return convertTimeToLocal(currentTaskDate,'DD-MMM-YYYY H:mm',"H:mm");
    }

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
        $scope.saveInfo.TID = 0;
        workingHourData = "";

        $scope.mInfo.WorkingHrsTemplate = "";

        $scope.mInfo.MO1 = "";
        $scope.mInfo.MO2 = "";
        $scope.mInfo.MO3 = "";
        $scope.mInfo.MO4 = "";

        $scope.mInfo.TU1 = "";
        $scope.mInfo.TU2 = "";
        $scope.mInfo.TU3 = "";
        $scope.mInfo.TU4 = "";

        $scope.mInfo.WE1 = "";
        $scope.mInfo.WE2 = "";
        $scope.mInfo.WE3 = "";
        $scope.mInfo.WE4 = "";

        $scope.mInfo.TH1 = "";
        $scope.mInfo.TH2 = "";
        $scope.mInfo.TH3 = "";
        $scope.mInfo.TH4 = "";

        $scope.mInfo.FR1 = "";
        $scope.mInfo.FR2 = "";
        $scope.mInfo.FR3 = "";
        $scope.mInfo.FR4 = "";

        $scope.mInfo.SA1 = "";
        $scope.mInfo.SA2 = "";
        $scope.mInfo.SA3 = "";
        $scope.mInfo.SA4 = "";

        $scope.mInfo.SU1 = "";
        $scope.mInfo.SU2 = "";
        $scope.mInfo.SU3 = "";
        $scope.mInfo.SU4 = "";

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

        $scope.saveInfo.MO1 = ($scope.mInfo.MO1) ? selectedTimeToUtc($scope.mInfo.MO1) : selectedTimeToUtc('08:00');
        $scope.saveInfo.MO2 = ($scope.mInfo.MO2) ? selectedTimeToUtc($scope.mInfo.MO2) : selectedTimeToUtc('13:00');
        $scope.saveInfo.MO3 = ($scope.mInfo.MO3) ? selectedTimeToUtc($scope.mInfo.MO3) : selectedTimeToUtc('13:00');
        $scope.saveInfo.MO4 = ($scope.mInfo.MO4) ? selectedTimeToUtc($scope.mInfo.MO4) : selectedTimeToUtc('21:00');

        $scope.saveInfo.TU1 = ($scope.mInfo.TU1) ? selectedTimeToUtc($scope.mInfo.TU1) : selectedTimeToUtc('08:00');
        $scope.saveInfo.TU2 = ($scope.mInfo.TU2) ? selectedTimeToUtc($scope.mInfo.TU2) : selectedTimeToUtc('13:00');
        $scope.saveInfo.TU3 = ($scope.mInfo.TU3) ? selectedTimeToUtc($scope.mInfo.TU3) : selectedTimeToUtc('13:00');
        $scope.saveInfo.TU4 = ($scope.mInfo.TU4) ? selectedTimeToUtc($scope.mInfo.TU4) : selectedTimeToUtc('21:00');

        $scope.saveInfo.WE1 = ($scope.mInfo.WE1) ? selectedTimeToUtc($scope.mInfo.WE1) : selectedTimeToUtc('08:00');
        $scope.saveInfo.WE2 = ($scope.mInfo.WE2) ? selectedTimeToUtc($scope.mInfo.WE2) : selectedTimeToUtc('13:00');
        $scope.saveInfo.WE3 = ($scope.mInfo.WE3) ? selectedTimeToUtc($scope.mInfo.WE3) : selectedTimeToUtc('13:00');
        $scope.saveInfo.WE4 = ($scope.mInfo.WE4) ? selectedTimeToUtc($scope.mInfo.WE4) : selectedTimeToUtc('21:00');

        $scope.saveInfo.TH1 = ($scope.mInfo.TH1) ? selectedTimeToUtc($scope.mInfo.TH1) : selectedTimeToUtc('08:00');
        $scope.saveInfo.TH2 = ($scope.mInfo.TH2) ? selectedTimeToUtc($scope.mInfo.TH2) : selectedTimeToUtc('13:00');
        $scope.saveInfo.TH3 = ($scope.mInfo.TH3) ? selectedTimeToUtc($scope.mInfo.TH3) : selectedTimeToUtc('13:00');
        $scope.saveInfo.TH4 = ($scope.mInfo.TH4) ? selectedTimeToUtc($scope.mInfo.TH4) : selectedTimeToUtc('21:00');

        $scope.saveInfo.FR1 = ($scope.mInfo.FR1) ? selectedTimeToUtc($scope.mInfo.FR1) : selectedTimeToUtc('08:00');
        $scope.saveInfo.FR2 = ($scope.mInfo.FR2) ? selectedTimeToUtc($scope.mInfo.FR2) : selectedTimeToUtc('13:00');
        $scope.saveInfo.FR3 = ($scope.mInfo.FR3) ? selectedTimeToUtc($scope.mInfo.FR3) : selectedTimeToUtc('13:00');
        $scope.saveInfo.FR4 = ($scope.mInfo.FR4) ? selectedTimeToUtc($scope.mInfo.FR4) : selectedTimeToUtc('21:00');

        $scope.saveInfo.SA1 = ($scope.mInfo.SA1) ? selectedTimeToUtc($scope.mInfo.SA1) : selectedTimeToUtc('08:00');
        $scope.saveInfo.SA2 = ($scope.mInfo.SA2) ? selectedTimeToUtc($scope.mInfo.SA2) : selectedTimeToUtc('13:00');
        $scope.saveInfo.SA4 = ($scope.mInfo.SA4) ? selectedTimeToUtc($scope.mInfo.SA4) : selectedTimeToUtc('13:00');
        $scope.saveInfo.SA3 = ($scope.mInfo.SA3) ? selectedTimeToUtc($scope.mInfo.SA3) : selectedTimeToUtc('21:00');

        $scope.saveInfo.SU1 = ($scope.mInfo.SU1) ? selectedTimeToUtc($scope.mInfo.SU1) : selectedTimeToUtc('08:00');
        $scope.saveInfo.SU2 = ($scope.mInfo.SU2) ? selectedTimeToUtc($scope.mInfo.SU2) : selectedTimeToUtc('13:00');
        $scope.saveInfo.SU3 = ($scope.mInfo.SU3) ? selectedTimeToUtc($scope.mInfo.SU3) : selectedTimeToUtc('13:00');
        $scope.saveInfo.SU4 = ($scope.mInfo.SU4) ? selectedTimeToUtc($scope.mInfo.SU4) : selectedTimeToUtc('21:00');

        $scope.saveInfo.WorkingHrsTemplate = $scope.mInfo.WorkingHrsTemplate;
       /* $scope.saveInfo.SpilloverTime = ($scope.mInfo.SpilloverTime == undefined) ? 0 : $scope.mInfo.SpilloverTime;*/
        $scope.saveInfo.SpilloverTime = 0;
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
                else
                {
                    Notification.error({ message: "Working hours template is in used !", delay: MsgDelay });
                }
            })
            .error(function(data, status, headers, config) {
              });
        };

        function getWorkingHourForEdit(_TID)
        {
            $scope.$emit('$preLoaderStart');
            workingHourData = "";
            $http({ method: 'get', url: GURL + 'get_workinghours_details',
                params : {
                    Token : $rootScope._userInfo.Token,
                    TID : _TID
                }
            }).success(function (data)
                {
                    $scope.$emit('$preLoaderStop');
                    if (data.status)
                    {
                        workingHourData = data.data[0];
                        $scope.mInfo.WorkingHrsTemplate = workingHourData.TemplateName;

                        $scope.mInfo.MO1 = (workingHourData.MO1 == "00:00") ? '08:00' : selectedTimeUtcToLocal(workingHourData.MO1);
                        $scope.mInfo.MO2 = (workingHourData.MO2 == "00:00") ? '13:00' : selectedTimeUtcToLocal(workingHourData.MO2);
                        $scope.mInfo.MO3 = (workingHourData.MO3 == "00:00") ? '13:00' : selectedTimeUtcToLocal(workingHourData.MO3);
                        $scope.mInfo.MO4 = (workingHourData.MO4 == "00:00") ? '21:00' : selectedTimeUtcToLocal(workingHourData.MO4);

                        $scope.mInfo.TU1 = (workingHourData.TU1 == "00:00") ? '08:00' : selectedTimeUtcToLocal(workingHourData.TU1);
                        $scope.mInfo.TU2 = (workingHourData.TU2 == "00:00") ? '13:00' : selectedTimeUtcToLocal(workingHourData.TU2);
                        $scope.mInfo.TU3 = (workingHourData.TU3 == "00:00") ? '13:00' : selectedTimeUtcToLocal(workingHourData.TU3);
                        $scope.mInfo.TU4 = (workingHourData.TU4 == "00:00") ? '21:00' : selectedTimeUtcToLocal(workingHourData.TU4);

                        $scope.mInfo.WE1 = (workingHourData.WE1 == "00:00") ? '08:00' : selectedTimeUtcToLocal(workingHourData.WE1);
                        $scope.mInfo.WE2 = (workingHourData.WE2 == "00:00") ? '13:00' : selectedTimeUtcToLocal(workingHourData.WE2);
                        $scope.mInfo.WE3 = (workingHourData.WE3 == "00:00") ? '13:00' : selectedTimeUtcToLocal(workingHourData.WE3);
                        $scope.mInfo.WE4 = (workingHourData.WE4 == "00:00") ? '21:00' : selectedTimeUtcToLocal(workingHourData.WE4);

                        $scope.mInfo.TH1 = (workingHourData.TH1 == "00:00") ? '08:00' : selectedTimeUtcToLocal(workingHourData.TH1);
                        $scope.mInfo.TH2 = (workingHourData.TH2 == "00:00") ? '13:00' : selectedTimeUtcToLocal(workingHourData.TH2);
                        $scope.mInfo.TH3 = (workingHourData.TH3 == "00:00") ? '13:00' : selectedTimeUtcToLocal(workingHourData.TH3);
                        $scope.mInfo.TH4 = (workingHourData.TH4 == "00:00") ? '21:00' : selectedTimeUtcToLocal(workingHourData.TH4);

                        $scope.mInfo.FR1 = (workingHourData.FR1 == "00:00") ? '08:00' : selectedTimeUtcToLocal(workingHourData.FR1);
                        $scope.mInfo.FR2 = (workingHourData.FR2 == "00:00") ? '13:00' : selectedTimeUtcToLocal(workingHourData.FR2);
                        $scope.mInfo.FR3 = (workingHourData.FR3 == "00:00") ? '13:00' : selectedTimeUtcToLocal(workingHourData.FR3);
                        $scope.mInfo.FR4 = (workingHourData.FR4 == "00:00") ? '21:00' : selectedTimeUtcToLocal(workingHourData.FR4);

                        $scope.mInfo.SA1 = (workingHourData.SA1 == "00:00") ? '08:00' : selectedTimeUtcToLocal(workingHourData.SA1);
                        $scope.mInfo.SA2 = (workingHourData.SA2 == "00:00") ? '13:00' : selectedTimeUtcToLocal(workingHourData.SA2);
                        $scope.mInfo.SA3 = (workingHourData.SA3 == "00:00") ? '13:00' : selectedTimeUtcToLocal(workingHourData.SA3);
                        $scope.mInfo.SA4 = (workingHourData.SA4 == "00:00") ? '21:00' : selectedTimeUtcToLocal(workingHourData.SA4);

                        $scope.mInfo.SU1 = (workingHourData.SU1 == "00:00") ? '08:00' : selectedTimeUtcToLocal(workingHourData.SU1);
                        $scope.mInfo.SU2 = (workingHourData.SU2 == "00:00") ? '13:00' : selectedTimeUtcToLocal(workingHourData.SU2);
                        $scope.mInfo.SU3 = (workingHourData.SU3 == "00:00") ? '13:00' : selectedTimeUtcToLocal(workingHourData.SU3);
                        $scope.mInfo.SU4 = (workingHourData.SU4 == "00:00") ? '21:00' : selectedTimeUtcToLocal(workingHourData.SU4);
                    }
                    else
                    {
                        workingHourData = "";
                    }
                })
                .error(function(data, status, headers, config) {
                    $scope.$emit('$preLoaderStop');
                });
        }

        //Edit Working Hours
        $scope.editWorkingHourTemplate = function(_TID){

            $scope.showAddWorkingHourForm = true;
            $scope.saveInfo.TID = _TID;
            getWorkingHourForEdit(_TID);
        };


    $scope.modalVisible = false;
    $scope.modalVisibility = function () {
         /* toggle map visibility status */
        $scope.modalVisible = !$scope.modalVisible;
    };

    /* modal box for loading Add/edit/join Group */
    $scope.modal = {
        title: 'Groups',
        class: 'business-manager-modal'
    };

}]);