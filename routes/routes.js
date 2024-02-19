const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const dotenv = require("dotenv"); // https://www.npmjs.com/package/dotenv#-install
const pokemon = require("pokemontcgsdk"); // https://github.com/PokemonTCG/pokemon-tcg-sdk-javascript

// setup dotenv and pokemon api
dotenv.config();
pokemon.configure({apiKey: process.env.TCG_KEY});

// establish db connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",         
    password: "root",         
    database: "trademon",
    port: "8889"
});

db.connect((err)=> {
    if(err) throw err;
    console.log('database connected successfully');
});

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
router.get("/browse", (req, res) => {
    const rowSize = 5;
    let data = [];

    let read = "SELECT card_id, name, image_url FROM card";
    db.query(read,(err, result) => {
        if(err) throw err;

        // https://medium.com/@drdDavi/split-a-javascript-array-into-chunks-d90c90de3a2d breaks cards into arrays of length rowSize
        for (let i = 0; i < result.length; i += rowSize) {
            const chunk = result.slice(i, i + rowSize);
            data.push(chunk);
        }
        // end of reference

        res.render("browse", {cards: data});
    });
});

router.post("/browse", (req, res) => {
    const rowSize = 5;
    let data = [];
    let searchName = `%${req.body.search}%`

    let read = `SELECT card_id, name, image_url FROM card WHERE name LIKE '${searchName}'`;
    db.query(read,(err, result) => {
        if(err) throw err;

        // https://medium.com/@drdDavi/split-a-javascript-array-into-chunks-d90c90de3a2d breaks cards into arrays of length rowSize
        for (let i = 0; i < result.length; i += rowSize) {
            const chunk = result.slice(i, i + rowSize);
            data.push(chunk);
        }
        // end of reference

        res.render("browse", {cards: data});
    });
});

// mycards
router.get("/mycards", async (req, res) => {
    const rowSize = 5;
    let cards = [];
    // default collection
    let collection = "all cards";
    let user_id = 1;
    let queryp = req.query.c;

    // if query parameter set collection = queryp
    if (queryp){
        collection = queryp;
    }

    // get collections to poulate drop down
    let collQ = 
    `SELECT collection_name FROM collection 
    INNER JOIN user_collection
    ON collection.collection_id = user_collection.collection_id
    WHERE user_collection.user_id = ${user_id}`;

    // get cards in current collection
    let cardQ = 
    `SELECT name, image_url FROM card 
    INNER JOIN collection_card
    ON collection_card.card_id = card.card_id
    INNER JOIN collection
    ON collection.collection_id = collection_card.collection_id
    INNER JOIN user_collection
    ON user_collection.collection_id = collection.collection_id
    WHERE user_collection.user_id = 1 AND collection.collection_name = "${collection}"`;

    let collections = await db.promise().query(collQ);
    collections = collections[0]

    db.query(cardQ,(err, result) => {
        if(err) throw err;

        // https://medium.com/@drdDavi/split-a-javascript-array-into-chunks-d90c90de3a2d
        for (let i = 0; i < result.length; i += rowSize) {
            const chunk = result.slice(i, i + rowSize);
            cards.push(chunk);
        }
        // end of reference

        res.render("mycards", {
            cards: cards,
            collections: collections});
    });

});

// card
router.get("/card/:cardId", (req, res) => {

    // get card id from the req
    let cardID = req.params.cardId;
    let read = `SELECT * FROM card WHERE card_id = ${cardID}`;

    // get card data from 
    db.query(read, async (err, result) => {
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

module.exports = router;
