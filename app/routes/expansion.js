const express = require("express");
const router = express.Router();
const axios = require("axios");
const util = require("../serverfuncs/utility");

// get the cards in a specific expansion
router.get("/expansions/:expansionid", async (req, res, next) => {
    let expansionID = req.params.expansionid;

    try {
        let cards = await axios.get(`${util.apiAdd}/cards?expid=${expansionID}`);
        if (cards.data.status != 200) throw new util.SystemError(`${cards.data.status} ${cards.data.message}`);

        cards = await util.slicer(cards.data.response);
        res.render("browse", {cards: cards});
    } catch (err) {
        next(err);
    }
});

// get all expansion
router.get("/expansions", async (req, res, next) => {
    let endPoint = `${util.apiAdd}/expansions`;

    if (req.query.search) endPoint = `${endPoint}?search=${req.query.search}`

    try {
        let expansions = await axios.get(endPoint);
        if (expansions.data.status != 200) throw new util.SystemError(`${expansions.data.status} ${expansions.data.message}`);

        expansions = expansions.data.response;
        expansions = await util.slicer(expansions);
        res.render("expansions", {expansions: expansions});
    } catch (err) {
        next(err);
    }
});

module.exports = router;