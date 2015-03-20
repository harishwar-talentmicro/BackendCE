var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser'), cors = require('cors'),
    LocationManager = require('./routes/EziedUserAPI_Server');
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
app.use('/css', express.static(path.join(__dirname, 'public/css/')));
app.use('/html', express.static(path.join(__dirname, 'public/html/')));
app.use('/js', express.static(path.join(__dirname, 'public/js/')));
app.use('/fonts', express.static(path.join(__dirname, 'public/fonts/')));
app.use('/directives', express.static(path.join(__dirname, 'public/directives/')));
app.use('/images', express.static(path.join(__dirname, 'public/images/')));

app.get('/', function(req, res){
    res.sendfile(__dirname + '/public/html/index.html');
});

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

//this part is for passenger
app.post('/ewLogin', LocationManager.FnLogin);
app.get('/ewLogout', LocationManager.FnLogout);
app.post('/ewSavePrimaryEZEData', LocationManager.FnRegistration);
//app.post('/ewSavePrimaryEZEData', LocationManager.FnRegistration);
app.post('/ewSaveQucikEZEData', LocationManager.FnQuickRegistration);
app.get('/ewmGetCategory', LocationManager.FnGetCategory);
app.get('/ewmGetCity', LocationManager.FnGetCity);
app.get('/ewmGetCountry', LocationManager.FnGetCountry);
app.get('/ewmGetFunctionRoleMap', LocationManager.FnGetFunctionRoleMap);
app.get('/ewmGetFunctions', LocationManager.FnGetFunctions);
app.get('/ewmGetRoles', LocationManager.FnGetRoles);

