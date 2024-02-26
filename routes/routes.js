const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const sessions = require("express-session");
const dotenv = require("dotenv"); // https://www.npmjs.com/package/dotenv#-install
const pokemon = require("pokemontcgsdk"); // https://github.com/PokemonTCG/pokemon-tcg-sdk-javascript

// establish db connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",         
    password: "root",         
    database: "40259713",
    port: "8889"
});

db.connect((err)=> {
    if(err) throw err;
    console.log('database connected successfully');
});

// define global row size
const rowSize = 5;

// perform a db query, slice and return
const cardsSearch = async (query, params) => {
    let cardResult = await db.promise().query(query, params);
    cardResult = cardResult[0];
    let sliced = [];

    // https://medium.com/@drdDavi/split-a-javascript-array-into-chunks-d90c90de3a2d breaks cards into arrays of length rowSize
    for (let i = 0; i < cardResult.length; i += rowSize) {
        const chunk = cardResult.slice(i, i + rowSize);
        sliced.push(chunk);
    }
    // end of reference
    return sliced;
}


// home page
router.get("/", (req, res) => {
    res.render("index");
});

// login
router.get("/login", (req, res) => {
    res.render("login");
});

// register
router.get("/register", (req, res) => {
    res.render("register");
});

// browse
router.get("/browse", async (req, res) => {
    let read = "SELECT card_id, name, image_url FROM card";
    let cards = await cardsSearch(read);
    res.render("browse", {cards: cards});
});

router.post("/browse", async (req, res) => {
    let searchName = `${req.body.search}`
    
    // order by from https://www.codexworld.com/how-to/sort-results-order-by-best-match-using-like-in-mysql/
    let read = `SELECT card_id, name, image_url FROM card 
                WHERE name 
                LIKE ?
                ORDER BY
                CASE
                    WHEN name LIKE ? THEN 1
                    WHEN name LIKE ? THEN 2
                    WHEN name LIKE ? THEN 4
                    ELSE 3
                END`;

    let cards = await cardsSearch(read, [`%${searchName}%`, `${searchName}`, `${searchName}%`, `%${searchName}`]);

    res.render("browse", {cards: cards});
});

router.get("/browse/:expansionId", async (req, res) => {
    let expansionID = req.params.expansionId;
    let read = `SELECT card_id, name, image_url FROM card
                INNER JOIN expansion
                ON expansion.expansion_id = card.expansion_id
                WHERE card.expansion_id = ?;`;
    let cards = await cardsSearch(read, [expansionID]);
    res.render("browse", {cards: cards});
});

// mycards
router.get("/mycards", async (req, res) => {
    const rowSize = 5;
    let user_id = 1;

    // get collections to populate drop down
    let collQ = 
    `SELECT collection.collection_id, collection_name FROM collection 
    INNER JOIN user_collection
    ON collection.collection_id = user_collection.collection_id
    WHERE user_collection.user_id = ${user_id}
    ORDER BY collection_name`;

    // get cards in current collection
    let cardQ = 
    `SELECT name, image_url FROM card 
    INNER JOIN collection_card
    ON collection_card.card_id = card.card_id
    INNER JOIN collection
    ON collection.collection_id = collection_card.collection_id
    INNER JOIN user_collection
    ON user_collection.collection_id = collection.collection_id
    WHERE user_collection.user_id = ${user_id} AND collection.collection_name = "all cards"`;

    let collections = await db.promise().query(collQ);
    collections = collections[0]

    let cards = await cardsSearch(cardQ);

    res.render("mycards", {
        cards: cards,
        collections: collections});

});

router.post("/mycards", async (req, res) => {
    let userId = 1;
    let collectionID = req.body.collid;

    // get collections to populate drop down
    let collQ = 
    `SELECT collection.collection_id, collection_name FROM collection 
    INNER JOIN user_collection
    ON collection.collection_id = user_collection.collection_id
    WHERE user_collection.user_id = ?
    ORDER BY collection_name`;

    // get cards in current collection
    let cardQ = 
    `SELECT name, image_url FROM card 
    INNER JOIN collection_card
    ON collection_card.card_id = card.card_id
    WHERE collection_card.collection_id = ?`;

    let collections = await db.promise().query(collQ, [userId]);
    collections = collections[0]

    let cards = await cardsSearch(cardQ, [collectionID]);

    res.render("mycards", {
        cards: cards,
        collections: collections});

});

// card
router.get("/card/:cardId", (req, res) => {

    // get card id from the req
    let cardID = req.params.cardId;
    let read = `SELECT * FROM card WHERE card_id = ?`;

    // get card data from 
    db.query(read, [cardID], async (err, result) => {
        // error checking
        if(err) throw err;
        if (result.length === 0) return res.redirect("/browse");

        // format card data and get price data
        let card = result[0]
        let response = await pokemon.card.find(card.tcg_id);

        // to fixed from https://www.tutorialspoint.com/How-to-format-a-number-with-two-decimals-in-JavaScript
        let price = response.cardmarket.prices.trendPrice.toFixed(2);
        let priceURL = response.cardmarket.url

        // prepare card data for rendering
        cardData = {
            name: card.name,
            set: "a set",
            expansion: "an expansion",
            category: "Pokemon",
            evolves: "evolves",
            stage: "Basic",
            hp: card.hp,
            illustrator: "Me",
            image: card.image_url,
            type: ["https://static.tcgcollector.com/content/images/90/d7/49/90d74923dfb481342fb5cb6c78e5fc6f6a8992cbd72a127d78af726c412a1bdc.png"],
            attack:[
                {
                    name: "Absorb",
                    effect: "Heal 10 damage from this Pokémon.",
                    damage: 10
                }
            ],
            price: price,
            priceURL: priceURL
        }

        res.render("card", {card : cardData});
    });
});

router.get("/expansions", async (req, res) => {
    let query = "SELECT * FROM expansion"
    let expansions = await cardsSearch(query)
    res.render("expansions", {expansions: expansions});
});

module.exports = router;
