const express = require("express");
const path = require("path");
const mysql = require('mysql2');

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

    const example = {
        name: "Roselia",
        image: "https://assets.tcgdex.net/en/swsh/swsh1/2/high.webp"
    }
    const data = [];

    for (let i=0; i < 10; i++){
        data.push(example);
    }
    
    const dataToPush = []

    // https://medium.com/@drdDavi/split-a-javascript-array-into-chunks-d90c90de3a2d
    for (let i = 0; i < data.length; i += rowSize) {
        const chunk = data.slice(i, i + rowSize);
        dataToPush.push(chunk);
    }
    // end of reference

    res.render("browse", {cards: dataToPush});
});

// card
app.get("/card", (req, res) => {
    cardData = [{
        name: "Roselia",
        set: "a set",
        category: "a category",
        evolves: "evolves",
        stage: "1",
        hp: 100,
        illustrator: "Me",
        image: "https://assets.tcgdex.net/en/swsh/swsh1/2/high.webp"
    }]
    res.render("card", {card : cardData});
});

app.listen(PORT, () => {
    console.log(`server listening on //localhost:${PORT}`);
})