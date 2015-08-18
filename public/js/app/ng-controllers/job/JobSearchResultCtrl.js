/**
 * Controller to manage all the functionaloties in OUTBOX
 *
 * @author: Sandeep[EZE ID]
 * @since 20150526
 */
angular.module('ezeidApp').
    controller('JobSearchResultCtrl', [
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
        'GoogleMaps',
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
            UtilityService,
            GoogleMap
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


            $scope.modalVisible = false;
            $scope.modalVisibility = function () {
                /* toggle map visibility status */
                $scope.modalVisible = !$scope.modalVisible;
            };

            /**
             * Initilization of variabes for additional options filter elements
             */
            $scope.params.proximity = 0;//Default any is selected
            $scope.params.jobType = '0,1,2,3,4,5,6,7';//Checkboxes for job type
            $scope.params.searchTerm = $routeParams.searchTerm;
            $scope.params.orderBy = 1;//1: Asc, 2: Desc
            $scope.params.locations = "";//comma separated ids
            $scope.params.category = "";//comma separated ids
            $scope.params.salary = "";//1-2,5-6
            $scope.params.filter = 0;
            $scope.filterCollege = false;
            $scope.showFilterButton = false;

            $scope.searchKeyWord = $routeParams.searchTerm;
            $scope.activeJobType = [false,false,false,false,false,false,false,false];//Checkboxes for job type
            $scope.showProximityFilter = false;
            $scope.jobTypeFilter = false;
            $scope.advanceSearchVisibility = false;

            //Pagination settings
            $scope.pageSize = 5;//Results per page
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

                if(!parseInt(($scope.params.searchTerm) ? $scope.params.searchTerm.length : 0) > 0)
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
                if(exp == 'null' || exp == '' || typeof(exp) == undefined)
                {
                    $scope.params.experience = '';
                }
            }

            /**
             * make a search Api calls
             */
            function setSearchResult(isRequestFromFilter)
            {
                var requestFromFilter = false;
                if(typeof(isRequestFromFilter) !== undefined && parseInt(isRequestFromFilter) == 1)
                {
                    requestFromFilter = true;
                }
                else
                {
                    /* reset all the filters */
                    resetFilters();
                }

                if($rootScope._userInfo.IsAuthenticate)
                {
                    var category = "";
                    if($scope.params.category && parseInt($scope.params.category) > 0)
                    {
                        category = parseInt($scope.params.category);
                    }

                    /* make an API request to get the data */
                    var experience = ($scope.params.experience != '' && $scope.params.experience != 'null')?$scope.params.experience:null;
                    $http({ method: 'get', url: GURL + 'job_search',
                        params:
                        {
                            latitude:$scope.params.lat,
                            longitude:$scope.params.lng,
                            proximity:$scope.params.proximity,
                            jobType:$scope.params.jobType,
                            exp:experience,
                            keywords:$scope.params.searchTerm,
                            token: $rootScope._userInfo.Token,
                            page_size: $scope.pageSize,
                            page_count: $scope.pageCount,
                            /*order_by: $scope.params.orderBy,*/
                            //Exclusively for Advance filters
                            locations: $scope.params.locations,
                            category: category,
                            salary: $scope.params.salary,
                            restrict: $scope.filterCollege == false ? 0 : 1

                            //filter:$scope.params.filter?$scope.params.filter:0
                        }
                    }).success(function (response) {

                            $scope.isProcessing = false;

                            /* YIPPE! Got response */
                            var isEmpty = !(response.data.result.length > 0);
                            if(isEmpty)//No Result found
                            {
                                /* reset all the data */
                                resetSearchResultData();
                                return;
                            }

                            if(response.status)
                            {
                                for(var i = 0; i < response.data.result.length; i++)
                                {
                                    /*response.data.result[i].LUdate = convertTimeToLocal(response.data.result[i].LUdate,'DD-MMM-YYYY hh:mm A','DD-MMM-YYYY hh:mm A');*/
                                    response.data.result[i].LUdate = UtilityService.convertTimeToLocal(response.data.result[i].LUdate);
                                }
                            }

                            /* set the total count of the result */
                            $scope.totalResult = response.data.total_count;

                            /* set result data */
                            setData(response.data.result);

                            /* Reset the pagination buttons */
                            $scope.paginationVisibility();

                            if(requestFromFilter)
                            {
                                return;
                            }
                            /* Set Advance-filter [Right-side] */
                            setJobLocationData(response.data.job_location);
                            setSalaryData(response.data.salary);
                            setCategoryData(response.data.category);

                            /* set all the advance filter */
                            advanceFilter();

                            $scope.jsTileHoverEffect();

                        }).error(function(){
                            $scope.isSearchInProgress = false;
                            Notification.error({ message : 'An error occurred', delay : MsgDelay});
                            $scope.$emit('$preLoaderStop');
                        });
                }
                else
                {
                    $location.url('/');
                }
            }

            /**
             * Reset all the filters
             */
            function resetFilters()
            {
                $scope.params.salary = null;
                $scope.params.category = null;
                $scope.params.locations = null;
            }

            /**
             * Reset all the search result data
             */
            function resetSearchResultData()
            {
               // $scope.params = [];

                $scope.isResultEmpty = true;
                $scope.resultData = [];
            }

            /**
             * Set the job result data
             */
            function setData(data)
            {
                if(data.length > 0)
                {
                    $scope.showFilterButton = true;
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
                   // console.log("No Location Found");
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
                   // console.log("No Salary Found");
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
                   // console.log("No Category Found");
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
                   // console.log('location not found');
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
                    var dataArr = $scope.params.salary.split(",");
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
            };

            /**
             * Reset job type data
             */
            function resetJobTypeData()
            {
                var jobTypeArr = $routeParams.jobType.split(",");
                for(var i = 0; i < jobTypeArr.length; i++)
                {
                    var val = jobTypeArr[i];
                    $scope.activeJobType[val] = true;
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
            };

            /**
             * Set keySkills
             */
            $scope.activeSkillsArray = [];
            $scope.getKeySkillsArray = function(skillString)
            {
                $scope.activeSkillsArray = skillString.split(",");
            };

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
                    return UtilityService.currencyStyleConverter(salaryFrom);
                }
                else if(parseInt(salaryFrom) < parseInt(salaryTo))
                {
                    return UtilityService.currencyStyleConverter(salaryFrom)+" - "+UtilityService.currencyStyleConverter(salaryTo);
                }
                else
                {
                    return UtilityService.currencyStyleConverter(salaryTo)+" - "+UtilityService.currencyStyleConverter(salaryFrom);
                }
            };

            /**
             * Change the proximity value
             */
            $scope.changeProximity = function(proximityValue)
            {
                $scope.params.proximity = proximityValue;
            };


            /**
             * change the value of Job-types
             * @param jobType: the checkbox ID
             */
            $scope.changeJobType = function(jobType)
            {
                $scope.activeJobType[jobType] = !$scope.activeJobType[jobType];
            };

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
            };

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
            };

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
            };

            /**
             * Reset the advance filter
             */
            $scope.resetAdvanceFilters = function()
            {
                $scope.params.experience = 0;
                $scope.activeJobType = [false,false,false,false,false,false,false,false];
                $scope.params.proximity = 0;
            };

            /**
             * initiate search process
             */
            $scope.triggerSearch = function(isTriggeredFromFilter)
            {
                if(parseInt(isTriggeredFromFilter) == 1)
                {
                    $scope.params.filter = 1;
                    /* Just update the result parameter */
                    setSearchResult(1);
                    $scope.showFilterButton = true;
                }
                else
                {
                    setJobTypeData();
                    /* redirect to search page */
                    var searchStr = getSearchtermString();
                    $location.url('/jobsearch?' + searchStr);
                    $scope.triggerSearchOnEnterKey();
                    $scope.showFilterButton = false;
                }
            };

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
                        tempStringArr.push(parseInt(i));
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
            };

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
                        setFilterLocation();
                        return;
                    }
                }
                $scope.selectedFilter.locationCode.push(code);
                setFilterLocation();
            };

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
            };

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
            };

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
            };

            /**
             * Hover effect && restrict the multiple calls
             */
            $scope.restrictJsTileHoverEffect = false;
            $scope.jsTileHoverEffect = function()
            {
                var isContentAvailable = $('.job-result').length > 0;
                if(!isContentAvailable)
                {
                    return;
                }
                if($scope.restrictJsTileHoverEffect)
                {
                    return;
                }
                $scope.restrictJsTileHoverEffect = true;
                $('.job-main-content').mouseenter(function(){
                    $(this).siblings().css('box-shadow','4px 3px 10px rgb(74, 243, 218)');
                    $(this).css('box-shadow','4px 3px 10px rgb(74, 243, 218)');
                    //$(this).parent().children('.job-title-icon').css('color','#0BC9FF');
            }).
                    mouseleave(function(){
                        $(this).siblings().removeAttr('style');
                        $(this).removeAttr('style');
                        //$(this).parent().children('.job-title-icon').removeAttr('style');
                    });
            };

            function resetRestrictJsTileHoverEffectFlag()
            {
                $scope.restrictJsTileHoverEffect = false;
            }

            $scope.$watch('resultData', function() {
                resetRestrictJsTileHoverEffectFlag();
                $scope.jsTileHoverEffect();
            });

            /**
             * Redirect to jobDetail page
             */
            $scope.redirectJobDetailPage = function(tid)
            {
                $location.url('/jobdetail' + '?jobid='+tid);
            };


            /**************************
             * Pagination button ACTION
             */

            /**
             * load the next results
             */
            $scope.paginationNextClick = function()
            {
                $scope.pageCount += $scope.pageSize;
                /* trigger next results */
                $scope.triggerSearch(1);
                $scope.paginationVisibility();
            };

            /**
             * load the previous results
             */
            $scope.paginationPreviousClick = function()
            {
                $scope.pageCount -= $scope.pageSize;
                /* trigger previous results */
                $scope.triggerSearch(1);
                $scope.paginationVisibility();
            };

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
           };

            $scope.googleMap = new GoogleMap();

         /*   var promise = $scope.googleMap.getCurrentLocation()
            promise.then(function (resp) {
                if (resp) {

                    *//* get the current location coordinates and if it don't exists then update with the present Coordinates *//*
                  //  var coordinates = getSearchedCoordinates($scope.googleMap.currentMarkerPosition.latitude,$scope.googleMap.currentMarkerPosition.longitude);

                    $scope.googleMap.getReverseGeolocation(coordinates[0],coordinates[1]).then(function (resp) {
                        if (resp) {
                            $rootScope.coordinatesLat = $scope.googleMap.currentMarkerPosition.latitude;
                            $rootScope.coordinatesLng = $scope.googleMap.currentMarkerPosition.longitude;
                     //       placeDetail = $scope.googleMap.parseReverseGeolocationData(resp.data);

                            //$scope.locationString = placeDetail.city != '' ? 'Your current location is: ' + placeDetail.area + ", " + placeDetail.city + ", " + placeDetail.state : '';
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
                            *//* Setting up default lattitude & longitude of the map *//*
                            $scope.searchParams.lat = $scope.googleMap.currentMarkerPosition.latitude;
                            $scope.searchParams.lng = $scope.googleMap.currentMarkerPosition.longitude;
                        }
                        if ($routeParams['ezeid']) {
                            $scope.triggerSearch();
                        }
                    }, function () {
                        if ($routeParams['ezeid']) {
                            $scope.triggerSearch();
                        }
                    });
                }
                else {
                    handleNoGeolocation();
                    if ($routeParams['ezeid']) {
                        $scope.triggerSearch();
                    }
                }
            }, function () {
                if ($routeParams['ezeid']) {
                    $scope.triggerSearch();
                }
                handleNoGeolocation();
            });
*/

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
                    if($routeParams['lat']){
                        $scope.googleMap.currentMarkerPosition.latitude = $routeParams['lat'];
                        $scope.googleMap.currentMarkerPosition.longitude = $routeParams['lng'];
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
                $scope.params.lat = lat;
                $scope.params.lng = lng;

                    /* get new location string */
                $scope.googleMap.getReverseGeolocation(lat, lng).then(function (resp)
                {
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
                    }
                });

            };

            /**
             * Load map in the modal box to change the preferred search location
             * @type {boolean}
             */
            var isMapInitialized = false;
            $scope.modalVisible = false;
            $scope.modalVisibility = function () {
                /* toggle map visibility status */
                $scope.modalVisible = !$scope.modalVisible;
            };

            $scope.$watch('modalVisible', function (newVal, oldVal) {
                if (newVal) {
                    /* check for the map initialzation */
                    if (!isMapInitialized) {
                        /* initialize map */
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
                title: 'Change Your Searched Location',
                class: 'business-manager-modal'
            };

            /*Filter for my college only*/
            $scope.filterMyCollege = function () {
                $scope.filterCollege = !$scope.filterCollege;
            };

            /**
             * Apply for job
             * @param _tid
             */
            $scope.applyForJob = function(_tid,_index)
            {
                $scope.$emit('$preLoaderStart');
                $scope.jobData = {
                    token : $rootScope._userInfo.Token,
                    job_id : $scope.jobTid
                }
                $http({
                    method: "POST",
                    url: GURL + 'job_apply',
                    data :{
                        token:$rootScope._userInfo.Token,
                        job_id:_tid
                    }
                }).success(function (data)
                    {
                        $scope.$emit('$preLoaderStop');
                        if(data.status)
                        {
                            if(data.data.Status == -2)
                            {
                                $scope.modalVisibleResume = true;
                            }
                            else
                            {
                                //  initiateSearch();
                                $scope.resultData[_index].hide = 1;
                                Notification.success({ message: "Applied..", delay : 2000});
                            }
                        }
                    })
                .error(function(data, status, headers, config) {
                    $scope.$emit('$preLoaderStop');
                });
            };

            /* get lattitude and longitude based on present lat and lng */
            function getSearchedCoordinates(lat,lng)
            {
                if(typeof($routeParams.lat) != 'undefined' && typeof($routeParams.lng) != 'undefined')
                {
                    return [$routeParams.lat,$routeParams.lng];
                }
                else
                {
                    return [lat,lng];
                }
            }

            /* modal box for Upload resume */
            $scope.modalResume = {
                title: 'Upload Resume',
                class: 'business-manager-modal'
            };

            $scope.modalVisibleResume = false;
            $scope.modalVisibleResumeBox = function () {
                /* toggle map visibility status */
                $scope.modalVisibleResume = !$scope.modalVisibleResume;
            };

            $scope.openResumeTab = function ()
            {
                $window.open('/profile-manager/resume', '_blank');
            };


        }]);