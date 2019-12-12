var express = require('express');
var router = express.Router();
var path = require('path');
var mysql = require('mysql');
var formidable = require('formidable');
var fs = require('fs');
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

//Get the page for requesting a certificate.
router.get('/service_certificates_request', (req, res, next) => {
    if (!req.session.user) return next();
    else {
        var userData = req.session.user;
        sendPageAllCertificates(req, res, userData);
    }
});

//Send the form of the certificate request to the user.
router.post('/obtain_form_certificate', (req, res, next) => {
    if (!req.session.user) return next();
    else {
        var type = parseInt(req.body.typecertificate);
        
        switch(type) {
            case 1: {
                res.render('CertificatoAssenzaPendenzaDiProcedureFallimentari.ejs', {});
                break;
            }
            case 2: {
                res.render('CertificatoAssenzaPendenzaDiProcedureEsecutiveMobiliari.ejs', {});
                break;
            }
            case 3: {
                res.render('CertificatoAssenzaPendenzaDiProcedureEsecutiveImmobiliari.ejs', {});
                break;
            }
            default: {
                res.end();
            }
        }
    }
});

router.get('/add_request_certificate', (req, res, next) => {
    if (!req.session.user) return next();
    else {
        sendPageNewRequest(req, res);
    }
})

router.post('/add_request_certificate', (req, res, next) => {
    if (!req.session.user) return next();
    else {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) throw err;

            switch (parseInt(fields.type_certificate)) {
                case 1: {
                    insertCertificateProcedureFallimenti(req, res, files, fields);
                    break;
                }
                case 2: {
                    insertCertificateEsecuzioniMobiliariImmobiliari(req, res, files, fields, "mobiliari");
                    break;
                }
                case 3: {
                    insertCertificateEsecuzioniMobiliariImmobiliari(req, res, files, fields, "immobiliari");
                    break;
                }
            }
            
        })
    }
})

router.post('/detail_certificate', (req, res, next) => {
    if (!req.session.user) return next();
    else {
        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            var query_detail_cert = "SELECT * FROM certificates_request " +
                                    "AS c JOIN type_certificates AS t ON t.oid=c.oid_type_certificate JOIN user AS u ON u.oid=c.oid_user " +
                                    "WHERE c.oid=" + req.body.certificate_request_id;
            con.query(query_detail_cert, function (err, result, fields) {
                if (err) throw err;
                con.end();
                res.send(result[0]);
            })
        });
    }
})

router.post('/detail_copy_document', (req, res, next) => {
    if (!req.session.user) return next();
    else {
        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            var query_detail_copy = "SELECT * FROM copy_document_request " +
                "AS c JOIN user AS u ON u.oid=c.oid_user " +
                "WHERE c.oid=" + req.body.copy_document_request_id;
            con.query(query_detail_copy, function (err, result, fields) {
                if (err) throw err;
                con.end();
                res.send(result[0]);
            })
        });
    }
})

router.get('/get_document_certificate_request', (req, res, next) => {
    if (!req.session.user) return next();
    else {
        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            con.query("SELECT c." + req.query.type + ", c.mimetype_" + req.query.type + " AS type_mime FROM certificates_request AS c WHERE c.oid=" + req.query.certificate_request_id, function (err, result, fields) {
                if (err) throw err;
                con.end();

                var buffer_data = "";
                var file_name = "";
                if(req.query.type == "copy_ci") {
                    buffer_data = result[0].copy_ci;
                    file_name = "Carta di identita";
                } else {
                    buffer_data = result[0].copy_cf;
                    file_name = "Codice fiscale";
                }
                switch (result[0].type_mime) {
                    case "image/jpeg": {
                        file_name = file_name + ".jpg"
                        break;
                    }
                    case "image/png": {
                        file_name = file_name + ".png"
                        break;
                    }
                    case "application/pdf": {
                        file_name = file_name + ".pdf"
                        break;
                    }
                }
                var path_buffered_file = path.join(__dirname) + "/../private/data_certificates/" + file_name;
                fs.writeFile(path_buffered_file, buffer_data, "binary", function (err) {
                    res.download(path.resolve(path.join(__dirname) + "/../private/data_certificates/" + file_name), function(err){
                        if (err) {
                        } else {
                            fs.unlinkSync(path_buffered_file);
                        }
                    });
                });
            })
        })
    }
});

