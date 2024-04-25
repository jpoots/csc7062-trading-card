const express = require("express");
const router = express.Router();
const pokemon = require("pokemontcgsdk"); // https://github.com/PokemonTCG/pokemon-tcg-sdk-javascript
const createError = require("http-errors");
const db = require("../db");
const admin = require("../middleware/admin");
const util = require("../utility");

// getting a card or subset of cards
router.get("/cards", async (req, res) => {
    let cardQ = "";
    let searchName = "";
    let params = [];

    try {        
        if (req.query.search){
            searchName = `${req.query.search}`;

            // order by from https://www.codexworld.com/how-to/sort-results-order-by-best-match-using-like-in-mysql/
            cardQ = `
            SELECT card.*, COUNT(card_like_id) as "like_count" FROM card 
            LEFT JOIN card_like
            ON card_like.card_id = card.card_id
            WHERE name 
            LIKE ?
            GROUP BY card.card_id
            ORDER BY
            CASE
            WHEN name LIKE ? THEN 1
            WHEN name LIKE ? THEN 2
            WHEN name LIKE ? THEN 4
            ELSE 3
            END;`;
            params = [`%${searchName}%`, `${searchName}`, `${searchName}%`, `%${searchName}`];

        } else if (req.query.likedby){
            userID = req.query.likedby;
            if (!parseInt(userID)) throw new createError.BadRequest();

            cardQ =
            `SELECT card.*, COUNT(card_like.card_like_id) as "like_count" FROM card_like
            INNER JOIN card 
            ON card.card_id = card_like.card_id
            WHERE user_id = ?
            GROUP BY card.card_id
            ORDER BY name`;
            params = [userID];
        } else if (req.query.expansionid){
            if (!parseInt(req.query.expansionid)) throw new createError.BadRequest();

            cardQ = `
            SELECT card.*, COUNT(card_like_id) as "like_count" FROM card
            LEFT JOIN card_like
            ON card_like.card_id = card.card_id
            INNER JOIN expansion
            ON expansion.expansion_id = card.expansion_id
            WHERE card.expansion_id = ?
            GROUP BY card.card_id
            ORDER BY name`;
            params = [req.query.expansionid];
        } else if (req.query.minlikes){
            if (!parseInt(req.query.minlikes)) throw new createError.BadRequest();

            cardQ = `
            SELECT card.*, COUNT(card_like_id) as "like_count"
            FROM card
            LEFT JOIN card_like
            ON card_like.card_id = card.card_id
            GROUP BY card.card_id
            HAVING COUNT(card_like_id) >= ?
            ORDER BY COUNT(card_like_id)`;
            params = [req.query.minlikes];
        } else if (req.query.maxhp && req.query.minhp) {
            if (!parseInt(req.query.maxhp) || !parseInt(req.query.minhp)) throw new createError.BadRequest();

            cardQ = `
            SELECT card.*, COUNT(card_like_id) as "like_count"
            FROM card
            LEFT JOIN card_like
            ON card_like.card_id = card.card_id
            WHERE hp >= ?
            AND hp <= ?
            GROUP BY card.card_id
            ORDER BY hp`;
            params = [req.query.minhp, req.query.maxhp];
        } else if (req.query.typeid) {
            if (!parseInt(req.query.typeid)) throw new createError.BadRequest();

            cardQ = `
            SELECT card.*, COUNT(card_like_id) as "like_count" FROM type
            INNER JOIN type_card
            ON type.type_id = type_card.card_id
            INNER JOIN card
            ON card.card_id = type_card.card_id
            LEFT JOIN card_like
            ON card_like.card_id = card.card_id
            WHERE type.type_id = ?
            GROUP BY card.card_id
            ORDER BY name`;
            params = [req.query.typeid];
        } else {
            cardQ = `
            SELECT card.*, COUNT(card_like_id) as "like_count"
            FROM card
            LEFT JOIN card_like
            ON card_like.card_id = card.card_id
            GROUP BY card.card_id
            ORDER BY name;`;
        }

        let cards = await db.promise().query(cardQ, params);
        cards = cards[0];
        res.json({
            status: 200,
            message: "success",
            response: cards
        });

    } catch (err) {
        util.errorHandler(err, res);
    }
});

