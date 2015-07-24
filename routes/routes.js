"use strict";
var DbHelper = require('./../helpers/DatabaseHandler'),
    db = DbHelper.getDBContext();

var StdLib = require('./modules/std-lib.js');
var stdLib = new StdLib(db);
exports.FnSendMail = stdLib.sendMail;

var User = require('./modules/user-module.js');
var userModule = new User(db,stdLib);
exports.FnRegistration = userModule.register;
exports.FnLogin = userModule.login;
exports.FnLogout = userModule.logout;
exports.FnGetCountry = userModule.getCountry;
exports.FnGetState = userModule.getState;
exports.FnGetCity = userModule.getCity;
exports.FnGetUserDetails = userModule.getUserDetails;
exports.FnCheckEzeid = userModule.checkEzeid;
exports.FnChangePassword = userModule.changePassword;
exports.FnForgetPassword = userModule.forgetPassword;
exports.FnVerifyResetPasswordLink = userModule.verifyResetPasswordLink;
exports.FnDecryptPassword = userModule.decryptPassword;
exports.FnGetCompanyProfile = userModule.getCompanyProfile;
exports.FnSaveCompanyProfile = userModule.saveCompanyProfile;
exports.FnGetWebLink = userModule.getWebLink;
exports.FnSaveWebLink = userModule.saveWebLink;
exports.FnDeleteWebLink = userModule.deleteWebLink;
exports.FnEZEIDPrimaryDetails = userModule.getEzeidDetails;
exports.FnGetCVInfo = userModule.getResume;
exports.FnSaveCVInfo = userModule.saveResume;
exports.FnPGetSkills = userModule.getSkills;
exports.FnGetDocPin = userModule.getDocPin;
exports.FnGetDoc = userModule.getDoc;
exports.FnUpdateDocPin = userModule.updateDocPin;
exports.FnSaveDoc = userModule.saveDoc;
exports.FnGetFunctions = userModule.getFunctions;
exports.FnGetLoginDetails = userModule.getLoginDetails;
exports.FnUploadDocument = userModule.uploadDoc;
exports.FnWebLinkRedirect = userModule.webLinkRedirect;
exports.FnGetMTitle = userModule.getMTitle;
exports.FnUpdateProfilePicture = userModule.updateProfilePicture;
exports.FnGetLoginCheck = userModule.getLoginCheck;
exports.FnGetProxmity = userModule.getProxmity;

var Audit = require('./modules/audit-module.js');
var auditModule = new Audit(db,stdLib);
exports.FnGetAccessHistory = auditModule.getAccessHistory;
exports.FnSaveWhiteBlackList = auditModule.saveList;
exports.FnGetWhiteBlackList = auditModule.getList;
exports.FnDeleteWhiteBlackList = auditModule.deleteList;
exports.FnGetWhiteListCount = auditModule.getListCount;
exports.FnGetRelationType = auditModule.getRelation;
exports.FnSaveMailTemplate = auditModule.saveMailTemplate;
exports.FnGetTemplateList = auditModule.getMailTemplate;
exports.FnGetTemplateDetails = auditModule.getTemplateDetails;
exports.FnSendBulkMailer = auditModule.sendBulkMailer;

var Location = require('./modules/location-module.js');
var locationModule = new Location(db,stdLib);
exports.FnGetSecondaryLocation = locationModule.getAll;
exports.FnAddLocation = locationModule.save;
exports.FnDeleteLocation = locationModule.deleteLocation;
exports.FnGetLocationListForEZEID = locationModule.getAllForEzeid;
exports.FnGetLocationList = locationModule.getLoactionList;
exports.FnGetLocationPicture = locationModule.getLocationPicture;

