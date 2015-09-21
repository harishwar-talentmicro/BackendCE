var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');


var compress = require('compression');
var fs = require('fs');
var multer  = require('multer');

var app = express();
// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

var alumni = require('./routes/alumni.js');

app.use(compress());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


// Add headers
app.all('*',function(req,res,next){
    console.log();
    req.CONFIG = CONFIG;
    //console.log(req.CONFIG);
    //// Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    //// Request headers you wish to allow
    //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});



/**
 * EZEOne Alumni Middleware
 */

app.use('/',alumni);

var CONFIG = JSON.parse(fs.readFileSync(__dirname+'/ezeone-config.json'));

app.use(multer({ dest: './uploads/'}));
app.use(express.static(path.join(__dirname,'public/')));



//app.use(express.static(path.join(__dirname, 'public')));
// Set header to force download
function setHeaders(res, path) {
    res.setHeader('Content-Disposition', contentDisposition(path))
}
var api = require('./routes/api.js');
var index = require('./routes/index.js');

app.use('/api',api);

app.use('/',index);


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}



// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    console.log('404 : Page not found');

    if(req.type == 'json')
    {
            res.type('json').status(404).json({message : 'Invalid Service call', status : false});
    }
    else{
        res.status(404).send('');
    }
});


module.exports = app;
