(function () {
    var ezeid = angular.module('ezeidApp',
        [
            'ngHeader',
            'ngRoute',
            'ngFooter',
            'ui-notification',
            'imageupload',
            'angularjs-dropdown-multiselect',
            'smart-table',
            'ui.grid',
            'ngTouch',
            'ui.grid', 'ui.grid.expandable', 'ui.grid.selection', 'ui.grid.pinning',
            'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.cellNav','ui.grid.pagination','ui.grid.exporter'
        ]);

    ezeid.value('GURL',"/");
    ezeid.value('MsgDelay',2000);

    /**
     * These routes will be password protected, only authenticated users can access these routes
     */
    ezeid.value('CLOSED_ROUTES',[
        '/business-manager'

    ]);
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
            .when('/business-manager',{templateUrl : 'html/business-manager/business-manager.html'})
            .when('/bulksalesenquiry',{templateUrl : 'html/bulksalesenquiry.html'})
            .when('/create-template',{templateUrl : 'html/createTemplate.html'})
            .otherwise({redirectTo : '/home'});

        $httpProvider.interceptors.push("ezeidInterceptor");
    }]);

    /***
     * @ezeid Configuring Route access based on authentication
     */
    ezeid.run(['$location','$rootScope','CLOSED_ROUTES','$routeParams','$timeout',function($location,$rootScope,CLOSED_ROUTES,$routeParams,$timeout){
        /**
         * Checking login while navigating to different pages
         */

        $rootScope.$on("$routeChangeStart",function(event,next,current){

            /**
             * @todo Check if user is navigating to Closed Routes( which require authentication)
             *       then don't let him navigate to those routes without checking his authenticity
             */


//            if(next.params && typeof(next.params.Token) !== "undefined" && typeof(next.params.FunctionType) !== "undefined" && typeof(next.params.PersonEZEID) )

            try{
                if(CLOSED_ROUTES.indexOf(next.$$route.originalPath) == -1){
                    return true;
                }
            }
            catch(ex){
                return true;
            }


            /**
             * Checking if the user is authenticated an then routing it to particular url
             */


            if ($rootScope._userInfo) {
                /**
                 * Allow him to access the site as he is already logged in
                 */
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
                            if($rootScope._userInfo.hasOwnProperty('IsAuthenticate')){
                                if($rootScope._userInfo.IsAuthenticate == true || $rootScope._userInfo.IsAuthenticate == "true"){
                                    /**
                                     * Allow him to access the site as he is already logged in
                                     */
                                }
                                else{
                                    $location.path('/');
                                }
                            }
                            else{
                                $location.path('/');
                            }
                        }
                        else{
                            $location.path('/');
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
                        $location.path('/');
                    }
                }
                else {
                    // Sorry! No Web Storage support..
                    $rootScope._userInfo = {
                        IsAuthenticate: false,
                        Token: '',
                        FirstName: '',
                        Type: '',
                        Icon: ''
                    };
                    alert('Sorry..! Your browser is not supported. Upgrade to latest browser');
                    $location.path('/');
                }
            }
        });

        $rootScope.$on('$routeChangeSuccess',function(){
            if($location.path() == '/' || $location.path() == '/home'){
                //lazyLoadBackground($timeout);
                $("#background-image-container").show();
            }
        });
    }]);
    /************************************** Run Configuration ends here ****************************/

    var GURL = '/'; //Not required any more because we have already setup a value in angular for GURL
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

})();