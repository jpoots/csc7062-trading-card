const express = require("express");
const router = express.Router();
const db = require("../../serverfuncs/db");
const admin = require("../../middleware/admin");
const createError = require("http-errors");

// gets all mail in a users inbox
router.get("/:userid/inbox", [admin], async (req, res, next) => {
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
        if (!parseInt(userID)) throw createError.BadRequest();

        let messages = await db.promise().query(messageQ, [userID]);
        messages = messages[0];
    
        res.json({
            status: 200,
            message: "success",
            response: messages
        });
    } catch (err) {
        next(err);
    }
});

// sends mail. Takes a subject, recipient ID, card ID, and a body
router.post("/:userid/outbox", [admin], async (req, res, next) => {
    let senderID = req.params.userid;
    let recipientID = req.body.recipientid;
    let cardID = req.body.cardid;
    let subject = req.body.subject;
    let body = req.body.body;

    let messageQ = `INSERT INTO message (sender_id, recipient_id, card_id, subject, body) VALUES (?, ?, ?, ?, ?);`;
    let userQ = `SELECT * FROM user WHERE user_id = ?`;
    let cardQ = `SELECT * FROM card WHERE card_id = ?`;

    try {
        // business rules
        if (!parseInt(senderID) || !parseInt(recipientID) || !parseInt(cardID) || !subject || !body || body.trim().length === 0 || subject.trim().length === 0 || body.length > 200 || subject.length > 100) throw new createError.BadRequest();

        let sender = await db.promise().query(userQ, [senderID]);
        if (sender[0].length === 0) throw new createError.NotFound();

        let recipient = await db.promise().query(userQ, [recipientID]);
        if (recipient[0].length === 0) throw new createError.NotFound();

        let card = await db.promise().query(cardQ, [cardID]);
        if (card[0].length === 0) throw new createError.NotFound();

        let messageResult = await db.promise().query(messageQ, [senderID, recipientID, cardID, subject, body]);

        res.json({
            status: 200,
            message: "success",
        });
    } catch (err){
        next(err);
    }
});

// gets a users outbox
router.get("/:userid/outbox", async (req, res, next) => {
    let userID = req.params.userid;

    let messageQ = `
    SELECT send.display_name as "sender", rec.display_name as "recipient", subject, body, DATE_FORMAT(time_sent, '%d/%m/%Y') as "date", TIME_FORMAT(time_sent, '%H:%i:%s') as "time", sender_id, recipient_id, card_id
    FROM message
    INNER JOIN user rec
    ON rec.user_id = message.recipient_id
    INNER JOIN user send
    ON send.user_id = message.sender_id
    WHERE sender_id = ?
    ORDER BY time_sent DESC;`;

    try {
        if (!parseInt(userID)) throw createError.BadRequest();

        let messages = await db.promise().query(messageQ, [userID]);
        messages = messages[0];
    
        res.json({
            status: 200,
            message: "success",
            response: messages
        });
    } catch (err) {
        next(err);
    }
})

module.exports = router;