router.get('/get_document_copy_request', (req, res, next) => {
    if (!req.session.user) return next();
    else {
        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            con.query("SELECT c." + req.query.type + ", c.mimetype_" + req.query.type + " AS type_mime FROM copy_document_request AS c WHERE c.oid=" + req.query.copy_request_id, function (err, result, fields) {
                if (err) throw err;
                con.end();

                var buffer_data = "";
                var file_name = "";
                if (req.query.type == "copy_ci") {
                    buffer_data = result[0].copy_ci;
                    file_name = "Carta di identita";
                } else if (req.query.type == "copy_cf") {
                    buffer_data = result[0].copy_cf;
                    file_name = "Codice fiscale";
                } else {
                    buffer_data = result[0].other_doc;
                    file_name = "Doc_aggiuntivo";
                }
                switch (result[0].type_mime) {
                    case "image/jpeg": {
                        file_name = file_name + ".jpg"
                        break;
                    }
                    case "image/png": {
                        file_name = file_name + ".png"
                        break;
                    }
                    case "application/pdf": {
                        file_name = file_name + ".pdf"
                        break;
                    }
                }
                var path_buffered_file = path.join(__dirname) + "/../private/data_copy_document/" + file_name;
                fs.writeFile(path_buffered_file, buffer_data, "binary", function (err) {
                    res.download(path.resolve(path.join(__dirname) + "/../private/data_copy_document/" + file_name), function (err) {
                        if (err) {
                        } else {
                            fs.unlinkSync(path_buffered_file);
                        }
                    });
                });
            })
        })
    }
});

router.post('/delete_certificate_request', (req, res, next) => {
    if (!req.session.user || req.session.user.type_user != court_stuff) return next(); //only the stuff can do this
    else {
        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            con.query("DELETE FROM `certificates_request` WHERE certificates_request.oid=" + req.body.certificate_request_id, function (err, result, fields) {
                if (err) throw err;
                con.end();
                console.log('1 certificate request deleted.')
                res.status(200);
                res.end();
            });
        });
    }
})

router.post('/delete_copy_document_request', (req, res, next) => {
    if (!req.session.user || req.session.user.type_user != court_stuff) return next(); //only the stuff can do this
    else {
        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            con.query("DELETE FROM `copy_document_request` WHERE copy_document_request.oid=" + req.body.copy_request_id, function (err, result, fields) {
                if (err) throw err;
                con.end();
                console.log('1 document copy request deleted.')
                res.status(200);
                res.end();
            });
        });
    }
})

router.post('/update_certificate_request', (req, res, next) => {
    if (!req.session.user || req.session.user.type_user != court_stuff) return next(); //only the stuff can do this
    else {
        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            con.query("UPDATE `certificates_request` SET `status_request`='" + req.body.new_status +  "' " + 
                      "WHERE certificates_request.oid=" + req.body.certificate_request_id, function (err, result, fields) {
                if (err) throw err;
                console.log('1 certificate updated status request.');
                // send a message notify to user
                
                var msg = "Aggiornamento della richiesta di certificato. Nuovo stato: " + req.body.new_status;
                con.query("INSERT INTO `messages`(`oid_user_receiver`, `oid_user_sender`, `message`) VALUES (" +
                    req.body.user_request + ", " + req.session.user.oid + ", '" + msg + "')", function (err, result, fields) {
                    if (err) throw err;
                    con.end();
                    console.log('New messagge arrived!');
                    res.status(200);
                    res.end();
                });            
            });
        });
    }
})

