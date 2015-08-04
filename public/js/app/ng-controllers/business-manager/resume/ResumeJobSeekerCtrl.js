/**
 * Functionality for searching job seekers(users who are interested in jobs) for Employeers (they will search)
 * Employeers can send out bulk messages to selected users
 */

(function() {

    angular.module('ezeidApp').controller('ResumeJobSeekerCtrl', [
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

            $scope.validationMode = 0;

            clearSearchFilter();

            function clearSearchFilter()
            {
                $scope.jobSeekerSkillKeyword = "";
                $scope.jobSeekerJobType = 0;
                $scope.jobSeekerSalaryFrom = 0;
                $scope.jobSeekerSalaryTo = 0;
                $scope.jobSeekerSalaryType = 0;
                $scope.countryId = 0;
                $scope.cityId = 0;
                $scope.jobSeekerExperienceFrom = 0;
                $scope.jobSeekerExperienceTo = 0;
                $scope.selectedEducations = [];
                $scope.selectedSpecializations = [];
                $scope.selectedInstitute = [];
                $scope.selectedCitys = [];
                $scope.score = "";
                $scope.selectedTidToMail = [];
            }

            getCountryList();
            getEducations();
            getSpecialization();
            getInstituteList();
            //getCityList();
            getTemplateList();

            /**
             * Hide all the open dropdown
             */
            function hideAllDropdoowns(id)
            {
                if(parseInt(id) != 1)
                {
                    $('.filter-dropdown').hide();
                }
                if(parseInt(id) != 2)
                {
                    $('.filter-dropdownspecialization').hide();
                }
                if(parseInt(id) != 3)
                {
                    $('.filter-dropdownInstitute').hide();
                }
                if(parseInt(id) != 4)
                {
                    $('.filter-dropdownCity').hide();
                }
            }

            $scope.$watch('_userInfo.IsAuthenticate', function () {
                $('.dropdown-toggle').click(function(){
                    hideAllDropdoowns(1);
                    $( ".filter-dropdown" ).slideToggle( "slow", function() {
                        // Animation complete.
                    });})

                $('.dropdown-toggleSpecialization').click(function(){
                    hideAllDropdoowns(2);
                    $( ".filter-dropdownspecialization" ).slideToggle( "slow", function() {
                        // Animation complete.
                    });})

                $('.dropdown-toggleInstitute').click(function(){
                    hideAllDropdoowns(3);
                    $( ".filter-dropdownInstitute" ).slideToggle( "slow", function() {
                        // Animation complete.
                    });})

                $('.dropdown-toggleCity').click(function(){
                    hideAllDropdoowns(4);
                    $( ".filter-dropdownCity" ).slideToggle( "slow", function() {
                        // Animation complete.
                    });})
            });

            // Get Country list
            function getCountryList()
            {
                $http({
                    url : GURL + 'job_country',
                    method : 'GET',
                    params : {}
                }).success(function(resp){
                    if(resp.status)
                    {
                        $scope.countryLists = resp.data;
                    }
                })
                .error(function(err){
                });
            }

            // Get City list by country title
            $scope.getCityListOfCountry = function (_title) {
                if(_title != undefined)
                {
                    $http({
                        method: 'get',
                        url: GURL + 'job_city?country_title=' + _title}).success(function (data) {
                            if(data.status)
                            {
                                $scope.cityList = data.data;
                            }
                        });
                }
            };

            /**
             * Select - Unselect Education
             */
            $scope.selectCity = function(_cityID)
            {
                if($scope.selectedCitys.indexOf(_cityID)!=-1)
                {
                    var index = $scope.selectedCitys.indexOf(_cityID);
                    $scope.selectedCitys.splice(index,1);
                }
                else
                {
                    $scope.selectedCitys.push(_cityID);
                }
            };

            // Get Education list
            function getEducations()
            {
                $http({
                    url : GURL + 'educations',
                    method : 'GET',
                    params : {
                        token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){
                        $scope.educationList = resp.data;
                    })
                    .error(function(err){

                    });
            }

            /**
             * Select - Unselect Education
             */
            $scope.selectEducation = function(_educationID)
            {
                if($scope.selectedEducations.indexOf(_educationID)!=-1)
                {
                    var index = $scope.selectedEducations.indexOf(_educationID);
                    $scope.selectedEducations.splice(index,1);
                }
                else
                {
                    $scope.selectedEducations.push(_educationID);
                }
            }

            // Get Specialization list
            function getSpecialization()
            {
                $http({
                    url : GURL + 'specialization',
                    method : 'GET',
                    params : {
                        token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){
                        $scope.specializationList = resp.data;
                    })
                    .error(function(err){

                    });
            }

            /**
             * Select - Unselect specialization
             */
            $scope.selectSpecialization = function(_specializationID)
            {
                if($scope.selectedSpecializations.indexOf(_specializationID)!=-1)
                {
                    var index = $scope.selectedSpecializations.indexOf(_specializationID);
                    $scope.selectedSpecializations.splice(index,1);
                }
                else
                {
                    $scope.selectedSpecializations.push(_specializationID);
                }
            }

            // Get Institute list
            function getInstituteList()
            {
                $http({
                    url : GURL + 'institutes',
                    method : 'GET',
                    params : {
                        token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){
                        $scope.instituteList = resp.data;
                    })
                    .error(function(err){
                    });
            }

            /**
             * Select - Unselect institute
             */
            $scope.selectInstitute = function(_instituteID)
            {
                if($scope.selectedInstitute.indexOf(_instituteID)!=-1)
                {
                    var index = $scope.selectedInstitute.indexOf(_instituteID);
                    $scope.selectedInstitute.splice(index,1);
                }
                else
                {
                    $scope.selectedInstitute.push(_instituteID);
                }
            }

            /**
             * Search job seeker
             */
            $scope.searchJobSeeker = function()
            {
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'job_seeker_search',
                    method : 'GET',
                    params : {
                                keyword : $scope.jobSeekerSkillKeyword,
                                job_type : $scope.jobSeekerJobType,
                                salary_from : $scope.jobSeekerSalaryFrom,
                                salary_to : $scope.jobSeekerSalaryTo,
                                salary_type : $scope.jobSeekerSalaryType,
                                experience_from : $scope.jobSeekerExperienceFrom,
                                experience_to : $scope.jobSeekerExperienceTo,
                                location_ids : $scope.selectedCitys.toString(),
                                educations : $scope.selectedEducations.toString(),
                                specialization_id : $scope.selectedSpecializations.toString(),
                                institute_id : $scope.selectedInstitute.toString(),
                                score : $scope.score
                            }
                }).success(function(resp){
                    $scope.$emit('$preLoaderStop');
                    if(resp.status)
                    {
                        $scope.jobSeekerResults = resp.data;

                        console.log("Search result");
                        console.log($scope.jobSeekerResults);
                    }

                })
                .error(function(err){
                        $scope.$emit('$preLoaderStop');
                });
            };

            // Create new mail template
            $scope.addNewTemplateForm = function (_NewEdit) {
                if(_NewEdit == 'new')
                {
                    $scope.validationMode = 1;
                    // window.location.href = "#/create-template";
                    $scope.FromName = "";
                    $scope.FromEmailID = "";
                    $scope.Title = "";
                    $scope.Subject = "";
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
            $scope.closeCreateMailTemplateForm = function () {
                $scope.formTitle = "Bulk Sales Enquiry";
                $scope.showCreateMailTemplate = false;
                $scope.validationMode = 0;

                $scope.FromName = "";
                $scope.FromEmailID = "";
                $scope.Title = "";
                $scope.Subject = "";
                $scope.Body = "";
                $scope.TID = "";
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

                if(!$scope.FromName)
                {
                    errorList.push('From name Required');
                }
                if(!$scope.FromEmailID)
                {
                    errorList.push('From email is Required');
                }
                if(!$scope.Subject)
                {
                    errorList.push('Subject is Required');
                }
                if(!$scope.Body)
                {
                    errorList.push('Body is Required');
                }
                if($scope.isWrongEmailPatternFrom)
                {
                    errorList.push('Not valid email!');
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
            $scope.mailTemplateTid = 0;
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
                                FromName : $scope.FromName,
                                FromEmailID : $scope.FromEmailID,
                                CCMailIDS : "",
                                BCCMailIDS : "",
                                Subject : $scope.Subject,
                                Body : $scope.Body,
                                template_type  : 2, //(TemplateType=1 for bulkmailer and 2=jobseekers bulkmailer), tid <int> [while creating time tid is 0]
                                tid :  $scope.mailTemplateTid
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

            // Api call for getting list of all mail templates, for displaing in dropdown
            function getTemplateList()
            {
                $http({
                    method: 'get',
                    url: GURL + 'ewtTemplateList',
                    params : {
                        Token : $rootScope._userInfo.Token,
                        template_type : 2 //TemplateType=1 for bulkmailer and 2=jobseekers bulkmailer
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
                $location.path("/");
            };

            // Reset job seeker search filter
            $scope.resetJobSeekerSearch = function()
            {
                clearSearchFilter();
            };

            // send sales enquiry mail
            $scope.SendJobSeekerMail = function () {

                if($scope.selectedTidToMail.length > 10)
                {
                    Notification.error({ message: 'Maximum Limit: 10 Job Seeker…', delay: MsgDelay });
                }
                else
                {
                    if(($scope.selectedTidToMail.length > 0) && ($scope.mailTemplateTid > 0))
                    {
                        $http({
                            method: 'post',
                            url: GURL + 'jobseeker_mail',
                            data:
                            {
                                token : $rootScope._userInfo.Token,
                                ids : $scope.selectedTidToMail.toString(),
                                template_id : $scope.mailTemplateTid
                            }
                        }).success(function (data)
                            {
                                if (data != 'null')
                                {
                                    clearSearchFilter();

                                    $scope.showCreateMailTemplate = false;

                                    document.getElementById("FromName").className = "form-control emptyBox";
                                    document.getElementById("FromEmailID").className = "form-control emptyBox";
                                    document.getElementById("Title").className = "form-control emptyBox";
                                    document.getElementById("Subject").className = "form-control emptyBox";
                                    document.getElementById("Body").className = "form-control emptyBox";

                                    Notification.success({message: "Mails are submitted for transmitted..", delay: MsgDelay});
                                }

                            });
                    }
                    else {
                        Notification.error({message: "Please select a Job Seeker !", delay: MsgDelay});
                    }
                }
            };

            /**
             * Select - Unselect job seeker
             */
            $scope.selectTidToMail = function(_TID)
            {
                if($scope.selectedTidToMail.indexOf(_TID)!=-1)
                {
                    var index = $scope.selectedTidToMail.indexOf(_TID);
                    $scope.selectedTidToMail.splice(index,1);
                }
                else
                {
                    $scope.selectedTidToMail.push(_TID);
                }
            }

        }]);
})();