app.get('/ewmGetLanguage', LocationManager.FnGetLanguage);
app.get('/ewmGetRelationType', LocationManager.FnGetRelationType);
app.get('/ewmGetRoleType', LocationManager.FnGetRoleType);
app.get('/ewmGetState', LocationManager.FnGetState);
app.get('/ewmGetMTitle', LocationManager.FnGetMTitle);
app.get('/ewGetEZEID', LocationManager.FnCheckEzeid);
//app.get('/ewSearchByKeywords', LocationManager.FnSearch);
app.post('/ewmAddLocation', LocationManager.FnAddLocation);
app.post('/ewSearchByKeywords', LocationManager.FnSearchByKeywords);
app.get('/ewtGetUserDetails', LocationManager.FnGetUserDetails);
app.get('/ewtGetSecondaryLoc', LocationManager.FnGetSecondaryLocation);
//app.get('/ewSearchEzeidNew', LocationManager.FnSearchEzeidNew);
app.post('/ewDeleteLocation', LocationManager.FnDeleteLocation);
app.get('/ewtGetSearchInformation', LocationManager.FnGetSearchInformation);
app.get('/ewmGetProxmity', LocationManager.FnGetProxmity);
app.post('/ewtSendMail', LocationManager.FnSendMail);
app.get('/ewtGetDoc', LocationManager.FnGetDoc);
app.post('/ewtSaveDoc', LocationManager.FnSaveDoc);
app.get('/ewtGetAccessHistory', LocationManager.FnGetAccessHistory);
app.post('/ewtSaveMessage', LocationManager.FnSaveMessage);
app.get('/ewtGetMessages', LocationManager.FnGetMessages);
app.post('/ewtUpdateMessageStatus', LocationManager.FnUpdateMessageStatus);
app.post('/ewtForgetPassword', LocationManager.FnForgetPassword);
app.post('/ewtChangePassword', LocationManager.FnChangePassword);
app.post('/ewtUpdateProfilePicture', LocationManager.FnUpdateProfilePicture);
app.post('/ewtSaveCVInfo', LocationManager.FnSaveCVInfo);
app.get('/ewtGetCVInfo', LocationManager.FnGetCVInfo);
app.post('/ewtUpdateBussinessListing', LocationManager.FnUpdateBussinessListing);
app.get('/ewtGetBussinessListing', LocationManager.FnGetBussinessListing);
app.post('/ewtUpdateDocPin', LocationManager.FnUpdateDocPin);
app.get('/ewtGetDocPin', LocationManager.FnGetDocPin);
app.get('/ewtGetSearchDocuments', LocationManager.FnGetSearchDocuments);
app.get('/ewtGetDocument', LocationManager.FnGetDocument);
app.post('/ewtUploadDoc', LocationManager.FnUploadDocument);
app.get('/ewmGetFunctionRoleMapping', LocationManager.FnGetFunctionRoleMapping);
app.get('/ewmUpdatePwdEncryption', LocationManager.FnUpdatePwdEncryption);
app.post('/ewtCheckCV', LocationManager.FnCheckCV);
app.get('/ewtGetLoginCheck', LocationManager.FnGetLoginCheck);
app.get('/ewtGetBannerPicture', LocationManager.FnGetBannerPicture);
app.post('/ewtSaveWhiteBlackList', LocationManager.FnSaveWhiteBlackList);
app.get('/ewtGetWhiteBlackList', LocationManager.FnGetWhiteBlackList);
app.post('/ewtDeleteWhiteBlackList', LocationManager.FnDeleteWhiteBlackList);
app.get('/ewtGetWhiteListCount', LocationManager.FnGetWhiteListCount);
app.get('/ewtGetStatusType',LocationManager.FnGetStatusType);
app.get('/ewtGetActionType',LocationManager.FnGetActionType);
app.get('/ewtEZEIDPrimaryDetails',LocationManager.FnEZEIDPrimaryDetails);
app.get('/ewtGetItemList',LocationManager.FnGetItemList);
app.post('/ewtSearchForTracker', LocationManager.FnSearchForTracker);
app.get('/ewtGetFolderList',LocationManager.FnGetFolderList);
app.post('/ewtCreateSubUser',LocationManager.FnCreateSubUser);
app.get('/ewtGetTranscationItems',LocationManager.FnGetTranscationItems);
app.post('/ewtSaveTranscationItems',LocationManager.FnSaveTranscationItems);
app.get('/ewtGetSubUserList',LocationManager.FnGetSubUserList);
app.post('/ewtSaveItem',LocationManager.FnSaveItem);
app.post('/ewmSaveFolderRules',LocationManager.FnSaveFolderRules);
app.post('/ewmSaveStatusType',LocationManager.FnSaveStatusType);
app.post('/ewmSaveActionType',LocationManager.FnSaveActionType);
app.get('/ewtItemList',LocationManager.FnItemList);
app.get('/ewtItemDetails',LocationManager.FnItemDetails);
app.post('/ewtSaveHolidayCalendar',LocationManager.FnSaveHolidayCalendar);
app.get('/ewtGetHolidayList',LocationManager.FnGetHolidayList);
app.post('/ewtSaveConfig',LocationManager.FnSaveConfig);
app.get('/ewtGetConfig',LocationManager.FnGetConfig);
app.post('/ewtSaveTranscation',LocationManager.FnSaveTranscation);
app.get('/ewtGetUserwiseFolderList',LocationManager.FnGetUserwiseFolderList);
app.get('/ewtGetTranscation',LocationManager.FnGetTranscation);
app.post('/ewtSaveResource',LocationManager.FnSaveResource);
app.get('/ewtGetResource',LocationManager.FnGetResource);
app.post('/ewtSaveResourceItemMap',LocationManager.FnSaveResourceItemMap);
app.get('/ewtGetLocationList',LocationManager.FnGetLocationList);


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
app.get('/ewtGetSecondaryLocListAP',LocationManager.FnGetSecondaryLocationListAP);
app.get('/ewtGetSecondaryLocAP',LocationManager.FnGetSecondaryLocationAP);
app.post('/ewtUpdateSecondaryLocationAP', LocationManager.FnUpdateSecondaryLocationAP);
app.post('/ewtUpdateIdCardPrintAP', LocationManager.FnUpdateIdCardPrintAP);
app.get('/ewtGetIdCardPrintAP',LocationManager.FnGetIdCardPrintAP);
app.post('/ewtSearchRealEstateAP', LocationManager.FnSearchRealEstateAP);
app.post('/ewtUpdateRedFlagAP',LocationManager.FnUpdateRedFlagAP);

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


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    console.log('404 : Page not found');
    res.status = 404;
    if(req.type == 'json')
    {
            res.type('json').send('Invalid Service call');   
    }
    else{
        res.redirect('/');
    }
});

module.exports = app;
