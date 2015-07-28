angular.module('ezeidApp').controller('CVAttachController',[
    '$http', '$rootScope', '$scope', '$timeout', 'Notification', '$filter','$q', '$window','$location','GURL','GoogleMaps',
    function($http, $rootScope, $scope, $timeout, Notification, $filter,$q, $window,$location,GURL,GoogleMap){

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
    CVAttachCtrl._CVInfo.job_location1 = "";
    CVAttachCtrl._CVInfo.experience = 0;

     $scope.selectedFunctions = [];

    $scope.$watch('_userInfo.IsAuthenticate', function () {
        if ($rootScope._userInfo.IsAuthenticate == true) {
            $('.dropdown-toggle').click(function(){$( ".filter-dropdown" ).slideToggle( "slow", function() {
                // Animation complete.
            });})

            $('.dropdown-toggleCategory').click(function(){$( ".filter-dropdownCategory" ).slideToggle( "slow", function() {
                // Animation complete.
            });})

            getCVInfo();
            getAllSkills();
            getJobCategories();

        } else {
            $location.path('/');
            CVAttachCtrl._CVInfo.Status = 1;
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
                if(resp.data){
                    var data = googleMap.parseReverseGeolocationData(resp.data);
                    CVAttachCtrl._CVInfo.job_location1 = data.city;
                    $scope.country= data.country;
                }
                else{
                    Notification.error({message : 'Please enable geolocation settings in your browser',delay : MsgDelay});
                }
            },function(){
                Notification.error({message : 'Please enable geolocation settings in your browser',delay : MsgDelay});
                defer.resolve();
            });
        },false);

    $http({ method: 'get', url: GURL + 'ewmGetFunctions?LangID=1'}).success(function (data) {
       CVAttachCtrl.Functions = data;
    });

    //if secure pin checkbox is uncheck remove PIN Value
    this.securePinCliked = function () {
        if(!CVAttachCtrl.EnablePin)
        {
            CVAttachCtrl._CVInfo.Pin = "";
        }
    };

   $scope.uploadFile = function (files) {
        $scope.DocumentToUpload = files;
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
            if(CVAttachCtrl._CVInfo.Pin<100)
            {
                errorList.push('Pin should greater or equal 100');
            }
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

    this.saveCVDocInfo=function(){

       $scope.$emit('$preLoaderStart');

        CVAttachCtrl._CVInfo.job_type = (CVAttachCtrl._CVInfo.job_type) ? CVAttachCtrl._CVInfo.job_type : 0;
       // CVAttachCtrl._CVInfo.job_location = (CVAttachCtrl._CVInfo.job_location) ? CVAttachCtrl._CVInfo.job_location : [];
        CVAttachCtrl._CVInfo.experience = (CVAttachCtrl._CVInfo.experience) ? CVAttachCtrl._CVInfo.experience : 0;

       for (var nCount = 0; nCount < $scope.skillMatrix.length; nCount++) {
           $scope.skillMatrix[nCount].active_status = ($scope.skillMatrix[nCount].active_status == true) ? 1 : 0;
       }

        if(($scope.skillMatrix[0].skillname == "") && ($scope.skillMatrix[0].exp == ""))
        {
            var index = 0;

            if (index > -1) {
                $scope.skillMatrix.splice(index, 1);
                skillsTid.splice(index,1);
            }
            if($scope.skillMatrix.length == 0)
            {
                $scope.skillMatrix = [];
                skillsTid = [];
            }
        }

        CVAttachCtrl._CVInfo.skillMatrix = $scope.skillMatrix;
        CVAttachCtrl._CVInfo.skillsTid = skillsTid.toString();

        if(isValidate())
        {
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
                        skillsTid = [];

                        $timeout(function()
                        {
                            getCVInfo();
                            $scope.$emit('$preLoaderStop');
                        },3000);

                    }else{
                        Notification.error({message: "Sorry..! not saved", delay: MsgDelay});
                        $scope.$emit('$preLoaderStop');
                    }
                })
                .error(function(data, status, headers, config) {
                    $scope.$emit('$preLoaderStop');
                });

            if($scope.DocumentToUpload)
            {
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
                    })
                  .error(function(data, status, headers, config) {
                        Notification.error({message: "An error occurred..", delay: MsgDelay});
                 });
            }
        }
    };

    this.download = function(){
        //window.location.assign(CVAttachCtrl._CVInfo.CVDoc);
        $window.open(CVAttachCtrl._CVInfo.CVDoc);
    };

    function getCVInfo(){
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

                    //$scope.locationArrayString = [];
                   // $scope.mainLocationArray = [];qs;


                    if((res.skillMatrix.length == 0) || (res.skillMatrix == null) || (res.skillMatrix == 'null'))
                    {

                        $scope.skillMatrix = [
                            {
                                "tid":0,
                                "skillname":"",
                                "expertiseLevel":0,
                                "exp":0,
                                "active_status":1
                            }
                        ];

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

                    for(var ct=0; ct < $scope.skillMatrix.length; ct++){
                       if(ct == 0){
                           $scope.editMode[ct] = true;
                       }
                        else{
                           $scope.editMode[ct] = false;
                       }
                    }



                    for (var nCount = 0; nCount < $scope.skillMatrix.length; nCount++) {
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
                    }
                    else
                    {
                        $scope.showLink = true;
                    }
                }
                else
                {
                    CVAttachCtrl._CVInfo.Status = 1;
                    $scope.showLink = false;
                    $scope.skillMatrix = [
                        {
                            "tid":0,
                            "skillname":"",
                            "expertiseLevel":0,
                            "exp":0,
                            "active_status":1
                        }
                    ];

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
                    if(ind > 0){
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

    $scope.checkExp = function(index){
            if(parseFloat($scope.skillMatrix[index].exp) == NaN){
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
            if(typeof($scope.jobLat) == undefined || typeof($scope.country) == undefined ||  !CVAttachCtrl._CVInfo.job_location1.length > 0)
            {
                return;
            }
            tempLocationArray = {
                "location_title" : CVAttachCtrl._CVInfo.job_location1,
                "latitude" :  $scope.jobLat,
                "longitude" : $scope.jobLong,
                "country" : $scope.country
            };

            $scope.mainLocationArray.push(tempLocationArray);
            $scope.locationArrayString.push(CVAttachCtrl._CVInfo.job_location1);
            CVAttachCtrl._CVInfo.job_location1 = "";

        }

        /**
         * Select - Unselect Function
         */
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
            CVAttachCtrl._CVInfo.FunctionID = $scope.selectedFunctions;
        }

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
                    console.log("SAi Categories list..");
                    console.log($scope.jobCategories);

                }).error(function(err){

                });
        }


    }]);