angular.module('ezeidApp').controller('ChatController',[
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
          $scope.groupTitle = "";
          $scope.chatListing = "html/chat/chatListing.html";
          $scope.groupListing = "html/chat/groupListing.html";
          $scope.chatMessage = "html/chat/chatMessage.html";

          //$scope.activeTemplate = $scope.chatListing;
          $scope.activeTemplate = $scope.groupListing;

        //Open add group popup
        $scope.openAddGroupPopup = function(){

            if($rootScope._userInfo.Token == 2)
            {
                $('#SignIn_popup').slideDown();
            }
            else
            {
                $('#createGroup_popup').slideDown();
            }
        };

        // Close add group popup
        $scope.closeAddGroupPopupForm = function(){
            $('#createGroup_popup').slideUp();
        };

        // create group popup
        $scope.createNewGroup = function(){

         // console.log($scope.groupTitle);
          $http({ method: 'post', url: GURL + 'ewtSaveGroupChatList', data: {Token: $rootScope._userInfo.Token, GroupTitle: $scope.groupTitle}}).success(function (data)
            {
            console.log(data);
               if (data != 'null')
               {
                  $scope.groupTitle = "";
                  $scope.activeTemplate = $scope.groupListing;
                  //  salesEnquiry._info = {};
                   //
                  //  $scope.formTitle = "Bulk Sales Enquiry";
                  //  $scope.showCreateMailTemplate = false;

                  //  document.getElementById("FromName").className = "form-control emptyBox";
                  //  document.getElementById("FromEmailID").className = "form-control emptyBox";
                  //  document.getElementById("Title").className = "form-control emptyBox";
                  //  document.getElementById("Subject").className = "form-control emptyBox";
                  //  document.getElementById("Body").className = "form-control emptyBox";
                   //
                  //  Notification.success({message: "Mails are submitted for transmitted..", delay: MsgDelay});
                  //  $window.localStorage.removeItem("searchResult");
                  //  $window.localStorage.removeItem("selectedTids");
                }
               else
               {
                   // Notification.error({ message: 'Invalid key or not found…', delay: MsgDelay });
               }
          });
        };
    }]);
