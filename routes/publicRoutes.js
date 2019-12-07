var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
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
router.get('/login', (req, res) =>{
    res.redirect('/html/Login.html');
});

//For /login_stuff request return the login page for the court stuff
router.get('/login_stuff', (req, res) => {
    res.redirect('/html/Login_Stuff.html');
});

//For /register redirect to /html/Registration.html
router.get('/register', (req, res) => {
    res.redirect('/html/Registration.html');
});

//This will redirect user to the page to recover the password
router.get('/recover_password', (req,res) => {
    res.redirect('/html/RecoverPassword.html');
});

//Try to login with email and password provided by user
router.post('/do_login', (req,res) => {
    var dataBody = req.body;
  
    var con = mysql.createConnection(database_parameters);
    con.connect(function(err) {
        if (err) throw err;
        con.query("SELECT * FROM user WHERE email = '" + dataBody.email + "'", function (err, result, fields) {
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
                        var user_logged = result[0];
                        user_logged.type_user = citizen;
                        console.log('Login done for user: ' + dataBody.email);
                        req.session.user = user_logged;
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

router.post('/do_login_stuff', (req, res) => {
    var dataBody = req.body;

    var con = mysql.createConnection(database_parameters);
    con.connect(function (err) {
        if (err) throw err;
        con.query("SELECT * FROM court_staff WHERE court_staff.username = '" + dataBody.username + "'", function (err, result, fields) {
            if (err) throw err;
            if (result.length == 0) {
                console.log('User ' + dataBody.username + ' doesn\'t exist.');
                res.status(401).send("Credenziali sbagliate");
                res.end();
                con.end();
            }
            else {
                bcrypt.compare(dataBody.password, result[0].password, function (err, res_password) {
                    if (res_password) {
                        var user_logged = result[0];

                        con.query("SELECT t.groupname FROM `group` " +
                                  "AS t JOIN rel_staff_group AS r ON t.oid=r.oid_group " +
                                  "WHERE r.oid_user_staff=" + user_logged.oid, function (err, result, fields) {
                            if (err) throw err;
                            con.end();
                            user_logged.type_user = result[0].groupname;

                            console.log('Login done for user stuff: ' + dataBody.username);

                            req.session.user = user_logged;
                            res.status(200);
                            res.end();
                        });
                    }
                    else {  
                        con.end();
                        console.log('Password not correct for user: ' + dataBody.username);
                        //wrong password
                        res.status(401).send("Credenziali sbagliate");
                        res.end();
                    }
                });
            }
        });
    });
});

router.post('/do_register', (req, res) => {
    var dataBody = req.body;

    var con = mysql.createConnection(database_parameters);
    con.connect(function (err) {
        if (err) throw err;
        con.query("SELECT * FROM user WHERE codicefiscale='" + dataBody.codice_fiscale + "' OR email='" + dataBody.email + "'", function (err, result, fields) {
            if (err) throw err;
            if (result.length > 0) {
                con.end();
                console.log('User ' + dataBody.email + ' already registered.');
                res.status(401).send("Utente gia registrato");
                res.end();
            }
            else {
                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(dataBody.password, salt, function (err, res_hash) {
                        var new_user = dataBody;
                        new_user.password = res_hash;
                
                        var sql_query = "INSERT INTO user (codicefiscale, password, email, nome, cognome";
                        if (new_user.telefono != '') {
                            sql_query = sql_query + ", telefono";
                        }
                        if (new_user.indirizzo != '') {
                            sql_query = sql_query + ", indirizzo";
                        }
                        if (new_user.ragione_sociale != ''){
                            sql_query = sql_query + ", ragione_sociale";
                        }
                        sql_query = sql_query + ") VALUES ('" + 
                            new_user.codice_fiscale + "', '" + 
                            new_user.password + "', '" + 
                            new_user.email + "', '" + 
                            new_user.nome + "', '" +
                            new_user.cognome + "'";
                        if (new_user.telefono != '') {
                            sql_query = sql_query + ", '" + new_user.telefono + "'";
                        }
                        if (new_user.indirizzo != '') {
                            sql_query = sql_query + ", '" + new_user.indirizzo.replace("'", "\"") + "'";
                        }
                        if (new_user.ragione_sociale != '') {
                            sql_query = sql_query + ", '" + new_user.ragione_sociale + "'";
                        }    
                        sql_query = sql_query + ")";

                        con.query(sql_query, function (err, result) {
                            if (err) throw err;
                            console.log("1 new user registered!");
                        });

                        con.query("SELECT * FROM user WHERE codicefiscale='" + new_user.codice_fiscale + "'", function(err, result){
                            if (err) throw err;
                            var user_registered = result[0];
                            user_registered.type_user = "Cittadino";
                            req.session.user = user_registered;
                            res.status(200);
                            res.end();
                        });
                    });
                });
            }
        })
    });
});

module.exports = router;