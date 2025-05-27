var gcloud = require('gcloud');
var fs = require('fs');
var uuid = require('node-uuid');
var request = require('request');

var appConfig = require('../../../../ezeone-config.json');

var gcs = gcloud.storage({
    projectId: appConfig.CONSTANT.GOOGLE_PROJECT_ID,
    keyFilename: appConfig.CONSTANT.GOOGLE_KEYFILE_PATH // Location to be changed
});

// Reference an existing bucket.
var bucket = gcs.bucket(appConfig.CONSTANT.STORAGE_BUCKET);

bucket.acl.default.add({
    entity: 'allUsers',
    role: gcs.acl.READER_ROLE
}, function (err, aclObject) {
});

/**
 * image uploading to cloud server
 * @param uniqueName
 * @param readStream
 * @param callback
 */
var uploadDocumentToCloud = function (uniqueName, readStream, callback) {
    var remoteWriteStream = bucket.file(uniqueName).createWriteStream();
    readStream.pipe(remoteWriteStream);

    remoteWriteStream.on('finish', function () {
        console.log('done');
        if (callback) {
            if (typeof (callback) == 'function') {
                callback(null);
            }
            else {
                console.log('callback is required for uploadDocumentToCloud');
            }
        }
        else {
            console.log('callback is required for uploadDocumentToCloud');
        }
    });

    remoteWriteStream.on('error', function (err) {
        if (callback) {
            if (typeof (callback) == 'function') {
                console.log(err);
                callback(err);
            }
            else {
                console.log('callback is required for uploadDocumentToCloud');
            }
        }
        else {
            console.log('callback is required for uploadDocumentToCloud');
        }
    });
};



