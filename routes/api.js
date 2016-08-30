/**
 *  @author Gowri shankar
 *  @since July 22,2015 02:55 PM IST
 *  @title api.js
 *  @description Handles all web services url paths
 */
"use strict";

var express = require('express');
var router = express.Router();

var DbHelper = require('./../helpers/DatabaseHandler'),
    db = DbHelper.getDBContext();

var StdLib = require('./modules/std-lib.js');
var stdLib = new StdLib(db);

router.all('*',function(req,res,next){
    req.db = db;
    req.st = stdLib;


    /**
     * User Agent Detection Code
     *
     */
    var deviceMapping = {
        web : 1,
        android : 2,
        ios : 3,
        windowsPhone : 4,
        windowsApp :  5
    };

    var preUserAgents = {
        android : '$__EZEONE_|_2015_|_ANDROID_|_APP__$',
        ios : '$__EZEONE_|_2016_|_IPHONE_|_APP__$',
        windowsPhone : '|gInGeRbItE_wInDoWs_pHoNe_2O!5|',
        windowsApp : '$_gInGeRbItE_wiNDowS_pcAPp_2015_$',
        web : 'EZEONE_WEB_CLIENT'
    };

    var deviceType = 1;
    var platform = '';

    var ip =  req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var deviceId = (req.headers['device_id']) ?  req.headers['device_id'] : '';
    var deviceAgent = (req.headers['device-agent']) ? req.headers['device-agent'] : '';

    for(var agent in preUserAgents){
        if(preUserAgents.hasOwnProperty(agent) && preUserAgents[agent] === deviceAgent){
            deviceType = deviceMapping[agent];
            platform = agent;
            break;
        }
    }

    /**
     * If deviceType is greater than one then request is from mobile always
     */
    req.isMobile = (deviceType > 1) ? 1 : 0;
    req.platform = platform;
    req.deviceId = deviceId;
    req.deviceAgent = deviceAgent;
    //req.ip = ip;

    next();
});
var minorVersion1Api = require('./api/minor-api.js');

router.use('/v1.1',minorVersion1Api);

/**
 * Services for MQTT Messaging Server Interface
 */
var Notification = require('./modules/notification/notification-master.js');
var notification = new Notification(db,stdLib);
router.get('/ms_auth/user',notification.authUser);
router.get('/ms_auth/vhost',notification.authVHost);
router.get('/ms_auth/resource',notification.authResource);


//EZEID Methods
//Auth module methods
var Auth = require('./modules/auth-module.js');
var authModule = new Auth(db,stdLib);
router.post('/ewSavePrimaryEZEData', authModule.register);
router.post('/ewLogin', authModule.login);
router.get('/ewLogout', authModule.logout);
router.get('/pass_reset_code',authModule.verifyResetCode);
router.post('/verify_secret_code',authModule.verifySecretCode);
router.post('/otp', authModule.sendOtp);

//User module methods
var User = require('./modules/user-module.js');
var userModule = new User(db,stdLib);
router.get('/ewmGetCountry', userModule.getCountry);
router.get('/ewmGetState', userModule.getState);
router.get('/ewmGetCity', userModule.getCity);
router.get('/ewtGetUserDetails', userModule.getUserDetails);
router.get('/ewGetEZEID', userModule.checkEzeid);
router.post('/ewtChangePassword', userModule.changePassword);
router.post('/ewtForgetPassword', userModule.forgetPassword);
router.get('/ewtDecryptPassword', userModule.decryptPassword);
router.get('/ewtCompanyProfile', userModule.getCompanyProfile);
router.post('/ewtCompanyProfile', userModule.saveCompanyProfile);
router.get('/ewtWebLink',userModule.getWebLink);
router.post('/ewtWebLink',userModule.saveWebLink);
router.delete('/ewtwebLink',userModule.deleteWebLink);
router.get('/ewtEZEIDPrimaryDetails',userModule.getEzeidDetails);
router.post('/ewtSaveCVInfo', userModule.saveResume);
router.get('/ewtGetCVInfo', userModule.getResume);
router.get('/skill_list',userModule.getSkills);
router.get('/ewtGetDocPin', userModule.getDocPin);
router.get('/ewtGetDoc', userModule.getDoc);
router.get('/ewtGetDocument', userModule.getDocument);
router.post('/ewtUpdateDocPin', userModule.updateDocPin);
router.post('/ewtSaveDoc', userModule.saveDoc);
router.get('/ewmGetFunctions', userModule.getFunctions);
router.get('/ewtGetLoginDetails',userModule.getLoginDetails);
router.post('/ewtUploadDoc', userModule.uploadDoc);
router.get('/ewmGetMTitle', userModule.getMTitle);
router.post('/ewtUpdateProfilePicture', userModule.updateProfilePicture);
router.get('/ewtGetLoginCheck', userModule.getLoginCheck);
router.get('/ewmGetProxmity', userModule.getProxmity);
router.get('/institutes',userModule.getInstitutes);
router.get('/educations',userModule.getEducations);
router.get('/specialization',userModule.getSpecialization);
router.get('/verify_institute',userModule.getVerifiedInstitutes);
router.post('/user_details',userModule.saveUserDetails);
router.get('/user_details_new',userModule.getUserDetailsNew);
router.post('/send_resume',userModule.sendResume);
router.get('/download_resume',userModule.downloadResume);
router.get('/conveyance_report', userModule.getConveyanceReport);
router.get('/industry_type_list',userModule.getindustryType);
router.get('/industry_category',userModule.getindustrycategory);
router.get('/pic_for_ezeid',userModule.profilePicForEzeid);

