var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var database_parameters = {
    host: "localhost",
    user: "funzionario_tribunale",
    password: "funzionario_tribunale",
    database: "sito_tribunale_db"
};

//For /login request return the login page
router.get('/home_page_portal', (req, res, next) =>{
    if (!req.session.user) return next();
    else {
        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            var userData = req.session.user;
            var userMessages;
            switch (userData.oid_group) {
                case 1: {
                    con.query("SELECT messages.date, messages.oid, messages.message, user.nome, user.cognome FROM messages INNER JOIN user ON messages.oid_user_sender=user.oid WHERE oid_user_receiver='" + userData.oid + "'", function (err, result, fields) {
                        if (err) throw err;
                        userMessages = result.slice(0, 5);  // only first 5 messages
                        res.render('HomePagePortal.ejs', { user: userData, messages: userMessages });
                        con.end();
                    });
                    break;
                }
                case 2: {
                    con.query("SELECT certificates_request.oid, certificates_request.status_request, certificates_request.date_request, type_certificates.abbreviation_name, type_certificates.type_name " +
                              "FROM certificates_request INNER JOIN type_certificates ON certificates_request.oid_type_certificate=type_certificates.oid " +
                              "WHERE NOT status_request='COMPLETATO' ORDER BY date_request DESC", function (err, result, fields) {
                        if (err) throw err;
                        pendent_certificates = result.slice(0, 5);  // only first 5 new request of certificates
                        res.render('HomePagePortalOffice.ejs', { 
                            user: userData,
                            pendent_certificates: pendent_certificates, 
                            total_pendent_certificates: result.length});
                        con.end();
                    });
                    break;
                }
                case 3: {
                    //TODO AMMINISTRATOR VIEW
                    break;
                }
            }
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