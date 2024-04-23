const express = require("express");
const router = express.Router();
const axios = require("axios");
const util = require("../utility");

router.get("/expansions/:expansionid", async (req, res) => {
    let expansionID = req.params.expansionid;

    try {
        let cards = await axios.get(`${util.apiAdd}/cards?expansionid=${expansionID}`);
        if (cards.data.status != 200) throw new util.SystemError(`${cards.data.status} ${cards.data.message}`);

        cards = await util.slicer(cards.data.response);
        res.render("browse", {cards: cards});
    } catch (err) {
        util.errorHandler(err, res);
    }
});

router.get("/expansions", async (req, res) => {

    try {
        let expansions = await axios.get(`${util.apiAdd}/expansions`);
        if (expansions.data.status != 200) throw new util.SystemError(`${expansions.data.status} ${expansions.data.message}`);

        expansions = expansions.data.response;
        expansions = await util.slicer(expansions);
        res.render("expansions", {expansions: expansions});
    } catch (err) {
        util.errorHandler(err, res);
    }
});

module.exports = router;