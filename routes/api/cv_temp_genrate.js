var express = require('express');
var router = express.Router();
var fs = require('fs');
var stream = require('stream');
var http = require('https');
var Docxtemplater = require('docxtemplater');
var ImageModule = require('docxtemplater-image-module');
var gm = require('gm').subClass({ imageMagick: true });


router.post('/',function(req,res,next){
    var if_not_ref = '';
    var imageFullPath = 'https://storage.googleapis.com/ezeone/';
    var imagePath = (req.body.imagePath) ? imageFullPath + req.body.imagePath : imageFullPath;
    console.log("imagePath",imagePath);
    if (req.body.reference.length < 1){
        if_not_ref = 'References available on request.';
    }
    http.get(imagePath, function(response){
        var bufs = [];
        response.on('data', function(d){ bufs.push(d); });
        response.on('end', function() {
            var bufImg = Buffer.concat(bufs);
            var buf = Buffer.concat(bufs);
            gm(buf).size(function(err,size){
                console.log("size",size);
                console.log("err",err);
                if(size && size.height && size.width){
                    var opts = {};
                    opts.centered = false;
                    opts.getSize=function(buf) {
                        return [150,150];
                    };
                    opts.getImage = function () {
                        return bufImg;
                    };
                    content = fs.readFileSync(__dirname + "/cv_template.docx", "binary");
                    var doc = new Docxtemplater(content);
                    var imageModule=new ImageModule(opts);
                    doc.attachModule(imageModule);
                    doc.setData({
                        "name": req.body.name,
                        "ezeoneid": req.body.ezeoneid,
                        "phone": req.body.phone,
                        "email": req.body.email,
                        "v_st": req.body.v_st,
                        "objective": req.body.objective,
                        "key_skills": req.body.key_skills,
                        "career": req.body.career,
                        "education": req.body.education,
                        "additional_info": req.body.additional_info,
                        "work_exp": req.body.work_exp,
                        "hobbies": req.body.hobbies,
                        "full_name": req.body.name,
                        "address": req.body.address,
                        "passport_no": req.body.passport_no,
                        "pass_exp_date": req.body.pass_exp_date,
                        "other_info": (req.body.other_info) ? req.body.other_info : '',
                        "dob": req.body.dob,
                        "gender": req.body.gender,
                        "if_not_ref": if_not_ref,
                        "image": req.body.imagePath,
                        "reference": req.body.reference,
                        "total_exp": (parseInt(req.body.total_exp) <= 1) ? req.body.total_exp+' Year' : req.body.total_exp+' Years',
                        "ezeone_pin":req.body.ezeoneid+'.CV.'+req.body.pin
                    });
                    doc.render();
                    var buf = doc.getZip().generate({type: "nodebuffer"});
                    var buffer = new Buffer('testbuffer');
                    var bufferStream = new stream.PassThrough();
                    bufferStream.end(buf);
                    res.setHeader('Content-disposition', 'attachment; filename=resume');
                    res.setHeader('Content-type', "application/msword");
                    bufferStream.pipe(res);
                    //fs.writeFileSync(__dirname+"/output.docx",buf);
                    //res.status(200).json("Success");
                }
                else{
                    console.log("imagePath4",imagePath);
                    content = fs.readFileSync(__dirname + "/cv_template.docx", "binary");
                    var doc = new Docxtemplater(content);

                    doc.setData({
                        "name": req.body.name,
                        "ezeoneid": req.body.ezeoneid,
                        "phone": req.body.phone,
                        "email": req.body.email,
                        "v_st": req.body.v_st,
                        "objective": req.body.objective,
                        "key_skills": req.body.key_skills,
                        "career": req.body.career,
                        "education": req.body.education,
                        "additional_info": req.body.additional_info,
                        "work_exp": req.body.work_exp,
                        "hobbies": req.body.hobbies,
                        "full_name": req.body.name,
                        "address": req.body.address,
                        "passport_no": req.body.passport_no,
                        "pass_exp_date": req.body.pass_exp_date,
                        "other_info": (req.body.other_info) ? req.body.other_info : '',
                        "dob": req.body.dob,
                        "gender": req.body.gender,
                        "if_not_ref": if_not_ref,
                        "%image": ' ',
                        "reference": req.body.reference,
                        "total_exp": (parseInt(req.body.total_exp) <= 1) ? req.body.total_exp+' Year' : req.body.total_exp+' Years',
                        "ezeone_pin":req.body.ezeoneid+'.CV.'+req.body.pin
                    });
                    doc.render();
                    var buf = doc.getZip().generate({type: "nodebuffer"});
                    var buffer = new Buffer('testbuffer');
                    var bufferStream = new stream.PassThrough();
                    bufferStream.end(buf);
                    res.setHeader('Content-disposition', 'attachment; filename=resume');
                    res.setHeader('Content-type', "application/msword");
                    bufferStream.pipe(res);
                    //fs.writeFileSync(__dirname+"/output.docx",buf);
                    //res.status(200).json("Success");
                }
            });
        });
        response.on('error',function(){
            content = fs.readFileSync(__dirname + "/cv_template.docx", "binary");
            var doc = new Docxtemplater(content);
            doc.setData({
                "name": req.body.name,
                "ezeoneid": req.body.ezeoneid,
                "phone": req.body.phone,
                "email": req.body.email,
                "v_st": req.body.v_st,
                "objective": req.body.objective,
                "key_skills": req.body.key_skills,
                "career": req.body.career,
                "education": req.body.education,
                "additional_info": req.body.additional_info,
                "work_exp": req.body.work_exp,
                "hobbies": req.body.hobbies,
                "full_name": req.body.name,
                "address": req.body.address,
                "passport_no": req.body.passport_no,
                "pass_exp_date": req.body.pass_exp_date,
                "other_info": (req.body.other_info) ? req.body.other_info : '',
                "dob": req.body.dob,
                "gender": req.body.gender,
                "if_not_ref": if_not_ref,
                "%image": ' ',
                "reference": req.body.reference,
                "total_exp": (parseInt(req.body.total_exp) <= 1) ? req.body.total_exp+' Year' : req.body.total_exp+' Years',
                "ezeone_pin":req.body.ezeoneid+'.CV.'+req.body.pin
            });
            doc.render();
            var buf = doc.getZip().generate({type: "nodebuffer"});
            var buffer = new Buffer('testbuffer');
            var bufferStream = new stream.PassThrough();
            bufferStream.end(buf);
            res.setHeader('Content-disposition', 'attachment; filename=resume');
            res.setHeader('Content-type', "application/msword");
            bufferStream.pipe(res);
            //fs.writeFileSync(__dirname+"/output.docx",buf);
            //res.status(200).json("Success");
        });
    });

    //var buffer = new Buffer('testbuffer');
    //var bufferStream = new stream.PassThrough();
    //bufferStream.end(buf);
    //res.setHeader('Content-disposition', 'attachment; filename=resume');
    //res.setHeader('Content-type', "application/msword");
    //bufferStream.pipe(res);
    //res.setHeader("Content-Type", "application/msword");res.status(200).send(buf,'binary');

});

