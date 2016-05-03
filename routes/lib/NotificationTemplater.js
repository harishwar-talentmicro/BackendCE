/**
 * Notification Templater Library
 * @author Indra Jeet
 * @since 16-02-2016
 * @desc Saving template for generic notification
 */
var fs = require('fs');
var os = require('os');
var ejs = require('ejs');


var separator = '/';
if(os.platform == 'win32'){
    separator = '\\';
}

var parseDirectorySeparator= function (filePath){
    var pathComp = filePath.split('/');
    return pathComp.join(separator);
};

try{
    var conf = fs.readFileSync(__dirname + separator + '..'+ separator+ '..'+ separator +'ezeone-config.json');
    if(conf){
        var jConf = JSON.parse(conf);
        if(typeof(jConf) == 'object'){
            defaultConfig = jConf;
        }
    }
}
catch(ex){
    console.log(ex);
}

function NotificationTemplater(globalConfig){
    if(!globalConfig){
        globalConfig = defaultConfig;
    }
    this.CONFIG = globalConfig.NOTIFICATION;
}


NotificationTemplater.prototype.renderTemplate = function(notificationType,params){
    var fileContent = fs.readFileSync(__dirname + separator + '..'+ separator+ '..'+ separator + 'templates' + separator+ 'notification' + separator  + parseDirectorySeparator(this.CONFIG.TEMPLATES[notificationType].file),'utf-8');
    return ejs.render(fileContent,params);
};

/**
 * Parse notification template and returns the object
 *
 * @param notificationTplType
 * @param notificationTplParams
 * @returns {*}
 * @returnObjectSchema { parsedTpl : <notificationText> , error : <array of errors>}
 */
NotificationTemplater.prototype.parse = function(notificationTplType,notificationTplParams){
    var _this = this;
    notificationTplType = (notificationTplType) ? notificationTplType : '';

    var template = null;

    for(var prop in _this.CONFIG.TEMPLATES){
        if(_this.CONFIG.TEMPLATES.hasOwnProperty(prop) && type == prop){
            template = _this.CONFIG.TEMPLATES[prop];
            break;
        }
    }
    var mParams = {

    };
    if(template && template.params){
        var vFlag = true;
        var vErrors = [];
        for(var i=0; i < template.params.length; i++){
            if(notificationTplParams[template.params[i]]){
                mParams[template.params[i]] = notificationTplParams[template.params[i]];
            }
            else{
                vFlag *= false;
                vErrors.push('Missing argument for parameter :'+ template.params[i]);
            }
        }

        if(!vFlag){
            console.log(vErrors);
            return {
                error : vErrors,
                parsedTpl : null
            }
        }
        else{
            var notificationContent = _this.renderTemplate(notificationTplType,mParams);
            if(notificationContent){
                return {
                    error : vErrors,
                    parsedTpl : notificationContent
                }
            }
        }
    }
    else{
        console.log('Unknown notification template : '+notificationTplType);
        return {
            error : ['Unknown template'],
            parsedTpl : null
        }

    }
};


module.exports = NotificationTemplater;
