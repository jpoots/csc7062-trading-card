const express = require("express");
const router = express.Router();
const db = require("../db");
const admin = require("../middleware/admin");
const createError = require("http-errors");
const util = require("../utility");

router.get("/collections", async (req, res) => {
    let collectionQ = "";
    let searchName = "";
    let params = [];

    try {

        if (req.query.search) {
            searchName = `${req.query.search}`
            // order by from https://www.codexworld.com/how-to/sort-results-order-by-best-match-using-like-in-mysql/
            collectionQ = `
            SELECT collection.collection_id, collection_name, display_name, avatar_url 
            FROM collection 
            INNER JOIN user
            ON user.user_id = collection.user_id
            WHERE collection_name
            LIKE ?
            ORDER BY
            CASE
                WHEN collection_name LIKE ? THEN 1
                WHEN collection_name LIKE ? THEN 2
                WHEN collection_name LIKE ? THEN 4
                ELSE 3
            END;`;
            params = [`%${searchName}%`, `${searchName}`, `${searchName}%`, `%${searchName}`];
        } else if (req.query.userid) {
            if (!parseInt(req.query.userid)) throw new createError.BadRequest();

            collectionQ = `
            SELECT * FROM collection
            WHERE user_id = ?;`;
            params = req.query.userid;
        } else {
            collectionQ = `
            SELECT collection.collection_id, collection_name, display_name, avatar_url 
            FROM collection 
            INNER JOIN user
            ON user.user_id = collection.user_id;`;
        }

        let collections = await db.promise().query(collectionQ, params);
        collections = collections[0];
    
        res.json({
            status: 200,
            message: "success",
            response: collections
        });
    } catch (err) {
        util.errorHandler(err, res);
    }
});

router.get("/collections/:collid", async (req, res) => {
    let collectionID = req.params.collid;
    let userID = req.query.userid;
    let isOwner = false;
    let rated = false;
    let yourRating = null;
    let ownerID = null;
    let rating = "Unrated"
    let name = "";
    let id = null;
    
    let cardQuery = `
    SELECT card.card_id, name, image_url, COUNT(card_like_id) as "like_count" FROM collection_card
    INNER JOIN card
    ON collection_card.card_id = card.card_id
    LEFT JOIN card_like
    ON card_like.card_id = card.card_id
    WHERE collection_card.collection_id = ?
    GROUP BY card.card_id;`;

    let ownerQuery = `SELECT * FROM collection
    WHERE collection_id = ?;`

    let ratedQ = `
    SELECT * FROM collection_rating
    WHERE collection_id = ?
    AND user_id = ?;
    `;

    let ratingQ = `
    SELECT AVG(rating) FROM collection_rating
    WHERE collection_id = ?;
    `;

    let commentQ = `
    SELECT comment_text, display_name, DATE_FORMAT(time_posted, '%d/%m/%Y') as "date", TIME_FORMAT(time_posted, '%H:%i:%s') as "time"
    FROM collection_comment
    INNER JOIN user
    ON collection_comment.user_id = user.user_id
    WHERE collection_id = ?
    ORDER BY time_posted DESC;`;

    let youRatedQ = `
    SELECT rating FROM collection_rating
    WHERE user_id = ?
    AND collection_id = ?;`;

    try {

        if (!parseInt(collectionID) || (userID && !parseInt(userID))) throw new createError.BadRequest();
        if (userID && !parseInt(userID)) throw new createError.BadRequest();

        let cards = await db.promise().query(cardQuery, [collectionID]);
        cards = cards[0];
    
        let collection = await db.promise().query(ownerQuery, [collectionID]);
        if (collection[0].length === 0) throw new createError.NotFound();

        ownerID = collection[0][0].user_id;
        name = collection[0][0].collection_name;
        id = collection[0][0].collection_id;
        
        if (userID == ownerID) isOwner = true;
    
        let ratedResult = await db.promise().query(ratedQ, [collectionID, userID]);
        if (ratedResult[0].length != 0) rated = true;
    
        let comments = await db.promise().query(commentQ, [collectionID]);
        comments = comments[0];
    
        let youRatedResults = await db.promise().query(youRatedQ, [userID, collectionID]);
    
        if (youRatedResults[0].length > 0) {
            rated = true;
            yourRating = youRatedResults[0][0].rating;
        }
    
        let ratingResult = await db.promise().query(ratingQ, [collectionID]);
        ratingResult = ratingResult[0][0]["AVG(rating)"];
    
        /*https://stackoverflow.com/questions/7342957/how-do-you-round-to-one-decimal-place-in-javascript*/
        if (ratingResult) ratingResult = Math.round(ratingResult * 10) / 10;
    
        let response = {
            id: id,
            name: name, 
            cards: cards,
            isOwner:isOwner,
            ownerID: ownerID,
            rated: rated,
            rating: rating,
            yourRating: yourRating,
            comments: comments,
            yourRating: yourRating
        }
    
        res.json({
            status: 200,
            message: "success",
            response: response
        });
    } catch (err) {
        util.errorHandler(err, res);
    };

});

