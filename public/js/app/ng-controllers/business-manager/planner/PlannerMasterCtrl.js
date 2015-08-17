/**
 * calendarDemoApp - 0.9.0
 */
angular.module('ezeidApp').controller('PlannerMasterCtrl',[
    '$scope',
    '$compile',
    'uiCalendarConfig',
    '$http',
    '$timeout',
    'GURL',
    '$rootScope',
    '$q',
    'Notification',
    'MsgDelay',
    '$log',
    'UtilityService',
    function($scope,
             $compile,
             uiCalendarConfig,
             $http,
             $timeout,
             GURL,
             $rootScope,
             $q,
             Notification,
             MsgDelay,
             $log,
             UtilityService
    ) {


    // Start Time
    var sTime = moment().format('YYYY-MM-DD HH:mm:ss');
    // End Time
    var eTime = moment().format('YYYY-MM-DD HH:mm:ss');

    $scope.alertEventOnClick = function(){
        console.log('Hello event clicked');
    };
    $scope.alertOnDrop = function(){
        console.log('Event dropped');
    };
    $scope.alertOnResize = function(){
        console.log('Event resized');
    };


    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    $scope.eventsList =  [
        {title: 'All Day Event',start: new Date(y, m, 1)},
        {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
        {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
        {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
        {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
        {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
    ];

    /* event source that calls a function on every view switch */
    $scope.eventsF = function (start, end, timezone, callback) {
        //var s = new Date(start).getTime() / 1000;
        //var e = new Date(end).getTime() / 1000;
        //var m = new Date(start).getMonth();
        //var events = [{title: 'Feed Me ' + m,start: s + (50000),end: s + (100000),allDay: false, className: ['customFeed']}];
        //callback(events);
    };


    /* Render Tooltip */
    $scope.eventRender = function( event, element, view ) {
        element.attr({'tooltip': event.title,
            'tooltip-append-to-body': true});
        $compile(element)($scope);
    };

    $scope.eventSources = [$scope.eventsList];


    /* Change View */
    $scope.renderCalender = function(calendar) {
        if(uiCalendarConfig.calendars[calendar]){
            uiCalendarConfig.calendars[calendar].fullCalendar('render');
        }
    };
    /* Change View */
    $scope.changeView = function(view,calendar) {
        uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
    };



    /**
     * Basic Configuration for Calendar Control
     * @type {{calendar: {height: number, editable: boolean, header: {left: string, center: string, right: string}, dayClick: (Function|*), eventDrop: (Function|*), eventResize: (Function|*)}}}
     */
    $scope.uiConfig = {
        calendar:{
            height: 450,
            editable: false,
            header:{
                left: '',
                center: 'title',
                right: 'prev,next'
            },
            defaultView : 'agendaDay',
            dayClick: $scope.alertEventOnClick,
            eventClick : $scope.alertEventOnClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize,
            viewRender : function(view,elem){
                //console.log(view);
                //$log.debug("View Changed: ", view.visStart, view.visEnd, view.start, view.end);

                console.log(view.start);
                console.log(view.end);
                sTime = view.start.format('YYYY-MM-DD HH:mm:ss');
                eTime = view.end.format('YYYY-MM-DD HH:mm:ss');
                $scope.loadNextActionList();
            }
        }
    };


    /**
     * Next Actions Loaded from server
     * @type {Array}
     */
    $scope.nextActionList = [];

    $scope.loadNextActionList = function(){
        $http({
            url : GURL + 'tasks',
            method : 'GET',
            params : {
                s_time : UtilityService._convertTimeToServer(sTime,'YYYY-MM-DD HH:mm:ss','YYYY-MM-DD HH:mm:ss'),
                e_time : UtilityService._convertTimeToServer(eTime,'YYYY-MM-DD HH:mm:ss','YYYY-MM-DD HH:mm:ss'),
                token : $rootScope._userInfo.Token
            }
        }).success(function(resp){
            if(resp){
                if(resp.status){
                    if(resp.data){
                        console.log(resp.data);
                        if(resp.data.tasks){
                            for(var i=0; i < resp.data.tasks.length; i++){
                                var nextAction = {
                                    title : resp.data.tasks[i].ts_t,
                                    start : moment(
                                        UtilityService._convertTimeToLocal(resp.data.tasks[i].ts,
                                            'DD-MMM-YYYY hh:mm:ss A','YYYY-MM-DD HH:mm:ss'),'YYYY-MM-DD HH:mm:ss'),
                                    end : moment(
                                        UtilityService._convertTimeToLocal(resp.data.tasks[i].ts,
                                            'DD-MMM-YYYY hh:mm:ss A','YYYY-MM-DD HH:mm:ss'),'YYYY-MM-DD HH:mm:ss').add(15,'m'),
                                    allDay : false
                                };
                                $scope.nextActionList.push(nextAction);
                            }
                        }
                    }
                }
            }
        }).error(function(err,statusCode){
           if(!statusCode){
               Notification.error({ title : 'Connection Lost', message : 'Please check you internet connection', delay : MsgDelay});
           }
           else{
               Notification.error({ title : 'Error', message : 'An error occurred ! Please try again', delay : MsgDelay});
           }
        });
    };


}]);

