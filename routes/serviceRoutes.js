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

//Get the page for requesting a certificate.
router.get('/service_certificates_request', (req, res, next) => {
    if (!req.session.user) return next();
    else {
        var userData = req.session.user;
        switch (userData.oid_group){
            case 1: {
                sendPageNewRequest(req, res);  // for the citizen
                break;
            }
            case 2: {
                sendPageRequestOffice(req, res);  // for the officer
                break;
            }
            case 3: {
                break;
            }
        }
    }
});

//Send the form of the certificate request to the user.
router.post('/obtain_form_certificate', (req, res, next) => {
    if (!req.session.user) return next();
    else {
        var type = req.body.typecertificate;
        
        if(type == 1) {
            res.render('CertificatoAssenzaPendenzaDiProcedureFallimentari.ejs', {});
        }
        else res.end();
    }
});

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
                    insertCertificateEsecuzioniMobiliariImmobiliari();
                    break;
                }
                case 3: {
                    insertCertificateEsecuzioniMobiliariImmobiliari();
                    break;
                }
            }
            
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

        var query_insert_request = "INSERT INTO certificates_request (oid_type_certificate, oid_user, copy_ci, copy_cf, reason_request, payment, company) VALUES (" +
            "'" + fields.type_certificate + "', '" + req.session.user.oid + "', LOAD_FILE('C:/Users/heero/AppData/Local/Temp/C_I" + path.extname(files.ci.name) + "'), LOAD_FILE('C:/Users/heero/AppData/Local/Temp/C_F" + path.extname(files.cf.name) + "'), '" +
            fields.uso + "', TRUE, '" + fields.ditta + "')";
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

function insertCertificateEsecuzioniMobiliariImmobiliari(){

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

function sendPageRequestOffice(req, res){
    var oid_cert = req.query.oid;
    if (oid_cert == undefined) {
        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            con.query("SELECT * FROM request_certificate", function (err, result, fields) {
                if (err) throw err;
                con.end();
            })
        });
    }
    else {
        var con = mysql.createConnection(database_parameters);
        con.connect(function (err) {
            if (err) throw err;
            con.query("SELECT * FROM request_certificate " +
                "INNER JOIN type_certificates ON certificates_request.oid_type_certificate=type_certificates.oid " +
                "WHERE request_certificate.oid='" + oid_cert + "'", function (err, result, fields) {
                    if (err) throw err;
                    con.end();
                })
        });
    }
}

module.exports = router;