var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var bodyParser = require('body-parser');
var http = require('https');
var request = require('request');
var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();

var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;

var settingsCtrl = {};
var error = {};

settingsCtrl.getAccessrightsMaster = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;


    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                req.query.userManager = req.query.userManager ? req.query.userManager : 0;
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.userManager)
                ];

                var procQuery = 'CALL wm_accessRightsmaster( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (req.query.userManager == 0) {
                        if (!err && result && result[0]) {

                            response.status = true;
                            response.message = "data loaded successfully";
                            response.error = null;
                            var output1 = [];
                            for (var j = 0; j < result[2].length; j++) {
                                var res3 = {};
                                res3.templateId = result[2][j].templateId;
                                res3.templateName = result[2][j].templateName;
                                res3.templateData = result[2][j].templateData ? JSON.parse(result[2][j].templateData) : [];
                                output1.push(res3);
                            }
                            response.data =
                                {
                                    formDetails: result[0],
                                    formRights: result[1],
                                    templateDetails: output1
                                };
                            res.status(200).json(response);
                        }

                        else if (!err) {
                            response.status = true;
                            response.message = "Your are Not Admin! No data found";
                            response.error = null;
                            response.data = {
                                formDetails: [],
                                formRights: [],
                                templateDetails: []

                            };
                            res.status(200).json(response);
                        }
                        else {
                            response.status = false;
                            response.message = "Error while loading data";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    }
                    else if (req.query.userManager == 1) {
                        if (!err && result && result[0]) {

                            response.status = true;
                            response.message = "data loaded successfully";
                            response.error = null;
                            var output1 = [];
                            for (var j = 0; j < result[0].length; j++) {
                                var res3 = {};
                                res3.templateId = result[0][j].templateId;
                                res3.templateName = result[0][j].templateName;
                                res3.templateData = result[0][j].templateData ? JSON.parse(result[0][j].templateData) : [];
                                output1.push(res3);
                            }
                            response.data =
                                {

                                    templateDetails: output1
                                };
                            res.status(200).json(response);
                        }

                        else if (!err) {
                            response.status = true;
                            response.message = "No results found";
                            response.error = null;
                            response.data = {

                                templateDetails: []

                            };
                            res.status(200).json(response);
                        }
                        else {
                            response.status = false;
                            response.message = "Error while loading data";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};


settingsCtrl.saveAccessrightsTemplate = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;


    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.body.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }

    var moduleRights = req.body.moduleRights;
    if (typeof (moduleRights) == "string") {
        moduleRights = JSON.parse(moduleRights);
    }
    if (!moduleRights) {
        moduleRights = [];
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                req.body.templateId = req.body.templateId ? req.body.templateId : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.templateId),
                    req.st.db.escape(req.body.templateName),
                    req.st.db.escape(JSON.stringify(moduleRights))

                ];

                var procQuery = 'CALL wm_save_accessrightsTemplate( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result[0]) {
                        response.status = false;
                        response.message = "TemplateName already exist";
                        response.error = null;
                        response.data = result[0];
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "Template saved successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while saving Template";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};



// settingsCtrl.mailExtract = function (req, res, next) {
//     var Imap = require('imap'),
//     inspect = require('util').inspect;
//   var fs = require('fs'), fileStream;
//   var buffer = '';
  
//   var myMap;

//   var imap = new Imap({
//     user: "arun@jobraiser.com",
//     password: "arun@007",
//     host: "imap.gmail.com", //this may differ if you are using some other mail services like yahoo
//     port: 993,
//     tls: true,
//     connTimeout: 10000, // Default by node-imap 
//     authTimeout: 5000, // Default by node-imap, 
//     debug: console.log, // Or your custom function with only one incoming argument. Default: null 
//     tlsOptions: { rejectUnauthorized: false },
//     mailbox: "INBOX", // mailbox to monitor 
//     searchFilter: ["UNSEEN"],//["UNSEEN", "FLAGGED"], // the search filter being used after an IDLE notification has been retrieved 
//     markSeen: false, // all fetched email willbe marked as seen and not fetched next time 
//     fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`, 
//     mailParserOptions: { streamAttachments: true }, // options to be passed to mailParser lib. 
//     attachments: true, // download attachments as they are encountered to the project directory 
//     attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments 
//   });
  
