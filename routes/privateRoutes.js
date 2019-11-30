var express = require('express');
var router = express.Router();

//For /login request return the login page
router.use('/home_page_portal', (req, res, next) =>{
    if (!req.session.user) return next();
    res.render('HomePagePortal.ejs',{});
});

module.exports = router;