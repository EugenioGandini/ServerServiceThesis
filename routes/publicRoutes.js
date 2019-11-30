var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var mysql = require('mysql');

var database_parameters = {
    host: "localhost",
    user: "funzionario",
    password: "funzionario",
    database: "sito_tribunale_db"
};


//For /login request return the login page
router.get('/login', (req, res, next) =>{
    res.redirect('/html/Login.html');
});

router.post('/do_login', (req,res) => {
    var dataBody = req.body;
    var utente;
  
    var con = mysql.createConnection(database_parameters);
    con.connect(function(err) {
        if (err) throw err;
        con.query("SELECT password FROM user WHERE email='" + dataBody.email + "'", function (err, result, fields) {
            if (err) throw err;
            con.end();
            if (result.length == 0) {
                console.log('User ' + dataBody.email + ' doesn\'t exist.');
                res.status(401).send("Credenziali sbagliate");
                res.end();
            }
            else{
                bcrypt.compare(dataBody.password, result[0].password, function(err, res_password) {
                    if (res_password){
                        console.log('Login done for user: ' + dataBody.email);
                        req.session.user = dataBody.email;
                        res.status(200);
                        res.end();
                    }
                    else {
                        console.log('Password not correct for user: '+ dataBody.email);
                        //wrong password
                        res.status(401).send("Credenziali sbagliate");
                        res.end();
                    }
                });
            }
        }); 
    });
});

module.exports = router;