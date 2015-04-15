
angular.module('ezeidApp').controller('WorkingHourCtrl',['$scope','$rootScope','$http','Notification','$filter','MsgDelay','$interval','GURL',function($scope,$rootScope,$http,Notification,$filter,MsgDelay,$interval,GURL){

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

    var workingHours = this;
    $scope.result = [];
    $scope.mInfo = {};
    $scope.showAddWorkingHourForm = false;
    getWorkingHours();

    function getWorkingHours()
    {
        $http({ method: 'get', url: GURL + 'ewtWorkingHours',
            params : {
                Token : $rootScope._userInfo.Token
            }
        }).success(function (data) {
               if (data != 'null')
                {
                    console.log(data);
                   $scope.result = data[0];
                }
            });
    }

    $scope.openAddWorkingHourForm = function(){
        $scope.showAddWorkingHourForm = true;
    };

    $scope.cancleAddWorkingHours = function(){
        $scope.showAddWorkingHourForm = false;
    };

    $scope.addWorkingHours = function(){
        console.log($scope.mInfo);
          $scope.mInfo.Token = $rootScope._userInfo.Token;

        var x = new Date();
        var today = moment(x.toISOString()).utc().format('DD-MMM-YYYY');

        console.log("today date",today);
        console.log("selected time",$scope.mInfo.MO1);

        var currentTaskDate = moment(today+' '+$scope.mInfo.MO1).format('DD-MMM-YYYY H:mm');
        console.log("current local date time",currentTaskDate);

       // console.log("utc time",convertTimeToUTC(currentTaskDate,'DD-MMM-YYYY H:mm',"H:mm"));

      /*  var currentTaskDate = moment().format('DD-MMM-YYYY H:mm');
        console.log("current local date time",currentTaskDate);

        console.log("utc time",convertTimeToUTC(currentTaskDate,'DD-MMM-YYYY H:mm',"H:mm"));*/

       // $scope.mInfo.Mo1 = convertTimeToUTC(currentTaskDate,'DD-MMM-YYYY hh:mm A','H:HH');

          $http({
                method: "POST",
                url: GURL + 'ewtWorkingHours',
                data:$scope.mInfo
              }).success(function (data) {
                  console.log(data);
                if (data.IsSuccessfull) {
                    getWorkingHours();
                    Notification.success({message: "Saved...", delay: MsgDelay});
                }
                else
                {
                    Notification.error({ message: "Not Saved...", delay: MsgDelay });
                }
            });
         };

}]);