/**
 *  @author Gowri shankar
 *  @since July 22,2015 02:55 PM IST
 *  @title api.js
 *  @description Handles all web services url paths
 */
"use strict";

var express = require('express');
var router = express.Router();
var LocationManager = require('../routes/routes.js');


/**
 * Services for MQTT Messaging Server Interface
 */
router.get('/ms_auth/user',LocationManager.FnMSAuthUser);
router.get('/ms_auth/vhost',LocationManager.FnMSAuthVHost);
router.get('/ms_auth/resource',LocationManager.FnMSAuthResource);


//this part is for passenger
router.post('/ewLogin', LocationManager.FnLogin);
router.get('/ewLogout', LocationManager.FnLogout);
router.post('/ewSavePrimaryEZEData', LocationManager.FnRegistration);
router.get('/ewmGetCategory', LocationManager.FnGetCategory);
router.get('/ewmGetCity', LocationManager.FnGetCity);
router.get('/ewmGetCountry', LocationManager.FnGetCountry);
router.get('/ewmGetFunctions', LocationManager.FnGetFunctions);
router.get('/ewmGetRelationType', LocationManager.FnGetRelationType);
router.get('/ewmGetState', LocationManager.FnGetState);
router.get('/ewmGetMTitle', LocationManager.FnGetMTitle);
router.get('/ewGetEZEID', LocationManager.FnCheckEzeid);
router.post('/ewmAddLocation', LocationManager.FnAddLocation);
router.post('/ewSearchByKeywords', LocationManager.FnSearchByKeywords);
router.get('/ewtGetUserDetails', LocationManager.FnGetUserDetails);
router.get('/ewtGetSecondaryLoc', LocationManager.FnGetSecondaryLocation);
router.post('/ewDeleteLocation', LocationManager.FnDeleteLocation);
router.get('/ewtGetSearchInformationNew', LocationManager.FnGetSearchInformationNew);
router.get('/ewmGetProxmity', LocationManager.FnGetProxmity);
router.post('/ewtSendMail', LocationManager.FnSendMail);
router.get('/ewtGetDoc', LocationManager.FnGetDoc);
router.post('/ewtSaveDoc', LocationManager.FnSaveDoc);
router.get('/ewtGetAccessHistory', LocationManager.FnGetAccessHistory);
router.post('/ewtForgetPassword', LocationManager.FnForgetPassword);
router.post('/pass_reset_code',LocationManager.FnVerifyResetPasswordLink);
router.post('/verify_secret_code',LocationManager.FnVerifySecretCode);
router.get('/ewtDecryptPassword', LocationManager.FnDecryptPassword);
router.post('/ewtChangePassword', LocationManager.FnChangePassword);
router.post('/ewtUpdateProfilePicture', LocationManager.FnUpdateProfilePicture);
router.post('/ewtSaveCVInfo', LocationManager.FnSaveCVInfo);
router.get('/ewtGetCVInfo', LocationManager.FnGetCVInfo);
router.post('/ewtUpdateBussinessListing', LocationManager.FnUpdateBussinessListing);
router.post('/ewtUpdateDocPin', LocationManager.FnUpdateDocPin);
router.get('/ewtGetDocPin', LocationManager.FnGetDocPin);
router.get('/ewtGetSearchDocuments', LocationManager.FnGetSearchDocuments);
router.post('/ewtUploadDoc', LocationManager.FnUploadDocument);
router.get('/ewtGetLoginCheck', LocationManager.FnGetLoginCheck);
router.get('/ewtGetBannerPicture', LocationManager.FnGetBannerPicture);
router.post('/ewtSaveWhiteBlackList', LocationManager.FnSaveWhiteBlackList);
router.get('/ewtGetWhiteBlackList', LocationManager.FnGetWhiteBlackList);
router.post('/ewtDeleteWhiteBlackList', LocationManager.FnDeleteWhiteBlackList);
router.get('/ewtGetWhiteListCount', LocationManager.FnGetWhiteListCount);
router.get('/ewtGetStatusType',LocationManager.FnGetStatusType);
router.get('/ewmStatusType',LocationManager.FnStatusType);
router.get('/ewtGetActionType',LocationManager.FnGetActionType);
router.get('/ewtEZEIDPrimaryDetails',LocationManager.FnEZEIDPrimaryDetails);
router.get('/ewtGetItemList',LocationManager.FnGetItemList);
router.post('/ewtSearchForTracker', LocationManager.FnSearchForTracker);
router.get('/ewtGetFolderList',LocationManager.FnGetFolderList);
router.post('/ewtCreateSubUser',LocationManager.FnCreateSubUser);
router.get('/ewtGetTranscationItems',LocationManager.FnGetTransactionItems);
router.post('/ewtSaveTranscationItems',LocationManager.FnSaveTransactionItems);
router.get('/ewtGetSubUserList',LocationManager.FnGetSubUserList);
router.post('/ewtSaveItem',LocationManager.FnSaveItem);
router.post('/ewmSaveFolderRules',LocationManager.FnSaveFolderRules);
router.post('/ewmSaveStatusType',LocationManager.FnSaveStatusType);
router.post('/ewmSaveActionType',LocationManager.FnSaveActionType);
router.get('/ewtItemList',LocationManager.FnItemList);
router.get('/ewtItemDetails',LocationManager.FnItemDetails);
router.post('/ewtHolidayList',LocationManager.FnSaveHolidayCalendar);
router.get('/ewtHolidayList',LocationManager.FnGetHolidayList);
router.delete('/ewtHolidayList',LocationManager.FnDeleteHolidayList);
router.post('/ewtWorkingHours',LocationManager.FnSaveWorkingHours);
router.get('/ewtWorkingHours',LocationManager.FnGetWorkingHours);
router.delete('/ewtWorkingHours',LocationManager.FnDeleteWorkingHours);
router.post('/ewtConfig',LocationManager.FnSaveConfig);
router.get('/ewtConfig',LocationManager.FnGetConfig);
router.post('/ewtSaveTranscation',LocationManager.FnSaveTransaction);
router.get('/ewtGetUserwiseFolderList',LocationManager.FnGetUserwiseFolderList);
router.get('/ewtGetTranscation',LocationManager.FnGetTransaction);
router.get('/ewtGetItemListForEZEID',LocationManager.FnGetItemListForEZEID);
router.get('/ewtGetLocationList',LocationManager.FnGetLocationList);
router.get('/ewtGetLoginDetails',LocationManager.FnGetLoginDetails);
router.post('/ewtTemplateDetails',LocationManager.FnSaveMailTemplate);
router.get('/ewtTemplateList',LocationManager.FnGetTemplateList);
router.get('/ewtTemplateDetails',LocationManager.FnGetTemplateDetails);
router.post('/ewtSendBulkMailer',LocationManager.FnSendBulkMailer);
router.post('/crop_image',LocationManager.FnCropImage);
router.get('/ewtGetWorkingHrsHolidayList',LocationManager.FnGetWorkingHrsHolidayList);
router.post('/ewtWebLink',LocationManager.FnSaveWebLink);
router.get('/ewtWebLink',LocationManager.FnGetWebLink);
router.delete('/ewtwebLink',LocationManager.FnDeleteWebLink);
router.delete('/ewtDeleteTranscation',LocationManager.FnDeleteTransaction);
router.get('/ewtCompanyProfile', LocationManager.FnGetCompanyProfile);
router.post('/ewtCompanyProfile', LocationManager.FnSaveCompanyProfile);
router.get('/ewtGetLocationListForEZEID', LocationManager.FnGetLocationListForEZEID);
router.post('/reservation_resource',LocationManager.FnSaveReservationResource);
router.put('/reservation_resource',LocationManager.FnUpdateReservationResource);
router.get('/reservation_resource',LocationManager.FnGetReservationResource);
router.post('/reservation_service',LocationManager.FnSaveReservationService);
router.put('/reservation_service',LocationManager.FnUpdateReservationService);
router.get('/reservation_service',LocationManager.FnGetReservationService);
router.get('/reservation_resource_service_map',LocationManager.FnGetReservResourceServiceMap);
router.post('/reservation_resource_service_map',LocationManager.FnSaveReservResourceServiceMap);
router.post('/reservation_transaction',LocationManager.FnSaveReservTransaction);
router.get('/reservation_maped_services',LocationManager.FnGetMapedServices);
router.get('/reservation_transaction',LocationManager.FnGetReservTask);
router.get('/reservation_trans_details',LocationManager.FnGetResTransDetails);
router.put('/reservation_transaction',LocationManager.FnChangeReservationStatus);
router.get('/skill_list',LocationManager.FnPGetSkills);
router.get('/transaction_autocomplete',LocationManager.FnGetTransAutoComplete);
router.put('/update_transaction',LocationManager.FnUpdateTransaction);
router.get('/company_details',LocationManager.FnGetCompanyDetails);
router.get('/get_outbox_messages',LocationManager.FnGetOutboxMessages);
router.get('/get_workinghours_list',LocationManager.FnGetworkinghoursList);
router.get('/ezeoneid',LocationManager.FnGetEZEOneIDInfo);
router.get('/get_workinghours_details',LocationManager.FnWorkingHoursDetails);
router.get('/image_url',LocationManager.FnImageURL);
router.post('/feedback',LocationManager.FnSaveFeedback);
router.get('/transaction_attachment',LocationManager.FnGetTransAttachment);
router.get('/sales_statistics',LocationManager.FnSalesStatistics);
router.get('/location_image',LocationManager.FnGetLocationPicture);
router.get('/resource_image',LocationManager.FnResourcePicture);
router.post('/job',LocationManager.FnSaveJobs);
router.get('/job',LocationManager.FnGetJobs);
router.get('/job_locations',LocationManager.FnGetJobLocations);
router.get('/job_search',LocationManager.FnSearchJobs);
router.get('/job_seeker_search',LocationManager.FnJobSeekerSearch);
router.post('/job_apply',LocationManager.FnApplyJob);
router.get('/job_applied_list',LocationManager.FnAppliedJobList);
router.get('/feedback',LocationManager.FnGetFeedback);
router.get('/job_details',LocationManager.FnGetJobDetails);
router.get('/institutes',LocationManager.FnGetInstitutes);
router.get('/educations',LocationManager.FnGetEducations);
router.get('/specialization',LocationManager.FnGetSpecialization);
router.get('/jobs',LocationManager.FnJobs);
router.get('/applied_job',LocationManager.FnGetAppliedJob);
router.get('/job_country',LocationManager.FnGetJobcountry);
router.get('/job_city',LocationManager.FnGetjobcity);
router.get('/ezeone_image',LocationManager.FnGetPictureOfEzeid);
router.get('/jobseeker_message',LocationManager.FnGetJobSeekersMessage);
router.get('/jobs_list',LocationManager.FnGetListOfJobs);
//MessageBox module methods
router.post('/create_group',LocationManager.FnCreateMessageGroup);
router.get('/validate_groupname',LocationManager.FnValidateGroupName);
router.put('/user_status',LocationManager.FnUpdateUserStatus);
router.put('/user_relationship',LocationManager.FnUpdateUserRelationship);
router.delete('/group',LocationManager.FnDeleteGroup);
router.post('/message_request',LocationManager.FnSendMessageRequest);
router.post('/compose_message',LocationManager.FnComposeMessage);
router.get('/members_list',LocationManager.FnGetMembersList);
router.get('/messagebox',LocationManager.FnLoadMessageBox);
router.put('/message_activity',LocationManager.FnChangeMessageActivity);
router.get('/outbox_messages',LocationManager.FnLoadOutBoxMessages);
router.get('/suggestion_list',LocationManager.FnGetSuggestionList);
router.post('/group_members',LocationManager.FnAddGroupMembers);
router.get('/pending_request',LocationManager.FnGetPendingRequest);



