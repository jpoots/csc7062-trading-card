const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const pokemon = require("pokemontcgsdk"); // https://github.com/PokemonTCG/pokemon-tcg-sdk-javascript
const auth = require("../middleware/auth");
const errHandler = require("../middleware/err");
const router = require("./routes")

// set up app
const app = express();
app.set('view engine', 'ejs');

// setup dotenv and pokemon api
dotenv.config({ path: "../.env" });
pokemon.configure({apiKey: process.env.TCG_KEY});
const PORT = process.env.API_PORT;

// middleware and routes
app.use(express.urlencoded({ extended: true }));
app.use(auth);

app.use(router);

app.use(errHandler);

app.listen(PORT, () => {
    console.log(`server listening on //localhost:${PORT}`);
})