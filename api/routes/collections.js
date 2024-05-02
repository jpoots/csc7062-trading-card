const express = require("express");
const router = express.Router();
const db = require("../serverfuncs/db");
const admin = require("../middleware/admin");
const createError = require("http-errors");

// gets all collections
router.get("/", async (req, res, next) => {
    let collectionQ = "";
    let searchName = "";
    let params = [];

    try {

        if (req.query.search) {
            searchName = `${req.query.search}`
            // order by from https://www.codexworld.com/how-to/sort-results-order-by-best-match-using-like-in-mysql/
            collectionQ = `
            SELECT collection.collection_id, collection_name, display_name, avatar_url, ROUND(AVG(rating)) as "rating"
            FROM collection 
            INNER JOIN user
            ON user.user_id = collection.user_id
            LEFT JOIN collection_rating
            ON collection.collection_id = collection_rating.collection_id
            WHERE collection_name
            LIKE ?
            GROUP BY collection.collection_id
            ORDER BY
            CASE
                WHEN collection_name LIKE ? THEN 1
                WHEN collection_name LIKE ? THEN 2
                WHEN collection_name LIKE ? THEN 4
                ELSE 3
            END;`;
            params = [`%${searchName}%`, `${searchName}`, `${searchName}%`, `%${searchName}`];
        } else {
            collectionQ = `
            SELECT collection.collection_id, collection_name, display_name, avatar_url , ROUND(AVG(rating)) as "rating"
            FROM collection 
            INNER JOIN user
            ON user.user_id = collection.user_id
            LEFT JOIN collection_rating
            ON collection.collection_id = collection_rating.collection_id
            GROUP BY collection.collection_id;`;
        }

        let collections = await db.promise().query(collectionQ, params);
        collections = collections[0];
    
        res.json({
            status: 200,
            message: "success",
            response: collections
        });
    } catch (err) {
        next(err);
    }
});

// gets a specific collection. Accepts a user ID to determine ownership
router.get("/:collid", async (req, res, next) => {
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
    SELECT card.card_id, name, image_url, card_number, COUNT(card_like_id) as "like_count" FROM collection_card
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
    SELECT ROUND(AVG(rating)) as "rating" FROM collection_rating
    WHERE collection_id = ?;
    `;

    let commentQ = `
    SELECT comment_text, display_name, DATE_FORMAT(time_posted, '%d/%m/%Y') as "date", TIME_FORMAT(time_posted, '%H:%i') as "time"
    FROM collection_comment
    INNER JOIN user
    ON collection_comment.user_id = user.user_id
    WHERE collection_id = ?
    ORDER BY time_posted DESC;`;

    let youRatedQ = `
    SELECT * FROM collection_rating
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
        rating = ratingResult[0][0].rating;
        
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
        next(err);
    };

});

// adds a collection rating. Takes a user ID and rating.
router.post("/:collid/ratings", [admin], async (req, res, next) => {
    let userID = req.body.userid;
    let collID = req.params.collid;
    let rating = req.body.rating;

    let ratingStatusQ = `SELECT * FROM collection_rating WHERE user_id = ? AND collection_id = ?`;

    let collectionQ = `SELECT * FROM collection WHERE collection_id = ?`;
    let userQ = `SELECT * FROM user WHERE user_id = ?`;

    let rateQ = "INSERT INTO collection_rating (user_id, collection_id, rating) VALUES (?, ?, ?)";

    try {
        // business rules
        if (!parseInt(userID) || !parseInt(collID)) throw new createError.BadRequest();
        if (rating && (!parseInt(rating) || rating > 4 || rating < 1)) throw new createError.BadRequest();

        let ratingStatusResult = await db.promise().query(ratingStatusQ, [userID, collID]);
        if (ratingStatusResult[0].length === 1) throw new createError.Conflict();  

        let user = await db.promise().query(userQ, [userID]);
        if (user[0].length === 0) throw new createError.NotFound();

        let collection = await db.promise().query(collectionQ, collID);
        if(collection[0].length === 0) throw new createError.NotFound();
        
        collection = collection[0][0];
        if(collection.user_id == userID) throw new createError.BadRequest();

        let ratingResult = await db.promise().query(rateQ, [userID, collID, rating]);

        res.json({
            status: 200,
            message: "success"
        });
    } catch (err) {
        next(err);
    }
});

// removes a rating
router.delete("/:collid/ratings/:userid", [admin], async (req, res, next) => {
    let userID = req.params.userid;
    let collID = req.params.collid;

    let checkRatingQ = `SELECT * FROM collection_rating WHERE collection_id = ? AND user_id = ?`;

    let rateQ = "DELETE FROM collection_rating WHERE collection_id = ? AND user_id = ?";

    try {
        if (!parseInt(userID) || !parseInt(collID)) throw new createError.BadRequest();
        let rating = await db.promise().query(checkRatingQ, [collID, userID]);
        if (rating[0].length === 0) throw new createError.NotFound();

        let ratingResult = await db.promise().query(rateQ, [collID, userID]);

        res.json({
            status: 200,
            message: "success"
        });
    } catch (err) {
        next(err);
    }
});

// adds a comment to a collection. Takes a user ID and comment body
router.post("/:collid/comments", [admin], async (req, res, next) => {
    let collID = req.params.collid;
    let comment = req.body.comment;
    let userID = req.body.userid;

    let commentQ = `INSERT INTO collection_comment (comment_text, collection_id, user_id) VALUES (?, ?, ?);`;
    let userQ = `SELECT * FROM user WHERE user_id = ?`;
    let collectionQ = `SELECT * FROM collection WHERE collection_id = ?`;

    try {
        if (!parseInt(collID) || !parseInt(userID) || !comment || comment.trim().length === 0 || comment.length > 200) throw new createError.BadRequest();

        let collection = await db.promise().query(collectionQ, [collID]);
        if (collection[0].length === 0) throw new createError.NotFound();

        let user = await db.promise().query(userQ, [userID]);
        if (user[0].length === 0) throw new createError.NotFound();

        let commentResult = await db.promise().query(commentQ, [comment, collID, userID]);

        res.json({
            status: 200,
            message: "success"
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;