//   function openInbox(cb) {
//     imap.openBox('INBOX', false, cb);
//   }
  
//   imap.once('ready', function () {
//     openInbox(function (err, box) {
//       if (err) throw err;
//       imap.search(['UNSEEN', ['SUBJECT', 'testing']], function (err, results) {
//         //   console.log('Results of unread mails',results);
//         if (err) throw err;
//         var f = imap.fetch(results, { bodies: '1', markSeen: true });
//         f.on('message', function (msg, seqno) {
//           console.log('Message #%d' + seqno);
//           console.log('Message type' + msg.text)
//           var prefix = '(#' + seqno + ') ';
//           msg.on('body', function (stream, info) {
//             stream.on('data', function (chunk) {
//               buffer += chunk.toString('utf8');
//               console.log("BUFFER of msg.on" + buffer)
  
//             })
//             stream.once('end', function () {
//               if (info.which === '1') {
//                 console.log("BUFFER Of Stream.once" + buffer)
//               }
  
  
//             });
//             console.log(prefix + 'Body');
//             stream.pipe(fs.createWriteStream('msg-' + seqno + '-body.txt'));
//           });
//           msg.once('attributes', function (attrs) {
//             console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
//           });
//           msg.once('end', function () {
//             console.log(prefix + 'Finished');
//           });
//         });
//         f.once('error', function (err) {
//           console.log('Fetch error: ' + err);
//         });
//         f.once('end', function () {
//           console.log('Done fetching all messages!');
//           imap.end();
//         });
//       });
//     });
//   });
  
//   imap.once('error', function (err) {
//     console.log(err);
//   });
  
//   imap.once('end', function () {
//     console.log('Connection ended');
//   });
  
//   imap.connect();
//   console.log('attachments',imap.attachmentOptions);
// res.send('ok');
// }



// settingsCtrl.imapExtract = function(req,res,next){
// var inspect = require('util').inspect;
// var fs      = require('fs');
// var base64  = require('base64-stream');
// var Imap    = require('imap');
// var imap    = new Imap({
//   user: 'arun@jobraiser.com',
//   password: 'arun@007',
//   host: 'imap.gmail.com',
//   port: 993,
//   tls: true
//   //,debug: function(msg){console.log('imap:', msg);}
// });

// function toUpper(thing) { return thing && thing.toUpperCase ? thing.toUpperCase() : thing;}

// function findAttachmentParts(struct, attachments) {
//   attachments = attachments ||  [];
//   for (var i = 0, len = struct.length, r; i < len; ++i) {
//     if (Array.isArray(struct[i])) {
//       findAttachmentParts(struct[i], attachments);
//     } else {
//       if (struct[i].disposition && ['INLINE', 'ATTACHMENT'].indexOf(toUpper(struct[i].disposition.type)) > -1) {
//         attachments.push(struct[i]);
//       }
//     }
//   }
//   return attachments;
// }

// function buildAttMessageFunction(attachment) {
//   var filename = attachment.params.name;
//   var encoding = attachment.encoding;

//   return function (msg, seqno) {
//     var prefix = '(#' + seqno + ') ';
//     msg.on('body', function(stream, info) {
//       //Create a write stream so that we can stream the attachment to file;
//       console.log(prefix + 'Streaming this attachment to file', filename, info);
//       var writeStream = fs.createWriteStream(filename);
//       writeStream.on('finish', function() {
//         console.log(prefix + 'Done writing to file %s', filename);
//       });

//       //stream.pipe(writeStream); this would write base64 data to the file.
//       //so we decode during streaming using 
//       if (toUpper(encoding) === 'BASE64') {
//         //the stream is base64 encoded, so here the stream is decode on the fly and piped to the write stream (file)
//         stream.pipe(base64.decode()).pipe(writeStream);
//       } else  {
//         //here we have none or some other decoding streamed directly to the file which renders it useless probably
//         stream.pipe(writeStream);
//       }
//     });
//     msg.once('end', function() {
//       console.log(prefix + 'Finished attachment %s', filename);
//     });
//   };
// }