//Audit module methods
var Audit = require('./modules/audit-module.js');
var auditModule = new Audit(db,stdLib);
router.get('/ewtGetAccessHistory', auditModule.getAccessHistory);
router.post('/ewtSaveWhiteBlackList', auditModule.saveList);
router.get('/ewtGetWhiteBlackList', auditModule.getList);
router.post('/ewtDeleteWhiteBlackList', auditModule.deleteList);
router.get('/ewtGetWhiteListCount', auditModule.getListCount);
router.get('/ewmGetRelationType', auditModule.getRelation);
router.post('/ewtTemplateDetails',auditModule.saveMailTemplate);
router.get('/ewtTemplateList',auditModule.getMailTemplate);
router.get('/ewtTemplateDetails',auditModule.getTemplateDetails);
router.post('/ewtSendBulkMailer',auditModule.sendBulkMailer);

//Location module methods
var Location = require('./modules/location-module.js');
var locationModule = new Location(db,stdLib);
router.get('/ewtGetSecondaryLoc', locationModule.getAll);
router.post('/ewmAddLocation', locationModule.save);
router.post('/ewDeleteLocation', locationModule.deleteLocation);
router.get('/ewtGetLocationListForEZEID', locationModule.getAllForEzeid);
router.get('/ewtGetLocationList',locationModule.getLoactionList);
router.get('/location_image',locationModule.getLocationPicture);
router.get('/location_details',locationModule.getLocationDetails);
router.post('/share_location',locationModule.shareLocation);
router.get('/validate_ezeone', locationModule.validateEZEOne);
router.get('/locations_map_view',locationModule.getLocationsofezeid);
router.post('/location_for_employer',locationModule.saveLocationforEmployers);


//BusinessManager module methods
var BusinessManager = require('./modules/business-module.js');
var businessManager = new BusinessManager(db,stdLib);
//router.get('/ewtGetTranscation',businessManager.getTransactions);
router.get('/applicant_transaction',businessManager.getApplicantTransaction);
router.post('/sales_transaction',businessManager.saveSalesTransaction);
router.get('/sales_transaction',businessManager.getSalesTransaction);
router.put('/update_transaction',businessManager.updateTransaction);
router.get('/ewtGetTranscationItems',businessManager.getTransactionItems);
//router.post('/ewtSaveTranscationItems',businessManager.saveTransactionItems);
router.get('/get_outbox_messages',businessManager.getOutboxTransactions);
router.get('/transaction_autocomplete',businessManager.getTransAutoComplete);
router.get('/ewtGetItemListForEZEID',businessManager.getItemListForEZEID);
router.delete('/ewtDeleteTranscation',businessManager.deleteTransaction);
router.get('/ewtItemList',businessManager.itemList);
router.get('/ewtItemDetails',businessManager.itemDetails);
router.get('/ewtGetUserwiseFolderList',businessManager.getUserwiseFolderList);
router.post('/ewtUpdateBussinessListing', businessManager.updateBussinessList);
router.get('/company_details',businessManager.getCompanyDetails);
router.get('/ezeoneid',businessManager.getEZEOneIDInfo);
router.get('/transaction_attachment',businessManager.getTransAttachment);
router.get('/sales_statistics',businessManager.salesStatistics);
router.post('/sales_request',businessManager.sendSalesRequest);
router.post('/ewtSaveTranscation',businessManager.sendSalesRequest);
router.post('/transaction_history',businessManager.createTransactionHistory);
router.get('/transaction_history',businessManager.getTransactionHistory);
router.post('/m/sales_transaction',businessManager.saveSalesRequest);
router.get('/m/company_name',businessManager.getCompanyName);
router.get('/m/contact_details',businessManager.getContactDetails);
router.get('/role',businessManager.getRoles);
router.get('/m/sales_transaction',businessManager.getTransactionOfSales);
router.post('/external_sales_request', businessManager.saveExternalsalesRequest);
router.get('/m/sales_trans_details', businessManager.getSalesTransDetails);
//router.get('/test_sales_mail', businessManager.testFunction);

