const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.post("/sendmessage", [auth, admin], async (req, res) => {
    let senderID = req.body.senderid;
    let recipientID = req.body.recipientid;
    let cardID = req.body.cardid;
    let subject = req.body.subject;
    let body = req.body.body;

    let messageQ = `
    INSERT INTO message (sender_id, recipient_id, card_id, subject, body)
    VALUES (?, ?, ?, ?, ?);`;

    try {
        let messageResult = await db.promise().query(messageQ, [senderID, recipientID, cardID, subject, body]);
        res.json({
            status: 200,
            message: "success",
        });
    } catch (error){
        res.json({
            status: 400,
            message: "failure"
        });
    }
});

router.get("/messages/:userid", [auth, admin], async (req, res) => {
    let userID = req.params.userid;

    let messageQ = `
    SELECT send.display_name as "sender", rec.display_name as "recipient", subject, body, DATE_FORMAT(time_sent, '%d/%m/%Y') as "date", TIME_FORMAT(time_sent, '%H:%i:%s') as "time", sender_id, recipient_id, card_id
    FROM message
    INNER JOIN user rec
    ON rec.user_id = message.recipient_id
    INNER JOIN user send
    ON send.user_id = message.sender_id
    WHERE recipient_id = ?
    ORDER BY time_sent DESC;`;
    try {
        let messages = await db.promise().query(messageQ, [userID]);
        messages = messages[0];
    
        res.json({
            status: 200,
            message: "success",
            response: messages
        });
    } catch (error) {
        res.json({
            status: 400,
            message: "failure"
        });
    }
});

module.exports = router;