angular.module('ezeidApp').controller('ChatBoxCtrl',[
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
        ScaleAndCropImage,
        MsgDelay,
        $location,
        $routeParams
        ) {

        $scope.isChatBoxVisible = false;
        $scope.chatArrow = true;

        // Below function is for open/close chat window
        $scope.toggleChatBox = function(){
           $scope.isChatBoxVisible = !$scope.isChatBoxVisible;
           if($scope.isChatBoxVisible){
                console.log("visibal");
                $(".chat-box").addClass('active');
                $scope.chatArrow = false;
            }
            else
            {
                $scope.chatArrow = true;
                console.log("In-visibal");
                $(".chat-box").removeClass('active');
            }


            /*$scope.isChatBoxVisible = !$scope.isChatBoxVisible;
            if($scope.isChatBoxVisible){
                $(".chat-box-container").addClass('active');
                $(".chat-toggle-box").addClass('active');
            }
            else{
                $(".chat-box-container").removeClass('active');
                $(".chat-toggle-box").removeClass('active');
            }*/

        };

        //Open add group popup
        $scope.openAddGroupPopup = function(){
            console.log("SAi")
        };

    }]);