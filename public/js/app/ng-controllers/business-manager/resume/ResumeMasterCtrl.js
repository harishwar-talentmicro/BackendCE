(function(){
    angular. module('ezeidApp').controller('ResumeMasterCtrl',[
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
            UtilityService
        ) {

            $scope.ResumeInquiriesTab = true;
            $scope.JobsTab = false;
            $scope.JobSeekerTab = false;

            /**
             * Templates based on tabs in resume module
             */
            $scope.tplResumeEnquiries = 'html/business-manager/resume/resume.html';
            $scope.tplJobsTab = 'html/business-manager/resume/resume-jobs.html';
            $scope.tplJobSeekerTab = 'html/business-manager/resume/resume-job-seeker.html';


            /**
             * Job TID from Job Posting module (when clicked on number of candidates applied navigates to
             * Job tracker tab with the changed value containing jobTid
             *
             * @type {null}
             */
            $scope.jobTid = null;
            $scope.changeTabToApplicants = function(jobTid){
                var jtid = parseInt(jobTid);
                $scope.jobTid = jobTid;
                $scope.JobsTab = false;
                $scope.JobSeekerTab = false;
                $scope.ResumeInquiriesTab = true;
            };


            $scope.defaultApplicantImage = '/images/profile-pic.jpg';


        }
    ]);
})();