router.post('/num_pages_document_request', (req, res, next) => {
    if (!req.session.user) next();
    else {
        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            con.query("SELECT c.num_pagine_totali, c.urgente, c.autentica FROM `copy_document_request` AS c WHERE c.oid=" + req.body.copy_document_request_id, function (err, data_extracted, fields) {
                if (err) throw err;
                
                var column_price = "";
                if (data_extracted[0].autentica == 1) {
                    if (data_extracted[0].urgente == 1) column_price = "autentica_urgente";
                    else column_price = "autentica_nonurgente";
                } else {
                    if (data_extracted[0].urgente == 1) column_price = "nonautentica_urgente";
                    else column_price = "nonautentica_nonurgente";
                }

                var query_prezzo = "SELECT p." + column_price + " AS prezzo FROM `prices_copy_document` AS p WHERE `range_min`<=" ;
                if (req.body.num_pages != undefined) {
                    query_prezzo = query_prezzo + req.body.num_pages + " AND " + req.body.num_pages + "<=`range_max`"
                }
                else {
                    query_prezzo = query_prezzo + data_extracted[0].num_pagine_totali + " AND " + data_extracted[0].num_pagine_totali + "<=`range_max`";
                }
                con.query(query_prezzo, function (err, row_prezzo, fields) {
                    if (err) throw err;
                    con.end();
                    res.send({ num_pagine_totali: data_extracted[0].num_pagine_totali, prezzo_per_pagina: row_prezzo[0].prezzo});
                })
            })
        })
    }
})

router.post('/update_copy_document_request', (req, res, next) => {
    if (!req.session.user || req.session.user.type_user != court_stuff) return next(); //only the stuff can do this
    else {
        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            var query_update = "UPDATE `copy_document_request` SET `status_request`='" + req.body.new_status + "'";
            if (req.body.new_status == "ATTESA PAGAMENTO"){
                query_update = query_update + ", `num_pagine_totali`=" + req.body.num_pagine;
            }
            query_update = query_update + " WHERE copy_document_request.oid=" + req.body.copy_request_id;

            con.query(query_update, function (err, result, fields) {
                if (err) throw err;
                console.log('1 certificate updated status request.');
                // send a message notify to user

                var msg = "Aggiornamento della richiesta di copia di un atto. Nuovo stato: " + req.body.new_status;
                con.query("INSERT INTO `messages`(`oid_user_receiver`, `oid_user_sender`, `message`) VALUES (" +
                    req.body.user_request + ", " + req.session.user.oid + ", '" + msg + "')", function (err, result, fields) {
                        if (err) throw err;
                        con.end();
                        console.log('New messagge arrived!');
                        res.status(200);
                        res.end();
                    });
            });
        });
    }
})

router.get('/service_paper_document_copy_request', (req, res, next) => {
    if (!req.session.user) next();
    else {
        var userData = req.session.user;
        sendPageAllRequestCopy(req, res, userData);
    }
});

router.get('/add_request_copy_document', (req, res, next) => {
    if (!req.session.user) return next();
    else {
        res.render('document_copy_request.ejs', {});
    }
});

router.post('/add_request_copy_document', (req, res, next) => {
    if (!req.session.user) return next();
    else {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) throw err;

            //var path_ci = path.join(__dirname) + "/../private/data_certificates/" + files.ci.name;
            var path_ci = path.dirname(files.ci.path) + "\\" + "C_I" + path.extname(files.ci.name);
            fs.renameSync(files.ci.path, path_ci);

            var path_cf = path.dirname(files.cf.path) + "\\" + "C_F" + path.extname(files.cf.name);
            fs.renameSync(files.cf.path, path_cf);

            if(files.doc_aggiuntivo.name != "") {
                var path_doc_agg = path.dirname(files.doc_aggiuntivo.path) + "\\" + "DOC_AGG" + path.extname(files.doc_aggiuntivo.name);
                fs.renameSync(files.doc_aggiuntivo.path, path_doc_agg);
            }

            var query_insert_request = "INSERT INTO `copy_document_request` (`nome_atto_giudiziario`, `copy_ci`, `copy_cf`, `autentica`, `urgente`, ";
            if(files.doc_aggiuntivo.name != "") {
                query_insert_request = query_insert_request + "`other_doc`, `mimetype_doc_agg`, ";
            }
            query_insert_request = query_insert_request + 
                "`payment`, `oid_user`, `mimetype_copy_ci`, `mimetype_copy_cf`) VALUES (" +
                "'" + fields.nome_atto + "', " + "LOAD_FILE('C:/Users/heero/AppData/Local/Temp/C_I" + path.extname(files.ci.name) + "'), LOAD_FILE('C:/Users/heero/AppData/Local/Temp/C_F" + path.extname(files.cf.name) + "'), " + fields.autentica + ", " + fields.urgente;
            if (files.doc_aggiuntivo.name != "") {
                query_insert_request = query_insert_request + ", LOAD_FILE('C:/Users/heero/AppData/Local/Temp/DOC_AGG" + path.extname(files.doc_aggiuntivo.name) + "'), '" + files.doc_aggiuntivo.type + "'";
            }
            query_insert_request = query_insert_request + ", FALSE, '" + req.session.user.oid + "', '" + files.ci.type + "', '" + files.cf.type + "')";

            var con = mysql.createConnection(database_parameters);
            con.connect(function (err) {
                if (err) throw err;
                con.query(query_insert_request, function (err, result, fields) {
                    if (err) throw err;
                    else {
                        console.log("Inserted new request successfully");
                        res.status(200);
                        res.redirect('/home_page_portal');
                    }
                    con.end();
                });
            });
        });
    }
});

