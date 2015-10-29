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
//Auth module methods
router.post('/ewSavePrimaryEZEData', LocationManager.FnRegistration);
router.post('/ewLogin', LocationManager.FnLogin);
router.get('/ewLogout', LocationManager.FnLogout);
router.get('/pass_reset_code',LocationManager.FnVerifyResetPasswordLink);
router.post('/verify_secret_code',LocationManager.FnVerifySecretCode);

//User module methods
router.get('/ewmGetCountry', LocationManager.FnGetCountry);
router.get('/ewmGetState', LocationManager.FnGetState);
router.get('/ewmGetCity', LocationManager.FnGetCity);
router.get('/ewtGetUserDetails', LocationManager.FnGetUserDetails);
router.get('/ewGetEZEID', LocationManager.FnCheckEzeid);
router.post('/ewtChangePassword', LocationManager.FnChangePassword);
router.post('/ewtForgetPassword', LocationManager.FnForgetPassword);
router.get('/ewtDecryptPassword', LocationManager.FnDecryptPassword);
router.get('/ewtCompanyProfile', LocationManager.FnGetCompanyProfile);
router.post('/ewtCompanyProfile', LocationManager.FnSaveCompanyProfile);
router.get('/ewtWebLink',LocationManager.FnGetWebLink);
router.post('/ewtWebLink',LocationManager.FnSaveWebLink);
router.delete('/ewtwebLink',LocationManager.FnDeleteWebLink);
router.get('/ewtEZEIDPrimaryDetails',LocationManager.FnEZEIDPrimaryDetails);
router.post('/ewtSaveCVInfo', LocationManager.FnSaveCVInfo);
router.get('/ewtGetCVInfo', LocationManager.FnGetCVInfo);
router.get('/skill_list',LocationManager.FnPGetSkills);
router.get('/ewtGetDocPin', LocationManager.FnGetDocPin);
router.get('/ewtGetDoc', LocationManager.FnGetDoc);
router.get('/ewtGetDocument', LocationManager.FnGetDocument);
router.post('/ewtUpdateDocPin', LocationManager.FnUpdateDocPin);
router.post('/ewtSaveDoc', LocationManager.FnSaveDoc);
router.get('/ewmGetFunctions', LocationManager.FnGetFunctions);
router.get('/ewtGetLoginDetails',LocationManager.FnGetLoginDetails);
router.post('/ewtUploadDoc', LocationManager.FnUploadDocument);
router.get('/ewmGetMTitle', LocationManager.FnGetMTitle);
router.post('/ewtUpdateProfilePicture', LocationManager.FnUpdateProfilePicture);
router.get('/ewtGetLoginCheck', LocationManager.FnGetLoginCheck);
router.get('/ewmGetProxmity', LocationManager.FnGetProxmity);
router.get('/institutes',LocationManager.FnGetInstitutes);
router.get('/educations',LocationManager.FnGetEducations);
router.get('/specialization',LocationManager.FnGetSpecialization);
router.get('/verify_institute',LocationManager.FnGetVerifiedInstitutes);
router.post('/user_details',LocationManager.FnSaveUserDetails);
router.get('/user_details_new',LocationManager.FnGetUserDetailsNew);
router.post('/send_resume',LocationManager.FnSendResume);
router.get('/download_resume',LocationManager.FnDownloadResume);
router.get('/alumni_user_details', LocationManager.FnGetAlumniUserDetails);
router.get('/search_alumni', LocationManager.FnSearchAlumni);
router.get('/conveyance_report', LocationManager.FnGetConveyanceReport);

//Audit module methods
router.get('/ewtGetAccessHistory', LocationManager.FnGetAccessHistory);
router.post('/ewtSaveWhiteBlackList', LocationManager.FnSaveWhiteBlackList);
router.get('/ewtGetWhiteBlackList', LocationManager.FnGetWhiteBlackList);
router.post('/ewtDeleteWhiteBlackList', LocationManager.FnDeleteWhiteBlackList);
router.get('/ewtGetWhiteListCount', LocationManager.FnGetWhiteListCount);
router.get('/ewmGetRelationType', LocationManager.FnGetRelationType);
router.post('/ewtTemplateDetails',LocationManager.FnSaveMailTemplate);
router.get('/ewtTemplateList',LocationManager.FnGetTemplateList);
router.get('/ewtTemplateDetails',LocationManager.FnGetTemplateDetails);
router.post('/ewtSendBulkMailer',LocationManager.FnSendBulkMailer);
router.post('/share_location',LocationManager.FnShareLocation);

