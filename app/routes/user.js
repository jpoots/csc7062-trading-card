const express = require("express");
const router = express.Router();
const axios = require("axios");
const querystring = require('querystring');
const util = require("../utility");

router.get("/login", (req, res) => {
    res.render("login");
});

// login
router.post("/login", async (req, res) => {
    let credentials = {
        email: req.body.email,
        pass: req.body.pass
    };

    try {
        /* https://axios-http.com/docs/urlencoded */
        credentials = querystring.stringify(credentials);
    
        let authenticateResult = await axios.post(`${util.apiAdd}/authenticate`, credentials);

        if (authenticateResult.data.status === 200){
            req.session.userid = authenticateResult.data.response.id;
            res.redirect("/mycards")
        } else if (authenticateResult.data.status === 401) {
            res.render("login", {
                message: "Invalid username or password"
            });
        } else {
            throw new utility.error(`${authenticateResult.data.status} ${authenticateResult.data.message}`);
        }
    } catch (err) {
        util.errorHandler(err, res);
    }
});

// register
router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", async (req, res) => {
    // https://www.npmjs.com/package/bcrypt?activeTab=readme
    const email = req.body.email;
    const display = req.body.displayname
    const password = req.body.password;
    const confirmPassword = req.body.confirmpassword;

    let body = {
        email: req.body.email,
        displayname: req.body.displayname,
        password: req.body.password,
        confirmpassword: req.body.confirmpassword
    };

    try{
        body = querystring.stringify(body);

        let registrationResult = await axios.post(`${util.apiAdd}/register`, body);
        if (registrationResult.data.status === 200) throw new util.SystemError(`${registrationResult.data.status} ${registrationResult.data.message}`);
        
        if(registrationResult.data.status != 200){
            res.render("register", {
                message: registrationResult.data.message
            });
        } else {
            req.session.userid = registrationResult.data.response;
            res.redirect("/mycards");
        }
    } catch (err){
        util.errorHandler(err, res);
    }
});

// logout 
router.get("/logout", (req, res) => {
    req.session.userid = null;
    res.redirect("/");
});

router.get("/account", async (req, res) => {
    if (!req.session.userid){
        res.redirect("/login");
    } else {
        try {
            let accountResult = await axios.get(`${util.apiAdd}/user/${req.session.userid}`);

            if (accountResult.data.status != 200) {
                res.render("error", {
                    status: accountResult.data.status,
                    message: accountResult.data.message
                })
            } else {
                let userData = accountResult.data.response;
    
                res.render("account", {
                    email: userData.email_address,
                    displayName: userData.display_name,
                    avatar: userData.avatar_url
                });
            }
        } catch (err) {
            util.errorHandler(err, res);
        }
    }
});

module.exports = router;