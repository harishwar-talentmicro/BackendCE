var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser'), cors = require('cors'),
LocationManager = require('./routes/EziedUserAPI_Server.js');
var compress = require('compression');

var app = express();
app.use(compress());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
var multer  = require('multer');

app.use(multer({ dest: './uploads/'}));

//app.use(express.static(path.join(__dirname, 'public')));
// Set header to force download
function setHeaders(res, path) {
    res.setHeader('Content-Disposition', contentDisposition(path))
}

app.use('/css', express.static(path.join(__dirname, 'public/css/'),{
    setHeaders : function(res,path){
        res.setHeader('Content-type','text/css');
    }
}));
app.use('/html', express.static(path.join(__dirname, 'public/html/'),{
    setHeaders : function(res,path){
        res.setHeader('Content-type','text/html');
    }
}));
app.use('/js', express.static(path.join(__dirname, 'public/js/'),{
    setHeaders : function(res,path){
        res.setHeader('Content-type','text/javascript');
    }
}));
app.use('/fonts', express.static(path.join(__dirname, 'public/fonts/')));
app.use('/directives', express.static(path.join(__dirname, 'public/directives/')));
app.use('/images', express.static(path.join(__dirname, 'public/images/')));

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.get('/legal.html',function(req,res,next){
    res.sendFile(__dirname + '/public/html/legal.html');
});

