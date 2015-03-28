/**
 * @author Hirecraft
 * @desc ScaleAndCrop Service
 * @return Service Instance
 * @example
 * var image = $("#elem-id")[0].files[0];
 * ScaleAndCropImage.convertToBase64(image).then(function(imageUrl){
 *      var scaledImageUrl = ScaleAndCropImage.scalePropotional(imageUrl,90,200);
 *      var finalImage = ScaleAndCropImage.cropImage(scaledImageUrl,90,200);
 * });
 *
 *
 */
angular.module('ezeidApp').service('ScaleAndCropImage',['$q',function($q){
    return {
         covertToBase64 : function (image){

             var deferred = $q.defer();

             var fileReader = new FileReader();
             try{
                 fileReader.onload = function(){
                     deferred.resolve(fileReader.result);
                 };
             }
             catch(ex){
                 deferred.reject('An error occured while reading file');
             }

             fileReader.readAsDataURL(image);
             return deferred.promise;
         },

        scalePropotional : function(imageDataUrl,requiredHeight,requiredWidth){
            var img = new Image();
            img.src = imageDataUrl;

            var scaleHeight = 0;
            var scaleWidth = 0;

            if(requiredHeight > requiredWidth){

                if(img.height < img.width){
                    scaleHeight = requiredHeight;
                    scaleWidth = (img.width * scaleHeight) / img.height;
                }

                else{
                    scaleWidth = requiredWidth;
                    scaleHeight = (img.height * scaleWidth) / img.width;
                }
            }

            else{
                if(img.height > img.width){
                    scaleWidth = requiredWidth;
                    scaleHeight = (img.height * scaleWidth) / img.width;
                }

                else{

                    scaleHeight = requiredHeight;
                    scaleWidth = (img.width * scaleHeight) / img.height;
                    if(scaleWidth < requiredWidth){
                        scaleWidth = requiredWidth;
                        scaleHeight = (img.height * scaleWidth) / img.width;
                    }
                }
            }

            var canvas = document.createElement('canvas');
            canvas.className = 'sc-canvas';
            canvas.height = scaleHeight;
            canvas.width = scaleWidth;
            var ctx = canvas.getContext('2d');
            /**
             * Scaling Image Proptionally
             */
            ctx.drawImage(img, 0, 0, scaleWidth,scaleHeight);
            var retVal = canvas.toDataURL("image/jpeg", 1.0);
            $('.sc-canvas').remove();
            return retVal;
        },

        cropImage : function(imageDataUrl,requiredHeight,requiredWidth){
            var img = new Image();
            img.src = imageDataUrl;

            var canvas = document.createElement('canvas');
            canvas.className = 'cr-canvas';
            canvas.height = requiredHeight;
            canvas.width = requiredWidth;
            var ctx = canvas.getContext('2d');
            /**
             * Cropping Image
             */
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0,0,canvas.width,canvas.height);


            ctx.drawImage(img,0,0);
            var retVal = canvas.toDataURL("image/jpeg", 1.0);
            $('.cr-canvas').remove();
            console.log('Cropped Image');
            console.log(retVal);
            return retVal;
        }

    };
}]);
