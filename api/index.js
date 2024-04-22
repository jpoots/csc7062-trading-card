const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const pokemon = require("pokemontcgsdk"); // https://github.com/PokemonTCG/pokemon-tcg-sdk-javascript

const user = require("./routes/user")
const card = require("./routes/card");
const collection = require("./routes/collection")
const messaging = require("./routes/messaging");
const misc = require("./routes/misc");

// set up app
const app = express();
app.set('view engine', 'ejs');

// setup dotenv and pokemon api
dotenv.config();
pokemon.configure({apiKey: process.env.TCG_KEY});
const PORT = process.env.API_PORT;

// middleware and routes
app.use(express.urlencoded({ extended: true }));

app.use(user);
app.use(card);
app.use(collection);
app.use(messaging);
app.use(misc);

app.listen(PORT, () => {
    console.log(`server listening on //localhost:${PORT}`);
})