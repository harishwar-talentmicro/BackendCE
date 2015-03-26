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

            /**
             * Calculating Differences for Height and Width to find out how
             * the image should be scaled (based on height or based on width
             */
            var dHeight = img.height - requiredHeight;
            var dWidth = img.width - requiredWidth;

            /**
             * Initially scaled image height and width are zero
             */
            var scaleHeight = 0;
            var scaleWidth = 0;

//            if(dHeight > dWidth){
//                /**
//                 * Here Image will be scaled based on width
//                 * Calculating scale factor
//                 */
//                scaleWidth = requiredWidth;
//                scaleHeight = (img.height * scaleWidth) / img.width;
//            }
//
//            else{
//                /**
//                 * Here Image will be scaled based on height
//                 * Calculating scale factor
//                 */
//                scaleHeight = requiredHeight;
//                scaleWidth = (scaleHeight * img.width) / img.height;
//            }

            if(dHeight < dWidth){
                /**
                 * Here Image will be scaled based on width
                 * Calculating scale factor
                 */
                scaleWidth = requiredWidth;
                scaleHeight = (img.height * scaleWidth) / img.width;
            }

            else{
                /**
                 * Here Image will be scaled based on height
                 * Calculating scale factor
                 */
                scaleHeight = requiredHeight;
                scaleWidth = (scaleHeight * img.width) / img.height;
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
            console.log('requiredHeight  '+requiredHeight + " imgHeight : "+img.height);
            console.log('requiredwidth  '+requiredWidth+ " imgwidth : "+img.width);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0,0,canvas.width,canvas.height);

//            ctx.drawImage(img,0,0,img.width,img.height,0,0,requiredWidth,requiredHeight);
            ctx.drawImage(img,0,0);
            var retVal = canvas.toDataURL("image/jpeg", 1.0);
            $('.cr-canvas').remove();
            return retVal;
        }

    };
}]);