//Configuration module methods
var Configuration = require('./modules/configuration-module.js');
var configurationModule = new Configuration(db,stdLib);
router.post('/ewtConfig',configurationModule.save);
router.get('/ewtConfig',configurationModule.get);
router.get('/ewmGetCategory', configurationModule.getBusinessCategories);
router.get('/ewtGetStatusType',configurationModule.getStatusTypes);
router.get('/ewmStatusType',configurationModule.StatusTypes);
router.post('/ewmSaveStatusType',configurationModule.saveStatusType);
router.get('/ewtGetActionType',configurationModule.getActionTypes);
router.post('/ewmSaveActionType',configurationModule.saveActionType);
router.get('/ewtGetItemList',configurationModule.getItems);
router.post('/ewtSaveItem',configurationModule.saveItems);
router.get('/ewtGetFolderList',configurationModule.getFolders);
router.post('/ewmSaveFolderRules',configurationModule.saveFolder);
router.post('/ewtCreateSubUser',configurationModule.createSubuser);
router.get('/ewtGetSubUserList',configurationModule.getSubusers);
router.get('/reservation_resource',configurationModule.getReservationResources);
router.post('/reservation_resource',configurationModule.saveReservationResource);
router.put('/reservation_resource',configurationModule.updateReservationResource);
router.post('/reservation_service',configurationModule.saveReservationService);
router.put('/reservation_service',configurationModule.updateReservationService);
router.get('/reservation_service',configurationModule.getReservationServices);
router.get('/reservation_resource_service_map',configurationModule.getResourceServiceMaps);
router.post('/reservation_resource_service_map',configurationModule.saveResourceServiceMap);
router.post('/ewtWorkingHours',configurationModule.saveWorkingHoursTemplate);
router.get('/ewtWorkingHours',configurationModule.getWorkingHoursTemplates);
router.delete('/ewtWorkingHours',configurationModule.deleteWorkingHours);
router.post('/ewtHolidayList',configurationModule.saveHoliday);
router.get('/ewtHolidayList',configurationModule.getHolidays);
router.delete('/ewtHolidayList',configurationModule.deleteHoliday);
router.get('/get_workinghours_details',configurationModule.getWorkingHoursDetails);
router.post('/institute_group',configurationModule.saveInstituteGroup);
router.get('/institute_group',configurationModule.getInstituteGroup);
router.get('/institute_details',configurationModule.getInstituteConfig);
router.get('/institute_group_details',configurationModule.getInstituteGroupDetails);
router.delete('/job_institute/:job_id/:institute_id',configurationModule.deleteJobInstitute);

//Search module methods
var Search = require('./modules/search-module.js');
var searchModule = new Search(db,stdLib);
router.post('/ewSearchByKeywords', searchModule.searchKeyword);
router.get('/ewtGetSearchInformationNew', searchModule.searchInformation);
router.get('/ewtGetSearchDocuments', searchModule.getSearchDoc);
router.get('/ewtGetBannerPicture', searchModule.getBanner);
router.post('/ewtSearchForTracker', searchModule.searchTracker);
router.get('/ewtGetWorkingHrsHolidayList',searchModule.getWorkingHrsHolidayList);
router.get('/navigation',searchModule.navigateSearch);

//Mail Module methods
var Mail = require('./modules/mail-module.js');
var mailModule = new Mail(db,stdLib);
router.post('/ewtSendMail', mailModule.sendMail);
router.post('/business/mail', mailModule.businessMail);

//Message Notification Module methods
var MessageNotification = require('./modules/message-notification-module.js');
var msgNotification = new MessageNotification(db,stdLib);

//Image module methods
var Image = require('./modules/image-module.js');
var imageModule = new Image(db,stdLib);
router.post('/crop_image',imageModule.cropImage);
router.get('/image_url',imageModule.imageURL);
router.get('/ezeone_image',imageModule.getPictureOfEzeid);
router.get('/profile_image',imageModule.profileImageURL);

//Reservation module methods
var Reservation = require('./modules/reservation-module.js');
var reservationModule = new Reservation(db,stdLib);
router.post('/reservation_transaction',reservationModule.SaveReservTrans);
router.get('/reservation_transaction',reservationModule.getReservTrans);
router.get('/reservation_maped_services',reservationModule.getMapedServices);
router.get('/reservation_trans_details',reservationModule.getTransDetails);
router.put('/reservation_transaction',reservationModule.changeReservStatus);
router.get('/get_workinghours_list',reservationModule.getworkinghoursList);
router.post('/feedback',reservationModule.saveFeedback);
router.get('/feedback',reservationModule.getFeedback);
router.get('/resource_image',reservationModule.getResourcePicture);

