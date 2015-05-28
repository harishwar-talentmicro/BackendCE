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


            /* configration */
            var availabilityColor = 'rgb(142, 238, 255)';




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
            $scope.getTime = function (row,col)
            {
                /* return time in 30 mins interval */
                if(row % 6 != 0 && row != 0)
                {
                    return ;
                }

                /* get no. of minutes in day */
                var mins = row*5 + col*360;
                /* get time */
                var hours = Math.floor(mins/(60));
                var minutes = mins%60;
                minutes = minutes < 10?'0'+minutes:minutes;
                return (hours+':'+minutes);
            }

            /* get block id */
            $scope.getBlockId = function(row,col)
            {
                return 72*col+row;
            }

            /**
             * Working Hours[in minutes of the day]
             */
            $scope.workingHrs = [
                [540,840],
                [960,1200],
            ];

            /* color working hours */
            $scope.colorWorkingHours = function()
            {
                var workingHrs = $scope.workingHrs;
                /* traverse through the individual time slot and color them */
                for(var i=0; i < workingHrs.length; i++)
                {
                    var startTimeMins = workingHrs[i][0];
                    var endTimeMins = workingHrs[i][1];

                    /* identify the block id which comes in range */
                    var startRange = startTimeMins/5;
                    var endRange = (endTimeMins/5);

                    /* color all the blocks */
                    for(var j=startRange;j< endRange;j++)
                    {
                        $('.block-'+j).css('background-color',availabilityColor);
                    }
                }
            };


        }]);