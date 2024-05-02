const express = require("express");
const router = express.Router();
const db = require("../../serverfuncs/db");
const createError = require("http-errors");

// gets the cards liked by a user
router.get("/:userid/likedcards", async (req, res, next) => {
    let userID = req.params.userid;
    let userQ = `SELECT * FROM user WHERE user_id = ?`;

    let cardQ =
    `SELECT card.*, COUNT(card_like.card_like_id) as "like_count" FROM card_like
    INNER JOIN card 
    ON card.card_id = card_like.card_id
    WHERE user_id = ?
    GROUP BY card.card_id
    ORDER BY name`;


    try {
        if (!parseInt(userID)) throw new createError.BadRequest();

        let user = await db.promise().query(userQ, [userID]);
        if (user[0].length === 0) throw new createError.NotFound();

        let cards = await db.promise().query(cardQ, [userID]);

        res.json({
            status: 200,
            message: "success",
            response: cards[0]
        });

    } catch (err) {
        next (err);
    }
});

module.exports = router;