var attachmentFunction = function(attachments){

    var uniqueId = uuid.v4();
    var timestamp = Date.now();
    var filetype = attachments.filename ? attachments.filename.split('.')[1] : '';
    
    aUrl = uniqueId + '.' + filetype;
    ///home/ezeonetalent/ezeone1/api/routes/api/JobRaiser
    console.log('aUrl', aUrl);
    console.log("req.files.attachment.path", attachments.filename);
    // C:\Users\TM2\Documents\gitproject\routes\api\JobRaiser\settings\imap
    fs.writeFile("C:/Users/TM2/Documents/gitproject/routes/api/JobRaiser/settings/imap" + timestamp + "." + filetype, attachments.data, function (err) {
        if (!err) {
            console.log("file written");
            var readStream = fs.createReadStream('C:/Users/TM2/Documents/gitproject/routes/api/JobRaiser/settings/imap' + timestamp + '.' + filetype);
            console.log('file read', readStream);
            // uploadDocumentToCloud(aUrl, readStream, function (err) {
            //     console.log("err",err);
            //     if (!err) {
                    // console.log('FnSaveServiceAttachment: attachment Uploaded successfully', aUrl);

                    // fs.unlink("C:/Users/TM2/Documents/gitproject/routes/api/JobRaiser/settings/imap" + timestamp + "." + filetype, function (err) {
                    //     if (!err) {
                    //         console.log('File Deleted');
                    //     }
                    // });


                    var formData = {
                        file: {
                            value: 'C:/Users/TM2/Documents/gitproject/routes/api/JobRaiser/settings/imap' + timestamp + '.' + filetype,   // put full path
                            options: {
                                filename: 'C:/Users/TM2/Documents/gitproject/routes/api/JobRaiser/settings/imap' + timestamp + '.' + filetype,
                                contentType: 'application/*'
                            }
                        }
                    };

                    request.post({
                        url: 'https://dms.tallint.com/parsing/jobraiser/parsing/?IsEmployment=false',
                        //   headers : {
                        //         "Authorization" : auth,
                        //     "X-Atlassian-Token" : "nocheck"
                        //       }, 
                        formData: formData
                    }, function optionalCallback(err, httpResponse, body) {
                        if (err) {
                            return console.error('upload failed:', err);
                        }
                        else {
                            console.log("body",body);
                            var body = body.replace(/^"(.*)"$/, '$1');

                            var options = {
                                trim: true,
                                compact: true,
                                ignoreComment: true,
                                alwaysChildren: true,
                                instructionHasAttributes: true,
                                ignoreText: false,
                                ignoreAttributes: true
                            };

                            var convert = require('xml-js');
                            var jsonResult = convert.xml2json(body, options);

                            var jsonResponse = JSON.parse(jsonResult);
                            var Document = jsonResponse.Document;
                            console.log("jsonResponse",jsonResponse);
                            console.log(typeof (Document));

                            var Name = Document.Name._text;
                            var firstName = "";
                            var lastName = "";
                            if (Name && Name.split(' ')[0])
                                firstName = Name.split(' ')[0];

                            if (Name && Name.split(' ')[1])
                                lastName = Name.split(' ')[1];

                            var DOB = Document.DOB._text ? Document.DOB._text : undefined;
                            var gender = Document.Gender._text ? Document.Gender._text : undefined;
                            var mobileNumber = Document.Mobile._text ? Document.Mobile._text : '';
                            var emailId = Document.EMail._text ? Document.EMail._text : '';

                            var passportNumber = Document.Passport._text ? Document.Passport._text : '';
                            var SkillText = Document.SkillText._text ? Document.SkillText._text : '';
                            var skills = SkillText.split(',');  // splits skills and forms array of skills
                            var passportExpiryDate = Document.PassportExpiryDate._text ? Document.PassportExpiryDate._text : undefined;
                            console.log(firstName, lastName, skills);


                            var applicantId = req.body.applicantId ? req.body.applicantId : 0;
                            var heMasterId = req.body.heMasterId ? req.body.heMasterId : 1000;
                            var mobileISD = req.body.mobileISD ? req.body.mobileISD : '+91';
                            var cvPath = req.body.cvPath ? req.body.cvPath : '';

                            var response = {
                                status: false,
                                message: "Something went wrong",
                                data: null,
                                error: null
                            };

                            var inputs = [
                                req.st.db.escape(heMasterId),
                                req.st.db.escape(cvSourcingParentId),
                                req.st.db.escape(firstName),
                                req.st.db.escape(lastName),
                                req.st.db.escape(DOB),
                                req.st.db.escape(gender),
                                req.st.db.escape(mobileISD),
                                req.st.db.escape(mobileNumber),
                                req.st.db.escape(passportNumber),
                                req.st.db.escape(passportExpiryDate),
                                req.st.db.escape(emailId),
                                req.st.db.escape(JSON.stringify(skills || [])),
                                req.st.db.escape(cvPath)
                            ];
                            var procQuery = 'CALL wm_save_cvSouring( ' + inputs.join(',') + ')';
                            console.log(procQuery);

                            req.db.query(procQuery, function (cvErr, cvResult) {
                                console.log(cvErr);
                                if (cvErr) {
                                    console.log("error", cvErr);
                                }
                                else {
                                    console.log("resume sourced successfully", cvResult);
                                }
                            });
                        }
                    });
            //     }
            // });

        }
    });

}


var imaps = require('imap-simple');
var config = {
    imap: {
        user: 'arun@jobraiser.com',
        password: 'arun@007',
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 3000
    }
};

imaps.connect(config).then(function (connection) {

    connection.openBox('INBOX').then(function () {

        // Fetch emails from the last 24h
        var delay = 24 * 3600 * 1000;
        var yesterday = new Date();
        yesterday.setTime(Date.now() - delay);
        yesterday = yesterday.toISOString();
        var searchCriteria = ['UNSEEN', ['SUBJECT', 'Applying for client coordinator JR004SF profile']];
        var fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true, markSeen: true };

        // retrieve only the headers of the messages
        return connection.search(searchCriteria, fetchOptions);
    }).then(function (messages) {

        var attachments = [];

        messages.forEach(function (message) {
            var parts = imaps.getParts(message.attributes.struct);
            attachments = attachments.concat(parts.filter(function (part) {
                return part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT';
            }).map(function (part) {
                // retrieve the attachments only of the messages with attachments
                return connection.getPartData(message, part)
                    .then(function (partData) {
                        return {
                            filename: part.disposition.params.filename,
                            data: partData
                        };
                    });
            }));
        });

        return Promise.all(attachments);
    }).then(function (attachments) {
        console.log('attachments', attachments);
        // =>
        //    [ { filename: 'cats.jpg', data: Buffer() },
        //      { filename: 'pay-stub.pdf', data: Buffer() } ]
        for (var i = 0; i < attachments.length; i++) {
            attachmentFunction(attachments[i]);
                      
        }
    });
});