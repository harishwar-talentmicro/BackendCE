angular.module('imageupload', [])
    .directive('image', function($q,$rootScope) {
        /*'use strict'*/
        var URL = window.URL || window.webkitURL;

        var getResizeArea = function () {

            var resizeAreaId = 'fileupload-resize-area';

            var resizeArea = document.getElementById(resizeAreaId);

            if (!resizeArea) {
                resizeArea = document.createElement('canvas');
                resizeArea.id = resizeAreaId;
                resizeArea.style.visibility = 'hidden';
                document.body.appendChild(resizeArea);
            }
            return resizeArea;
        }

        var resizeImage = function (origImage, options) {

            var maxHeight = options.resizeMaxHeight || 300;
            var maxWidth = options.resizeMaxWidth || 250;
            var quality = options.resizeQuality || 0.7;
            var type = options.resizeType || 'image/jpg';

          /*  var canvas = getResizeArea();
            var height = origImage.height;
            var width = origImage.width;

            // calculate the width and height, constraining the proportions
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round(height *= maxWidth / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round(width *= maxHeight / height);
                    height = maxHeight;
                }
            }*/
          /*  canvas.width = width;
            canvas.height = height;*/
            console.log($rootScope._userInfo.Type);
            var canvas = getResizeArea();
            if($rootScope._userInfo.Type == 1)
            {
                console.log("sai11");

                var width = 77;
                var height = 90;

                canvas.width = width;
                canvas.height = height;
            }
            else
            {
                console.log("sai22");

                var width = 280;
                var height = 90;

                canvas.width = width;
                canvas.height = height;
            }

            //draw image on canvas
            var ctx = canvas.getContext("2d");
           // ctx.drawImage(origImage, 0, 0, width, height);
            ctx.drawImage(origImage, 0, 0, origImage.width, origImage.height, 0, 0, width, height);
            console.log("big",canvas.toDataURL(type, quality));
            $rootScope.BigImage = canvas.toDataURL(type, quality);


            //small image
            var canvas1 = getResizeArea();
            var height1 = 40;
            var width1 = 40;
            canvas1.width = width1;
            canvas1.height = height1;

            //draw image on canvas
            var ctx1 = canvas1.getContext("2d");
            ctx1.drawImage(origImage, 0, 0, width1, height1);
            console.log("small",canvas1.toDataURL(type, quality));

            $rootScope.smallImage = canvas1.toDataURL(type, quality);


          // get the data from canvas as 70% jpg (or specified type).
            return canvas1.toDataURL(type, quality);
        };



        var createImage = function(url, callback) {
           var image = new Image();
            image.onload = function() {
                callback(image);
            };
            image.src = url;
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


        var cropImage = function(imageDataUri,userType){
            var img = new Image();
            img.src = imageDataUri;

            var canvas = document.createElement('canvas');
            canvas.height = 90;
            canvas.width = (userType == 1) ? 77 : 280;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img,0,0,img.height,img.width);
            var x =  canvas.toDataURL("image/jpeg",1.0);


            /**
             * To create small Image in case of Individual
             */
            var small = null;
            if(userType == 1){
                canvas.height = 40;
                canvas.width = 40;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img,0,0,img.height,img.width,0,0,40,40);
                small = canvas.toDataURL("image/jpeg",1.0);
            }

            return {big : x,small : small};
        };
        /**
         * @author Indrajeet
         * New Link Function For directive
         */
        var newLinkFn = function(scope,elem,attrs,ctrl){
            console.log(elem);
            elem.on('change',function(){
                console.log(this);
                console.log($(this));
                var file = $(this)[0].files[0];
                console.log(file);
                var fileReader = new FileReader();
                var imageDataUri = null;
                fileReader.onload = function(){
                    imageDataUri =  fileReader.result;
                    console.log(fileReader.result);
                    console.log(scope.userType);
                    if(scope.userType == 1){


                        var picture = cropImage(imageDataUri,scope.userType);
                        scope.setPicture({pic : picture.big,icon : picture.small});
//                        $('#'+scope.individualPicContainerId).attr('src',cropImage(imageDataUri,scope.userType));
                    }
                    else {
                        var picture = cropImage(imageDataUri,scope.userType);
                        scope.setPicture({pic : picture.big,icon : picture.small});
//                        $('#'+scope.individualPicContainerId).attr('src',cropImage(imageDataUri,scope.userType));
                    }
                };
                fileReader.readAsDataURL(file);
            });
        };

        return {
            restrict: 'A',
            scope: {
                individualPicContainerId : '@',
                businessPicContainerId : '@',
                userType : '=',
                setPicture : '&'
            },
//            link: function postLink(scope, element, attrs, ctrl) {
//
//                var doResizing = function(imageResult, callback) {
//                    createImage(imageResult.url, function(image) {
//                        var dataURL = resizeImage(image, scope);
//                        imageResult.resized = {
//                            dataURL: dataURL,
//                            type: dataURL.match(/:(.+\/.+);/)[1],
//                        };
//                        callback(imageResult);
//                    });
//                };
//
//                var applyScope = function(imageResult) {
//                    scope.$apply(function() {
//                       if(attrs.multiple)
//                            scope.image.push(imageResult);
//                        else
//                            scope.image = imageResult;
//                    });
//                };
//
//
//                element.bind('change', function (evt) {
//                    //when multiple always return an array of images
//                    if(attrs.multiple)
//                        scope.image = [];
//
//                    var files = evt.target.files;
//                    for(var i = 0; i < files.length; i++) {
//                        //create a result object for each file in files
//                        var imageResult = {
//                            file: files[i],
//                            url: URL.createObjectURL(files[i])
//                        };
//
//                        fileToDataURL(files[i]).then(function (dataURL) {
//                            imageResult.dataURL = dataURL;
//                        });
//
//                        if(scope.resizeMaxHeight || scope.resizeMaxWidth) { //resize image
//                            doResizing(imageResult, function(imageResult) {
//                                applyScope(imageResult);
//                            });
//                        }
//                        else { //no resizing
//                            applyScope(imageResult);
//                        }
//                    }
//                });
//            }
            link : newLinkFn
        };
    });
