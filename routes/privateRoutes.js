var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcryptjs');
var myutils = require('./../my_utils/utils_function');

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
                    con.query("SELECT m.date, m.oid, m.oid_user_sender, m.message, m.replayable, c.nome, c.cognome FROM messages AS m JOIN court_staff AS c ON c.oid=m.oid_user_sender " + 
                              "WHERE oid_user_receiver=" + userData.oid + " " +
                              "ORDER BY m.date DESC", function (err, result, fields) {
                        if (err) throw err;
                        userMessages = result.slice(0, 5);  // only first 5 messages

                        con.query("SELECT certificates_request.oid, certificates_request.status_request, certificates_request.date_request, type_certificates.abbreviation_name, type_certificates.type_name " +
                                    "FROM certificates_request INNER JOIN type_certificates ON certificates_request.oid_type_certificate=type_certificates.oid " +
                                    "WHERE NOT status_request='COMPLETATO' AND certificates_request.oid_user=" + userData.oid + " ORDER BY date_request DESC", function (err, result_cert, fields) {
                            if (err) throw err;
                            let pendent_certificates_val = result_cert.slice(0, 5);
                            let total_pendent_certificates_val = result_cert.length;

                            con.query("SELECT data, status_request, autentica, urgente " +
                                "FROM copy_document_request WHERE NOT status_request='COMPLETATO' AND copy_document_request.oid_user=" + userData.oid +
                                " ORDER BY data DESC", function (err, result_copy_request, fields) {
                                res.render('HomePagePortal.ejs', { 
                                    user: userData, 
                                    messages: userMessages, 
                                    total_msg: result.length,
                                    pendent_certificates: pendent_certificates_val,
                                    total_pendent_certificates: total_pendent_certificates_val,
                                    pendent_copy_document: result_copy_request.slice(0, 5),
                                    total_pendent_copy_document: result_copy_request.length});
                                con.end();
                            });
                        });
                    });
                    break;
                }
                case court_stuff: {
                    con.query("SELECT certificates_request.oid, certificates_request.status_request, certificates_request.date_request, type_certificates.abbreviation_name, type_certificates.type_name " +
                              "FROM certificates_request INNER JOIN type_certificates ON certificates_request.oid_type_certificate=type_certificates.oid " +
                              "WHERE NOT status_request='COMPLETATO' ORDER BY date_request DESC", function (err, result_cert, fields) {
                        if (err) throw err;
                            let pendent_certificates_val = result_cert.slice(0, 5);  // only first 5 new request of certificates
                            let total_pendent_certificates_val = result_cert.length;
                            con.query("SELECT data, status_request, autentica, urgente " + 
                                      "FROM copy_document_request WHERE NOT status_request='COMPLETATO' " + 
                                      "ORDER BY data DESC", function(err, result_copy_request, fields) {
                            res.render('HomePagePortalOffice.ejs', {
                                user: userData,
                                pendent_certificates: pendent_certificates_val,
                                total_pendent_certificates: total_pendent_certificates_val,
                                pendent_copy_document: result_copy_request.slice(0,5),
                                total_pendent_copy_document: result_copy_request.length
                            });
                            con.end();
                        });
                    });
                    break;
                }
                case admin: {
                    con.query("SELECT court_staff.username, court_staff.nome, court_staff.cognome, court_staff.oid, `group`.`groupname` " + 
                              "FROM court_staff " + 
                              "JOIN rel_staff_group ON rel_staff_group.oid_user_staff=court_staff.oid " + 
                              "JOIN `group` ON `group`.`oid`=rel_staff_group.oid_group " + 
                              "WHERE 1", function (err, result_users, fields) {
                            if (err) throw err;

                            res.render('HomePagePortalAdmin.ejs', {
                                user: userData,
                                users: result_users,
                            });
                            con.end();
                        });
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
        var msg = myutils.parseTextInsertSql(req.body.msg);

        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            con.query("INSERT INTO `messages`(`oid_user_receiver`, `oid_user_sender`, `message`, `replayable`, `update_service`) VALUES (" +
            user_id_receiver + ", " + user_id_sender + ", '" + msg + "', '1', '0')", function (err, result, fields) {
                if (err) throw err;
                con.end();
                console.log('New messagge arrived!');
                res.status(200);
                res.end();
            });
        });
    }
});

