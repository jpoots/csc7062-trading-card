const express = require("express");
const router = express.Router();
const dotenv = require("dotenv"); // https://www.npmjs.com/package/dotenv#-install
const axios = require("axios");
const querystring = require('querystring');
const slicer = require("../utility");

/* https://stackoverflow.com/questions/69879425/setting-dotenv-path-outside-of-root-directory-is-not-working */
dotenv.config({ path: "../.env" })
const API_ADD = process.env.API_ADDRESS;

// browse
router.get("/browse", async (req, res) => {
    try {
        let cardQuery = "";

        if (req.query.search){
            cardQuery = `${API_ADD}/cards?search=${req.query.search}`;
        } else {
            cardQuery = `${API_ADD}/cards`;
        }

        let cardResult = await axios.get(cardQuery);
    
        if (cardResult.data.status !== 200){
            res.render("error");
        } else {
            let cards = cardResult.data.response;
            cards = await slicer(cards);
        
            res.render("browse", {cards: cards});
        }
    } catch (err){
        res.render("error");
    }
});

// card
router.get("/card/:cardid", async (req, res) => {
    // get card id from the req
    let userID = req.session.userid;
    let cardID = req.params.cardid;
    let error = req.query.error;
    
    let collections = [];
    try {
        if (userID) {
            let collectionsResult = await axios.get(`${API_ADD}/collections?userid=${userID}`);
            if (collectionsResult.data.status != 200) throw new Error(collections.data.message);
            collections = collectionsResult.data.response;
        }
    
        let cardResult = await axios.get(API_ADD + `/cards/${cardID}?userid=${userID}`);
        
        if (cardResult.data.status != 200) throw new Error (cardResult.data.message);

        res.render("card", {
            card : cardResult.data.response,
            collections: collections,
            error: error
        });

    } catch (err){
        res.render("error");
    }

});

router.post("/likecard", async (req, res) => {
    if (!req.session.userid){
        res.redirect("/login");
    } else {
        let body = {
            cardid: req.body.cardid,
            userid: req.session.userid
        }

        try {
            body = querystring.stringify(body);

            let likeResult = await axios.post(`${API_ADD}/likecard`, body, formConfig);
            if (likeResult.data.status != 200) throw new Error(likeResult.data.message);
            
            res.redirect(`/card/${req.body.cardid}`);
        } catch {
            res.render("error");
        }
    }
});

router.get("/filter", async (req, res) => {
    try {
    // https://stackoverflow.com/questions/5223/length-of-a-javascript-object */https://stackoverflow.com/questions/5223/length-of-a-javascript-objects
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    if (Object.keys(req.query).length > 0) {
        let cardsResult = await axios.get(API_ADD + "/cards", {
            params: req.query
        });

        if (cardsResult.data.status != 200) throw new Error(cardsResult.data.message);

        let cards = await slicer(cardsResult.data.response);

        res.render("browse", {cards: cards});
    } else {

        let expansions = await axios.get(API_ADD + "/expansions");
        expansions = expansions.data.response;

        let types = await axios.get(API_ADD + "/types");
        types = types.data.response;

        /* http://localhost:3000/filter?filterby=hp&param=10 */        
        res.render("filter", {
        expansions: expansions,
        types: types
        });
    }
    } catch (error) {
        res.render("error");
    }
});

module.exports = router;