//Job module methods
var Job = require('./modules/job-module.js');
var jobModule = new Job(db,stdLib);
router.post('/job',jobModule.create);
router.get('/job',jobModule.getAll);
router.get('/job_locations',jobModule.getJobLocations);
router.get('/job_search',jobModule.searchJobs);
router.post('/job_seeker_search',jobModule.searchJobSeekers);
router.post('/job_apply',jobModule.applyJob);
router.get('/job_applied_list',jobModule.appliedJobList);
router.get('/job_details',jobModule.getJobDetails);
router.get('/jobs',jobModule.jobs);
router.get('/applied_job',jobModule.getAppliedJob);
router.get('/job_country',jobModule.getJobcountry);
router.get('/job_city',jobModule.getjobcity);
router.post('/jobseeker_message',jobModule.jobSeekersMessage);
router.get('/jobs_list',jobModule.getListOfJobs);
router.put('/refresh_job',jobModule.jobRefresh);
router.get('/job_match',jobModule.jobsMatch);
router.get('/job_myinstitute',jobModule.jobsMyInstitute);
router.get('/notify_student',jobModule.notifyRelevantStudent);
router.get('/applicant_list',jobModule.viewApplicantList);
router.get('/view_job_details',jobModule.viewJobDetails);
router.post('/job_notification',jobModule.jobNotification);
router.get('/find_institute',jobModule.findInstitute);
router.post('/job/:jobId/candidate',jobModule.addtoSelectedJob);
router.post('/job_location',jobModule.saveJobLocation);
router.get('/candidates_list',jobModule.getCandidatesList);
router.post('/candidates_status',jobModule.updateCandidateStatus);
router.get('/auto_search',jobModule.autoSearchJobs);
router.post('/applicant_status',jobModule.applicantStatus);
router.put('/job/status',jobModule.activateJobPO);
router.post('/notify_job_seekers',jobModule.notifyRelevantJobSeekers);

/**
 * Link multiple candidates to multiple jobs at once
 *
 * @method POST
 * @service-param candidate_list
 * @service-param job_list
 */
router.post('/jobs_to_applicants',jobModule.assignJobsToApplicants);

//MessageBox module methods
var Messagebox = require('./modules/messagebox-module.js');
var messageBox = new Messagebox(db,stdLib);
router.post('/create_group',messageBox.createMessageGroup);
router.get('/validate_groupname',messageBox.validateGroupName);
router.put('/user_status',messageBox.updateUserStatus);
router.put('/user_relationship',messageBox.updateUserRelationship);
router.delete('/group',messageBox.deleteGroup);
router.post('/message_request',messageBox.sendMessageRequest);
router.post('/compose_message',messageBox.composeMessage);
router.get('/members_list',messageBox.getMembersList);
router.get('/messagebox',messageBox.loadMessageBox);
router.put('/message_activity',messageBox.changeMessageActivity);
router.get('/outbox_messages',messageBox.loadOutBoxMessages);
router.get('/suggestion_list',messageBox.getSuggestionList);
router.post('/group_members',messageBox.addGroupMembers);
router.get('/pending_request',messageBox.getPendingRequest);
router.get('/group_list',messageBox.getGroupList);
router.get('/load_group_message',messageBox.loadMessages);
router.get('/validate_group_member',messageBox.validateGroupMember);
router.get('/message_full_view',messageBox.viewMessage);
router.get('/message_attachment',messageBox.getMessageAttachment);
router.get('/group_info',messageBox.getGroupInfo);
router.get('/unread_message_count',messageBox.countOfUnreadMessage);
router.get('/message_fullview_new',messageBox.viewMessageNew);
router.put('/change_group_admin',messageBox.changeGroupAdmin);
router.put('/change_task_status',messageBox.updateTaskStatus);
router.get('/chat',messageBox.getLastMsgOfGroup);
router.post('/forward_message',messageBox.forwardMessage);
router.get('/message_list',messageBox.getMessageList);

//Planner module
var Planner = require('./modules/planner-module.js');
var plannerModule = new Planner(db,stdLib);
router.get('/tasks',plannerModule.getAllTask);
router.get('/ewtGetTransaction',plannerModule.getTrans);

