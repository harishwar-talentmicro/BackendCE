(function(){

    angular. module('ezeidApp').controller('ResumeJobsCtrl',[
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
            $route,
            GoogleMap,
            UtilityService){

            // Declaration for job posting
            $scope.showJobListing = true;
            $scope.isWrongEmailPatternFrom = false;
            $scope.locationList = [];
            $scope.jobTitle = "";
            $scope.jobCode = "";
            $scope.jobDescription = "";
            $scope.skillKeyWords = "";
            $scope.jobVacancies = "";
            $scope.experienceFrom = "";
            $scope.experienceTo = "";
            $scope.salaryFrom = "";
            $scope.salaryTo = "";
            $scope.salaryType = 3;
            $scope.jobType = 0;
            $scope.contactName = "";
            $scope.phone = "";
            $scope.emailContact = "";
            $scope.jobCategori = 0;
            $scope.selectedEducations = [];
            $scope.selectedSpecializations = [];
            $scope.selectedInstitute = [];
            $scope.locIndexToEdit = "";
            $scope.disabledAddLocation = true;
            $scope.disabledAddLocationOnMapPopup = true;
            $scope.score_from = "";
            $scope.score_to = "";

            //Pagination settings
            $scope.pageSize = 10;//Results per page
            $scope.pageCount = 0;//Everything starts with a 0 - 10,20,30 etc.
            $scope.totalResult = 0;//Total results
            $scope.resultThisPage = 0;//Total results you got this page

            //Skill Map declaration
            $scope.skillMatrix = [];
            $scope.editMode = [];
            var skillsTid = [];
            var skillsTexts = [];
            $scope.availableTags = [];
            $scope.editSkill = {
                "tid":0,
                "skillname":"",
                "expertiseLevel":0,
                "expertiseText":"",
                "exp_from":0.00,
                "exp_to":0.00,
                "active_status":1
            };

            $scope.expertiseLevelsIDs = ["0"];
            $scope.expertiseLevelsTexts = ["Beginner"];
            $scope.editSkill.expertiseLevel = $scope.expertiseLevelsIDs.toString();
            $scope.editSkill.expertiseText = $scope.expertiseLevelsTexts.toString();


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
                $('.dropdown-toggleInstitute').click(function(){
                    hideAllDropdoowns(3);
                    $( ".filter-dropdownInstitute" ).slideToggle( "slow", function() {
                    // Animation complete.
                });})

                $('html').click(function() {
                    $('.filter-dropdown').hide();
                    $('.filter-dropdownspecialization').hide();
                    $('.filter-dropdownInstitute').hide();
                })

                $('#jobpostEdu').click(function(e){
                    e.stopPropagation();
                });

                $('#jobpostSpeci').click(function(e){
                    e.stopPropagation();
                });

                $('#jobpostInstit').click(function(e){
                    e.stopPropagation();
                });
             });

            $scope.ResumeInquiriesTab = false;
            $scope.JobsTab = true;
            $scope.JobSeekerTab = false;
            $scope.showJobListing = true;

            $scope.jobSearchTerm= "";
            $scope.jobFilterStatus = 0;
            $scope.order_by = 2;

            getPostedJob();

            /**
             * select Job Seeker Tab
             */
            $scope.TabJobSeeker = function(){
                $scope.ResumeInquiriesTab = false;
                $scope.JobsTab = false;
                $scope.JobSeekerTab = true;
            };

            /**
             * search for job term
             */
            $scope.searchJobTerm = function(){
                getPostedJob();
            };

            // Get all posted Jobs
            function getPostedJob()
            {
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'job',
                    method : 'GET',
                    params : {
                        token : $rootScope._userInfo.Token,
                        ezeone_id : $rootScope._userInfo.ezeid,
                        keywordsForSearch : $scope.jobSearchTerm,
                        status : $scope.jobFilterStatus,
                        page_size : $scope.pageSize,
                        page_count : $scope.pageCount,
                        order_by : $scope.order_by
                    }
                }).success(function(resp){
                    $scope.$emit('$preLoaderStop');
                    if(resp.status)
                    {
                        $scope.totalResult = resp.data.total_count;
                        $scope.resultThisPage = resp.data.result.length;

                        $scope.paginationVisibility();

                        for(var i = 0; i < resp.data.result.length; i++)
                        {
                            resp.data.result[i].posteddate = UtilityService.convertTimeToLocal(resp.data.result[i].posteddate);
                        }

                        $scope.jobData = resp.data.result;
                        $scope.showJobListing = true;
                    }

                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                });
            }

            // Validation function
            function validateItem(){
                var err = [];

                if($scope.jobTitle.length < 1 ){
                    err.push('Job Title is empty');
                }
                if($scope.jobCode.length < 1){
                    err.push('Job Code is empty');
                }
                if($scope.jobDescription.length < 1){
                    err.push('Job Description is empty');
                }
                if(($scope.jobVacancies == "") || ($scope.jobVacancies.length == 0) || (parseInt($scope.jobVacancies) == 0))
                {
                    err.push('No. of Vacancies is empty');
                }
                if($scope.experienceFrom.length < 1){
                    err.push('Experience From is empty');
                }
                if($scope.experienceTo.length < 1){
                    err.push('Experience To is empty');
                }

                if(parseInt($scope.experienceTo) < parseInt($scope.experienceFrom)){
                    err.push('Experience From is smaller than Experience To');
                }
                if($scope.mainLocationArray.length == 0){
                    err.push('Location is empty');
                }
                if($scope.salaryFrom.length < 1){
                    err.push('Salary From is empty');
                }
                if($scope.salaryTo.length < 1){
                    err.push('Salary To is empty');
                }
                if(parseInt($scope.salaryTo) < parseInt($scope.salaryFrom)){
                    err.push('Salary From is smaller than Salary To');
                }
                if($scope.contactName.length < 1){
                    err.push('Contact Name is empty');
                }

                if(($scope.phone.length < 1) && (!$scope.emailContact))
                {
                    err.push('Phone or Email Required');
                }
                else
                {
                    if($scope.emailContact)
                    {
                        var chk_email = new RegExp(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i);
                        if (!chk_email.test($scope.emailContact))
                        {
                            err.push('Not valid email!');
                        }
                    }
                }

                if($scope.jobCategori == 0)
                {
                    err.push('Please select Job Function');
                }

                if(!($scope.skillMatrix.length > 1))
                {
                    err.push('Skill Map is empty');
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

            // save job to system
            $scope.postJob = function(){

             //   $scope.skillMatrixToSave = $scope.skillMatrix;
                if(validateItem())
                {
                    $scope.$emit('$preLoaderStart');
                    if($scope.skillMatrix[0])
                    {
                        if((!$scope.skillMatrix[0].skillname) && (!$scope.skillMatrix[0].exp_from) && (!$scope.skillMatrix[0].exp_to))
                        {
                            var index = 0;
                            $scope.skillMatrix.splice(index, 1);
                            skillsTid.splice(index,1);
                        }
                    }
                    skillsTexts = [];
                    for (var nCount = 0; nCount < $scope.skillMatrix.length; nCount++)
                    {
                        skillsTexts.push($scope.skillMatrix[nCount].skillname);
                    }


                   $scope.jobData = {
                        token : $rootScope._userInfo.Token,
                        tid : $scope.jobTid,
                        ezeone_id : $rootScope._userInfo.ezeid,
                        job_code : $scope.jobCode,
                        job_title : $scope.jobTitle,
                        exp_from : $scope.experienceFrom,
                        exp_to : $scope.experienceTo,
                        job_description : $scope.jobDescription,
                        salaryFrom : $scope.salaryFrom,
                        salaryTo :  $scope.salaryTo,
                        salaryType : $scope.salaryType,
                        keySkills : skillsTexts.toString(),
                        openings : $scope.jobVacancies,
                        jobType : $scope.jobType,
                        status : $scope.jobStatus,
                        contactName : $scope.contactName,
                        email_id : $scope.emailContact,
                        mobileNo : $scope.phone,
                        locationsList : JSON.stringify($scope.mainLocationArray),
                        category_id : $scope.jobCategori,
                        education_id : $scope.selectedEducations.toString(),
                        specialization_id : $scope.selectedSpecializations.toString(),
                        institute_id : $scope.selectedInstitute.toString(),
                        score_from : $scope.score_from,
                        score_to : $scope.score_to,
                        skillMatrix : $scope.skillMatrix,
                        skill_ids : skillsTid.toString()
                    }

                    $http({
                        method: "POST",
                        url: GURL + 'job',
                        data:  $scope.jobData
                    }).success(function (data) {
                        $scope.$emit('$preLoaderStop');

                        if(data.status)
                        {
                            $scope.jobSearchTerm = "";
                            $scope.jobFilterStatus = 0;

                            getPostedJob();
                            Notification.success({message: "Saved..", delay: MsgDelay});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        $scope.$emit('$preLoaderStop');
                    });
                }
                else
                {
                    if(!$scope.skillMatrix.length)
                    {
                       $scope.skillMatrix.push(
                            {
                                "tid":0,
                                "skillname":"",
                                "expertiseLevel":0,
                                "expertiseText":"",
                                "exp_from":"",
                                "exp_to":"",
                                "active_status":1
                            }
                        );
                    }
                }
            };

            // Get job Categories
            function getJobCategories()
            {
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'ewmGetFunctions',
                    method : 'GET',
                    params : {
                        LangID : 1
                    }
                }).success(function(resp){
                    $scope.jobCategories = resp;
                }).error(function(err){
                    var msg = 'Something went wrong! Please try again';
                    Notification.error({ message : msg, delay : MsgDelay});
                    $scope.$emit('$preLoaderStop');
                });
            }

            // Show job posting form
            $scope.openJobPostForm = function(_index)
            {
                $scope.$emit('$preLoaderStart');
                getJobCategories();
                getEducations();
                getInstituteList();
                getAllSkills();

                $scope.showJobListing = false;
                $scope.locationArrayString = [];
                $scope.mainLocationArray = [];

                if(_index == 'add')
                {
                    $scope.skillMatrix = [];
                    $scope.skillMatrix.push(
                        {
                            "tid":0,
                            "skillname":"",
                            "expertiseLevel":0,
                            "expertiseText":"",
                            "exp_from":"",
                            "exp_to":"",
                            "active_status":1
                        }
                    );
                    $scope.editMode[0] = true;

                    $scope.$emit('$preLoaderStop');
                    $scope.jobTid = 0;
                    $scope.jobTitle = "";
                    $scope.jobCode = "";
                    $scope.jobDescription = "";
                    $scope.skillKeyWords = "";
                    $scope.jobVacancies = "";
                    $scope.experienceFrom = "";
                    $scope.experienceTo = "";
                    $scope.jobLocation = "";
                    $scope.salaryFrom = "";
                    $scope.salaryTo = "";
                    $scope.salaryType = 3;
                    $scope.jobType = 0;
                    $scope.contactName = "";
                    $scope.phone = "";
                    $scope.emailContact = "";
                    $scope.jobStatus = 0;
                    $scope.jobCategori = 0;
                    $scope.selectedEducations = [];
                    $scope.selectedSpecializations = [];
                    $scope.selectedInstitute = [];
                    $scope.score_from = "";
                    $scope.score_to = "";
                }

            };

            // Edit posted job
            $scope.editPostedJob = function(_jobID)
            {
                getJobCategories();
                getEducations();
                getInstituteList();
                getAllSkills();

                $scope.showJobListing = false;
                $scope.locationArrayString = [];
                $scope.mainLocationArray = [];

                $timeout(function()
                {
                    $scope.$emit('$preLoaderStart');
                    $http({
                        url : GURL + 'view_job_details',
                        method : 'GET',
                        params : {
                            token : $rootScope._userInfo.Token,
                            job_id : _jobID
                        }
                    }).success(function(resp){

                        if(resp.status)
                        {
                            var jobResponseData = resp.data;
                            var jobDetail = jobResponseData.result[0];
                            var jobLocationArray = jobResponseData.location;
                            var skillMapData = resp.data.skill;

                            $scope.jobTid = jobDetail.tid;
                            $scope.jobTitle = jobDetail.jobtitle;
                            $scope.jobCode = jobDetail.jobcode;
                            $scope.jobDescription = jobDetail.jobdescription;
                            $scope.skillKeyWords = jobDetail.keyskills;
                            $scope.jobVacancies = jobDetail.openings;
                            $scope.experienceFrom = jobDetail.expfrom;
                            $scope.experienceTo = jobDetail.expto;
                            $scope.salaryFrom = jobDetail.salaryfrom;
                            $scope.salaryTo = jobDetail.salaryto;
                            $scope.salaryType = jobDetail.salarytype;
                            $scope.jobType = jobDetail.jobtype;
                            $scope.contactName = jobDetail.contactname;
                            $scope.phone = jobDetail.mobile;
                            $scope.emailContact = jobDetail.emailid;
                            $scope.jobStatus = jobDetail.status;
                            $scope.jobCategori = parseInt(jobDetail.jobcategory);
                            $scope.score_from = jobDetail.score_from;
                            $scope.score_to = jobDetail.score_to;

                            for (var nCount = 0; nCount < jobLocationArray.length; nCount++)
                            {
                                delete jobLocationArray[nCount].jobid;
                                $scope.mainLocationArray.push(jobLocationArray[nCount]);
                                $scope.locationArrayString.push(jobLocationArray[nCount].location_title);
                            }

                            $scope.selectedEducations = [];
                            if(jobDetail.Education)
                            {
                                $scope.EducationArray = jobDetail.Education.split(',');
                                for (var nCount = 0; nCount < $scope.EducationArray.length; nCount++)
                                {
                                    $scope.selectedEducations.push(parseInt($scope.EducationArray[nCount]));
                                }
                            }
                            else
                            {
                                $scope.selectedEducations = [];
                            }

                            if($scope.selectedEducations.length)
                            {
                                getSpecialization();
                            }

                            $scope.selectedSpecializations = [];
                            if(jobDetail.Specialization)
                            {
                                $scope.SpecializationArray = jobDetail.Specialization.split(',');
                                for (var nCount = 0; nCount < $scope.SpecializationArray.length; nCount++)
                                {
                                    $scope.selectedSpecializations.push(parseInt($scope.SpecializationArray[nCount]));
                                }
                            }
                            else
                            {
                                $scope.selectedSpecializations = [];
                            }

                            $scope.selectedInstitute = [];
                            if(jobDetail.Institute)
                            {
                                $scope.InstituteArray = jobDetail.Institute.split(',');
                                for (var nCount = 0; nCount < $scope.InstituteArray.length; nCount++)
                                {
                                    $scope.selectedInstitute.push(parseInt($scope.InstituteArray[nCount]));
                                }
                            }
                            else
                            {
                                $scope.selectedInstitute = [];
                            }

                            for(var nCount=0; nCount < skillMapData.length; nCount++)
                            {
                                skillMapData[nCount].expertiseText = [];

                                  var EditExpArray = skillMapData[nCount].expertiseLevel.split(',');
                                    for (var nCountExperties = 0; nCountExperties < EditExpArray.length; nCountExperties++)
                                    {
                                        skillMapData[nCount].expertiseText.push($scope.expertiseLevels[EditExpArray[nCountExperties]]);
                                    }

                                 skillMapData[nCount].expertiseText = skillMapData[nCount].expertiseText.toString();
                            }

                            $scope.skillMatrix = [];
                            $scope.skillMatrix.push(
                                {
                                    "tid":0,
                                    "skillname":"",
                                    "expertiseLevel":0,
                                    "expertiseText":"",
                                    "exp_from":0.00,
                                    "exp_to":0.00,
                                    "active_status":1
                                }
                            );

                            for (var nCount = 0; nCount < skillMapData.length; nCount++)
                            {
                                $scope.skillMatrix.push(skillMapData[nCount]);
                            }

                            for(var ct=0; ct < $scope.skillMatrix.length; ct++)
                            {
                                if(ct == 0)
                                {
                                    $scope.editMode[ct] = true;
                                }
                                else
                                {
                                    $scope.editMode[ct] = false;
                                }
                            }

                            for (var nCount = 0; nCount < $scope.skillMatrix.length; nCount++)
                            {
                              //  $scope.skillMatrix[nCount].active_status = ($scope.skillMatrix[nCount].active_status == 1) ? true : false;
                                skillsTid.push($scope.skillMatrix[nCount].tid);
                            }

                            $scope.editSkill = angular.copy($scope.skillMatrix[0]);
                            $scope.$emit('$preLoaderStop');
                        }
                        else
                        {
                            $scope.$emit('$preLoaderStop');
                        }
                })
                .error(function(err)
                {
                    var msg = 'Something went wrong! Please try again';
                    Notification.error({ message : msg, delay : MsgDelay});
                    $scope.$emit('$preLoaderStop');
                });

                },3000);

            };

            // Cancel job posting form
            $scope.cancelJobPosting = function()
            {
                $scope.showJobListing = true;
            };

            $scope.locationArrayString = [];
            $scope.mainLocationArray = [];

            /***
             * Pre settings
             */
            $scope.salaryTypeArray = ['Per Hour', 'Per Month', 'Per Annual'];
            $scope.activeSalaryType = 1;

            /**
             * Remove a particular element from location array
             */
            $scope.removeLocation = function(id)
            {
                $scope.locationArrayString.splice(id,1);
                $scope.mainLocationArray.splice(id,1);
            }

            /**
             * add location to array
             */
            $scope.addJobLocation = function(param)
            {
                $scope.disabledAddLocation = true;

               if(!param || typeof(param) == undefined)
                {
                    return;
                }
                var tempLocationArray = [];

                if(typeof($scope.jobLat) == undefined || typeof($scope.country) == undefined ||  !$scope.jobLocation.length > 0)
                {
                    return;
                }
                tempLocationArray = {
                    "location_title" : $scope.jobLocation,
                    "latitude" :  $scope.jobLat,
                    "longitude" : $scope.jobLong,
                    "country" : $scope.country,
                    "maptype" : 0
                };

                $scope.mainLocationArray.push(tempLocationArray);
                $scope.locationArrayString.push($scope.jobLocation);
                $scope.jobLocation = "";
            };

            /**
             * add location to array from map
             */
            $scope.addJobLocationFrmoMap = function(_locArrayIndex)
            {
                $scope.disabledAddLocationOnMapPopup = true;
                $scope.modalVisible = false;
                $scope.locIndexToEdit = "";
                if(_locArrayIndex)
                {
                    var locIndex = _locArrayIndex - 1;
                    var tempLocationArray = [];

                    tempLocationArray = {
                        "location_title" : $scope.jobLocation,
                        "latitude" :  $scope.jobLat,
                        "longitude" : $scope.jobLong,
                        "country" : $scope.country,
                        "maptype" : 1
                    };

                    $scope.mainLocationArray[locIndex] = tempLocationArray;
                    $scope.locationArrayString[locIndex] = $scope.jobLocation;
                    $scope.jobLocation = "";
                }
                else
                {
                    return;
                }
                $('.pac-input').val("");
            };

            // Open popup - list of candidate who applied for job
            $scope.openCandidateListPopup = function(_jobID,_totalapplie)
            {
                if(_totalapplie > 0)
                {
                    $scope.changeTabToApplicants(_jobID);
                }
            };

            // Get Educations list
            function getEducations()
            {
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'educations',
                    method : 'GET',
                    params : {
                        token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){
                        //$scope.$emit('$preLoaderStop');
                        $scope.educationList = resp.data;
                    })
                    .error(function(err){
                        var msg = 'Something went wrong! Please try again';
                        Notification.error({ message : msg, delay : MsgDelay});
                        $scope.$emit('$preLoaderStop');
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
            };

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

            $scope.getSpecilizationForEducation = function()
            {
                if($scope.selectedEducations.length)
                {
                    getSpecialization();
                }
                else
                {
                    Notification.error({ message : "Select Education..", delay : MsgDelay});
                }
            };

            function getSpecialization()
            {
                $http({
                    url : GURL + 'specialization',
                    method : 'GET',
                    params : {
                        token : $rootScope._userInfo.Token,
                        education_id : $scope.selectedEducations.toString()
                    }
                }).success(function(resp){
                        $scope.specializationList = resp.data;
                    })
                    .error(function(err){
                        var msg = 'Something went wrong! Please try again';
                        Notification.error({ message : msg, delay : MsgDelay});
                        $scope.$emit('$preLoaderStop');
                    });
            }

            // Get Institute list
            function getInstituteList()
            {
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'verify_institute',
                    method : 'GET',
                    params : {
                        token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){
                       // $scope.$emit('$preLoaderStop');
                        $scope.instituteList = resp.data;
                    })
                .error(function(err){
                        var msg = 'Something went wrong! Please try again';
                        Notification.error({ message : msg, delay : MsgDelay});
                        $scope.$emit('$preLoaderStop');
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
             * Load map in the modal box to change the preferred search location
             * @type {boolean}
             */
            var isMapInitialized = false;
            $scope.modalVisible = false;
            $scope.modalVisibility = function (_locIndex)
            {
                if(_locIndex)
                {
                    var locIndex = _locIndex - 1;

                    $scope.locIndexToEdit = locIndex;
                    $scope.latForMap = $scope.mainLocationArray[locIndex].latitude;
                    $scope.longForMap = $scope.mainLocationArray[locIndex].longitude;
                }
                $scope.modalVisible = !$scope.modalVisible;
            };

            $scope.$watch('modalVisible', function (newVal, oldVal) {
                if (newVal)
                {
                   /* check for the map initialzation */
                    if (!isMapInitialized) {
                        initializeMap();
                        isMapInitialized = true;
                    }
                    else {
                       $timeout(function () {

                           $scope.googleMap1.currentMarkerPosition.latitude = $scope.latForMap;
                           $scope.googleMap1.currentMarkerPosition.longitude = $scope.longForMap;
                           $scope.googleMap1.placeCurrentLocationMarker(getNewCoordinates);
                           $scope.googleMap1.resizeMap();
                           $scope.googleMap1.setMarkersInBounds();

                           //initializeMap();

                        }, 4000);
                    }
                }
            });

            /* modal box for loading map and change the searched map loacaion */
            $scope.modal = {
                title: 'Set Job Location',
                class: 'business-manager-modal'
            };

            var handleNoGeolocation = function () {};

            $scope.googleMap = new GoogleMap();
            $scope.googleMap.addSearchBox('google-map-search-box');
            $scope.googleMap.listenOnMapControls(null,function(lat,lng)
            {
                $scope.jobLat = lat;
                $scope.jobLong = lng;

                $scope.googleMap.getReverseGeolocation(lat,lng).then(function(resp)
                {
                    if(resp.data)
                    {
                        var data = $scope.googleMap.parseReverseGeolocationData(resp.data);
                        $scope.jobLocation = data.city;
                        $scope.country = data.country;
                        $scope.disabledAddLocation = false;
                    }
                    else
                    {
                        Notification.error({message : 'Please enable geolocation settings in your browser',delay : MsgDelay});
                    }
                },function()
                {
                    Notification.error({message : 'Please enable geolocation settings in your browser',delay : MsgDelay});
                    defer.resolve();
                });
            },false);

            /* Callback function for get current location functionality */
            $scope.findCurrentLocation = function(){
                $scope.googleMap1.getCurrentLocation().then(function(){
                    $scope.googleMap1.placeCurrentLocationMarker(null,null,true);
                },function(){
                    $scope.googleMap1.placeCurrentLocationMarker(null,null,true);
                });
            };

            /* Load the map in the modal box */
            /* Google map integration */
            $scope.googleMap1 = new GoogleMap();
            var initializeMap = function () {
                $scope.googleMap1.setSettings({
                    mapElementClass: "col-lg-12 col-md-12 col-sm-12 col-xs-12 bottom-clearfix class-map-ctrl-style1",
                    searchElementClass: "form-control pull-left pac-input",
                    currentLocationElementClass: "link-btn pac-loc",
                    controlsContainerClass: "col-lg-6 col-md-6'"
                });
                $scope.googleMap1.createMap("modal-map-ctrl", $scope, "findCurrentLocation()");

                $scope.googleMap1.renderMap();
                $scope.googleMap1.mapIdleListener().then(function () {
                $scope.googleMap1.pushMapControls();
                $scope.googleMap1.listenOnMapControls(getNewCoordinates, getNewCoordinates);

                    /* place the present location marker on map */
                    if(($scope.latForMap) && ($scope.longForMap))
                    {
                        $scope.googleMap1.currentMarkerPosition.latitude = $scope.latForMap;
                        $scope.googleMap1.currentMarkerPosition.longitude = $scope.longForMap;
                        $scope.googleMap1.placeCurrentLocationMarker(getNewCoordinates);

                        /* if this modal box map is opened from search result page: Add marker for additional */
                        $scope.googleMap1.resizeMap();
                    }
                    else
                    {
                            $scope.googleMap1.getCurrentLocation().then(function (e) {
                            $scope.googleMap1.placeCurrentLocationMarker(getNewCoordinates);

                            /* if this modal box map is opened from search result page: Add marker for additional */
                            $scope.googleMap1.resizeMap();
                            $scope.googleMap1.setMarkersInBounds();
                        }, function () {

                        });
                    }
                    $('.pac-input').val("");

                });
            };

            /* update the coordinates on drag event of map marker */
            var getNewCoordinates = function (lat, lng) {

                $scope.jobLat = lat;
                $scope.jobLong = lng;

                /* get new location string */
                $scope.googleMap1.getReverseGeolocation(lat, lng).then(function (resp) {
                    if (resp)
                    {
                        var data = $scope.googleMap1.parseReverseGeolocationData(resp.data);

                        var options = {
                            route : true,
                            sublocality3 : true,
                            sublocality2 : true,
                            area : true,
                            city : true,
                            state : true,
                            country : false,
                            postalCode : false
                        };

                        $scope.locationString = $scope.googleMap1.createAddressFromGeolocation(data,options);
                        $scope.location = $scope.googleMap1.createAddressFromGeolocation(data,options);
                        $scope.jobLocation = data.city;
                        $scope.country = data.country;

                        if($scope.jobLocation)
                        {
                            $scope.disabledAddLocationOnMapPopup = false;
                        }
                        else
                        {
                            $scope.disabledAddLocationOnMapPopup = true;
                        }
                    }
                });
            };

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
                 getPostedJob();
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
                getPostedJob();
                $scope.paginationVisibility();
            };

            /**
             * Toggle the visibility of the pagination buttons
             */
            $scope.paginationPreviousVisibility = true;
            $scope.paginationNextVisibility = true;

            $scope.paginationVisibility = function()
            {
                var totalResult = parseInt($scope.totalResult);
                var currentCount = parseInt($scope.pageCount);
                var resultSize = parseInt($scope.pageSize);

                /* initial state */
                if((totalResult <= (currentCount+resultSize)) && currentCount == 0)
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

            $scope.refreshJob = function(_jobID)
            {
                if(_jobID)
                {
                    $scope.$emit('$preLoaderStart');
                    $http({
                        url : GURL + 'refresh_job',
                        method : 'PUT',
                        data : {
                            token : $rootScope._userInfo.Token,
                            job_id : _jobID
                        }
                    }).success(function(resp){
                        $scope.$emit('$preLoaderStop');
                        if(resp.status)
                        {
                            getPostedJob();
                            $scope.jobSearchTerm = "";
                            $scope.jobFilterStatus = 0;
                        }
                    })
                    .error(function(err)
                    {
                        $scope.$emit('$preLoaderStop');
                    });
                }
            };

            /**   Skill map functions Start */

            $scope.complete=function(_index){

                $( "#tags"+_index ).autocomplete({
                    source: $scope.availableTags
                });

                $("#tags"+_index ).on("autocompleteselect", function( event, ui ) {
                    $scope.editSkill.skillname = ui.item.value;
                });
            };

            $scope.expertiseLevels = [
                'Beginner',
                'Independent',
                'Expert',
                'Master'
            ];

            $scope.deleteSkilFromMartix=function(_index, _tid)
            {
                if (_index > -1)
                {
                    $scope.editMode.splice(_index,1);
                    $scope.skillMatrix.splice(_index, 1);
                    skillsTid.splice(_index,1);
                }
                if($scope.skillMatrix.length == 0)
                {
                    $scope.skillMatrix = [];
                    skillsTid = [];
                    $scope.editMode = [];
                }
            };

            $scope.checkExp = function(index)
            {
                if((parseFloat($scope.skillMatrix[index].exp_from) == NaN) && (parseFloat($scope.skillMatrix[index].exp_to) == NaN))
                {
                    $scope.skillMatrix[index].exp_from = 0.00;
                    $scope.skillMatrix[index].exp_to = 0.00;
                }
                $scope.skillMatrix[index].exp_from = (parseFloat($scope.skillMatrix[index].exp_from)).toFixed(2);
                $scope.skillMatrix[index].exp_to = (parseFloat($scope.skillMatrix[index].exp_to)).toFixed(2);
            };

            // SkillMap Validation function
            function validateSkillMap(_skillArray){

                var newSkill = _skillArray;
                var err = [];

                if(newSkill.skillname.length < 1 ){
                    err.push('Skill is empty');
                }
                if((newSkill.exp_from.length < 1) || (!(newSkill.exp_from)) || (newSkill.exp_from.length == undefined))
                {
                    err.push('Experience From is empty');
                }
                if((newSkill.exp_to.length < 1) || (!(newSkill.exp_to)) || (newSkill.exp_to.length == undefined))
                {
                    err.push('Experience To is empty');
                }
                if(parseInt(newSkill.exp_to) < parseInt(newSkill.exp_from)){
                    err.push('Experience From is smaller than Experience To');
                }

                if(err.length > 0)
                {
                    for(var i = 0; i < err.length; i++)
                    {
                        Notification.error({ message : err[i], delay : 3000});
                    }
                    return false;
                }
                return true;
            };


            $scope.saveSkillFn = function(index){
                if(index == 0)
                {
                    var ind = $scope.skillMatrix.indexOfWhere('skillname',$scope.editSkill.skillname);
                    if(ind > 0)
                    {
                        $scope.editSkill = {
                            "tid":0,
                            "skillname":"",
                            "expertiseLevel":0,
                            "expertiseText":"",
                            "exp_from":0.00,
                            "exp_to":0.00,
                            "active_status":1
                        };
                        return;
                    }

                    var newSkill = angular.copy($scope.editSkill);

                    $scope.editMode.push(false);

                    /*if(newSkill.skillname && newSkill.exp)*/
                    if(validateSkillMap(newSkill))
                    {
                        $scope.skillMatrix.push(newSkill);
                    }
                    else
                    {
                      //  $scope.editMode.pop();
                        $scope.editSkill = {
                            "tid":0,
                            "skillname":"",
                            "expertiseLevel":0,
                            "expertiseText":"",
                            "exp_from":0.00,
                            "exp_to":0.00,
                            "active_status":1
                        };


                        $scope.expertiseLevelsIDs = ["0"];
                        $scope.expertiseLevelsTexts = ["Beginner"];
                        $scope.editSkill.expertiseLevel = $scope.expertiseLevelsIDs.toString();
                        $scope.editSkill.expertiseText = $scope.expertiseLevelsTexts.toString();

                        $scope.inputExpertise = [
                        {name: "Beginner",value:"0", ticked: true },
                        {name: "Independent",value:"1", ticked: false},
                        {name: "Expert",value:"2",ticked: false},
                        {name: "Master",value:"3",ticked: false}
                        ];
                    }
                }
                else
                {
                    var editedSkill = angular.copy($scope.editSkill);
                   // if(editedSkill.skillname)
                    if(validateSkillMap(editedSkill))
                    {

                        $scope.skillMatrix[index] = editedSkill;
                        //$scope.skillMatrix[index] = angular.copy($scope.editSkill);
                        $scope.editMode[index] = false;
                        $scope.editMode[0] = true;

                        $scope.editSkill = {
                            "tid":0,
                            "skillname":"",
                            "expertiseLevel":0,
                            "expertiseText":"",
                            "exp_from":0.00,
                            "exp_to":0.00,
                            "active_status":1
                        };

                        $scope.expertiseLevelsIDs = ["0"];
                        $scope.expertiseLevelsTexts = ["Beginner"];
                        $scope.editSkill.expertiseLevel = $scope.expertiseLevelsIDs.toString();
                        $scope.editSkill.expertiseText = $scope.expertiseLevelsTexts.toString();

                        $scope.inputExpertise = [
                            {name: "Beginner",value:"0", ticked: true },
                            {name: "Independent",value:"1", ticked: false},
                            {name: "Expert",value:"2",ticked: false},
                            {name: "Master",value:"3",ticked: false}
                        ];
                    }
                   /* else{
                        $scope.editMode.pop();
                    }*/
                }

                $scope.skillMatrix[0] = {
                    "tid":0,
                    "skillname":"",
                    "expertiseLevel":0,
                    "expertiseText":"",
                    "exp_from":0.00,
                    "exp_to":0.00,
                    "active_status":1
                };
            };

            var editSkill = {
                "tid":0,
                "skillname":"",
                "expertiseLevel":0,
                "expertiseText":"",
                "exp_from":"1",
                "exp_to":"2",
                "active_status":1
            };

            $scope.setActiveSkill = function(_skillID)
            {
                $scope.editSkill.active_status = _skillID;
            };

            $scope.editSkillFn = function(index)
            {
                $scope.editSkill = angular.copy($scope.skillMatrix[index]);

                for(var ct=0; ct < $scope.skillMatrix.length; ct++){
                    if($scope.editMode[ct] && ct !== index){
                        $scope.editMode[ct] = false;
                    }
                    else if(ct == index){
                        $scope.editMode[ct] = true;
                    }
                }

                $scope.expertiesArray = [];
                $scope.expertiesArray = $scope.skillMatrix[index].expertiseLevel.split(',');
                $scope.inputExpertise = [];
                $scope.inputExpertise = [
                    {name: "Beginner",value:"0", ticked: false },
                    {name: "Independent",value:"1", ticked: false},
                    {name: "Expert",value:"2",ticked: false},
                    {name: "Master",value:"3",ticked: false}
                ];

                for(var i =0; i < $scope.expertiesArray.length; i++)
                {
                    var eIndex = $scope.inputExpertise.indexOfWhere('value',$scope.expertiesArray[i]);
                    if(eIndex !== -1)
                    {
                        $scope.inputExpertise[eIndex].ticked = true;
                    }
                }

                $scope.expertiseLevelsIDs = [];
                $scope.expertiseLevelsTexts = [];

                var editExpertiesArray = [];
                editExpertiesArray = $scope.editSkill.expertiseLevel.split(',');
                for(var i = 0; i < editExpertiesArray.length; i++)
                {
                    $scope.expertiseLevelsIDs.push(editExpertiesArray[i]);
                }

                var editExpertiesTextArray = [];
                editExpertiesTextArray = $scope.editSkill.expertiseText.split(',');

                for(var i = 0; i < editExpertiesTextArray.length; i++)
                {
                    $scope.expertiseLevelsTexts.push(editExpertiesTextArray[i]);
                }
            };

            $scope.$watch('editSkill.exp_from',function(n,v){
                if(parseFloat(n) == NaN){
                    $scope.editSkill.exp_from = 0.0;
                }
                if(n && (n !== v)){
                    $scope.editSkill.exp_from = (parseFloat($scope.editSkill.exp_from) !== NaN &&
                        parseFloat($scope.editSkill.exp_from) >= 0 && parseFloat($scope.editSkill.exp_from) < 51) ? (parseFloat($scope.editSkill.exp_from)).toFixed(1) : 0.0;
                }
            });

            $scope.$watch('editSkill.exp_to',function(n,v){
                if(parseFloat(n) == NaN){
                    $scope.editSkill.exp_to = 0.0;
                }
                if(n && (n !== v)){
                    $scope.editSkill.exp_to = (parseFloat($scope.editSkill.exp_to) !== NaN &&
                        parseFloat($scope.editSkill.exp_to) >= 0 && parseFloat($scope.editSkill.exp_to) < 51) ? (parseFloat($scope.editSkill.exp_to)).toFixed(1) : 0.0;
                }
            });

            function getAllSkills(){
                $scope.$emit('$preLoaderStart');
                $http({
                    method: 'get',
                    url : GURL + 'skill_list'

                }).success(function (res)
                    {
                        if(res.status)
                        {
                            for (var nCount = 0; nCount < res.data.length; nCount++)
                            {
                                $scope.availableTags.push(res.data[nCount].SkillTitle);
                            }
                        }
                    }).error(function(err){
                        $scope.$emit('$preLoaderStop');
                    });
            };
            /**   Skill map functions End */

            /** Multiselct Combo **/
            $scope.fOpen = function() {
            };

            $scope.fClose = function() {
            };

            $scope.fClick = function( data )
            {
                if($scope.expertiseLevelsIDs.indexOf(data.value)!=-1)
                {
                    var index = $scope.expertiseLevelsIDs.indexOf(data.value);
                    $scope.expertiseLevelsIDs.splice(index,1);
                    $scope.expertiseLevelsTexts.splice(index,1);
                }
                else
                {
                    $scope.expertiseLevelsIDs.push(data.value);
                    $scope.expertiseLevelsTexts.push($scope.expertiseLevels[data.value]);
                }

                $scope.editSkill.expertiseLevel = $scope.expertiseLevelsIDs.toString();
                $scope.editSkill.expertiseText = $scope.expertiseLevelsTexts.toString();
            };

            $scope.fSelectAll = function()
            {};

            $scope.fSelectNone = function()
            {};

            $scope.fReset = function()
            {};

            $scope.fClear = function() {
            };

            $scope.fSearchChange = function( data ) {
            };

            $scope.functionTags = {
                selectAll : "Select All",
                reset : "Reset",
                search : "Search Function",
                selectNone : "Deselect All",
                nothingSelected  : "Expertise Level"
            };

            $scope.inputExpertise = [
                {name: "Beginner",value:"0", ticked: true },
                {name: "Independent",value:"1", ticked: false},
                {name: "Expert",value:"2",ticked: false},
                {name: "Master",value:"3",ticked: false}
            ];



        }]);
})();