const express = require("express");
const router = express.Router();
const dotenv = require("dotenv"); // https://www.npmjs.com/package/dotenv#-install
const axios = require("axios");
const querystring = require('querystring');

/* https://stackoverflow.com/questions/69879425/setting-dotenv-path-outside-of-root-directory-is-not-working */
dotenv.config({ path: "../.env" })
const API_ADD = process.env.API_ADDRESS;


router.get("/messages", async (req, res) => {
    let userID = req.session.userid;

    if (userID){
        try {
            let messages = await axios.get(`${API_ADD}/messages/${userID}`);
            messages = messages.data.response;
    
            res.render("inbox", {messages: messages}); 
        } catch (error) {
            res.render("error");
        }
    } else {
        res.redirect("/login");
    }
});

router.get("/sendmessage", async (req, res) => {
    let userID = req.session.userid;

    if (userID){
        try {
            let recipient = await axios.get(`${API_ADD}/user/${req.query.recipientid}`);
            if (recipient.data.status != 200) throw new Error(response.data.message);
            recipient = recipient.data.response;

            let card = await axios.get(`${API_ADD}/cards/${req.query.cardid}`);
            if (card.data.status != 200) throw new Error(card.data.message);
            card = card.data.response;
            
            res.render("sendmessage", {
                recipient: recipient,
                card: card
            })
        } catch (error) {
            res.render("error");
        }

    } else {
        res.redirect("/login");
    }
});

router.post("/sendmessage", async (req, res) => {
    let senderID = req.session.userid;

    if (senderID){        
        let body = {
            senderid: senderID,
            recipientid: req.body.recipientid,
            cardid: req.body.cardid,
            subject: req.body.subject,
            body: req.body.body
        };

        try {
            body = querystring.stringify(body);
            let messageResult = await axios.post(`${API_ADD}/sendmessage`, body);
            if (messageResult.data.status !== 200) throw new Error(messageResult.data.message);
            res.redirect("/");
        } catch (error) {
            res.render("error");
        }

    } else {
        res.redirect("/login");
    }
});

module.exports = router;