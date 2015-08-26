angular.module('ezeidApp').controller('ProfileUserCtrl',[
    '$rootScope',
    '$scope',
    '$http',
    '$q',
    '$timeout',
    'Notification',
    '$filter',
    '$window',
    'GURL',
    '$interval',
    'ScaleAndCropImage',
    'MsgDelay',
    '$location',
    '$routeParams',
    function (
        $rootScope,
        $scope,
        $http,
        $q,
        $timeout,
        Notification,
        $filter,
        $window,
        GURL,
        $interval,
        ScaleAndCropImage,
        MsgDelay,
        $location,
        $routeParams
    ) {


        $scope.newUserDetails = {};
        /**
         * Calling new API for loading user details
         * i.e. user_details_new
         */
        $scope.loadNewUserDetails = function(){
            var defer = $q.defer();
            $http({
                method : "GET",
                url : GURL + "user_details_new",
                params : {
                    token : $rootScope._userInfo.Token
                }
            }).success(function(resp){
                if(resp && resp !== 'null'){
                    if(resp.status){
                        for(var x=0; x < resp.data.locationcount; x++){
                            $scope.locCount.push({ id : x});
                        }
                        var date  = new Date(resp.data.DOB);
                        resp.data.DOB = moment(date).format('DD-MM-YYYY');
                        $scope.newUserDetails = resp.data;
                        defer.resolve(resp);

                    }
                    else{
                        defer.resolve(resp);
                    }
                }
                else{
                    defer.resolve(null);
                }
            }).error(function(err){
                defer.resolve(null);
            });
            return defer.promise;
        };


        $scope.saveNewUserDetails = function(){
            var saveData = {
                token : $rootScope._userInfo.Token,
                first_name : $scope.newUserDetails.FirstName,
                last_name : $scope.newUserDetails.LastName,
                company_name : $scope.newUserDetails.CompanyName,
                job_title : $scope.newUserDetails.JobTitle,
                company_tagline : $scope.newUserDetails.AboutCompany,
                gender : $scope.newUserDetails.Gender,
                dob : $scope.newUserDetails.DOB,
                email : $scope.newUserDetails.AdminEmailID
            };

            $http({
                url : GURL + 'user_details',
                method : 'POST',
                data : saveData
            }).success(function(resp){
                if(resp){
                    if(resp.status){
                        $scope.activeLoc = 0;
                        $scope.changeActive(0,true);
                    }
                    else{
                        Notification.error({ title : 'Error', message : 'An error occurred ! Please try again', delay : MsgDelay});
                    }
                }
                else{
                    Notification.error({ title : 'Error', message : 'An error occurred ! Please try again', delay : MsgDelay});
                }

            }).error(function(err,statusCode){
                var msg = { title : 'Connection Lost', message : 'Please check your connection', delay : MsgDelay};
                if(statusCode){
                    msg.title = 'Error';
                    msg.message = 'An error occurred ! Please try again';
                }
                Notification.error(msg);

            });

        };

        $scope.$emit('$preLoaderStart');
        $scope.masterInit(function(){
            $scope.loadNewUserDetails().then(function(){
                $scope.$emit('$preLoaderStop');
            },function(){
                $scope.$emit('$preLoaderStop');
            });
        });

        $timeout(function(){
            $scope.$emit('$preLoaderStop');
        },7000);
    }
]);