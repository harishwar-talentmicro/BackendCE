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
            }


            getEducations();
            getSpecialization();
            getInstituteList();
            getCityList();

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

            // Get Institute list
            function getCityList()
            {
                $http({
                    url : GURL + 'job_locations',
                    method : 'GET',
                    params : {}
                }).success(function(resp){
                       // $scope.instituteList = resp.data;
                        console.log(resp.data);
                        $scope.cityList = resp.data;
                })
                .error(function(err){
                });
            }

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
                console.log($scope.selectedCitys);
            };

            /**
             * Search job seeker
             */
            $scope.searchJobSeeker = function()
            {
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
                        $scope.instituteList = resp.data;
                })
                .error(function(err){
                });
            };


        }]);
})();