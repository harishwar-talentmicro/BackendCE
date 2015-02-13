/**
 * Created by Abhishek on 30-01-2015.
 */
angular.module('ezeidApp').controller('BusinessListController', function($http, $rootScope, $scope, $timeout, Notification, $filter,$q){

    var BusinessListCtrl = this;
    BusinessListCtrl._businessInfo={};
    var MsgDelay = 2000;
    if ($rootScope._userInfo) {
    }
    else {
        if (typeof (Storage) !== "undefined") {
            var encrypted = sessionStorage.getItem("_token");
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
            getBusinessInfo();
        } else {
            window.location.href = "index.html";
        }
    });

    $http({ method: 'get', url: GURL + 'ewmGetCategory?LangID=1' }).success(function (data) {
       /*  var _obj = { CategoryID: 0, CategoryTitle: '--Category--' };
         data.splice(0, 0, _obj);*/
        BusinessListCtrl.categories = data;
    });

    //Created by Abhishek
    $scope.uploadFile = function (files) {
        for (var i = 0; i < files.length; i++) {
            var $file = files[i];
            var formData = new FormData();
            formData.append('file', $file);
            //formData.append('RefType', $scope.OptionSelected);
            formData.append('TokenNo', $rootScope._userInfo.Token);
            formData.append('RefType', 6);

            $http({ method: 'POST', url: '/ewTUploadDoc/', data: formData,
                headers: { 'Content-Type': undefined }, transformRequest: angular.identity })
                .success(function (data, status, headers, config) {
               }).
                error(function(data, status, headers, config) {
                 });
        }
    };
   //End of Upload

    var fileToDataURL = function (file) {
        var deferred = $q.defer();
        var reader = new FileReader();
        reader.onload = function (e) {
            deferred.resolve(e.target.result);
        };
        reader.readAsDataURL(file);
        return deferred.promise;
    };


    this.saveBusinessList=function(){
        BusinessListCtrl._businessInfo. TokenNo=$rootScope._userInfo.Token;
        // BusinessListCtrl._businessInfo.Status=parseInt(CVAttachCtrl._businessInfo.Status);
        $http({
            method: "POST",
            url: GURL + 'ewtUpdateBussinessListing',
            data: JSON.stringify(BusinessListCtrl._businessInfo),
            headers: { 'Content-Type': 'application/json' }
        }).success(function (data) {
            if(data.IsUpdated) {
                Notification.success({message: "Saved...", delay: MsgDelay});
                getBusinessInfo();
                window.location.href = "#/home";
            }else{
                Notification.error({message: "Sorry..! not saved", delay: MsgDelay});
            }
        });
    };

      function getBusinessInfo(){
         $http({
         method: 'get',
         url: GURL + 'ewtGetBussinessListing?TokenNo=' + $rootScope._userInfo.Token
         }).success(function (data) {
            BusinessListCtrl._businessInfo=data[0];
         });
     };


});