//Alumni module
var Alumni = require('./modules/alumni-module.js');
var alumniModule = new Alumni(db,stdLib);
router.delete('/event',alumniModule.deleteEvent);
router.post('/alumni_content',alumniModule.saveAlumniContent);
router.post('/alumni_profile_pic',alumniModule.saveAlumniProfilePic);
router.post('/alumni_team',alumniModule.saveAlumniTeam);
router.get('/alumni_content',alumniModule.getAlumniContent);
router.get('/alumni_team',alumniModule.getAlumniTeam);
router.delete('/alumni_team',alumniModule.deleteAlumniTeam);
router.get('/cover_image',alumniModule.getAlumniContentImage);
router.post('/alumni_profile',alumniModule.saveAlumniProfile);
router.get('/alumniteam_details',alumniModule.getAlumniTeamDetails);
router.get('/alumni_profile',alumniModule.getAlumniProfile);
router.post('/alumni_signup',alumniModule.registerAlumni);
router.post('/ten_details',alumniModule.saveTENMaster);
router.get('/ten_details',alumniModule.getTENDetails);
router.get('/my_ten_details',alumniModule.getMyTENDetails);
router.get('/profile_status',alumniModule.getProfileStatus);
router.post('/join_event',alumniModule.saveTENUsers);
router.post('/ten_approve',alumniModule.approveTEN);
router.post('/ten_comments',alumniModule.saveComments);
router.get('/participated_eventsId',alumniModule.getParticipatedEventsId);
router.get('/ten_approval_list',alumniModule.getAlumniApprovalList);
router.get('/team_content',alumniModule.getTeamContent);
router.get('/team_image',alumniModule.getTeamImage);
router.get('/ten_attachment',alumniModule.getTENAttachment);
router.post('/ten_venue',alumniModule.saveTENVenue);
router.get('/participants_list',alumniModule.getParticipantsList);
router.get('/job_approval_list',alumniModule.getAlumniJobApprovalList);
router.post('/job_approve',alumniModule.approveAlumniJobs);
router.get('/search_alumni_ten',alumniModule.searchAlumniTEN);
router.get('/search_alumni_job',alumniModule.searchAlumniJobs);
router.get('/my_alumni_jobs',alumniModule.getMyAlumniJobs);
router.get('/alumni_user_details', alumniModule.getAlumniUserDetails);
router.get('/search_alumni', alumniModule.searchAlumni);
router.put('/leave_alumni', alumniModule.leaveAlumni);
router.put('/alumni_member', alumniModule.approveAlumnimembers);
router.delete('/ten_attachment',alumniModule.deleteTenAttachment);
router.get('/alumni_education',alumniModule.getAlumniEducations);
router.get('/alumni_specialization',alumniModule.getAlumniSpecialization);
router.put('/alumni_change_member_type',alumniModule.changeAlumniMemberType);


//new url's
router.get('/client_list',alumniModule.getClientList);
router.get('/contact_list',alumniModule.getClientContacts);
router.get('/job_list',alumniModule.getAll);
router.post('/add_job',alumniModule.create);
router.get('/view_job',alumniModule.viewJobDetails);
router.post('/test', alumniModule.testUrl);

//Recruitment module
var Recruitment = require('./modules/recruitment-module.js');
var recruitmentModule = new Recruitment(db,stdLib);
router.get('/recruitment_masters',recruitmentModule.getRecruitmentMasters);
router.get('/recruitment/institute',recruitmentModule.getInstitutesList);
router.get('/sales_masters',recruitmentModule.getSalesMasters);
router.get('/recruitment/recent_candidate',recruitmentModule.getLatestCV);

//Gingerbite module
var Gingerbite = require('./modules/gingerbite-module.js');
var gingerModule = new Gingerbite(db,stdLib);
router.post('/chef_mail',gingerModule.sendMailGingerbite);
router.post('/techplasma_mail',gingerModule.sendMailTechplasma);
router.post('/fomads_mail',gingerModule.sendFeedbackMailFomads);


//Contact Manager Module
var ContactManager = require('./modules/contact-manager-module.js');
var contactManager = new ContactManager(db,stdLib);
router.get('/client',contactManager.getClientList);
router.get('/contact',contactManager.getClientContacts);
router.post('/client',contactManager.saveClient);
router.post('/contact',contactManager.saveClientContact);

//Task Manager Module
var TaskManager = require('./modules/task-manager-module.js');
var taskManager = new TaskManager(db,stdLib);
router.post('/task_manager/task',taskManager.saveTaskManager);
router.get('/task_manager/task',taskManager.getTasks);
router.get('/task_manager_details',taskManager.taskDetails);

//Tag Module (save tag of docs, urls, pics and banner pics)
var Tag = require('./modules/tag-module.js');
var tagModule = new Tag(db,stdLib);
router.post('/v1/st_tag',tagModule.saveStandardTags);
router.get('/v1/st_tag',tagModule.getStandardTags);
router.post('/v1/tag',tagModule.saveTags);
router.get('/v1/tag',tagModule.getTags);
router.delete('/v1/tag',tagModule.deleteTag);
router.post('/save_pictures',tagModule.savePictures);
router.put('/v1/tag',tagModule.updatePin);

