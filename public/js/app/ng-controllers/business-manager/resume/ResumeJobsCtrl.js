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
            $scope.salaryType = 1;
            $scope.jobType = 0;
            $scope.contactName = "";
            $scope.phone = "";
            $scope.emailContact = "";
            $scope.jobCategori = 0;
            $scope.selectedEducations = [];
            $scope.selectedSpecializations = [];
            $scope.selectedInstitute = [];

            $scope.$watch('_userInfo.IsAuthenticate', function () {
                $('.dropdown-toggle').click(function(){$( ".filter-dropdown" ).slideToggle( "slow", function() {
                    // Animation complete.
                });})
                $('.dropdown-toggleSpecialization').click(function(){$( ".filter-dropdownspecialization" ).slideToggle( "slow", function() {
                    // Animation complete.
                });})
                $('.dropdown-toggleInstitute').click(function(){$( ".filter-dropdownInstitute" ).slideToggle( "slow", function() {
                    // Animation complete.
                });})
            });

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

            // Get all location list
            function getLocationList()
            {
                $http({
                    url : GURL + 'ewtGetLocationListForEZEID',
                    method : 'GET',
                    params : {
                        Token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){



                }).error(function(err){
                    //  defer.reject();
                });
            }

            /**
             * select Resume Inquiries Tab
             */
           /* $scope.TabResumeInquiries = function(){
                $scope.ResumeInquiriesTab = true;
                $scope.JobsTab = false;
                $scope.JobSeekerTab = false;
            };*/

            /**
             * select Post Job Tab
             */
          //  $scope.TabPostJob = function(){
                $scope.ResumeInquiriesTab = false;
                $scope.JobsTab = true;
                $scope.JobSeekerTab = false;
                $scope.showJobListing = true;

                $scope.jobSearchTerm= "";
                $scope.jobFilterStatus = 0;
                //Per page record is 10
                $scope.page_size = 10;
                $scope.page_count = 0;
                $scope.order_by = 1;

                getPostedJob();

                // getLocationList();
            //};

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
                        page_size : $scope.page_size,
                        page_count : $scope.page_count,
                        order_by : $scope.order_by
                    }
                }).success(function(resp){
                    $scope.$emit('$preLoaderStop');

                    if(resp.status)
                    {
                        for(var i = 0; i < resp.data.result.length; i++)
                        {
                            resp.data.result[i].posteddate = convertTimeToLocal(resp.data.result[i].posteddate,'DD-MMM-YYYY hh:mm A','DD-MMM-YYYY hh:mm A');
                        }
                        $scope.jobData = resp.data.result;

                        for(var i = 0; i < resp.data.job_location.length; i++)
                        {
                            $scope.mainLocationArray.push(resp.data.job_location[i]);
                            $scope.locationArrayString.push(resp.data.job_location[i].Locname);
                        }

                        //  $scope.mainLocationArray.push(tempLocationArray);
                        //     $scope.locationArrayString.push($scope.jobLocation);
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
                if($scope.skillKeyWords.length < 1){
                    err.push('Skill Keywords is empty');
                }
                if($scope.experienceFrom.length < 1){
                    err.push('Experience From is empty');
                }
                if($scope.experienceTo.length < 1){
                    err.push('Experience To is empty');
                }
                if($scope.salaryFrom.length < 1){
                    err.push('Salary From is empty');
                }
                if($scope.salaryTo.length < 1){
                    err.push('Salary To is empty');
                }
                if($scope.jobType == 0){
                    err.push('Please select Job type');
                }
                if($scope.contactName.length < 1){
                    err.push('Contact Name is empty');
                }
                if($scope.phone.length < 1){
                    err.push('Phone is empty');
                }
                if(!$scope.emailContact){
                    err.push('Email is empty');
                }
                if($scope.isWrongEmailPatternFrom)
                {
                    err.push('Not valid email!');
                }
                if($scope.jobCategori == 0){
                    err.push('Please select Job category');
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

            // save job to system
            $scope.postJob = function(){
                if(validateItem())
                {
                    $scope.$emit('$preLoaderStart');

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
                        keySkills : $scope.skillKeyWords,
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
                        aggregate_score : $scope.aggregate_score
                    }

                    $http({
                        method: "POST",
                        url: GURL + 'job',
                        data:  $scope.jobData
                    }).success(function (data) {
                        $scope.$emit('$preLoaderStop');

                        if(data.status)
                        {
                            $scope.jobSearchTerm= "";
                            $scope.jobFilterStatus = 0;
                            getPostedJob();
                            $scope.showJobListing = true;
                        }
                    })
                    .error(function(data, status, headers, config) {
                        $scope.$emit('$preLoaderStop');
                    });
                }
            };

            $scope.SalaryTypeList = [{ id: 1, label: "Hour" }, { id: 2, label: "Month" }, { id: 3, label: "Annual" }];

            // Get job Categories
            function getJobCategories()
            {
                $http({
                    url : GURL + 'ewmGetCategory',
                    method : 'GET',
                    params : {
                        LangID : 1
                    }
                }).success(function(resp){
                    $scope.jobCategories = resp;

                }).error(function(err){

                });
            }

            // Show job posting form
            $scope.openJobPostForm = function(_index){

                getJobCategories();
                getEducations();
                getSpecialization();
                getInstituteList();
                $scope.showJobListing = false;

                $scope.locationArrayString = [];
                $scope.mainLocationArray = [];

                if(_index == 'add')
                {
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
                    $scope.salaryType = 1;
                    $scope.jobType = 0;
                    $scope.contactName = "";
                    $scope.phone = "";
                    $scope.emailContact = "";
                    $scope.jobStatus = 0;
                }
                else
                {
                    $scope.jobTid = $scope.jobData[_index].tid;
                    $scope.jobTitle = $scope.jobData[_index].jobtitle;
                    $scope.jobCode = $scope.jobData[_index].jobcode;
                    $scope.jobDescription = $scope.jobData[_index].jobdescription;
                    $scope.skillKeyWords = $scope.jobData[_index].keyskills;
                    $scope.jobVacancies = $scope.jobData[_index].openings;
                    $scope.experienceFrom = $scope.jobData[_index].expfrom;
                    $scope.experienceTo = $scope.jobData[_index].expto;

                    //    $scope.jobLocation = $scope.jobData[_index].location;

                    $scope.salaryFrom = $scope.jobData[_index].salaryfrom;
                    $scope.salaryTo = $scope.jobData[_index].salaryto;
                    $scope.salaryType = $scope.jobData[_index].salarytype;
                    $scope.jobType = $scope.jobData[_index].jobtype;
                    $scope.contactName = $scope.jobData[_index].contactname;
                    $scope.phone = $scope.jobData[_index].mobile;
                    $scope.emailContact = $scope.jobData[_index].emailid;
                    $scope.jobStatus = $scope.jobData[_index].status;

                    var res = $scope.jobData[_index].location.split(",");
                }

            };

            // Cancel job posting form
            $scope.cancelJobPosting = function(){
                $scope.showJobListing = true;
            };

            $scope.locationArrayString = [];
            $scope.mainLocationArray = [];

            //For fatching location to post job
            var googleMap = new GoogleMap();
            googleMap.addSearchBox('google-map-search-box');
            //   googleMap.addSearchBox('google-map-search-box1');
            googleMap.listenOnMapControls(null,function(lat,lng){
                $scope.jobLat = lat;
                $scope.jobLong = lng;
                googleMap.getReverseGeolocation(lat,lng).then(function(resp){
                    if(resp.data){
                        var data = googleMap.parseReverseGeolocationData(resp.data);
                        $scope.jobLocation = data.city;
                        $scope.country = data.country;
                    }
                    else{
                        Notification.error({message : 'Please enable geolocation settings in your browser',delay : MsgDelay});
                    }
                },function(){
                    Notification.error({message : 'Please enable geolocation settings in your browser',delay : MsgDelay});
                    defer.resolve();
                });
            },false);

            /***
             * Pre settings
             */
            $scope.salaryTypeArray = ['per Hour', 'per Month', 'per Annual'];
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
                    "country" : $scope.country
                };

                $scope.mainLocationArray.push(tempLocationArray);
                $scope.locationArrayString.push($scope.jobLocation);
                $scope.jobLocation = "";

        //        console.log($scope.mainLocationArray);
            }

            $scope.candidateModalBox = {
                title : 'View Candidate',
                class : 'business-manager-modal'
            };
            $scope.showCandidateListModal = false;

            // Get applied candidate List for job
            function getCandidateList(_jobID)
            {
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'job_applied_list',
                    method : 'GET',
                    params : {
                        job_id : _jobID
                    }
                }).success(function(resp){
                    $scope.$emit('$preLoaderStop');

                    if(resp.status)
                    {

                    }

                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                });
            }

            // Open popup - list of candidate who applied for job
            $scope.openCandidateListPopup = function(_jobID)
            {
             //   console.log("job id"+_jobID);
                $scope.showCandidateListModal = !$scope.showCandidateListModal;

                if(_jobID)
                {
                    getCandidateList(_jobID);
                }
            }

            // Get Educations list
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

            $scope.InstituteTextBoxLossFocus = function () {
                console.log("SAi222");

               /* $( ".filter-dropdown" ).slideToggle( "slow", function() {
                    // Animation complete.
                });
                $( ".filter-dropdownspecialization" ).slideToggle( "slow", function() {
                    // Animation complete.
                });*/

                $( ".filter-dropdown" ).slideToggle( "slow", function() {
                    // Animation complete.
                });



            };


        }]);
})();