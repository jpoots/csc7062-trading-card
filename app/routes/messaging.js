const express = require("express");
const router = express.Router();
const axios = require("axios");
const querystring = require('querystring');
const util = require("../utility");

router.get("/messages", async (req, res) => {
    let userID = req.session.userid;

    if (userID){
        try {
            let messages = await axios.get(`${util.apiAdd}/messages/${userID}`);
            if (messages.data.status != 200) throw new util.SystemError(`${messages.data.status} ${messages.data.message}`);

            messages = messages.data.response;
    
            res.render("inbox", {messages: messages}); 
        } catch (err) {
            util.errorHandler(err, res);
        }
    } else {
        res.redirect("/login");
    }
});

router.get("/sendmessage", async (req, res) => {
    let userID = req.session.userid;

    if (userID){
        try {
            let recipient = await axios.get(`${util.apiAdd}/user/${req.query.recipientid}`);
            if (recipient.data.status != 200) throw new util.SystemError(`${response.data.status} ${response.data.message}`);
            recipient = recipient.data.response;

            let card = await axios.get(`${util.apiAdd}/cards/${req.query.cardid}`);
            if (card.data.status != 200) throw new util.SystemError(`${card.data.status} ${card.data.message}`);
            card = card.data.response;
            
            res.render("sendmessage", {
                recipient: recipient,
                card: card
            })
        } catch (err) {
            util.errorHandler(err, res);
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
            let messageResult = await axios.post(`${util.apiAdd}/sendmessage`, body);

            if (messageResult.data.status !== 200) throw new util.SystemError(`${messageResult.data.status} ${messageResult.data.message}`);
            res.redirect("/");
        } catch (err) {
            util.errorHandler(err, res);
        }

    } else {
        res.redirect("/login");
    }
});

module.exports = router;