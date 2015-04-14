
angular.module('ezeidApp').controller('WorkingHourCtrl',['$scope','$rootScope','$http','Notification','$filter','MsgDelay','$interval','GURL',function($scope,$rootScope,$http,Notification,$filter,MsgDelay,$interval,GURL){

    var workingHours = this;
    workingHours.result = [];
    $scope.mInfo = {};
    getWorkingHours();

    function getWorkingHours()
    {
        $http({ method: 'get', url: GURL + 'ewtGetWorkingHours',
            params : {
                Token : $rootScope._userInfo.Token
            }
        }).success(function (data) {

                console.log("SAi1234");
                console.log(data);
                if (data != 'null')
                {
                    console.log("SAi12");

                    workingHours.result = JSON.parse(data);
                    console.log(workingHours.result);
                }
            });
    }

    $scope.addWorkingHours = function(){
          $scope.mInfo.Token = $rootScope._userInfo.Token;

          $http({
                method: "POST",
                url: GURL + 'ewtSaveWorkingHours',
                data:$scope.mInfo
              }).success(function (data) {
                  console.log(data);
                if (data.IsSuccessfull) {
                    Notification.success({message: "Saved...", delay: MsgDelay});
                }
                else
                {
                    Notification.error({ message: "Not Saved...", delay: MsgDelay });
                }
            });
         };



}]);