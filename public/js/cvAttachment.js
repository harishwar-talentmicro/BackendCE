angular.module('ezeidApp').controller('CVAttachController', function($http, $rootScope, $scope, $timeout, Notification, $filter,$q, $window){

    var CVAttachCtrl = this;
    CVAttachCtrl._CVInfo={};
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
            getCVInfo();
        } else {
            window.location.href = "index.html";
            CVAttachCtrl._CVInfo.Status = 1;
        }
    });

    $http({ method: 'get', url: GURL + 'ewmGetFunctions?LangID=1'}).success(function (data) {
        // var _obj = { FunctionID:0, FunctionName: '--Select Function--' };
        //data.splice(0, 0, _obj);
        CVAttachCtrl.Functions = data;
    });

    this.getRoleForFunction=function(_functionId){
        $http({ method: 'get', url: GURL + 'ewmGetRoles?LangID=1&FunctionID='+_functionId}).success(function (data) {

            CVAttachCtrl.RoleTypes = data;
        });
    };

    $http({ method: 'get', url: GURL + 'ewmGetCountry?LangID=1' }).success(function (data) {
        var _obj = { CountryID: 0, CountryName: '--Country--', ISDCode: '' };
        data.splice(0, 0, _obj);
        CVAttachCtrl.countries = data;
    });
    this.getStates = function (CountryID) {
        $http({ method: 'get', url: GURL + 'ewmGetState?LangID=1&CountryID=' + CountryID }).success(function (data) {
            var _obj = { StateID: 0, StateName: '--State--' };
            CVAttachCtrl.states = data;
        });
    };
    this.getCities = function (StateID) {
        $http({ method: 'get', url: GURL + 'ewmGetCity?LangID=1&StateID=' + StateID }).success(function (data) {
            var _obj = { CityD: 0, CityName: '--City--' };
            CVAttachCtrl.cities = data;
        });
    };

    //Created by Abhishek
    $scope.uploadFile = function (files) {
        CVAttachCtrl._CVInfo.CVDocFile = files[0].name;
        for (var i = 0; i < files.length; i++) {
            var $file = files[i];
            var formData = new FormData();
            formData.append('file', $file);
            //formData.append('RefType', $scope.OptionSelected);
            formData.append('TokenNo', $rootScope._userInfo.Token);
            formData.append('RefType', 7);

            $http({ method: 'POST', url: '/ewTUploadDoc/', data: formData,
                headers: { 'Content-Type': undefined }, transformRequest: angular.identity })
                .success(function (data, status, headers, config) {
                   Notification.success({ message: "Saved... ", delay: MsgDelay });
                }).
                error(function(data, status, headers, config) {
                });
        }
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


    this.saveCVDocInfo=function(){
        CVAttachCtrl._CVInfo.TokenNo=$rootScope._userInfo.Token;
        CVAttachCtrl._CVInfo.Status=parseInt(CVAttachCtrl._CVInfo.Status);
        $http({
            method: "POST",
            url: GURL + 'ewtSaveCVInfo',
            data: JSON.stringify(CVAttachCtrl._CVInfo),
            headers: { 'Content-Type': 'application/json' }
        }).success(function (data) {
                if(data.IsSuccessfull) {
                    Notification.success({message: "Saved..", delay: MsgDelay});
                    getCVInfo();
                }else{
                    Notification.error({message: "Sorry..! not saved", delay: MsgDelay});
                }
            });
    };

    this.download = function(){
        window.location.assign(CVAttachCtrl._CVInfo.CVDoc);
        $window.open(CVAttachCtrl._CVInfo.CVDoc);
    }

    function getCVInfo(){
        $http({
            method: 'get',
            url: GURL + 'ewtGetCVInfo?TokenNo=' + $rootScope._userInfo.Token
        }).success(function (data) {
               if(data != 'null')
                {
                    CVAttachCtrl._CVInfo=data[0];
                    CVAttachCtrl.getRoleForFunction(data[0].FunctionID);

                    if(data[0].CVDocFile == "")
                    {
                        $scope.showLink = false;
                    }else
                    {
                        $scope.showLink = true;
                    }
                }
                else
                {
                    CVAttachCtrl._CVInfo.Status= 1;

                    if(data[0].CVDocFile != "")
                    {
                        $scope.showLink = true;
                    }
                    else
                    {
                        $scope.showLink = false;
                    }
                }

            });
    };

    this.closeCVDocInfo=function(cvForm){
        if($rootScope._userInfo.IsAuthenticate==false){
            cvForm.$setPristine(true);
        }

    };

    var content = 'file content';
    var blob = new Blob([ CVAttachCtrl._CVInfo.CVDoc ], { type : 'text/plain' });
    $scope.url = (window.URL || window.webkitURL).createObjectURL( blob );

});