// imap.once('ready', function() {
//   imap.openBox('INBOX', true, function(err, box) {
//     if (err) throw err;
//     var f = imap.seq.fetch('1:3', {
//       bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
//       struct: true
//     });
//     f.on('message', function (msg, seqno) {
//       console.log('Message #%d', seqno);
//       var prefix = '(#' + seqno + ') ';
//       msg.on('body', function(stream, info) {
//         var buffer = '';
//         stream.on('data', function(chunk) {
//           buffer += chunk.toString('utf8');
//         });
//         stream.once('end', function() {
//           console.log(prefix + 'Parsed header: %s', Imap.parseHeader(buffer));
//         });
//       });
//       msg.once('attributes', function(attrs) {
//         var attachments = findAttachmentParts(attrs.struct);
//         console.log(prefix + 'Has attachments: %d', attachments.length);
//         for (var i = 0, len=attachments.length ; i < len; ++i) {
//           var attachment = attachments[i];
//           /*This is how each attachment looks like {
//               partID: '2',
//               type: 'application',
//               subtype: 'octet-stream',
//               params: { name: 'file-name.ext' },
//               id: null,
//               description: null,
//               encoding: 'BASE64',
//               size: 44952,
//               md5: null,
//               disposition: { type: 'ATTACHMENT', params: { filename: 'file-name.ext' } },
//               language: null
//             }
//           */
//           console.log(prefix + 'Fetching attachment %s', attachment.params.name);
//           var f = imap.fetch(attrs.uid , { //do not use imap.seq.fetch here
//             bodies: [attachment.partID],
//             struct: true
//           });
//           //build function to process attachment message
//           f.on('message', buildAttMessageFunction(attachment));
//         }
//       });
//       msg.once('end', function() {
//         console.log(prefix + 'Finished email');
//       });
//     });
//     f.once('error', function(err) {
//       console.log('Fetch error: ' + err);
//     });
//     f.once('end', function() {
//       console.log('Done fetching all messages!');
//       imap.end();
//     });
//   });
// });

// imap.once('error', function(err) {
//   console.log(err);
// });

// imap.once('end', function() {
//   console.log('Connection ended');
// });

// imap.connect();

// }


// settingsCtrl.imapExt2 = function(req,res,next){

//   var inspect = require('util').inspect;
// var fs = require('fs');
// var base64 = require('base64-stream');
// var Imap = require('imap');
// var imap = new Imap({
//     user: 'arun@jobraiser.com',
//     password: 'arun@007',
//     host: 'imap.gmail.com',
//     port: 993,
//     tls: true
//     //,debug: function(msg){console.log('imap:', msg);}
// });

// function findAttachmentParts(struct, attachments) {
//     attachments = attachments || [];
//     for (var i = 0, len = struct.length, r; i < len; ++i) {
//         if (Array.isArray(struct[i])) {
//             findAttachmentParts(struct[i], attachments);
//         } else {
//             if (struct[i].disposition && ['INLINE', 'ATTACHMENT'].indexOf(struct[i].disposition.type) > -1) {
//                 attachments.push(struct[i]);
//             }
//         }
//     }
//     return attachments;
// }

// function buildAttMessageFunction(attachment) {
//     var filename = attachment.params.name;
//     var encoding = attachment.encoding;

//     return function (msg, seqno) {
//         var prefix = '(#' + seqno + ') ';
//         msg.on('body', function (stream, info) {
//             //Create a write stream so that we can stream the attachment to file;
//             console.log(prefix + 'Streaming this attachment to file', filename, info);
//             var writeStream = fs.createWriteStream(filename);
//             writeStream.on('finish', function () {
//                 console.log(prefix + 'Done writing to file %s', filename);
//             });

//             //stream.pipe(writeStream); this would write base64 data to the file.
//             //so we decode during streaming using 
//             if (encoding === 'BASE64') {
//                 //the stream is base64 encoded, so here the stream is decode on the fly and piped to the write stream (file)
//                 stream.pipe(base64.decode()).pipe(writeStream);
//                 console.log(stream);

//             } else {
//                 //here we have none or some other decoding streamed directly to the file which renders it useless probably
//                 stream.pipe(writeStream);
//             }
//         });
//         msg.once('end', function () {
//             console.log(prefix + 'Finished attachment %s', filename);
//         });
//     };
// }

