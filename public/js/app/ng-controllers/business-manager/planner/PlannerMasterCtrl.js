/**
 * calendarDemoApp - 0.9.0
 */
angular.module('ezeidApp').controller('PlannerMasterCtrl',['$scope','$compile','uiCalendarConfig',function($scope,$compile,uiCalendarConfig) {

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
        var s = new Date(start).getTime() / 1000;
        var e = new Date(end).getTime() / 1000;
        var m = new Date(start).getMonth();
        var events = [{title: 'Feed Me ' + m,start: s + (50000),end: s + (100000),allDay: false, className: ['customFeed']}];
        callback(events);
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
            dayClick: $scope.alertEventOnClick,
            eventClick : $scope.alertEventOnClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize
        }
    };
}]);