//Sos Module
var Sos = require('./modules/sos-module.js');
var sosModule = new Sos(db,stdLib);
router.post('/sos_request',sosModule.saveSos);
router.post('/sos_post_request',sosModule.postSos);
router.get('/sos_request',sosModule.loadSosRequest);
router.post('/sos_update_request',sosModule.updateSosRequest);
router.post('/sos_service_provider',sosModule.saveSosServiceProvider);
router.get('/sos_service_provider',sosModule.getSosServiceProvider);

//Loc Module
var Loc = require('./modules/loc-module.js');
var locModule = new Loc(db,stdLib);
router.post('/loc_map',locModule.saveLocMap);
router.get('/loc_map',locModule.getLocMap);
router.get('/loc_details/employer',locModule.loadLocDetailsEmployer);
router.get('/loc_details/trainer',locModule.loadLocDetailsTrainer);
router.get('/loc_details/syllabus',locModule.loadLocDetailsSyllabus);
router.get('/loc',locModule.getLoc);
router.post('/loc',locModule.saveLoc);
router.get('/loc_basket',locModule.getLocBasket);

//Service Module
var Service = require('./modules/service-module.js');
var serviceModule = new Service(db,stdLib);
router.get('/service_provider',serviceModule.getServiceProviders);
router.get('/service',serviceModule.getServices);
router.get('/service_categories',serviceModule.getServiceCategories);
router.get('/service_details',serviceModule.getServiceDetails);
router.post('/service',serviceModule.createService);
router.post('/service_change',serviceModule.updateService);
router.post('/join_member',serviceModule.addMembersToService);
router.get('/joined_community',serviceModule.getJoinedCommunity);
router.delete('/community_member',serviceModule.deleteCommunityMember);
router.post('/service_pic',serviceModule.saveServicePic);
router.post('/service_attachment',serviceModule.saveServiceAttachment);
router.post('/service_video',serviceModule.saveServiceVideo);



/**
 * @service-param
 * token <string>
 */
router.get('/community_member_count',serviceModule.isCommunityMember);



//EZEIDAP Methods
//Auth-ModuleAP
var Auth_AP = require('./ap-modules/auth-module-ap.js');
var authModuleAP = new Auth_AP(db,stdLib);
router.post('/ewLoginAP', authModuleAP.loginAP);
router.get('/ewLogoutAP', authModuleAP.logoutAP);
router.post('/ewtForgetPasswordAP', authModuleAP.forgetPasswordAP);
router.post('/ewtChangePasswordAP', authModuleAP.changePasswordAP);

//User-ModuleAP
var User_AP = require('./ap-modules/user-module-ap.js');
var userModuleAP = new User_AP(db,stdLib);
router.get('/ewGetUserDetailsAP', userModuleAP.getUserDetailsAP);
router.post('/ewUpdateUserProfileAP', userModuleAP.updateUserProfileAP);
router.post('/ewtSaveEZEIDDataAP', userModuleAP.saveAPEZEID);
router.post('/ewtUpdateRedFlagAP',userModuleAP.updateRedFlagAP);
router.post('/ewtUpdateEZEIDAP', userModuleAP.updateEZEIDAP);
router.post('/add_banners_ap', userModuleAP.savePaidBannersAp);

//Image-ModuleAP
var Image_AP = require('./ap-modules/image-module-ap.js');
var imageModuleAP = new Image_AP(db,stdLib);
router.post('/ewtSaveEZEIDPictureAP', imageModuleAP.saveAPEZEIDPicture);
router.get('/ewtGetEZEIDPictureAP', imageModuleAP.getAPEZEIDPicture);
router.post('/ewtSaveBannerPictureAP', imageModuleAP.saveBannerPictureAP);
router.get('/ewtGetBannerPictureAP', imageModuleAP.getBannerPictureAP);
router.get('/ewtGetAllBannerPicsAP', imageModuleAP.getAllBannerPicsAP);
router.post('/ewtDeleteBannerPicAP', imageModuleAP.deleteBannerPictureAP);
router.post('/crop_imageAP',imageModuleAP.cropImageAP);

//Location-ModuleAP
var Location_AP = require('./ap-modules/location-module-ap.js');
var locationModuleAP = new Location_AP(db,stdLib);
router.get('/ewtGetSecondaryLocListAP',locationModuleAP.getSecondaryLocationListAP);
router.get('/ewtGetSecondaryLocAP',locationModuleAP.getSecondaryLocationAP);
router.post('/ewtUpdateSecondaryLocationAP', locationModuleAP.updateSecondaryLocationAP);

