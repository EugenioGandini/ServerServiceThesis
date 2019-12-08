var express = require('express');
var router = express.Router();
var path = require('path');
var mysql = require('mysql');
var formidable = require('formidable');
var fs = require('fs');

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

router.get('/get_document_certificate_request', (req, res, next) => {
    if (!req.session.user) return next();
    else {
        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            con.query("SELECT c." + req.query.type + ", c.mimetype_" + req.query.type + " AS type_mime FROM certificates_request AS c WHERE c.oid=" + req.query.certificate_request_id, function (err, result, fields) {
                if (err) throw err;
                con.end();

                var buffer_data = "";result[0].copy_ci;
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

router.get('/get_file', (req, res, next) => {
    if (!req.session.user) next();
    else {
        
    }
})

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
            fields.uso + "', TRUE, '" + fields.ditta + "', '" + files.ci.type + "', '" + files.cf.type + "')";
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
            fields.uso + "', TRUE, '" + fields.bene + "', '" + files.ci.type + "', '" + files.cf.type + "')";
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
            var oid_cert = req.query.oid;
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

module.exports = router;