router.post('/test_code',function(req,res,next){
    var if_not_ref = '';
    var reference = req.body.reference;
    if (reference.length < 1){
        if_not_ref = 'References available on request.';
    }
    var imagePath = (req.body.imagePath) ? "https://storage.googleapis.com/ezeone/"+ req.body.imagePath : 'https://storage.googleapis.com/ezeone/abc';
    http.get(imagePath, function(response){

        /**
         * @todo steam to buffer
         * @param response
         */
        var bufs = [];

        response.on('data', function(d){ bufs.push(d); });
        response.on('end', function() {
            var buf = Buffer.concat(bufs);
            var opts = {};
            opts.centered = false;
            opts.getImage = function () {
                return buf;
            };
            opts.getSize=function(buf) {
                return [150,150];
            };
            content = fs.readFileSync(__dirname + "/cv_template.docx", "binary");
            var doc = new Docxtemplater(content);
            var imageModule=new ImageModule(opts);
            doc.attachModule(imageModule);
            doc.setData({
                "name": req.body.name,
                "ezeoneid": req.body.ezeoneid,
                "phone": req.body.phone,
                "email": req.body.email,
                "v_st": "verified",
                "objective": req.body.objective,
                "key_skills": req.body.key_skills,
                "career": req.body.career,
                "education": req.body.education,
                "additional_info": req.body.additional_info,
                "work_exp": req.body.work_exp,
                "hobbies": req.body.hobbies,
                "full_name": req.body.name,
                "address": req.body.address,
                "passport_no": req.body.passport_no,
                "pass_exp_date": req.body.pass_exp_date,
                "other_info": (req.body.other_info) ? req.body.other_info : '',
                "dob": req.body.dob,
                "gender": req.body.gender,
                "if_not_ref": if_not_ref,
                "image": imagePath,
                "reference": req.body.reference,
                //"reference2": req.body.reference2,
                "total_exp": (parseInt(req.body.total_exp) <= 1) ? req.body.total_exp+' Year' : req.body.total_exp+' Years'
            });
            doc.render();
            var buf = doc.getZip().generate({type: "nodebuffer"});
            fs.writeFileSync(__dirname+"/output.docx",buf);
            res.status(200).json("Success");
        });
    });
    //var buffer = new Buffer('testbuffer');
    //var bufferStream = new stream.PassThrough();
    //bufferStream.end(buf);
    //res.setHeader('Content-disposition', 'attachment; filename=resume');
    //res.setHeader('Content-type', "application/msword");
    //bufferStream.pipe(res);
    //res.setHeader("Content-Type", "application/msword");res.status(200).send(buf,'binary');

});


