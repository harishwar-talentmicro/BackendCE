var HeaderApp = angular.module('ngHeader', ['ui-notification']);
HeaderApp.directive('headerSection',['Notification','$window' ,function (Notification,$window) {
    //var GURL = 'https://www.ezeid.com/';
    return {
        restrict: 'EA',
        templateUrl: 'directives/Header.html',
        controller: ['$http', '$rootScope','$location','$window','GURL',function ($http, $rootScope,$location,$window,GURL) {
            var MsgDelay = 2000;
            var SignCtrl = this;
            this.LInfo = {};
            this.AccsHis = [];
            SignCtrl.RegInfo = {};

            //login
            this.LoginUser = function (Logdata, form) {

                if (!SignCtrl.Captcha) {
                    $http({
                        method: 'post', url: GURL + 'ewLogin', data: Logdata
                    }).success(function (data,status,x) {
                        $rootScope._userInfo = data;

                            if ($rootScope._userInfo.IsAuthenticate == true) {
                                // Notification.success({ message: "Sign In Success", delay: MsgDelay });

                                $('#SignIn_popup').slideUp();

                                $window.history.forward();
                               // $location.path('/');
                                if (form) {
                                    form.$setPristine();
                                    form.$setUntouched();
                                }
                                if($rootScope.defer){
                                    $rootScope.defer.resolve({message:'Search Done'});
                                }
                                SignCtrl.LInfo = {};
                            }
                            else{
                                SignCtrl.FMessage = 'Invalid Credentials';
                                return;
                            }

                            var userName = data.FirstName;
                            if(userName != null)
                            {
                                if(userName.length >= 15)
                                {
                                    userName = userName.substring(0,12);
                                    userName = userName+ "...";
                                }
                                $rootScope._userInfo.userName = userName ;
                            }
                            if($rootScope._userInfo.hasOwnProperty('MasterID')){
                                if($rootScope._userInfo.MasterID > 0){
                                    userName = Logdata.UserName;
                                }
                            }

                            $rootScope._userInfo.userName = userName.toUpperCase();

                        if (typeof (Storage) !== "undefined") {
                            var encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), "EZEID");
                            localStorage.setItem("_token", encrypted);
                        } else {
                            alert('Sorry..! Browser is not supported');
                            window.location.href = "/";
                        }
                    });
                }
                else {
                    SignCtrl.FMessage = 'You are a Robot...!!';
                }
            };
            this.reset = function (form) {
                if (form) {
                    form.$setPristine();
                    form.$setUntouched();
                }
                this.LInfo = {};
                $('#SignIn_popup').slideUp();
            };

            //forgot password
            this.openForgotPasswordForm=function(){
                SignCtrl.EzeId="";
                $('#forgot-password').slideDown();
                $(".wd_forgot").focus();
            };
            this.forgotPassword=function(){
                $http({
                    method: 'post', url: GURL + 'ewtForgetPassword', data: {EZEID:SignCtrl.EzeId}
                }).success(function (data) {
                    if(data.IsChanged){
                        $('#SignIn_popup').slideUp();
                        $('#forgot-password').slideUp();

                       Notification.success({ message: "Password sent to your registered email", delay: MsgDelay });
                        SignCtrl.EzeId="";
                        SignCtrl.ForgotMessage = "";
                    }else{
                        SignCtrl.ForgotMessage = "Error please Try again";
                        SignCtrl.EzeId="";
                    }
                });
            };
            this.closeForgotPasswordForm=function(){
                SignCtrl.ForgotMessage = "";
                $('#SignIn_popup').slideUp();
                $('#forgot-password').slideUp();
            };

            // open registration page
            //forgot password
            this.openRegistrationForm=function(){
                $('#SignIn_popup').slideUp();
                $location.path('/signup');
            };

            //Change password
            this.changePassword = function () {
                if( !SignCtrl.OldPassword=="" && !SignCtrl.NewPassword=="" && !SignCtrl.ReEnterPassword=="")
                {
                   $http({
                        method: 'post', url: GURL + 'ewtChangePassword', data: {Token:$rootScope._userInfo.Token,OldPassword:SignCtrl.OldPassword,NewPassword:SignCtrl.NewPassword}
                    }).success(function (data) {
                          if(data.IsChanged){

                              $('#ChangePassword_popup').slideUp();
                              SignCtrl.OldPassword="";
                              SignCtrl.NewPassword="";
                              SignCtrl.ReEnterPassword="";
                              $location.path('/');
                             /* document.getElementById("OldPassword").className = "form-control wd_oldPass changePass_inpMar emptyBox change_PadLeft";
                              document.getElementById("NewPassword").className = "form-control wd_oldPass changePass_inpMar emptyBox change_PadLeft";
                              document.getElementById("ReEnterPassword").className = "form-control wd_oldPass changePass_inpMar emptyBox change_PadLeft";
                              */
                          }
                          else{
                              SignCtrl.OldPassword="";
                              SignCtrl.NewPassword="";
                              SignCtrl.ReEnterPassword="";
                              document.getElementById("OldPassword").className = "form-control wd_oldPass changePass_inpMar emptyBox change_PadLeft";
                              document.getElementById("NewPassword").className = "form-control wd_oldPass changePass_inpMar emptyBox change_PadLeft";
                              document.getElementById("ReEnterPassword").className = "form-control wd_oldPass changePass_inpMar emptyBox change_PadLeft";
                              SignCtrl.ErrorMessage="Password mismatch...";
                          }
                        });
                }
                else
                {
                    SignCtrl.OldPassword="";
                    SignCtrl.NewPassword="";
                    SignCtrl.ReEnterPassword="";

                }
            };
            this.closeChangePasswordForm=function(){
                  $('#ChangePassword_popup').slideUp();
            };

            this.Logout = function () {
                $http({ method: 'get', url: GURL + 'ewLogout?Token=' + $rootScope._userInfo.Token }).success(function (data) {
                    localStorage.removeItem("_token");
                    $rootScope._userInfo = data;
                    $rootScope.IsIdAvailable = false;
                    $window.localStorage.removeItem("searchResult");
                    $location.path('/');
                  //  Notification.success({ message: "Sign Out Success", delay: MsgDelay });
                });
            };

            this.openChangePasswordForm=function(){
                SignCtrl.OldPassword="";
                SignCtrl.NewPassword="";
                SignCtrl.ReEnterPassword="";
                document.getElementById("OldPassword").className = "form-control wd_oldPass changePass_inpMar emptyBox change_PadLeft";
                document.getElementById("NewPassword").className = "form-control wd_oldPass changePass_inpMar emptyBox change_PadLeft";
                document.getElementById("ReEnterPassword").className = "form-control wd_oldPass changePass_inpMar emptyBox change_PadLeft";
                $('#ChangePassword_popup').slideDown();

            };

            //Open Quick SignUp Form
            this.openQuickSignUpForm=function(){
                $('#SignIn_popup').slideUp();
                $('#signup_popup').slideDown();
             };

            // Sign Up Controller
                this.AddUser = function (form) {
                    $http({ method: 'post', url: GURL + 'ewSaveQucikEZEData', data: SignCtrl.RegInfo }).success(function (data) {
                        $rootScope._userInfo = data;
                        if (typeof (Storage) !== "undefined") {
                            var encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), "EZEID");
                            localStorage.setItem("_token", encrypted);
                        } else {
                            alert('Sorry..! Browser does not support');
                            window.location.href = "/";
                        }
                        if ($rootScope._userInfo.IsAuthenticate == true) {
                            //Notification.success({ message: "SignIn Success", delay: MsgDelay });
                            $('#signup_popup').slideUp();
                            SignCtrl.RegInfo = {};
                            if (form) {
                                form.$setPristine();
                                form.$setUntouched();
                            }
                        }
                        else {
                            SignCtrl.RegInfo = {};
                            if (form) {
                                form.$setPristine();
                                form.$setUntouched();
                            }
                            SignCtrl.RMessage = 'Registration failed';
                        }
                    });
                };

                this.resetSignUpForm = function (form) {
                    $('#signup_popup').slideUp();
                    this.RegInfo = {};
                    if (form) {
                        form.$setPristine();
                        form.$setUntouched();
                    }
                };
        }],
        controllerAs: 'SignInCtrl',
        link: function () {

            $("body").on('click',function(e){
                if ( $('#userid_popup').is(':visible') ){
                    $("#userid_popup").hide();
                }
            });

            $("body").on('click','#userid',function(e){
                e.stopPropagation();
                if (! $('#userid_popup').is(':visible') ){
                    $("#userid_popup").show();
                }
            });

            $("body").on('click','#signin',function(e){
                $("#SignIn_popup").slideDown();
                $("#UserName").focus();
            });
            /******************end :  New code ************************/



            $('.closelink').click(function () {
                $('#ChangePassword_popup').slideUp();
                document.getElementById("OldPassword").className = "form-control wd_oldPass changePass_inpMar emptyBox change_PadLeft";
                document.getElementById("NewPassword").className = "form-control wd_oldPass changePass_inpMar emptyBox change_PadLeft";
                document.getElementById("ReEnterPassword").className = "form-control wd_oldPass changePass_inpMar emptyBox change_PadLeft";
            });
        }
    };
}]);