// getting an individual card
router.get("/cards/:cardid", async (req, res) => {
    let cardID = req.params.cardid;
    let liked = false;
    let evolveFrom = "N/A";

    let cardQ = `
    SELECT card.*, category_name, stage_name, expansion_name, illustrator_name
    FROM card 
    INNER JOIN illustrator
    ON illustrator.illustrator_id = card.illustrator_id
    INNER JOIN expansion
    ON expansion.expansion_id = card.expansion_id
    INNER JOIN category
    ON category.category_id = card.category_id
    INNER JOIN stage
    ON stage.stage_id = card.stage_id
    WHERE card.card_id = ?;`;

    let attackQ = `
    SELECT attack.* FROM attack
    INNER JOIN attack_card
    ON attack_card.attack_id = attack.attack_id
    INNER JOIN card
    ON card.card_id = attack_card.card_id
    WHERE card.card_id = ?;
    `

    let attackTypeQ = `
    SELECT type.*, multiplier FROM type
    INNER JOIN attack_type
    ON attack_type.type_id = type.type_id   
    WHERE attack_id = ?`

    let weaknessQ = `
    SELECT type.*, multiplier FROM weakness_card
    INNER JOIN type
    ON type.type_id = weakness_card.type_id
    WHERE card_id = ?;`

    let typeQ = `
    SELECT type_image
    FROM type
    INNER JOIN type_card
    ON type.type_id = type_card.type_id
    WHERE card_id = ?;`

    let likeCountQ = `
    SELECT COUNT(*) as "like_count" FROM card_like
    WHERE card_id = ?`;

    let likeStatusQ = `
    SELECT * FROM card_like
    WHERE card_id = ?
    AND user_id = ?
    `;

    try {
        let card = await db.promise().query(cardQ, [cardID])
        card = card[0];

        if (card.length === 0) throw new createError.NotFound();
        card = card[0];

    
        let likeCount = await db.promise().query(likeCountQ, [cardID]);
        likeCount = likeCount[0][0].like_count;
    
        let attacks = await db.promise().query(attackQ, [cardID]);
        attacks = attacks[0];

        let attackTypeResult;
        for (attackInd = 0; attackInd < attacks.length; attackInd++) {
            attackTypeResult = await db.promise().query(attackTypeQ, [attacks[attackInd].attack_id]);
            attacks[attackInd].types = attackTypeResult[0];
        }

        let weaknessResults = await db.promise().query(weaknessQ, [cardID]);
        weaknessResults = weaknessResults[0];
        
        let types = await db.promise().query(typeQ, [cardID]);
        types = types[0];

        let priceURL;
        let price;

        try {
            let priceResponse = await pokemon.card.find(card.tcg_id);
            price = priceResponse.cardmarket.prices.trendPrice.toFixed(2);
            priceURL = priceResponse.cardmarket.url;
        } catch (err) {
            priceURL = "";
            price = "Unavailable";
        } 
    
        if (card.evolve_from) evolveFrom = card.evolve_from;

        if (req.query.userid) {
            if (!parseInt(req.query.userid)) throw new createError.BadRequest();

            let likeResult = await db.promise().query(likeStatusQ, [cardID, req.query.userid]);
            likeResult = likeResult[0];
            if(likeResult.length > 0) liked = true;
        }
    
        cardData = {
            name: card.name,
            id: card.card_id,
            likeCount: likeCount,
            liked: liked,
            expansion: card.expansion_name,
            category: card.category_name,
            evolveFrom: evolveFrom,
            stage: card.stage_name,
            hp: card.hp,
            illustrator: card.illustrator_name,
            image: card.image_url,
            types: types,
            attacks: attacks,
            weakness: weaknessResults,
            price: price,
            priceURL: priceURL
        };

        res.json({
            status: 200,
            message: "success",
            response: cardData
        });

    } catch (err) {
        util.errorHandler(err, res);
    }
});

// liking a card
router.post("/likecard", [admin], async (req, res) => {
    let cardID = req.body.cardid;
    let userID = req.body.userid;

    let likeStatus = false;
    let likeStatusQ = `
    SELECT * FROM card_like
    WHERE card_id = ?
    AND user_id = ?`;

    try {
        if (!parseInt(cardID) || !parseInt(userID)) throw new createError.BadRequest();

        let likeStatusResult = await db.promise().query(likeStatusQ, [cardID, userID]);
        likeStatusResult = likeStatusResult[0];
        if (likeStatusResult.length === 1) likeStatus = true;
    
        let likeQ = !likeStatus ? "INSERT INTO card_like (card_id, user_id) VALUES (?, ?)" : "DELETE FROM card_like WHERE card_id = ? AND user_id = ?;" ;
        let likeResult = await db.promise().query(likeQ, [cardID, userID])

        res.json({
            status: 200,
            message: "success"
        });
    } catch (err) {
        util.errorHandler(err, res);
    }
});

module.exports = router;