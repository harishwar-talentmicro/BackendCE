
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

            var notifyApplicant = this;

            clearSearchFilter();

            function clearSearchFilter()
            {
                $scope.jobSeekerSkillKeyword = "";
                $scope.jobSeekerJobType = 0 ;
                $scope.jobSeekerSalaryFrom = 0;
                $scope.jobSeekerSalaryTo = 0;
                $scope.jobSeekerSalaryType = 3;
                $scope.countryId = 0;
                $scope.cityId = 0;
                $scope.jobSeekerExperienceFrom = 0;
                $scope.jobSeekerExperienceTo = 50;
                $scope.selectedEducations = [];
                $scope.selectedSpecializations = [];
                $scope.selectedInstitute = [];
                $scope.selectedCitys = [];
                $scope.scoreFrom = "";
                $scope.scoreTo = "";
                $scope.selectedTidToMail = [];
                $scope.mailTemplateTid = 0;
                $scope.job_id = 0;
                $scope.searchListMapFlag = false;//1: List, 2:Flag
            }

            getApplicant();
            getTemplateList();

            // Get Country list
            function getApplicant()
            {
                if($routeParams.jobid)
                {
                    $scope.$emit('$preLoaderStart');
                    $http({
                        url : GURL + 'notify_student',
                        method : 'GET',
                        params :
                        {
                            token : $rootScope._userInfo.Token,
                            job_id : $routeParams.jobid
                        }
                    }).success(function(resp){
                        $scope.$emit('$preLoaderStop');
                        if(resp.status)
                        {
                            $scope.applicantData = resp.data;
                            $scope.applicantCount = $scope.applicantData[0].count;
                            $scope.applicantIDs = $scope.applicantData[0].ids;
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
                        template_type : 1 //TemplateType=1 for bulkmailer and 2=jobseekers bulkmailer , 3 = notify applicant
                    }
                }).success(function (data) {
                        console.log(data);
                        if(data !== "null")
                        {
                            if($rootScope._userInfo.Token == false) {
                                var _obj = { TID: 0, Title: '--Select Template--' };
                                data.splice(0, 0, _obj);
                                $scope.templatesList.TID = _obj.TID;
                            }
                            $scope.templatesList = data;
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
                    $scope.showCreateMailTemplate = true;
                }
                else
                {
                    $scope.validationMode = 2;
                    $scope.showCreateMailTemplate = true;
                }
            };

            // Close Create Mail Template Form
                $scope.closeCreateMailTemplateForm = function () {
                $scope.showCreateMailTemplate = false;
                $scope.validationMode = 0;
                $scope.Title = "";
                $scope.Body = "";
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

                if(errorList.length>0){
                    for(var i = errorList.length; i>0;i--)
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
                    $http({ method: 'post',
                        url: GURL + 'ewtTemplateDetails',
                        data :{
                                Token : $rootScope._userInfo.Token,
                                Title : $scope.Title,
                                Body : $scope.Body,
                                template_type  : 3 //(TemplateType=1 for bulkmailer , 2=jobseekers bulkmailer , 3 = notify applicant), tid <int> [while creating time tid is 0]
                             }
                    }).success(function (data)
                        {
                            if (data != 'null') {
                                //salesEnquiry._info = {};

                                $scope.FromName = "";
                                $scope.FromEmailID = "";
                                $scope.Title = "";
                                $scope.Subject = "";
                                $scope.Body = "";
                                $scope.mailTemplateTid = "";

                                getTemplateList();
                                Notification.success({ message: 'Template save success...', delay: MsgDelay });
                                $scope.showCreateMailTemplate = false;
                                $scope.validationMode = 0;
                            }
                            else {
                                // Notification.error({ message: 'Invalid key or not found…', delay: MsgDelay });

                            }
                        });
                }
            };


            // get template details
            $scope.getTemplateDetails = function (Tid) {

                if(Tid != undefined)
                {
                    $http({
                        method: 'get',
                        url: GURL + 'ewtTemplateDetails?Token=' + $rootScope._userInfo.Token + '&TID='+Tid}).success(function (data) {
                            if(data !== "null")
                            {
                                $scope.FromName = data[0].FromName;
                                $scope.FromEmailID = data[0].FromEmailID;
                                $scope.Title = data[0].Title;
                                $scope.Subject = data[0].Subject;
                                $scope.Body = data[0].Body;
                                $scope.mailTemplateTid = data[0].TID;
                            }
                        });
                }
            };

            // Close Create Mail Template Form
            $scope.closeSalesEnquiryForm = function () {
                $scope.jobSeekerResults = "";

                $scope.FromName = "";
                $scope.FromEmailID = "";
                $scope.Subject = "";
                $scope.Body = "";
                $scope.selectAll = 0;
                clearSearchFilter();
            };



            // send sales enquiry mail
            $scope.SendJobSeekerMail = function () {

                if($scope.selectedTidToMail.length > 10)
                {
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: 'Maximum Limit: 10 Job Seeker…', delay: MsgDelay });
                }
                else
                {
                    if(validateItem())
                    {
                        $scope.$emit('$preLoaderStart');

                        $http({
                            method: 'post',
                            url: GURL + 'jobseeker_message',
                            data:
                            {
                                token : $rootScope._userInfo.Token,
                                ids : $scope.selectedTidToMail.toString(),
                                template_id : $scope.mailTemplateTid,
                                job_id : $scope.job_id
                            }
                        }).success(function (data)
                            {
                                $scope.$emit('$preLoaderStop');
                                if(data.status)
                                {
                                    $scope.FromName = "";
                                    $scope.FromEmailID = "";
                                    $scope.Subject = "";
                                    $scope.Body = "";

                                    clearSearchFilter();

                                    $scope.showCreateMailTemplate = false;
                                    document.getElementById("FromName").className = "form-control emptyBox";
                                    document.getElementById("FromEmailID").className = "form-control emptyBox";
                                    document.getElementById("Title").className = "form-control emptyBox";
                                    document.getElementById("Subject").className = "form-control emptyBox";
                                    document.getElementById("Body").className = "form-control emptyBox";
                                    Notification.success({message: "Message sent successfully..", delay: MsgDelay});

                                    $scope.jobSeekerResults = "";
                                }
                            }).error(function(err){
                                $scope.$emit('$preLoaderStop');
                            });
                        $scope.$emit('$preLoaderStop');
                    }
                }
            };





        }]);
})();