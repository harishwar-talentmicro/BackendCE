/**
 * @author Indrajeet
 * @description Google Recaptcha for Angular
 * @since 26/05/2015 11:59 AM IST
 *
 * @usage
 *  var captcha = new GoogleRecaptcha();
 *  captcha.render('< id of html element in which captcha to be rendered>');
 *  captcha.validate().then(function(){
 *      // Captcha validation successful
 *  },function(){
 *      // Captcha Validation fails
 *  });
 */
(function(){
    angular.module('ezeidApp').factory('GoogleRecaptcha',['$q','$http','GURL',function($q,$http,GURL){
        function GoogleRecaptcha(){
            this.siteKey = angular.appSettings['RECAPTCHA_SITE_KEY'];
            this.widgetId = null;
            this.captchaUrl = GURL + 'captcha';
        };

        GoogleRecaptcha.prototype.render = function(containerElemId){
            if(!containerElemId){
                console.error('Container element for recaptcha not found');
            }
            try{
                this.widgetId = grecaptcha.render(containerElemId,this.siteKey);
            }
            catch(ex){
                console.error('Error while rendering recaptcha');
            }

        };

        GoogleRecaptcha.prototype.validate = function(){
            var _this = this;
            var defer = $q.defer();


            $http({
                url : this.captchaUrl,
                method : 'POST',
                data : {
                    response : grecaptcha.getResponse(_this.widgetId)
                }
            }).success(function(resp){
                if(resp.status){
                    $q.resolve();
                }
                else{
                    $q.reject(resp);
                }
            }).error(function(err,status){
                if(!status){
                    console.info('Unable to reach server');
                    $q.reject({status : false, message : 'Unable to reach server', error : {
                        response : 'Unable to validate captcha'
                    }});
                }
                else{
                    $q.reject(err);
                }
            });
        };

        GoogleRecaptcha.prototype.reset = function(){
            try{
                grecaptcha.reset(this.widgetId);
            }
            catch(ex){
                console.error('Failed to reset captcha');
            }
        };

        return GoogleRecaptcha;

    }]);
})();