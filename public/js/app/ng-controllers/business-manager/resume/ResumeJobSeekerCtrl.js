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
            var placeDetail = [];
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

            $scope.jobSeekerResults = "";

            //Pagination settings
            $scope.pageSize = 10;//Results per page
            $scope.pageCount = 0;//Everything starts with a 0 - 10,20,30 etc.
            $scope.totalResult = 0;//Total results
            $scope.resultThisPage = 0;//Total results you got this page

            getCountryList();
            getEducations();
            getSpecialization();
            getInstituteList();
            getTemplateList();
            getJobList();

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
                $('.dropdown-toggle1').click(function(){
                    hideAllDropdoowns(1);
                    $( ".filter-dropdown" ).slideToggle( "slow", function() {
                        // Animation complete.
                    });})

                $('.dropdown-toggleSpecialization').click(function(){
                    hideAllDropdoowns(2);
                    $( ".filter-dropdownspecialization" ).slideToggle( "slow", function() {
                        // Animation complete.
                    });})

                $('.dropdown-toggleCity').click(function(){
                    hideAllDropdoowns(4);
                    $( ".filter-dropdownCity" ).slideToggle( "slow", function() {
                        // Animation complete.
                    });})

                $('.dropdown-toggleInstitute').click(function(){
                    hideAllDropdoowns(3);
                    $( ".filter-dropdownInstitute" ).slideToggle( "slow", function() {
                        // Animation complete.
                    });})



                $('html').click(function()
                {
                    $('.filter-dropdownCity').hide();
                    $('.filter-dropdown').hide();
                    $('.filter-dropdownspecialization').hide();
                    $('.filter-dropdownInstitute').hide();
                })

                $('#jobseekercity').click(function(e){
                    e.stopPropagation();
                });
                $('#jobseekerinstitute').click(function(e){
                    e.stopPropagation();
                });
                $('#jobseekereducation').click(function(e){
                    e.stopPropagation();
                });
                $('#jobseekerspecialization').click(function(e){
                    e.stopPropagation();
                });

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
                        getCurrentCityCountry();
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
                                $scope.setCurrentCity = placeDetail.city;

                                if(($scope.setCurrentCity) && ($scope.cityList.length))
                                {
                                    for(var nCount = 0; nCount < $scope.cityList.length; nCount++)
                                    {
                                        if($scope.cityList[nCount].Locname.toUpperCase() == $scope.setCurrentCity.toUpperCase())
                                        {
                                            $scope.selectCity($scope.cityList[nCount].tid);
                                        }
                                    }
                                }
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
            };

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
            };

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
                                score_from : $scope.scoreFrom,
                                score_to : $scope.scoreTo,
                                page_size : $scope.pageSize,
                                page_count : $scope.pageCount
                            }
                }).success(function(resp){
                    $scope.$emit('$preLoaderStop');
                    if(resp.status)
                    {
                        var resultLength = "";
                        $scope.totalResult = resp.count;

                        resultLength = resp.data.length;
                        $scope.resultThisPage = parseInt(resultLength);

                        $scope.paginationVisibility();

                        $scope.jobSeekerResults = resp.data;
                    }
                })
                .error(function(err)
                {
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

            /*$scope.mailTemplateTid = 0;
            $scope.job_id = 0;*/
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
                $scope.jobSeekerResults = "";

                $scope.FromName = "";
                $scope.FromEmailID = "";
                $scope.Subject = "";
                $scope.Body = "";

                clearSearchFilter();
            };

            // Reset job seeker search filter
            $scope.resetJobSeekerSearch = function()
            {
                clearSearchFilter();
            };

            // Validation function
            function validateItem(){
                var err = [];

                if($scope.selectedTidToMail.length == 0){
                    err.push('Select Job Seeker');
                }
                if($scope.mailTemplateTid == 0){
                    err.push('Select Mail Template');
                }
                if($scope.job_id == 0){
                    err.push('Select Job');
                }

                if(err.length > 0){
                    for(var i = 0; i < err.length; i++){
                        Notification.error({ message : err[i], delay : 2000});
                    }
                    // Notification.error({ message : "Please enter information for Job", delay : 2000});
                    return false;
                }
                return true;
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
            };

            // Get Job list
            function getJobList()
            {
                $http({
                    url : GURL + 'jobs_list',
                    method : 'GET',
                    params : {
                        token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){
                        if(resp.status)
                        {
                            $scope.jobLists = resp.data;
                        }
                    })
                    .error(function(err){
                    });
            }

            /*Code for pagging*/
            /**
             * Incerement the page count of the pagination after every pagination: NEXT
             */
            function incrementPageCount()
            {
                $scope.pageCount += $scope.pageSize;
            }

            /**
             * Decrement the page count of the pagination after every pagination: PREVIOUS
             */
            function decrementPageCount()
            {
                $scope.pageCount -= $scope.pageSize;
            }

            /**
             * load the next results
             */
            $scope.paginationNextClick = function()
            {
                $scope.pageCount += $scope.pageSize;
                /* trigger next results */
                // $scope.triggerSearch(1);
                $scope.searchJobSeeker();
                $scope.paginationVisibility();
            };

            /**
             * load the previous results
             */
            $scope.paginationPreviousClick = function()
            {
                $scope.pageCount -= $scope.pageSize;
                /* trigger previous results */
                // $scope.triggerSearch(1);
                $scope.searchJobSeeker();
                $scope.paginationVisibility();
            };

            /**
             * Toggle the visibility of the pagination buttons
             */
            $scope.paginationPreviousVisibility = false;
            $scope.paginationNextVisibility = false;

            $scope.paginationVisibility = function()
            {
                var totalResult = parseInt($scope.totalResult);
                var currentCount = parseInt($scope.pageCount);
                var resultSize = parseInt($scope.pageSize);

                /* initial state */
                if((totalResult < (currentCount+resultSize)) && currentCount == 0)
                {
                    $scope.paginationNextVisibility = false;
                    $scope.paginationPreviousVisibility = false;
                }
                else if(currentCount == 0)
                {
                    $scope.paginationNextVisibility = true;
                    $scope.paginationPreviousVisibility = false;
                }
                else if((currentCount + resultSize) >= totalResult)
                {
                    $scope.paginationNextVisibility = false;
                    $scope.paginationPreviousVisibility = true;
                }
                else{
                    $scope.paginationNextVisibility = true;
                    $scope.paginationPreviousVisibility = true;
                }
            };

            function getCurrentCityCountry()
            {
                var handleNoGeolocation = function () {
                };

                $scope.googleMap = new GoogleMap();

                var promise = $scope.googleMap.getCurrentLocation()
                promise.then(function (resp) {
                    if (resp)
                    {
                        /* get the current location coordinates and if it don't exists then update with the present Coordinates */
                        var coordinates = getSearchedCoordinates($scope.googleMap.currentMarkerPosition.latitude,$scope.googleMap.currentMarkerPosition.longitude);

                        $scope.googleMap.getReverseGeolocation(coordinates[0],coordinates[1]).then(function (resp) {
                            if(resp)
                            {
                                placeDetail = $scope.googleMap.parseReverseGeolocationData(resp.data);
                                $scope.setCurrentCity = placeDetail.city;
                                if((placeDetail.city) && (placeDetail.country) && ($scope.countryLists.length))
                                {
                                    for(var nCount = 0; nCount < $scope.countryLists.length; nCount++)
                                    {
                                        if($scope.countryLists[nCount].countryname.toUpperCase() == placeDetail.country.toUpperCase())
                                        {
                                            $scope.countrySelect = $scope.countryLists[nCount].countryname;

                                            //to set default city
                                            $scope.getCityListOfCountry($scope.countrySelect);
                                        }
                                    }
                                }
                            }
                        });
                    }
                    else
                    {
                        handleNoGeolocation();
                    }
                }, function () {
                    handleNoGeolocation();
                });


                /* Callback function for get current location functionality */
                $scope.findCurrentLocation = function(){
                    $scope.googleMap.getCurrentLocation().then(function(){
                        $scope.googleMap.placeCurrentLocationMarker(null,null,true);
                    },function(){
                        $scope.googleMap.placeCurrentLocationMarker(null,null,true);
                    });
                };

                /* get lattitude and longitude based on present lat and lng */
                function getSearchedCoordinates(lat,lng)
                {
                    if(typeof($routeParams.lat) != 'undefined' && typeof($routeParams.lng) != 'undefined')
                    {
                        return [$routeParams.lat,$routeParams.lng];
                    }
                    else
                    {
                        return [lat,lng];
                    }
                }
            }

            /**
             * Get the range of the results
             */
            $scope.getResultRange = function()
            {
                if(parseInt($scope.totalResult) > 0 )
                {
                    var initialPageId = parseInt($scope.pageCount) + 1;
                    return (initialPageId)+" - "+(parseInt($scope.pageCount)+$scope.resultThisPage)+" of "+$scope.totalResult;
                }
            };



        }]);
})();