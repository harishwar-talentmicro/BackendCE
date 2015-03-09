(function () {
    var ezeid = angular.module('ezeidApp',
        ['ngHeader','ngRoute', 'ngFooter', 'ui-notification', 'imageupload','angularjs-dropdown-multiselect','smart-table']);

    ezeid.value('MsgDelay',2000);
    //HTTP Interceptor for detecting token expiry
    //Reloads the whole page in case of Unauthorized response from api
    ezeid.factory('ezeidInterceptor',['$rootScope','$timeout',function($rootScope,$timeout){
        return {
            responseError : function(respErr){
                if(respErr.status == 401 && respErr.statusText == 'Unauthorized'){
                    try{
                    localStorage.removeItem("_token");
                    }
                    catch(ex)
                    {
                            
                    }
                    $rootScope._userInfo = null;
                    $rootScope.IsIdAvailable = false;
//                    Notification.error({message:'Your session has expired! Please login to continue',delay:4000});
                    $timeout(function(){
                        //Reloading page on token expiry                    
                        window.location.reload(true);
                        
                    },3000);
                }
            }
        };
    }]);


    ezeid.config(['$routeProvider','$httpProvider',function($routeProvider,$httpProvider){
        $routeProvider.when('/index',{templateUrl: 'html/index.html'})
            .when('/home',{templateUrl: 'html/home.html'})
            .when('/messages',{templateUrl: 'html/messages.html'})
            .when('/acchist',{templateUrl: 'html/accesshistory.html'})
            .when('/editprofile',{templateUrl: 'html/signupwiz.html'})
            .when('/addloc',{templateUrl: 'html/addlocations.html'})
            .when('/attachcv',{templateUrl: 'html/attachcv.html'})
            .when('/busslist',{templateUrl: 'html/businesslist.html'})
            .when('/documents',{templateUrl: 'html/documents.html'})
            .when('/terms',{templateUrl: 'html/terms.html'})
            .when('/help',{templateUrl: 'html/help.html'})
            .when('/legal',{templateUrl: 'html/legal.html'})
            .when('/congratulations',{templateUrl: 'html/congratulations.html'})
            .when('/blackwhitelist',{templateUrl: 'html/blacklistwhitelist.html'})
            .when('/salesenquiry',{templateUrl: 'html/salesenquiry.html'})
            .when('/subusers',{templateUrl : 'html/subusers.html'})
            .when('/business-preference',{templateUrl : 'html/business-preference.html'})
            .otherwise({ templateUrl: 'html/home.html' });
        
        $httpProvider.interceptors.push("ezeidInterceptor");
    }]);

    var GURL = '/';
    //http://10.0.100.103:8084/';

    var MsgDelay = 2000;

    /**
     * Number only directive (allows only number for input fields)
     */
    ezeid.directive('numbersOnly', function(){
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, modelCtrl) {
                modelCtrl.$parsers.push(function (inputValue) {
                    // this next if is necessary for when using ng-required on your input.
                    // In such cases, when a letter is typed first, this parser will be called
                    // again, and the 2nd time, the value will be undefined
                    if (inputValue == undefined) return ''
                    var transformedInput = inputValue.replace(/[^0-9]/g, '');
                    if (transformedInput!=inputValue) {
                        modelCtrl.$setViewValue(transformedInput);
                        modelCtrl.$render();
                    }

                    return transformedInput;
                });
            }
        };
    });
    /**
     * Directive to capitalize the input field
     */
    ezeid.directive('capitalize', function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, modelCtrl) {
                var capitalize = function(inputValue) {
                    if(inputValue == undefined) inputValue = '';
                    var capitalized = inputValue.toUpperCase();
                    if(capitalized !== inputValue) {
                        modelCtrl.$setViewValue(capitalized);
                        modelCtrl.$render();
                    }
                    return capitalized;
                }
                modelCtrl.$parsers.push(capitalize);
                capitalize(scope[attrs.ngModel]);  // capitalize initial value
            }
        };
    });
    /**
     * Directive for binding of bootstrap javascript popover and tooltip methods
     */
    ezeid.directive('toggle', function(){
        return {
            restrict: 'A',
            link: function(scope, element, attrs){
                if (attrs.toggle=="tooltip"){
                    $(element).tooltip({
                        html : attrs.title
                    });
                }
                if (attrs.toggle=="popover"){
                    $(element).popover({
                        html : true,
                        animation : true
                    });
                }
                if(attrs.toggle == "tab"){
                    $(element).on('shown.bs.tab', function (e) {
                        e.target // newly activated tab
                        e.relatedTarget // previous active tab
                    })
                }
                $(element).on('show.bs.popover',function(){
                    $('*[data-toggle="popover"]').not(this).popover('hide');
                });
            }
        };
    });

    /**
     * Directive for using modal box bootstrap
     */
    ezeid.directive('modal', function () {
        return {
            template: '<div class="modal fade">' +
                '<div class="modal-dialog modal-lg">' +
                '<div class="modal-content">' +
                '<span class="closelink" data-dismiss="modal" aria-hidden="true">X</span>'+
                '<div class="modal-header">' +
//                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                '<h4 class="modal-title text-center">{{ mtitle }}</h4>' +
                '</div>' +
                '<div class="modal-body" ng-transclude></div>' +
                '</div>' +
                '</div>' +
                '</div>',
            restrict: 'E',
            transclude: true,
            replace:true,
            scope:true,
            link: function postLink(scope, element, attrs) {
                scope.mtitle = attrs.mtitle;
                scope.$watch(attrs.visible, function(value){
                    if(value == true)
                        $(element).modal('show');
                    else
                        $(element).modal('hide');
                });
                scope.$watch(attrs.mtitle,function(value){
                    scope.mtitle = value;
                });

                $(element).on('shown.bs.modal', function(){
                    scope.$apply(function(){
                        scope.$parent[attrs.visible] = true;
                    });
                });

                $(element).on('hidden.bs.modal', function(){
                    scope.$apply(function(){
                        scope.$parent[attrs.visible] = false;
                    });
                });
            }
        };
    });

    /**
     * Filter for grouping Business Rules Based upon thier functions(types: Sales, Reservation,HomeDelivery,Service, Resume)
     * Usage (ruleList | ruleFilter:2)
     */
    ezeid.filter('ruleFilter',function(){
        return function(rules,ruleType){
            var filteredRules = [];
            rules.forEach(function(rule,index){
                for(var prop in rule){
                    if(rule.hasOwnProperty(prop) && (prop == 'RuleFunction') && (rule.RuleFunction === ruleType)){
                        filteredRules.push(rule);
                    }
                }
            });

            return filteredRules;
        };
    });

    ezeid.directive('dateTimePicker', function() {
            return {
                restrict: 'E',
                replace: true,
                require : '?ngModel',
                scope: {
                    recipient: '='
                },
                template:
                    '<div class="input-group datetimepicker">'+
                        '<input type="text" class="form-control" placeholder="Date"  id="datetimepicker1"  name="recipientDateTime" />'+
                        '<span class="input-group-addon"><span class="glyphicon glyphicon-calendar" >'+
                        '</span>'+
                    '</div>',
                link: function(scope, element, attrs, ngModel) {
                var input = element.find('input');
                input.bind('blur change keyup keypress',function(){
                    scope.recipient = input.val();
                    scope.$apply();
                });

                scope.$watch('recipient',function(newVal,oldVal){
                    $(input[0]).val(newVal);
                });
            }
        }
    });

    //Directives for plus/minus control
    ezeid.directive('counter', function() {
        return {
            restrict: 'A',
            scope: { value: '=value' },
            template: '<a href="javascript:;" class="counter-minus" ng-click="minus()">-</a>\
                  <input type="text" class="counter-field" ng-model="value" ng-change="changed()" ng-readonly="readonly">\
                  <a  href="javascript:;" class="counter-plus" ng-click="plus()">+</a>',
            link: function( scope , element , attributes ) {
                // Make sure the value attribute is not missing.
                if ( angular.isUndefined(scope.value) ) {
                    throw "Missing the value attribute on the counter directive.";
                }

                var min = angular.isUndefined(attributes.min) ? null : parseInt(attributes.min);
                var max = angular.isUndefined(attributes.max) ? null : parseInt(attributes.max);
                var step = angular.isUndefined(attributes.step) ? 1 : parseInt(attributes.step);

                element.addClass('counter-container');

                // If the 'editable' attribute is set, we will make the field editable.
                scope.readonly = angular.isUndefined(attributes.editable) ? true : false;

                /**
                 * Sets the value as an integer.
                 */
                var setValue = function( val ) {
                    scope.value = parseInt( val );
                }

                // Set the value initially, as an integer.
                setValue( scope.value );

                /**
                 * Decrement the value and make sure we stay within the limits, if defined.
                 */
                scope.minus = function() {
                    if ( min && (scope.value <= min || scope.value - step <= min) || min === 0 && scope.value < 1 ) {
                        setValue( min );
                        return false;
                    }
                    setValue( scope.value - step );
                };

                /**
                 * Increment the value and make sure we stay within the limits, if defined.
                 */
                scope.plus = function() {
                    if ( max && (scope.value >= max || scope.value + step >= max) ) {
                        setValue( max );
                        return false;
                    }
                    setValue( scope.value + step );
                };

                /**
                 * This is only triggered when the field is manually edited by the user.
                 * Where we can perform some validation and make sure that they enter the
                 * correct values from within the restrictions.
                 */
                scope.changed = function() {
                    // If the user decides to delete the number, we will set it to 0.
                    if ( !scope.value ) setValue( 0 );

                    // Check if what's typed is numeric or if it has any letters.
                    if ( /[0-9]/.test(scope.value) ) {
                        setValue( scope.value );
                    }
                    else {
                        setValue( scope.min );
                    }

                    // If a minimum is set, let's make sure we're within the limit.
                    if ( min && (scope.value <= min || scope.value - step <= min) ) {
                        setValue( min );
                        return false;
                    }

                    // If a maximum is set, let's make sure we're within the limit.
                    if ( max && (scope.value >= max || scope.value + step >= max) ) {
                        setValue( max );
                        return false;
                    }

                    // Re-set the value as an integer.
                    setValue( scope.value );
                };
            }
        }
    });



    ezeid.controller('SampleWizardController', function($scope, $q, $timeout) {
            $scope.user = {};

            $scope.saveState = function() {
                var deferred = $q.defer();

                $timeout(function() {
                    deferred.resolve();
                }, 5000);

                return deferred.promise;
            };

            $scope.completeWizard = function() {
                alert('Completed!');
            }
        });

    //Global Controller
    ezeid.controller('HomeController', function ($rootScope, $http,$scope) {
           $rootScope.CLoc = {
            CLat: 12.295810,
            CLong: 76.639381
        };

        if ($rootScope._userInfo) {

        }
        else {
            if (typeof (Storage) !== "undefined") {
                var encrypted = localStorage.getItem("_token");
                if (encrypted) {
                    var decrypted = CryptoJS.AES.decrypt(encrypted, "EZEID");
                    var Jsonstring = null;
                    try{
                        Jsonstring = decrypted.toString(CryptoJS.enc.Utf8);
                    }
                    catch(ex){}
                    if (Jsonstring) {
                        $rootScope._userInfo = JSON.parse(Jsonstring);
                    }
                }
                else {
                    $rootScope._userInfo = {
                        IsAuthenticate: false,
                        Token: '',
                        FirstName: '',
                        Type: '',
                        Icon: ''
                    };
                }
            } else {
                // Sorry! No Web Storage support..
                $rootScope._userInfo = {
                    IsAuthenticate: false,
                    Token: '',
                    FirstName: '',
                    Type: '',
                    Icon: ''
                };
                alert('Sorry..! Browser does not support');
                window.location.href = "#/";
            }
        }

        $('#datetimepicker1').datetimepicker({
           format: "d-M-Y  h:m A",
           hours12: false
        });
        $('#datetimepicker1').siblings('.input-group-addon').on('click',function(){
            $('#datetimepicker1').trigger('focus');
        });


        /**
         * Opens Help Popup when help link is clicked
         */
        $scope.openHelpPopup =function(){
            $('#Help_popup').css({'position':'fixed'});
            $('#Help_popup > div').css({'margin-top':'0%'});
            $('#Help_popup').slideDown();
        };
        $scope.closeHelpPopup =function(){
            $('#Help_popup').slideUp();
        }
    });


    // Search Controller
    ezeid.controller('SearchController', function ($http, $rootScope, $scope, $compile, $timeout, Notification, $filter, $location, $window, $q, $interval) {
        var map;
        var marker;
        var markers = [];
        
        var directionsDisplay;
        var directionsService = new google.maps.DirectionsService();
        var myinfowindow = new google.maps.InfoWindow({
            content: ''
        });
        var service;
        var x = new Date();
        var today = moment(x.toISOString()).utc().format('DD-MMM-YYYY hh:mm A');

        var currentBanner = 1;
        var Miliseconds = 8000;
        var RefreshTime = Miliseconds;
        var AutoRefresh = true;

        $('#datetimepicker1').datetimepicker({
            format: "d-M-Y  h:m A",
            hours12: false,
            minDate: 0
        });
        $('#datetimepicker1').siblings('.input-group-addon').on('click',function(){
            $('#datetimepicker1').trigger('focus');
        });

         $rootScope.$watch('_userInfo.IsAuthenticate',function(oldval,newval){
           try{
               for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
              }
           }
            catch(ex){}
        });

        function getQueryStringValue(key) {
            return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
        }

        var SearchSec = this;

        SearchSec.IsShowForm = false;
        SearchSec.IsFilterRowVisible = true;
        SearchSec.nextButton = true;
        SearchSec.previousButton =  true;
        SearchSec.categories = [];
        SearchSec.proximities = [];
        $scope.form_rating = 0;

        SearchSec.mInfo = {};
        SearchSec.Placeholder = 'Type EZEID';
        var userType = "";
        SearchSec.mInfo.InfoTab = true;
        $scope.showInfoTab = false;

        SearchSec.Criteria = {
            Token: '',
            SearchType: '1',
            Keywords: '',
            SCategory: 0,
            Proximity: 1,
            Latitude: $rootScope.CLoc.CLat,
            Longitude: $rootScope.CLoc.CLong
        };

        $scope.isMapLoaded = false;         //Set to true with map event 'idle'
        $scope.isMapReady = false;          //Set to true when map canvas is drawn and map is fully visible

        //new multi select
        $scope.ratingModel = [
            {
                "id": 1
            },
            {
                "id": 2
            },
            {
                "id": 3
            },
            {
                "id": 4
            },
            {
                "id": 5
            }
        ];

        $scope.ratingData = [
            {id: 1, label: "*", "assignable": true},
            {id: 2, label: "**", "assignable": true},
            {id: 3, label: "***", "assignable": true},
            {id: 4, label: "****", "assignable": true},
            {id: 5, label: "*****", "assignable": true}
        ];
        //================

        $scope.member = {roles: []};
        $scope.selected_items = [];

        function initialize () {
            //// Create the search box and link it to the UI element.

            directionsDisplay = new google.maps.DirectionsRenderer();
            var initialLocation;
            var currentLoc = new google.maps.LatLng(12.295810, 76.639381);
            map = new google.maps.Map(document.getElementById('map-canvasH'), {
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                Zoom: 15
            });
            $scope.gMap = map;
            var ClocBtn = (document.getElementById('mapClocH'));
            map.controls[google.maps.ControlPosition.TOP_RIGHT].push(ClocBtn)
            var input = /** @type {HTMLInputElement} */(document.getElementById('txtSearch'));
            map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

            /********** Google Maps autocomplete **************/
            var options = {
              types: ['establishment']
            };

            autocomplete = new google.maps.places.Autocomplete(input, options);
            google.maps.event.addListener(autocomplete,'place_changed',function(){
                var place = autocomplete.getPlace();
                $rootScope.CLoc.CLat = place.geometry.location.k;
                $rootScope.CLoc.CLong = place.geometry.location.D;
                var loc = new google.maps.LatLng($rootScope.CLoc.CLat, $rootScope.CLoc.CLong);
                PlaceCurrentLocationMarker(loc);
            });
            /********** Google Maps autocomplete ends *********/



            var searchBox = new google.maps.places.SearchBox(
    /** @type {HTMLInputElement} */(input));
            //directionsDisplay.setMap(map);
            // Try W3C Geolocation (Preferred)
            if (navigator.geolocation) {
                browserSupportFlag = true;
                navigator.geolocation.getCurrentPosition(FindCurrentLocation, function () {
                    handleNoGeolocation();
                });
            }
                // Browser doesn't support Geolocation
            else {
                handleNoGeolocation();
            }

            function handleNoGeolocation() {
                initialLocation = currentLoc;
                map.setCenter(initialLocation);
                PlaceCurrentLocationMarker(initialLocation);
                //PlaceMarker(initialLocation);
            }



            // Listen for the event fired when the user selects an item from the
            // pick list. Retrieve the matching places for that item.
            google.maps.event.addListener(searchBox, 'places_changed', function () {
                var places = searchBox.getPlaces();

                if (places.length == 0) {
                    return;
                }
                for (var i = 0, marker; marker = markers[i]; i++) {
                    marker.setMap(null);
                }

                // For each place, get the icon, place name, and location.
                markers = [];
                var bounds = new google.maps.LatLngBounds();
                if (places.length > 0) {
                    var place = places[0];
                    $rootScope.CLoc.CLat = place.geometry.location.k;
                    $rootScope.CLoc.CLong = place.geometry.location.D;
                    var loc = new google.maps.LatLng($rootScope.CLoc.CLat, $rootScope.CLoc.CLong);
                    PlaceCurrentLocationMarker(loc);
                }
            });

            // Bias the SearchBox results towards places that are within the bounds of the
            // current map's viewport.
            google.maps.event.addListener(map, 'bounds_changed', function () {
                var bounds = map.getBounds();
                searchBox.setBounds(bounds);
            });

            google.maps.event.addListenerOnce(map, 'idle', function () {

                $scope.isMapLoaded = true;
                $timeout(function(){
                    $scope.isMapReady = true;
                },2000);
                if(SearchSec.IsSearchPending){
                    SearchSec.getSearch();
                }
            });
            $(window).resize(function() {
                google.maps.event.trigger(map, "resize");
            });
        }
        google.maps.event.addDomListener(window, 'load', initialize);

        function PlaceCurrentLocationMarker(location) {
            if (marker != undefined) {
                marker.setMap(null);
            }
            map.setCenter(location);
            marker = new google.maps.Marker({
                position: location,
                title: "Current Location",
                draggable: true,
                map: map,
                icon: 'images/you_are_here.png'
            });
            google.maps.event.addListener(marker, 'dragend', function (e) {
                $rootScope.CLoc.CLat = marker.getPosition().k;
                $rootScope.CLoc.CLong = marker.getPosition().D;
                //getReverseGeocodingData(marker.getPosition().k, marker.getPosition().D);
//                myinfowindow.setContent('<h6>You are here</h6>');
                //myinfowindow.open(map, marker);
            });
        }
        this.getMyLocation = function () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(FindCurrentLocation);
            }
        };
        function FindCurrentLocation(position) {
            initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            $rootScope.CLoc = {
                CLat: position.coords.latitude,
                CLong: position.coords.longitude
            };
            PlaceCurrentLocationMarker(initialLocation);
        }
        function PlaceMarker(positions) {
            directionsDisplay.setMap(null);
            for (var i = 0, Cmarker; Cmarker = markers[i]; i++) {
                Cmarker.setMap(null);
            }
            markers = [];

            //Latitude Longitude list for setting up all markers in map display (setting bounds to display all markers in map)
            var latLngList = [];
            latLngList.push(new google.maps.LatLng($rootScope.CLoc.CLat, $rootScope.CLoc.CLong));
            if (positions != null) {
                for (var i = 0; i < positions.length; i++) {
                    var _item = positions[i];
                    var mapIcon;
                    mapIcon = '/images/Indi_user.png';
                    var businessIcon = 'images/business-icon_48.png';
                    var individualIcon = 'images/Individual-Icon_48.png';
                    var pos = new google.maps.LatLng(_item.Latitude, _item.Longitude);
                    //Pushing position of markers to fit in bounds
                    latLngList.push(pos);
                    var mTitle = (_item.IDTypeID == 2 && _item.CompanyName !== "")? _item.CompanyName : _item.Name;
                    var marker = new google.maps.Marker({
                        position: pos,
                        map: map,
//                        icon: (_item.Icon !== "") ? _item.Icon : mapIcon,
                        icon: (_item.IDTypeID == 2) ? businessIcon : individualIcon,
                        title: mTitle
                    });
//                    map.setCenter(pos);
                    var currentPos = google.maps.LatLng($rootScope.CLoc.CLat,$rootScope.CLoc.CLong);
                    map.setCenter(currentPos);

                    markers.push(marker);
                    google.maps.event.addListener(marker, 'click', (function (_item) {
                        return function () {
                            var sen = this;
                            $http({ method: 'get', url: GURL + 'ewtGetSearchInformation?Token=' + $rootScope._userInfo.Token + '&TID=' + _item.TID }).success(function (data) {
                                if (data != 'null') {
                                    $timeout(function () {
                                        SearchSec.mInfo = data[0];

                                        if (!/^(f|ht)tps?:\/\//i.test(data[0].Website)) {
                                            url = "http://" + data[0].Website;
                                            SearchSec.mInfo.Website = url;
                                        }

                                        $scope.showInfoTab = true;
                                        $scope.selectTab('info');

                                        //Call for banner
                                        SearchSec.IsSearchButtonClicked = true;
                                        getBanner(1);
                                   });
                                }
                                else {
                                    Notification.error({ message: 'No Results found..!', delay: MsgDelay });
                                }
                            });
                        }
                    })(_item));
                }

                //Setting up map bounds to display all markers
                var bounds = new google.maps.LatLngBounds ();
                //  Go through each...
                for (var i = 0, LtLgLen = latLngList.length; i < LtLgLen; i++) {
                  //  And increase the bounds to take this point
                  bounds.extend (latLngList[i]);
                }
                //  Fit these bounds to the map
                map.fitBounds (bounds);
            }
        }

      $http({ method: 'get', url: GURL + 'ewmGetCategory?LangID=1' }).success(function (data) {
            var _obj = { CategoryID: 0, CategoryTitle: '--Any--' };
            data.splice(0, 0, _obj);
            SearchSec.categories = data;
        });

        $http({ method: 'get', url: GURL + 'ewmGetProxmity?LangID=1' }).success(function (data) {
           SearchSec.proximities = data;
            if(!map){
                initialize();
            }
        });

        SearchSec.OpenStatuses = [ { id: 1, label: "Open" }, { id: 2, label: "Closed" }];

        SearchSec.isEZEIDselected = function (value) {
            if (SearchSec.Criteria.SearchType == 1)
                SearchSec.Placeholder = 'Type EZEID';
            else
                SearchSec.Placeholder = 'Type Keywords';
                $scope.searchType = 2;

            return value === SearchSec.Criteria.SearchType;
        };

        SearchSec.isIndividualUser = function (value) {
            return value === parseInt(SearchSec.mInfo.IDTypeID);
        };

        SearchSec.getSearch = function () {
            var ratingValues = "";

            for (var i=0; i<$scope.ratingModel.length; i++)
            {
                ratingValues += $scope.ratingModel[i].id + ',' ;
            }

            ratingValues = ratingValues.substring(0,ratingValues.length-1);
            SearchSec.IsSearchButtonClicked = true;
            SearchSec.IsShowForm = false;
            SearchSec.Criteria.ParkingStatus = SearchSec.Criteria.ParkingStatus == 1 ? '1,2' :0;
            SearchSec.Criteria.OpenStatus = (SearchSec.Criteria.OpenStatus.id == 1) ? 0 : SearchSec.Criteria.OpenStatus ;
            if ($rootScope._userInfo.IsAuthenticate == true || SearchSec.Criteria.SearchType == 2 && SearchSec.IsSearchButtonClicked) {

                if($rootScope._userInfo.Token == "")
                {
                    $rootScope._userInfo.Token = 2;
                    $scope.Token = 2;
                }
                else
                {
                   // console.log($rootScope._userInfo.Token);
                }

                SearchSec.Criteria.Latitude = $rootScope.CLoc.CLat;
                SearchSec.Criteria.Longitude = $rootScope.CLoc.CLong;
                SearchSec.Criteria.Token = $rootScope._userInfo.Token;
                SearchSec.Criteria.Rating = ratingValues;

                $http({ method: 'post', url: GURL + 'ewSearchByKeywords', data: SearchSec.Criteria }).success(function (data) {

                    if (data != 'null' && data.length>0) {
                        var _item = data[0];
                        if(data[0].Filename)
                        {
                            SearchSec.downloadData = data[0];
                            SearchSec.IsShowForm = true;
                            SearchSec.IsFilterRowVisible = false;
                        }
                        else
                        {
                            $http({ method: 'get', url: GURL + 'ewtGetSearchInformation?Token=' + $rootScope._userInfo.Token + '&TID=' + _item.TID }).success(function (data) {

                                if (data != 'null') {
                                   if(data.length == 1 && SearchSec.Criteria.SearchType == 1)
                                   {
                                       $scope.showInfoTab = true;
                                       $scope.selectTab('info');
                                   }
                                   else
                                   {
                                       $scope.selectTab('map');
                                   }
                                     $timeout(function () {
                                        SearchSec.mInfo = data[0];

                                         if (!/^(f|ht)tps?:\/\//i.test(data[0].Website)) {
                                             url = "http://" + data[0].Website;
                                             SearchSec.mInfo.Website = url;
                                         }

                                        //Call for banner
                                        getBanner(1);
                                        $scope.form_rating = data[0].Rating;
                                        SearchSec.mInfo.Banners = data[0].Banners;

                                        if(SearchSec.mInfo.IDTypeID == 2)
                                        {
                                            SearchSec.reservationPlaceHolder = "Reservation requirement details";
                                        }
                                        else
                                        {
                                            SearchSec.reservationPlaceHolder = "Appointment requirement details";
                                        }
                                   });
                                }
                                else {
                                    Notification.error({ message: 'Invalid key or not found…', delay: MsgDelay });
                                }
                            });


                            //PlaceMarker(data);

                            /******************** Code for checking map load and handling it with reload ****************/
                            //MapIsLoaded variable is set by map eventListener idle


                            try{
                                PlaceMarker(data);
                            }

                            catch(ex){
                                if(!map){
                                        initialize();
                                }
                                $scope.$watch('isMapLoaded',function(var1,var2){
                                    if(var2){
                                        PlaceMarker(data);

                                    }
                                });
                            }
                            //If map is not loaded wait for few seconds and then try to reload it and then place marker

                            /*********************Code for checking map load and handling it with reload ends ****************/
                        }
                       // PlaceMarker(data);//older one
                    }
                    else {
                        Notification.error({ message: 'Invalid key or not found…', delay: MsgDelay });
                        try{
                                PlaceMarker(null);
                           }

                            catch(ex){
                                if(!map){
                                        initialize();
                                }
                                $scope.$watch('isMapLoaded',function(var1,var2){
                                    if(var2){
                                        PlaceMarker(null);
                                    }
                                });
                            }
                        //PlaceMarker(null);
                    }
                });
            }
            else {
                //Redirect to Login page
                $('#SignIn_popup').slideDown();
                $rootScope.defer = $q.defer();
                var prom = $rootScope.defer.promise;
                prom.then(function(d){
                    SearchSec.getSearch();
                 });
            }
        };

        /**
         * Selects a particular tab
         */
                $scope.infoClass = "";
                $scope.mapClass = "";
                $scope.adClass = "level-1";
                $scope.selectTab = function (tabName){
                    if(tabName == 'info')
                    {
                        $scope.infoClass = "level-1";
                        $scope.mapClass = "";
                        $scope.adClass = "";
                    }
                    if(tabName == 'ad')
                    {
                         $scope.infoClass = "";
                        $scope.mapClass = "";
                        $scope.adClass = "level-1";
                    }

                    if(tabName == 'map')
                    {
                        if($scope.isMapReady && $scope.isMapLoaded)
                        {
                            $scope.infoClass = "";
                            $scope.mapClass = "level-1";
                            $scope.adClass = "";
                        }
                        else{
                            Notification.error({message:'Map is loading! Please wait..',delay:MsgDelay});
                        }
                    }
                };

        //Auto refresh Banner
        $interval(function() {

            if(AutoRefresh == true && SearchSec.IsSearchButtonClicked && SearchSec.mInfo.EZEID && $scope.showInfoTab && SearchSec.mInfo.Banners != 1)
            {
                currentBanner = currentBanner + 1;

                if(currentBanner <= SearchSec.mInfo.Banners)
                {
                    getBanner(currentBanner);
                }
                else
                {
                    currentBanner = 1;
                    getBanner(currentBanner);
                }
            }
        },RefreshTime);

        //False when navigate to other page
        $scope.$on('$locationChangeStart', function( event ) {
               AutoRefresh = false;
        });

        //call for previous banner
        SearchSec.getPreviousBanner = function () {
            currentBanner = currentBanner - 1;
            if(currentBanner >= 1)
            {
                getBanner(currentBanner);
                RefreshTime = Miliseconds;
            }
        };

        //call for next banner
        SearchSec.getNextBanner = function () {
            currentBanner = currentBanner + 1;
            if(currentBanner <= SearchSec.mInfo.Banners)
            {
                getBanner(currentBanner);
                RefreshTime = Miliseconds;
            }
        };

        function getBanner(_requestedBannerValue){
           if(SearchSec.mInfo.EZEID)
            {
                $http({ method: 'get', url: GURL + 'ewtGetBannerPicture?Token=' + $rootScope._userInfo.Token +'&SeqNo='+_requestedBannerValue+'&Ezeid='+SearchSec.mInfo.EZEID+'&StateTitle='+ SearchSec.mInfo.StateTitle}).success(function (data) {

                    if (data.Picture != 'null') {
                        SearchSec.mInfo.BannerImage = data.Picture;
                        if(currentBanner >= SearchSec.mInfo.Banners)
                        {
                            //Disable next button
                            SearchSec.nextButton = false;
                        }
                        else
                        {
                            //Enable next button
                            SearchSec.nextButton = true;
                        }

                        if(currentBanner <= 1)
                        {
                            //Disabled previous button
                            SearchSec.previousButton = false;
                        }
                        else
                        {   //Enable previous burron
                            SearchSec.previousButton = true;
                        }
                    }
                    else
                    {
                        msgSen.showMoreButton = false;
                        Notification.error({ message: "No Message found..!", delay: MsgDelay });
                    }
                });
            }
        }

        function getMapSearchResults(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                if (results.length > 0) {
                    var place = results[0];
                    $rootScope.CLoc.CLat = place.geometry.location.k;
                    $rootScope.CLoc.CLong = place.geometry.location.D;
                    var loc = new google.maps.LatLng($rootScope.CLoc.CLat, $rootScope.CLoc.CLong);
                    PlaceCurrentLocationMarker(loc);
                }
            }
            else {
                Notification.error({ message: 'No Results found..!', delay: MsgDelay });
            }
        }

        SearchSec.getdirections = function (data) {
            $scope.selectTab('map');
            var start = new google.maps.LatLng($rootScope.CLoc.CLat, $rootScope.CLoc.CLong);
            var end = new google.maps.LatLng(data.Latitude, data.Longitude);
            directionsDisplay.setMap(map);
            var request = {
                origin: start,
                destination: end,
                travelMode: google.maps.TravelMode.DRIVING
            };
            directionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                }
            });
        };

        //open Sales Enquiry form
        SearchSec.openSalesEnquiryForm = function () {
            $('#SalesEnquiryRequest_popup').slideDown();
        };

        SearchSec.sendSalesEnquiry = function () {
           if ($rootScope._userInfo.IsAuthenticate == true) {
               var currentTaskDate = moment().format('DD-MMM-YYYY hh:mm A');
                $http({ method: 'post', url: GURL + 'ewtSaveMessage', data: { TokenNo: $rootScope._userInfo.Token, ToMasterID: SearchSec.mInfo.TID, MessageType: 1, Message: SearchSec.salesMessage, TaskDateTime: today, LocID :SearchSec.mInfo.LocID,CurrentTaskDate: currentTaskDate } }).success(function (data) {
                    if (data.IsSuccessfull) {
                        $('#SalesEnquiryRequest_popup').slideUp();
                        SearchSec.salesMessage = "";
                        Notification.success({ message: 'Message send success', delay: MsgDelay });
                    }
                    else {
                        Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                    }
                });
            }
            else {
                //Redirect to Login page
                $('#SignIn_popup').slideDown();
            }
        };

        // Close Sales Enquiry Form
        SearchSec.closeSalesEnquiryForm = function () {
            $('#SalesEnquiryRequest_popup').slideUp();
            SearchSec.salesMessage = "";
        };

        //open Message form
        SearchSec.openSendMessageForm = function () {
            $('#sendMessage_popup').slideDown();
        };

        SearchSec.sendUserMessage = function () {
            if ($rootScope._userInfo.IsAuthenticate == true) {
                var currentTaskDate = moment().format('DD-MMM-YYYY hh:mm A');
                $http({ method: 'post', url: GURL + 'ewtSaveMessage', data: { TokenNo: $rootScope._userInfo.Token, ToMasterID: SearchSec.mInfo.TID, MessageType: 0, Message: SearchSec.SendMessage, TaskDateTime: today, LocID :SearchSec.mInfo.LocID,CurrentTaskDate: currentTaskDate } }).success(function (data) {
                    if (data.IsSuccessfull) {
                        $('#sendMessage_popup').slideUp();
                        SearchSec.SendMessage = "";
                        Notification.success({ message: 'Message send success', delay: MsgDelay });
                    }
                    else {
                        Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                    }
                });
            }
            else {
                //Redirect to Login page
                $('#SignIn_popup').slideDown();
            }
        };

        // Close Send Message Form
        SearchSec.closeSendMessageForm = function () {
            $('#sendMessage_popup').slideUp();
            SearchSec.SendMessage = "";
        };

        //open home delivery form
        SearchSec.openHomeDeliverForm = function () {
            $('#HomeDelivery_popup').slideDown();
        };

        //Send Home Delivery
        SearchSec.sendHomeDelivery = function () {
            if ($rootScope._userInfo.IsAuthenticate == true) {
                var currentTaskDate = moment().format('DD-MMM-YYYY hh:mm A');
                $http({ method: 'post', url: GURL + 'ewtSaveMessage', data: { TokenNo: $rootScope._userInfo.Token, ToMasterID: SearchSec.mInfo.TID, MessageType: 2, Message: SearchSec.HomeDeliverMessage, TaskDateTime: today, LocID :SearchSec.mInfo.LocID,CurrentTaskDate : currentTaskDate } }).success(function (data) {

                    if (data.IsSuccessfull) {
                        $('#HomeDelivery_popup').slideUp();
                        SearchSec.HomeDeliverMessage = "";
                        Notification.success({ message: 'Message send success', delay: MsgDelay });
                    }
                    else {
                        Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                    }
                });
            }
            else {
                //Redirect to Login page
                $('#SignIn_popup').slideDown();
            }
        };

        // Close HomeDeliver Form
        SearchSec.closeHomeDeliverForm = function () {
            SearchSec.HomeDeliverMessage = "";
            $('#HomeDelivery_popup').slideUp();
        };

        //open Reservation form
        SearchSec.openReservationForm = function () {
            document.getElementById("reservationMessage").className = "form-control fixTextArea emptyBox";
            $('#Reservation_popup').slideDown();
        };

        //Send Reservation
        SearchSec.sendReservation = function (messageType) {
           if ($rootScope._userInfo.IsAuthenticate == true) {
               
               /**
                * Converting LOCAL Time to UTC Time
               */
               var dateTime = moment(SearchSec.ReservationDateTime,"DD-MMM-YYYY hh:mm A").utc().format('DD-MMM-YYYY hh:mm A');
               var currentTaskDate = moment().format('DD-MMM-YYYY hh:mm A');
               $http({ method: 'post', url: GURL + 'ewtSaveMessage', data: { TokenNo: $rootScope._userInfo.Token, ToMasterID: SearchSec.mInfo.TID, MessageType: messageType, Message: SearchSec.ReservationMessage, TaskDateTime: dateTime, LocID :SearchSec.mInfo.LocID,CurrentTaskDate: currentTaskDate } }).success(function (data) {
                    if (data.IsSuccessfull) {
                        document.getElementById("reservationMessage").className = "form-control fixTextArea emptyBox";
                        SearchSec.ReservationMessage = "";
                        SearchSec.ReservationDateTime = "";
                        Notification.success({ message: 'Message send success', delay: MsgDelay });
                        $('#Reservation_popup').slideUp();
                    }
                    else {
                        Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                    }
                });
            }
            else {
                //Redirect to Login page
                $('#SignIn_popup').slideDown();
            }
        };

        // Close Reservation Form
        SearchSec.closeReservationForm = function () {
            $('#Reservation_popup').slideUp();
            document.getElementById("reservationMessage").className = "form-control fixTextArea emptyBox";
            SearchSec.ReservationDateTime = "";
        };

        //open Service Request form
        SearchSec.openServiceRequestForm = function () {
            $('#ServiceRequest_popup').slideDown();
        };

        //Send Service Request
        SearchSec.sendServiceRequest = function () {
            if ($rootScope._userInfo.IsAuthenticate == true) {
                var currentTaskDate = moment().format('DD-MMM-YYYY hh:mm A');
                $http({ method: 'post', url: GURL + 'ewtSaveMessage', data: { TokenNo: $rootScope._userInfo.Token, ToMasterID: SearchSec.mInfo.TID, MessageType: 4, Message: SearchSec.ServiceRequestMessage, TaskDateTime: today, LocID :SearchSec.mInfo.LocID,CurrentTaskDate : currentTaskDate } }).success(function (data) {

                    if (data.IsSuccessfull) {
                        $('#ServiceRequest_popup').slideUp();
                        SearchSec.ServiceRequestMessage = "";
                        Notification.success({ message: 'Message send success', delay: MsgDelay });
                    }
                    else {
                        Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                    }
                });
            }else {
                //Redirect to Login page
                $('#SignIn_popup').slideDown();
            }
        };

        // Close Service Request Form
        SearchSec.closeServiceRequestForm = function () {
            $('#ServiceRequest_popup').slideUp();
            SearchSec.ServiceRequestMessage = "";
        };

        //open CV form
        SearchSec.openCVForm = function() {
            $('#CV_popup').slideDown();
        };

        SearchSec.closeMappingPopup = function() {
            $('#Maping_popup').slideUp();
        };

        //Send CV Request
        SearchSec.sendCV = function () {
             if ($rootScope._userInfo.IsAuthenticate == true) {
                 var currentTaskDate = moment().format('DD-MMM-YYYY hh:mm A');
                 $http({ method: 'post', url: GURL + 'ewtSaveMessage', data: { TokenNo: $rootScope._userInfo.Token, ToMasterID: SearchSec.mInfo.TID, MessageType: 5, Message: "", TaskDateTime: today, LocID :SearchSec.mInfo.LocID, CurrentTaskDate: currentTaskDate } }).success(function (data) {
 
                     if (data.IsSuccessfull) {
                         SearchSec.ServiceRequestMessage = "";
                         $('#CV_popup').slideUp();
                         Notification.success({ message: 'CV send success', delay: MsgDelay });
                     }
                     else {
                         Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                     }
                 });
             }
             else {
                 //Redirect to Login page
                 $('#SignIn_popup').slideDown();
             }
        };

        //check for CV is uploaded by user or not
         SearchSec.checkForCVAvailability = function () {
            SearchSec.showCVSendButton = "";
             if ($rootScope._userInfo.IsAuthenticate == true)
             {
                 $http({ method: 'post', url: GURL + 'ewtCheckCV', data: { Token: $rootScope._userInfo.Token } }).success(function (data) {
                    if (data.IsSuccessfull)
                    {
                         SearchSec.sendCV();
                    }
                     else
                     {
                        $('#CV_popup').slideUp();
                        Notification.error({ message: 'Sorry..! CV is not uploaded... ', delay: MsgDelay });
                     }
                 });
             }
             else {
             //Redirect to Login page
             $('#SignIn_popup').slideDown();
             }
        };

        // Close CV Form
        SearchSec.closeCVForm = function () {
            $('#CV_popup').slideUp();
        };

        //close download form
        SearchSec.closeDownloadForm = function () {
            $('#download_popup').slideUp();
            SearchSec.IsFilterRowVisible = true;
            SearchSec.IsShowForm = false;
        };

        //close download form
        SearchSec.SearchTypeKeyWord = function () {
            SearchSec.IsShowForm = false;
            SearchSec.IsFilterRowVisible = true;
        };

        // Would write the value of the QueryString-variable called name to the console  
        var Qstr = getQueryStringValue("ID");

       if (Qstr != "") {
            SearchSec.Criteria.Keywords = Qstr;
            SearchSec.IsSearchPending = true;
            SearchSec.Criteria.SearchType = "1";
      }
    });

    ezeid.controller('ProfileController', function ($rootScope, $scope, $http, $q, $timeout, Notification, $filter, $window) {
        
        var profile = this;
        profile._info = {};
        profile.categories = [];
        profile.countries = [];
        profile.states = [];
        var showCurrentLocation = true;
        $scope.isCloseButtonClicked = false;
        var isCancelButton = true;

        /**
         * Added for confirmation box while navigating to other
         */
        $scope.$on('$locationChangeStart',function(event,next,current){
            if (!$scope.UserForm.$dirty) return;
            if(!isCancelButton) return;
            var confirm = $window.confirm('Are you sure you want to discard the changes without saving?');
            // Preventing them from navigating away
            if(!confirm){
                try{
                    event.defaultPrevented();
                }
                catch(ex){
                    event.preventDefault();
                }
            }
        });

        $('#datetimepicker1').datetimepicker({
            format: 'd-M-Y',
            hours12: false,
            maxDate: 0,
            timepicker : false
        });
        $('#datetimepicker1').siblings('.input-group-addon').on('click',function(){
            $('#datetimepicker1').trigger('focus');
        });

        var map;
        var mapOptions;
        var marker;
        var markers = [];

        var MsgDelay = 2000;
        var isBusinessIcon = 0; // 1 = icon is for business Type
        var isReSizeImage = false;
        
        /***************************** Camera Code ***************************************/
        $scope.isShowCamera = false;
        Webcam.set({
				// live preview size
				width: 250,
				height: 200,
				
				// device capture size
				dest_width: 250,
				dest_height: 200,
				
				// final cropped size
				crop_width: 200,
				crop_height: 200,

				// format and quality
				image_format: 'jpeg',
				jpeg_quality: 92
			});
        Webcam.on('error',function(){
            $scope.isShowCamera = false;
            Notification.error({message:'Camera not found',delay:MsgDelay});
        });

        $scope.showCamera = function(){
            $scope.isShowCamera = true;
            Webcam.attach( '#camera' );
        };

        $scope.hideCamera = function(){
            Webcam.reset();
            $scope.isShowCamera = false;
        };
        $scope.clickPicture = function(){
                $scope.isShowCamera = false;
                //Webcam.reset();
                
                Webcam.snap( function(data_uri) {

                    //Resize the image and set it as logo if the user is individual

                    profile._info.Picture = data_uri;

                    profile._info.PictureFileName = 'camera-snap-1.jpg'
                    if (profile._info.IDTypeID !== 2) {
                        var canvas = document.createElement('canvas');
                        /******************* Preparing icon file for camera snapshot ***************/
                        var image = new Image();
                        image.src = data_uri;
                        var canvas = document.createElement("canvas");
                        image.height = 40;
                        image.width = 40;
                        var ctx = canvas.getContext("2d");
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        canvas.width = image.width;
                        canvas.height = image.height;
                        ctx.drawImage(image, 0, 0, image.width, image.height);
                        $rootScope.smallImage = canvas.toDataURL("image/jpeg", 0.7);
                        /******************* Preparing icon file for camera snapshot ends ***************/
                        profile._info.Icon = $rootScope.smallImage;

                    } else {
                        profile._info.IconFileName = 'camera-snap-1.jpg';
                    }
                    Webcam.reset();
                });
              };
        var webCamErrorHandler = function(){
            $scope.isShowCamera = false;
            Notification.error({message:'Webcam is not present',delay:MsgDelay});
        };
        /***************************** Camera Code ends **********************************/
    if ($rootScope._userInfo) {
    }
    else {
        if (typeof (Storage) !== "undefined") {
            var encrypted = localStorage.getItem("_token");
            if (encrypted) {
                var decrypted = CryptoJS.AES.decrypt(encrypted, "EZEID");
                var Jsonstring = decrypted.toString(CryptoJS.enc.Utf8);
                if (Jsonstring) {
                    $rootScope._userInfo = JSON.parse(Jsonstring);
                }
            }
                else {
                    $rootScope._userInfo = {
                        IsAuthenticate: false,
                        Token: '',
                        FirstName: '',
                        Type:'',
                        Icon:''
                    };
                }
            } else {
                // Sorry! No Web Storage support..
                $rootScope._userInfo = {
                    IsAuthenticate: false,
                    Token: '',
                    FirstName: '',
                    Type:'',
                    Icon:''
                };
                alert('Sorry..! Browser does not support');
                window.location.href = "#/home";
            }
        }

        $http({ method: 'get', url: GURL + 'ewmGetCountry?LangID=1' }).success(function (data) {
            if ($rootScope._userInfo.Token == false) {
                var _obj = { CountryID: 0, CountryName: '--Country--', ISDCode: '####' };
                data.splice(0, 0, _obj);
                profile._info.CountryID = _obj.CountryID;
            }
            profile.countries = data;
         });

        $scope.$watch('_userInfo.IsAuthenticate', function () {
            if ($rootScope._userInfo.IsAuthenticate == true) {
                GetUserDetails();
             }
            else {
                profile._info = {};
                profile._info.IDTypeID = 1;
                profile._info.NameTitleID = 1;
                profile._info.ParkingStatus = 1;
                profile._info.OpenStatus = 1;
            }
        });


        if($rootScope._userInfo.IsAuthenticate){
            $scope.heading = 'Update Profile';
            showCurrentLocation = false;
        }
        else
        {
            $scope.heading = 'Create New Profile';
            showCurrentLocation = true;
        }

        //Custom Methods
        function GetUserDetails() {
            //$rootScope.IsIdAvailable = true;
            $http({
                method: 'get',
                url: GURL + 'ewtGetUserDetails?Token=' + $rootScope._userInfo.Token
            }).success(function (data) {
                    profile.getStates(data[0].CountryID,false);
                    profile._info = data[0];
                    profile._info.StateID = data[0].StateID;
                    profile._info.CountryID = data[0].CountryID;
                    profile._info.ISDMobileNumber = data[0].ISDMobileNumber;
                    profile._info.ISDPhoneNumber = data[0].ISDPhoneNumber;
                    profile._info.Latitude = data[0].Latitude;
                    profile._info.Longitude = data[0].Longitude;
                    profile._info.EZEID = data[0].EZEID;
                    profile._info.PIN = data[0].PIN;

                    if(!profile._info.PIN)
                    {
                        profile._info.SecurePin = false;
                    }
                    else
                    {
                        profile._info.SecurePin = true;
                    }

                    profile._info.SalesEnquiryButton =  profile._info.SalesEnquiryButton == 1 ? true : false;
                    profile._info.HomeDeliveryButton = profile._info.HomeDeliveryButton == 1 ? true : false;
                    profile._info.ReservationButton = profile._info.ReservationButton == 1 ? true : false;
                    profile._info.SupportButton = profile._info.SupportButton == 1 ? true : false;
                    profile._info.CVButton = profile._info.CVButton == 1 ? true : false;
                    profile._info.DOB = data[0].DOB;
                    // profile._info.DOB = $filter('date')(new Date(data[0].DOB), 'dd-MMM-yyyy');
                    try{
                    initialize();
                    }
                    catch(ex){}
             });
        }

        if ($rootScope._userInfo.IsAuthenticate == false) {
            initialize();
        }

        //Created by Abhishek for pop-up html(terms and condition)
        this.openTermsAndConditionForm=function(){
            $('#Terms_popup').css({'position':'fixed'});
            $('#Terms_popup > div').css({'margin-top':'0%'});
            $('#Terms_popup').slideDown();
        };
        this.closedTermsAndConditionForm=function(){
            $('#Terms_popup').slideUp();
        }
        this.CheckisIDAvailable = function () {

            $scope.disableAvalabilityButton = true;
           /* var sEzeid = profile._info.EZEID;
            var lastTwo = sEzeid.substr(sEzeid.length - 2);
            if(lastTwo != "ap")
            {*/
               $http({
                    method: 'get',
                    url: GURL + 'ewGetEZEID?EZEID=' + profile._info.EZEID
                }).success(function (data) {
                    profile._info.IsIDAvailable = data.IsIdAvailable;
                });
           /* }
            else
            {
                profile._info.IsIDAvailable = false;
            }*/
        };

        this.ezeidBoxClicked = function () {
            $scope.disableAvalabilityButton = false;
        };

        //if secure pin checkbox is uncheck remove PIN Value
        this.securePinCliked = function () {
            if(!profile._info.SecurePin)
            {
                profile._info.PIN = "";
            }
        };


        //Maps
        function initialize() {

            var initialLocation;
            var currentLoc = new google.maps.LatLng(12.295810, 76.639381);

            map = new google.maps.Map(document.getElementById('map-canvas'), {
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                Zoom: 16
            });

            var ClocBtn = (document.getElementById('mapCloc'));
            map.controls[google.maps.ControlPosition.TOP_RIGHT].push(ClocBtn)

            if ($rootScope._userInfo.IsAuthenticate == true) {
                initialLocation = new google.maps.LatLng(profile._info.Latitude, profile._info.Longitude);
                 PlaceCurrentLocationMarker(initialLocation);

            } else {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(FindCurrentLocation);
                }
            }

            //directionsDisplay.setMap(map);
            // Try W3C Geolocation (Preferred)
            if (navigator.geolocation) {
                browserSupportFlag = true;
                navigator.geolocation.getCurrentPosition(FindCurrentLocation, function () {
                    handleNoGeolocation();
                });
            }
            // Browser doesn't support Geolocation
            else {
                   handleNoGeolocation();
            }

            function handleNoGeolocation() {
                initialLocation = currentLoc;
                map.setCenter(initialLocation);
                PlaceCurrentLocationMarker(initialLocation);
                //PlaceMarker(initialLocation);
            }

            //// Create the search box and link it to the UI element.
            var input = (document.getElementById('txtSearch'));
            map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
            var searchBox = new google.maps.places.SearchBox((input));

            // Listen for the event fired when the user selects an item from the
            // pick list. Retrieve the matching places for that item.
            google.maps.event.addListener(searchBox, 'places_changed', function () {
                 var places = searchBox.getPlaces();

                if (places.length == 0) {
                    return;
                }
                for (var i = 0, marker; marker = markers[i]; i++) {
                    marker.setMap(null);
                }

                // For each place, get the icon, place name, and location.
                markers = [];
                var bounds = new google.maps.LatLngBounds();
                if (places.length > 0) {
                    var place = places[0];
                    $rootScope.CLoc.CLat = place.geometry.location.k;
                    $rootScope.CLoc.CLong = place.geometry.location.D;
                    var loc = new google.maps.LatLng($rootScope.CLoc.CLat, $rootScope.CLoc.CLong);
                    PlaceCurrentLocationMarker(loc);
                }
            });

            // Bias the SearchBox results towards places that are within the bounds of the
            // current map's viewport.
            google.maps.event.addListener(map, 'bounds_changed', function () {
                var bounds = map.getBounds();
                searchBox.setBounds(bounds);
            });

            google.maps.event.addListenerOnce(map, 'idle', function () {
              if(profile.IsSearchPending){
                    profile.getSearch();
                }
            });
         }
        function getReverseGeocodingData(lat, lng) {

            var latlng = new google.maps.LatLng(lat, lng);
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                if (status !== google.maps.GeocoderStatus.OK) {
                }
                if (status == google.maps.GeocoderStatus.OK) {
                    getAddressForLocation(results[0].address_components);
                }
            });
        }
        function getAddressForLocation(results) {
                profile._info.CityTitle = "";
                profile._info.PostalCode = "";

                angular.forEach(results, function (mapResultValue, index) {

                    if (mapResultValue.types[0] == 'locality') {
                        if (profile._info.CityTitle != "") {
                            profile._info.CityTitle += "," + mapResultValue.long_name;
                           // $scope.$apply();
                        } else {
                            profile._info.CityTitle = mapResultValue.long_name;
                           // $scope.$apply();
                        }
                    }

                    if (mapResultValue.types[0] == 'administrative_area_level_1') {
                        if (profile._info.State!= "") {
                            profile._info.State = mapResultValue.long_name;
                          //  $scope.$apply();
                        } else {
                            profile._info.State = mapResultValue.long_name;
                            //$scope.$apply();
                        }
                    }

                    if (mapResultValue.types[0] == 'postal_code') {
                        if (profile._info.PostalCode != "") {
                            profile._info.PostalCode += "," + mapResultValue.long_name;
                            //$scope.$apply();
                        } else {
                            profile._info.PostalCode = mapResultValue.long_name;
                          //  $scope.$apply();
                        }
                    }

                    if (mapResultValue.types[0] == 'country') {
                        if (profile._info.Country != "") {
                            profile._info.Country = mapResultValue.long_name;
                            //$scope.$apply();
                        } else {
                            profile._info.Country = mapResultValue.long_name;
                            //  $scope.$apply();
                        }
                    }

                    });


                 //   if( profile._info.CountryID == null || profile._info.CountryID == "")
                 //   {
                        var countryFileredString = $filter('filter')(profile.countries, profile._info.Country)
                        for (var key in countryFileredString)
                        {
                            if(profile._info.Country == countryFileredString[key].CountryName)
                            {
                                profile._info.CountryID = countryFileredString[key].CountryID;
                                profile._info.ISDMobileNumber = countryFileredString[key].ISDCode;
                                profile._info.ISDPhoneNumber = countryFileredString[key].ISDCode;
                            }
                        }
                  //  }
                updateState(profile._info.CountryID,true);
                getISDCode(profile._info.CountryID);
           // }
        }

        $scope.stateFilter = function()
        {
            var statesString = $filter('filter')(profile.states, profile._info.State);
            profile._info.StateID = statesString[0].StateID;
          }


        this.isMapInitialized = function () {
            if (profile.mapInit == false) {
                initialize();
                profile.mapInit = true;
            }
        };
        this.SearchOnMap = function (Query) {
            var request = {
                query: Query
            };
            service = new google.maps.places.PlacesService(map);
            service.textSearch(request, getMapSearchResults);
        };

        function getMapSearchResults(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                if (results.length > 0) {
                    var place = results[0];
                    profile._info.Latitude = place.geometry.location.k;
                    profile._info.Longitude = place.geometry.location.D;
                    var loc = new google.maps.LatLng(profile._info.Latitude, profile._info.Longitude);
                    PlaceCurrentLocationMarker(loc);
                    getReverseGeocodingData(profile._info.Latitude, profile._info.Longitude);
                }
            }
            else {
                Notification.error({ message: 'No Results found..!', delay: MsgDelay });
            }
        }
        function PlaceCurrentLocationMarker(location) {
            if (marker != undefined) {
                marker.setMap(null);
            }
            map.setCenter(location);
            marker = new google.maps.Marker({
                position: location,
                title: "Current Location",
                draggable: true,
                map: map,
                icon: 'images/you_are_here.png'
            });
            google.maps.event.addListener(marker, 'dragend', function (e) {
                profile._info.Latitude = marker.getPosition().k;
                profile._info.Longitude = marker.getPosition().D;
                getReverseGeocodingData(marker.getPosition().k, marker.getPosition().D);
               // myinfowindow.setContent('<h6>You are here</h6>');
             //   myinfowindow.open(map, marker);
            });
        }
        function FindCurrentLocation(position) {
            if (showCurrentLocation) {
                initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                PlaceCurrentLocationMarker(initialLocation);
                profile._info.Latitude = position.coords.latitude;
                profile._info.Longitude = position.coords.longitude;
                getReverseGeocodingData(profile._info.Latitude, profile._info.Longitude);
            }
        };
        this.getMyLocation = function () {
              if (navigator.geolocation) {
                  showCurrentLocation = true;
                navigator.geolocation.getCurrentPosition(FindCurrentLocation);
            }
        };

        $http({ method: 'get', url: GURL + 'ewmGetCategory?LangID=1' }).success(function (data) {
            var _obj = { CategoryID: 0, CategoryTitle: '--Category--' };
            data.splice(0, 0, _obj);
            profile.categories = data;
            profile._info.CategoryID = _obj.CategoryID;
        });


        $http({ method: 'get', url: GURL + 'ewmGetMTitle?LangID=1' }).success(function (data) {
            profile.Titles = data;
        });

        this.getStates = function (CountryID,stateFilter) {
            stateFilter = (stateFilter == "") ? false : true;
            // if stateFilter = 0 don't called stateFilter()  and if stateFilter = 1 called stateFilter()
            getISDCode(CountryID);
            updateState(CountryID,stateFilter);
        };
        this.getCities = function (StateID) {
            $http({ method: 'get', url: GURL + 'ewmGetCity?LangID=1&StateID=' + StateID }).success(function (data) {
                profile.cities = data;
            });
        };

        function updateState(CountryID,isStateFilter)
        {
             isStateFilter = (isStateFilter == "") ? false : true;
             $http({ method: 'get', url: GURL + 'ewmGetState?LangID=1&CountryID=' + CountryID }).success(function (data) {
                if ($rootScope._userInfo.Token == false) {
                    var _obj = { StateID: 0, StateName: '--State--' };
                    data.splice(0, 0, _obj);
                    profile._info.StateID = _obj.StateID;
                 }
               profile.states = data;
                 if(isStateFilter)
                 {
                     $scope.stateFilter();
                 }
            });
        }

        //To set country ISD Code from Country Id
        function getISDCode(CountryID)
        {
            var countryData = $filter('filter')(profile.countries, CountryID);
            for (var key in countryData)
            {
                if(profile._info.Country == countryData[key].CountryName)
                {
                    profile._info.ISDMobileNumber = countryData[key].ISDCode;
                    profile._info.ISDPhoneNumber = countryData[key].ISDCode;
                }
            }
         }

        function isValidate()
        {
                var notificationMessage = "";
                var errorList  = [];
                // Check validations
                if(!profile._info.EZEID)
                {
                    errorList.push('EZEID is Required');
                }

                if(profile._info.PIN)
                {
                    if(profile._info.PIN != ""){
                        if(profile._info.PIN<100)
                        {
                             errorList.push('Pin should greater or equal 100');
                        }
                    }

                }

                if($scope.disableAvalabilityButton == false)
                {
                    errorList.push('First to Check EZE ID availability');
                }

                if(!profile._info.Password && $rootScope._userInfo.IsAuthenticate == false)
                {
                    errorList.push('Password is Required');
                }
                if(!profile._info.CPassword && $rootScope._userInfo.IsAuthenticate == false)
                {
                    errorList.push('Re-Enter Password is Required');
                }
                if(profile._info.Password != profile._info.CPassword && $rootScope._userInfo.IsAuthenticate == false)
                {
                    errorList.push('Password Mismatch');
                }
                if(!profile._info.FirstName)
                {
                    notificationMessage += notificationMessage != "" ? ", First Name Required " : "First Name Required";
                    errorList.push('First Name Required');
                }
                if(!profile._info.LastName)
                {
                    errorList.push(' Last Name Required ');
                }
                if(!profile._info.AddressLine1)
                {
                    errorList.push(' Address1 Required');
                }
                if(!profile._info.CountryID)
                {
                    errorList.push('Country Required');
                }
                if(!profile._info.StateID)
                {
                    errorList.push('State Required');
                }
                if(!profile._info.CityTitle)
                {
                    errorList.push(' City Required ');
                }
                if(!profile._info.PostalCode)
                {
                    errorList.push('PostalCode Required ');
                }
                if(!profile._info.MobileNumber)
                {
                    errorList.push('Mobile Number Required ');
                }

                if(profile._info.isWrongEmailPattern)
                {
                    errorList.push('Not valid email!');
                }
                if(profile._info.isWrongEmailPatternSales)
                {
                    errorList.push('Not valid email!');
                }
                if(profile._info.isWrongEmailPatternHome)
                {
                    errorList.push('Not valid email!');
                }
                if(profile._info.isWrongEmailPatternReservation)
                {
                    errorList.push('Not valid email!');
                }
                if(profile._info.isWrongEmailPatternSupport)
                {
                    errorList.push('Not valid email!');
                }
                if(profile._info.isWrongEmailPatternCV)
                {
                    errorList.push('Not valid email!');
                }

                if(profile._info.IDTypeID  == '1')
                {
                    if(!profile._info.DOB)
                    {
                        errorList.push('Date of birth Required ');
                    }
                }
                
                if(errorList.length>0){
                    for(var i = errorList.length; i>0;i--)
                    {
                        Notification.error({ message: errorList[i-1], delay: MsgDelay });
                    }
             };
                //Return false if errorList is greater than zero
                return (errorList.length>0)? false : true;
          }
             //Save and Update Primary Registration
            this.savePrimaryRegistration = function (UserForm) {
                isCancelButton = false;
                if(isValidate())
                {
                    var sEzeid = profile._info.EZEID;
                    var lastTwo = sEzeid.substr(sEzeid.length - 2);
                    if(lastTwo != "ap")
                    {
                        // create/Save profile
                        profile._info.SalesEnquiryButton =  profile._info.SalesEnquiryButton == true ? 1 : 0;
                        profile._info.HomeDeliveryButton = profile._info.HomeDeliveryButton == true ? 1 : 0;
                        profile._info.ReservationButton = profile._info.ReservationButton == true ? 1 : 0;
                        profile._info.SupportButton = profile._info.SupportButton == true ? 1 : 0;
                        profile._info.CVButton = profile._info.CVButton == true ? 1 : 0;
                        profile._info.Gender = (profile._info.Gender == undefined || profile._info.Gender == null )? 2 : profile._info.Gender ;

                        if(profile._info.IDTypeID == 1)
                        {
                            profile._info.Icon = $rootScope.smallImage;
                        }
                        else
                        {
                            if(isBusinessIcon == 1)
                            {
                                profile._info.Icon = $rootScope.smallImage;
                            }
                        }
                        profile._info.LanguageID = 1;
                        profile._info.IDTypeID = parseInt(profile._info.IDTypeID, 10);
                        profile._info.Token = $rootScope._userInfo.Token;

                        var sTokenString = "";
                        sTokenString = profile._info.Token;
                        $http({
                            method: "POST",
                            url: GURL + 'ewSavePrimaryEZEData',
                            data: JSON.stringify(profile._info),
                            headers: { 'Content-Type': 'application/json' }
                        }).success(function (data) {
                                if (data.IsAuthenticate) {
                                    $rootScope._userInfo = data;
                                    if (typeof (Storage) !== "undefined") {
                                        var encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), "EZEID");
                                        localStorage.setItem("_token", encrypted);
                                    } else {
                                        alert('Sorry..! Browser does not support');
                                        window.location.href = "#/home";
                                    }
                                    document.getElementById("EZEID").className = "form-control emptyBox";
                                    document.getElementById("password").className = "form-control emptyBox";
                                    document.getElementById("re-password").className = "form-control emptyBox";
                                    document.getElementById("FName").className = "form-control emptyBox";
                                    document.getElementById("LName").className = "form-control emptyBox";
                                    document.getElementById("streeName").className = "form-control emptyBox";
                                    document.getElementById("city").className = "form-control emptyBox";
                                    document.getElementById("postalCode").className = "form-control emptyBox";
                                    document.getElementById("mobile_phone").className = "form-control emptyBox";

                                    getISDCode(profile._info.CountryID);
                                    if (sTokenString == "")
                                    {
                                      $scope.isCloseButtonClicked = true;
                                      window.location.href = "#/congratulations";
                                    }
                                    else
                                    {
                                        $scope.isCloseButtonClicked = true;
                                        window.location.href = "#/home";
                                        Notification.success({ message: "Updated...", delay: MsgDelay });
                                    }
                   }
                    else {
                                    if (UserForm.$valid) {
                                        Notification.error({ message: "Registration failed", delay: MsgDelay });
                                    }
                                }
                            });
                    }
                    else
                    {
                        Notification.error({ message: "Not available...", delay: MsgDelay });
                        profile._info.IsIDAvailable = false;
                    }
                }
                else
                {
                   // Notification.error({ message: notificationMessage, delay: MsgDelay });
                }
        };

        this.closeRegistrationForm = function () {
            $scope.isCloseButtonClicked = true;
            window.location.href = "#/home";
        }
        //Upload Picture
        $scope.uploadImageForEditLocation = function (image) {
            profile._info.PictureFileName = image[0].name;
            fileToDataURL(image[0]).then(function (dataURL) {

                profile._info.Picture = dataURL;
                if (!profile._info.IDTypeID == 2) {
                    profile._info.Icon = $rootScope.smallImage;
                    /* profile._info.Icon = "";
                     profile._info.IconFileName = "";*/
                } else {
                    profile._info.IconFileName = image[0].name;
                }
          });

         };

        var fileToDataURL = function (file) {
            var deferred = $q.defer();
            var reader = new FileReader();
            reader.onload = function (e) {
                deferred.resolve(e.target.result);
            };
            reader.readAsDataURL(file);
            return deferred.promise;
        };


        //Upload Icon
        $scope.uploadIcon = function (image) {
            isBusinessIcon = 1;
            profile._info.Icon = $rootScope.smallImage;
            profile._info.IconFileName = image[0].name;
           // Notification.success({ message: "Saved...", delay: MsgDelay });
        };

        this.closeAddPhotoForEditLocation = function () {
            if ($rootScope._userInfo.IsAuthenticate == false) {
                profile._info.Picture = "";
                profile._info.PictureFileName = "";
            }
        };

        this.fileSizeConvert = function (bytes) {
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes == 0) return '0 Byte';
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
        };

        profile.parkingStatus = [{ id: 0, label: "Parking Status" },{ id: 1, label: "Public Parking" }, { id: 2, label: "Valet Parking" }, { id: 3, label: "No parking" }];
        profile.gender = [{ id: 0, label: "Male" }, { id: 1, label: "Female" }, { id: 2, label: "Unspecified" }];
    });



    ezeid.controller('NotifyController', function ($scope, $rootScope, $http, Notification, $filter, $interval) {
        var msgSen = this;
        var _pageValue = 1;
        var MsgDelay = 2000;
        msgSen.Status={id:"0,1",label:'New/Accepted'};
        msgSen.MessageType={id:"0,1,2,3,4,5,6",label:'All'};
        msgSen.msgs = [];
        var showPaging = "N";
        var Miliseconds = 300000;
        var RefreshTime = Miliseconds;
        var AutoRefresh = true;

        $interval(function() {
            msgSen.msgs = [];
            if(AutoRefresh == true)
            {
                LoadNotifications(_pageValue);
            }

        },RefreshTime);

        this.refreshNotificationGrid=function(){
            msgSen.msgs = [];
            LoadNotifications(_pageValue);
            RefreshTime = Miliseconds;
        };

        $scope.$on('$locationChangeStart', function( event ) {
            AutoRefresh = false;
        });

        if ($rootScope._userInfo) {

        }
        else {
            if (typeof (Storage) !== "undefined") {
                var encrypted = localStorage.getItem("_token");
                if (encrypted) {
                    var decrypted = CryptoJS.AES.decrypt(encrypted, "EZEID");
                    var Jsonstring = decrypted.toString(CryptoJS.enc.Utf8);
                    if (Jsonstring) {
                        $rootScope._userInfo = JSON.parse(Jsonstring);
                    }
                }
                else {
                    $rootScope._userInfo = {
                        IsAuthenticate: false,
                        Token: '',
                        FirstName: '',
                        Type:'',
                        Icon:''
                    };
                }
            } else {
                // Sorry! No Web Storage support..
                $rootScope._userInfo = {
                    IsAuthenticate: false,
                    Token: '',
                    FirstName: '',
                    Type:'',
                    Icon:''
                };
                alert('Sorry..! Browser does not support');
                window.location.href = "#/";
            }
        }

        $scope.$watch('_userInfo.IsAuthenticate', function () {
            if ($rootScope._userInfo.IsAuthenticate == true) {
                LoadNotifications(_pageValue);
            }
            else {
                window.location.href = "#/";
            }
        });

        /**
         * Function for converting UTC time from server to LOCAL timezone
        */
        var convertTimeToLocal = function(timeFromServer,dateFormat){
            if(!dateFormat){
                dateFormat = 'DD-MMM-YYYY hh:mm A';
            }
            var x = new Date(timeFromServer);
            var mom1 = moment(x);
            return mom1.add((mom1.utcOffset()),'m').format(dateFormat);
        };
        
        /**
         * Function for converting LOCAL time (local timezone) to server time
        */
        var convertTimeToUTC = function(localTime,dateFormat){
            if(!dateFormat){
                dateFormat = 'DD-MMM-YYYY hh:mm A';
            }
            return moment(localTime,dateFormat).utc().format(dateFormat);
        };
        
        function LoadNotifications(_pageValue){

            //_pageValue = _pageValue + 1;
            $http({ method: 'get', url: GURL + 'ewtGetMessages?TokenNo=' + $rootScope._userInfo.Token +'&Page='+_pageValue+'&Status='+msgSen.Status.id +'&MessageType='+msgSen.MessageType.id}).success(function (data) {

                //if (data.length > 0) {
                if (data != 'null') {
                    for (var i = 0; i < data.length; i++) {
                        data[i].TaskDateTime = convertTimeToLocal(data[i].TaskDateTime,'DD-MMM-YYYY hh:mm A');
                        msgSen.msgs.push(data[i]);
                        showPaging = data[0]['NextPage'];
                    }
                    if(showPaging == 'Y')
                    {
                        msgSen.showMoreButton = true;
                    }
                    else
                    {
                        msgSen.showMoreButton = false;
                    }
                }
                else
                {
                    msgSen.showMoreButton = false;
                    Notification.error({ message: "No Message found..!", delay: MsgDelay });
                }
            });
        }

        this.filterStatus=function(){
            msgSen.msgs = [];
            _pageValue = 1;
            LoadNotifications(_pageValue);
        };

        this.filterMessageType=function(){
            msgSen.msgs = [];
            _pageValue = 1;
            LoadNotifications(_pageValue);
        };

        msgSen.statusDrpDwn=[{id:"0,1",label:'New/Accepted'},{id:"0",label:'New'},{id:"1",label:'Accepted'},{id:"2",label:'Completed'},{id:"3",label:'Rejected'},{id:"0,1,2,3",label:'All'}];

        msgSen.typeDrpDwn=[{id:"0",label:'Normal Message'},{id:"1",label:'Sales Enquiry'},
            {id:"2",label:'Home Delivery'},{id:"3",label:'Reservation'},{id:"4",label:'Support Request'},{id:"5",label:'CV'},{id:"6",label:'Appointment'},{id:"0,1,2,3,4,5,6",label:'All'}];


        //More button click
        this.getNotifications = function (){
            _pageValue = _pageValue + 1;
            LoadNotifications(_pageValue);
        };

        //open Add Note Form
        this.openAddNoteForm = function (_item){
           msgSen.item =_item;
            msgSen.Message =_item.Message;
            msgSen.NoteMessage =_item.Notes;
            $('#Notes_popup').slideDown();
        };

        //Send Add Note
        this.sendNote = function (_item) {
            if ($rootScope._userInfo.IsAuthenticate == true)
            {
                var sts = {
                    TokenNo: $rootScope._userInfo.Token,
                    Status: _item.Status,
                    TID: _item.TID,
                    Notes:msgSen.NoteMessage
                };
                $http({ method: 'post', url: GURL + 'ewtUpdateMessageStatus', data: sts }).success(function (data) {

                    if(data.IsUpdated==true){
                        _item.Notes=msgSen.NoteMessage;
                        $('#Notes_popup').slideUp();
                        Notification.success({ message: "Saved...", delay: MsgDelay });
                    }
                    else
                    {
                        Notification.error({ message: 'Sorry..! not saved', delay: MsgDelay });
                    }
                });
            }
            else
            {
                //Redirect to Login page
                $('#SignIn_popup').slideDown();
            }
        };

        // Close Add Note
        this.closeAddNoteForm = function () {
            $('#Notes_popup').slideUp();
        };

        //btn Groups..Below code is for status button
        $scope.checkModel = {
            New: false,
            InProcess: false,
            Closed: false,
            Dropped:false
        };

        this.UpdateStatus = function (item, status) {
            var sts = {
                TokenNo: $rootScope._userInfo.Token,
                Status: status,
                TID: item.TID
            };
            $http({ method: 'post', url: GURL + 'ewtUpdateMessageStatus', data: sts }).success(function (data) {
                var _obj = data;
                if(data.IsUpdated==true){
                    item.Status=status;
                    Notification.success({ message: "Status updated...", delay: MsgDelay });
                }
                else
                {
                    Notification.error({ message: 'Sorry..! Status not updated', delay: MsgDelay });
                }
            });
        };
    });
    /***
     * HistoryController
     */
    ezeid.controller('HistoryController', function ($scope, $rootScope, $http, Notification, $filter, $interval) {
        var msgSen = this;
        var _pageValue = 1;
        var MsgDelay = 2000;
        msgSen.msgs = [];
        var showPaging = "N";

        if ($rootScope._userInfo) {

        }
        else {
            if (typeof (Storage) !== "undefined") {
                var encrypted = localStorage.getItem("_token");
                if (encrypted) {
                    var decrypted = CryptoJS.AES.decrypt(encrypted, "EZEID");
                    var Jsonstring = decrypted.toString(CryptoJS.enc.Utf8);
                    if (Jsonstring) {
                        $rootScope._userInfo = JSON.parse(Jsonstring);
                    }
                }
                else {
                    $rootScope._userInfo = {
                        IsAuthenticate: false,
                        Token: '',
                        FirstName: '',
                        Type:'',
                        Icon:''
                    };
                }
            } else {
                // Sorry! No Web Storage support..
                $rootScope._userInfo = {
                    IsAuthenticate: false,
                    Token: '',
                    FirstName: '',
                    Type:'',
                    Icon:''
                };
                alert('Sorry..! Browser does not support');
                window.location.href = "index.html";
            }
        }

        $scope.$watch('_userInfo.IsAuthenticate', function () {
            if ($rootScope._userInfo.IsAuthenticate == true) {
                LoadHistory(_pageValue);
            }
            else {
                window.location.href = "#/";
            }
        });

        /**
         * Function for converting UTC time from server to LOCAL timezone
        */
        var convertTimeToLocal = function(timeFromServer,dateFormat){
           if(!dateFormat){
                dateFormat = 'DD-MMM-YYYY hh:mm A';
            }
            var mom1 = moment(timeFromServer,dateFormat);
            var ret =  mom1.add((mom1.utcOffset()),'m').format(dateFormat);
            return ret;
        };
        
        /**
         * Function for converting LOCAL time (local timezone) to server time
        */
        var convertTimeToUTC = function(localTime,dateFormat){
            if(!dateFormat){
                dateFormat = 'DD-MMM-YYYY hh:mm A';
            }
            return moment(localTime).utc().format(dateFormat);
        };
        
        function LoadHistory(_pageValue){

            $http({ method: 'get', url: GURL + 'ewtGetAccessHistory?TokenNo=' + $rootScope._userInfo.Token + '&Page='+_pageValue }).success(function (data) {

                if (data != 'null') {
                    for (var i = 0; i < data.length; i++) {
                        data[i].AccessDate = convertTimeToLocal(data[i].AccessDate,'DD-MMM-YYYY hh:mm A');
                        msgSen.msgs.push(data[i]);
                        showPaging = data[0]['NextPage'];
                    }
                    if(showPaging == 'Y')
                    {
                        msgSen.showMoreButton = true;
                    }
                    else
                    {
                        msgSen.showMoreButton = false;
                    }
                }
                else
                {
                    msgSen.showMoreButton = false;
                    Notification.error({ message: "No History found..!", delay: MsgDelay });
                }
            });
        }

        //More button click
        this.getMoreHistory = function (){
            _pageValue = _pageValue + 1;
            LoadHistory(_pageValue);
        };
    });


})();