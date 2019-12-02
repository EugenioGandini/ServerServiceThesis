var express = require('express');
var router = express.Router();
var path = require('path');
var mysql = require('mysql');

router.get('/service_certificates_request', (req, res, next) => {
    if (!req.session.user) return next();
    else {
        res.sendFile(path.join(__dirname + '/../private/html/CertificatesRequest.html'));
    }
});

module.exports = router;