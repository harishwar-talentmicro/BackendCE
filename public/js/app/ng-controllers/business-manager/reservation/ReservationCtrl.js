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
                [540, 840],
                [960, 1200]
            ];

            /* Reserved hours *///[Start Minute, End Minute, Reserver Name, Reserver ID, services, status]
            $scope.reservedTime = [
                [550, 600, 'sandeep',3,'service1'],
                [700, 810, 'rahul',12,'service2'],
                [1000, 1140, 'shrey',5,'service3']
            ];
            /* Set the logged in user */
            $scope.loggedInUid = 12;

            /* Flag for resources */
            $scope.isResource = true;

            /* resources array */
            $scope.resources = [];//FORMAT: 'tid':1,'title':'Dr. Meet','status':1

            /* active resource id */
            $scope.activeResourceId = '';

            /* set the date for which calendar is shown */
            $scope.activeDate = moment().format('DD-MM-YYYY');

            /* SETTINGS ENDS HERE======================================== */

            /* All the set color's INDEX with their title */
            $scope.colorIndex = [
                [availabilityColor,'Available'],
                [reservedColorArray[0],'Reserved'],
                [selfReservedColor,'Your Appointment'],
            ];

            /* Flag status for opening or close modal box */
            $scope.modalVisible = false;

            ///////////////////////////////////////GET DEFAULT CALENDAR/////////////////////////////////////////////////
            $scope.searchedEzeid = 'krunalpaid';

            getResource($scope.searchedEzeid);
            /**
             * Get resources of this EZE ID
             * @param ezeid of the searched org.
             */
            function getResource(ezeid)
            {
                $http({
                    url : GURL + 'reservation_resource',
                    method : "GET",
                    params :{
                        ezeid : ezeid,
                        Token : $rootScope._userInfo.Token
                    }
                }).success(function(resp){

                    $scope.$emit('$preLoaderStop');
                    if(resp.data.length>0)
                    {
                        createResourceArray(resp.data);
                    }
                }).error(function(err){
                    $scope.$emit('$preLoaderStop');
                    Notification.error({ message: "Something went wrong! Check your connection", delay: MsgDelay });
                });
            }

            /**
             * Create the resource array for Front End
             * @param array from HTTP request
             */
            function createResourceArray(array)
            {
                var tempArr = [];
                $scope.resources = [];
                for(var obj in array)
                {
                    if($scope.activeResourceId == '')
                    {
                        $scope.activeResourceId = array[obj].tid;
                    }
                    tempArr =
                    {
                        'tid' : array[obj].tid,
                        'title' : array[obj].title,
                        'status' : array[obj].status,
                        'description':array[obj].description
                    };
                    $scope.resources.push(tempArr);

                }
            }


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////



            /**
             * All HTTP request goes here -----------------------
             * @returns {string}
             */


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
                return $scope.convertTime(mins);
            }

            /* get block id */
            $scope.getBlockId = function (row, col) {
                return 72 * col + row;
            }

            /* color working hours */
            $scope.colorWorkingHours = function () {

                var workingHrs = $scope.workingHrs;
                /* traverse through the individual time slot and color them */
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

            /* color already reserved time */
            /**
             * iDEA:
             * 1. Get the time range
             * 2. Traverse through the reserved time-slot array
             * 2a...Get the block id which falls under the present range
             * 2b...Call mergeBlockMaster to merge and also write text
             */
            $scope.alreadyReserveSlot = function () {
                for (var i = 0; i < $scope.reservedTime.length; i++) {
                    /* get blocks coming under this range */
                    var data = getBlockRange($scope.reservedTime[i][0], $scope.reservedTime[i][1]);
                    /* initiate merging process */
                    var text = $scope.getReservedBlockText($scope.loggedInUid,$scope.reservedTime[i][3],$scope.reservedTime[i][2]);
                    var color = $scope.getReservedBlockColor($scope.loggedInUid,$scope.reservedTime[i][3]);

                    // [1000, 1140, 'shrey',5,'service3']
                    var title = $scope.getTitleText($scope.loggedInUid,$scope.reservedTime[i][3],$scope.reservedTime[i][2]
                        ,$scope.reservedTime[i][0],$scope.reservedTime[i][1],$scope.reservedTime[i][4]);
                    $scope.mergeBlockMaster(data[0], data[1], text, $scope.height,color,title);
                    /* color the block */
                }
            };

            /**
             * Block Merging
             * ->increase the height of first block of range to complete range
             * ->fill the background color
             * ->hide all the other blocks in the range
             * ->write text
             */
            $scope.mergeBlockMaster = function (startBlock, endBlock, text, height,color,title) {
                var realRange = refineRange(startBlock, endBlock);
                for (var i = 0; i < realRange.length; i++) {
                    var startRange = realRange[i][0];
                    var endRange = realRange[i][1];
                    /* merge the cells */
                    mergeCells(startRange, endRange, text);
                    /* commence merging process */
                    $scope.colorBlocks(startRange, endRange, color);
                    /* add a flag to the first block for making it reserved */
                    $('.block-'+startRange).addClass('reserved').attr('title',title);
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
                $('.block-'+startBlock).css('padding-top',(totalHeight/2.3)+'em');

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
                return text+' for '+service+' ('+$scope.convertTime(startTime)+' - '+$scope.convertTime(endTime)+')';
            }

            /**
             * Convert to minutes to time
             */
            $scope.convertTime = function(mins)
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

            ////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////
            //////////////////////////FUNCTIONALITIES & EVENTS//////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////

            /**
             * On Click event handler for whole of the reservation module
             */
            $scope.reservationClickEventHandler = function (blockId)
            {
                /* check if the block is already reserved */
                var isReserved = $('.block-'+blockId).hasClass('reserved');
                var isAvailable = $('.block-'+blockId).hasClass('available');
                changeModalTitle(isReserved);
                /* show error if the working hour is not in working hour */
                if(isReserved || isAvailable)
                {
                    $scope.modalVisibility();
                }
                else
                {
                    Notification.error({ message: "You can't make a reservation in non-working hours", delay: MsgDelay });
                }

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
                class: 'business-manager-modal'
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
            $scope.currentDateTime = moment().format('DD-MM-YYYY');
            $scope.$watch('currentDateTime',function(newVal,oldVal){
                if(oldVal !== newVal){
                    $scope.activeDate = moment(newVal).format('DD-MM-YYYY');
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
                /* reload calendar */
                $scope.reloadCalander();
            }

            /**
             * Reload the calendar with new working hours and
             */
            $scope.reloadCalander = function()
            {
                var tid = $scope.activeResourceId;
                var date = $scope.activeDate;
                /* http request for getting the new calendar data */
            }

        }]);