/**
 * Created by Jana1 on 01-10-2017.
 */

var eventCtrl = {};
var error = {};

eventCtrl.saveEvent = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!req.body.eventTitle)
    {
        error.eventTitle = 'Invalid eventTitle';
        validationFlag *= false;
    }
    var sponsors =req.body.sponsors;
    if(typeof(sponsors) == "string") {
        sponsors = JSON.parse(sponsors);
    }
    if(!sponsors){
        sponsors = [];
    }

    var sessions =req.body.sessions;
    if(typeof(sessions) == "string") {
        sessions = JSON.parse(sessions);
    }
    if(!sessions){
        sessions = [];
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.body.eventId = (req.body.eventId) ? req.body.eventId : 0;
                req.body.numberOfDays = (req.body.numberOfDays) ? req.body.numberOfDays : 1;
                req.body.aboutEvent = (req.body.aboutEvent) ? req.body.aboutEvent : '';
                req.body.startDateTime = (req.body.startDateTime) ? req.body.startDateTime : null;
                req.body.endDateTime = (req.body.endDateTime) ? req.body.endDateTime : null;
                req.body.address = (req.body.address) ? req.body.address : '';
                req.body.latitude = (req.body.latitude) ? req.body.latitude : 0;
                req.body.longitude = (req.body.longitude) ? req.body.longitude : 0;
                req.body.proximity = (req.body.proximity) ? req.body.proximity : 0;
                req.body.eventBanner = (req.body.eventBanner) ? req.body.eventBanner : '';
                req.body.sponsorshipEmailId = (req.body.sponsorshipEmailId) ? req.body.sponsorshipEmailId : '';
                req.body.enquiryEmailId = (req.body.enquiryEmailId) ? req.body.enquiryEmailId : '';
                req.body.status = (req.body.status) ? req.body.status : 1;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.eventId),
                    req.st.db.escape(req.body.eventTitle),
                    req.st.db.escape(req.body.numberOfDays),
                    req.st.db.escape(req.body.aboutEvent),
                    req.st.db.escape(req.body.startDateTime),
                    req.st.db.escape(req.body.endDateTime),
                    req.st.db.escape(req.body.address),
                    req.st.db.escape(req.body.latitude),
                    req.st.db.escape(req.body.longitude),
                    req.st.db.escape(req.body.proximity),
                    req.st.db.escape(req.body.eventBanner),
                    req.st.db.escape(req.body.sponsorshipEmailId),
                    req.st.db.escape(req.body.enquiryEmailId),
                    req.st.db.escape(JSON.stringify(sponsors)),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(JSON.stringify(sessions))
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_save_event( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,eventResult){
                    if(!err && eventResult && eventResult[0] && eventResult[0][0] && eventResult[0][0].eventId ){
                        response.status = true;
                        response.message = "Event saved successfully";
                        response.error = null;
                        response.data ={
                            eventId : eventResult[0][0].eventId
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving event";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

eventCtrl.saveEventVenue = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!req.body.venue)
    {
        error.venue = 'Invalid venue';
        validationFlag *= false;
    }
    if (!req.body.eventId)
    {
        error.eventId = 'Invalid eventId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.body.venueId = (req.body.venueId) ? req.body.venueId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.eventId),
                    req.st.db.escape(req.body.venueId),
                    req.st.db.escape(req.body.venue)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_save_event_venue( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,eventResult){
                    if(!err && eventResult && eventResult[0] && eventResult[0][0] && eventResult[0][0].venueId ){
                        response.status = true;
                        response.message = "Venue saved successfully";
                        response.error = null;
                        response.data ={
                            venueId : eventResult[0][0].venueId
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving venue";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

eventCtrl.getEventVenue = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!req.query.eventId)
    {
        error.eventId = 'Invalid eventId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.eventId)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_get_event_venue( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,eventVenueResult){
                    if(!err && eventVenueResult && eventVenueResult[0] && eventVenueResult[0][0]){
                        response.status = true;
                        response.message = "Venue list loaded successfully";
                        response.error = null;
                        response.data ={
                            venueList : eventVenueResult[0]
                        };
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "Venue list loaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting venue list";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

/*
Below api is used to save speakers , moderator , Event coordinator based on type
 */
eventCtrl.saveEventUser = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!req.body.eventId)
    {
        error.eventId = 'Invalid eventId';
        validationFlag *= false;
    }
    if (!req.body.userMasterId)
    {
        error.userMasterId = 'Invalid userMasterId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.eventId),
                    req.st.db.escape(req.body.userMasterId),
                    req.st.db.escape(req.body.type)
                ];
                /**
                 * Calling procedure to save event speakers
                 * @type {string}
                 */
                var procQuery = 'CALL wm_save_event_users( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,speakerResult){
                    if(!err && speakerResult && speakerResult[0] && speakerResult[0][0] && speakerResult[0][0].eventUserId ){
                        response.status = true;
                        response.message = "User saved successfully";
                        response.error = null;
                        response.data ={
                            eventUserId : speakerResult[0][0].eventUserId
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving users";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

/*
 Below api is used to get speakers , moderator , Event coordinator based on type
 */
eventCtrl.getEventUser = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!req.query.eventId)
    {
        error.eventId = 'Invalid eventId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.query.type = req.query.type ? req.query.type : 1;
                req.query.sessionId = req.query.sessionId ? req.query.sessionId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.eventId),
                    req.st.db.escape(req.query.type),
                    req.st.db.escape(req.query.sessionId)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_get_event_users( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,eventSpeakerResult){
                    if(!err && eventSpeakerResult && eventSpeakerResult[0] && eventSpeakerResult[0][0]){
                        response.status = true;
                        response.message = "Users list loaded successfully";
                        response.error = null;
                        response.data ={
                            userList : eventSpeakerResult[0]
                        };
                        res.status(200).json(response);
                    }
                    else if (!err){
                        response.status = true;
                        response.message = "Users list loaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting user list";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};


eventCtrl.deleteEventUser = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!req.body.eventId)
    {
        error.eventId = 'Invalid eventId';
        validationFlag *= false;
    }

    if (!req.body.eventUserId)
    {
        error.eventUserId = 'Invalid eventUserId';
        validationFlag *= false;
    }
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.body.type = req.body.type ? req.body.type : 1;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.eventId),
                    req.st.db.escape(req.body.eventUserId),
                    req.st.db.escape(req.body.type)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_delete_event_user( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,eventSpeakerResult){
                    if(!err){
                        response.status = true;
                        response.message = "Users deleted successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting user list";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

eventCtrl.saveEventSponsorCategories = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!req.body.title)
    {
        error.title = 'Invalid title';
        validationFlag *= false;
    }
    if (!req.body.eventId)
    {
        error.eventId = 'Invalid eventId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.body.categoryId = (req.body.categoryId) ? req.body.categoryId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.eventId),
                    req.st.db.escape(req.body.categoryId),
                    req.st.db.escape(req.body.title)
                ];
                /**
                 * Calling procedure to save event speakers
                 * @type {string}
                 */
                var procQuery = 'CALL wm_save_event_sponsorCategories( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,sponsorCategoryResult){
                    if(!err && sponsorCategoryResult && sponsorCategoryResult[0] && sponsorCategoryResult[0][0] && sponsorCategoryResult[0][0].categoryId ){
                        response.status = true;
                        response.message = "Category saved successfully";
                        response.error = null;
                        response.data ={
                            categoryId : sponsorCategoryResult[0][0].categoryId
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving category";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

eventCtrl.getEventSponsorCategories = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!req.query.eventId)
    {
        error.eventId = 'Invalid eventId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.eventId)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_get_event_sponsorCategories( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,categoryResult){
                    if(!err && categoryResult && categoryResult[0] && categoryResult[0][0]){
                        response.status = true;
                        response.message = "categories loaded successfully";
                        response.error = null;
                        response.data ={
                            categoryList : categoryResult[0]
                        };
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "categories loaded successfully";
                        response.error = null;
                        response.data =null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting categories";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

eventCtrl.saveEventSponsors = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!req.body.sponsorName)
    {
        error.sponsorName = 'Invalid sponsorName';
        validationFlag *= false;
    }
    if (!req.body.eventId)
    {
        error.eventId = 'Invalid eventId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.body.sponsorId = (req.body.sponsorId) ? req.body.sponsorId : 0;
                req.body.webSite = (req.body.webSite) ? req.body.webSite : "";

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.eventId),
                    req.st.db.escape(req.body.sponsorId),
                    req.st.db.escape(req.body.sponsorName),
                    req.st.db.escape(req.body.categoryId),
                    req.st.db.escape(req.body.banner),
                    req.st.db.escape(req.body.sequence),
                    req.st.db.escape(req.body.webSite)
                ];
                /**
                 * Calling procedure to save event speakers
                 * @type {string}
                 */
                var procQuery = 'CALL wm_save_event_sponsors( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,sponsorResult){
                    if(!err && sponsorResult && sponsorResult[0] && sponsorResult[0][0] && sponsorResult[0][0].sponsorId ){
                        response.status = true;
                        response.message = "Sponsors saved successfully";
                        response.error = null;
                        response.data ={
                            sponsorId : sponsorResult[0][0].sponsorId
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving sponsors";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

eventCtrl.getEventSponsors = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!req.query.eventId)
    {
        error.eventId = 'Invalid eventId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.eventId)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_get_event_sponsors( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,eventSponsorResult){
                    if(!err && eventSponsorResult && eventSponsorResult[0] && eventSponsorResult[0][0]){
                        response.status = true;
                        response.message = "Sponsor list loaded successfully";
                        response.error = null;
                        response.data ={
                            sponsorList : eventSponsorResult[0]
                        };
                        res.status(200).json(response);
                    }
                    else if (!err){
                        response.status = true;
                        response.message = "Sponsor list loaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting sponsor list";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

eventCtrl.saveBasicEventInfo = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!req.body.eventTitle)
    {
        error.eventTitle = 'Invalid eventTitle';
        validationFlag *= false;
    }

    if (!req.body.startDateTime)
    {
        error.startDateTime = 'Invalid startDateTime';
        validationFlag *= false;
    }

    if (!req.body.endDateTime)
    {
        error.endDateTime = 'Invalid endDateTime';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.body.eventId = (req.body.eventId) ? req.body.eventId : 0;
                req.body.aboutEvent = (req.body.aboutEvent) ? req.body.aboutEvent : '';
                req.body.selfCheckInCode = (req.body.selfCheckInCode) ? req.body.selfCheckInCode : '';

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.eventId),
                    req.st.db.escape(req.body.eventTitle),
                    req.st.db.escape(req.body.aboutEvent),
                    req.st.db.escape(req.body.startDateTime),
                    req.st.db.escape(req.body.endDateTime),
                    req.st.db.escape(req.body.selfCheckInCode)
                ];

                /**
                 * Calling procedure to save basic event info
                 * @type {string}
                 */
                var procQuery = 'CALL wm_save_event_basic( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,eventResult){
                    if(!err && eventResult && eventResult[0] && eventResult[0][0] && eventResult[0][0].eventId ){
                        response.status = true;
                        response.message = "Event saved successfully";
                        response.error = null;
                        response.data ={
                            eventId : eventResult[0][0].eventId
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving event";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

eventCtrl.saveAdvanceEventInfo = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!req.body.eventId)
    {
        error.eventId = 'Invalid eventId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.body.address = (req.body.address) ? req.body.address : '';
                req.body.latitude = (req.body.latitude) ? req.body.latitude : 0;
                req.body.longitude = (req.body.longitude) ? req.body.longitude : 0;
                req.body.proximity = (req.body.proximity) ? req.body.proximity : 0;
                req.body.eventBanner = (req.body.eventBanner) ? req.body.eventBanner : '';
                req.body.sponsorshipEmailId = (req.body.sponsorshipEmailId) ? req.body.sponsorshipEmailId : '';
                req.body.enquiryEmailId = (req.body.enquiryEmailId) ? req.body.enquiryEmailId : '';
                req.body.canPublishToLinkedIn = (req.body.canPublishToLinkedIn) ? req.body.canPublishToLinkedIn : 0;
                req.body.LinkedInTitle = (req.body.LinkedInTitle) ? req.body.LinkedInTitle : "";
                req.body.LinkedInDescription = (req.body.LinkedInDescription) ? req.body.LinkedInDescription : "";
                req.body.LinkedInBanner = (req.body.LinkedInBanner) ? req.body.LinkedInBanner : "";
                req.body.eventType = (req.body.eventType) ? req.body.eventType : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.eventId),
                    req.st.db.escape(req.body.address),
                    req.st.db.escape(req.body.latitude),
                    req.st.db.escape(req.body.longitude),
                    req.st.db.escape(req.body.proximity),
                    req.st.db.escape(req.body.eventBanner),
                    req.st.db.escape(req.body.sponsorshipEmailId),
                    req.st.db.escape(req.body.enquiryEmailId),
                    req.st.db.escape(req.body.canPublishToLinkedIn),
                    req.st.db.escape(req.body.LinkedInTitle),
                    req.st.db.escape(req.body.LinkedInDescription),
                    req.st.db.escape(req.body.LinkedInBanner),
                    req.st.db.escape(req.body.eventType)
                ];
                /**
                 * Calling procedure to save advance event info
                 * @type {string}
                 */
                var procQuery = 'CALL wm_save_event_AdvanceInfo( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,eventResult){
                    if(!err && eventResult && eventResult[0] && eventResult[0][0] && eventResult[0][0].eventId ){
                        response.status = true;
                        response.message = "Event details saved successfully";
                        response.error = null;
                        response.data ={
                            eventId : eventResult[0][0].eventId
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving event details";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

eventCtrl.saveEventAgenda = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!req.body.eventId)
    {
        error.eventId = 'Invalid eventId';
        validationFlag *= false;
    }

    var speakers =req.body.speakers;
    if(typeof(speakers) == "string") {
        speakers = JSON.parse(speakers);
    }
    if(!speakers){
        speakers = [];
    }
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.body.sessionId = (req.body.sessionId) ? req.body.sessionId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.eventId),
                    req.st.db.escape(req.body.sessionId),
                    req.st.db.escape(req.body.sessionDate),
                    req.st.db.escape(req.body.duration),
                    req.st.db.escape(req.body.venue),
                    req.st.db.escape(req.body.title),
                    req.st.db.escape(req.body.description),
                    req.st.db.escape(req.body.moderatorId),
                    req.st.db.escape(JSON.stringify(speakers))
                ];
                /**
                 * Calling procedure to save advance event info
                 * @type {string}
                 */
                var procQuery = 'CALL wm_save_event_session( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,sessionResult){
                    if(!err && sessionResult && sessionResult[0] && sessionResult[0][0] && sessionResult[0][0].sessionId ){
                        response.status = true;
                        response.message = "Event agenda saved successfully";
                        response.error = null;
                        response.data ={
                            sessionId : sessionResult[0][0].sessionId
                        };
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "Event agenda saved successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving event agenda";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

eventCtrl.deleteEventAgenda = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!req.query.eventId)
    {
        error.eventId = 'Invalid eventId';
        validationFlag *= false;
    }
    if (!req.query.sessionId)
    {
        error.sessionId = 'Invalid sessionId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.eventId),
                    req.st.db.escape(req.query.sessionId)
                ];
                /**
                 * Calling procedure to save advance event info
                 * @type {string}
                 */
                var procQuery = 'CALL wm_delete_event_session( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,sessionResult){
                    if(!err){
                        response.status = true;
                        response.message = "Event agenda deleted successfully";
                        response.error = null;
                        response.data =null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting event agenda";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

eventCtrl.getEvents = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }


    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo):1;
                req.query.limit = (req.query.limit) ? (req.query.limit):100;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.pageNo),
                    req.st.db.escape(req.query.limit)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_get_events( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,eventResult){
                    if(!err && eventResult && eventResult[0] && eventResult[0][0]){
                        response.status = true;
                        response.message = "Event list loaded successfully";
                        response.error = null;
                        response.data ={
                            events : eventResult[0]
                        };
                        res.status(200).json(response);
                    }
                    else if (!err){
                        response.status = true;
                        response.message = "No events found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting event list";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

eventCtrl.getEventDetails = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }
    if (!req.query.eventId)
    {
        error.eventId = 'Invalid eventId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.eventId)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_get_event_details( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,eventResult){
                    if(!err && eventResult && eventResult[0] && eventResult[0][0]){
                        response.status = true;
                        response.message = "Event data loaded successfully";
                        response.error = null;
                        response.data ={
                            eventId : eventResult[0][0].eventId,
                            aboutEvent : eventResult[0][0].aboutEvent,
                            address : eventResult[0][0].address,
                            endDateTime : eventResult[0][0].endDateTime,
                            enquiryEmailId : eventResult[0][0].enquiryEmailId,
                            eventBanner : eventResult[0][0].eventBanner,
                            eventTitle : eventResult[0][0].eventTitle,
                            latitude : eventResult[0][0].latitude,
                            longitude : eventResult[0][0].longitude,
                            proximity : eventResult[0][0].proximity,
                            sponsorshipEmailId : eventResult[0][0].sponsorshipEmailId,
                            startDateTime : eventResult[0][0].startDateTime,
                            sponsors : eventResult[0][0].sponsors,
                            eventAdmin : eventResult[0][0].eventAdmin,
                            canPublishToLinkedIn : eventResult[0][0].canPublishToLinkedIn,
                            LinkedInTitle : eventResult[0][0].LinkedInTitle,
                            LinkedInDescription : eventResult[0][0].LinkedInDescription,
                            LinkedInBanner : eventResult[0][0].LinkedInBanner,
                            selfCheckInCode : eventResult[0][0].selfCheckInCode,
                            eventType : eventResult[0][0].eventType
                        };
                        res.status(200).json(response);
                    }
                    else if (!err){
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting event data";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

eventCtrl.getEventAgendaList = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }
    if (!req.query.eventId)
    {
        error.eventId = 'Invalid eventId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.eventId)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_get_event_sessions( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,eventResult){
                    if(!err && eventResult && eventResult[0] && eventResult[0][0]){
                        response.status = true;
                        response.message = "Agenda data loaded successfully";
                        response.error = null;
                        response.data ={
                            agendaList : eventResult[0]
                        };
                        res.status(200).json(response);
                    }
                    else if (!err){
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting agenda data";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

eventCtrl.deleteSponsor = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!req.query.eventId)
    {
        error.eventId = 'Invalid eventId';
        validationFlag *= false;
    }
    if (!req.query.sponsorId)
    {
        error.sponsorId = 'Invalid sponsorId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.eventId),
                    req.st.db.escape(req.query.sponsorId)
                ];
                /**
                 * Calling procedure to save advance event info
                 * @type {string}
                 */
                var procQuery = 'CALL wm_delete_sponsor( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,sponsorResult){
                    if(!err){
                        response.status = true;
                        response.message = "Sponsor deleted successfully";
                        response.error = null;
                        response.data =null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting sponsor";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

eventCtrl.deleteSponsorCategory = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!req.query.eventId)
    {
        error.eventId = 'Invalid eventId';
        validationFlag *= false;
    }
    if (!req.query.categoryId)
    {
        error.categoryId = 'Invalid categoryId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.eventId),
                    req.st.db.escape(req.query.categoryId)
                ];
                /**
                 * Calling procedure to save advance event info
                 * @type {string}
                 */
                var procQuery = 'CALL wm_delete_sponsorCategory( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,sponsorResult){
                    if(!err && sponsorResult && sponsorResult[0] && sponsorResult[0][0] && sponsorResult[0][0].error ){
                        response.status = false;
                        response.message = "Category is in use";
                        response.error = null;
                        response.data =null;
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "Category deleted";
                        response.error = null;
                        response.data =null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting category";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

eventCtrl.deleteVenue = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!req.query.eventId)
    {
        error.eventId = 'Invalid eventId';
        validationFlag *= false;
    }
    if (!req.query.venueId)
    {
        error.venueId = 'Invalid venueId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.eventId),
                    req.st.db.escape(req.query.venueId)
                ];
                /**
                 * Calling procedure to save advance event info
                 * @type {string}
                 */
                var procQuery = 'CALL wm_delete_event_venue( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,venueResult){
                    if(!err && venueResult && venueResult[0] && venueResult[0][0] && venueResult[0][0].error ){
                        response.status = false;
                        response.message = "Stage is in use";
                        response.error = null;
                        response.data =null;
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "Stage deleted";
                        response.error = null;
                        response.data =null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting stage";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

module.exports = eventCtrl;