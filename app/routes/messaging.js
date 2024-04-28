const express = require("express");
const router = express.Router();
const axios = require("axios");
const querystring = require('querystring');
const util = require("../utility");
const auth = require("../middleware/auth");

router.get("/messages", [auth], async (req, res, next) => {
    let userID = req.session.userid;

    try {
        let messages = await axios.get(`${util.apiAdd}/messages/${userID}`);
        if (messages.data.status != 200) throw new util.SystemError(`${messages.data.status} ${messages.data.message}`);

        messages = messages.data.response;

        res.render("inbox", {messages: messages}); 
    } catch (err) {
        next(err);
    }
});

router.get("/sendmessage", [auth], async (req, res, next) => {
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
        next(err);
    }
});

router.post("/sendmessage", [auth], async (req, res, next) => {
    let senderID = req.session.userid;

    try {
        let card = await axios.get(`${util.apiAdd}/cards/${req.query.cardid}`);
        if (card.data.status != 200) throw new util.SystemError(`${card.data.status} ${card.data.message}`);

        subject = `Trading for ${card.data.response.name}`;

        let body = {
            senderid: senderID,
            recipientid: req.body.recipientid,
            cardid: req.body.cardid,
            subject: req.body.subject,
            body: req.body.body
        };

        body = querystring.stringify(body);
        let messageResult = await axios.post(`${util.apiAdd}/sendmessage`, body);

        if (messageResult.data.status !== 200) throw new util.SystemError(`${messageResult.data.status} ${messageResult.data.message}`);
        res.redirect("/");
    } catch (err) {
        next(err);
    }
});

module.exports = router;