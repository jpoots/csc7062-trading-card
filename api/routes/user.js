const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const validator = require("email-validator"); // https://www.npmjs.com/package/email-validator
const db = require("../db");

router.post("/authenticate", async (req, res) => {
    const email = req.body.email;
    const password = req.body.pass;
    const loginQ = `SELECT * FROM user WHERE email_address = ?`;

    try {
        let user = await db.promise().query(loginQ, [email]);
        user = user[0];
    
        if (user.length === 1){
            // https://www.npmjs.com/package/bcrypt?activeTab=readme
            const match = await bcrypt.compare(password, user[0].password_hash);
            if (match) {
                res.json({
                    status: 200,
                    message: "authenticated",
                    response: user[0].user_id
                });
                return;
            }
        }

        res.json({
            status: 401,
            message: "Issue with username or password"
        });

    } catch (err) {
        res.json({
            status: 400,
            message: "Issue logging in"
        });
    }
});

router.post("/register", async (req, res) => {
    const saltRounds = 5;

    let email = req.body.email;
    let display = req.body.displayname;
    const password = req.body.password;
    const confirmPassword = req.body.confirmpassword;
    const avatarURL = `https://ui-avatars.com/api/?name=${display}`;

    let message = "";

    try {
        if (!display || !email || !password || !confirmPassword || display.trim().length === 0 || email.trim().length === 0 || password.trim().length === 0 || confirmPassword.trim().length === 0){
            message = "Enter all fields";
        } else if (!validator.validate(email)){
            message = "Invalid email";
        } else if (password !== confirmPassword){
            message = "Passwords do not match";
        } else {
            display = display.trim();
            email = email.trim();
    
            let emailSearch = `SELECT * FROM user WHERE email_address = ?`;
            let displaySearch = `SELECT * FROM user WHERE display_name = ?`;
    
            let insert = `INSERT INTO user (email_address, password_hash, display_name, avatar_url) VALUES (?, ?, ?, ?)`;
        
            let emailUser = await db.promise().query(emailSearch, [email]);
            emailUser = emailUser[0];
    
            let displayUser = await db.promise().query(displaySearch, [display]);
            displayUser = displayUser[0];
        
            if (emailUser.length != 0){
                message = "Email in use";
            } else if (displayUser.length != 0) {
                message = "Display name in use";
            } else {
                let hash = await bcrypt.hash(password, saltRounds);
                let insertResult = await db.promise().query(insert, [email, hash, display, avatarURL]);
    
                res.json({
                    status: 200,
                    message: "registered successfully",
                    response: insertResult[0].insertId
                });
                return;
            }
        }
    } catch (error) {
        message = "error processing request";
    } finally {
        res.json({
            status: 400,
            message: message
        });
    }

});

router.get("/user/:userid", async (req, res) => {
    let userID = req.params.userid;

    const accountQ = "SELECT * FROM user WHERE user_id = ?";

    try {
        let userData = await db.promise().query(accountQ, [userID]);
        if (userData[0].length === 1){
            userData = userData[0][0];
            res.json({
                status: 200,
                message: "success",
                response: userData
            });
        } else {
            res.json({
                status: 200,
                message: "account not found",
            });
        }
    } catch (error) {
        res.json({
            status: 400,
            message: "error processing request",
        }); 
    }
});

module.exports = router;
