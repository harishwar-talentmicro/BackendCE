/**
 * Controller to manage all the functionaloties in OUTBOX
 *
 * @author: Sandeep[EZE ID]
 * @since 20150526
 */
angular.module('ezeidApp').
    controller('JobSearchResult', [
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
            UtilityService
        ) {

            /**
             * All initialization goes here
             */
            initiateSearch();
            $scope.params = [];
            $scope.resultData = [];
            $scope.isResultEmpty = true;//YES - by default

            /**
             * All ACTIONS goes here
             */


            /**
             * initiate the search process
             */
            function initiateSearch()
            {
                /* save all the route params in a temporary variable[params] */
                $scope.params = $routeParams;
                if(!parseInt($scope.params.searchTerm.length) > 0)
                {
                    Notification.error({ message : 'Invalid request', delay : MsgDelay});
                }

                /* call the search API */
                setSearchResult();

            }

            /**
             * make a search Api calls
             */
            function setSearchResult()
            {
                var token = ($rootScope._userInfo.token)?$rootScope._userInfo.token:null;

                /* make an API request to get the data */
                $http({ method: 'get', url: GURL + 'job_search',
                    params: {
                        latitude:$scope.params.lat,
                        longitude:$scope.params.lng,
                        proximity:$scope.params.proximity,
                        jobType:$scope.params.jobType,
                        exp:$scope.params.experience,
                        keywords:$scope.params.searchTerm,
                        token: token
                         }
                }).success(function (response) {

                    /* YIPPE! Got response */
                    var isEmpty = response.data[0].contactname;
                    if(isEmpty == null)//No Result found
                    {
                        console.log("No result found");
                        return;
                    }

                    /* set result data */
                    setData(response.data);

                }).error(function(){
                    $scope.isSearchInProgress = false;
                    Notification.error({ message : 'An error occurred', delay : MsgDelay});
                    $scope.$emit('$preLoaderStop');
                });
            }

            /**
             * Set the job result data
             */
            function setData(data)
            {
                if(data.length > 0)
                {
                    console.log(data);
                    $scope.isResultEmpty = false;
                    $scope.resultData = data;
                }
            }

            /**
             * Get experience string
             */
            $scope.getExperienceString = function(exp1,exp2)
            {
                if(!parseInt(exp1) > 0 && !parseInt(exp2) > 0)
                {
                    return  "NA";
                }
                if(parseInt(exp1) == parseInt(exp2))
                {
                    return exp1+" Years";
                }
                else if(parseInt(exp1) < parseInt(exp2))
                {
                    return exp1+"-"+exp2+" Years";
                }
                else
                {
                    return exp2+"-"+exp1+" Years";
                }
            }

            /**
             * Set keySkills
             */
            $scope.activeSkillsArray = [];
            $scope.getKeySkillsArray = function(skillString)
            {
                $scope.activeSkillsArray = skillString.split(",");
            }

        }]);