const express = require("express");
const router = express.Router();
const axios = require("axios");
const querystring = require('querystring');
const util = require("../utility");
const auth = require("../middleware/auth");
const unauth = require("../middleware/unauth");

router.get("/login", [unauth], (req, res) => {
    res.render("login");
});

// login
router.post("/login", [unauth], async (req, res, next) => {
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
        next(err);
    }
});

// register
router.get("/register", [unauth], (req, res) => {
    res.render("register");
});

router.post("/register", [unauth], async (req, res, next) => {
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
        
        if(registrationResult.data.status == 400){
            res.render("register", {
                message: registrationResult.data.message
            });
        } else if (registrationResult.data.status != 200) {
            throw new util.SystemError(`${registrationResult.data.status} ${registrationResult.data.message}`);
        } else {
            req.session.userid = registrationResult.data.response;
            res.redirect("/mycards");
        }
    } catch (err){
        next(err);
    }
});

// logout 
router.get("/logout", (req, res) => {
    req.session.userid = null;
    res.redirect("/");
});

router.get("/account", [auth], async (req, res, next) => {
    try {
        let accountResult = await axios.get(`${util.apiAdd}/user/${req.session.userid}`);

        if (accountResult.data.status != 200) util.SystemError(`${accountResult.data.status} ${accountResult.data.message}`);

        let userData = accountResult.data.response;

        res.render("account", {
            email: userData.email_address,
            displayName: userData.display_name,
            avatar: userData.avatar_url
        });
        
    } catch (err) {
        next(err);
    }
});

router.post("/account", [auth], async (req, res, next) => {
    let userID = req.session.userid;

    let body = {
        email: req.body.email,
        displayname: req.body.displayname,
    };

    try {
        body = querystring.stringify(body);
        let updateResult = await axios.put(`${util.apiAdd}/user/${userID}/details`, body);

        let userData = await axios.get(`${util.apiAdd}/user/${userID}`);
        if (userData.data.status != 200) throw new util.SystemError(`${userData.data.status} ${userData.data.message}`);

        userData = userData.data.response;

        if(updateResult.data.status == 400){
            res.render("account", {
                email: userData.email_address,
                displayName: userData.display_name,
                avatar: userData.avatar_url,
                message:updateResult.data.message
            });
        } else if (updateResult.data.status != 200) {
            throw new util.SystemError(`${updateResult.data.status} ${updateResult.data.message}`);
        } else {
            res.render("account", {
                email: userData.email_address,
                displayName: userData.display_name,
                avatar: userData.avatar_url,
                message: "Success!"
            });
        }
    } catch (err){
        next(err);
    }
});

router.post("/changepassword", [auth], async (req, res, next) => {
    let userID = req.session.userid;

    try {
        let userData = await axios.get(`${util.apiAdd}/user/${userID}`);
        if (userData.data.status !== 200) throw new util.SystemError(`${userData.data.status} ${userData.data.message}`);

        userData = userData.data.response;

        let credentials = {
            email: userData.email_address,
            pass: req.body.currentpassword
        };
    
        /* https://axios-http.com/docs/urlencoded */
        credentials = querystring.stringify(credentials);
        let authenticateResult = await axios.post(`${util.apiAdd}/authenticate`, credentials);
        if (authenticateResult.data.status === 401){
            res.render("account", {
                email: userData.email_address,
                displayName: userData.display_name,
                avatar: userData.avatar_url,
                message: "Incorrect password"
            });
        } else {
            if (authenticateResult.data.status != 200) throw new util.SystemError(`${authenticateResult.data.status} ${authenticateResult.data.message}`);

            let updateBody = {
                password: req.body.password,
                confirmpassword: req.body.confirmpassword
            };

            /* https://axios-http.com/docs/urlencoded */
            updateBody = querystring.stringify(updateBody);
            let updateResult = await axios.put(`${util.apiAdd}/user/${userID}/password`, updateBody);

            if (updateResult.data.status === 400) {
                res.render("account", {
                    email: userData.email_address,
                    displayName: userData.display_name,
                    avatar: userData.avatar_url,
                    message: updateResult.data.message
                });
            } else {
                if (updateResult.data.status != 200) throw new util.SystemError(`${updateResult.data.status} ${updateResult.data.message}`);
    
                res.render("account", {
                    email: userData.email_address,
                    displayName: userData.display_name,
                    avatar: userData.avatar_url,
                    message: "Success!"
                });
            }
        }
    } catch (err) {
        next(err);
    }
});

module.exports = router;