router.post('/update_data_user', (req, res, next) => {
    if (!req.session.user) return next();
    else {
        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            
            var query_update_data = "";
            if(req.session.user.type_user == citizen){
                query_update_data = "UPDATE `user` SET ";
            } else {
                query_update_data = "UPDATE `court_staff` SET ";
            }
            query_update_data = query_update_data + " `oid`=" + req.session.user.oid;
            if (req.body.new_values.data_user_password != ""){
                var salt = bcrypt.genSaltSync(10);
                var res_hash = bcrypt.hashSync(req.body.new_values.data_user_password, salt);
                query_update_data = query_update_data + ", `password`='" + res_hash + "'"
            }
            if (req.body.new_values.data_user_telefono != "" && req.body.new_values.data_user_telefono != req.body.old_values.data_user_telefono) {
                query_update_data = query_update_data + ", `telefono`='" + req.body.new_values.data_user_telefono + "'";
                req.session.user.telefono = req.body.new_values.data_user_telefono;
            }
            if (req.body.new_values.data_user_indirizzo != "" && req.body.new_values.data_user_indirizzo != req.body.old_values.data_user_indirizzo) {
                query_update_data = query_update_data + ", `indirizzo`='" + req.body.new_values.data_user_indirizzo + "'";
                req.session.user.indirizzo = req.body.new_values.data_user_indirizzo;
            }
            if (req.body.new_values.data_user_rs != "" && req.body.new_values.data_user_rs != req.body.old_values.data_user_rs) {
                query_update_data = query_update_data + ", `ragione_sociale`='" + req.body.new_values.data_user_rs + "'";
                req.session.user.ragione_sociale = req.body.new_values.data_user_rs;
            }

            query_update_data = query_update_data + " WHERE oid=" + req.session.user.oid;
            con.query(query_update_data, function (err, result, fields) {
                if (err) throw err;
                con.end();
                console.log('Updated info of 1 user.');
                res.status(200);
                res.end();
            });
        });
    }
})

// This will remove an existing user from court_staff table and also auto-remove the realtion between user and group
router.post('/remove_user', (req, res, next) => {
    if (!req.session.user) next();
    else {
        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            con.query("DELETE FROM `court_staff` WHERE `oid`=" + req.body.user, function(err, result, fields) {
                if (err) throw err;
                con.end();
                res.status(200);
                res.end();
            })
        })
    }
})

// This will add a new user inside of court_staff table
router.post('/add_new_user', (req, res, next) => {
    if (!req.session.user) next();
    else {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(req.body.password, salt, function (err, res_hash) {
                var new_password = res_hash;
                var con = mysql.createConnection(database_parameters);
                con.connect(function (err) {
                    if (err) throw err;
                    con.query("INSERT INTO `court_staff`(`username`, `nome`, `cognome`, `password`) VALUES ('" + req.body.username + "', '" + req.body.name + "', '" + req.body.surname + "', '" + new_password + "')", function (err, result, fields) {
                        if (err) throw err;
                        con.query("SELECT `oid` FROM `court_staff` WHERE `username`='" + req.body.username + "'", function (err, result_oid, fields) {
                            if (err) throw err;
                            con.query("INSERT INTO `rel_staff_group`(`oid_user_staff`, `oid_group`) VALUES (" + result_oid[0].oid + ", " + req.body.type_user + ")", function (err, result, fields) {
                                if (err) throw err;
                                con.end();
                                res.status(200);
                                res.end();
                            })
                        })
                    })
                })
            })
        })
    }
})

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

router.get('/all_messages', (req, res, next) => {
    if(!req.session.user) next();
    else {
        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            var data_of_user = req.session.user;

            var elements_per_page = 5;
            var page_msg = 0;
            if (req.query.pagina){
                page_msg = req.query.pagina - 1;
            }

            var query_msg = "SELECT m.date, m.oid, m.oid_user_sender, m.message, m.update_service, m.replayable, c.nome, c.cognome FROM messages AS m JOIN user AS c ";
            query_msg = query_msg + "ON c.oid=m.oid_user_sender WHERE oid_user_receiver=" + req.session.user.oid + " " + "ORDER BY m.date DESC";
            con.query(query_msg, function (err, res_msgs, fields) {
                if (err) throw err;
                con.end();  

                if(page_msg * elements_per_page >= res_msgs.length) {
                    page_msg = 0;
                }
                var msg_to_res = res_msgs.slice(page_msg * elements_per_page, (page_msg * elements_per_page) + elements_per_page);

                var total_pgs;
                if (res_msgs.length % elements_per_page == 0){
                    total_pgs = res_msgs.length / elements_per_page;
                } else {
                    total_pgs = (res_msgs.length / elements_per_page) + 1;
                }
                if(req.session.user.type_user != citizen){
                    res.render('AllMessages.ejs', {citizen: false, 
                                                   messages: msg_to_res, 
                                                   total_pages: total_pgs,
                                                   current_page : page_msg, 
                                                   user: req.session.user});
                } else {
                    res.render('AllMessages.ejs', {citizen: true, 
                                                   messages: msg_to_res,
                                                   total_pages: total_pgs,
                                                   current_page : page_msg,
                                                   user: req.session.user});
                }
            });
        });
    }
})

// this service will search for a service with given name and rend a dinamic page with results
router.post('/search_service', (req, res, next) => {
    if (!req.session.user) next();
    else {
        let services = [{
            "name": "Servizio richiesta copie atti giudiziari",
            "url": "/service_paper_document_copy_request"
        },{
            "name": "Servizio richiesta certificati",
            "url": "/service_certificates_request"
        }];

        let matches = []
        services.forEach(element => {
            if (element.name.toLowerCase().search(req.body.name_service.toLowerCase()) != -1){
                matches.push(element)
            }
        });

        res.render('Searched_service.ejs', { "results": matches, "key_word": req.body.name_service, "user": req.session.user});
    }
})

router.get('/edit_profile', (req, res, next) => {
    if(!req.session.user) next();
    else {
        res.render('EditPersonalData.ejs', {user: req.session.user});
    }
})

module.exports = router;