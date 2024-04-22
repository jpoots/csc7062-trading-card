const express = require("express");
const router = express.Router();
const pokemon = require("pokemontcgsdk"); // https://github.com/PokemonTCG/pokemon-tcg-sdk-javascript
const db = require("../db")
const auth = require("../middleware/auth");
const admin = require("../middleware/admin")

router.get("/cards", [auth, admin], async (req, res) => {
    let cardQ = "";
    let searchName = "";
    let params = [];

    if (req.query.search){
        searchName = `${req.query.search}`

        // order by from https://www.codexworld.com/how-to/sort-results-order-by-best-match-using-like-in-mysql/
        cardQ = `
        SELECT card.card_id, name, image_url, COUNT(card_like_id) as "like_count" FROM card 
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
        cardQ =
        `SELECT card_like.card_id, name, image_url, COUNT(card_like.card_like_id) as "like_count" FROM card_like
        INNER JOIN card 
        ON card.card_id = card_like.card_id
        WHERE user_id = ?
        GROUP BY card.card_id
        ORDER BY name;`;
        params = [userID];
    } else if (req.query.expansionid){
        cardQ = `
        SELECT card.card_id, name, image_url, COUNT(card_like_id) as "like_count" FROM card
        LEFT JOIN card_like
        ON card_like.card_id = card.card_id
        INNER JOIN expansion
        ON expansion.expansion_id = card.expansion_id
        WHERE card.expansion_id = ?
        GROUP BY card.card_id
        ORDER BY name;`;
        params = [req.query.expansionid]
    } else if (req.query.minlikes){
        cardQ = `
        SELECT card.card_id, name, image_url, COUNT(card_like_id) as "like_count"
        FROM card
        LEFT JOIN card_like
        ON card_like.card_id = card.card_id
        GROUP BY card.card_id
        HAVING COUNT(card_like_id) >= ?
        ORDER BY COUNT(card_like_id)
        `
        params = [req.query.minlikes]
    } else if (req.query.maxhp && req.query.minhp) {
        cardQ = `
        SELECT card.card_id, name, image_url, COUNT(card_like_id) as "like_count"
        FROM card
        LEFT JOIN card_like
        ON card_like.card_id = card.card_id
        WHERE hp >= ?
        AND hp <= ?
      	GROUP BY card.card_id
        ORDER BY hp`;

        params = [req.query.minhp, req.query.maxhp]
    } else if (req.params.typeid) {
        cardQ = `
        SELECT card.card_id, name, image_url, COUNT(card_like_id) as "like_count"
        FROM card
        LEFT JOIN card_like
        ON card_like.card_id = card.card_id
        WHERE hp >= ?
        AND hp <= ?
      	GROUP BY card.card_id
        ORDER BY hp `
        params = [req.params.typeid];
    } else {
        cardQ = `
        SELECT card.card_id, tcg_id, name, image_url, COUNT(card_like_id) as "like_count"
        FROM card
        LEFT JOIN card_like
        ON card_like.card_id = card.card_id
        GROUP BY card.card_id
        ORDER BY name;`;
    }

    try {
        let cards = await db.promise().query(cardQ, params);
        cards = cards[0];

        res.json({
            status: 200,
            message: "success",
            response: cards
        })

    } catch (err) {
        res.json({
            status: 400,
            message: "failure"
        })
    }
});

router.get("/cards/:cardid", [auth], async (req, res) => {
    let cardID = req.params.cardid;
    let userID = req.query.userid;

    let liked = false;
    let evolveFrom = "N/A";

    let cardQ = `
    SELECT name, card.card_id, hp, card.tcg_id, category_name, stage_name, illustrator_name, image_url, expansion_name, evolve_from
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
    SELECT attack_name, effect, damage FROM attack
    INNER JOIN attack_card
    ON attack_card.attack_id = attack.attack_id
    INNER JOIN card
    ON card.card_id = attack_card.card_id
    WHERE card.card_id = ?;
    `
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
        card = card[0][0];
    
        let likeCount = await db.promise().query(likeCountQ, [cardID]);
        likeCount = likeCount[0][0].like_count;
    
        let attacks = await db.promise().query(attackQ, [cardID]);
        attacks = attacks[0];
    
        let types = await db.promise().query(typeQ, [cardID]);
        types = types[0];

        let priceResponse = await pokemon.card.find(card.tcg_id);
        let price = priceResponse.cardmarket.prices.trendPrice.toFixed(2);
        let priceURL = priceResponse.cardmarket.url
    
        if (card.evolve_from) evolveFrom = card.evolve_from;
    
        if (req.query.userid){
            let likeResult = await db.promise().query(likeStatusQ, [cardID, userID]);
            likeResult = likeResult[0]
    
            if(likeResult.length > 0) liked = true;
        }
    
        cardData = {
            name: card.name,
            cardID: card.card_id,
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
            price: price,
            priceURL: priceURL
        }
    
        res.json({
            status: 200,
            message: "success",
            response: cardData
        })
    } catch (error) {
        res.json({
            status: 400,
            message: "failure",
        });
    }

});

router.post("/likecard", [auth, admin], async (req, res) => {
    let cardID = req.body.cardid;
    let userID = req.body.userid;

    let likeStatus = false;
    let likeStatusQ = 
    `
    SELECT * FROM card_like
    WHERE card_id = ?
    AND user_id = ?
    `
    try {
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
        res.json({
            status: 400,
            message: "failure"
        });
    }
});

module.exports = router;