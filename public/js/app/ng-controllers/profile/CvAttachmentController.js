angular.module('ezeidApp').controller('CVAttachController',[
    '$http', '$rootScope', '$scope', '$timeout', 'Notification', '$filter','$q', '$window','$location','GURL','GoogleMaps','$routeParams',
    function($http, $rootScope, $scope, $timeout, Notification, $filter, $q, $window, $location, GURL, GoogleMap, $routeParams){

    var CVAttachCtrl = this;
    CVAttachCtrl._CVInfo = {};
    var MsgDelay = 2000;
    // Add more skills
    $scope.skillMatrix = [];
    $scope.editMode = [];
    $scope.editSkill = {
        "tid":0,
        "skillname":"",
        "expertiseLevel":0,
        "exp":0.00,
        "active_status":true
    };

    var skillsTid = [];
    $scope.availableTags = [];

    CVAttachCtrl._CVInfo.job_type = 0;
    $scope.locationName = "";
    // CVAttachCtrl._CVInfo.job_location1 = "";
    CVAttachCtrl._CVInfo.experience = 0;
    CVAttachCtrl._CVInfo.education_id = 0;
    CVAttachCtrl._CVInfo.specialization_id = 0;
    CVAttachCtrl._CVInfo.current_employeer = "";
    CVAttachCtrl._CVInfo.current_job_title = "";
    CVAttachCtrl._CVInfo.exp_salary = 0;
    CVAttachCtrl._CVInfo.institute_id = 0;
    CVAttachCtrl._CVInfo.institute_title = "";
    CVAttachCtrl._CVInfo.Status = 1;

    $scope.modernBrowsers = [];
    $scope.instituteText = "";
    $scope.instituteID = 0;
    $scope.specilizationText = "";
    $scope.showSpecializationDropDown = true;

    // Bellow code id for apply for job
    $scope.job_id = 0;
    if($routeParams.jobid)
    {
        $scope.job_id = $routeParams.jobid;
    }

    $scope.selectedFunctions = [];
    $scope.selectedCategories = [];

    /**
     * Hide all the open dropdown
     */
    function hideAllDropdoowns(id)
    {
        if(parseInt(id) != 2)
        {
            $('.filter-dropdownInstitute').hide();
        }
    }

    $scope.$watch('_userInfo.IsAuthenticate', function ()
    {
        if ($rootScope._userInfo.IsAuthenticate == true)
        {
            $('html').click(function() {
                $('.filter-dropdownInstitute').hide();
            });

           // $scope.jobCategoriesGetResponse = false;
            $scope.instituteGetResponse = false;
            $scope.educationsGetResponse = false;

            //getJobCategories();
            getInstituteList();
            getEducations();
        }
        else
        {
            $location.path('/');
        }
    });

    $scope.locationArrayString = [];
    $scope.mainLocationArray = [];

    //For fatching location to post job
    var googleMap = new GoogleMap();
    googleMap.addSearchBox('google-map-search-box');
    googleMap.listenOnMapControls(null,function(lat,lng){
            $scope.jobLat = lat;
            $scope.jobLong = lng;
            googleMap.getReverseGeolocation(lat,lng).then(function(resp){
                if(resp.data)
                {
                    var data = googleMap.parseReverseGeolocationData(resp.data);
                    $scope.locationName = data.city;
                    $scope.country = data.country;
                }
                else
                {
                    Notification.error({message : 'Please enable geolocation settings in your browser',delay : MsgDelay});
                }
            },function(){
                Notification.error({message : 'Please enable geolocation settings in your browser',delay : MsgDelay});
                defer.resolve();
            });
        },false);

    $http({ method: 'get', url: GURL + 'ewmGetFunctions?LangID=1'}).success(function (data) {
        CVAttachCtrl.Functions = data;
       // $scope.modernBrowsers = data;
    });

    //if secure pin checkbox is uncheck remove PIN Value
    this.securePinCliked = function () {
        if(!CVAttachCtrl.EnablePin)
        {
            CVAttachCtrl._CVInfo.Pin = "";
        }
    };

    $scope.showSelectedText = false;
    $scope.uploadFile = function (files)
    {
        $scope.DocumentToUpload = files;

         if($scope.DocumentToUpload)
         {
             $scope.$emit('$preLoaderStart');
             CVAttachCtrl._CVInfo.CVDocFile = $scope.DocumentToUpload[0].name;
             var $file = $scope.DocumentToUpload[0];
             var formData = new FormData();
             formData.append('file', $file);
             formData.append('TokenNo', $rootScope._userInfo.Token);
             formData.append('RefType', 7);

             $http({ method: 'POST', url: '/ewTUploadDoc/', data: formData,
             headers: { 'Content-Type': undefined }, transformRequest: angular.identity })
             .success(function (data, status, headers, config) {
                 // $location.path('/');
                 if(data.IsSuccessfull)
                 {
                    $scope.showLink = true;
                    $scope.$emit('$preLoaderStop');
                 }
             })
             .error(function(data, status, headers, config) {
                 Notification.error({message: "An error occurred..", delay: MsgDelay});
                 $scope.$emit('$preLoaderStop');
             });
         }
    };

    var fileToDataURL = function (file) {
        var deferred = $q.defer();
        var reader = new FileReader();
        reader.onload = function (e) {
            deferred.resolve(e.target.result);
        };
        reader.readAsDataURL(file);
        return deferred.promise;
    };

    function isValidate()
    {
        var notificationMessage = "";
        var errorList  = [];
        if(CVAttachCtrl._CVInfo.Pin)
        {
            if(CVAttachCtrl._CVInfo.Pin < 100)
            {
                errorList.push('Pin should greater or equal 100');
            }
        }
        if(CVAttachCtrl._CVInfo.FunctionID.length < 1){
            errorList.push('Select Function');
        }
        if(!$scope.mainLocationArray.length)
        {
            errorList.push('Preferred Location is empty');
        }
        if(CVAttachCtrl._CVInfo.exp_salary)
        {
            if(CVAttachCtrl._CVInfo.exp_salary == 0)
            {
                errorList.push('Expected Salary is empty');
            }
        }
        else
        {
            errorList.push('Expected Salary is empty');
        }

        if(!CVAttachCtrl._CVInfo.skillMatrix.length)
        {
            errorList.push('Skill Map is empty');
        }

        if(errorList.length > 0)
        {
            for(var i = errorList.length; i > 0;i--)
            {
                Notification.error({ message: errorList[i-1], delay: MsgDelay });
            }
        };
        //Return false if errorList is greater than zero
        return (errorList.length>0) ? false : true;
    }

    this.saveCVDocInfo=function(){

        /**
         * if user select institute from list than send id other wise send text as title
         */
        if($scope.instituteTitle)
        {
            if($scope.instituteTitle == $scope.instituteText)
            {
                CVAttachCtrl._CVInfo.institute_id = $scope.instituteID;
                CVAttachCtrl._CVInfo.institute_title = "";
                $scope.instituteText = "";
            }
            else
            {
                CVAttachCtrl._CVInfo.institute_id = 0;
                $scope.instituteID = 0;
                $scope.instituteText = "";
                CVAttachCtrl._CVInfo.institute_title = $scope.instituteTitle;
            }
        }
        else
        {
            CVAttachCtrl._CVInfo.institute_id = 0;
            CVAttachCtrl._CVInfo.institute_title = "";
            $scope.instituteText = "";
            $scope.instituteID = 0;
        }

        CVAttachCtrl._CVInfo.job_type = (CVAttachCtrl._CVInfo.job_type) ? CVAttachCtrl._CVInfo.job_type : 0;
        CVAttachCtrl._CVInfo.experience = (CVAttachCtrl._CVInfo.experience) ? CVAttachCtrl._CVInfo.experience : 0;

        for (var nCount = 0; nCount < $scope.skillMatrix.length; nCount++)
        {
           $scope.skillMatrix[nCount].active_status = ($scope.skillMatrix[nCount].active_status == true) ? 1 : 0;
        }

        if($scope.skillMatrix[0])
        {
            if((!$scope.skillMatrix[0].skillname) && (!$scope.skillMatrix[0].exp))
            {
                var index = 0;
                if (index > -1)
                {
                    $scope.skillMatrix.splice(index, 1);
                    skillsTid.splice(index,1);
                }
                if($scope.skillMatrix.length == 0)
                {
                    $scope.skillMatrix = [];
                    skillsTid = [];
                }
            }
        }

        CVAttachCtrl._CVInfo.FunctionID = $scope.selectedFunctions.toString();
        CVAttachCtrl._CVInfo.category_id = $scope.selectedCategories.toString();


        CVAttachCtrl._CVInfo.skillMatrix = $scope.skillMatrix;
        CVAttachCtrl._CVInfo.skillsTid = skillsTid.toString();

        if(isValidate())
        {
            $scope.$emit('$preLoaderStart');
            $scope.instituteText = "";
            $scope.instituteID = 0;

            $scope.selectedFunctions = [];
            $scope.selectedCategories = [];


            CVAttachCtrl._CVInfo.TokenNo = $rootScope._userInfo.Token;
            CVAttachCtrl._CVInfo.Status = parseInt(CVAttachCtrl._CVInfo.Status);
            CVAttachCtrl._CVInfo.job_location = $scope.mainLocationArray;

            $http({
                    method: "POST",
                    url: GURL + 'ewtSaveCVInfo',
                    data: CVAttachCtrl._CVInfo
                 }).success(function (data) {
                    if(data.IsSuccessfull) {

                        Notification.success({message: "Saved..", delay: MsgDelay});
                        $scope.skillMatrix = [];
                        $scope.selectedFunctions = [];
                        $scope.selectedCategories = [];
                        skillsTid = [];

                        getInstituteList();

                        $timeout(function()
                        {
                            $scope.locationArrayString = [];
                            $scope.mainLocationArray = [];

                            $scope.isCvUploded = true;

                            applyJob($scope.job_id);

                            getCVInfo();
                            getAllSkills();
                            $scope.$emit('$preLoaderStop');
                        },3000);

                       // $scope.jobCategoriesGetResponse = false;
                        $scope.instituteGetResponse = false;
                        $scope.educationsGetResponse = false;

                    }else{
                        Notification.error({message: "Sorry..! not saved", delay: MsgDelay});
                        $scope.skillMatrix.push(
                            {
                                "tid":0,
                                "skillname":"",
                                "expertiseLevel":0,
                                "exp":"",
                                "active_status":1
                            }
                        );
                        $scope.editMode[0] = true;
                        $scope.$emit('$preLoaderStop');
                    }
                })
                .error(function(data, status, headers, config) {
                    $scope.$emit('$preLoaderStop');
                });
        }
        else
        {

            if(!CVAttachCtrl._CVInfo.skillMatrix.length)
            {
                $scope.skillMatrix.push(
                    {
                        "tid":0,
                        "skillname":"",
                        "expertiseLevel":0,
                        "exp":"",
                        "active_status":1
                    }
                );
            }
        }
    };

    this.download = function(){
        //window.location.assign(CVAttachCtrl._CVInfo.CVDoc);
        $window.open(CVAttachCtrl._CVInfo.CVDoc);
    };

    function getCVInfo()
    {
        $scope.selectedFunctions = [];
        $scope.selectedCategories = [];
       $http({
            method: 'get',
            url : GURL + 'ewtGetCVInfo',
            params : {
                TokenNo : $rootScope._userInfo.Token
            }
        }).success(function (res)
           {
                if(res.status)
                {
                    CVAttachCtrl._CVInfo = res.data[0];
                    if(CVAttachCtrl._CVInfo.education_id)
                    {
                        getSpecialization();
                    }

                    if(CVAttachCtrl._CVInfo.FunctionID.length)
                    {
                        $scope.functionsArray = CVAttachCtrl._CVInfo.FunctionID.split(',');
                        CVAttachCtrl._CVInfo.FunctionID = "";

                        for (var nCount = 0; nCount < $scope.functionsArray.length; nCount++)
                        {
                            $scope.selectedFunctions.push(parseInt($scope.functionsArray[nCount]));
                        }

                        for (var nCountAll = 0; nCountAll < CVAttachCtrl.Functions.length; nCountAll++)
                        {
                            for (var nCount = 0; nCount < $scope.functionsArray.length; nCount++)
                            {
                                if($scope.functionsArray[nCount] == CVAttachCtrl.Functions[nCountAll].FunctionID)
                                {
                                    CVAttachCtrl.Functions[nCountAll].ticked = true;
                                }
                            }
                        }
                    }

                    $scope.modernBrowsers = CVAttachCtrl.Functions;

                    for (var nCountAll = 0; nCountAll < $scope.educationList.length; nCountAll++)
                    {
                        if($scope.educationList[nCountAll].TID == CVAttachCtrl._CVInfo.education_id)
                        {
                            $scope.educationList[nCountAll].ticked = true;
                        }
                    }

                    /**
                     *  Below line is for assign functions to functions dropdown
                     *  @type {*}
                     */
                    if(parseInt(CVAttachCtrl._CVInfo.category_id))
                    {
                        $scope.categoryArray = CVAttachCtrl._CVInfo.category_id.split(',');
                        CVAttachCtrl._CVInfo.category_id = "";
                        for (var nCount = 0; nCount < $scope.categoryArray.length; nCount++)
                        {
                            $scope.selectedCategories.push(parseInt($scope.categoryArray[nCount]));
                        }
                    }

                    if(res.job_location.length)
                    {
                        if((res.job_location[0].country) && (res.job_location[0].latitude) && (res.job_location[0].location_title))
                        {
                            for (var nCount = 0; nCount < res.job_location.length; nCount++)
                            {
                                delete res.job_location[nCount].CityID;
                                $scope.mainLocationArray.push(res.job_location[nCount]);
                                $scope.locationArrayString.push(res.job_location[nCount].location_title);
                            }
                        }
                    }

                    if($scope.instituteList.length)
                    {
                        for (var nCount = 0; nCount < $scope.instituteList.length; nCount++)
                        {
                            if($scope.instituteList[nCount].TID == CVAttachCtrl._CVInfo.institute_id)
                            {
                                $scope.instituteTitle = ($scope.instituteList[nCount].InstituteTitle) ? $scope.instituteList[nCount].InstituteTitle : "";
                                $scope.instituteText = ($scope.instituteList[nCount].InstituteTitle) ? $scope.instituteList[nCount].InstituteTitle : "";
                                $scope.instituteID = $scope.instituteList[nCount].TID;
                            }
                        }
                    }

                    //  $scope.specializationList
                    $timeout(function()
                    {
                        if($scope.specializationList.length)
                        {
                            for (var nCount = 0; nCount < $scope.specializationList.length; nCount++)
                            {
                                if($scope.specializationList[nCount].TID == CVAttachCtrl._CVInfo.specialization_id)
                                {
                                    $scope.specializationList[nCount].ticked = true;
                                }
                            }
                        }
                    },3000);

                    if((res.skillMatrix.length == 0) || (res.skillMatrix == null) || (res.skillMatrix == 'null'))
                    {
                        $scope.skillMatrix.push(
                            {
                                "tid":0,
                                "skillname":"",
                                "expertiseLevel":0,
                                "exp":"",
                                "active_status":1
                            }
                        );
                        $scope.editMode[0] = true;
                    }
                    else
                    {
                        $scope.skillMatrix.push(
                            {
                                "tid":0,
                                "skillname":"",
                                "expertiseLevel":0,
                                "exp":"",
                                "active_status":1
                            }
                        );

                        for (var nCount = 0; nCount < res.skillMatrix.length; nCount++)
                        {
                            $scope.skillMatrix.push(res.skillMatrix[nCount]);
                        }
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
                        $scope.skillMatrix[nCount].active_status = ($scope.skillMatrix[nCount].active_status == 1) ? true : false;
                        skillsTid.push($scope.skillMatrix[nCount].tid);
                    }

                    $scope.editSkill = angular.copy($scope.skillMatrix[0]);

                    if(CVAttachCtrl._CVInfo.Pin)
                    {
                        CVAttachCtrl.EnablePin = true;
                    }
                    else
                    {
                        CVAttachCtrl.EnablePin = false;
                    }

                    if(res.data[0].CVDocFile == "")
                    {
                        $scope.showLink = false;
                        $scope.showSelectedText = false;
                    }
                    else
                    {
                        $scope.showLink = true;
                        $scope.showSelectedText = true;
                    }
                }
                else
                {
                    $scope.modernBrowsers = CVAttachCtrl.Functions;
                    $scope.skillMatrix.push(
                        {
                            "tid":0,
                            "skillname":"",
                            "expertiseLevel":0,
                            "exp":"",
                            "active_status":1
                        }
                    );

                    $scope.editMode[0] = true;
                    CVAttachCtrl._CVInfo.Status = 1;
                    $scope.showLink = false;
                    $scope.showSelectedText = false;
                }
           });
    };

    var editSkill = {
            "tid":0,
            "skillname":"",
            "expertiseLevel":0,
            "exp":1,
            "active_status":1
        };

    $scope.editSkillFn = function(index){
            $scope.editSkill = angular.copy($scope.skillMatrix[index]);
            for(var ct=0; ct < $scope.skillMatrix.length; ct++){
                if($scope.editMode[ct] && ct !== index){
                    $scope.editMode[ct] = false;
                }
                else if(ct == index){
                    $scope.editMode[ct] = true;
                }
            }
        };

    $scope.$watch('editSkill.exp',function(n,v){
            if(parseFloat(n) == NaN){
                $scope.editSkill.exp = 0.0;
            }
            if(n && (n !== v)){
                $scope.editSkill.exp = (parseFloat($scope.editSkill.exp) !== NaN &&
                    parseFloat($scope.editSkill.exp) >= 0 && parseFloat($scope.editSkill.exp) < 51) ? (parseFloat($scope.editSkill.exp)).toFixed(1) : 0.0;
            }
        });


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
                        "exp":0.0,
                        "active_status":true
                    };
                    return;
                }

                var newSkill = angular.copy($scope.editSkill);
                $scope.editMode.push(false);

                /*if(newSkill.skillname && newSkill.exp)*/
                if(newSkill.skillname)
                {
                    $scope.skillMatrix.push(newSkill);
                }

                $scope.editSkill = {
                    "tid":0,
                    "skillname":"",
                    "expertiseLevel":0,
                    "exp":0.0,
                    "active_status":true
                };
            }
            else{
                $scope.skillMatrix[index] = angular.copy($scope.editSkill);
                $scope.editMode[index] = false;
                $scope.editMode[0] = true;
                $scope.editSkill = {
                    "tid":0,
                    "skillname":"",
                    "expertiseLevel":0,
                    "exp":0.0,
                    "active_status":true
                };
            }

            $scope.skillMatrix[0] = {
                "tid":0,
                "skillname":"",
                "expertiseLevel":0,
                "exp":"",
                "active_status":true
            };

        };

    this.closeCVDocInfo=function(cvForm){
        if($rootScope._userInfo.IsAuthenticate==false){
            cvForm.$setPristine(true);
        }
    };

    function getAllSkills(){
        $scope.$emit('$preLoaderStart');
        $http({
            method: 'get',
            url : GURL + 'skill_list'

        }).success(function (res)
            {
                $scope.$emit('$preLoaderStop');
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
        if (_index > -1) {

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
        if(parseFloat($scope.skillMatrix[index].exp) == NaN)
        {
            $scope.skillMatrix[index].exp = 0.00;
        }
        $scope.skillMatrix[index].exp = (parseFloat($scope.skillMatrix[index].exp)).toFixed(2);
    };

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
        /*if(typeof($scope.jobLat) == undefined || typeof($scope.country) == undefined ||  !CVAttachCtrl._CVInfo.job_location1.length > 0)*/
        if(typeof($scope.jobLat) == undefined || typeof($scope.country) == undefined ||  !$scope.locationName.length > 0)
        {
            return;
        }
        tempLocationArray = {
            "location_title" : $scope.locationName,
            "latitude" :  $scope.jobLat,
            "longitude" : $scope.jobLong,
            "country" : $scope.country,
            "maptype" : 0
        };

        $scope.mainLocationArray.push(tempLocationArray);
        $scope.locationArrayString.push($scope.locationName);
        $scope.locationName = "";
    }

    /**
     * Select - Unselect Function
     *//*
    $scope.selectFunction = function(_functionID)
    {
        if($scope.selectedFunctions.indexOf(_functionID)!=-1)
        {
            var index = $scope.selectedFunctions.indexOf(_functionID);
            $scope.selectedFunctions.splice(index,1);
        }
        else
        {
            $scope.selectedFunctions.push(_functionID);
        }
    }*/

    /**
     * Select - Unselect Job Category
     */
   /* $scope.selectJobCategories = function(_categoryID)
    {
        if($scope.selectedCategories.indexOf(_categoryID)!=-1)
        {
            var index = $scope.selectedCategories.indexOf(_categoryID);
            $scope.selectedCategories.splice(index,1);
        }
        else
        {
            $scope.selectedCategories.push(_categoryID);
        }
    }*/

    // Get job Categories
 /*   function getJobCategories()
    {
        $http({
            url : GURL + 'ewmGetCategory',
            method : 'GET',
            params : {
                LangID : 1
            }
        }).success(function(resp){
            $scope.jobCategories = resp;
           // $scope.jobCategoriesGetResponse = true;
            getCVDetails();
          })
        .error(function(err){
            $scope.$emit('$preLoaderStop');
        });
    }*/

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
            $scope.instituteGetResponse = true;
            getCVDetails();
        })
        .error(function(err){
            $scope.$emit('$preLoaderStop');
        });
    }

    CVAttachCtrl._CVInfo.institute_id = 0;
    $scope.instituteTitle = "";
    $scope.showInstituteDropDown = false;
    // Below function Call on key press of institute text field
    $scope.instituteKeyPress = function(keyEvent) {
        $('.filter-dropdownInstitute').show();
        $scope.showInstituteDropDown = true;
        hideAllDropdoowns(2);
    }
    // Below function Call on click of institute text field
    $scope.instituteTextBoxClicked = function() {
        $scope.showInstituteDropDown = !$scope.showInstituteDropDown;
        hideAllDropdoowns(2);
    }

    /*$scope.instituteText = "";
    $scope.instituteID = 0;*/
    // Below function Call on selection of institute
    $scope.selectInstitute = function(instituteID,title) {

        CVAttachCtrl._CVInfo.institute_title = title;
        CVAttachCtrl._CVInfo.institute_id = instituteID;

        $scope.instituteText = title;
        $scope.instituteID = instituteID;

        console.log("SAi1");
        console.log(CVAttachCtrl._CVInfo.institute_id);
        console.log(CVAttachCtrl._CVInfo.institute_title);

        $scope.instituteTitle = title;
        if(CVAttachCtrl._CVInfo.institute_id != 0)
        {
            CVAttachCtrl._CVInfo.institute_title = "";
        }
        else
        {
            CVAttachCtrl._CVInfo.institute_title = title;
            CVAttachCtrl._CVInfo.institute_id = 0;
        }

        console.log("SAi2");
        console.log(CVAttachCtrl._CVInfo.institute_id);
        console.log(CVAttachCtrl._CVInfo.institute_title);

        $scope.showInstituteDropDown = false;
    };

    $scope.showSpecializationDropDown = true;
    // Below function Call on key press of specialization text field
    $scope.specializationKeyPress = function(keyEvent) {
        $scope.showSpecializationDropDown = false;
       /* $('.filter-dropdownSpecialization').show();
        */
        hideAllDropdoowns(3);
    }
    // Below function Call on click of institute text field
    $scope.specializationTextBoxClicked = function() {
        $scope.showSpecializationDropDown = !$scope.showSpecializationDropDown;
        hideAllDropdoowns(3);
    }

    // Below function Call on selection of institute
    $scope.selectSpecilization = function(specilizationID,title) {
        CVAttachCtrl._CVInfo.specialization_id = specilizationID;
        $scope.specilizationTitle = title;
        $scope.specilizationText = title;
        $scope.showSpecializationDropDown = true;
    };

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
                $scope.educationsGetResponse = true;
                getCVDetails();
            })
            .error(function(err){
                $scope.$emit('$preLoaderStop');
            });
    }

    $scope.specializationList = [];
    function getSpecialization()
    {
       // $scope.specializationList =[];
        $scope.specializationList2 = [];
        $scope.$emit('$preLoaderStart');
        $http({
            url : GURL + 'specialization',
            method : 'GET',
            params : {
                token : $rootScope._userInfo.Token,
                education_id : CVAttachCtrl._CVInfo.education_id.toString()
            }
        }).success(function(resp)
        {
            $scope.specializationList2 = $scope.specializationList;
            $scope.specializationList = resp.data;

            for (var nCount = 0; nCount < $scope.specializationList2.length; nCount++)
            {
                if($scope.specializationList2[nCount].ticked)
                {
                   $scope.specializationList.push($scope.specializationList2[nCount]);
                }
            }

            if($scope.specializationList.length)
            {
                for (var nCount = 0; nCount < $scope.specializationList.length; nCount++)
                {
                    if($scope.specializationList[nCount].TID == CVAttachCtrl._CVInfo.specialization_id)
                    {
                        if((!$scope.specializationList[nCount].ticked) && ($scope.specializationList2.length))
                        {
                            $scope.specializationList.splice(nCount, 1);
                            console.log(nCount);
                        }
                    }
                }
            }

            $scope.$emit('$preLoaderStop');
        })
        .error(function(err)
        {
            $scope.$emit('$preLoaderStop');
        });
    }

    function getCVDetails()
    {
        /*if(($scope.spcializationGetResponse) && ($scope.jobCategoriesGetResponse) && ($scope.instituteGetResponse) && ($scope.educationsGetResponse))*/
        if(($scope.instituteGetResponse) && ($scope.educationsGetResponse))
        {
            getCVInfo();
            getAllSkills();
        }
    }

    $scope.closeCVDocInfo=function()
    {
       $location.path('/profile-manager/user');
    };

    // Apply for job
    function applyJob(_jobId)
    {
        if((_jobId) && ($scope.showLink))
        {
            $scope.$emit('$preLoaderStart');
            $http({
                method: "POST",
                url: GURL + 'job_apply',
                data :{
                    token:$rootScope._userInfo.Token,
                    job_id:_jobId
                }
            }).success(function (data) {
                $scope.$emit('$preLoaderStop');

                if(data.status)
                {
                    Notification.success({ message: "Applied..", delay : 2000});
                    $scope.job_id = 0;
                }
            })
            .error(function(data, status, headers, config) {
                $scope.$emit('$preLoaderStop');
            });
        }
    }

    /**
     *  Call for get functions
     */
    $scope.showFunctionsDropDown = false;
    $scope.findFunctions = function()
    {
        // Api call for get functions
        $scope.showFunctionsDropDown = true;

    };

        /*------------------------ multi selection ----------------*/

        $scope.fOpen = function() {
        };

        $scope.fClose = function() {
        };

        $scope.fClick = function( data )
        {
            if($scope.selectedFunctions.indexOf(data.FunctionID)!=-1)
            {
                var index = $scope.selectedFunctions.indexOf(data.FunctionID);
                $scope.selectedFunctions.splice(index,1);
            }
            else
            {
                $scope.selectedFunctions.push(data.FunctionID);
            }
        };

        $scope.fSelectAll = function()
        {
            if(CVAttachCtrl.Functions.length)
            {
                $scope.selectedFunctions = [];
                for (var nCount = 0; nCount < CVAttachCtrl.Functions.length; nCount++)
                {
                    $scope.selectedFunctions.push(parseInt(CVAttachCtrl.Functions[nCount].FunctionID));
                }
            }
        };

        $scope.fSelectNone = function() {
            $scope.selectedFunctions = [];
        };

        $scope.fReset = function()
        {
            $scope.selectedFunctions = [];
        };

        $scope.fClear = function() {
        };

        $scope.fSearchChange = function( data ) {
        };

        $scope.functionTags = {
            selectAll : "Select All",
            reset : "Reset",
            search : "Search Function",
            selectNone : "Deselect All",
            nothingSelected  : "Select Function"
        };

        /*------------------------ multi selection education ----------------*/
        $scope.educationOpen = function() {
        };

        $scope.educationClose = function() {
            if(CVAttachCtrl._CVInfo.education_id)
            {
                getSpecialization();
            }
        };

        $scope.educationClick = function( data )
        {
            CVAttachCtrl._CVInfo.education_id = data.TID;
        };

        $scope.educationReset = function() {
        };

        $scope.educationClear = function() {
        };

        $scope.educationSearchChange = function( data ) {
        };

        $scope.eductionTags = {
            selectAll : "Select All",
            reset : "Reset",
            search : "Search Last Education",
            selectNone : "Deselect All",
            nothingSelected  : "Select Last Education"
        };
        $scope.outputEducation = [];


        /*------------------------ multi selection specialization ----------------*/
        $scope.specializationOpen = function() {
        };

        $scope.specializationClose = function() {
        };

        $scope.specializationClick = function( data )
        {
            CVAttachCtrl._CVInfo.specialization_id = data.TID;
        };

        $scope.specializationReset = function() {
        };

        $scope.specializationClear = function() {
        };

        $scope.specializationSearchChange = function( data ) {
        };

        $scope.specializationTags = {
            selectAll : "Select All",
            reset : "Reset",
            search : "Search Specialization",
            selectNone : "Deselect All",
            nothingSelected  : "Select Specialization"
        };
        $scope.outputSpecialization = [];

        /*$scope.$watch('outputBrowsers',function(n,o){
            console.log(n);
        });*/


    }]);