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
            //Basic initialization
            $scope.params = [];
            $scope.resultData = [];
            $scope.isResultEmpty = true;//YES - by default
            $scope.isProcessing = true;

            /**
             * Initilization of variabes for additional options filter elements
             */
            $scope.params.proximity = 0;//Default any is selected
            $scope.params.jobType = '1,2,3,4,5,6';//Checkboxes for job type
            $scope.params.searchTerm = $routeParams.searchTerm;
            $scope.activeJobType = [false,false,false,false,false,false];//Checkboxes for job type
            $scope.showProximityFilter = false;
            $scope.jobTypeFilter = false;
            $scope.advanceSearchVisibility = false;

            //Pagination settings
            $scope.pageSize = 10;//Results per page
            $scope.pageCount = 0;//Everything starts with a 0 - 10,20,30 etc.
            $scope.orderBy = 1;//1: Asc, 2: Desc
            $scope.totalResult = 0;//Total results
            $scope.resultThisPage = 0;//Total results you got this page

            //easy and default calling of functions
            initiateSearch();


            /***********************************************************************************************************
             /***********************************************************************************************************
             /***********************************************************************************************************
             * All ACTIONS goes here
             ***********************************************************************************************************
             /**********************************************************************************************************
             /**********************************************************************************************************

             /**
             * initiate the search process
             */
            function initiateSearch()
            {
                /* save all the route params in a temporary variable[params] */
                $scope.params = $routeParams;
                console.log($routeParams);
                console.log($scope.params.proximity);
                if(!parseInt($scope.params.searchTerm.length) > 0)
                {
                    Notification.error({ message : 'Invalid request', delay : MsgDelay});
                }

                /* set job type data */
                resetJobTypeData();

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
                        token: token,
                        page_size: $scope.pageSize,
                        page_count: $scope.pageCount,
                        order_by: $scope.orderBy
                    }
                }).success(function (response) {
                    $scope.isProcessing = false;
                    /* YIPPE! Got response */
                    var isEmpty = response.data.result[0].contactname;
                    if(isEmpty == null)//No Result found
                    {
                        console.log("No result found");
                        return;
                    }
                    /* set the total count of the result */
                    $scope.totalResult = response.data.total_count;
                    /* set result data */
                    setData(response.data.result);

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
                    $scope.isResultEmpty = false;
                    $scope.resultData = data;
                    $scope.resultThisPage = data.length;
                }
            }

            /**
             * Reset job type data
             */
            function resetJobTypeData()
            {
                var jobTypeArr = $routeParams.jobType.split(",");
                for(var i = 0; i < jobTypeArr.length; i++)
                {
                    var val = jobTypeArr[i];
                    $scope.activeJobType[val - 1] = true;
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

            /**
             * Get the salary range
             */
            $scope.getSalaryRange = function(salaryFrom,salaryTo)
            {
                if(!parseInt(salaryFrom) > 0 && !parseInt(salaryTo) > 0)
                {
                    return  "NA";
                }
                if(parseInt(salaryFrom) == parseInt(salaryTo))
                {
                    return UtilityService.currencyStyleConverter(salaryFrom)+" INR";
                }
                else if(parseInt(salaryFrom) < parseInt(salaryTo))
                {
                    return UtilityService.currencyStyleConverter(salaryFrom)+"-"+UtilityService.currencyStyleConverter(salaryTo)+" INR";
                }
                else
                {
                    return UtilityService.currencyStyleConverter(salaryTo)+"-"+UtilityService.currencyStyleConverter(salaryFrom)+" INR";
                }
            }

            /**
             * Change the proximity value
             */
            $scope.changeProximity = function(proximityValue)
            {
                console.log(proximityValue);
                $scope.params.proximity = proximityValue;
            }


            /**
             * change the value of Job-types
             * @param jobType: the checkbox ID
             */
            $scope.changeJobType = function(jobType)
            {
                $scope.activeJobType[jobType] = !$scope.activeJobType[jobType];
            }

            /**
             * Toggle the visibility of the proximity[1] and job type[2]
             */
            $scope.toggleVisibility = function(filterType)
            {
                if(parseInt(filterType) == 1)
                {
                    $scope.showProximityFilter = !$scope.showProximityFilter;
                    checkVisibility(1);
                }
                else
                {
                    $scope.jobTypeFilter = !$scope.jobTypeFilter;
                    checkVisibility(2);
                }
            }

            /**
             * A simple check to avoid both the filters to get open at the same time
             */
            function checkVisibility(filterId)
            {
                if(filterId == 1 && $scope.showProximityFilter)
                {
                    $scope.jobTypeFilter = false;
                }
                else//(filterId == 2 && $scope.jobTypeFilter)
                {
                    $scope.showProximityFilter = false;
                }
            }

            /**
             * Toggle the visibility of the display the advance search
             */
            $scope.toggleAdvanceSearch = function()
            {
                $scope.advanceSearchVisibility = !$scope.advanceSearchVisibility;
                if(!$scope.advanceSearchVisibility)
                {
                    $scope.showProximityFilter = false;
                    $scope.jobTypeFilter = false;
                }
            }

            /**
             * Prefill the advance filter parameter
             */
            function prefillFilterOptions()
            {

            }

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
             * Get the range of the results
             */
            $scope.getResultRange = function()
            {
                if($scope.isProcessing)
                {
                    return "Waiting results ";
                }
                else if(parseInt($scope.totalResult) > 0 && !$scope.isProcessing)
                {
                    var initialPageId = parseInt($scope.pageCount) + 1;
                    return (initialPageId)+" - "+(parseInt($scope.pageCount)+$scope.resultThisPage)+" of "+$scope.totalResult;
                }
                else
                {
                    return "No result found ";
                }
            }

            /**
             * Reset the advance filter
             */
            $scope.resetAdvanceFilters = function()
            {
                $scope.params.experience = 0;
                $scope.activeJobType = [false,false,false,false,false,false];
                $scope.params.proximity = 0;
            }

            /**
             * initiate search process
             */
            $scope.triggerSearch = function()
            {
                setJobTypeData();
                /* initiate search */
                initiateSearch();
            }

            /**
             * set the job type
             */
            function setJobTypeData()
            {
                var tempStringArr = [];
                for(var i = 0;i < $scope.activeJobType.length; i++)
                {
                   if($scope.activeJobType[i])
                   {
                       tempStringArr.push(parseInt(i) + 1);
                   }
                }
                $scope.params.jobType = tempStringArr.join(',');
            }

            /**
             * trigger search on ENTER key press
             */
            triggerSearchOnEnterKey();
            function triggerSearchOnEnterKey()
            {
                $('#searchTextField').keypress(function(e){
                    if(parseInt(e.keyCode) == 13)
                    {
                        /* trigger search */
                        $scope.triggerSearch();
                    }
                });
            }

        }]);