// imap.once('ready', function () {
//     imap.openBox('INBOX', true, function (err, box) {
//         if (err) throw err;
//         imap.search(['UNSEEN'], function (err, results) {
//             if (err) throw err;
//             var f = imap.seq.fetch(results, {
//                 bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
//                 struct: true
//             });
//             f.on('message', function (msg, seqno) {
//                 console.log('Message #%d', seqno);
//                 var prefix = '(#' + seqno + ') ';
//                 msg.on('body', function (stream, info) {
//                     var buffer = '';
//                     stream.on('data', function (chunk) {
//                         buffer += chunk.toString('utf8');
//                     });
//                     stream.once('end', function () {
//                         console.log(prefix + 'Parsed header: %s', Imap.parseHeader(buffer));
//                     });
//                 });
//                 msg.once('attributes', function (attrs) {
//                     var attachments = findAttachmentParts(attrs.struct);
//                     console.log(prefix + 'Has attachments: %d', attachments.length);
//                     for (var i = 0, len = attachments.length; i < len; ++i) {
//                         var attachment = attachments[i];
//                         /*This is how each attachment looks like {
//                             partID: '2',
//                             type: 'application',
//                             subtype: 'octet-stream',
//                             params: { name: 'file-name.ext' },
//                             id: null,
//                             description: null,
//                             encoding: 'BASE64',
//                             size: 44952,
//                             md5: null,
//                             disposition: { type: 'ATTACHMENT', params: { filename: 'file-name.ext' } },
//                             language: null
//                           }
//                         */
//                         console.log(prefix + 'Fetching attachment %s', attachment.params.name);
//                         if (attachment.params.name.indexOf('.pdf') > -1 || attachment.params.name.indexOf('.doc') > -1 || attachment.params.name.indexOf('.docx') > -1 || attachment.params.name.indexOf('.txt') > -1 || attachment.params.name.indexOf('.rtf') > -1) {
//                             var f = imap.fetch(attrs.uid, {
//                                 bodies: [attachment.partID],
//                                 struct: true
//                             });
//                             //build function to process attachment message
//                             f.on('message', buildAttMessageFunction(attachment));
//                         }

//                     }
//                 });
//                 msg.once('end', function () {
//                     console.log(prefix + 'Finished email');
//                 });
//             });
//             f.once('error', function (err) {
//                 console.log('Fetch error: ' + err);
//             });
//             f.once('end', function () {
//                 console.log('Done fetching all messages!');
//                 imap.end();
//             });
//         });
//     });

// });

// imap.once('error', function (err) {
//     console.log(err);
// });

// imap.once('end', function () {
//     console.log('Connection ended');
// });

// imap.connect();

// }



/* 
  var imap = new Imap({
    user: "arun@jobraiser.com",
    password: "arun@007",
    host: "imap.gmail.com", //this may differ if you are using some other mail services like yahoo
    port: 993,
    tls: true,
    connTimeout: 10000, // Default by node-imap 
    authTimeout: 5000, // Default by node-imap, 
    debug: console.log, // Or your custom function with only one incoming argument. Default: null 
    tlsOptions: { rejectUnauthorized: false },
    mailbox: "INBOX", // mailbox to monitor 
    searchFilter: ["UNSEEN"],//["UNSEEN", "FLAGGED"], // the search filter being used after an IDLE notification has been retrieved 
    markSeen: true, // all fetched email willbe marked as seen and not fetched next time 
    fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`, 
    mailParserOptions: { streamAttachments: true }, // options to be passed to mailParser lib. 
    attachments: true, // download attachments as they are encountered to the project directory 
    attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments 
  });
  
  function openInbox(cb) {
    imap.openBox('INBOX', false, cb);
  }
  
  imap.once('ready', function () {
    openInbox(function (err, box) {
      if (err) throw err;
      imap.search(['UNSEEN', ['SUBJECT', 'testing']], function (err, results) {
        if (err) throw err;
        var f = imap.fetch(results, { bodies: '1', markSeen: true });
        f.on('message', function (msg, seqno) {
          console.log('Message #%d' + seqno);
          console.log('Message type' + msg.text)
          var prefix = '(#' + seqno + ') ';
          msg.on('body', function (stream, info) {
            stream.on('data', function (chunk) {
              buffer += chunk.toString('utf8');
              console.log("BUFFER" + buffer)
  
            })
            stream.once('end', function () {
              if (info.which === '1') {
                console.log("BUFFER" + buffer)
              }
  
  
            });
            console.log(prefix + 'Body');
            stream.pipe(fs.createWriteStream('msg-' + seqno + '-body.txt'));
          });
          msg.once('attributes', function (attrs) {
            console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
          });
          msg.once('end', function () {
            console.log(prefix + 'Finished');
          });
        });
        f.once('error', function (err) {
          console.log('Fetch error: ' + err);
        });
        f.once('end', function () {
          console.log('Done fetching all messages!');
          imap.end();
        });
      });
    });
  });
  
  imap.once('error', function (err) {
    console.log(err);
  });
  
  imap.once('end', function () {
    console.log('Connection ended');
  });
  
  imap.connect();
*/

