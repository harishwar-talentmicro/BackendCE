
angular.module('ezeidApp').controller('HolidayCalenderCtrl',['$scope','$rootScope','$http','Notification','$filter','MsgDelay','$interval','GURL',function($scope,$rootScope,$http,Notification,$filter,MsgDelay,$interval,GURL){

    $scope.result = [];
    $scope.mInfo = {};
    $scope.saveInfo = {};
    $scope.showAddHolidayForm = false;
    $scope.showNoDataFound = false;
    getTemplateList();

    /**
     * To get holiday list of particular template
     */
    $scope.getHolidayList = function(TemplateId)
    {
       // $scope.result = [];
        $http({ method: 'get', url: GURL + 'ewtHolidayList',
            params : {
                Token : $rootScope._userInfo.Token,
                TemplateID : TemplateId,
                LocID : 0
            }
        }).success(function (data) {

            if ((data) && (data != 'null'))
            {
               $scope.showNoDataFound = false;
               $scope.result = data;
            }
            else
            {
               $scope.result = [];
               $scope.showNoDataFound = true;
            }
        });
    };

    //To get All working hours template
    function getTemplateList()
    {
        /*$http({ method: 'get', url: GURL + 'ewtWorkingHours',*/
        $http({ method: 'get', url: GURL + 'get_workinghours_list',
            params : {
                Token : $rootScope._userInfo.Token
            }
        }).success(function (data)
            {
                if(data.status)
                {

                    $scope.TemplateData = data.data;
                }
                /*if(data != 'null')
                {
                    $scope.TemplateData = data;
                }*/
            });
    }

    $scope.openAddHolidayForm = function(){
        $scope.showNoDataFound = false;
        $scope.mInfo.TemplateID = "";
        $scope.mInfo.HolidayTitle = "";
        $scope.mInfo.HolidayDate = "";

        $scope.result = [];
        $scope.showAddHolidayForm = true;
        getTemplateList();
    };

    $scope.cancleAddHoliday = function(){
        $scope.showAddHolidayForm = false;
        $scope.result = [];
    };

    $scope.addWorkingHours = function(){
        $scope.saveInfo = $scope.mInfo;
        $scope.saveInfo.Token = $rootScope._userInfo.Token;
        $scope.saveInfo.TID = 0;

        $http({
                method: "POST",
                url: GURL + 'ewtHolidayList',
                data:$scope.saveInfo
              }).success(function (data) {

               if (data.IsSuccessfull) {
                    $scope.getHolidayList($scope.mInfo.TemplateID);
                    $scope.mInfo = {}
                    $scope.mInfo.TemplateID = $scope.saveInfo.TemplateID;
                    $scope.showAddHolidayForm = false;
                    Notification.success({message: "Holiday calender saved successfully", delay: MsgDelay});
                }
                else
                {
                    Notification.error({ message: "An error occurred while saving holiday calender! Please try again", delay: MsgDelay });
                }
            });
         };

        $scope.deleteHoliday = function(_TID){
            $http({ method: 'delete', url: GURL + 'ewtHolidayList',
                params : {
                    Token : $rootScope._userInfo.Token,
                    TID: _TID
                }
            }).success(function (data) {
                    if(data.IsSuccessfull)
                    {
                        $scope.getHolidayList($scope.mInfo.TemplateID);
                    }
                });
        };
}]);