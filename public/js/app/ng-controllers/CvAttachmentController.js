angular.module('ezeidApp').controller('CVAttachController',[
    '$http', '$rootScope', '$scope', '$timeout', 'Notification', '$filter','$q', '$window','GURL',
    function($http, $rootScope, $scope, $timeout, Notification, $filter,$q, $window,GURL){

    var CVAttachCtrl = this;
    CVAttachCtrl._CVInfo={};
    var MsgDelay = 2000;
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

    //if secure pin checkbox is uncheck remove PIN Value
    this.securePinCliked = function () {
        if(!CVAttachCtrl.EnablePin)
        {
            CVAttachCtrl._CVInfo.Pin = "";
        }
    };

   $scope.uploadFile = function (files) {
        $scope.DocumentToUpload = files;
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

    function isValidate()
    {
       var notificationMessage = "";
        var errorList  = [];
        if(CVAttachCtrl._CVInfo.Pin)
        {
            if(CVAttachCtrl._CVInfo.Pin<100)
            {
                errorList.push('Pin should greater or equal 100');
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

    this.saveCVDocInfo=function(){

   if(isValidate())
    {
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
                //    window.location.href = "/home";
                }else{
                    Notification.error({message: "Sorry..! not saved", delay: MsgDelay});
                }
            });

        if($scope.DocumentToUpload)
        {
            CVAttachCtrl._CVInfo.CVDocFile = $scope.DocumentToUpload[0].name;
           // for (var i = 0; i < $scope.DocumentToUpload.length; i++) {
                var $file = $scope.DocumentToUpload[0];
                var formData = new FormData();
                formData.append('file', $file);
                formData.append('TokenNo', $rootScope._userInfo.Token);
                formData.append('RefType', 7);

                $http({ method: 'POST', url: '/ewTUploadDoc/', data: formData,
                    headers: { 'Content-Type': undefined }, transformRequest: angular.identity })
                    .success(function (data, status, headers, config) {
                        window.location.href = "/home";
                    });
                /*  error(function(data, status, headers, config) {
                 });*/
           // }
        }

        }
    };

    this.download = function(){
        //window.location.assign(CVAttachCtrl._CVInfo.CVDoc);
        $window.open(CVAttachCtrl._CVInfo.CVDoc);
    };

    function getCVInfo(){
       $http({
            method: 'get',
//            url: GURL + 'ewtGetCVInfo?TokenNo=' + $rootScope._userInfo.Token
            url : GURL + 'ewtGetCVInfo',
            params : {
                TokenNo : $rootScope._userInfo.Token
            }
        }).success(function (data) {
              if(data && data !== 'null' && data.length > 0)
                {
                    CVAttachCtrl._CVInfo = data[0];
                    CVAttachCtrl.getRoleForFunction(data[0].FunctionID);

                    if(CVAttachCtrl._CVInfo.Pin)
                    {
                        CVAttachCtrl.EnablePin = true;
                    }
                    else
                    {
                        CVAttachCtrl.EnablePin = false;
                    }

                    if(data[0].CVDocFile == "")
                    {
                        $scope.showLink = false;
                    }else
                    {
                        $scope.showLink = true;
                    }
                }
                else
                {   CVAttachCtrl._CVInfo.Status= 1;
                    $scope.showLink = false;

                }
            });
    };

    this.closeCVDocInfo=function(cvForm){
        if($rootScope._userInfo.IsAuthenticate==false){
            cvForm.$setPristine(true);
        }
    };

}]);