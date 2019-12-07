var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var database_parameters = {
    host: "localhost",
    user: "funzionario_tribunale",
    password: "funzionario_tribunale",
    database: "sito_tribunale_db"
};

const citizen = "Cittadino";
const court_stuff = "PersonaleCancelleria";
const admin = "Amministratore";

//For /login request return the login page
router.get('/home_page_portal', (req, res, next) =>{
    if (!req.session.user) return next();
    else {
        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            var userData = req.session.user;
            var userMessages;
            switch (userData.type_user) {
                case citizen: {
                    con.query("SELECT m.date, m.oid, m.message, c.nome, c.cognome FROM messages AS m JOIN court_staff AS c ON c.oid=m.oid_user_sender " + 
                              "WHERE oid_user_receiver=" + userData.oid + " " +
                              "ORDER BY m.date DESC", function (err, result, fields) {
                        if (err) throw err;
                        userMessages = result.slice(0, 5);  // only first 5 messages
                        res.render('HomePagePortal.ejs', { user: userData, messages: userMessages });
                        con.end();
                    });
                    break;
                }
                case court_stuff: {
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
                case admin: {
                    //TODO AMMINISTRATOR VIEW
                    break;
                }
            }
        })
    }
});

router.post('/send_message', (req, res, next) => {
    if (!req.session.user) return next();
    else {
        var user_id_sender = req.session.user.oid;
        var user_id_receiver = parseInt(req.body.user_id);
        var msg = req.body.msg;

        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            con.query("INSERT INTO `messages`(`oid_user_receiver`, `oid_user_sender`, `message`) VALUES (" +
            user_id_receiver + ", " + user_id_sender + ", '" + msg + "')", function (err, result, fields) {
                if (err) throw err;
                con.end();
                console.log('New messagge arrived!');
                res.status(200);
                res.end();
            });
        });
    }
});

//This route will logout the current user
router.get('/logout', (req, res, next) => {
    if (!req.session.user) {
        res.redirect('/login');
    }
    else {
        var type_user = req.session.user.type_user;
        //delete all data saved of the session
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                if(type_user == citizen){
                    res.redirect('/login');
                }
                else {
                    res.redirect('/login_stuff');
                }
            }
        });
    }
});

module.exports = router;