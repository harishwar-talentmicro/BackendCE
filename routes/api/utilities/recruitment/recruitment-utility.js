var express = require('express');
var router = express.Router();
var path = require('path');
var mime = require('mime');
var XLSX = require('xlsx');
var fs = require('fs');

/**
 * Imports data from excel and create a valid JSON from it
 * @service-param master_id
 * @consumes multipart/form-data
 * @data excel_file <file> [Valid excel file]
 */
router.post('/resume_importer',function(req,res,next){

    /**
     * @todo Check for token and from token find the MasterID
     * Currently done by directly taking MasterID of tmaster table as parameter
     */

    var validExcelMimeList = [
        'application/vnd.ms-excel',
        'application/msexcel',
        'application/x-msexcel',
        'application/x-ms-excel',
        'application/x-excel',
        'application/x-dos_ms_excel',
        'application/xls',
        'application/x-xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    req.query.master_id = (req.query.master_id) ? parseInt(req.query.master_id) : 0;

    if((!isNaN(req.query.master_id)) && req.query.master_id > 0){

        if(req.files && req.files.excel_file && req.files.excel_file.mimetype && (validExcelMimeList.indexOf(req.files.excel_file.mimetype) != -1)){

            var mainInsertQuery = "INSERT INTO tcv(firstname,lastname,emailid,mobile_no,gender,Exp,Keyskills,Status,MasterID,jobtype) VALUES";
            var mainValueQueryList = [];
            var workbook = XLSX.readFile(path.join(__dirname,'../../../../bin',req.files.excel_file.path));

            var sheetNameList = workbook.SheetNames;
            var excelData = {};
            sheetNameList.forEach(function(y) {

                var worksheet = workbook.Sheets[y];
                var headers = {};
                var data = [];
                for(var z in worksheet) {
                    if(z[0] === '!') continue;
                    //parse out the column, row, and value
                    var col = z.substring(0,1);
                    var row = parseInt(z.substring(1));
                    var value = worksheet[z].v;

                    //store header names
                    if(row == 1) {
                        headers[col] = value;
                        continue;
                    }

                    if(!data[row]) data[row]={};
                    data[row][headers[col]] = value;
                }
                //drop those first two rows which are empty
                data.shift();
                data.shift();
                //console.log(data);


                data = data.filter(function(x){
                    return (x) ? true : false;
                });

                for(var i=0;i<data.length; i++){
                    var gender = 2;
                    data[i].Gender = (data[i].Gender) ? data[i].Gender.trim().toLowerCase() : null;
                    gender = ['male','female'].indexOf(data[i].Gender);
                    gender = (gender == -1) ? 2 : gender;

                    data[i].Experience = parseInt(data[i].Experience);
                    data[i].Experience = (isNaN(data[i].Experience)) ? 0 : data[i].Experience;


                    var queryParams = [
                      req.db.escape(data[i].FirstName),
                      req.db.escape(data[i].LastName),
                      req.db.escape(data[i].Email),
                      req.db.escape(data[i].Mobile),
                      req.db.escape(gender),
                      req.db.escape(data[i].Experience),
                      req.db.escape(data[i].Keyskills),
                      req.db.escape(1),
                      req.db.escape(req.query.master_id),
                      req.db.escape('0,1,2,3,4,5,6,7'),
                    ];

                    mainValueQueryList.push(" ("+queryParams.join(',')+") ");
                }
                excelData[y] = data;

            });

            var importerQuery = mainInsertQuery + mainValueQueryList.join(' , ') + ";"

            console.log(importerQuery);

            if(mainValueQueryList.length){
                req.db.query(importerQuery,function(err,results){
                   if(err){
                       console.log('Error in importing resume from excel', err);
                       res.status(500).json({
                           status : false,
                           message : 'Import failed',
                           data : null,
                           error : {
                               server : 'Internal server error'
                           }
                       });
                   }
                   else{
                       res.json({
                           status : true,
                           message : 'Import successful',
                           data : excelData,
                           error : null
                       });
                   }
                });

            }
            else{
                res.json({
                    status : false,
                    message : 'Please upload a valid excel file for uploading',
                    data : null,
                    error : {
                        excel_file : 'Invalid excel file'
                    }
                });
            }

        }
        else{
            res.json({
                status : false,
                message : 'Please upload a valid excel file for uploading',
                data : null,
                error : {
                    excel_file : 'Invalid excel file'
                }
            });
        }

    }
    else{
        res.json({
            status : false,
            message : 'Please login to continue',
            data : null,
            error : {
                master_id : 'Invalid MasterID'
            }
        });
    }
});


/**
 * Download a valid format excel for resume download
 */
router.get('/resume_importer',function(req,res,next){

    var file = __dirname + '/resume_importer_template.xlsx';

    var filename = path.basename(file);
    var mimetype = mime.lookup(file);

    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);

    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
});

module.exports = router;