//RealEsate-ModuleAP
var RealEstate_AP = require('./ap-modules/real-estate-ap.js');
var realEstateAP = new RealEstate_AP(db,stdLib);
router.get('/ewtGetEstateDataAP', realEstateAP.getRealStateDataAP);
router.post('/ewtSearchRealEstateAP', realEstateAP.searchRealEstateAP);


//IDCard-ModuleAP
var IDCard_AP = require('./ap-modules/idcard-module-ap.js');
var idcardAP = new IDCard_AP(db,stdLib);
router.post('/ewtUpdateIdCardPrintAP', idcardAP.updateIdCardPrintAP);
router.get('/ewtGetIdCardPrintAP',idcardAP.getIdCardPrintAP);


//EZEID VAS
var VES = require('./ves-modules/ves-module.js');
var vesModule= new VES(db,stdLib);
router.get('/ewtLoginVES',vesModule.loginVES);
router.post('/ewtSaveContactVES',vesModule.saveContactVES);
router.get('/ewtGetAllContactsVES',vesModule.getAllContactsVES);
router.get('/ewmGetDepartmentVES',vesModule.getDepartmentVES);
router.get('/ewtGetContactVES',vesModule.getContactVES);
router.get('/ewtSearchContactsVES',vesModule.searchContactsVES);
router.get('/ewtCheckPasswordVES',vesModule.checkPasswordVES);
router.get('/ewtGetGatesVES',vesModule.getGatesVES);
router.post('/ewtSaveDepartmentsVES',vesModule.saveDepartmentsVES);
router.post('/ewtSaveGatesVES',vesModule.saveGatesVES);
router.post('/ewtSaveCitysVES',vesModule.saveCitysVES);

//hris-master-module
var HrisMaster = require('./modules/hris-master-module.js');
var hrisMasterModule = new HrisMaster(db,stdLib);
router.get('/hris_masters',hrisMasterModule.hrisMasters);
router.post('/hris_salary_head',hrisMasterModule.hrisSaveSalaryHeader);
router.get('/hris_salary_head',hrisMasterModule.hrisGetSalaryHead);
router.get('/hris_doc_type',hrisMasterModule.hrisGetDocType);
router.get('/hris_leave_type',hrisMasterModule.hrisGetLeaveType);
router.post('/hris_doc_type',hrisMasterModule.hrisSaveDocType);
router.post('/hris_leave_type',hrisMasterModule.hrisSaveLeaveType);
router.get('/hris_salary_tpl',hrisMasterModule.hrisGetSalaryTemp);
router.get('/hris_salary_tpl/:id',hrisMasterModule.hrisGetSalaryTempDetails);
router.post('/hris_salary_tpl',hrisMasterModule.hrisSaveSalaryTpl);
router.delete('/hris_salary_head/:id',hrisMasterModule.hrisDelSalaryHead);
router.delete('/hris_leave_type/:id',hrisMasterModule.hrisDelLeaveType);
router.delete('/hris_doc_type/:id',hrisMasterModule.hrisDelDocType);
router.delete('/hris_salary_tpl/:id',hrisMasterModule.hrisDelSalaryTpl);


//hris-hrm-module
var HrisHRM = require('./modules/hris-hrm-module.js');
var hrisHRMModule = new HrisHRM(db,stdLib);
router.post('/hris_hrm',hrisHRMModule.hrisSaveHRM);
router.get('/hris_hrm',hrisHRMModule.hrisGetHRM);
router.post('/hris_hrm_contact_dtl',hrisHRMModule.hrisSaveHRMContactDtl);
router.get('/hris_hrm_contact_dtl',hrisHRMModule.hrisGetHRMContactDtl);
router.post('/hris_hrm_compensation',hrisHRMModule.hrisSaveHRMCompnstn);
router.get('/hris_hrm_compensation_dtl',hrisHRMModule.hrisGetHRMCompnstnDtl);
router.get('/hris_hrm_compensation',hrisHRMModule.hrisGetHRMCompnstn);
router.post('/hris_hrm_img',hrisHRMModule.hrisSaveHRMimg);
router.post('/hris_hrm_leave_regi',hrisHRMModule.hrisSaveHRMLeaveRegi);
router.post('/hris_hrm_leave_appli',hrisHRMModule.hrisSaveHRMLeaveAppli);
router.get('/hris_hrm_leave_regi',hrisHRMModule.hrisGetHRMLeaveRegi);
router.get('/hris_hrm_leave_appli',hrisHRMModule.hrisGetHRMLeaveAppli);
router.get('/hris_hrm_emp_list',hrisHRMModule.hrisGetHRMEmpList);
router.post('/hris_hrm_doc',hrisHRMModule.hrisSaveHRMDoc);
router.get('/hris_hrm_doc',hrisHRMModule.hrisGetHRMDoc);
router.delete('/hris_hrm_compensation/:cid',hrisHRMModule.hrisDelHRMCompnstn);

