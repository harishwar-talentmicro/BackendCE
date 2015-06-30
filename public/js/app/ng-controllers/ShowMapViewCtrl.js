angular.module('ezeidApp').controller('ShowMapViewCtrl',[
    '$http',
    '$rootScope',
    '$scope',
    '$q',
    'Notification',
    '$timeout',
    '$window',
    '$routeParams',
    'GURL',
    'GoogleMaps',
    function(
        $http,
        $rootScope,
        $scope,
        $q,
        Notification,
        $timeout,
        $window,
        $routeParams,
        GURL,
        GoogleMap
        )
    {
        var viewDirection = this;

        var MsgDelay = 2000;
        var lat = 0, lng = 0;

        var googleMap = new GoogleMap();
        googleMap.getCurrentLocation().then(function(){
            var lat = googleMap.currentMarkerPosition.latitude;
            var lng = googleMap.currentMarkerPosition.longitude;

            console.log(lat);
            console.log(lng);

        });

        console.log($routeParams);


    //  EMail direction image
    viewDirection.emailDirectionImage = function ()
    {
        //Below line is for Loading img
        $scope.$emit('$preLoaderStart');
        $http({ method: 'post', url: GURL + 'ewtSendBulkMailer', data: { Token: $rootScope._userInfo.Token, TID: "", TemplateID: "", ToMailID: viewDirection._info.ToMailID, Attachment: finalImageSrc, AttachmentFileName :'ViewDirection.jpg'} }).success(function (data)
        {
            $rootScope.$broadcast('$preLoaderStop');
            if(data)
            {
                viewDirection._info.FromEmailID = "";
                viewDirection._info.ToMailID = "";
                Notification.success({message: "Mail are submitted for transmitted..", delay: MsgDelay});
                $window.localStorage.removeItem("searchResult");
                $scope.showEmailForm = false;
            }
            else
            {
                Notification.error({ message: 'Sorry..! Message not send ', delay: MsgDelay });
                $window.localStorage.removeItem("searchResult");
            }
    });
    };


}]);
