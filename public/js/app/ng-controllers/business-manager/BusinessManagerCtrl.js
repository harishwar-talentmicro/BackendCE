angular.module('ezeidApp').controller('BusinessManager',[
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
    'ScaleAndCropImage',
    'MsgDelay',
    '$location',
    '$routeParams',
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
        $routeParams
        ) {

        /**
         * Returns index of Object from array based on Object Property
         * @param key
         * @returns {number}
         */
        Array.prototype.indexOfWhere = function(key,value){
            var resultIndex = -1;
            var found = false;
            for(var i = 0; i < this.length; i++){
                for(var prop in this[i]){
                    if(this[i].hasOwnProperty(key) && this[i][key] === value){
                        resultIndex = i;
                        found = true;
                        break;
                    }
                }
                if(found){
                    break;
                }
            }
            return resultIndex;
        };


        /**
         * Fetches Configuration Information
         */
        $scope.getConfig = function(){
            $http({
                url : GURL + 'ewtConfig',
                method : "GET",
                params : {
                    Token : $rootScope._userInfo.Token
                }
            }).success(function(resp){
                console.log(resp);
            }).error(function(err){
                Notification.error({ message : 'An error occured', delay : MsgDelay});
            });
        };



    }]);