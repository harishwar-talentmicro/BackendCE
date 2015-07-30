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

        }
    ]);
})();
