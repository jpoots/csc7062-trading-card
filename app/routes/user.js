const express = require("express");
const router = express.Router();
const dotenv = require("dotenv"); // https://www.npmjs.com/package/dotenv#-install
const axios = require("axios");
const querystring = require('querystring');

/* https://stackoverflow.com/questions/69879425/setting-dotenv-path-outside-of-root-directory-is-not-working */
dotenv.config({ path: "../.env" })
const API_ADD = process.env.API_ADDRESS;

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
    
        let authenticateResult = await axios.post(`${API_ADD}/authenticate`, credentials);
        
        if (authenticateResult.data.status === 200){
            req.session.userid = authenticateResult.data.response;
            res.redirect("/mycards")
        } else {
            res.render("login", {
                message: authenticateResult.data.message
            });
        }
    } catch (err) {
        res.render("error");
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

        let registrationResult = await axios.post(`${API_ADD}/register`, body, formConfig);
        
        if(registrationResult.data.status != 200){
            res.render("register", {
                message: registrationResult.data.message
            });
        } else {
            req.session.userid = registrationResult.data.response;
            res.redirect("/mycards");
        }
    } catch (error){
        res.render("error");
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
            let accountResult = await axios.get(`${API_ADD}/user/${req.session.userid}`);

            if (accountResult.data.status != 200){
                throw new Error("issue with request")
            } else {
                let userData = accountResult.data.response;
    
                res.render("account", {
                    email: userData.email_address,
                    displayName: userData.display_name,
                    avatar: userData.avatar_url
                });
            }
        } catch (error) {
            res.render("error");
        }
    }
});

module.exports = router;