//this part is for passenger
app.post('/ewLogin', LocationManager.FnLogin);
app.get('/ewLogout', LocationManager.FnLogout);
app.post('/ewSavePrimaryEZEData', LocationManager.FnRegistration);
app.get('/ewmGetCategory', LocationManager.FnGetCategory);
app.get('/ewmGetCity', LocationManager.FnGetCity);
app.get('/ewmGetCountry', LocationManager.FnGetCountry);
app.get('/ewmGetFunctions', LocationManager.FnGetFunctions);
app.get('/ewmGetRelationType', LocationManager.FnGetRelationType);
app.get('/ewmGetState', LocationManager.FnGetState);
app.get('/ewmGetMTitle', LocationManager.FnGetMTitle);
app.get('/ewGetEZEID', LocationManager.FnCheckEzeid);
app.post('/ewmAddLocation', LocationManager.FnAddLocation);
app.post('/ewSearchByKeywords', LocationManager.FnSearchByKeywords);
app.get('/ewtGetUserDetails', LocationManager.FnGetUserDetails);
app.get('/ewtGetSecondaryLoc', LocationManager.FnGetSecondaryLocation);
app.post('/ewDeleteLocation', LocationManager.FnDeleteLocation);
app.get('/ewtGetSearchInformationNew', LocationManager.FnGetSearchInformationNew);
app.get('/ewmGetProxmity', LocationManager.FnGetProxmity);
app.post('/ewtSendMail', LocationManager.FnSendMail);
app.get('/ewtGetDoc', LocationManager.FnGetDoc);
app.post('/ewtSaveDoc', LocationManager.FnSaveDoc);
app.get('/ewtGetAccessHistory', LocationManager.FnGetAccessHistory);
app.post('/ewtForgetPassword', LocationManager.FnForgetPassword);
app.get('/ewtDecryptPassword', LocationManager.FnDecryptPassword);
app.post('/ewtChangePassword', LocationManager.FnChangePassword);
app.post('/ewtUpdateProfilePicture', LocationManager.FnUpdateProfilePicture);
app.post('/ewtSaveCVInfo', LocationManager.FnSaveCVInfo);
app.get('/ewtGetCVInfo', LocationManager.FnGetCVInfo);
app.post('/ewtUpdateBussinessListing', LocationManager.FnUpdateBussinessListing);
app.post('/ewtUpdateDocPin', LocationManager.FnUpdateDocPin);
app.get('/ewtGetDocPin', LocationManager.FnGetDocPin);
app.get('/ewtGetSearchDocuments', LocationManager.FnGetSearchDocuments);
app.post('/ewtUploadDoc', LocationManager.FnUploadDocument);
app.get('/ewtGetLoginCheck', LocationManager.FnGetLoginCheck);
app.get('/ewtGetBannerPicture', LocationManager.FnGetBannerPicture);
app.post('/ewtSaveWhiteBlackList', LocationManager.FnSaveWhiteBlackList);
app.get('/ewtGetWhiteBlackList', LocationManager.FnGetWhiteBlackList);
app.post('/ewtDeleteWhiteBlackList', LocationManager.FnDeleteWhiteBlackList);
app.get('/ewtGetWhiteListCount', LocationManager.FnGetWhiteListCount);
app.get('/ewtGetStatusType',LocationManager.FnGetStatusType);
app.get('/ewmStatusType',LocationManager.FnStatusType);
app.get('/ewtGetActionType',LocationManager.FnGetActionType);
app.get('/ewtEZEIDPrimaryDetails',LocationManager.FnEZEIDPrimaryDetails);
app.get('/ewtGetItemList',LocationManager.FnGetItemList);
app.post('/ewtSearchForTracker', LocationManager.FnSearchForTracker);
app.get('/ewtGetFolderList',LocationManager.FnGetFolderList);
app.post('/ewtCreateSubUser',LocationManager.FnCreateSubUser);
app.get('/ewtGetTranscationItems',LocationManager.FnGetTransactionItems);
app.post('/ewtSaveTranscationItems',LocationManager.FnSaveTransactionItems);
app.get('/ewtGetSubUserList',LocationManager.FnGetSubUserList);
app.post('/ewtSaveItem',LocationManager.FnSaveItem);
app.post('/ewmSaveFolderRules',LocationManager.FnSaveFolderRules);
app.post('/ewmSaveStatusType',LocationManager.FnSaveStatusType);
app.post('/ewmSaveActionType',LocationManager.FnSaveActionType);
app.get('/ewtItemList',LocationManager.FnItemList);
app.get('/ewtItemDetails',LocationManager.FnItemDetails);
app.post('/ewtHolidayList',LocationManager.FnSaveHolidayCalendar);
app.get('/ewtHolidayList',LocationManager.FnGetHolidayList);
app.delete('/ewtHolidayList',LocationManager.FnDeleteHolidayList);
app.post('/ewtWorkingHours',LocationManager.FnSaveWorkingHours);
app.get('/ewtWorkingHours',LocationManager.FnGetWorkingHours);
app.delete('/ewtWorkingHours',LocationManager.FnDeleteWorkingHours);
app.post('/ewtConfig',LocationManager.FnSaveConfig);
app.get('/ewtConfig',LocationManager.FnGetConfig);
app.post('/ewtSaveTranscation',LocationManager.FnSaveTransaction);
app.get('/ewtGetUserwiseFolderList',LocationManager.FnGetUserwiseFolderList);
app.get('/ewtGetTranscation',LocationManager.FnGetTransaction);
app.get('/ewtGetItemListForEZEID',LocationManager.FnGetItemListForEZEID);
app.get('/ewtGetLocationList',LocationManager.FnGetLocationList);
app.get('/ewtGetLoginDetails',LocationManager.FnGetLoginDetails);
app.post('/ewtTemplateDetails',LocationManager.FnSaveMailTemplate);
app.get('/ewtTemplateList',LocationManager.FnGetTemplateList);
app.get('/ewtTemplateDetails',LocationManager.FnGetTemplateDetails);
app.post('/ewtSendBulkMailer',LocationManager.FnSendBulkMailer);
app.post('/crop_image',LocationManager.FnCropImage);
app.get('/ewtGetWorkingHrsHolidayList',LocationManager.FnGetWorkingHrsHolidayList);
app.post('/ewtWebLink',LocationManager.FnSaveWebLink);
app.get('/ewtWebLink',LocationManager.FnGetWebLink);
app.delete('/ewtwebLink',LocationManager.FnDeleteWebLink);
app.delete('/ewtDeleteTranscation',LocationManager.FnDeleteTransaction);
app.get('/ewtCompanyProfile', LocationManager.FnGetCompanyProfile);
app.post('/ewtCompanyProfile', LocationManager.FnSaveCompanyProfile);
app.get('/ewtGetLocationListForEZEID', LocationManager.FnGetLocationListForEZEID);
app.post('/reservation_resource',LocationManager.FnSaveReservationResource);
app.put('/reservation_resource',LocationManager.FnUpdateReservationResource);
app.get('/reservation_resource',LocationManager.FnGetReservationResource);
app.post('/reservation_service',LocationManager.FnSaveReservationService);
app.put('/reservation_service',LocationManager.FnUpdateReservationService);
app.get('/reservation_service',LocationManager.FnGetReservationService);
app.get('/reservation_resource_service_map',LocationManager.FnGetReservResourceServiceMap);
app.post('/reservation_resource_service_map',LocationManager.FnSaveReservResourceServiceMap);
app.post('/reservation_transaction',LocationManager.FnSaveReservTransaction);
app.get('/reservation_maped_services',LocationManager.FnGetMapedServices);
app.get('/reservation_transaction',LocationManager.FnGetReservTask);
app.get('/reservation_trans_details',LocationManager.FnGetResTransDetails);
app.put('/reservation_transaction',LocationManager.FnChangeReservationStatus);
app.get('/skill_list',LocationManager.FnPGetSkills);
app.get('/transaction_autocomplete',LocationManager.FnGetTransAutoComplete);
app.put('/update_transaction',LocationManager.FnUpdateTransaction);
app.get('/company_details',LocationManager.FnGetCompanyDetails);
app.get('/get_outbox_messages',LocationManager.FnGetOutboxMessages);
app.get('/get_workinghours_list',LocationManager.FnGetworkinghoursList);
app.get('/ezeoneid',LocationManager.FnGetEZEOneIDInfo);
app.get('/get_workinghours_details',LocationManager.FnWorkingHoursDetails);
app.get('/image_url',LocationManager.FnImageURL);
app.post('/save_feedback',LocationManager.FnSaveFeedback);



