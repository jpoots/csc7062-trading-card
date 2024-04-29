const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const validator = require("email-validator"); // https://www.npmjs.com/package/email-validator
const db = require("../serverfuncs/db");
const admin = require("../middleware/admin");
const createError = require("http-errors");


router.post("/authenticate", [admin], async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.pass;
    const loginQ = `SELECT * FROM user WHERE email_address = ?`;


    try {
        if (!email || !password) throw new createError.BadRequest();

        let user = await db.promise().query(loginQ, [email]);
        user = user[0];
    
        if (user.length !== 1) throw new createError.Unauthorized();

        // https://www.npmjs.com/package/bcrypt?activeTab=readme
        const match = await bcrypt.compare(password, user[0].password_hash);

        if (!match) throw new createError.Unauthorized();

        res.json({
            status: 200,
            message: "success",
            response: {
                id: user[0].user_id
            }
        });

    } catch (err) {
        next(err);
    }
});

router.post("/register", [admin] , async (req, res, next) => {
    const saltRounds = 5;

    let email = req.body.email;
    let display = req.body.displayname;

    // https://www.w3resource.com/javascript/form/password-validation.php
    const expression = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
    const password = req.body.password;
    const confirmPassword = req.body.confirmpassword;
    const avatarURL = `https://ui-avatars.com/api/?name=${display}`;

    try {
        if (!display || !email || !password || !confirmPassword || 
            display.trim().length === 0 || email.trim().length === 0 || password.trim().length === 0 || confirmPassword.trim().length === 0) throw new createError(400, "Enter all fields");

        email = email.trim();
        if (!validator.validate(email) || email.length > 254) throw new createError(400,"Invalid email");

        display = display.trim();
        if (display.length > 15) throw new createError(400,"Invalid display name");

        if (password !== confirmPassword) throw new createError(400,"Passwords do not match");
        if (!password.match(expression)) throw new createError(400, "Invalid password");
       
        let emailSearch = `SELECT * FROM user WHERE email_address = ?`;
        let displaySearch = `SELECT * FROM user WHERE display_name = ?`;

        let insert = `INSERT INTO user (email_address, password_hash, display_name, avatar_url) VALUES (?, ?, ?, ?)`;
    
        let emailUser = await db.promise().query(emailSearch, [email]);
        emailUser = emailUser[0];

        let displayUser = await db.promise().query(displaySearch, [display]);
        displayUser = displayUser[0];
    
        if (emailUser.length != 0) throw new createError(400,"Email in use");
        if (displayUser.length != 0) throw new createError(400,"Display name in use");

        let hash = await bcrypt.hash(password, saltRounds);
        let insertResult = await db.promise().query(insert, [email, hash, display, avatarURL]);

        res.json({
            status: 200,
            message: "registered successfully",
            response: insertResult[0].insertId
        });
        
    } catch (err) {
        next(err);
    }

});

router.get("/users/:userid", [admin], async (req, res, next) => {
    let userID = req.params.userid;

    const accountQ = "SELECT * FROM user WHERE user_id = ?";

    try {
        if (!parseInt(userID)) throw new createError.BadRequest();

        let userData = await db.promise().query(accountQ, [userID]);
        if (userData[0].length !== 1) throw new createError.NotFound();

        userData = userData[0][0];
        res.json({
            status: 200,
            message: "success",
            response: userData
        });
    } catch (err) {
        next(err);
    }
});

router.put("/users/:userid/details", async (req, res, next) => {
    let userID = req.params.userid;
    let email = req.body.email;
    let display = req.body.displayname;
    const avatarURL = `https://ui-avatars.com/api/?name=${display}`;

    let updateQ = `UPDATE user SET email_address = ?, display_name = ?, avatar_url = ? WHERE user_id = ?`;
    let userQ = `SELECT * FROM user WHERE user_id = ?`;

    try {
        if (!parseInt(userID)) throw new createError.BadRequest();
        let user = await db.promise().query(userQ, [userID]);
        if (user[0].length === 0) throw new createError.NotFound();

        if (!display || !email || display.trim().length === 0 || email.trim().length === 0) throw new createError(400, "Enter all fields");

        email = email.trim();
        if (!validator.validate(email) || email.length > 254) throw new createError(400,"Invalid email");

        display = display.trim();
        if (display.length > 15) throw new createError(400,"Invalid display name");

        let emailSearch = `SELECT * FROM user WHERE email_address = ?`;
        let displaySearch = `SELECT * FROM user WHERE display_name = ?`;

        let emailUser = await db.promise().query(emailSearch, [email]);
        emailUser = emailUser[0];

        let displayUser = await db.promise().query(displaySearch, [display]);
        displayUser = displayUser[0];

        if (emailUser.length != 0 && emailUser[0].user_id != userID) throw new createError(400,"Email in use");
        if (displayUser.length != 0 && displayUser[0].user_id != userID) throw new createError(400,"Display name in use");

        let updateResult = await db.promise().query(updateQ, [email, display, avatarURL, userID]);

        res.json({
            status: 200,
            message: "success",
        });
        
    } catch (err) {
        console.log(err)
        next(err);
    }

});

router.put("/users/:userid/password", async (req, res, next) => {
    let password = req.body.password;
    let confirmPassword = req.body.confirmpassword;
    let userID = req.params.userid;
    const saltRounds = 5;

    let userQ = "SELECT * FROM user WHERE user_id = ?";
    let changeQ = `UPDATE user SET password_hash = ? WHERE user_id = ?;`
    const expression = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

    try {
        if (!parseInt(userID) || !confirmPassword || !password || password.trim().length === 0 || confirmPassword.trim().length === 0) throw new createError(400, "Enter all fields");
        if (password !== confirmPassword) throw new createError(400, "Passwords don't match");
        if (!password.match(expression)) throw new createError(400, "Invalid password");
c
        let user = await db.promise().query(userQ, [userID]);
        if (user[0].length === 0) throw new createError.NotFound();

        let hash = await bcrypt.hash(password, saltRounds);

        let updateResult = await db.promise().query(changeQ, [hash, userID]);

        res.json({
            status: 200,
            message: "success"
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
