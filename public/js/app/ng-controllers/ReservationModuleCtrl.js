/**
 * Controller to manage all the functionalities in RESERVATION-MODULE
 *
 * @author: Sandeep[EZE ID]
 * @since 20150527
 */
var res = angular.module('ezeidApp').
    controller('ReservationModuleCtrl', [
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
            var availabilityColor = 'rgb(142, 238, 255)';

            /* color array for already reserved time slot */
            var reservedColorArray = ['#99b433','#ff0097','#9f00a7','#00aba9','#2d89ef','#2b5797','#b91d47'];

            /* default height of the block in 'em' */
            var defaultHeightClass = 'blk-1-1';//default height class::||Don't Change||
            $scope.height = 1.1;//default height::||Don't Change||

            var proposedHeight = '1.1';//choose between 0.6em and 2.2em in multiple of 0.2: i.e [1.2,1.4,1.8,2.2...etc.]

            /**
             * Working Hours[in minutes of the day]
             */
            $scope.workingHrs = [
                [540, 840],
                [960, 1200],
            ];

            /* Reserved hours */
            $scope.reservedTime = [
                [550, 600, 'sandeep'],
                [700, 810, 'rahul'],
                [1000, 1140, 'shrey'],
            ];

            /* SETTINGS ENDS HERE======================================== */
            /////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////
            ///////////////DONT EDIT BELOW THIS BOX//////////////////
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
            $scope.getTime = function (row, col) {
                /* return time in 30 mins interval */
                if (row % 6 != 0 && row != 0) {
                    return;
                }

                /* get no. of minutes in day */
                var mins = row * 5 + col * 360;
                /* get time */
                var hours = Math.floor(mins / (60));
                var minutes = mins % 60;
                minutes = minutes < 10 ? '0' + minutes : minutes;
                return (hours + ':' + minutes);
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
                    var data = getBlockRange(startTimeMins,endTimeMins);
                    var startRange = data[0];
                    var endRange = data[1] - 1;//As we don't want last block to be filled

                    /* color all the blocks */
                    $scope.colorBlocks(startRange, endRange, availabilityColor);
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
                    var data = getBlockRange($scope.reservedTime[i][0],$scope.reservedTime[i][1]);
                    /* initiate merging process */
                    $scope.mergeBlockMaster(data[0],data[1],$scope.reservedTime[i][2],$scope.height);
                    /* color the block */
                    /* add the text */
                }
            };

            /**
             * Block Merging
             * ->increase the height of first block of range to complete range
             * ->fill the background color
             * ->hide all the other blocks in the range
             * ->write text
             */
            $scope.mergeBlockMaster = function (startBlock, endBlock, text, height) {
                var realRange = refineRange(startBlock,endBlock);
                var color = $scope.randomColor();
                for(var i=0;i<realRange.length;i++)
                {
                    var startRange = realRange[i][0];
                    var endRange = realRange[i][1];
                    /* commence merging process */
                    $scope.colorBlocks(startRange,endRange,color);
                }
            }

            /* partition the block range based on 4 different time of day: i.e early,morning,evening,night */
            function refineRange(startRange,endRange)
            {
                var endBlockArray = [71,143,215,287];
                var data = [];
                var flag = false;
                for(var i=0;i<endBlockArray.length;i++)
                {
                    if(endBlockArray[i] > startRange && endBlockArray[i] < endRange)
                    {
                        data.push([startRange,endBlockArray[i]]);
                        startRange = endBlockArray[i] + 1;
                        flag = true;
                    }
                    else if(flag)
                    {
                        data.push([startRange,endRange - 1]);
                        break;
                    }
                }

                /* in case it don't touches any of the edges */
                if(data.length == 0)
                {
                    return [[startRange,(endRange-1)]];
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
            function getBlockRange(startRange,endRange)
            {
                var data = [];
                data.push(startRange/5);
                data.push(endRange/5);
                return data;
            };

            /* Color the blocks */
            $scope.colorBlocks = function(startBlock,endBlock,color)
            {
                for(var j=startBlock;j<=endBlock;j++)
                {
                    $('.block-'+j).css('background-color',color);
                }
            }

            var getRandomNumber = function(len)
            {
                return Math.floor(Math.random() * len);
            };

            /* select random color */
            $scope.randomColor = function(){
                var num = getRandomNumber(reservedColorArray.length);
                return reservedColorArray[num];
            }

        }]);