//below service are for EZEIDAP
app.post('/ewLoginAP', LocationManager.FnLoginAP);
app.get('/ewLogoutAP', LocationManager.FnLogoutAP);
app.get('/ewGetUserDetailsAP', LocationManager.FnGetUserDetailsAP);
app.post('/ewUpdateUserProfileAP', LocationManager.FnUpdateUserProfileAP);
app.post('/ewtForgetPasswordAP', LocationManager.FnForgetPasswordAP);
app.post('/ewtChangePasswordAP', LocationManager.FnChangePasswordAP);
app.post('/ewtSaveEZEIDDataAP', LocationManager.FnSaveAPEZEID);
app.post('/ewtSaveEZEIDPictureAP', LocationManager.FnSaveAPEZEIDPicture);
app.get('/ewtGetEstateDataAP', LocationManager.FnGetRealStateDataAP);
app.get('/ewtGetEZEIDPictureAP', LocationManager.FnGetAPEZEIDPicture);
app.post('/ewtSaveBannerPictureAP', LocationManager.FnSaveBannerPictureAP);
app.get('/ewtGetBannerPictureAP', LocationManager.FnGetBannerPictureAP);
app.get('/ewtGetAllBannerPicsAP', LocationManager.FnGetAllBannerPicsAP);
app.get('/ewtGetSecondaryLocListAP',LocationManager.FnGetSecondaryLocationListAP);
app.get('/ewtGetSecondaryLocAP',LocationManager.FnGetSecondaryLocationAP);
app.post('/ewtUpdateSecondaryLocationAP', LocationManager.FnUpdateSecondaryLocationAP);
app.post('/ewtUpdateIdCardPrintAP', LocationManager.FnUpdateIdCardPrintAP);
app.get('/ewtGetIdCardPrintAP',LocationManager.FnGetIdCardPrintAP);
app.post('/ewtSearchRealEstateAP', LocationManager.FnSearchRealEstateAP);
app.post('/ewtUpdateRedFlagAP',LocationManager.FnUpdateRedFlagAP);
app.post('/ewtUpdateEZEIDAP', LocationManager.FnUpdateEZEIDAP);
app.post('/ewtDeleteBannerPicAP', LocationManager.FnDeleteBannerPictureAP);
app.post('/crop_imageAP',LocationManager.FnCropImageAP);


//EZEID VAS
app.get('/ewtLoginVES',LocationManager.FnLoginVES);
app.post('/ewtSaveContactVES',LocationManager.FnSaveContactVES);
app.get('/ewtGetAllContactsVES',LocationManager.FnGetAllContactsVES);
app.get('/ewmGetDepartmentVES',LocationManager.FnGetDepartmentVES);
app.get('/ewtGetContactVES',LocationManager.FnGetContactVES);
app.get('/ewtSearchContactsVES',LocationManager.FnSearchContactsVES);
app.get('/ewtCheckPasswordVES',LocationManager.FnCheckPasswordVES);
app.get('/ewtGetGatesVES',LocationManager.FnGetGatesVES);
app.post('/ewtSaveDepartmentsVES',LocationManager.FnSaveDepartmentsVES);
app.post('/ewtSaveGatesVES',LocationManager.FnSaveGatesVES);
app.post('/ewtSaveCitysVES',LocationManager.FnSaveCitysVES);

app.get('/test',function(req,res){
    res.status(200).json(req.cookies);
});
app.get('/:page/:subpage',function(req,res){
    res.sendFile(__dirname + '/public/html/index.html');
});

app.get('/:id',LocationManager.FnWebLinkRedirect);

app.get('/:page',function(req,res){
    res.sendFile(__dirname + '/public/html/index.html');
    
});


app.get('/',function(req,res){
    res.sendFile(__dirname + '/public/html/index.html');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    console.log('404 : Page not found');

    if(req.type == 'json')
    {
            res.type('json').status(404).json({message : 'Invalid Service call', status : false});
    }
    else{
        res.status(404).send('');
    }
});


module.exports = app;