settingsCtrl.temporary = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    var query = "call wm_integrationUrlForHircraft()";
    req.db.query(query, function (err, result) {
        if (err) {
            console.log('Interview database error: integrationUrlForHircraft',err);
        }
        else if ((result[0].length != 0) && (result[1].length != 0)) {
            var heMasterId;
            var transId;
            var integrationFormData = {};
            var DBUrl;
            // console.log(result);
            if (result && result[0] && result[0][0] && result[1] && result[1][0]) {
                heMasterId = result[0][0].heMasterId;
                DBUrl = result[0][0].url;
                transId = result[1][0].transId;
                var response_server = (result[1][0].integrationFormdata);
                // console.log('response_server',response_server);
                if (typeof (response_server) == "string") {
                    response_server = JSON.parse(response_server);
                }

                if (typeof (response_server.skillAssessment) == 'string') {
                    response_server.skillAssessment = JSON.parse(response_server.skillAssessment);
                    
                }


                if (typeof (response_server.assessment) == 'string') {
                    response_server.assessment = JSON.parse(response_server.assessment);
                    response_server.skillAssessment = JSON.parse(response_server.skillAssessment);
                    
                }

                if (typeof (response_server.assessment.integrationAssessmentDetails) == 'string') {
                    response_server.assessment.integrationAssessmentDetails = JSON.parse(response_server.assessment.integrationAssessmentDetails);
                }

                for (var r = 0; r < response_server.assessment.integrationAssessmentDetails.length; r++) {

                    if (typeof (response_server.assessment.integrationAssessmentDetails[r].integrationQuestions) == 'string') {
                        response_server.assessment.integrationAssessmentDetails[r].integrationQuestions = JSON.parse(response_server.assessment.integrationAssessmentDetails[r].integrationQuestions);
                    }
                    for (var s = 0; s < response_server.assessment.integrationAssessmentDetails[r].integrationQuestions.length; s++) {
                        if (typeof (response_server.assessment.integrationAssessmentDetails[r].integrationQuestions[s].integrationselectedOption) == 'string') {
                            response_server.assessment.integrationAssessmentDetails[r].integrationQuestions[s].integrationselectedOption = JSON.parse(response_server.assessment.integrationAssessmentDetails[r].integrationQuestions[s].integrationselectedOption);
                        }
                    }
                }
                console.log("response_server", JSON.stringify(response_server));
                var count = 0;
                request({
                    url: DBUrl,
                    method: "POST",
                    json: true,   // <--Very important!!!
                    body: response_server
                }, function (error, response, body) {
                    console.log('Tallint error',error);
                    console.log('Tallint body after success',body);
                    // console.log("response_server", response_server);
                    if (body && body.Code && body.Code == "SUCCESS0001") {
                        var updateQuery = "update 1014_trans set sync=1 where heParentId=" + transId;
                        db.query(updateQuery, function (err, results) {
                            if (err) {
                                console.log("update sync query throws error");
                            }
                            else {
                                console.log("sync is updated to 1 successfully", transId);
                            }
                        });
                    }
                    count++;
                });

                response.status=true;
                response.data=response_server;
                res.status(200).json(response);
                console.log('tallint interview hit for ', count, ' times');
            }
        }
    });
          
};


module.exports = settingsCtrl;