var BusinessManager = require('./modules/business-module.js');
var businessManager = new BusinessManager(db,stdLib);
exports.FnGetTransaction = businessManager.getTransactions;
exports.FnSaveTransaction = businessManager.saveTransaction;
exports.FnUpdateTransaction = businessManager.updateTransaction;
exports.FnGetTransactionItems = businessManager.getTransactionItems;
exports.FnSaveTransactionItems = businessManager.saveTransactionItems;
exports.FnGetOutboxMessages = businessManager.getOutboxTransactions;
exports.FnGetTransAutoComplete = businessManager.getTransAutoComplete;
exports.FnGetItemListForEZEID = businessManager.getItemListForEZEID;
exports.FnDeleteTransaction = businessManager.deleteTransaction;
exports.FnItemList = businessManager.itemList;
exports.FnItemDetails = businessManager.itemDetails;
exports.FnGetUserwiseFolderList = businessManager.getUserwiseFolderList;
exports.FnUpdateBussinessListing = businessManager.updateBussinessList;
exports.FnGetCompanyDetails = businessManager.getCompanyDetails;
exports.FnGetEZEOneIDInfo = businessManager.getEZEOneIDInfo;
exports.FnGetTransAttachment = businessManager.getTransAttachment;
exports.FnSalesStatistics = businessManager.salesStatistics;


var Configuration = require('./modules/configuration-module.js');
var configurationModule = new Configuration(db,stdLib);
exports.FnSaveConfig = configurationModule.save;
exports.FnGetConfig = configurationModule.get;
exports.FnGetCategory = configurationModule.getBusinessCategories;
exports.FnGetStatusType = configurationModule.getStatusTypes;
exports.FnStatusType = configurationModule.StatusTypes;
exports.FnSaveStatusType = configurationModule.saveStatusType;
exports.FnGetActionType = configurationModule.getActionTypes;
exports.FnSaveActionType = configurationModule.saveActionType;
exports.FnGetItemList = configurationModule.getItems;
exports.FnSaveItem = configurationModule.saveItems;
exports.FnGetFolderList = configurationModule.getFolders;
exports.FnSaveFolderRules = configurationModule.saveFolder;
exports.FnGetSubUserList = configurationModule.getSubusers;
exports.FnCreateSubUser = configurationModule.createSubuser;
exports.FnGetReservationResource = configurationModule.getReservationResources;
exports.FnSaveReservationResource = configurationModule.saveReservationResource;
exports.FnUpdateReservationResource = configurationModule.updateReservationResource;
exports.FnGetReservationService = configurationModule.getReservationServices;
exports.FnSaveReservationService = configurationModule.saveReservationService;
exports.FnUpdateReservationService = configurationModule.updateReservationService;
exports.FnGetReservResourceServiceMap = configurationModule.getResourceServiceMaps;
exports.FnSaveReservResourceServiceMap = configurationModule.saveResourceServiceMap;
exports.FnGetWorkingHours = configurationModule.getWorkingHoursTemplates;
exports.FnSaveWorkingHours = configurationModule.saveWorkingHoursTemplate;
exports.FnGetHolidayList = configurationModule.getHolidays;
exports.FnSaveHolidayCalendar = configurationModule.saveHoliday;
exports.FnDeleteHolidayList = configurationModule.deleteHoliday;
exports.FnDeleteWorkingHours = configurationModule.deleteWorkingHours;
exports.FnWorkingHoursDetails = configurationModule.getWorkingHoursDetails;


var Search = require('./modules/search-module.js');
var searchModule = new Search(db,stdLib);
exports.FnSearchByKeywords = searchModule.searchKeyword;
exports.FnGetSearchInformationNew = searchModule.searchInformation;
exports.FnGetWorkingHrsHolidayList = searchModule.getWorkingHrsHolidayList;
exports.FnGetBannerPicture = searchModule.getBanner;
exports.FnSearchForTracker = searchModule.searchTracker;
exports.FnGetSearchDocuments = searchModule.getSearchDoc;
exports.FnSearchBusListing = searchModule.searchBusListing;

var Image = require('./modules/image-module.js');
var imageModule = new Image(db,stdLib);
exports.FnCropImage = imageModule.cropImage;
exports.FnImageURL = imageModule.imageURL;

var Reservation = require('./modules/reservation-module.js');
var reservationModule = new Reservation(db,stdLib);
exports.FnSaveReservTransaction = reservationModule.SaveReservTrans;
exports.FnGetReservTask = reservationModule.getReservTrans;
exports.FnGetMapedServices = reservationModule.getMapedServices;
exports.FnGetResTransDetails = reservationModule.getTransDetails;
exports.FnChangeReservationStatus = reservationModule.changeReservStatus;
exports.FnGetworkinghoursList = reservationModule.getworkinghoursList;
exports.FnSaveFeedback = reservationModule.saveFeedback;
exports.FnResourcePicture = reservationModule.getResourcePicture;


