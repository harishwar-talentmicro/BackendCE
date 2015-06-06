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
            $document
        ) {


            /* SETTINGS GOES HERE======================================== */

            /* for resources availability background color */
            var availabilityColor = 'rgb(64, 242, 168)';

            /* color array for already reserved time slot */
            var reservedColorArray = ['rgb(255, 163, 73)'];

            /* self reserved color */
            var selfReservedColor = 'rgb(250, 253, 117)';

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
            $scope.reservedTime = [
                //[550, 600, 'sandeep',3,'service1'],
                //[700, 810, 'rahul',12,'service2'],
                //[1000, 1140, 'shrey',5,'service3']
            ];
            /* Set the logged in user */
            $scope.loggedInUid = 12;

            /* Flag for resources */
            $scope.isResource = true;

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

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////GET DEFAULT CALENDAR DATA////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            $scope.searchedEzeid = 'krunalpaid';



            getResource($scope.searchedEzeid).then(function () {
                getServicesData($scope.searchedEzeid).then(function () {
                    getServiceResourceMapping($scope.searchedEzeid).then(function () {
                        setFinalMappedServices(6);
                        var date = moment().format('DD MMM YYYY h:mm:ss a');
                        getReservationTransactionData($scope.activeResourceId, date, $scope.searchedEzeid).then(function () {
                        });
                    });
                });
            });


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
                        Token: $rootScope._userInfo.Token
                    }
                }).success(function (resp) {

                    $scope.$emit('$preLoaderStop');
                    if (resp.data.length > 0) {
                        setResources(resp.data);
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
             * Create the resource array for Front End
             * @param array from HTTP request
             */
            function setResources(array) {
                var tempArr = [];
                $scope.resources = [];
                for (var obj in array) {
                    $scope.isNoResource = true;
                    if ($scope.activeResourceId == '') {
                        $scope.activeResourceId = array[obj].tid;
                    }
                    tempArr =
                    {
                        'tid': array[obj].tid,
                        'title': array[obj].title,
                        'status': array[obj].status,
                        'description': array[obj].description
                    };
                    $scope.resources.push(tempArr);

                }
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
                    if (resp.data.length > 0) {
                        setAllServices(resp.data);
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
                    if (resp.data.length > 0) {
                        setMappedServices(resp.data);
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

                var x = new Date(timeFromServer);
                var mom1 = moment(x);
                return mom1.add((mom1.utcOffset()), 'm').format(returnFormat);
            };

            function selectedTimeUtcToLocal(selectedTime) {
                var x = new Date();
                var today = moment(x.toISOString()).utc().format('DD-MMM-YYYY');

                var currentTaskDate = moment(today + ' ' + selectedTime).format('DD-MMM-YYYY H:mm');
                return convertTimeToLocal(currentTaskDate, 'DD-MMM-YYYY H:mm', "H:mm");
            }


            function getFormatedTransactionData(_data) {
                var formatedData = [];
                var reserved = [];

                for (var nCount = 0; nCount < _data.data.length; nCount++) {
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
                    formatedData['working'] = times;
                    formatedData['reserved'] = reserved;
                }

                /* put the formatted service in the scope variables */
                $scope.workingHrs = [
                    [convertHoursToMinutes(formatedData['working'][0]), convertHoursToMinutes(formatedData['working'][1])],
                    [convertHoursToMinutes(formatedData['working'][2]), convertHoursToMinutes(formatedData['working'][3])]
                ];

                /* put reserver data scope */
                $scope.reservedTime = [
                    //[550, 600, 'sandeep', 3, 'service1'],
                    //[700, 810, 'rahul', 12, 'service2'],
                    //[1000, 1140, 'shrey', 5, 'service3']
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
                $scope.alreadyReserveSlot();
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

            /* color WORKING hours */
            $scope.colorWorkingHours = function () {
                var workingHrs = $scope.workingHrs;

                /* RESET CALENDAR */////////////////////////////////////////////////////////
                /* clean the calendar's working hour */
                $('.available').removeAttr('style').removeClass('available').attr('title');
                /* clear all text */
                $('.reserved').html('').removeAttr('style');
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
            };

            /**
             * Remove merging from blocks
             */
            function removeMerge()
            {
                $('.blk-content').removeClass('hidden');
            }

            /* color already reserved time */
            /**
             * iDEA:
             * 1. Get the time range
             * 2. Traverse through the reserved time-slot array
             * 2a...Get the block id which falls under the present range
             * 2b...Call mergeBlockMaster to merge and also write text
             */
            $scope.alreadyReserveSlot = function () {
                /* clear the title */
                $('.reserved').attr('title','');
                for (var i = 0; i < $scope.reservedTime.length; i++) {
                    /* get blocks coming under this range */
                    var data = getBlockRange($scope.reservedTime[i][0], $scope.reservedTime[i][1]);
                    /* initiate merging process */
                    var text = $scope.getReservedBlockText($scope.loggedInUid,$scope.reservedTime[i][3],$scope.reservedTime[i][2]);
                    var color = $scope.getReservedBlockColor($scope.loggedInUid,$scope.reservedTime[i][3]);

                    var title = $scope.getTitleText($scope.loggedInUid,$scope.reservedTime[i][3],$scope.reservedTime[i][2]
                        ,$scope.reservedTime[i][0],$scope.reservedTime[i][1],$scope.reservedTime[i][4]);
                    var tid = $scope.reservedTime[i][6];
                    $scope.mergeBlockMaster(data[0], data[1], text, $scope.height,color,title,tid);
                    /* color the block */
                    console.log($scope.reservedTime);
                }
            };

            /**
             * reset title of reserved status
             */
            function resetReservedBlockTitle()
            {

            }


            /**
             * Block Merging
             * ->increase the height of first block of range to complete range
             * ->fill the background color
             * ->hide all the other blocks in the range
             * ->write text
             */
            $scope.mergeBlockMaster = function (startBlock, endBlock, text, height,color,title,tid) {
                var realRange = refineRange(startBlock, endBlock);
                for (var i = 0; i < realRange.length; i++) {
                    var startRange = realRange[i][0];
                    var endRange = realRange[i][1];
                    /* merge the cells */
                    mergeCells(startRange, endRange, text);
                    /* commence merging process */
                    $scope.colorBlocks(startRange, endRange, color);
                    /* add a flag to the first block for making it reserved */
                    $('.block-'+startRange).addClass('reserved').attr('title',title).attr('data-tid',tid);
                }
            }

            /* Actual merging goes HERE */
            function mergeCells(startBlock, endBlock, text) {
                /* calculate total height  */
                var totalHeight = endBlock - startBlock + 1;
                /* increase the first block's height to totalHeight */
                $('.block-' + startBlock).css('height', $scope.height * totalHeight + 'em');
                /* add text */
                $('.block-' + startBlock).html('<p>' + text + '</p>');
                /* add padding to the text to make it in center */
                //$('.block-'+startBlock).css('padding-top',(totalHeight/2.3)+'em');

                /* hide the remaining block */
                for (var i = startBlock + 1; i <= endBlock; i++) {
                    $('.block-' + i).addClass('hidden');
                }
            }

            /* partition the block range based on 4 different time of day: i.e early,morning,evening,night */
            function refineRange(startRange, endRange) {
                var endBlockArray = [71, 143, 215, 287];
                var data = [];
                var flag = false;
                for (var i = 0; i < endBlockArray.length; i++) {
                    if (endBlockArray[i] > startRange && endBlockArray[i] < endRange) {
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
                    $('.block-' + j).css('background-color', color).addClass(css);
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
             * Append the color index at the bottom
             */
            $scope.appendColorIndex = function() {
                for (var i = 0; i < $scope.colorIndex.length; i++)
                {
                    $('.color-index-'+i).css('color',$scope.colorIndex[i][0]);
                    $('.color-index-label-'+i).html('<small>'+$scope.colorIndex[i][1]+'</small>');
                }
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
                if(isReserved || isAvailable)
                {
                    if(!$scope.currentServiceArray.length > 0)
                    {
                        Notification.error({ message: "No Services available for this resource!", delay: MsgDelay });
                        return;
                    }
                    $scope.clickedBlockId = blockId;
                    $scope.startTime = convertBlockIdToTime(blockId);
                    $scope.currentBlockMinute = convertBlockIdToMinute(blockId);
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
                        $scope.reservationService = resp.data[0].serviceids;
                        $scope.startTime = selectedTimeUtcToLocal(resp.data[0].Starttime).substr(0,5);
                        $scope.duration = resp.data[0].duration;
                        $scope.endTime = convertBlockIdToTime((convertHoursToMinutes($scope.startTime) + $scope.duration)/5);
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
                    $scope.reloadCalander();
                }
            });


            /**
             * onChange - reload the working hours and reserved our
             * Activate the button of this resource and inactive others
             * @param tid of the clicked resource
             */
            $scope.activateResource = function(tid)
            {
                $scope.activeResourceId = tid;
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
                /* http request for getting the new calendar data */
                getReservationTransactionData($scope.activeResourceId,$scope.activeDate,$scope.searchedEzeid);
                /* recolor working hours */
                $scope.colorWorkingHours();
                /* color reserved hours */

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
                var tid = 0;
                var blockId = 0;
                if($scope.modal.isUpdate)
                {
                    /* get TID */
                    var minutes = convertHoursToMinutes($scope.startTime);
                    blockId = minutes/5;
                    tid = $('.block-'+blockId).data('tid');
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
                        contactinfo:$('#userMobile').val(),
                        toEzeid:$scope.searchedEzeid,
                        resourceid:$scope.activeResourceId,
                        res_datetime:convertTimeToUTC(makeDateTime,'DD-MMM-YYYY hh:mm'),
                        duration:$scope.duration,
                        status:0,
                        serviceid:$('#service').val()+','
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
                    }
                    else
                    {
                        Notification.error({ message: "Unable to save the reservation, please try again later", delay: MsgDelay });
                    }
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                });
            }

            /**
             * Reload reservation Hours
             */
            function updateReservationHoursBlocks(blockId)
            {
                /* clean the old div [clear title,put the available color] */
                $('.block-'+blockId).attr('title','').css('background-color',availabilityColor);
                /* color working hours */
                //$scope.colorWorkingHours();
                /* relaod calendar */
                $scope.reloadCalander();
            }
        }]);