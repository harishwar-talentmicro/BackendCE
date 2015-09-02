(function(){
    var settings = {
        dev : {
            RECAPTCHA_SITE_KEY : '',
            //SERVICE_URL : 'http://104.199.128.226:3001/api/'
            SERVICE_URL : 'http://localhost:3001/api/'
        },
        pro : {
            RECAPTCHA_SITE_KEY : '',
            SERVICE_URL : 'https://www.ezeone.com/api/'
        }
    };


    var hostname = location.hostname;
    console.log(hostname);
    angular.appSettings = (hostname == 'www.ezeid.com') ? settings['pro'] : settings['dev'];
})();