var express = require('express');
var router = express.Router();

//For /login request return the login page
router.use('/login', (req, res, next) =>{
    res.redirect('/html/Login.html');
});

module.exports = router;