var JobModule = require('./modules/job-module.js');
var job = new JobModule(db,stdLib);
exports.FnSaveJobs = job.create;
exports.FnGetJobs = job.getAll;
exports.FnGetJobLocations = job.getJobLocations;
exports.FnSearchJobs = job.searchJobs;


//ap parts
var Auth_AP = require('./ap-modules/auth-module-ap.js');
var authModuleAP = new Auth_AP(db,stdLib);
exports.FnLoginAP = authModuleAP.loginAP;
exports.FnLogoutAP = authModuleAP.logoutAP;
exports.FnForgetPasswordAP = authModuleAP.forgetPasswordAP;
exports.FnChangePasswordAP = authModuleAP.changePasswordAP;

var User_AP = require('./ap-modules/user-module-ap.js');
var userModuleAP = new User_AP(db,stdLib);
exports.FnGetUserDetailsAP = userModuleAP.getUserDetailsAP;
exports.FnUpdateUserProfileAP = userModuleAP.updateUserProfileAP;
exports.FnSaveAPEZEID = userModuleAP.saveAPEZEID;
exports.FnUpdateRedFlagAP = userModuleAP.updateRedFlagAP;
exports.FnUpdateEZEIDAP = userModuleAP.updateEZEIDAP;

var Image_AP = require('./ap-modules/image-module-ap.js');
var imageModuleAP = new Image_AP(db,stdLib);
exports.FnSaveAPEZEIDPicture = imageModuleAP.saveAPEZEIDPicture;
exports.FnGetAPEZEIDPicture = imageModuleAP.getAPEZEIDPicture;
exports.FnSaveBannerPictureAP = imageModuleAP.saveBannerPictureAP;
exports.FnGetBannerPictureAP = imageModuleAP.getBannerPictureAP;
exports.FnGetAllBannerPicsAP = imageModuleAP.getAllBannerPicsAP;
exports.FnDeleteBannerPictureAP = imageModuleAP.deleteBannerPictureAP;
exports.FnCropImageAP = imageModuleAP.cropImageAP;

var Location_AP = require('./ap-modules/location-module-ap.js');
var locationModuleAP = new Location_AP(db,stdLib);
exports.FnGetSecondaryLocationListAP = locationModuleAP.getSecondaryLocationListAP;
exports.FnGetSecondaryLocationAP = locationModuleAP.getSecondaryLocationAP;
exports.FnUpdateSecondaryLocationAP = locationModuleAP.updateSecondaryLocationAP;

var RealEstate_AP = require('./ap-modules/real-estate-ap.js');
var realEstateAP = new RealEstate_AP(db,stdLib);
exports.FnGetRealStateDataAP = realEstateAP.getRealStateDataAP;
exports.FnSearchRealEstateAP = realEstateAP.searchRealEstateAP;

var IDCard_AP = require('./ap-modules/idcard-module-ap.js');
var idcardAP = new IDCard_AP(db,stdLib);
exports.FnUpdateIdCardPrintAP = idcardAP.updateIdCardPrintAP;
exports.FnGetIdCardPrintAP = idcardAP.getIdCardPrintAP;


//VES Modules
var VES = require('./ves-modules/ves-module.js');
var vesModule= new VES(db,stdLib);
exports.FnLoginVES = vesModule.loginVES;
exports.FnSaveContactVES = vesModule.saveContactVES;
exports.FnGetAllContactsVES = vesModule.getAllContactsVES;
exports.FnGetDepartmentVES = vesModule.getDepartmentVES;
exports.FnGetContactVES = vesModule.getContactVES;
exports.FnSearchContactsVES = vesModule.searchContactsVES;
exports.FnCheckPasswordVES = vesModule.checkPasswordVES;
exports.FnGetGatesVES = vesModule.getGatesVES;
exports.FnSaveDepartmentsVES = vesModule.saveDepartmentsVES;
exports.FnSaveGatesVES = vesModule.saveGatesVES;
exports.FnSaveCitysVES = vesModule.saveCitysVES;





