router.post('/pay_copy_document_request', (req, res, next) => {
    if (!req.session.user) return next();
    else {
        var id_copy_request = req.body.copy_document_request_id;
        var start_page;
        var finish_page;
        if (req.body.num_pages == req.body.total_pages){
            start_page = 1;
            finish_page = req.body.total_pages;
        }
        else {
            start_page = req.body.start_page;
            finish_page = req.body.finish_page;
        }
        var num_pagine = finish_page - start_page + 1;

        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            con.query("SELECT autentica, urgente FROM copy_document_request WHERE copy_document_request.oid=" + id_copy_request, function(err, data_extracted, fields){
                if (err) throw err;

                var column_price = "";
                if (data_extracted[0].autentica == 1) {
                    if (data_extracted[0].urgente == 1) column_price = "autentica_urgente";
                    else column_price = "autentica_nonurgente";
                } else {
                    if (data_extracted[0].urgente == 1) column_price = "nonautentica_urgente";
                    else column_price = "nonautentica_nonurgente";
                }
                con.query("SELECT p." + column_price + " AS prezzo FROM `prices_copy_document`AS p WHERE `range_min`<=" + num_pagine + " AND " + num_pagine + "<=`range_max`"
                , function (err, result, fields) {
                    if (err) throw err;
                    var prezzo_per_pagina = result[0].prezzo;
                    var totale_costo = prezzo_per_pagina * num_pagine * parseInt(req.body.num_copies);
                    con.query("UPDATE `copy_document_request` SET " +
                    "`status_request`='ATTESA PRESA IN CARICO', " + 
                    "`payment`=1, `prezzo_totale`=" + totale_costo + ", " +
                    "`pag_inizio`=" + start_page + ", " + "`pag_fine`=" + finish_page + ", `num_copie`=" + req.body.num_copies +
                    " WHERE copy_document_request.oid=" + id_copy_request, function (err, data_extracted, fields) {
                        if (err) throw err;
                        res.status(200);
                        res.end();
                    })
                })
            })
        })
    }
})

router.get('/edit_prices_copy_document', (req, res, next) => {
    if (!req.session.user || req.session.user.type_user != court_stuff) return next(); //only the stuff can do this
    else {
        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            var query_update = "SELECT * FROM `prices_copy_document` WHERE 1 ORDER BY `prices_copy_document`.`range_min` ASC";

            con.query(query_update, function (err, result, fields) {
                if (err) throw err;
                con.end();
                res.render('Edit_prices_copy_document.ejs', {rows_prices: result});
            })
        })
    }
})

router.post('/edit_prices_copy_document', (req, res, next) => {
    if (!req.session.user || req.session.user.type_user != court_stuff) return next(); //only the stuff can do this
    else {
        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;

            var query = "";

            if(req.body.delete_price != undefined){
                query = "DELETE FROM `prices_copy_document` WHERE `prices_copy_document`.`oid`=" + req.body.oid;
            } else {
                query = "UPDATE `prices_copy_document`AS p" +
                " SET `" + req.body.type + "`=" + req.body.new_price + 
                " WHERE p.oid=" + req.body.oid;
            }

            con.query(query, function (err, result, fields) {
                if (err) throw err;
                con.end();
                res.status(200).end();
            })
        })
    }
})