//Location module methods
router.get('/ewtGetSecondaryLoc', LocationManager.FnGetSecondaryLocation);
router.post('/ewmAddLocation', LocationManager.FnAddLocation);
router.post('/ewDeleteLocation', LocationManager.FnDeleteLocation);
router.get('/ewtGetLocationListForEZEID', LocationManager.FnGetLocationListForEZEID);
router.get('/ewtGetLocationList',LocationManager.FnGetLocationList);
router.get('/location_image',LocationManager.FnGetLocationPicture);
router.get('/location_details',LocationManager.FnLocationDetails);
router.get('/validate_ezeone', LocationManager.FnValidateEZEOne);
router.get('/locations_map_view',LocationManager.FnGetLocationsofezeid);

//BusinessManager module methods
router.get('/ewtGetTranscation',LocationManager.FnGetTransaction);
router.post('/ewtSaveTranscation',LocationManager.FnSaveTransaction);
router.put('/update_transaction',LocationManager.FnUpdateTransaction);
router.get('/ewtGetTranscationItems',LocationManager.FnGetTransactionItems);
router.post('/ewtSaveTranscationItems',LocationManager.FnSaveTransactionItems);
router.get('/get_outbox_messages',LocationManager.FnGetOutboxMessages);
router.get('/transaction_autocomplete',LocationManager.FnGetTransAutoComplete);
router.get('/ewtGetItemListForEZEID',LocationManager.FnGetItemListForEZEID);
router.delete('/ewtDeleteTranscation',LocationManager.FnDeleteTransaction);
router.get('/ewtItemList',LocationManager.FnItemList);
router.get('/ewtItemDetails',LocationManager.FnItemDetails);
router.get('/ewtGetUserwiseFolderList',LocationManager.FnGetUserwiseFolderList);
router.post('/ewtUpdateBussinessListing', LocationManager.FnUpdateBussinessListing);
router.get('/company_details',LocationManager.FnGetCompanyDetails);
router.get('/ezeoneid',LocationManager.FnGetEZEOneIDInfo);
router.get('/transaction_attachment',LocationManager.FnGetTransAttachment);
router.get('/sales_statistics',LocationManager.FnSalesStatistics);

//Configuration module methods
router.post('/ewtConfig',LocationManager.FnSaveConfig);
router.get('/ewtConfig',LocationManager.FnGetConfig);
router.get('/ewmGetCategory', LocationManager.FnGetCategory);
router.get('/ewtGetStatusType',LocationManager.FnGetStatusType);
router.get('/ewmStatusType',LocationManager.FnStatusType);
router.post('/ewmSaveStatusType',LocationManager.FnSaveStatusType);
router.get('/ewtGetActionType',LocationManager.FnGetActionType);
router.post('/ewmSaveActionType',LocationManager.FnSaveActionType);
router.get('/ewtGetItemList',LocationManager.FnGetItemList);
router.post('/ewtSaveItem',LocationManager.FnSaveItem);
router.get('/ewtGetFolderList',LocationManager.FnGetFolderList);
router.post('/ewmSaveFolderRules',LocationManager.FnSaveFolderRules);
router.post('/ewtCreateSubUser',LocationManager.FnCreateSubUser);
router.get('/ewtGetSubUserList',LocationManager.FnGetSubUserList);
router.get('/reservation_resource',LocationManager.FnGetReservationResource);
router.post('/reservation_resource',LocationManager.FnSaveReservationResource);
router.put('/reservation_resource',LocationManager.FnUpdateReservationResource);
router.post('/reservation_service',LocationManager.FnSaveReservationService);
router.put('/reservation_service',LocationManager.FnUpdateReservationService);
router.get('/reservation_service',LocationManager.FnGetReservationService);
router.get('/reservation_resource_service_map',LocationManager.FnGetReservResourceServiceMap);
router.post('/reservation_resource_service_map',LocationManager.FnSaveReservResourceServiceMap);
router.post('/ewtWorkingHours',LocationManager.FnSaveWorkingHours);
router.get('/ewtWorkingHours',LocationManager.FnGetWorkingHours);
router.delete('/ewtWorkingHours',LocationManager.FnDeleteWorkingHours);
router.post('/ewtHolidayList',LocationManager.FnSaveHolidayCalendar);
router.get('/ewtHolidayList',LocationManager.FnGetHolidayList);
router.delete('/ewtHolidayList',LocationManager.FnDeleteHolidayList);
router.get('/get_workinghours_details',LocationManager.FnWorkingHoursDetails);

