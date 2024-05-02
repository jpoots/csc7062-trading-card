const express = require("express");
const router = express.Router();
const db = require("../../serverfuncs/db");
const admin = require("../../middleware/admin");
const createError = require("http-errors");

// gets a users collections
router.get("/:userid/collections", async (req, res, next) => {
    let userID = req.params.userid;
    let collectionQ = `SELECT * FROM collection WHERE user_id = ?;`;
    let userQ = 'SELECT * FROM user WHERE user_id = ?';

    try {
        if (!parseInt(userID)) throw new createError.BadRequest();
        let user = await db.promise().query(userQ, [userID]);
        if (user[0].length === 0) throw new createError.NotFound();
    
        let collections = await db.promise().query(collectionQ, [userID]);
    
        res.json({
            status: 200,
            message: "success",
            response: collections[0]
        })
    } catch (err) {
        next(err);
    }
});

// creates a user collection. Takes a collection name
router.post("/:userid/collections", [admin], async (req, res, next) => {
    let userID = req.params.userid;
    let collName = req.body.collname;

    let insertQuery = `INSERT INTO collection (collection_name, user_id) VALUES (?, ?);`

    try {
        if (!parseInt(userID) || !collName || collName.trim().length === 0 || collName.length > 20) throw new createError.BadRequest();

        let insertResult = await db.promise().query(insertQuery, [collName, userID]);

        res.json({
            status: 200,
            message: "success",
            response: {
                id: insertResult[0].insertId
            }
        });
    } catch (err) {
        next(err);
    }
})

// deletes a user collection
router.delete("/:userid/collections/:collid", [admin], async (req, res, next) => {
    let collID = req.params.collid;
    let userID = req.params.userid;

    let collectionQ = `SELECT * FROM collection WHERE user_id = ? AND collection_id = ?;`;
    let deleteCollQ = `DELETE FROM collection WHERE user_id = ? AND collection_id = ?;`;

    try{
        if (!parseInt(collID) || !parseInt(userID)) throw new createError.BadRequest();

        let collection = await db.promise().query(collectionQ, [userID, collID]);
        if (collection[0].length != 1) throw new createError.NotFound();

        let deleteResult = await db.promise().query(deleteCollQ, [userID, collID]);

        res.json({
            status: 200,
            message: "success",
        });
    } catch (err) {
        next(err);
    }
});

// adds a card to a user collection. Takes a card ID
router.post("/:userid/collections/:collid", [admin], async (req, res, next) => {
    let cardID = req.body.cardid;
    let collID = req.params.collid;
    let userID = req.params.userid;

    let collQ = "SELECT * FROM collection WHERE user_id = ? AND collection_id = ?"
    let cardStatusQ = `SELECT * FROM collection_card WHERE collection_id = ? AND card_id = ?`;
    let query = "INSERT INTO collection_card (collection_id, card_id) VALUES (?, ?)";

    try {
        if (!parseInt(cardID) || !parseInt(collID) || !parseInt(userID)) throw new createError.BadRequest();

        let collection = await db.promise().query(collQ, [userID, collID]);
        if (collection[0].length === 0) throw new createError.NotFound();

        let cardStatusResult = await db.promise().query(cardStatusQ, [collID, cardID]);
        if (cardStatusResult[0].length > 0) throw new createError.Conflict();
        
        let queryResult = await db.promise().query(query, [collID, cardID]);

        res.json({
        status: 200,
        message: "success"
        });
    } catch (err) {
        next(err);
    }
});

// removes a card from a users collection
router.delete("/:userid/collections/:collid/card/:cardid", [admin], async (req, res, next) => {
    let collID = req.params.collid;
    let cardID = req.params.cardid;
    let userID = req.params.userid;

    let collectionQ = "SELECT * FROM collection WHERE user_id = ? AND collection_id = ?";
    let cardStatusQ = `SELECT * FROM collection_card WHERE card_id = ? AND collection_id = ?`;
    let query = "DELETE FROM collection_card WHERE collection_id = ? AND card_id = ?;"

    try {
        if (!parseInt(cardID) || !parseInt(collID)) throw new createError.BadRequest();

        let collectionResult = await db.promise().query(collectionQ, [userID, collID])
        if (collectionResult[0].length === 0) throw new createError.NotFound();

        let cardStatusResult = await db.promise().query(cardStatusQ, [cardID, collID]);
        if (cardStatusResult[0].length === 0) throw new createError.NotFound();
    
        let queryResult = await db.promise().query(query, [collID, cardID]);

        res.json({
        status: 200,
        message: "success"
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;