router.post("/ratecollection", [admin], async (req, res) => {
    let userID = req.body.userid;
    let collID = req.body.collid;
    let rating = req.body.rating;

    let ratingStatus = false;
    let ratingStatusQ = `
    SELECT * FROM collection_rating
    WHERE user_id = ?
    AND collection_id = ?`;

    let collectionQ = `
    SELECT * FROM collection
    WHERE collection_id = ?`;

    try {
        if (!parseInt(userID) || !parseInt(collID) || !parseInt(rating) || rating > 4 || rating < 1) throw new createError.BadRequest();

        let ratingStatusResult = await db.promise().query(ratingStatusQ, [userID, collID]);
        if (ratingStatusResult[0].length === 1) ratingStatus = true;

        let collection = await db.promise().query(collectionQ, collID);

        if(collection[0].length != 1) throw new createError.NotFound();
        
        collection = collection[0][0];
        if(collection.user_id == userID) throw new createError.BadRequest();

        let rateQ = ratingStatus ? "DELETE FROM collection_rating WHERE user_id = ? AND collection_id = ?;" : "INSERT INTO collection_rating (user_id, collection_id, rating) VALUES (?, ?, ?)";
        let ratingResult = await db.promise().query(rateQ, [userID, collID, rating]);

        res.json({
            status: 200,
            message: "success"
        });
    } catch (err) {
        util.errorHandler(err, res);
    }
});

router.post("/commentcollection", [admin], async (req, res) => {
    let collID = req.body.collid;
    let comment = req.body.comment;
    let userID = req.body.userid;

    let commentQ = `
    INSERT INTO collection_comment (comment_text, collection_id, user_id)
    VALUES (?, ?, ?);`;

    try {
        if (!parseInt(collID) || !parseInt(userID) || !comment || comment.trim().length === 0) throw new createError.BadRequest();

        let commentResult = await db.promise().query(commentQ, [comment, collID, userID]);

        res.json({
            status: 200,
            message: "success"
        });
    } catch (err) {
        util.errorHandler(err, res);
    }
});

router.post("/createcoll", [admin], async (req, res) => {
    let userID = req.body.userid;
    let collName = req.body.collname;

    let insertQuery = `INSERT INTO collection (collection_name, user_id) 
    VALUES (?, ?);`

    try {
        if (!parseInt(userID) || !collName || collName.trim().length === 0) throw new createError.BadRequest();

        let insertResult = await db.promise().query(insertQuery, [collName, userID]);

        res.json({
            status: 200,
            message: "success",
            response: {
                id: insertResult[0].insertId
            }
        });
    } catch (err) {
        util.errorHandler(err, res);
    }
})

router.post("/deletecoll", [admin], async (req, res) => {
    let collID = req.body.collid;

    let deleteCollQ = `
    DELETE FROM collection
    WHERE collection_id = ?;
    `;

    let collectionQ = `
    SELECT * FROM collection
    WHERE collection_id = ?;
    `;

    try{
        if (!parseInt(collID)) throw new createError.BadRequest();

        let collection = await db.promise().query(collectionQ, [collID]);

        if (collection[0].length != 1) throw new createError.NotFound();

        let deleteResult = await db.promise().query(deleteCollQ, [collID]);

        res.json({
            status: 200,
            message: "success",
        });
    } catch (err) {
        util.errorHandler(err, res);
    }
});

router.post("/addremovecard", [admin], async (req, res) => {
    let cardID = req.body.cardid;
    let collID = req.body.collid;
    let action = req.body.action;

    let inCollection = false;
    let cardStatusQ = `
    SELECT * FROM collection_card
    WHERE card_id = ?
    AND collection_id = ?`;

    try {
        if (!parseInt(cardID) || !parseInt(collID) || !action || !(action == 1 || action == 0)) throw new createError.BadRequest();

        let cardStatusResult = await db.promise().query(cardStatusQ, [cardID, collID]);
        if (cardStatusResult[0].length > 0) inCollection = true;
    
        let query = action == 1 ? "DELETE FROM collection_card WHERE collection_id = ? AND card_id = ?;" : "INSERT INTO collection_card (collection_id, card_id) VALUES (?, ?);"
        if ((action == 0 && inCollection) || (action == 1 && !inCollection)) throw new createError.Conflict();
    
        let queryResult = await db.promise().query(query, [collID, cardID]);

        res.json({
        status: 200,
        message: "success"
        });
    } catch (err) {
        util.errorHandler(err, res);
    }
});


module.exports = router;