//Search module methods
router.post('/ewSearchByKeywords', LocationManager.FnSearchByKeywords);
router.get('/ewtGetSearchInformationNew', LocationManager.FnGetSearchInformationNew);
router.get('/ewtGetSearchDocuments', LocationManager.FnGetSearchDocuments);
router.get('/ewtGetBannerPicture', LocationManager.FnGetBannerPicture);
router.post('/ewtSearchForTracker', LocationManager.FnSearchForTracker);
router.get('/ewtGetWorkingHrsHolidayList',LocationManager.FnGetWorkingHrsHolidayList);
router.get('/navigation',LocationManager.FnNavigateSearch);

//Mail Module methods
router.post('/ewtSendMail', LocationManager.FnSendMail);

//Image module methods
router.post('/crop_image',LocationManager.FnCropImage);
router.get('/image_url',LocationManager.FnImageURL);
router.get('/ezeone_image',LocationManager.FnGetPictureOfEzeid);
router.get('/profile_image',LocationManager.FnProfileImageURL);

//Reservation module methods
router.post('/reservation_transaction',LocationManager.FnSaveReservTransaction);
router.get('/reservation_transaction',LocationManager.FnGetReservTask);
router.get('/reservation_maped_services',LocationManager.FnGetMapedServices);
router.get('/reservation_trans_details',LocationManager.FnGetResTransDetails);
router.put('/reservation_transaction',LocationManager.FnChangeReservationStatus);
router.get('/get_workinghours_list',LocationManager.FnGetworkinghoursList);
router.post('/feedback',LocationManager.FnSaveFeedback);
router.get('/feedback',LocationManager.FnGetFeedback);
router.get('/resource_image',LocationManager.FnResourcePicture);

//Job module methods
router.post('/job',LocationManager.FnSaveJobs);
router.get('/job',LocationManager.FnGetJobs);
router.get('/job_locations',LocationManager.FnGetJobLocations);
router.get('/job_search',LocationManager.FnSearchJobs);
router.post('/job_seeker_search',LocationManager.FnJobSeekerSearch);
router.post('/job_apply',LocationManager.FnApplyJob);
router.get('/job_applied_list',LocationManager.FnAppliedJobList);
router.get('/job_details',LocationManager.FnGetJobDetails);
router.get('/jobs',LocationManager.FnJobs);
router.get('/applied_job',LocationManager.FnGetAppliedJob);
router.get('/job_country',LocationManager.FnGetJobcountry);
router.get('/job_city',LocationManager.FnGetjobcity);
router.post('/jobseeker_message',LocationManager.FnJobSeekersMessage);
router.get('/jobs_list',LocationManager.FnGetListOfJobs);
router.put('/refresh_job',LocationManager.FnJobRefresh);
router.get('/job_match',LocationManager.FnJobsMatch);
router.get('/job_myinstitute',LocationManager.FnJobsMyInstitute);
router.get('/notify_student',LocationManager.FnNotifyRelevantStudent);
router.get('/applicant_list',LocationManager.FnViewApplicantList);
router.get('/view_job_details',LocationManager.FnViewJobDetails);
router.post('/job_notification',LocationManager.FnJobNotification);
router.get('/find_institute',LocationManager.FnFindInstitute);
router.post('/add_selected_job',LocationManager.FnAddtoSelectedJob);
router.post('/job_location',LocationManager.FnSaveJobLoaction);
router.get('/ezeone_jobs',LocationManager.getEZEOneIdJobs);

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
router.get('/group_list',LocationManager.FnGetGroupList);
router.get('/load_group_message',LocationManager.FnLoadMessages);
router.get('/validate_group_member',LocationManager.FnValidateGroupMember);
router.get('/message_full_view',LocationManager.FnViewMessage);
router.get('/message_attachment',LocationManager.FnGetMessageAttachment);
router.get('/group_info',LocationManager.FnGetGroupInfo);
router.get('/unread_message_count',LocationManager.FnCountOfUnreadMessage);
router.get('/message_fullview_new',LocationManager.FnViewMessageNew);
router.put('/change_group_admin',LocationManager.FnChangeGroupAdmin);
router.put('/change_task_status',LocationManager.FnUpdateTaskStatus);
router.get('/chat',LocationManager.FnGetLastMsgOfGroup);