//below service are for EZEIDAP
router.post('/ewLoginAP', LocationManager.FnLoginAP);
router.get('/ewLogoutAP', LocationManager.FnLogoutAP);
router.get('/ewGetUserDetailsAP', LocationManager.FnGetUserDetailsAP);
router.post('/ewUpdateUserProfileAP', LocationManager.FnUpdateUserProfileAP);
router.post('/ewtForgetPasswordAP', LocationManager.FnForgetPasswordAP);
router.post('/ewtChangePasswordAP', LocationManager.FnChangePasswordAP);
router.post('/ewtSaveEZEIDDataAP', LocationManager.FnSaveAPEZEID);
router.post('/ewtSaveEZEIDPictureAP', LocationManager.FnSaveAPEZEIDPicture);
router.get('/ewtGetEstateDataAP', LocationManager.FnGetRealStateDataAP);
router.get('/ewtGetEZEIDPictureAP', LocationManager.FnGetAPEZEIDPicture);
router.post('/ewtSaveBannerPictureAP', LocationManager.FnSaveBannerPictureAP);
router.get('/ewtGetBannerPictureAP', LocationManager.FnGetBannerPictureAP);
router.get('/ewtGetAllBannerPicsAP', LocationManager.FnGetAllBannerPicsAP);
router.get('/ewtGetSecondaryLocListAP',LocationManager.FnGetSecondaryLocationListAP);
router.get('/ewtGetSecondaryLocAP',LocationManager.FnGetSecondaryLocationAP);
router.post('/ewtUpdateSecondaryLocationAP', LocationManager.FnUpdateSecondaryLocationAP);
router.post('/ewtUpdateIdCardPrintAP', LocationManager.FnUpdateIdCardPrintAP);
router.get('/ewtGetIdCardPrintAP',LocationManager.FnGetIdCardPrintAP);
router.post('/ewtSearchRealEstateAP', LocationManager.FnSearchRealEstateAP);
router.post('/ewtUpdateRedFlagAP',LocationManager.FnUpdateRedFlagAP);
router.post('/ewtUpdateEZEIDAP', LocationManager.FnUpdateEZEIDAP);
router.post('/ewtDeleteBannerPicAP', LocationManager.FnDeleteBannerPictureAP);
router.post('/crop_imageAP',LocationManager.FnCropImageAP);


//EZEID VAS
router.get('/ewtLoginVES',LocationManager.FnLoginVES);
router.post('/ewtSaveContactVES',LocationManager.FnSaveContactVES);
router.get('/ewtGetAllContactsVES',LocationManager.FnGetAllContactsVES);
router.get('/ewmGetDepartmentVES',LocationManager.FnGetDepartmentVES);
router.get('/ewtGetContactVES',LocationManager.FnGetContactVES);
router.get('/ewtSearchContactsVES',LocationManager.FnSearchContactsVES);
router.get('/ewtCheckPasswordVES',LocationManager.FnCheckPasswordVES);
router.get('/ewtGetGatesVES',LocationManager.FnGetGatesVES);
router.post('/ewtSaveDepartmentsVES',LocationManager.FnSaveDepartmentsVES);
router.post('/ewtSaveGatesVES',LocationManager.FnSaveGatesVES);
router.post('/ewtSaveCitysVES',LocationManager.FnSaveCitysVES);



module.exports = router;