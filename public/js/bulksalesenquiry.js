/*angular.module('ezeidApp').controller('bulksalesController', function($http, $rootScope, $scope, Notification, GURL){*/
angular.module('ezeidApp').controller('bulksalesController',['$http', '$rootScope', '$scope', '$q', 'Notification', '$window', 'GURL', function($http, $rootScope, $scope, $q, Notification, $window, GURL){


    var salesEnquiry = this;
    salesEnquiry._info = {};
    var MsgDelay = 2000;
    $scope.validationMode = 0;

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
            window.location.href = "/home";
        }
    }

    $scope.$watch('_userInfo.IsAuthenticate', function () {

        getTemplateList();
    });

    $scope.formTitle = "Bulk Sales Enquiry";

    // Create new mail template
    salesEnquiry.addNewTemplateForm = function (_NewEdit) {
       if(_NewEdit == 'new')
        {
            $scope.validationMode = 1;
            // window.location.href = "#/create-template";
            salesEnquiry._info.FromName = "";
            salesEnquiry._info.FromEmailID = "";
            salesEnquiry._info.Title = "";
            salesEnquiry._info.Subject = "";
            salesEnquiry._info.Body = "";
            salesEnquiry._info.TID = "";
            salesEnquiry._info.CCMailIDS = "";
            salesEnquiry._info.BCCMailIDS = "";
            $scope.formTitle = "Create mail template";
            $scope.showCreateMailTemplate = true;
        }
        else
        {
            $scope.validationMode = 2;
            $scope.formTitle = "Edit mail template";
            $scope.showCreateMailTemplate = true;
        }

    };

    // save mail template
    salesEnquiry.saveMailTemplate = function () {

        salesEnquiry._info.Token = $rootScope._userInfo.Token;

        if(isValidate())
        {
            $http({ method: 'post', url: GURL + 'ewtSaveMailTemplate', data: salesEnquiry._info }).success(function (data) {

                if (data != 'null') {
                    //salesEnquiry._info = {};

                    salesEnquiry._info.FromName = "";
                    salesEnquiry._info.FromEmailID = "";
                    salesEnquiry._info.Title = "";
                    salesEnquiry._info.Subject = "";
                    salesEnquiry._info.Body = "";
                    salesEnquiry._info.TID = "";
                    salesEnquiry._info.CCMailIDS = "";
                    salesEnquiry._info.BCCMailIDS = "";


                   /* salesEnquiry._info.FromName = "";
                    salesEnquiry._info.FromEmailID = "";
                    salesEnquiry._info.Title = "";
                    salesEnquiry._info.Subject = "";
                    salesEnquiry._info.Body = "";
                    salesEnquiry._info.TID = "";
                    salesEnquiry._info.CCMailIDS = "";
                    salesEnquiry._info.BCCMailIDS = "";

                    document.getElementById("FromName").className = "form-control WhiteTextBox";
                    document.getElementById("FromEmailID").className = "form-control WhiteTextBox";
                    document.getElementById("Title").className = "form-control WhiteTextBox";
                    document.getElementById("Subject").className = "form-control WhiteTextBox";
                    document.getElementById("Body").className = "form-control WhiteTextBox";*/


                    getTemplateList();

                    $scope.formTitle = "Bulk Sales Enquiry";
                    $scope.showCreateMailTemplate = false;
                    $scope.validationMode = 0;

                    //$("input#FromName").removeClass("mandatoryTextBox").addClass("form-control");
                    //$("input#FromName").attr("class", "newForm-Control");


                    /*
                    document.getElementById("FromName").className = "form-control emptyBox";
                    document.getElementById("FromEmailID").className = "form-control emptyBox";
                    document.getElementById("Title").className = "form-control emptyBox";
                    document.getElementById("Subject").className = "form-control emptyBox";
                    document.getElementById("Body").className = "form-control emptyBox";
                    */

                }
                else {
                    // Notification.error({ message: 'Invalid key or not found…', delay: MsgDelay });

                }
            });
        }
    };

    // Validation function for creating mail template
    function isValidate()
    {
        var notificationMessage = "";
        var errorList  = [];
        // Check validations
        if(!salesEnquiry._info.Title)
        {
            errorList.push('Template title is Required');
        }

        if(!salesEnquiry._info.FromName)
        {
            errorList.push('From name Required');
        }
        if(!salesEnquiry._info.FromEmailID)
        {
            errorList.push('From email is Required');
        }
        if(!salesEnquiry._info.Subject)
        {
            errorList.push('Subject is Required');
        }
        if(!salesEnquiry._info.Body)
        {
            errorList.push('Body is Required');
        }
        if(salesEnquiry._info.isWrongEmailPatternFrom)
        {
            errorList.push('Not valid email!');
        }
        if(salesEnquiry._info.isWrongEmailPatternCc)
        {
            errorList.push('Not valid email!');
        }
        if(salesEnquiry._info.isWrongEmailPatternBcc)
        {
            errorList.push('Not valid email!');
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

    // Api call for getting list of all mail templates, for displaing in dropdown
    function getTemplateList()
    {
        $http({
            method: 'get',
            url: GURL + 'ewtGetTemplateList?Token=' + $rootScope._userInfo.Token
        }).success(function (data) {
                if(data !== "null")
                {
                    console.log(data);
                    if($rootScope._userInfo.Token == false) {
                        var _obj = { TID: 0, Title: '--Select Template--' };
                        data.splice(0, 0, _obj);
                        bulksalesController._info.TID = _obj.TID;
                    }
                    salesEnquiry.templates = data;
                }
            });
    }

    // Close Create Mail Template Form
    salesEnquiry.closeCreateMailTemplateForm = function () {
        $scope.formTitle = "Bulk Sales Enquiry";
        $scope.showCreateMailTemplate = false;
        $scope.validationMode = 0;
    };

    // get template details
    salesEnquiry.getTemplateDetails = function (Tid) {
        if(Tid != undefined)
        {
            $http({
                method: 'get',
                url: GURL + 'ewtGetTemplateDetails?Token=' + $rootScope._userInfo.Token + '&TID='+Tid}).success(function (data) {
                    if(data !== "null")
                    {
                        console.log(data);
                        salesEnquiry._info = data[0];
                    }
                });
        }
    };

    // send sales enquiry mail
    salesEnquiry.SendEnquiryMail = function () {

        salesEnquiry._info.Token = $rootScope._userInfo.Token;

        if(isValidate())
        {
            /*$http({ method: 'post', url: GURL + 'ewtSaveMailTemplate', data: salesEnquiry._info }).success(function (data) {

                if (data != 'null') {
                    salesEnquiry._info = {};

                    $scope.formTitle = "Bulk Sales Enquiry";
                    $scope.showCreateMailTemplate = false;

                    document.getElementById("FromName").className = "form-control emptyBox";
                    document.getElementById("FromEmailID").className = "form-control emptyBox";
                    document.getElementById("Title").className = "form-control emptyBox";
                    document.getElementById("Subject").className = "form-control emptyBox";
                    document.getElementById("Body").className = "form-control emptyBox";

                    // success msg
                    // " Mails are submitted for transmitted "
                }
                else {
                    // Notification.error({ message: 'Invalid key or not found…', delay: MsgDelay });

                }
            });*/
        }
    };

    // Close Create Mail Template Form
    salesEnquiry.closeSalesEnquiryForm = function () {
        window.location.href = "#/home";
    };


/*
  });
*/
}]);