//Planner module
router.get('/tasks',LocationManager.FnGetAllTask);
router.get('/ewtGetTransaction',LocationManager.FnGetTrans);

//Alumni module
router.post('/alumni_content',LocationManager.FnSaveAlumniContent);
router.post('/alumni_team',LocationManager.FnSaveAlumniTeam);
router.get('/alumni_content',LocationManager.FnGetAlumniContent);
router.get('/alumni_team',LocationManager.FnGetAlumniTeam);
router.delete('/alumni_team',LocationManager.FnDeleteAlumniTeam);
router.get('/cover_image',LocationManager.FnGetAlumniContentImage);
router.post('/alumni_profile',LocationManager.FnSaveAlumniProfile);
router.get('/alumniteam_details',LocationManager.FnGetAlumniTeamDetails);
router.get('/alumni_profile',LocationManager.FnGetAlumniProfile);
router.post('/alumni_signup',LocationManager.FnRegistrationAlumni);
router.post('/ten_details',LocationManager.FnSaveTENMaster);
router.get('/ten_details',LocationManager.FnGetTENDetails);
router.get('/profile_status',LocationManager.FnGetProfileStatus);
router.post('/join_event',LocationManager.FnSaveTENUsers);
router.post('/ten_approve',LocationManager.FnApproveTEN);
router.post('/ten_comments',LocationManager.FnSaveComments);
router.get('/participated_eventsId',LocationManager.FnGetParticipatedEventsId);
router.get('/ten_approval_list',LocationManager.FnGetAlumniApprovalList);
router.get('/team_content',LocationManager.FnGetTeamContent);
router.get('/team_image',LocationManager.FnGetTeamImage);
router.get('/ten_attachment',LocationManager.FnGetTENAttachment);
router.post('/ten_venue',LocationManager.FnSaveTENVenue);
router.get('/participants_list',LocationManager.FnGetParticipantsList);
//new url's
router.get('/client_list',LocationManager.FnClientList);
router.get('/contact_list',LocationManager.FnClientContacts);
router.get('/job_list',LocationManager.FnGetJobList);
router.post('/add_job',LocationManager.FnCreateJobs);
router.get('/view_job',LocationManager.FnViewJob);
router.get('/job_approval_list',LocationManager.FnGetAlumniJobApprovalList);
router.post('/job_approve',LocationManager.FnApproveAlumniJobs);
router.get('/search_alumni_ten',LocationManager.FnSearchAlumniTEN);
router.get('/search_alumni_job',LocationManager.FnSearchAlumniTEN);
router.get('/my_alumni_jobs',LocationManager.FnGetMyAlumniJobs);

//Gingerbite module
router.post('/chef_mail',LocationManager.FnSendMailGingerbite);
router.post('/techplasma_mail',LocationManager.FnSendMailTechplasma);
router.post('/fomads_mail',LocationManager.FnSendFomadsFeedbckMail);

//Recruitment module
router.get('/recruitment_masters',LocationManager.FnGetRecruitmentMasters);
router.get('/sales_masters',LocationManager.FnGetSalesMasters);

//Contact Manager Module
router.get('/client',LocationManager.FnGetClientList);
router.get('/contact',LocationManager.FnGetClientContacts);
router.post('/client',LocationManager.FnSaveClient);
router.post('/contact',LocationManager.FnSaveClientContact);

//Task Manager Module
router.post('/task_manager/task',LocationManager.FnSaveTaskManager);
router.get('/task_manager/task',LocationManager.FnGetTasks);



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

var version1 = require('./v1Api.js');
router.use('/v1',version1);
/**
 * Default error handler
 * Add every API call above this
 */
router.all('*',function(req,res,next){
    res.status(404).json({ status : false, error : { api : 'API'}, message : 'Not found'});
});

module.exports = router;
