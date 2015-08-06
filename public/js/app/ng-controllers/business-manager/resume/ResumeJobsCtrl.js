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
            var placeDetail = [];
            $scope.locIndexToEdit = "";
            $scope.disabledAddLocation = true;

            //Pagination settings
            $scope.pageSize = 5;//Results per page
            $scope.pageCount = 0;//Everything starts with a 0 - 10,20,30 etc.
            $scope.totalResult = 0;//Total results
            $scope.resultThisPage = 0;//Total results you got this page


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
                        console.log("sai1122");
                        console.log(resp);
                        $scope.totalResult = resp.data.total_count;
                        $scope.resultThisPage = resp.data.result.length;

                        console.log($scope.totalResult);
                        console.log($scope.resultThisPage);

                        for(var i = 0; i < resp.data.result.length; i++)
                        {
                            resp.data.result[i].posteddate = convertTimeToLocal(resp.data.result[i].posteddate,'DD-MMM-YYYY hh:mm A','DD-MMM-YYYY hh:mm A');
                        }

                        for(var jobCount = 0; jobCount < resp.data.result.length; jobCount++)
                        {
                            resp.data.result[jobCount].locationArray = [];

                            for(var i = 0; i < resp.data.job_location.length; i++)
                            {
                                if(resp.data.result[jobCount].tid == resp.data.job_location[i].jobid)
                                {
                                    resp.data.result[jobCount].locationArray.push(resp.data.job_location[i]);
                                }
                            }
                        }

                        $scope.jobData = resp.data.result;
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
                if($scope.jobVacancies.length < 1)
                {
                    err.push('Job Vacancies is empty');
                }
                if($scope.experienceFrom.length < 1){
                    err.push('Experience From is empty');
                }
                if($scope.experienceTo.length < 1){
                    err.push('Experience To is empty');
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
                $scope.$emit('$preLoaderStart');
                getJobCategories();
                getEducations();
                getSpecialization();
                getInstituteList();

                $scope.showJobListing = false;
                $scope.locationArrayString = [];
                $scope.mainLocationArray = [];

                if(_index == 'add')
                {
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
                    $scope.salaryType = 1;
                    $scope.jobType = 0;
                    $scope.contactName = "";
                    $scope.phone = "";
                    $scope.emailContact = "";
                    $scope.jobStatus = 0;
                    $scope.jobCategori = 0;
                    $scope.selectedEducations = [];
                    $scope.selectedSpecializations = [];
                    $scope.selectedInstitute = [];
                    $scope.aggregate_score = "";
                }
                else
                {
                    $timeout(function()
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
                        $scope.jobCategori = parseInt($scope.jobData[_index].jobcategory);

                        for (var nCount = 0; nCount < $scope.jobData[_index].locationArray.length; nCount++)
                        {
                            //delete $scope.jobData[_index].locationArray[nCount].jobid;
                            $scope.mainLocationArray.push($scope.jobData[_index].locationArray[nCount]);
                            $scope.locationArrayString.push($scope.jobData[_index].locationArray[nCount].Locname);
                        }

                        $scope.EducationArray = $scope.jobData[_index].Education.split(',');
                        for (var nCount = 0; nCount < $scope.EducationArray.length; nCount++)
                        {
                            $scope.selectedEducations.push(parseInt($scope.EducationArray[nCount]));
                        }

                        $scope.SpecializationArray = $scope.jobData[_index].Specialization.split(',');
                        for (var nCount = 0; nCount < $scope.SpecializationArray.length; nCount++)
                        {
                            $scope.selectedSpecializations.push(parseInt($scope.SpecializationArray[nCount]));
                        }

                        $scope.SpecializationArray = $scope.jobData[_index].Specialization.split(',');
                        for (var nCount = 0; nCount < $scope.SpecializationArray.length; nCount++)
                        {
                            $scope.selectedSpecializations.push(parseInt($scope.SpecializationArray[nCount]));
                        }

                        $scope.InstituteArray = $scope.jobData[_index].Institute.split(',');
                        for (var nCount = 0; nCount < $scope.InstituteArray.length; nCount++)
                        {
                           $scope.selectedInstitute.push(parseInt($scope.InstituteArray[nCount]));
                        }

                        $scope.aggregate_score = $scope.jobData[_index].Aggregatescore;


                        $scope.$emit('$preLoaderStop');
                    },3000);
                }
            };

            // Cancel job posting form
            $scope.cancelJobPosting = function(){
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
                $scope.modalVisible = false;
                $scope.locIndexToEdit = "";
                if(_locArrayIndex)
                {
                    var tempLocationArray = [];

                    tempLocationArray = {
                        "location_title" : $scope.jobLocation,
                        "latitude" :  $scope.jobLat,
                        "longitude" : $scope.jobLong,
                        "country" : $scope.country,
                        "maptype" : 0
                    };

                    $scope.mainLocationArray[_locArrayIndex] = tempLocationArray;
                    $scope.locationArrayString[_locArrayIndex] = $scope.jobLocation;
                    $scope.jobLocation = "";
                }
                else
                {
                    return;
                }
            };

            // Open popup - list of candidate who applied for job
            $scope.openCandidateListPopup = function(_jobID,_totalapplie)
            {
                $scope.jobTid = _jobID;
                if(_totalapplie > 0)
                {
                    $scope.ResumeInquiriesTab = true;
                    $scope.JobsTab = false;
                    $scope.JobSeekerTab = false;
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

               /* $( ".filter-dropdown" ).slideToggle( "slow", function() {
                    // Animation complete.
                });
                $( ".filter-dropdownspecialization" ).slideToggle( "slow", function() {
                    // Animation complete.
                });*/

             /*   $( ".filter-dropdown" ).slideToggle( "slow", function() {
                    // Animation complete.
                });*/



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
                    $scope.locIndexToEdit = _locIndex;
                    $scope.latForMap = $scope.mainLocationArray[_locIndex].latitude;
                    $scope.longForMap = $scope.mainLocationArray[_locIndex].longitude;
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
                            $scope.googleMap.resizeMap();
                            $scope.googleMap.setMarkersInBounds();
                        }, 1500);
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
                $scope.googleMap.getCurrentLocation().then(function(){
                    $scope.googleMap.placeCurrentLocationMarker(null,null,true);
                },function(){
                    $scope.googleMap.placeCurrentLocationMarker(null,null,true);
                });
            };

            /* Load the map in the modal box */
            /* Google map integration */
            var initializeMap = function () {
                $scope.googleMap.setSettings({
                    mapElementClass: "col-lg-12 col-md-12 col-sm-12 col-xs-12 bottom-clearfix class-map-ctrl-style1",
                    searchElementClass: "form-control pull-left pac-input",
                    currentLocationElementClass: "link-btn pac-loc",
                    controlsContainerClass: "col-lg-6 col-md-6'"
                });
                $scope.googleMap.createMap("modal-map-ctrl", $scope, "findCurrentLocation()");

                $scope.googleMap.renderMap();
                $scope.googleMap.mapIdleListener().then(function () {
                    $scope.googleMap.pushMapControls();
                    $scope.googleMap.listenOnMapControls(getNewCoordinates, getNewCoordinates);

                    /* place the present location marker on map */
                    if(($scope.latForMap) && ($scope.longForMap))
                    {
                        $scope.googleMap.currentMarkerPosition.latitude = $scope.latForMap;
                        $scope.googleMap.currentMarkerPosition.longitude = $scope.longForMap;
                        $scope.googleMap.placeCurrentLocationMarker(getNewCoordinates);

                        /* if this modal box map is opened from search result page: Add marker for additional */
                        $scope.googleMap.resizeMap();
                    }
                    else{
                            $scope.googleMap.getCurrentLocation().then(function (e) {

                            $scope.googleMap.placeCurrentLocationMarker(getNewCoordinates);

                            /* if this modal box map is opened from search result page: Add marker for additional */
                            $scope.googleMap.resizeMap();
                            $scope.googleMap.setMarkersInBounds();
                        }, function () {

                        });
                    }
                });
            };

            /* update the coordinates on drag event of map marker */
            var getNewCoordinates = function (lat, lng) {

                $scope.jobLat = lat;
                $scope.jobLong = lng;

                /* get new location string */
                $scope.googleMap.getReverseGeolocation(lat, lng).then(function (resp) {
                    if (resp)
                    {
                        placeDetail = $scope.googleMap.parseReverseGeolocationData(resp.data);

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
                        $scope.locationString = $scope.googleMap.createAddressFromGeolocation(placeDetail,options);
                        $scope.location = $scope.googleMap.createAddressFromGeolocation(placeDetail,options);
                        $scope.jobLocation = placeDetail.city;
                        $scope.country = placeDetail.country;
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
                $scope.triggerSearch(1);
                $scope.paginationVisibility();
            }

            /**
             * load the previous results
             */
            $scope.paginationPreviousClick = function()
            {
                $scope.pageCount -= $scope.pageSize;
                /* trigger previous results */
                $scope.triggerSearch(1);
                $scope.paginationVisibility();
            }

            /**
             * Toggle the visibility of the pagination buttons
             */
            $scope.paginationNextVisibility = true;
            $scope.paginationPreviousVisibility = true;
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

                console.log($scope.paginationPreviousVisibility,$scope.paginationNextVisibility);
            }


        }]);
})();