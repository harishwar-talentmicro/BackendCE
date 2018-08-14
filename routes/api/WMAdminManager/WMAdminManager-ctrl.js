/**
 * Created by vedha on 27-09-2017.
 */

var CONFIG = require('../../../ezeone-config.json');
var DBSecretKey=CONFIG.DB.secretKey;


var moment = require('moment');
var wmAdminManagerCtrl = {};

/*
* New whatmate company creation and edit company,event apis
* */
wmAdminManagerCtrl.saveWhatMate = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};

    if (!req.body.masterId) {
        error.masterId = 'Invalid masterId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            req.body.WMId = req.body.WMId ? req.body.WMId : 0;
            req.body.type = req.body.type ? req.body.type : 1;
            req.body.eventId = req.body.eventId ? req.body.eventId : 0;
            req.body.tileStyle = req.body.tileStyle ? req.body.tileStyle : 0;
            req.body.hideSearchPage = req.body.hideSearchPage ? req.body.hideSearchPage : 0;
            req.body.hideChatPage = req.body.hideChatPage ? req.body.hideChatPage : 0;
            req.body.hideProfilePage = req.body.hideProfilePage ? req.body.hideProfilePage : 0;
            req.body.isTopScroll = req.body.isTopScroll ? req.body.isTopScroll : 0;
            req.body.isChatBotHide = req.body.isChatBotHide ? req.body.isChatBotHide : 0;
            req.body.isFormGroupHide = req.body.isFormGroupHide ? req.body.isFormGroupHide : 0;

            
            var procParams = [
                req.st.db.escape(req.body.WMId),
                req.st.db.escape(req.body.masterId),
                req.st.db.escape(req.body.title || ''),
                req.st.db.escape(req.body.type || 0),
                req.st.db.escape(req.body.sequence || 0),
                req.st.db.escape(req.body.latitude || 0.0),
                req.st.db.escape(req.body.longitude || 0.0),
                req.st.db.escape(req.body.proximity || 0),
                req.st.db.escape(req.body.homePageBanner || ''),
                req.st.db.escape(req.body.status || 0),
                req.st.db.escape(req.body.landingPage || 0),
                req.st.db.escape(req.body.about || ''),
                req.st.db.escape(req.body.keywords || ''),
                req.st.db.escape(req.body.topBannerId || 0),
                req.st.db.escape(req.body.address || ''),
                req.st.db.escape(req.body.tileStyle || 0),
                req.st.db.escape(req.body.isHideSearchPage || 0),
                req.st.db.escape(req.body.hideChatPage || 0),
                req.st.db.escape(req.body.hideProfilePage || 0),
                req.st.db.escape(req.body.isTopScroll || 0),
                req.st.db.escape(req.body.isChatBotHide || 0),
                req.st.db.escape(req.body.isFormGroupHide || 0),
                req.st.db.escape(req.body.brandingPage || ''),
                req.st.db.escape(req.body.isHideTransactionPage || 0),
                req.st.db.escape(req.body.enableHomePageScroll || 0),
                req.st.db.escape(req.body.showFormsOnHomePage || 0),
                req.st.db.escape(req.body.homePageTutorialBanner || ''),
                req.st.db.escape(req.body.isHideDashboard || 0)
              
            ];

            var procQuery = 'CALL wm_save_whatmateList( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,WMResult){
                if(!err && WMResult){
                    response.status = true;
                    response.message = "WhatMate details saved successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while saving WhatMate details";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

wmAdminManagerCtrl.getWhatMateList = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};


    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            req.query.keywords = (req.query.keywords) ? (req.query.keywords) : "";
            req.query.limit = (req.query.limit) ? (req.query.limit) : 10;
            req.query.startPage = (req.query.startPage) ? (req.query.startPage) : 1;
            var startPage = 0;

            startPage = ((((parseInt(req.query.startPage)) * req.query.limit) + 1) - req.query.limit) - 1;

            var procParams = [
                req.st.db.escape(req.query.keywords),
                req.st.db.escape(startPage),
                req.st.db.escape(req.query.limit)
            ];

            var procQuery = 'CALL wm_get_whatmateList( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,WMResult){
                if(!err && WMResult){
                    response.status = true;
                    response.message = "WhatMate details loaded successfully";
                    response.error = null;
                    response.data = {
                        WhatMateList : WMResult[0],
                        count : WMResult[1][0].count
                    };
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while loading WhatMate details";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

wmAdminManagerCtrl.getWhatMateDetails = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};
    if (!req.query.WMId) {
        error.WMId = 'Invalid WMId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            var procParams = [
                req.st.db.escape(req.query.WMId)
            ];

            var procQuery = 'CALL wm_get_whatmat_details( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,whatMateResult){
                if(!err && whatMateResult && whatMateResult[0] ){
                    response.status = true;
                    response.message = "WhatMate details loaded successfully";
                    response.error = null;
                    response.data = {
                        WMId : whatMateResult[0][0].id,
                        masterId : whatMateResult[0][0].masterId,
                        ezeoneId : whatMateResult[0][0].ezeoneId,
                        title : whatMateResult[0][0].title,
                        type : whatMateResult[0][0].type,
                        sequence : whatMateResult[0][0].sequence,
                        latitude : whatMateResult[0][0].latitude,
                        longitude : whatMateResult[0][0].longitude,
                        proximity : whatMateResult[0][0].proximity,
                        homePageBanner : whatMateResult[0][0].HPBanner ? (req.CONFIG.CONSTANT.GS_URL +
                            req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + whatMateResult[0][0].HPBanner) : "",
                        status : whatMateResult[0][0].status,
                        landingPage : whatMateResult[0][0].landingPage,
                        about : whatMateResult[0][0].aboutCompany,
                        keywords : whatMateResult[0][0].keywords,
                        topBannerId : whatMateResult[0][0].topBannerId,
                        address : whatMateResult[0][0].address,
                        tileStyle : whatMateResult[0][0].tileStyle,

                        hideChatPage : whatMateResult[0][0].hideChatPage,
                        hideProfilePage : whatMateResult[0][0].hideProfilePage,
                        brandingPage : whatMateResult[0][0].brandingPage,
                        isTopScroll : whatMateResult[0][0].isTopScroll, 
                        isChatBotHide : whatMateResult[0][0].isChatBotHide,
                        isFormGroupHide : whatMateResult[0][0].isFormGroupHide,
                        isHideTransactionPage : whatMateResult[0][0].isHideTransactionPage,
                        enableHomePageScroll : whatMateResult[0][0].enableHomePageScroll,
                        showFormsOnHomePage : whatMateResult[0][0].showFormsOnHomePage,
                        homePageTutorialBanner : whatMateResult[0][0].homePageTutorialBanner,
                        isHideDashboard : whatMateResult[0][0].isHideDashboard,
                        isHideSearchPage : whatMateResult[0][0].isHideSearchPage,
                        isHideDashboard : whatMateResult[0][0].isHideDashboard

                    };
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while loading whatmate details";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

wmAdminManagerCtrl.checkWhatMateCompany = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};

    if (!req.query.whatmateId) {
        error.whatmateId = 'Invalid whatmateId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {

            var procParams = [
                req.st.db.escape(req.query.whatmateId),
                req.st.db.escape(DBSecretKey)
            ];

            var procQuery = 'CALL wm_check_whatmateId( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,WMResult){
                if(!err && WMResult && WMResult[0] && WMResult[0][0] && WMResult[0][0].message){
                    switch (WMResult[0][0].message) {
                        case 'INVALID_ID' :
                            response.status = false;
                            response.message = "WhatMate id not found";
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
                            break ;
                        case 'WM_EXISTS' :
                            response.status = false;
                            response.message = "WhatMate company exists .";
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
                            break ;
                    }

                }
                else if(!err && WMResult && WMResult[0] && WMResult[0][0]){
                    response.status = true;
                    response.message = "WhatMate id details loaded";
                    response.error = null;
                    response.data = {
                        masterId : WMResult[0][0].masterId,
                        displayName : WMResult[0][0].displayName,
                        about : WMResult[0][0].about,
                        Keywords : WMResult[0][0].Keywords
                    };
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while loading WhatMate id details";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

/*
* Top banner apis
* */
wmAdminManagerCtrl.saveWhatMateHomeBanners = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};

    if (!req.body.title) {
        error.title = 'Invalid title';
        validationFlag *= false;
    }
    if (!req.body.banner) {
        error.banner = 'Invalid banner';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            req.body.id = req.body.id ? req.body.id :0 ;
            req.body.latitude = req.body.latitude ? req.body.latitude :0 ;
            req.body.longitude = req.body.longitude ? req.body.longitude :0 ;
            req.body.proximity = req.body.proximity ? req.body.proximity :9999 ;
            req.body.status = req.body.status ? req.body.status :1 ;
            req.body.sequence = req.body.sequence ? req.body.sequence :999 ;
            req.body.address = req.body.address ? req.body.address :"" ;

            var procParams = [
                req.st.db.escape(req.body.id),
                req.st.db.escape(req.body.title),
                req.st.db.escape(req.body.latitude),
                req.st.db.escape(req.body.longitude),
                req.st.db.escape(req.body.proximity),
                req.st.db.escape(req.body.status),
                req.st.db.escape(req.body.sequence),
                req.st.db.escape(req.body.address),
                req.st.db.escape(req.body.banner)
            ];

            var procQuery = 'CALL wm_save_homebanners( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,WMResult){
                if(!err){
                    response.status = true;
                    response.message = "WhatMate home banner saved successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while saving WhatMate home banner";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

wmAdminManagerCtrl.getWhatMateHomeBannersList = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};


    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            var procQuery = 'CALL wm_get_homebanners()';
            console.log(procQuery);
            req.db.query(procQuery,function(err,homeBanners){
                if(!err && homeBanners && homeBanners[0] ){
                    response.status = true;
                    response.message = "Home banners loaded successfully";
                    response.error = null;
                    response.data = {
                        homeBanners : homeBanners[0]
                    };
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while loading home banners";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

wmAdminManagerCtrl.getWhatMateHomeBannerDetails = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};
    if (!req.query.bannerId) {
        error.bannerId = 'Invalid bannerId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            var procParams = [
                req.st.db.escape(req.query.bannerId)
            ];

            var procQuery = 'CALL wm_get_homebanner_details( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,homeBanners){
                if(!err && homeBanners && homeBanners[0] ){
                    response.status = true;
                    response.message = "Home banners loaded successfully";
                    response.error = null;
                    response.data = {
                        bannerId : homeBanners[0][0].bannerId,
                        title : homeBanners[0][0].title,
                        latitude : homeBanners[0][0].latitude,
                        longitude : homeBanners[0][0].longitude,
                        proximity : homeBanners[0][0].proximity,
                        status : homeBanners[0][0].status,
                        sequence : homeBanners[0][0].sequence,
                        address : homeBanners[0][0].address,
                        banner : homeBanners[0][0].banner ? (req.CONFIG.CONSTANT.GS_URL +
                        req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + homeBanners[0][0].banner) : ""
                    };
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while loading home banners";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

/**
* Vault data types (tag types)
* */

wmAdminManagerCtrl.getVaultDataTypes = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};


    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {

            var procQuery = 'CALL wm_get_vault_datatypes()';
            console.log(procQuery);
            req.db.query(procQuery,function(err,dataTypeResult){
                if(!err && dataTypeResult){
                    response.status = true;
                    response.message = "Data types loaded successfully";
                    response.error = null;
                    response.data = {
                        dataTypes : dataTypeResult[0]
                    };
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while loading data types";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

wmAdminManagerCtrl.saveVaultDataTypes = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};

    if (!req.body.typeId) {
        error.typeId = 'Invalid typeId';
        validationFlag *= false;
    }
    if (!req.body.typeTitle) {
        error.typeTitle = 'Invalid typeTitle';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            req.body.id = req.body.id ? req.body.id : 0;

            var procParams = [
                req.st.db.escape(req.body.id),
                req.st.db.escape(req.body.typeId),
                req.st.db.escape(req.body.typeTitle)
            ];

            var procQuery = 'CALL wm_save_vault_datatypes( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,WMResult){
                if(!err){
                    response.status = true;
                    response.message = "Vault data types saved successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while saving data types";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

/**
Vault tags
 */

wmAdminManagerCtrl.getVaultTags = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};


    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {

            var procQuery = 'CALL wm_get_vault_tags()';
            console.log(procQuery);
            req.db.query(procQuery,function(err,tagResult){
                if(!err && tagResult){
                    response.status = true;
                    response.message = "Data types loaded successfully";
                    response.error = null;
                    response.data = {
                        tags : tagResult[0]
                    };
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while loading data types";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

wmAdminManagerCtrl.saveVaultTags = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};

    if (!req.body.tag) {
        error.tag = 'Invalid tag';
        validationFlag *= false;
    }
    if (!req.body.dataTypeId) {
        error.dataTypeId = 'Invalid dataTypeId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            req.body.tagId = req.body.tagId ? req.body.tagId : 0;

            var procParams = [
                req.st.db.escape(req.body.id),
                req.st.db.escape(req.body.tag),
                req.st.db.escape(req.body.dataTypeId)
            ];

            var procQuery = 'CALL wm_save_vault_tags( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,WMResult){
                if(!err){
                    response.status = true;
                    response.message = "Vault tag saved successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while saving vault tag";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

module.exports = wmAdminManagerCtrl;