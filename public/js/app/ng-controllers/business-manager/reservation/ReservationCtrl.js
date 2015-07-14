/**
 * Controller to manage all the functionalities in RESERVATION-MODULE
 *
 * @author: Sandeep[EZE ID]
 * @since 20150527
 */
var res = angular.module('ezeidApp').
    controller('ReservationCtrl', [
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
        'GoogleMaps',
        '$route',
        'UtilityService',
        '$document',
        '$sce',
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
            GoogleMap,
            $route,
            UtilityService,
            $document,
            $sce

        ) {

            $scope.$emit('$preLoaderStart');
            /* SETTINGS GOES HERE======================================== */

            /* Array of self reservation ID-array */
            $scope.selfreservation = [];
            /* check if the logged in user have any reservation */
            $scope.isSelfReservationExists = false;

            /* current services */
            $scope.currentServices = [];

            /* flag if is HTML loaded */
            $scope.ifHtmlLoaded = false;

            if($location.path() == '/business-manager/reservation'){
                var ezeone = $rootScope._userInfo.ezeid
                /* get only the masterID */
                $routeParams.ezeone = ezeone.split(".")[0];
            }

            /* for resources availability background color */
            var availabilityColor = 'rgb(64, 242, 168)';

            /* color array for already reserved time slot */
            var reservedColorArray = ['rgb(255, 180, 63)'];

            /* self reserved color */
            var selfReservedColor = 'rgb(250, 253, 117)';

            /* color of the flash on clicking of the appointment list */
            var flashColor = "yellow";

            /* default height of the block in 'em' */
            var defaultHeightClass = 'blk-1-1';//default height class::||Don't Change||
            $scope.height = 1.1;//default height::||Don't Change||

            var proposedHeight = '0.8';//choose between 0.6em and 2.2em in multiple of 0.2: i.e [1.2,1.4,1.8,2.2...etc.]

            /**
             * Working Hours[in minutes of the day]
             */
            $scope.workingHrs = [
                //[540, 840],
                //[960, 1200]
            ];



            /* Reserved hours *///[Start Minute, End Minute, Reserver Name, Reserver ID, services, status]
            $scope.reservedTime = [];
            /* Set the logged in user */
            setUserLoggedInId().then(function(){
                init();
            },function(){
                $location.path('/');
            });

            /* Flag for resources */
            $scope.isResource = false;
            /* Access Rights of the reservation module */
            $scope.accessRight = false;//no access rights

            if($routeParams.ezeone == $rootScope._userInfo.ezeid)
            {
                $scope.isResource = true;
            }


            /* resources array */
            $scope.resources = [];//FORMAT: 'tid':1,'title':'Dr. Meet','status':1

            /* service array to store all service details under this EZE ID */
            $scope.allServices = [];
            $scope.mappedServices = [];
            $scope.finalServiceArray = [];
            $scope.currentServiceArray = [];//***********************************

            /* active resource id */
            $scope.activeResourceId = '';

            /* set the date for which calendar is shown */
            $scope.activeDate = moment().format('DD-MMM-YYYY');

            /* flag bit for checking if there is no resources */
            $scope.isNoResource = false;

            /* SETTINGS ENDS HERE======================================== */

            /* All the set color's INDEX with their title */
            $scope.colorIndex = [
                [availabilityColor, 'Available'],
                [reservedColorArray[0], 'Reserved'],
                [selfReservedColor, 'Your Appointment'],
            ];

            /* Flag status for opening or close modal box */
            $scope.modalVisible = false;

            /* name of the ezeid */
            $scope.headTitle = $routeParams.name;
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////GET DEFAULT CALENDAR DATA////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            $scope.searchedEzeid = $routeParams.ezeone;
            $scope.$emit('$preLoaderStart');
            function init(){
                getResource($scope.searchedEzeid).then(function () {
                    getServicesData($scope.searchedEzeid).then(function () {
                        if(!$scope.resources.length > 0)
                        {
                            return ;
                        }
                        getServiceResourceMapping($scope.searchedEzeid).then(function () {
                            setFinalMappedServices(6);
                            var date = moment().format('DD MMM YYYY h:mm:ss a');
                            getReservationTransactionData($scope.activeResourceId, date, $scope.searchedEzeid).then(function () {
                                if(!$scope.workingHrs.length > 0)
                                {
                                    Notification.error({message: "No working hour defined for this Resource on this day", delay: MsgDelay});
                                    cleanCalendarData();
                                }
                                /* set the self reservation array */
                                setSelfReservationArray();
                                $scope.$emit('$preLoaderStop');
                                /* Re-setting VIEW of the complete calendar structure in case its: tablet or mobile */
                                resetBlock();
                            });
                        });
                    });
                });
            };


            /**
             * Get resources of this EZE ID
             * @param ezeid of the searched org.
             */
            function getResource(ezeid) {
                var defer = $q.defer();
                $scope.$emit('$preLoaderStart');
                $http({
                    url: GURL + 'reservation_resource',
                    method: "GET",
                    params: {
                        ezeid: ezeid,
                        type:1
                    }
                }).success(function (resp) {

                    $scope.$emit('$preLoaderStop');
                    if(resp.data){
                        if (resp.data.length > 0) {
                            setResources(resp.data);
                        }
                    }

                    defer.resolve();
                }).error(function (err) {
                    $scope.$emit('$preLoaderStop');
                    Notification.error({message: "Something went wrong! Check your connection", delay: MsgDelay});
                    defer.resolve();
                });
                return defer.promise;
            }

            /**
             * in tablet and mobile view make the blocks in the following order
             * 1.head-title-block
             * 2.notes-block
             * 3.calendar-block
             */
            function resetBlock()
            {
                var screenWidth = $(window).width();
                if(screenWidth < 992)
                {
                    var calendarHtml = $('#calendar-block').html();
                    var headHtml = $('#head-title-block').html();
                    $scope.head = getSafeText(headHtml);
                    $scope.calendar = getSafeText(calendarHtml);
                    $('#calendar-block').html('');
                    $('#head-title-block').html('');
                }
            }

            function getSafeText(text)
            {
                return $sce.trustAsHtml(text);
            }

            /**
             * Create the resource array for Front End
             * @param array from HTTP request
             */
            function setResources(array) {
                $scope.$emit('$preLoaderStart');
                var tempArr = [];
                $scope.resources = [];
                for (var obj in array) {
                    $scope.isNoResource = true;
                    if ($scope.activeResourceId == '') {
                        $scope.activeResourceId = array[obj].tid;
                    }

                    if(typeof(array[obj].description) == 'undefined')
                    {
                        continue;
                    }

                    tempArr =
                    {
                        'tid': array[obj].tid,
                        'title': array[obj].title,
                        'status': array[obj].status,
                        'description': array[obj].description,
                        'ezeid': array[obj].EZEID,
                        'operator': array[obj].operator
                    };
                    $scope.resources.push(tempArr);
                }
                setAccessRights($scope.resources[0].operator);
                $scope.description = $scope.resources.length > 0?$scope.resources[0].description:'';
                $scope.$emit('$preLoaderStop');
            }

            /**
             * Get all services of THIS EZE ID
             */
            function getServicesData(ezeid) {
                var defer = $q.defer();
                $scope.$emit('$preLoaderStart');
                $http({
                    url: GURL + 'reservation_service',
                    method: "GET",
                    params: {
                        ezeid: ezeid
                    }
                }).success(function (resp) {

                    $scope.$emit('$preLoaderStop');

                    if(resp && resp.data)
                    {
                        if ( resp.data.length > 0) {
                            setAllServices(resp.data);
                        }
                    }
                    defer.resolve();
                }).error(function (err) {
                    $scope.$emit('$preLoaderStop');
                    Notification.error({message: "Something went wrong! Check your connection", delay: MsgDelay});
                    defer.resolve();
                });
                return defer.promise;
            }

            /**
             * Set all Services of this EZE ID
             */
            function setAllServices(data) {
                $scope.allServices = [];
                for (var obj in data) {
                    $scope.allServices[data[obj].tid] = data[obj];
                }
            }

            /**
             * Get service-resource mapping for a resource
             */
            function getServiceResourceMapping(ezeid) {
                var defer = $q.defer();
                $scope.$emit('$preLoaderStart');
                $http({
                    url: GURL + 'reservation_resource_service_map',
                    method: "GET",
                    params: {
                        ezeid: ezeid
                    }
                }).success(function (resp) {
                    $scope.$emit('$preLoaderStop');
                    if(resp && resp.data)
                    {
                        if (resp.data.length > 0) {
                            setMappedServices(resp.data);
                        }
                    }
                    defer.resolve();
                }).error(function (err) {
                    $scope.$emit('$preLoaderStop');
                    Notification.error({
                        message: "Something went wrong! Check your internet connection",
                        delay: MsgDelay
                    });
                    defer.resolve();
                });
                return defer.promise;
            }

            /**
             * Set all the services for this EZE ID
             */
            function setMappedServices(data) {
                var tempArr = [];
                $scope.mappedServices = [];
                for (var obj in data) {
                    /* set the services */
                    $scope.mappedServices[data[obj].ResourceID] = data[obj].serviceID;
                }
            }


            /**
             * Get all the service details of a paritcular resource
             */
            function setFinalMappedServices(resourceId) {
                var serviceArray = [];
                for (var obj in $scope.mappedServices) {
                    if(typeof($scope.mappedServices[obj]) == 'undefined')
                    {
                        break;
                    }

                    var arr = $scope.mappedServices[obj].split(',');
                    var array = [];
                    for (var i = 0; i < arr.length; i++) {
                        tempArr = {
                            'tid': $scope.allServices[arr[i]].tid,
                            'title': $scope.allServices[arr[i]].title,
                            'duration': $scope.allServices[arr[i]].duration,
                            'status': $scope.allServices[arr[i]].status
                        }
                        array.push(tempArr);
                    }
                    serviceArray[obj] = array;
                }
                $scope.finalServiceArray = serviceArray;
                $scope.currentServiceArray = serviceArray[$scope.activeResourceId];
                $scope.reservationService = $scope.currentServiceArray[0].tid;
            }

            /**
             * Master function for getting all calendar data and reservatiom
             */
            function getReservationTransactionData(resourceId, date, searchedEzeid) {
                var defer = $q.defer();
                $scope.$emit('$preLoaderStart');
                $http({
                    url: GURL + 'reservation_transaction',
                    method: "GET",
                    params: {
                        resourceid: resourceId,
                        date: date,//'05 Jun 2015 09:42:00 AM',
                        toEzeid: searchedEzeid
                    }
                }).success(function (resp) {

                    $scope.$emit('$preLoaderStop');
                    if (resp.status) {
                        //  set formated result for reservation listing
                        getFormatedTransactionData(resp);
                    }
                    else
                    {
                        $scope.workingHrs = [];
                        $scope.reservedTime = [];
                    }
                    defer.resolve();
                }).error(function (err) {
                    $scope.$emit('$preLoaderStop');
                    Notification.error({message: "Something went wrong! Check your connection", delay: MsgDelay});
                    defer.resolve();
                });
                return defer.promise;
            };

            /**
             * Function for converting LOCAL time (local timezone) to server time
             */
            var convertTimeToUTC = function (localTime, dateFormat) {
                if (!dateFormat) {
                    dateFormat = 'DD-MMM-YYYY hh:mm A';
                }
                return moment(localTime).utc().format(dateFormat);
            };


            /**
             * Function for converting UTC time from server to LOCAL timezone
             */
            var convertTimeToLocal = function (timeFromServer, dateFormat, returnFormat) {
                if (!dateFormat) {
                    dateFormat = 'DD-MMM-YYYY hh:mm A';
                }
                if (!returnFormat) {
                    returnFormat = dateFormat;
                }

                var mom1 = moment(timeFromServer,dateFormat);
                return mom1.add((mom1.utcOffset()), 'm').format(returnFormat);
            };

            function selectedTimeUtcToLocal(selectedTime) {

                var today = moment().utc().format('DD-MMM-YYYY');
                var currentTaskDate = moment(today + ' ' + selectedTime,'DD-MMM-YYYY H:mm').format('DD-MMM-YYYY H:mm');
                return convertTimeToLocal(currentTaskDate, 'DD-MMM-YYYY H:mm', "H:mm");
            }


            function getFormatedTransactionData(_data) {
                var formatedData = [];
                var reserved = [];
                var error = '';
                $scope.workingHrs = [];
                $scope.reservedTime = [];
                for (var nCount = 0; nCount < _data.data.length; nCount++) {

                    if(_data.data[nCount]['W1'] == 'null')
                    {
                        error = 'No service hour found for this resource';
                    }

                    var times = new Array
                    (
                        selectedTimeUtcToLocal(_data.data[nCount]['W1']),
                        selectedTimeUtcToLocal(_data.data[nCount]['W2']),
                        selectedTimeUtcToLocal(_data.data[nCount]['W3']),
                        selectedTimeUtcToLocal(_data.data[nCount]['W4'])
                    );
                    if (_data.data[nCount]['TID'] != null) {
                        reserved[nCount] = new Array(
                            convertHoursToMinutes(selectedTimeUtcToLocal(_data.data[nCount]['Starttime'])),
                            convertHoursToMinutes(selectedTimeUtcToLocal(_data.data[nCount]['endtime'])),
                            _data.data[nCount]['reserverName'],
                            _data.data[nCount]['reserverId'],
                            _data.data[nCount]['service'],
                            _data.data[nCount]['Status'],
                            _data.data[nCount]['TID']
                        );
                    }
                    else {
                        reserved[nCount] = [];
                    }

                    if(error.length > 0)
                    {
                        Notification.error({ message: error, delay: MsgDelay });
                    }
                    formatedData['working'] = times;
                    formatedData['reserved'] = reserved;
                }

                /* put the formatted service in the scope variables */
                $scope.workingHrs = [
                    [convertHoursToMinutes(formatedData['working'][0]), convertHoursToMinutes(formatedData['working'][1])],
                    [convertHoursToMinutes(formatedData['working'][2]), convertHoursToMinutes(formatedData['working'][3])]
                ];


                $scope.reservedTime = [];
                for (var i = 0; i < formatedData['reserved'].length; i++) {
                    $scope.reservedTime.push(formatedData['reserved'][i]);
                }
                /* reload calendar */
            };

            function reloadWorkingHours() {
                /* clean reserved slot */

                /* reload reserved slot */
                $scope.alreadyReserveSlot(true);
            }


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////


            /////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////
            ///////////////DON'T EDIT BELOW THIS BOX/////////////////
            /////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////

            /* get the css class based on the height provided */
            function getHeightCss() {
                /* multiply the height and make it to double digit */
                var number = proposedHeight * 10;
                /* get the first digit */
                var firstDigit = Math.floor(number / (10))
                /* get the second digit */
                var secondDigit = Math.floor(number % 10);
                if (secondDigit % 2 == 0) {
                    /* height changed to new proposed height */
                    $scope.height = proposedHeight;
                    return 'blk-' + firstDigit + '-' + secondDigit;
                }
                else {
                    return defaultHeightClass;
                }
            }

            /**
             * For creation of raw-structure of the calender(Day)
             * @type {Array}
             */

            $scope.timeArr = ['Early', 'Morning', 'Noon', 'Evening'];
            var tempArr = [];
            var data = [];
            var bgColor = [];
            var toggleColor = true;
            /* Create Array which helps in creating block */
            for (var i = 0; i < 72; i++) {
                tempArr.push(i);
                /* All the processing for building block goes here */

                /* for strip-effect in the blocks */
                i % 6 == 0 ? toggleBlockColor() : '';
                bgColor[i] = toggleColor ? 'gray' : '';
            }
            $scope.blockArr = tempArr;
            $scope.blockData = data;
            $scope.blockColor = bgColor;
            $scope.heightClass = getHeightCss();

            /* check if the time label comes?Yes - return the time: return empty */
            function getTimeLabel(blockNumber) {
                if (blockNumber % 6 == 0) {
                    return blockNumber;
                }
                else {
                    return false;
                }
            }

            /* toggle the block color for giving stripped effect */
            function toggleBlockColor() {
                toggleColor = !toggleColor;
            }

            /**
             * get the current time based on the passed values
             * @param row
             * @param col
             */
            $scope.getTime = function (row, col, status) {
                /* return time in 30 mins interval */

                if (typeof(status) == 'undefined' && row % 6 != 0 && row != 0) {
                    return;
                }

                /* get no. of minutes in day */
                var mins = row * 5 + col * 360;
                /* get time */
                return $scope.convertMinutesToTime(mins);
            }

            /* get block id */
            $scope.getBlockId = function (row, col) {
                return 72 * col + row;
            }

            /*
             * restricting duplicate call
             */
            var prevReloadCalanderFlag = 'x';
            var prevReservationMooduleStarterFlag  = 'x';
            var prevWorkingHrs  = 'x';
            var prevAvailable  = 'x';

            /* color WORKING hours */
            $scope.colorWorkingHoursFlag = false;
            $scope.colorWorkingHours = function (reloadCalanderFlag,reservationMooduleStarterFlag) {
                var workingHrs = $scope.workingHrs;
                /* Code block to prevent calling of this function repeatedly */
                if(reloadCalanderFlag == prevReloadCalanderFlag && reservationMooduleStarterFlag == prevReservationMooduleStarterFlag
                    && workingHrs.length == prevWorkingHrs && $('.available').length == prevAvailable)
                {
                    return;
                }
                else
                {
                    prevReloadCalanderFlag = reloadCalanderFlag;
                    prevReservationMooduleStarterFlag = reservationMooduleStarterFlag;
                    prevWorkingHrs = workingHrs.length;
                    prevAvailable = $('.available').length;
                }

                if(workingHrs.length == 0)
                {
                    return;
                }

                if($scope.colorWorkingHoursFlag)
                {
                    //return;
                }

                /* check if the html exists and working hours have been loaded */
                if(reservationMooduleStarterFlag && workingHrs.length > 0 && $('.available').length > 0)
                {
                    $scope.colorWorkingHoursFlag = true;
                }
                /* RESET CALENDAR */////////////////////////////////////////////////////////
                /* clean the calendar's working hour */
                cleanCalendarData();
                /* clear all text */
                $('.reserved').html('').attr('background-color','');
                /* remove merging */
                removeMerge();
                ////////////////////////////////////////////////////////////////////////////
                /* traverse through the individual time slot for WORKING HOURS and color them */
                for (var i = 0; i < workingHrs.length; i++) {
                    var startTimeMins = workingHrs[i][0];
                    var endTimeMins = workingHrs[i][1];
                    /* identify the block id which comes in range */
                    var data = getBlockRange(startTimeMins, endTimeMins);
                    var startRange = data[0];
                    var endRange = data[1] - 1;//As we don't want last block to be filled

                    /* color all the blocks */
                    var addCss = 'available';
                    $scope.colorBlocks(startRange, endRange, availabilityColor, addCss);
                }
                /* call areadyReservedslot in case it have over written or clear the already reserved hours */
                $scope.alreadyReserveSlot(false,false,true);
            };

            function cleanCalendarData()
            {
                $('.blk-content').each(function(){
                    if($(this).hasClass('reserved'))
                    {
                        $(this).removeClass('reserved')
                            .removeAttr('data-reserver')
                            .removeAttr('data-tid')
                            .removeAttr('title')
                            .html('');
                    }
                    $(this).removeClass('available');
                    $(this).removeClass('hidden');
                });
            }

            /**
             * Remove merging from blocks
             */
            function removeMerge()
            {
                $('.blk-content').removeClass('hidden').removeAttr('data-linktid');
                $('.blk-content').css('height','');
            }

            /* color already reserved time */
            /**
             * iDEA:
             * 1. Get the time range
             * 2. Traverse through the reserved time-slot array
             * 2a...Get the block id which falls under the present range
             * 2b...Call mergeBlockMaster to merge and also write text
             */
            $scope.alreadyReserveSlotFlag = false;
            /* to avoid repeated calling of same function */
            var prevReloadWorkingHoursFlag;
            var prevReservationMooduleStarterFlag;
            var prevReservedTime;
            var prevReserved;
            $scope.alreadyReserveSlot = function (reloadWorkingHoursFlag,reservationMooduleStarterFlag,calledFromColorWorkingHours) {
                //$('.reserved').attr('title','');
                if($scope.reservedTime.length == 0)
                {
                    return;
                }
                /* STOPPING repeated calls to this code block */
                if(!calledFromColorWorkingHours || typeof(calledFromColorWorkingHours) == 'undefined') {
                    if (reloadWorkingHoursFlag == prevReloadWorkingHoursFlag && reservationMooduleStarterFlag == prevReservationMooduleStarterFlag
                        && $scope.reservedTime.length == prevReservedTime && $('.reserved').length == prevReserved) {
                        return;
                    }
                    else {
                        prevReloadWorkingHoursFlag = reloadWorkingHoursFlag;
                        prevReservationMooduleStarterFlag = reservationMooduleStarterFlag;
                        prevReservedTime = $scope.reservedTime.length;
                        prevReserved = $('.reserved').length;
                    }
                }

                //$scope.alreadyReserveSlotFlag = true;
                for (var i = 0; i < $scope.reservedTime.length; i++) {
                    /* get blocks coming under this range */
                    var data = getBlockRange($scope.reservedTime[i][0], $scope.reservedTime[i][1]);
                    /* initiate merging process */
                    var text = $scope.getReservedBlockText($scope.loggedInUid,$scope.reservedTime[i][3],$scope.reservedTime[i][2]);
                    var color = $scope.getReservedBlockColor($scope.loggedInUid,$scope.reservedTime[i][3]);

                    var title = $scope.getTitleText($scope.loggedInUid,$scope.reservedTime[i][3],$scope.reservedTime[i][2]
                        ,$scope.reservedTime[i][0],$scope.reservedTime[i][1],$scope.reservedTime[i][4]);
                    var tid = $scope.reservedTime[i][6];
                    var reserverId = $scope.reservedTime[i][3];
                    $scope.mergeBlockMaster(data[0], data[1], text, $scope.height,color,title,tid,reserverId);
                    /* strike the text if the status is closed */
                    strikeText($scope.reservedTime[i][6],$scope.reservedTime[i][5]);
                }
            };


            /**
             * Block Merging
             * ->increase the height of first block of range to complete range
             * ->fill the background color
             * ->hide all the other blocks in the range
             * ->write text
             */
            $scope.mergeBlockMaster = function (startBlock, endBlock, text, height,color,title,tid,reserverId) {
                var realRange = refineRange(startBlock, endBlock);
                for (var i = 0; i < realRange.length; i++) {
                    var startRange = realRange[i][0];
                    var endRange = realRange[i][1];
                    /* merge the cells */
                    mergeCells(startRange, endRange, text, tid);
                    /* commence merging process */
                    $scope.colorBlocks(startRange, endRange, color,'reserved');
                    /* add a flag to the first block for making it reserved */
                    $('.block-'+startRange).attr('title',title).attr('data-tid',tid).attr('data-reserver',reserverId);
                }
            }

            /* Actual merging goes HERE */
            function mergeCells(startBlock, endBlock, text, tid) {
                /* calculate total height  */
                var totalHeight = endBlock - startBlock + 1;
                /* add text */
                $('.block-' + startBlock).html('<p>' + text + '</p>');
                /* increase the first block's height to totalHeight */
                textStylerAndHeightSetter(startBlock,totalHeight);
                if(startBlock == endBlock)
                {
                    return;
                }
                /* hide the remaining block */
                for (var i = startBlock + 1; i <= endBlock; i++) {
                    $('.block-' + i).addClass('hidden').attr('data-linktid',tid);
                }
                /* un hide the start Block in case it has been hidden by the above code block */
                $('.block-' + startBlock).removeClass('hidden').removeAttr('data-linktid');
            }


            /**
             * Set the height of the block and change the text size in case its a smaller block
             * @param startBlock : start block from where the slot is starting
             * @param totalHeight : total height of the slot
             */
            function textStylerAndHeightSetter(startBlock,totalHeight)
            {
                $('.block-' + startBlock).css('height', $scope.height * totalHeight + 'em');

                $('.block-' + startBlock+' > p').css("font-weight",'bolder').css("font-size",'0.6em');

            }

            /**
             * partition the block range based on 4 different time of day: i.e early,morning,evening,night
             * @param startRange: start block of the slot
             * @param endRange: end block of the slot
             * @returns {*}
             */
            function refineRange(startRange, endRange) {
                var endBlockArray = [71, 143, 215, 287];
                var data = [];
                var flag = false;
                for (var i = 0; i < endBlockArray.length; i++) {
                    if (endBlockArray[i] >= startRange && endBlockArray[i] < endRange) {
                        data.push([startRange, endBlockArray[i]]);
                        startRange = endBlockArray[i] + 1;
                        flag = true;
                    }
                    else if (flag) {
                        data.push([startRange, endRange - 1]);
                        break;
                    }
                }

                /* in case it don't touches any of the edges */
                if (data.length == 0) {
                    return [[startRange, (endRange - 1)]];
                }
                return data;
            }

            /**
             * Unmerge Block
             * ->unhide all the blocks in the range
             * ->make every block's height to default
             * ->remove text
             * ->remove background color
             */
            $scope.unmergeBlock = function (startBlock, endBlock, text, height) {

            }

            /* get the block ids based on the range */
            function getBlockRange(startRange, endRange) {
                var data = [];
                data.push(startRange / 5);
                data.push(endRange / 5);
                return data;
            };

            /* Color the blocks */
            $scope.colorBlocks = function (startBlock, endBlock, color, addCss) {
                var css = '';
                if(typeof(addCss) != 'undefined')
                {
                    css = addCss;
                }
                for (var j = startBlock; j <= endBlock; j++) {
                    $('.block-' + j).css('background-color', color);
                    $('.block-' + j).addClass(css);
                }
            }

            var getRandomNumber = function (len) {
                return Math.floor(Math.random() * len);
            };

            /* select random color */
            $scope.randomColor = function () {
                var num = getRandomNumber(reservedColorArray.length);
                return reservedColorArray[num];
            }

            /* Get the text of for the reserved dates based on the user'is id */
            $scope.getReservedBlockText = function(loggedInUid,reserverId,text)
            {
                if(!$scope.isResource) {
                    if (loggedInUid != reserverId) {
                        return 'Reserved';
                    }
                }
                return text;
            }

            /* Get the text of for the reserved dates based on the user'is id */
            $scope.getReservedBlockColor = function(loggedInUid,reserverId)
            {
                if(loggedInUid != reserverId)
                {
                    return $scope.randomColor();
                }
                return selfReservedColor;
            }

            /**
             * Get the title text for the reserved block
             */
            $scope.getTitleText = function(loggedInUid,reserverId,text,startTime,endTime,service)
            {
                if(!$scope.isResource) {
                    if (loggedInUid != reserverId) {
                        return 'Reserved';
                    }
                }
                /* return the complete string as title */
                return text+' for '+service+' ('+$scope.convertMinutesToTime(startTime)+' - '+$scope.convertMinutesToTime(endTime)+')';
            }

            /**
             * Convert to minutes to time
             */
            $scope.convertMinutesToTime = function(mins)
            {
                var hours = Math.floor(mins / (60));
                var minutes = mins % 60;
                minutes = minutes < 10 ? '0' + minutes : minutes;
                return (hours + ':' + minutes);
            }

            /**
             * Append the color index at the bottom[*checked*]
             */
            $scope.appendColorIndexFlag = false;
            $scope.appendColorIndex = function() {

                if(!$scope.ifHtmlLoaded)
                {
                    //return ;
                }

                if($scope.appendColorIndexFlag)
                {
                    return;
                }

                if(typeof($('.color-index-2').attr('style')) != 'undefined')
                {
                    $scope.appendColorIndexFlag = true;
                }
                for (var i = 0; i < $scope.colorIndex.length; i++)
                {
                    $('.color-index-'+i).css('color',$scope.colorIndex[i][0]);
                    $('.color-index-label-'+i).html('<small>'+$scope.colorIndex[i][1]+'</small>');
                }

                //Small code for preventing the service dropdown to disaapear on click
                $scope.serviceDropdown();
            };

            /**
             * Convert to minutes of the day
             */
            function convertHoursToMinutes(hours)
            {
                var minsArray = hours.split(":");
                var hours = minsArray[0];
                var mins = minsArray[1];
                return (parseInt(hours)*60) + parseInt(mins);
            }

            ////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////
            //////////////////////////FUNCTIONALITIES & EVENTS//////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////

            $scope.clickedBlockId = 0;
            $scope.currentBlockMinute = 0;
            $scope.startTime = '00:00';
            $scope.duration = 0;
            $scope.endTime = '00:00';
            $scope.notes = '';
            /**
             * On Click event handler for whole of the reservation module
             */
            $scope.reservationClickEventHandler = function (blockId)
            {
                /* check if the block is already reserved */
                var isReserved = $('.block-'+blockId).hasClass('reserved');
                var isAvailable = $('.block-'+blockId).hasClass('available');
                changeModalTitle(isReserved);

                /* get TID and fetch the data for this reservation */
                var tid = $('.block-'+blockId).data('tid');

                /* get modal status for isUpdate */
                if(parseInt(tid) > 0)
                {
                    $scope.modal.isUpdate = true;
                    getReservationData(tid);
                }
                else
                {
                    $scope.modal.isUpdate = false;
                }

                /* show error if the working hour is not in working hour */
                if(isReserved || isAvailable || parseInt($scope.accessRight) == 2)
                {
                    /* check if the resource is available for this resource */
                    if(!$scope.currentServiceArray.length > 0)
                    {
                        Notification.error({ message: "No Services available for this resource!", delay: MsgDelay });
                        $scope.disableCalendar();
                        return;
                    }

                    $scope.clickedBlockId = blockId;
                    $scope.startTime = convertBlockIdToTime(blockId);
                    $scope.currentBlockMinute = convertBlockIdToMinute(blockId);

                    /* Check for checking if reservation is in past */
                    var selectedTime = $scope.convertMinutesToTime($scope.currentBlockMinute);
                    var activeDate = moment($scope.activeDate).format('YYYY-MM-DD');

                    if(!checkIfPastDateTime(activeDate,$scope.currentBlockMinute))
                    {
                        Notification.error({ message: "You can't save or edit a reservation in the past", delay: MsgDelay });
                        return;
                    }
                    /* check if the reservation slot is available or not */
                    /* check if the reserver is the loggedin user */
                    var loggedId = $scope.loggedInUid;
                    var reserverId = $('.block-'+blockId).data('reserver');

                    if(typeof(reserverId) != 'undefined' && loggedId != reserverId)
                    {
                        Notification.error({ title : "Warning", message: "You can't edit someone else's reservation", delay: MsgDelay });
                        return;
                    }

                    if(parseInt(reserverId) === 0)
                    {
                        Notification.error({ title : "Warning", message: "Reservation doesn't exists", delay: MsgDelay });
                        return;
                    }

                    if(typeof($scope.currentServiceArray[0]) != 'undefined')
                    {
                        $scope.duration = $scope.currentServiceArray[0].duration;
                    }
                    else
                    {
                        $scope.duration = 0;
                    }
                    $scope.endTime = $scope.convertMinutesToTime($scope.currentBlockMinute + $scope.duration);
                    $scope.modalVisibility();
                    $('#start-time').val($scope.startTime);
                }
                else
                {
                    Notification.error({ message: "You can't make a reservation in non-working hours", delay: MsgDelay });
                }
            }

            /**
             * Check if the reservation slot is available or not
             */
            function isReservationSlotAvailable(startTimeMins,duratiion)
            {
                /* get start block id */
                /* based on the duration get last block id */

                /* traverse all the blocks and check if the block is having class:'available', && not class:'reserved' */
            }

            /**
             * Check if the reservation is in past
             */
            function checkIfPastDateTime(selectedDate,selectedTimeMins)
            {
                var now = moment().format('YYYY-MM-DD');
                var time = moment().format('HH:mm');
                var mins = convertHoursToMinutes(time);
                //if((selectedDate >= now) && (selectedTimeMins >= (mins - 5)))
                if(selectedDate >= now)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }

            /**
             * get reservation data
             */
            function getReservationData(tid)
            {
                if(!tid > 0)
                {
                    return;
                }
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'reservation_trans_details',
                    method : "GET",
                    params :{
                        TID : tid
                    }
                }).success(function(resp){

                    $scope.$emit('$preLoaderStop');
                    if(resp.status)
                    {
                        $scope.reserverMobile = resp.data[0].ContactInfo;
                        $('#userMobile').val($scope.reserverMobile);
                        $scope.reservationService = resp.data[0].serviceids;
                        $scope.startTime = selectedTimeUtcToLocal(resp.data[0].Starttime).substr(0,5);
                        $scope.duration = resp.data[0].duration;
                        $scope.endTime = convertBlockIdToTime((convertHoursToMinutes($scope.startTime) + $scope.duration)/5);
                        $scope.notes = resp.data[0].Notes
                        $('#userNote').val($scope.notes);
                        /* set this reservation services */
                        $scope.currentServices = resp.data[0].serviceids;
                        resetServiceChecks();
                        $scope.setServices();
                    }
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                });
            }

            /**
             * Change modal box Title
             */
            function changeModalTitle(isReserved)
            {
                if(!isReserved)
                {
                    $scope.modal.title = 'Make a reservation';
                }
                else
                {
                    $scope.modal.title = 'Edit reservation';
                }
            }

            /**
             * Modal box to make a reservation
             */
            $scope.modal = {
                title: 'Make a reservation',
                class: 'business-manager-modal',
                isUpdate: false
            };

            /* toggle modal visibility */
            $scope.modalVisibility = function () {
                $scope.modalVisible = !$scope.modalVisible;
            };

            /* hide the glyphicon */
            $('.input-group-addon').addClass('hidden');

            /**
             * onChange - reload the working hours and reserved our
             */
            $scope.currentDateTime = moment().format('DD-MMM-YYYY');
            $scope.$watch('currentDateTime',function(newVal,oldVal){
                if(oldVal !== newVal){
                    $scope.activeDate = moment(newVal).format('DD-MMM-YYYY');
                    /* reload calendar */
                    resetStaterFunction();
                    $scope.reloadCalander();
                }
            });

            $('#resource-dropdown').change(function(){
                var resId = $scope.activateResource($(this).val());
                $scope.description = $(this).children('option:selected').attr('data-desc');
                var resid = $(this).children('option:selected').attr('data-resid');
                setAccessRights($scope.resources[resid].operator);
            });
            /**
             * onChange - reload the working hours and reserved our
             * Activate the button of this resource and inactive others
             * @param tid of the clicked resource
             */
            $scope.activateResource = function(tid)
            {
                $scope.activeResourceId = tid;
                /** check if the logged in uid and this resource id is same
                 * for enabling or disabling the appointment list
                 */
                $('.resource-btn').removeClass('active');
                $('.resource-'+tid).addClass('active');

                if($scope.finalServiceArray[$scope.activeResourceId])
                {
                    $scope.currentServiceArray = $scope.finalServiceArray[$scope.activeResourceId];
                    $scope.reservationService = $scope.currentServiceArray[0].tid;
                    /* reload calendar */
                    $scope.reloadCalander();

                    return;
                }

                Notification.error({ message: "No Services available for this resource!", delay: MsgDelay });
                $scope.currentServiceArray = [];
                $scope.reservationService = [];
                $scope.reloadCalander();
                return;
            }

            /**
             * Reload the calendar with new working hours and
             */
            $scope.reloadCalander = function()
            {

                var tid = $scope.activeResourceId;
                var date = $scope.activeDate;
                /* clear calendar */

                /* http request for getting the new calendar data */
                getReservationTransactionData($scope.activeResourceId,$scope.activeDate,$scope.searchedEzeid).then(
                    function(){
                        setSelfReservationArray();
                        if(!$scope.workingHrs.length > 0)
                        {
                            Notification.error({message: "No working hour defined for this Resource on this day", delay: MsgDelay});
                            cleanCalendarData();
                        }
                        /* recolor working hours */
                        $scope.colorWorkingHours(true);
                        //removeWasteColoredCells();
                    }
                );
            }

            /**
             * Update the reservation form data
             */
            $scope.updateReservationFormData = function(val)
            {
                var index = $('.reservation-service').find(':selected').data('id');//reservation-service
                $scope.duration = $scope.currentServiceArray[index].duration;
                $scope.endTime = $scope.convertMinutesToTime($scope.currentBlockMinute + $scope.duration);
            }

            /**
             * Convert blockId into Minutes
             */
            function convertBlockIdToMinute(blockId)
            {
                return blockId*5;
            }

            /**
             * Convert BlockId to time
             */
            function convertBlockIdToTime(blockId)
            {
                return $scope.convertMinutesToTime(convertBlockIdToMinute(blockId));
            }

            /**
             * convert the time[Hours] to minutes
             */
            $scope.calculateEndTime = function(startTime,duration)
            {
                var minutes = parseInt(convertHoursToMinutes(startTime)) + parseInt(duration);
                $scope.endTime = $scope.convertMinutesToTime(minutes);
            }

            /**
             * Save Reservation
             */
            $scope.saveReservation = function()
            {
                /* check if the services is selected */
                if(!checkServiceSelected() && $scope.accessRight != 2)
                {
                    Notification.error({ message: "Please select atleast one service to proceed", delay: MsgDelay });
                    return ;
                }

                var tid = 0;
                var blockId = 0;
                var saveType = 'save';
                if($scope.modal.isUpdate)
                {
                    /* get TID */
                    var minutes = convertHoursToMinutes($scope.startTime);
                    blockId = minutes/5;
                    tid = $('.block-'+blockId).data('tid');
                    saveType = 'update';
                }
                $scope.startTime = $('#start-time').val();

                var makeDateTime = $scope.activeDate+' '+$scope.startTime;
                /* check if the reservation could be made or not */
                $http({
                    url : GURL + 'reservation_transaction',
                    method : "POST",
                    data :{
                        Token:$rootScope._userInfo.Token,
                        TID:tid,
                        contactinfo: $('#userMobile').val(),
                        notes:$('#userNote').val(),
                        toEzeid:$scope.searchedEzeid,
                        resourceid:$scope.activeResourceId,
                        res_datetime:convertTimeToUTC(makeDateTime,'DD-MMM-YYYY HH:mm'),
                        duration:$scope.calculateTotalDuration(true),
                        status:0,
                        serviceid:getSelectedService()//$('#service').val()+','
                    }
                }).success(function(resp){
                    $scope.$emit('$preLoaderStop');
                    if(resp.status){
                        Notification.success({ message: "Reservation made successfully", delay: MsgDelay });
                        /* reset service select option */
                        /* close modal box */
                        $scope.modalVisible = !$scope.modalVisible;

                        /* reload reservation hours */
                        updateReservationHoursBlocks(blockId);
                        $scope.$emit('$preLoaderStop');
                        resetServiceChecks();
                    }
                    else
                    {
                        Notification.error({ message: "Failed to "+saveType+" your reservation. Probable Reason: "+resp.message, delay: MsgDelay });
                        $scope.$emit('$preLoaderStop');
                    }
                }).error(function(err,status){
                    $scope.$emit('$preLoaderStop');
                    var message = 'An error occured ! Please try again';
                    if(status === 400){
                        message = 'Slot is not available';
                    }

                    Notification.error({ message: message, delay: MsgDelay });
                });
            }

            /**
             * Reload reservation Hours
             */
            function updateReservationHoursBlocks(blockId)
            {
                /* clean the old div [clear title,put the available color] */
                $('.block-'+blockId).attr('title','').css('background-color',availabilityColor);
                /* relaod calendar */
                $scope.reloadCalander();
            }

            /**
             * Update end time on change in end time
             */
            $scope.changeEndTime = function()
            {
                var startTime = $('#start-time').val();
                /* round of start time */
                startTime = $scope.roundOfTime(startTime);
                $('#start-time').val(startTime);

                var duration = $('#duration').data('duration');
                var endTimeMins = parseInt(convertHoursToMinutes(startTime)) + parseInt(duration);
                var time = $scope.convertMinutesToTime(endTimeMins);
                $('#end-time').val(time);
                if(time == 'NaN:NaN')
                {
                    $('#end-time').val('');
                }
            }

            /* round of Time */
            $scope.roundOfTime = function(startTime)
            {
                var mins = convertHoursToMinutes(startTime);
                if((mins % 5) > 2)
                {
                    /* upper value */
                    mins = mins + (5 - (mins%5));
                }
                else
                {
                    /* lower value */
                    mins = mins - (mins%5);
                }
                return $scope.convertMinutesToTime(mins);
            }

            /**
             * Disable the whole calendar in case of NO SERVICE
             */
            $scope.disableCalendar = function()
            {
                /* remove all the available slots */
                $('.blk-content').removeClass('available').removeAttr('style');
            }

            /**
             * Change status of the appointment
             */
            $scope.changeStatus = function(tid,status)
            {
                /* http request for chaanging the status */
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'reservation_transaction',
                    method : "PUT",
                    data :{
                        Token:$rootScope._userInfo.Token,
                        tid:tid,
                        status:status
                    }
                }).success(function(resp){
                    $scope.$emit('$preLoaderStop');
                    if(resp.status){
                        /* change status button status */
                        chnageStatusButtonAndStrikeText(tid,status);
                        /* remove the reservation block */
                        if(parseInt(status) === 11)//If the status is cancleled
                        {
                            $scope.reloadCalander();
                        }
                        Notification.success({ message: "Reservation status changed successfully", delay: MsgDelay });
                    }
                    else
                    {
                        Notification.error({ message: "Unable to change the status of the reservation, Please try again later", delay: MsgDelay });
                    }
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                });
            }

            /**
             * Change the status and color of the button
             */
            function chnageStatusButtonAndStrikeText(tid,status)
            {
                /* make all other button blue */
                $('.btn-'+tid).removeClass('btn-danger').addClass('btn-primary').removeAttr('disabled');
                /* make the clicked button to red */
                $('.btn-'+tid+'-'+status).removeClass('btn-primary').addClass('btn-danger').attr('disabled','');
                /* if status = 10; strike the text in calendar */
                removeStrikeText(tid);
                strikeText(tid,status);
            }

            /**
             * get the logged in id of the user
             */
            function setUserLoggedInId()
            {
                var defer = $q.defer();
                $scope.$emit('$preLoaderStart');
                $http({
                    url : GURL + 'ewtGetUserDetails',
                    method : "GET",
                    params :{
                        Token:$rootScope._userInfo.Token
                    }
                }).success(function(resp){
                    //$scope.$emit('$preLoaderStop');
                    $scope.loggedInUid =  resp[0].MasterID;
                    defer.resolve();
                }).error(function(err){
                    //$scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                    defer.reject();
                });
                return defer.promise;
            }

            /**
             * Remove all the unwanted colored cells
             */
            $scope.removeWasteColoredCells = function()
            {
                //$('.blk-content:not(.building-block .available)').removeAttr('style');
                $('.blk-content').filter(function(index){
                    return !$(this).hasClass('reserved') && !$(this).hasClass('available')
                }).removeAttr('style');
            }

            /**
             * Strike a text if its status is CLOSED
             */
            function strikeText(tid,status)
            {
                if(typeof(status) != 'undefined' && typeof(tid) != 'undefined' && parseInt(status) == 10)
                {
                    $('div').find("[data-tid="+tid+"]").addClass('strike-text');
                    return ;
                }
                else if(typeof(status) != 'undefined' && typeof(tid) != 'undefined' && parseInt(status) != 10)
                {
                    removeStrikeText(tid);
                }
                else if(typeof(tid) != 'undefined' && typeof(status) == 'undefined')
                {
                    $('div').find("[data-tid="+tid+"]").addClass('strike-text');
                    return ;
                }
            }

            /**
             * remove a striked text
             */
            function removeStrikeText(tid)
            {
                if(typeof(tid) != 'undefined')
                {
                    $('div').find("[data-tid="+tid+"]").removeClass('strike-text');
                    return ;
                }
                else
                {
                    $('.blk-content').removeClass('strike-text');
                }
            }


            /**
             * Flash Effect in calendar on the hover / click of the list
             */
            $scope.flashEffect = function(tid)
            {
                var presentColor = $('div').find("[data-tid="+tid+"]").css('background-color');
                if(presentColor == flashColor)
                {
                    return;
                }
                setTimeout(function() {
                    $('div').find("[data-tid="+tid+"]").css('background-color',flashColor);
                    setTimeout(function() {
                        $('div').find("[data-tid="+tid+"]").css('background-color',presentColor);
                    }, 2000);
                }, 0);
            }

            /**
             * Reservation module starter
             */
            $scope.reservationMooduleStarter = function()
            {
                $scope.colorWorkingHours(false,true);
                $scope.alreadyReserveSlot(false,true);
                $scope.appendColorIndex();//Checks Done
                $scope.removeWasteColoredCells();
            }

            /**
             * Reset reservation starter function
             */
            function resetStaterFunction()
            {
                $scope.colorWorkingHoursFlag = false;
                $scope.alreadyReserveSlotFlag = false;
            }

            $scope.counter = 1;
            $scope.counterFun = function()
            {
                ////console.log($scope.counter++);
            }

            /**
             * Set the access rights of the reservation module
             *
             * False: No write rights / Just a normal user
             * 1: Super user: Reasd-only rights
             * 2-*: Resource: Read/Write permission only to its own module
             */
            function setAccessRights(activatedResourceEzeid)
            {
                var operatorArr = activatedResourceEzeid.split(',');

                var isSubuser = false;
                if(operatorArr.indexOf($rootScope._userInfo.ezeid) !== -1)
                {
                    isSubuser = true;
                }

                //if($routeParams.ezeone == $rootScope._userInfo.ezeid)
                //{
                //    $scope.accessRight = 1;//Super User
                //    $scope.isResource = true;
                //}
                if(isSubuser)
                {
                    $scope.accessRight = 2;//He is the INTERNAL USER or who is OPERATOR of this resource
                    $scope.isResource = true;
                }
                else
                {
                    $scope.accessRight = false;
                    $scope.isResource = false;
                }
            }

            $scope.serviceDropdown = function() {
                var options = [];
                $('.dropdown-menu a').on('click', function (event) {

                    var $target = $(event.currentTarget),
                        val = $target.attr('data-value'),
                        $inp = $target.find('input'),
                        idx;

                    if (( idx = options.indexOf(val) ) > -1) {
                        options.splice(idx, 1);
                        setTimeout(function () {
                            $inp.prop('checked', false)
                        }, 0);
                    } else {
                        options.push(val);
                        setTimeout(function () {
                            $inp.prop('checked', true)
                        }, 0);
                    }

                    $(event.target).blur();
                    return false;
                });
            }

            /**
             * Get selected service ids
             */
            function getSelectedService()
            {
                var services = [];
                $('input[name=service-chk]:checked').each(function() {
                    services.push($(this).val());
                });

                if(services.length > 0)
                {
                    return services.join(",")+",";
                }

                return "";
            }

            /**
             * reset all the selected checkboxes
             */
            function resetServiceChecks()
            {
                $('input[name=service-chk]:checked').each(function() {
                    $(this).prop('checked',false);
                });
            }

            /**
             * Calculate the total duration of all the services
             */
            $scope.calculateTotalDuration = function(isForSaving)
            {
                var duration = 0;

                if($scope.accessRight == 2 && isForSaving)
                {
                    return $('#duration').val();
                }

                /* for other users */
                $('input[name=service-chk]:checked').each(function() {
                    duration += $(this).data("duration");
                });
                $scope.duration = duration;
                return duration;
            }

            /**
             * Check if the services ares checked
             */
            function checkServiceSelected()
            {
                var duration = $scope.calculateTotalDuration();
                if(duration > 0)
                {
                    return true;
                }
                return false;
            }

            /**
             * Pre - Check all service checkboxes while editing a reservation
             */
            $scope.setServices = function()
            {
                var serviceIds = $scope.currentServices;
                if(typeof(serviceIds) === 'undefined' || !serviceIds || serviceIds === null)
                {
                    return;
                }

                var serviceArr = serviceIds.split(',');
                //resetServiceChecks();
                if(!serviceArr || !serviceArr.length > 0)
                {
                    return ;
                }

                for(var i = 0;i<serviceArr.length;i++)
                {
                    $(".services").find("[value='"+serviceArr[i]+"']").prop('checked',true);
                }
            }

            /**
             * Check if the user have any reservation for the present calendar and resource
             */
            function setSelfReservationArray()
            {
                var reserverEzeid = $scope.reservedTime;
                if(!reserverEzeid || !reserverEzeid.length > 0)
                {
                    $scope.selfreservation = [];
                    $scope.isSelfReservationExists = false;
                }
                /* save all the self reservations in an array */
                var selfReservationSlot = [];
                for(var i = 0; i < reserverEzeid.length; i++)
                {
                    if(reserverEzeid[i][2] == $rootScope._userInfo.ezeid)//Yay! got a reservation
                    {
                        selfReservationSlot.push(reserverEzeid[i][6]);
                    }
                }
                if(selfReservationSlot.length > 0)
                {
                    $scope.isSelfReservationExists = true;
                }
                $scope.selfreservation = selfReservationSlot;
            }

            /**
             * check if the logged in user have any self reservation
             */
            $scope.isSelfReservationExist = function(reservationId)
            {
                if(!$scope.selfreservation || !$scope.selfreservation.length > 0)
                {
                    return false;
                }

                if(parseInt($scope.selfreservation.indexOf(reservationId)) == -1)
                {
                    return false;
                }

                return true;
            }


        }]);