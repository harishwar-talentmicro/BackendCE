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
            $scope.sortByToggle = false;


            /**
             * Initilization of variabes for additional options filter elements
             */
            $scope.params.proximity = 0;//Default any is selected
            $scope.params.jobType = '1,2,3,4,5,6';//Checkboxes for job type
            $scope.params.searchTerm = $routeParams.searchTerm;
            $scope.params.orderBy = 1;//1: Asc, 2: Desc
            $scope.params.locations = "";//comma separated ids
            $scope.params.category = "";//comma separated ids
            $scope.params.salary = "";//1-2,5-6

            $scope.searchKeyWord = $routeParams.searchTerm;
            $scope.activeJobType = [false,false,false,false,false,false];//Checkboxes for job type
            $scope.showProximityFilter = false;
            $scope.jobTypeFilter = false;
            $scope.advanceSearchVisibility = false;

            //Pagination settings
            $scope.pageSize = 10;//Results per page
            $scope.pageCount = 0;//Everything starts with a 0 - 10,20,30 etc.
            $scope.totalResult = 0;//Total results
            $scope.resultThisPage = 0;//Total results you got this page


            //Right-side additional filters initialization
            $scope.filter = {
                location:[],
                industry:[],
                salaryArr:[],
                minSalary:0,
                maxSalary:0
            };

            /**
             * Make-array for checkbox effect
             */
            $scope.filterCheck = {
                location:[],
                industry:[],
                salary:[]
            };

            /**
             * Make-array for holding temporary value of selected checkbox
             */
            $scope.tempFilterCheck = {
                location:[],
                industry:[],
                salary:[]
            };


            /* selected Filter options */
            $scope.selectedFilter = {
                locationCode:[],
                industryCode:[],
                salaryRange:[]
            };

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
                cleanExperienceData();

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
             * clean the data of experience
             */
            function cleanExperienceData()
            {
                var exp = $scope.params.experience;
                console.log(exp);
                if(exp == 'null' || exp == '' || typeof(exp) == undefined)
                {
                    $scope.params.experience = '';
                }
                console.log(exp);
            }

            /**
             * make a search Api calls
             */
            function setSearchResult()
            {
                var token = ($rootScope._userInfo.token)?$rootScope._userInfo.token:null;
                /* make an API request to get the data */
                var experience = ($scope.params.experience != '' && $scope.params.experience != 'null')?$scope.params.experience:null;
                $http({ method: 'get', url: GURL + 'job_search',
                    params: {
                        latitude:$scope.params.lat,
                        longitude:$scope.params.lng,
                        proximity:$scope.params.proximity,
                        jobType:$scope.params.jobType,
                        exp:experience,
                        keywords:$scope.params.searchTerm,
                        token: token,
                        page_size: $scope.pageSize,
                        page_count: $scope.pageCount,
                        order_by: $scope.params.orderBy,
                        //Exclusively for Advance filters
                        locations: $scope.params.locations,
                        category: $scope.params.category,
                        salary: $scope.params.salary
                    }
                }).success(function (response) {
                    $scope.isProcessing = false;
                    /* YIPPE! Got response */
                    console.log(response);
                    var isEmpty = !(response.data.result.length > 0);
                    console.log(isEmpty);
                    if(isEmpty)//No Result found
                    {
                        console.log("No result found");
                        /* reset all the data */
                        resetSearchResultData();
                        return;
                    }
                    /* set the total count of the result */
                    $scope.totalResult = response.data.total_count;
                    /* set result data */
                    setData(response.data.result);
                    /* Set Advance-filter [Right-side] */
                    setJobLocationData(response.data.job_location);
                    setSalaryData(response.data.salary);
                    setCategoryData(response.data.category);

                    /* set all the advance filter */
                    advanceFilter();

                }).error(function(){
                    $scope.isSearchInProgress = false;
                    Notification.error({ message : 'An error occurred', delay : MsgDelay});
                    $scope.$emit('$preLoaderStop');
                });
            }

            /**
             * Reset all the search result data
             */
            function resetSearchResultData()
            {
                $scope.params = [];
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
             * Set jobLocation data
             */
            function setJobLocationData(data)
            {
                if(!data.length > 0)
                {
                    console.log("No Location Found");
                }
                $scope.filter.location = data;
            }

            /**
             * set salary range data
             */
            function setSalaryData(data)
            {
                if(data[0].maxsalary == null || data[0].maxsalary == 'null' ||
                    data[0].minsalary == null || data[0].minsalary == 'null')
                {
                    console.log("No Salary Found");
                    return;
                }
                var minSal = data[0].minsalary;
                var maxSal = data[0].maxsalary;
                /* break the salary in to various ranges */
                breakSalary(minSal,maxSal);
            }

            /**
             * Break the salary range
             */
            function breakSalary(minSal,maxSal)
            {
                $scope.filter.salaryArr = [];
                var tempArr = [];

                if(minSal == maxSal)
                {
                    tempArr = {
                        minsal:minSal,
                        maxSal:maxSal
                    }
                    $scope.filter.salaryArr.push(tempArr);
                    return;
                }

                /* calculate the salary range */
                var min = minSal;
                var max = maxSal;
                var rangeBreakPoints = 5;
                var diff = (max - min)/rangeBreakPoints;

                for(var i = 0; i < rangeBreakPoints; i++)
                {
                    var tempDiff = diff;
                    if(i > 0)
                    {
                        tempDiff -= 1;
                        min += 1;
                    }

                    tempArr = {
                        minSal:min,
                        maxSal:(min = parseInt(min) + tempDiff)
                    };
                    $scope.filter.salaryArr.push(tempArr);
                }
            }

            /**
             * Set category or Industry data
             */
            function setCategoryData(data)
            {
                if(!data.length > 0)
                {
                    console.log("No Category Found");
                }
                $scope.filter.industry = data;
            }

            /**
             * Set all the advance filter
             */
            function advanceFilter()
            {
                preSetFilterLocation();
                preSetFilterCategory();
                preSetFilterSalary();
            }

            ////////////////////////////// LOCATION FILTER PRE - CHECK /////////////////////

            /**
             * pre-set filter-location
             */
            function preSetFilterLocation()
            {
                if($scope.params.locations)
                {
                    var dataArr = $scope.params.locations.split(",");
                    var tempIndexArr = [];
                    for(var i = 0;i < dataArr.length; i++)
                    {
                        tempIndexArr.push($scope.filter.location.indexOfWhere('locationid',parseInt(dataArr[i])));
                    }
                    $scope.tempFilterCheck.location = tempIndexArr;
                    return;
                }
                else
                {
                    console.log('location not found');
                }
            }

            /**
             * A simple check for deciding weather the check boxes should be selected or not
             */
            $scope.filterCheckBoxLocationChecked = function(index,status)
            {
                if($scope.tempFilterCheck.location.length > 0)
                {
                    if($scope.tempFilterCheck.location.indexOf(index) >= 0)
                    {
                        return true;
                    }
                    return false;
                }
                return status;
            }

            /**
             * When user clicking for the first time delete all the temporay location array
             * which was responsible for pre-filling of all the checkbxes when the page gets loaded
             */
            $scope.clearTempLocationChecks = function()
            {
                $scope.tempFilterCheck.location = [];
            }


            ////////////////////////////// INDUSTRY FILTER PRE - CHECK /////////////////////

            /**
             * pre-set filter-industry
             */
            function preSetFilterCategory()
            {
                if($scope.params.category)
                {
                    var dataArr = $scope.params.category.split(",");
                    var tempIndexArr = [];
                    console.log($scope.filter.industry);
                    for(var i = 0;i < dataArr.length; i++)
                    {
                        tempIndexArr.push($scope.filter.industry.indexOfWhere('CategoryID',parseInt(dataArr[i])));
                    }
                    $scope.tempFilterCheck.industry = tempIndexArr;
                }
            }

            /**
             * A simple check for deciding weather the check boxes should be selected or not
             */
            $scope.filterCheckBoxIndustryChecked = function(index,status)
            {
                console.log(index,status);
                if($scope.tempFilterCheck.industry.length > 0)
                {
                    if($scope.tempFilterCheck.industry.indexOf(index) >= 0)
                    {
                        return true;
                    }
                    return false;
                }
                return status;
            }

            /**
             * When user clicking for the first time delete all the temporay location array
             * which was responsible for pre-filling of all the checkbxes when the page gets loaded
             */
            $scope.clearTempIndustryChecks = function()
            {
                console.log("htt");
                $scope.tempFilterCheck.industry = [];
            }


            ////////////////////////////// SALARY FILTER PRE - CHECK /////////////////////

            /**
             * pre-set filter-salary
             */
            function preSetFilterSalary()
            {
                if($scope.params.salary)
                {
                    console.log($scope.filter);
                    var dataArr = $scope.params.salary.split(",");
                    console.log($scope.filter.salaryArr);
                    var tempIndexArr = [];
                    for(var i = 0;i < dataArr.length; i++)
                    {
                        var tempArr = dataArr[i].split('-');//convert "130000 - 140000" ---> [130000,140000]
                        tempIndexArr.push($scope.filter.salaryArr.indexOfWhere('minSal',parseInt(tempArr[0])));
                    }
                    $scope.tempFilterCheck.salary = tempIndexArr;
                }
            }

            /**
             * A simple check for deciding weather the check boxes should be selected or not
             */
            $scope.filterCheckBoxSalaryChecked = function(index,status)
            {
                console.log(index,status);
                if($scope.tempFilterCheck.salary.length > 0)
                {
                    if($scope.tempFilterCheck.salary.indexOf(index) >= 0)
                    {
                        return true;
                    }
                    return false;
                }
                return status;
            }

            /**
             * When user clicking for the first time delete all the temporay Salary array
             * which was responsible for pre-filling of all the checkbxes when the page gets loaded
             */
            $scope.clearTempSalaryChecks = function()
            {
                $scope.tempFilterCheck.salary = [];
            }
            //////////////////////////////////////////////////////////////////////////////////////////

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
                /* redirect to search page */
                var searchStr = getSearchtermString();
                $location.url('/jobsearch?' + searchStr);
                $scope.triggerSearchOnEnterKey();
            }

            /**
             * Get the string to search a normal search term
             */
            function getSearchtermString()
            {
                var searchStr = "";
                for (var prop in $scope.params) {
                    if ($scope.params.hasOwnProperty(prop)) {
                        searchStr += (prop + '=' + encodeURIComponent($scope.params[prop]) + '&');
                    }
                }
                return (searchStr);
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
            $scope.triggerSearchOnEnterKey = function(keyCode)
            {
                if(parseInt(keyCode) == 13)
                {
                    /* trigger search */
                    $scope.triggerSearch();
                }
            }

            $scope.triggerSearchOnEnterKey();

            /**
             * select location filter
             */
            $scope.selectLocationFilter = function(code,status)
            {

                if(!status)
                {
                    var index = $scope.selectedFilter.locationCode.indexOf(code);
                    if(index >= 0)//Got the element
                    {
                        $scope.selectedFilter.locationCode.splice(index, 1);
                        console.log($scope.selectedFilter.locationCode);
                        setFilterLocation();
                        return;
                    }
                }
                $scope.selectedFilter.locationCode.push(code);
                setFilterLocation();
            }

            /**
             * set the location string for the search
             */
            function setFilterLocation()
            {
                $scope.params.locations = $scope.selectedFilter.locationCode.join(",");
            }

            /**
             * Select industry filter
             */
            $scope.selectIndustryFilter = function(code, status)
            {
                if(!status)
                {
                    var index = $scope.selectedFilter.industryCode.indexOf(code);
                    if(index >= 0)//Got the element
                    {
                        $scope.selectedFilter.industryCode.splice(index, 1);
                        setFilterIndustry();
                        return;
                    }
                }
                $scope.selectedFilter.industryCode.push(code);
                setFilterIndustry();
                //console.log("Industry: "+code+" status:"+status);
            }

            /**
             * set the industry string for the search
             */
            function setFilterIndustry()
            {
                $scope.params.category = $scope.selectedFilter.industryCode.join(",");
            }


            /**
             * Select salary filter
             */
            $scope.selectSalaryFilter = function(minSal,maxSal,status)
            {
                var code = minSal+'-'+maxSal;
                if(!status)
                {
                    var index = $scope.selectedFilter.salaryRange.indexOf(code);
                    if(index >= 0)//Got the element
                    {
                        $scope.selectedFilter.salaryRange.splice(index, 1);
                        setFilterSalary();
                        return;
                    }
                }
                $scope.selectedFilter.salaryRange.push(code);
                setFilterSalary();
            }

            /**
             * set the salary range string for the search
             */
            function setFilterSalary()
            {
                $scope.params.salary = $scope.selectedFilter.salaryRange.join(",");
            }

            /**
             * change sort by order result
             */
            $scope.changeResultSorting = function(orderId)
            {
                $scope.params.orderBy = orderId;
                /* initiate search */
                $scope.triggerSearch();
            }
        }]);