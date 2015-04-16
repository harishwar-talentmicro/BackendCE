
angular.module('ezeidApp').controller('HolidayCalenderCtrl',['$scope','$rootScope','$http','Notification','$filter','MsgDelay','$interval','GURL',function($scope,$rootScope,$http,Notification,$filter,MsgDelay,$interval,GURL){

   // var workingHours = this;
    $scope.result = [];
    $scope.mInfo = {};
    $scope.saveInfo = {};
    $scope.showAddHolidayForm = false;
    //getWorkingHours();

    function getHolidayList(TemplateId)
    {
        $http({ method: 'get', url: GURL + 'ewtHolidayList',
            params : {
                Token : $rootScope._userInfo.Token,
                TemplateID : TemplateId
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

    //To get All working hours template
    function getTemplateList()
    {
        $http({ method: 'get', url: GURL + 'ewtWorkingHours',
            params : {
                Token : $rootScope._userInfo.Token
            }
        }).success(function (data)
            {
                if(data != 'null')
                {
                    $scope.TemplateData = data;
                }
            });
    }

    $scope.openAddHolidayForm = function(){
        $scope.showAddHolidayForm = true;
        getTemplateList();
    };

    $scope.cancleAddHoliday = function(){
        $scope.showAddHolidayForm = false;
    };

    $scope.addWorkingHours = function(){

        console.log("SAi12211");
        $scope.saveInfo = $scope.mInfo;
        $scope.saveInfo.Token = $rootScope._userInfo.Token;
        $scope.saveInfo.TID = 0;

        $http({
                method: "POST",
                url: GURL + 'ewtHolidayList',
                data:$scope.saveInfo
              }).success(function (data) {

                console.log(data);
                if (data.IsSuccessfull) {
                    $scope.mInfo = {}
                   // getWorkingHours();
                    $scope.showAddHolidayForm = false;
                    Notification.success({message: "Saved...", delay: MsgDelay});
                }
                else
                {
                    Notification.error({ message: "Not Saved...", delay: MsgDelay });
                }
            });
         };

        $scope.deleteWorkingHourTemplate = function(_TID){

            console.log(_TID);

            $http({ method: 'delete', url: GURL + 'ewtWorkingHours',
                params : {
                    Token : $rootScope._userInfo.Token,
                    TID: _TID
                }
            }).success(function (data) {
                    console.log(data);
                    if(data.IsSuccessfull)
                    {
                        getWorkingHours();
                    }
                });
        };

}]);