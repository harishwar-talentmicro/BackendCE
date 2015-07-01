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
        $scope.showMapWithMarker = true;
        $scope.$emit('$preLoaderStart');


        var googleMap = new GoogleMap();
        googleMap.getCurrentLocation().then(function(){
            $scope.lat = googleMap.currentMarkerPosition.latitude;
            $scope.lng = googleMap.currentMarkerPosition.longitude;

            getStaticMap();

        });

       // console.log($routeParams);


        function getStaticMap()
        {
           /* document.getElementById('my-image-id').src = "http://maps.google.com/staticmap?center=37.687,-122.407&zoom=8&size=450x300&maptype=terrain&key=&sensor=false";*/

           /* document.getElementById('my-image-id').src = "https://maps.googleapis.com/maps/api/staticmap?zoom=6&size=400x400&markers=color:blue%7Clabel:S%"+lat+","+lng+"&markers=size:tiny%7Ccolor:green%7C"+ $routeParams.endLat +", " + $routeParams.endLong +"&markers=size:mid%7Ccolor:0xFFFF00%7Clabel:C%7CTok,AK%22";*/


            document.getElementById('my-image-id').src = "https://maps.googleapis.com/maps/api/staticmap?zoom=12&size=800x500&markers=color:blue%7Clabel:C%7C"+$scope.lat+","+$scope.lng+"&markers=color:red%7Clabel:A%7C"+$routeParams.endLat+","+$routeParams.endLong;
            $scope.$emit('$preLoaderStop');
            //return;


           /*$http({
                url: 'https://maps.googleapis.com/maps/api/staticmap',
                method: "GET",
                params: {
                    zoom: 6,
                    size: "400x400",
                    markers: "color:blue%7Clabel:S%7C62.107723,-145.541056",
                    markers: "color:green%7C62.107731,-145.541930",
                    markers: "color:0xFFFF00%7Clabel:C%7CTok,AK"
                }
            }).success(function (resp) {
                    console.log("SAi2");
                    console.log(resp);
                    if(resp)
                    {
                        $scope.mapImage = resp;
                      //  $('#googlemapbinary').attr('src', resp);

                       // document.getElementById('googlemapbinary').src = resp;

                        document.getElementById('my-image-id').src = resp;
                    }
                   // $scope.$emit('$preLoaderStop');

                }).error(function (err) {
                    $scope.$emit('$preLoaderStop');
                });*/
        }

        $scope.plotRoute = function(){

           // console.log("SAi5");


        };



    //  EMail direction image
    /*viewDirection.emailDirectionImage = function ()
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
    };*/


}]);
