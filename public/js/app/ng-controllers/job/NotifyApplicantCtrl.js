(function() {

    angular.module('ezeidApp').controller('NotifyApplicantCtrl', [
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
        '$route',
        'GoogleMaps',
        'UtilityService',
        function ($rootScope,
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
                  $route,
                  GoogleMap,
                  UtilityService)
        {

            $scope.showCreateMailTemplate = false;
            $scope.validationMode = 0;
            $scope.mailTemplateTid = 0;

            clearSearchFilter();

            function clearSearchFilter()
            {
                $scope.mailTemplateTid = 0;
                $scope.job_id = 0;
            }

            $scope.job_id = $routeParams.jobid
            getApplicant();
            getTemplateList();

            // Get Country list
            function getApplicant()
            {
                if($scope.job_id)
                {
                    $scope.$emit('$preLoaderStart');
                    $http({
                        url : GURL + 'notify_student',
                        method : 'GET',
                        params :
                        {
                            token : $rootScope._userInfo.Token,
                            job_id : $scope.job_id
                        }
                    }).success(function(resp){
                        $scope.$emit('$preLoaderStop');
                        if(resp.status)
                        {
                            if(resp.data.length)
                            {
                                $scope.applicantData = resp.data;
                                $scope.applicantCount = $scope.applicantData[0].count;
                                $scope.applicantIDs = $scope.applicantData[0].ids;
                            }
                        }
                    })
                    .error(function(err){
                        $scope.$emit('$preLoaderStop');
                    });
                }
                else
                {
                    $location.url('/');
                }
            }

            // Api call for getting list of all mail templates, for displaing in dropdown
            function getTemplateList()
            {
                $http({
                    method: 'get',
                    url: GURL + 'ewtTemplateList',
                    params : {
                        Token : $rootScope._userInfo.Token,
                        template_type : 3 //TemplateType=1 for bulkmailer and 2=jobseekers bulkmailer , 3= for applicant notification
                    }
                }).success(function (data) {

                        if(data !== "null")
                        {
                            if($rootScope._userInfo.Token == false) {
                                var _obj = { TID: 0, Title: '--Select Template--' };
                                data.splice(0, 0, _obj);
                                $scope.mailTemplateTid = _obj.TID;
                            }
                            $scope.templates = data;
                        }
                    });
            }

            // Create new mail template
            $scope.addNewTemplateForm = function (_NewEdit) {
                if(_NewEdit == 'new')
                {
                    $scope.validationMode = 1;
                    $scope.Title = "";
                    $scope.Body = "";
                    $scope.TID = "";
                    $scope.showCreateMailTemplate = true;
                }
                else
                {
                    $scope.validationMode = 2;
                    $scope.showCreateMailTemplate = true;
                }
            };

            // Close Create Mail Template Form
            $scope.closeCreateMailTemplateForm = function ()
            {
                $scope.showCreateMailTemplate = false;
                $scope.validationMode = 0;
                $scope.Title = "";
                $scope.Body = "";
                $scope.TID = "";
                $scope.mailTemplateTid = 0;
            };

            // Validation function for creating mail template
            function isValidate()
            {
                var notificationMessage = "";
                var errorList  = [];
                // Check validations
                if(!$scope.Title)
                {
                    errorList.push('Template title is Required');
                }
                if(!$scope.Body)
                {
                    errorList.push('Body is Required');
                }
                if(errorList.length > 0)
                {
                    for(var i = errorList.length; i > 0;i--)
                    {
                        Notification.error({ message: errorList[i-1], delay: MsgDelay });
                    }
                };
                //Return false if errorList is greater than zero
                return (errorList.length>0)? false : true;
            }

            // save mail template
            $scope.saveMailTemplate = function () {

                $scope.Token = $rootScope._userInfo.Token;

                if(isValidate())
                {
                    $scope.$emit('$preLoaderStart');
                    $http({ method: 'post',
                        url: GURL + 'ewtTemplateDetails',
                        data :
                        {
                            Token : $rootScope._userInfo.Token,
                            Title : $scope.Title,
                            Body : $scope.Body,
                            template_type : 3,
                            tid :  $scope.mailTemplateTid
                        }
                    }).success(function (data)
                        {
                            $scope.$emit('$preLoaderStop');

                            if (data.IsSuccessfull)
                            {
                                $scope.Title = "";
                                $scope.Body = "";
                                $scope.mailTemplateTid = "";

                                getTemplateList();
                                Notification.success({ message: 'Template saved successfully...', delay: MsgDelay });
                                $scope.showCreateMailTemplate = false;
                                $scope.validationMode = 0;
                            }
                        }).error(function(){
                            Notification.error({ message : 'An error occurred', delay : MsgDelay});
                            $scope.$emit('$preLoaderStop');
                        });
                }
            };

            // get template details
            $scope.getTemplateDetails = function (Tid)
            {
                if(Tid != undefined)
                {
                    $http({
                        method: 'get',
                        url: GURL + 'ewtTemplateDetails?Token=' + $rootScope._userInfo.Token + '&TID='+Tid}).success(function (data)
                        {
                            if(data !== "null")
                            {
                                $scope.Title = data[0].Title;
                                $scope.Body = data[0].Body;
                                $scope.mailTemplateTid = data[0].TID;
                            }
                        });
                }
                else
                {
                    $scope.Title = "";
                    $scope.Body = "";
                    $scope.mailTemplateTid = "";
                }
            };

            // Validation function
            function validateItem(){
                var err = [];
                if($scope.mailTemplateTid == 0)
                {
                    err.push('Select Mail Template');
                }

                if(!$scope.applicantCount)
                {
                    err.push('No applicant found');
                }

                if(err.length > 0)
                {
                    for(var i = 0; i < err.length; i++)
                    {
                        Notification.error({ message : err[i], delay : 2000});
                    }
                    return false;
                }
                return true;
            };

            // send job notification
            $scope.SendNotification = function ()
            {
                if(validateItem())
                {
                    $scope.$emit('$preLoaderStart');

                    $http({
                        method: 'post',
                        url: GURL + 'job_notification',
                        data:
                        {
                            token : $rootScope._userInfo.Token,
                            ezeid : $rootScope._userInfo.ezeid,
                            ids : $scope.applicantIDs,
                            template_id : $scope.mailTemplateTid,
                            job_id : $scope.job_id
                        }
                    }).success(function (data)
                        {
                            $scope.$emit('$preLoaderStop');
                            if(data.status)
                            {
                                $scope.Body = "";
                                clearSearchFilter();

                                $scope.showCreateMailTemplate = false;
                                document.getElementById("Title").className = "form-control emptyBox";
                                document.getElementById("Body").className = "form-control emptyBox";
                                Notification.success({message: "Notification sent successfully..", delay: MsgDelay});
                            }
                        }).error(function(err)
                        {
                            $scope.$emit('$preLoaderStop');
                        });
                    $scope.$emit('$preLoaderStop');
                }
            };

            // Close Notify applicant Form
            $scope.closeNotifyForm = function ()
            {
                clearSearchFilter();
                $scope.Title = "";
                $scope.Body = "";
                $scope.TID = "";
                $scope.mailTemplateTid = 0;
                $location.url('/');
            };

            /**
             * Redirect to applicant listing page
             */
            $scope.redirectApplicantPage = function(tid)
            {
                if($scope.applicantCount)
                {
                    $location.url('/applicantlisting' + '?cv_ids='+tid);
                }
            };

        }]);
})();