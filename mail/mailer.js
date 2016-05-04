/**
 * Created by Hirecraft on 16-02-2016.
 */
var fs = require('fs');
var os = require('os');
var nodemailer = require('nodemailer');
var ejs = require('ejs');
var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
var smtpTransport = require('nodemailer-smtp-transport');

var separator = '/';
if(os.platform == 'win32'){
    separator = '\\';
}

var parseDirectorySeparator= function (filePath){
    var pathComp = filePath.split('/');
    return pathComp.join(separator);
};

try{
    var conf = fs.readFileSync(__dirname + separator + '..'+separator+'ezeone-config.json');
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

function Ezeone(globalConfig){
    if(!globalConfig){
        globalConfig = defaultConfig;
    }
    this.CONFIG = globalConfig.MAIL;
}


Ezeone.prototype.renderTemplate = function(mailType,params){
    var mDirectory = 'templates';
    var fileContent = fs.readFileSync(__dirname + separator + mDirectory + separator +parseDirectorySeparator(this.CONFIG.TEMPLATES[mailType].file),'utf-8');
    return ejs.render(fileContent,params);
};

/**
 * Supports mail in a generic container so that the mail templates can be created just of body without worrying about the design
 * @param mailType
 * @param params
 * @returns {String}
 */
Ezeone.prototype.renderTemplateNew = function(mailType,params){
    var mDirectory = 'templates';
    var genericTemplate = fs.readFileSync(__dirname + separator + mDirectory + separator +this.CONFIG.TEMPLATES["generic"].file,'utf-8');
    var innerMailTemplate = fs.readFileSync(__dirname + separator + mDirectory + separator +parseDirectorySeparator(this.CONFIG.TEMPLATES[mailType].file),'utf-8');

    var pseudoTemplate = ejs.render(genericTemplate,{ innerMailTemplate : innerMailTemplate});

    return ejs.render(pseudoTemplate,params);
};


Ezeone.prototype.sendMail = function(type,parameters,subject,receiverEmail){
    var _this = this;
    type = (type) ? type : '';
    /**
     * @todo
     * Read types from configuration and attach parameter to the template
     * parse template and send mail
     */
    var template = null;

    for(var prop in _this.CONFIG.TEMPLATES){
        if(_this.CONFIG.TEMPLATES.hasOwnProperty(prop) && type == prop){
            template = _this.CONFIG.TEMPLATES[prop];
            break;
        }
    }
    var mParams = {
        APP_NAME :  _this.CONFIG.APP_NAME,
        DISCLAIMER : _this.CONFIG.DISCLAIMER
    };
    if(template){
        if(template.params){
            var vFlag = true;
            var vErrors = [];
            for(var i=0; i < template.params.length; i++){
                if(parameters[template.params[i]]){
                    mParams[template.params[i]] = parameters[template.params[i]];
                }
                else{
                    vFlag *= false;
                    vErrors.push('Missing argument for parameter :'+ template.params[i]);
                }
            }

            if(!vFlag){
                console.log(vErrors);
            }
            else{
                var htmlContent = _this.renderTemplate(type,mParams);
                if(htmlContent){
                    var mailOptions = {
                        from: _this.CONFIG.SENDER, // sender address
                        to: receiverEmail, // list of receivers
                        subject: (template.subject) ? template.subject : subject, // Subject line
                        text: htmlContent, // plaintext body
                        html: htmlContent // html body
                    };
                    sendgrid.send(mailOptions,function(error,info){
                        if(error){
                            console.log('Error in sending mail');
                            console.log(error);

                        }
                        else{
                            console.log('Mail sent successfully : ',info);
                            console.log(info);
                        }
                    });

                }
            }
        }
        else{
            console.log('Template has no parameters : '+type);
        }

    }
    else{
        console.log('Unknown mail template : '+type);
    }


};

/**
 * Same as sendMail but implemented for container based mail templates having similar design
 * in all the layouts of mail
 * @param type
 * @param parameters
 * @param subject
 * @param receiverEmail
 */
Ezeone.prototype.sendMailNew = function(type,parameters,subject,receiverEmail){
    var _this = this;
    type = (type) ? type : '';
    /**
     * @todo
     * Read types from configuration and attach parameter to the template
     * parse template and send mail
     */
    var template = null;

    for(var prop in _this.CONFIG.TEMPLATES){
        if(_this.CONFIG.TEMPLATES.hasOwnProperty(prop) && type == prop){
            template = _this.CONFIG.TEMPLATES[prop];
            break;
        }
    }
    var mParams = {
        APP_NAME :  _this.CONFIG.APP_NAME,
        DISCLAIMER : _this.CONFIG.DISCLAIMER
    };
    if(template){
        if(template.params){
            var vFlag = true;
            var vErrors = [];
            for(var i=0; i < template.params.length; i++){
                if((typeof parameters[template.params[i]] !== "undefined") && (parameters[template.params[i]] !== null)){
                    mParams[template.params[i]] = parameters[template.params[i]];
                }
                else{
                    vFlag *= false;
                    vErrors.push('Missing argument for parameter :'+ template.params[i]);
                }
            }

            if(!vFlag){
                console.log(vErrors);
            }
            else{
                var htmlContent = _this.renderTemplateNew(type,mParams);
                if(htmlContent){
                    var mailOptions = {
                        from: _this.CONFIG.SENDER, // sender address
                        to: receiverEmail, // list of receivers
                        subject: (template.subject) ? template.subject : subject, // Subject line
                        text: htmlContent, // plaintext body
                        html: htmlContent // html body
                    };
                    sendgrid.send(mailOptions,function(error,info){
                        if(error){
                            console.log('Error in sending mail');
                            console.log(error);

                        }
                        else{
                            console.log('Mail sent successfully : ',info);
                            console.log(info);
                        }
                    });

                }
            }
        }
        else{
            console.log('Template has no parameters : '+type);
        }

    }
    else{
        console.log('Unknown mail template : '+type);
    }


};



module.exports = Ezeone;