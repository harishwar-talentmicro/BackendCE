(function(){
    var settings = {
        dev : {
            RECAPTCHA_SITE_KEY : ''
        },
        pro : {
            RECAPTCHA_SITE_KEY : ''
        }
    };


    var hostname = location.hostname;
    angular.appSettings = (hostname == 'www.ezeid.com') ? settings['pro'] : settings['dev'];
})();