router.post('/add_prices_copy_document', (req, res, next) => {
    if (!req.session.user || req.session.user.type_user != court_stuff) return next(); //only the stuff can do this
    else {
        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;

            var query = "INSERT INTO `prices_copy_document`" + 
                "(`range_min`, `range_max`, `autentica_urgente`, `autentica_nonurgente`, `nonautentica_urgente`, `nonautentica_nonurgente`) VALUES " + 
                "(" + req.body.range_min + "," + req.body.range_max + "," + req.body.autentica_urgente + "," + req.body.autentica_nonurgente + "," + req.body.nonautentica_urgente + "," + req.body.nonautentica_nonurgente + ")";

            con.query(query, function (err, result, fields) {
                if (err) throw err;
                con.end();
                res.status(200).end();
            })
        })
    }
})
function insertCertificateProcedureFallimenti(req, res, files, fields){
    var con = mysql.createConnection(database_parameters);
    con.connect(function (err) {
        if (err) throw err;

        //var path_ci = path.join(__dirname) + "/../private/data_certificates/" + files.ci.name;
        var path_ci = path.dirname(files.ci.path) + "\\" + "C_I" + path.extname(files.ci.name);
        fs.renameSync(files.ci.path, path_ci);

        var path_cf = path.dirname(files.cf.path) + "\\" + "C_F" + path.extname(files.cf.name);
        fs.renameSync(files.cf.path, path_cf);

        var query_insert_request = "INSERT INTO certificates_request (oid_type_certificate, oid_user, copy_ci, copy_cf, reason_request, payment, company, mimetype_copy_ci, mimetype_copy_cf) VALUES (" +
            "'" + fields.type_certificate + "', '" + req.session.user.oid + "', LOAD_FILE('C:/Users/heero/AppData/Local/Temp/C_I" + path.extname(files.ci.name) + "'), LOAD_FILE('C:/Users/heero/AppData/Local/Temp/C_F" + path.extname(files.cf.name) + "'), '" +
            myutils.parseTextInsertSql(fields.uso) + "', TRUE, '" + myutils.parseTextInsertSql(fields.ditta) + "', '" + files.ci.type + "', '" + files.cf.type + "')";
        con.query(query_insert_request, function (err, result, fields) {
            if (err) throw err;
            else {
                console.log("Inserted new request successfully");
                res.status(200);
                res.redirect('/home_page_portal');
            }
            con.end();
        });
    });
}

function insertCertificateEsecuzioniMobiliariImmobiliari(req, res, files, fields){
    var con = mysql.createConnection(database_parameters);
    con.connect(function (err) {
        if (err) throw err;

        //var path_ci = path.join(__dirname) + "/../private/data_certificates/" + files.ci.name;
        var path_ci = path.dirname(files.ci.path) + "\\" + "C_I" + path.extname(files.ci.name);
        fs.renameSync(files.ci.path, path_ci);

        var path_cf = path.dirname(files.cf.path) + "\\" + "C_F" + path.extname(files.cf.name);
        fs.renameSync(files.cf.path, path_cf);

        var query_insert_request = "INSERT INTO certificates_request (oid_type_certificate, oid_user, copy_ci, copy_cf, reason_request, payment, bene, mimetype_copy_ci, mimetype_copy_cf) VALUES (" +
            "'" + fields.type_certificate + "', '" + req.session.user.oid + "', LOAD_FILE('C:/Users/heero/AppData/Local/Temp/C_I" + path.extname(files.ci.name) + "'), LOAD_FILE('C:/Users/heero/AppData/Local/Temp/C_F" + path.extname(files.cf.name) + "'), '" +
            myutils.parseTextInsertSql(fields.uso) + "', TRUE, '" + myutils.parseTextInsertSql(fields.bene) + "', '" + files.ci.type + "', '" + files.cf.type + "')";
        con.query(query_insert_request, function (err, result, fields) {
            if (err) throw err;
            else {
                console.log("Inserted new request successfully");
                res.status(200);
                res.redirect('/home_page_portal');
            }
            con.end();
        });
    })
}

