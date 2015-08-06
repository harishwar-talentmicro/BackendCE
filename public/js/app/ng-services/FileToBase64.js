'use strict';

/**
 * Converts any binary file to base64 encoded text
 * @ngdoc service
 * @name ezeidAp.FileToBase64
 * @description
 * # FileToBase64
 * Service in the ezeidApApp.
 */
(function(){

    angular.module('ezeidApp')
        .service('FileToBase64',['$q',function($q){
            var x =  {
                'dataURL': null,
                'fileToDataUrl':function(file){
                    var deferred = $q.defer();
                    try{
                        var fileReader = new FileReader();
                        fileReader.onload = function(){

                            x.dataURL =  fileReader.result;
                            deferred.resolve(fileReader.result);
                        };
                        fileReader.readAsDataURL(file[0]);
                    } catch(ex){
                        //Error with fileReader
                    }
                    return deferred.promise;
                }
            };
            return x;
        }]);

})();
