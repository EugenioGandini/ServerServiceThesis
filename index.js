//All modules that I need
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');

//Variable for serving all computer on the lan
var address = '0.0.0.0'
var port = '14300'

//Initialize the variable "app" to manage express module
var app = express();

//Set the view-engine to render dinamic pages
app.set('view engine', 'ejs');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//use sessions for tracking logins
app.use(session ({ 
    secret: 'okjokpohokjjihujhngsfusyada',
    resave: false,
    saveUninitialized: true,
    cookie: {
    expires: 3600000 // duration of cookie 1 hr
    }
}));

//All stuff inside public should be public accessible
app.use(express.static('public'));

//Catch every request from clients. So if the request is not something that this server can handle send a 404 response.
app.get('*', function(req, res, next) {
    let err = new Error(`${req.ip} tried to reach ${req.originalUrl}`);
    err.statusCode = 404;
    err.shouldRedirect = true; 
    next(err);
});
  
//If i came from a 404 error that the clint request something that is not present on the server so I send him a 404 page error.
//If the error code is not specified than I send a 500 error (generic server error)
app.use(function(err, req, res, next) {
    if (!err.statusCode) err.statusCode = 500;

    if (err.shouldRedirect) {
        console.log('Redirection: error 404 page not found at ' + req.url);
        res.sendFile('PageNotFound.html', { root: __dirname + '/public/html/' } );
    } else {
        res.status(err.statusCode).send(err.message);
    }
});

//This will listen to all request coming from the lan
app.listen(port, address, function () {
    console.log('Server running at localhost(127.0.0.1) on this machine.');
});