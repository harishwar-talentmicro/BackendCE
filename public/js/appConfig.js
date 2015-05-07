(function(){
    var settings = {
        dev : {
            GOOGLE_MAPS_API_KEY : ''
        },
        pro : {
            GOOGLE_MAPS_API_KEY : ''
        }
    };


    var hostname = location.hostname;
    angular.prototype.appSettings = (hostname == 'www.ezeid.com') ? settings['pro'] : settings['dev'];
})();