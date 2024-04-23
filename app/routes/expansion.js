const express = require("express");
const router = express.Router();
const dotenv = require("dotenv"); // https://www.npmjs.com/package/dotenv#-install
const axios = require("axios");
const slicer = require("../utility");

/* https://stackoverflow.com/questions/69879425/setting-dotenv-path-outside-of-root-directory-is-not-working */
dotenv.config({ path: "../.env" })
const API_ADD = process.env.API_ADDRESS;

router.get("/expansions/:expansionid", async (req, res) => {
    let expansionID = req.params.expansionid;

    try {
        let cards = await axios.get(`${API_ADD}/cards?expansionid=${expansionID}`);
        if (cards.data.status != 200) throw new Error(cards.data.message);

        cards = await slicer(cards.data.response);
        res.render("browse", {cards: cards});
    } catch (error) {
        res.render("error");
    }
});

router.get("/expansions", async (req, res) => {

    try {
        let expansions = await axios.get(`${API_ADD}/expansions`);
        if (expansions.data.status != 200) throw new Error(expansions.data.message);

        expansions = expansions.data.response;
        expansions = await slicer(expansions);
        res.render("expansions", {expansions: expansions});
    } catch {
        res.render("error");
    }
});

module.exports = router;