var geocoderProvider = 'google';
var httpAdapter = 'http';
// optional
//var extra = {
//    apiKey: 'YOUR_API_KEY', // for Mapquest, OpenCage, Google Premier
//    formatter: null         // 'gpx', 'string', ...
//};

var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter);

router.get('/test_add', function(req,res,next){
    var cmbQuery = '';
    var geoQuery = 'SELECT lat ,longg as lon ,masterid FROM address_test where  address is null ';
    req.st.db.query(geoQuery, function (err, queryResult) {
        console.log(queryResult);
        if (!err) {
            if(queryResult){
                for (var i = 0; i < queryResult.length; i++){
                    testFunction(queryResult[i].lat,queryResult[i].lon,queryResult[i].masterid);
                }
                res.status(200).json(queryResult);
            }
        }
        else {
            console.log('error in psavejobnotification');
        }
    });
var testFunction = function(lat,lng,id){

    var geocoderProvider = 'google';
    var httpAdapter = 'https';
// optional
    var extra = {
        apiKey: 'AIzaSyBr6vVcI-3fov2urOfRukcHdkKlLHz6xh8', // for Mapquest, OpenCage, Google Premier
        formatter: null         // 'gpx', 'string', ...
    };


    var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter,extra);
    geocoder.reverse({lat:lat, lon:lng}, function(err, result) {
        //geocoder.getFromLocation(queryResult[i].lat ,queryResult[i].lon,1, function(err, reasult) {
        console.log(result);
        var addUpdateQuery = 'UPDATE address_test SET address='+req.db.escape(result[0].formattedAddress)+
            ' WHERE masterid=' +req.db.escape(id)+';';
        console.log(addUpdateQuery);
        req.st.db.query(addUpdateQuery, function (err, queryResult){
            if (!err){
                if (queryResult){
                }

            }
        });
    });
};
});

module.exports = router;
