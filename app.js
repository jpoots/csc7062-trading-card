const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const pokemon = require("pokemontcgsdk");

// set up app
const app = express();
app.set('view engine', 'ejs');
const PORT = 3000;

// css and images
app.use(express.static(path.join(__dirname, "./public")));

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

// homepage
app.get("/", (req, res) => {
    res.render("index");
});

// login
app.get("/login", (req, res) => {
    res.render("login");
});

// register
app.get("/register", (req, res) => {
    res.render("register");
});

// browse
app.get("/browse", (req, res) => {
    const rowSize = 5;
    let data = [];

    let read = "SELECT card_id, name, image_url FROM card";
    db.query(read,(err, result) => {
        if(err) throw err;

        // https://medium.com/@drdDavi/split-a-javascript-array-into-chunks-d90c90de3a2d
        for (let i = 0; i < result.length; i += rowSize) {
            const chunk = result.slice(i, i + rowSize);
            data.push(chunk);
        }
        // end of reference

        res.render("browse", {cards: data});
    });


});

// card
app.get("/card/:cardId", (req, res) => {
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
        let response = await fetch(`https://api.pokemontcg.io/v2/cards/${card.tcg_id}`);
        response = await response.json();
        let price = response.data.cardmarket.prices.trendPrice;;
        let priceURL = response.data.cardmarket.url

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

app.listen(PORT, () => {
    console.log(`server listening on //localhost:${PORT}`);
})