var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var database_parameters = {
    host: "localhost",
    user: "funzionario",
    password: "funzionario",
    database: "sito_tribunale_db"
};

//For /login request return the login page
router.get('/home_page_portal', (req, res, next) =>{
    if (!req.session.user) return next();
    else {
        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            con.query("SELECT * FROM user WHERE email='" + req.session.user + "'", function (err, result, fields) {
                if (err) throw err;
                con.end();
                var userData = result[0];
                res.render('HomePagePortal.ejs', userData);
            })
        })
    }
});

//This route will logout the current user
router.get('/logout', (req, res, next) => {
    if (!req.session.user) {
        res.redirect('/login');
    }
    else {
        //delete all data saved of the session
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                res.redirect('/login');
            }
        });
    }
});

module.exports = router;