function sendPageNewRequest(req, res){
    var con = mysql.createConnection(database_parameters);
    con.connect(function (err) {
        if (err) throw err;
        con.query("SELECT * FROM type_certificates", function (err, result, fields) {
            if (err) throw err;
            con.end();
            res.render('CertificatesRequest.ejs', { certificates: result });
        })
    });
}

function sendPageAllCertificates(req, res, dataUser){
    switch (dataUser.type_user) {
        case citizen: {
            var con = mysql.createConnection(database_parameters);
            con.connect(function (err) {
                if (err) throw err;
                con.query("SELECT t.date_request, t.oid, t.status_request, t.payment, p.abbreviation_name, r.nome, r.cognome, r.oid AS user_id " + 
                          "FROM `certificates_request` AS t " + 
                          "JOIN user AS r ON t.oid_user = r.oid JOIN type_certificates AS p ON t.oid_type_certificate = p.oid " +
                          "WHERE r.oid = " + dataUser.oid + " " +
                          "ORDER BY t.status_request DESC, t.date_request DESC"
                    , function (err, result, fields) {
                        if (err) throw err;
                        con.end();
                        res.render('AllCertificates.ejs', { certificates: result, citizen: true });
                });
            });
            break;
        }
        case court_stuff: {
            var con = mysql.createConnection(database_parameters);
            con.connect(function (err) {
                if (err) throw err;
                con.query("SELECT t.date_request, t.oid, t.status_request, t.payment, p.abbreviation_name, r.nome, r.cognome, r.oid AS user_id " +
                            "FROM `certificates_request` AS t " + 
                            "JOIN user AS r ON t.oid_user = r.oid JOIN type_certificates AS p ON t.oid_type_certificate = p.oid " + 
                            "ORDER BY t.status_request DESC, t.date_request DESC"
                    , function (err, result, fields) {
                        if (err) throw err;
                        con.end();
                        res.render('AllCertificates.ejs', { certificates: result, citizen: false});
                });
            });
            break;
        }
    }
}

function sendPageAllRequestCopy(req, res, dataUser) {
    switch (dataUser.type_user) {
        case citizen: {
            var con = mysql.createConnection(database_parameters);
            con.connect(function (err) {
                if (err) throw err;
                con.query("SELECT t.data, t.oid, t.nome_atto_giudiziario, t.status_request, t.payment, r.nome, r.cognome, r.oid AS user_id " +
                    "FROM `copy_document_request` AS t " +
                    "JOIN user AS r ON t.oid_user = r.oid " +
                    "WHERE r.oid = " + dataUser.oid + " " +
                    "ORDER BY t.status_request DESC, t.data DESC"
                    , function (err, result, fields) {
                        if (err) throw err;
                        con.end();
                        res.render('AllRequestCopy.ejs', { copy_document_request: result, citizen: true });
                    });
            });
            break;
        }
        case court_stuff: {
            var con = mysql.createConnection(database_parameters);
            con.connect(function (err) {
                if (err) throw err;
                con.query("SELECT t.data, t.oid, t.nome_atto_giudiziario, t.status_request, t.payment, r.nome, r.cognome, r.oid AS user_id " +
                    "FROM `copy_document_request` AS t " +
                    "JOIN user AS r ON t.oid_user = r.oid " +
                    "ORDER BY t.status_request DESC, t.data DESC"
                    , function (err, result, fields) {
                        if (err) throw err;
                        con.end();
                        res.render('AllRequestCopy.ejs', { copy_document_request: result, citizen: false });
                    });
            });
            break;
        }
    }
}

function prezzoPagine(num_pagine, urgente, autentica){
    con.connect(function (err) {
        if (err) throw err;
        con.query("SELECT `prezzo` FROM `prices_copy_document` WHERE `autentica`=" + autentica + " AND `urgente`=" + urgente + " AND `range_min`<=" + num_pagine +" AND " + num_pagine +"<=`range_max`"
            , function (err, result, fields) {
            if (err) throw err;
            return result[0].prezzo;
        })
    })
}

module.exports = router;