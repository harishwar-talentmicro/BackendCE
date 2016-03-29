var path = require('path');
var mime = require('mime');
var XLSX = require('xlsx');
var fs = require('fs');


/**
 * Created by EZEID on 8/22/2015.
 */

var mysql = require('mysql'),
    db_server = "104.199.128.226",//Name of the Server.
////db_server = "182.73.205.244",//Name of the Server.
    db_port = 3306 //Integers please.
//db_collection = "livedb"; //Name of DB Collection
db_collection = "test_ezeid"; //Name of DB Collection



var getDBContext = function () {

    //console.log("TEST TEST TEST ");


    var pool = mysql.createPool({
        host: db_server,
        port: db_port,
        database: db_collection,
        user: 'root',
        //password: 'ezeid',
        //password: '#EzEonE_2015tmi',
        password: 'Test_Ezeid2015#db',
        multipleStatements: true
    });
    return pool;

};

var req = {};


var db = getDBContext();

req.db = db;


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

var filePath = "c:\\Users\\EZEID\\Music\\Vijay_Mangalore Data_test.xls";
//var filePath = "/c/Users/EZEID/Music/Vijay_Mangalore Data_test.xls";

var mainInsertQuery = "INSERT INTO tcv(firstname,lastname,emailid,mobile_no,gender,Exp,Keyskills,Status,OID,jobtype,MasterID) VALUES";
var mainValueQueryList = [];
//var workbook = XLSX.readFile(path.join(__dirname,'../../../../bin',req.files.excel_file.path));

function importFromFile(ownerMasterId){
    var workbook = XLSX.readFile(filePath);
    var sheetCount = 0;
    var sheetNameList = workbook.SheetNames;
    var excelData = {};
    sheetNameList.forEach(function(y) {

        var worksheet = workbook.Sheets[y];
        var headers = {};
        var data = [];

        var availableLocList = [
            {
                id : 387,
                searchTerms : ['ba','b.a.','ba'],
                title : 'Arts'
            },
            {
                id : 388,
                searchTerms : ['bbm','bcom','b.com','commerce'],
                title : 'Commerce'
            }
        ];
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
            console.log(data[i].Mobile);
            data[i].Mobile = (data[i].Mobile) ? data[i].Mobile.toString() : null;
            data[i].Mobile = (data[i].Mobile) ? data[i].Mobile.split('/').join(',') : '';


            if(data[i].Name){
                var nameArr = data[i].Name.split(' ');
                data[i].LastName = (nameArr.length > 1) ? nameArr.pop() : '';
                data[i].FirstName = nameArr.join(' ');
            }

            var stream = (data[i].Stream) ? data[i].Stream.trim().toLowerCase() : "";

            if(stream){
                var locListElem = -1;
                for(var k = 0; k < availableLocList.length; k++){
                    var searchList = [];
                    searchList = availableLocList[k].searchTerms.filter(function(searchTerm){
                        var regexObj = new RegExp(searchTerm);
                        if(stream.match(regexObj,'gi')){
                            return true;
                        }
                        else{
                            return false;
                        }
                    });

                    if(searchList.length > 0){
                        locListElem = availableLocList[k];
                        break;
                    }
                }
                data[i].LineOfCareer = locListElem.id;
                data[i].FunctionID = 47;
                data[i].KeySkills = 'Fresher,Freshers,Graduate,Graduates,'+stream +',' + locListElem.title;
            }
            else{
                data[i].LineOfCareer = 372;
                data[i].FunctionID = 36;
                data[i].KeySkills = 'Fresher,Freshers,Graduate,Graduates,';
            }


            var queryParams = [
                req.db.escape(data[i].FirstName),
                req.db.escape(data[i].LastName),
                req.db.escape(''),
                req.db.escape(data[i].Mobile),
                req.db.escape(gender),
                req.db.escape(data[i].Experience),
                req.db.escape(data[i].KeySkills),
                req.db.escape(1),
                req.db.escape(ownerMasterId),
                req.db.escape('0,1,2,3,4,5,6,7'),
                req.db.escape(0)
            ];

            mainValueQueryList.push(" ("+queryParams.join(',')+") ");
        }
        excelData[y] = data;
        fs.writeFileSync(ownerMasterId+'_'+sheetCount+'.json',JSON.stringify(excelData[y]));
        console.log('File Created ',ownerMasterId+'_'+sheetCount+'.json');

        fs.writeFileSync(ownerMasterId+'_'+sheetCount+'.sql',mainInsertQuery+' '+mainValueQueryList.join(',')+';');
        console.log('File Created ',ownerMasterId+'_'+sheetCount+'.sql');
        sheetCount += 1;
    });
}
var ownerMasterId = 62206;

function calculateDataSize(ownerMasterId){
    var list = fs.readFileSync('./'+ownerMasterId+'.json');
    var jsonObj = JSON.parse(list);
    console.log('Length ' ,jsonObj.length);
}


importFromFile(ownerMasterId);



