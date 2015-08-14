/**
 * Controller to manage all the functionaloties in OUTBOX
 *
 * @author: Krunal[EZE ONE]
 * @since 20150718
 */
angular.module('ezeidApp').
    controller('JobDetailCtrl', [
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
        'MsgDelay',
        '$location',
        '$routeParams',
        'UtilityService',
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
            MsgDelay,
            $location,
            $routeParams,
            UtilityService
        ) {

            /***********************************************************************************************************
             /***********************************************************************************************************
             /***********************************************************************************************************
             * INITIALIZATIONS goes here
             */
            $scope.jobData = [];
            $scope.locationData = "NA";
            $scope.isResultEmpty = true;
            $scope.skillArr = [];
            $scope.salaryType = ["","Per Hour","Per Month","Per Annum"]

            $scope.isLoggedIn = $rootScope._userInfo;

            /***********************************************************************************************************
             /***********************************************************************************************************
             /***********************************************************************************************************
             * All ACTIONS Goes here
             */
            if($routeParams.jobid)
            {
                getJobDetail($routeParams.jobid);
            }

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

            // Get job details
            function getJobDetail(_jobID)
            {
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'job_details',
                    method : 'GET',
                    params : {
                        job_id : _jobID,
                        token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){
                    $scope.$emit('$preLoaderStop');
                    if(resp.status)
                    {
                        var data = resp.data[0];
                        resp.data[0].LUdate = convertTimeToLocal(data.LUdate,'DD-MMM-YYYY hh:mm A','DD-MMM-YYYY hh:mm A');

                        if(data.companyname)
                        {
                            $scope.isResultEmpty = false;
                            /* set all the data */
                            $scope.jobData = data;
                           /* set the location data */
                            setLocation();
                            /* set the skill array */
                            setSkillsArray();
                        }
                        else{
                            invalidUrlRedirection();
                        }

                    }

                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                });
            }

            /**
             * redirect to home page in case there is no result
             */
            function invalidUrlRedirection()
            {
                /* show the Error Message */
                Notification.error({ message : 'Invalid request', delay : MsgDelay});
                /* redirect to home page */
                $location.url('');
            }

            /**
             * Get the range of anything
             */
            $scope.getRange = function(rangeFrom,rangeTo,code)
            {
                if(typeof code !== undefined && parseInt(code) == 1)
                {
                    var amountRange = UtilityService.getRange(rangeFrom,rangeTo);
                    if(parseInt(rangeFrom) === parseInt(rangeTo))
                    {
                        return UtilityService.currencyStyleConverter(rangeFrom);
                    }
                    var amountArr = amountRange.split('-');
                    for(var i = 0;i < amountArr.length; i++)
                    {
                        amountArr[i] = UtilityService.currencyStyleConverter(amountArr[i]);
                    }
                    return amountArr.join('-');
                }
                return UtilityService.getRange(rangeFrom,rangeTo);
            }

            /**
             * set location data
             */
            function setLocation()
            {
                if($scope.jobData)
                {
                    var location = $scope.jobData.location;
                    if(!location.trim().length > 0)
                    {
                        $scope.locationData = "NA";
                    }
                    $scope.locationData = location;
                }
            }

            /**
             * Set skills in the array
             */
            function setSkillsArray()
            {
                if($scope.jobData)
                {
                    $scope.skillArr = $scope.jobData.keyskills.split(',');
                }
            }

            /**
             * Apply for job
             * @param _tid
             */
            $scope.showButtons = true;
            $scope.applyForJob = function(_tid){
                $scope.$emit('$preLoaderStart');
                $http({
                    method: "POST",
                    url: GURL + 'job_apply',
                    data :{
                            token:$rootScope._userInfo.Token,
                            job_id:_tid
                          }
                }).success(function (data) {
                    $scope.$emit('$preLoaderStop');
                    if(data.status)
                    {
                        if(data.data.Status == 2)
                        {
                            $scope.modalVisibleResume = true;
                        }
                        else
                        {
                            $scope.showButtons = false;
                            Notification.success({ message: "Applied Success..", delay : 2000});
                        }
                    }
                })
                .error(function(data, status, headers, config) {
                    $scope.$emit('$preLoaderStop');
                });
            };

            /* modal box for Upload resume */
            $scope.modalResume = {
                title: 'Upload Resume',
                class: 'business-manager-modal'
            };

            $scope.modalVisibleResume = false;
            $scope.modalVisibleResumeBox = function () {
                /* toggle map visibility status */
                $scope.modalVisibleResume = !$scope.modalVisibleResume;
            };

            $scope.openResumeTab = function ()
            {
                $window.open('/profile-manager/resume', '_blank');
            };



        }]);