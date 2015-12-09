var fs = require('fs');
var os = require('os');
var nodemailer = require('nodemailer');
var ejs = require('ejs');
var transporter = null;
var smtpTransport = require('nodemailer-smtp-transport');

var separator = '/';
if(os.platform == 'win32'){
    separator = '\\';
}
var defaultConfig = {
    MAIL : {
        TEMPLATES : {},
        OPTIONS : {
            service: '',
            auth: {
                user: '',
                pass: ''
            }
        }
    }
};

try{
    var conf = fs.readFileSync(__dirname + separator + '..'+separator+'..'+separator+'config.json');
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


//// NB! No need to recreate the transporter object. You can use
//// the same transporter object for all e-mails
//
//// setup e-mail data with unicode symbols
//var mailOptions = {
//    from: 'Fred Foo ? <foo@blurdybloop.com>', // sender address
//    to: 'indrajeet0510@hotmail.com, indrajeetnagda@gmail.com', // list of receivers
//    subject: 'Hello ?', // Subject line
//    text: 'Hello world ?', // plaintext body
//    html: '<b>Hello world ?</b>' // html body
//};
//
//// send mail with defined transport object
//transporter.sendMail(mailOptions, function(error, info){
//    if(error){
//        console.log(error);
//    }else{
//        console.log('Message sent: ' + info.response);
//    }
//});

var path = require('path');
var file = path.join(__dirname,'../../ezeone-config.json');

var EJSCONFIG = JSON.parse(fs.readFileSync(file));
console.log(EJSCONFIG);
//var EJSCONFIG = JSON.parse(fs.readFileSync(__dirname+'../../../config1.json'));


function HussMailer(globalConfig){
    if(!globalConfig){
        globalConfig = defaultConfig;
    }
    this.CONFIG = globalConfig.MAIL;

    if(!transporter){
        // create reusable transporter object using SMTP transport
        transporter = nodemailer.createTransport(smtpTransport({
            host: 'localhost',
            port: 3001,
            auth: {
                user: 'root',
                pass: 'HussPro#1IndraHas'
            }
        }));

    }
}


HussMailer.prototype.renderTemplate = function(mailType,params){
    var mDirectory = '../../mail/templates/';
    var fileContent = fs.readFileSync(__dirname + separator + mDirectory + separator + EJSCONFIG.MAIL.TEMPLATES[mailType].file,'utf-8');
    console.log('---HTML RENDER FILE---');
    console.log(EJSCONFIG.MAIL.TEMPLATES[mailType].file);
    //console.log(fileContent);
    return ejs.render(fileContent,params);
};

HussMailer.prototype.sendMail = function(mailContent, CallBack){

    console.log('-----HUSS MAILER OF EJS-----');

    var _this = this;

    //console.log(mailContent);

    var type = (mailContent.type) ? mailContent.type : '';
    var subject = '';
    var receiverEmail = mailContent.toEmail;
    var message = mailContent.message ? mailContent.message : '';
    var parameters = {
        EMAIL : mailContent.email,
        FULLNAME : mailContent.fullname,
        EZEOne : mailContent.ezeid, // from ezeid
        STATUS : mailContent.status,
        MESSAGE : message,
        EZEOneID : mailContent.toEzeid, // to ezeid
        FUNCTION : mailContent.function,
        KEYSKILLS : mailContent.keyskills,
        URL : mailContent.url
    };

    /**
     * @todo
     * Read types from configuration and attach parameter to the template
     * parse template and send mail
     */
    var template = null;

    for(var prop in EJSCONFIG.MAIL.TEMPLATES){
        if(EJSCONFIG.MAIL.TEMPLATES.hasOwnProperty(prop) && type == prop){
            template = EJSCONFIG.MAIL.TEMPLATES[prop];
            break;
        }
    }

    var mParams = {
        APP_NAME :  EJSCONFIG.MAIL.APP_NAME,
        DISCLAIMER : EJSCONFIG.MAIL.DISCLAIMER
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
                        from: EJSCONFIG.MAIL.SENDER, // sender address
                        to: receiverEmail, // list of receivers
                        subject: (template.subject) ? template.subject : subject, // Subject line
                        //text: htmlContent, // plaintext body
                        html: htmlContent // html body
                    };

                    var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                    //var transporter = nodemailer.createTransport();
                    //transporter.sendMail(mailOptions,function(error,info){
                    sendgrid.send(mailOptions, function (error, result) {
                        if(error){
                            console.log('Error in sending mail');
                            console.log(error);
                            CallBack(null, null);

                        }
                        else{
                            console.log('Mail sent successfully...');
                            //console.log(info);
                            CallBack(null, mailOptions);
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


module.exports = HussMailer;