//procurement-module
var Procurement = require('./modules/procurement-module.js');
var procurementModule = new Procurement(db,stdLib);
router.post('/procurement_submit_enquiry',procurementModule.procurementSubmitEnquiry);
router.post('/procurement_save_vendors',procurementModule.procurementSaveVendors);
router.get('/procurement_get_vendor',procurementModule.procurementGetVendors);
router.delete('/procurement_del_vendor/:id',procurementModule.procurementDelVendor);
router.get('/procurement_get_attachment',procurementModule.procurementGetEnqAttchment);
router.delete('/procurement_del_enq_attachment/:id',procurementModule.procurementDelEnqAttachment);
router.get('/procurement_purchase_trans_details',procurementModule.procurementGetPurchaseTransDetails);
router.get('/procurement_get_purchase_trans',procurementModule.procurementGetPurchaseTrans);
router.post('/procurement_save_potemplate',procurementModule.procurementSavePoTemplate);
router.delete('/procurement_del_potemplate/:id',procurementModule.procurementDelPoTemplate);
router.get('/procurement_get_potemplate',procurementModule.procurementGetPoTemplate);
router.post('/procurement_po_details',procurementModule.procurementSavePoDetails);
router.put('/procurement_proposal_details',procurementModule.procurementUpdateProposalDetails);
router.get('/procurement_proposal_details',procurementModule.procurementGetProposalDetails);
router.get('/procurement_vd_eze_details',procurementModule.procurementGetVdEzeDetails);
router.get('/procurement_trans_details',procurementModule.procurementLoadTransDetails);
router.get('/procurement_vendor_details',procurementModule.procurementGetVendorDetails);
router.get('/procurement_po_details',procurementModule.procurementGetPoDetails);
router.post('/procurement_send_mail',procurementModule.sendPoMail);
router.get('/proc_all_enq',procurementModule.procurementGetAllEnq);
router.get('/proc_enq_details',procurementModule.procurementGetEnqDetails);
router.post('/proc_test_api',procurementModule.testPdf);
//router.post('/proc_test_register',procurementModule.testRegister);

//profile-branch-module
var ProfileBranch = require('./modules/profile-branch-module.js');
var ProfileBranchModule = new ProfileBranch(db,stdLib);
router.post('/branch',ProfileBranchModule.saveBranch);
router.delete('/branch/:id',ProfileBranchModule.deleteBranch);
router.get('/branch',ProfileBranchModule.getBranch);

//ezeone-attribute-module
var EzeoneAttrbt = require('./modules/ezeone-attribute-module.js');
var EzeoneAttrbtModule = new EzeoneAttrbt(db,stdLib);
router.get('/signup_data',EzeoneAttrbtModule.signUpData);
router.get('/version_code',EzeoneAttrbtModule.versionCode);

//association-ap-module
var Association = require('./modules/association-module.js');
var AssociationtModule = new Association(db,stdLib);
router.get('/association_details',AssociationtModule.associGetEventDtl);
router.post('/association_comments',AssociationtModule.associSaveComments);
router.get('/asscociation_service',AssociationtModule.getAsscociationServices);
router.post('/association_service',AssociationtModule.saveAssociationServices);
router.put('/association_service',AssociationtModule.updateAssociationServices);
router.get('/association_service_img',AssociationtModule.associationGetServiceImg);
router.post('/image_with_thumbnail',AssociationtModule.imageUploadWithThumbnail);
router.get('/association_ten_details',AssociationtModule.associationGetEventInfo);
router.post('/association_ten_details',AssociationtModule.saveAssociationTenMaster);
router.put('/association_like',AssociationtModule.associationUpdateLiks);
router.post('/association_opinion_poll',AssociationtModule.saveAssociationOpinionPoll);
router.delete('/association_ten_img/:id',AssociationtModule.associationDeleteTenImg);
router.delete('/association_service_img/:id',AssociationtModule.associationDeleteServiceImg);
router.put('/association_ten_status',AssociationtModule.associationUpdateTenStatus);
router.get('/association_op_option',AssociationtModule.associationGetOPoptions);

//test-module
//var Test = require('./modules/test-module.js');
//var TestModule = new Test(db,stdLib);
//router.get('/_test',TestModule.createThumnail);


/**
 * Default error handler
 * Add every API call above this
 */


router.all('*',function(req,res,next){
    res.status(404).json({ status : false, error : { api : 'API'}, message : 'Not found'});
});

module.exports = router;
