const express = require("express");
const router = express.Router();
const axios = require("axios");
const querystring = require('querystring');
const util = require("../utility");

// browse
router.get("/browse", async (req, res) => {
    try {
        let cardQuery = `${util.apiAdd}/cards`;

        if (req.query.search) cardQuery = `${cardQuery}?search=${req.query.search}`;
        
        let cardResult = await axios.get(cardQuery);
    
        if (cardResult.data.status !== 200){
            res.render("error", {
                status: cardResult.data.status,
                message: cardResult.data.message
            });
        } else {
            let cards = cardResult.data.response;
            cards = await util.slicer(cards);
        
            res.render("browse", {cards: cards});
        }

    } catch (err){
        let errorMessage = err instanceof util.SystemError ? err.message : util.defaultError;

        res.render("error", {
            message: errorMessage
        });
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
        let endpoint = `${util.apiAdd}/cards/${cardID}`
        if (userID) {
            let collectionsResult = await axios.get(`${util.apiAdd}/collections?userid=${userID}`);

            if (collectionsResult.data.status != 200) throw new util.SystemError(`${collections.data.status} ${collections.data.message}`);
            collections = collectionsResult.data.response;
            endpoint = `${endpoint}?userid=${userID}`;
        }
        
        let cardResult = await axios.get(endpoint);

        if (cardResult.data.status != 200) throw new util.SystemError(`${cardResult.data.status} ${cardResult.data.message}`);

        res.render("card", {
            card : cardResult.data.response,
            collections: collections,
            error: error
        });

    } catch (err){
        util.errorHandler(err, res);
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

            let likeResult = await axios.post(`${util.apiAdd}/likecard`, body);
            if (likeResult.data.status != 200) throw new util.SystemError(`${likeResult.data.status} ${likeResult.data.message}`);
            
            res.redirect(`/card/${req.body.cardid}`);
        } catch (err) {
            util.errorHandler(err, res);
        }
    }
});

router.get("/filter", async (req, res) => {
    try {
    // https://stackoverflow.com/questions/5223/length-of-a-javascript-object */https://stackoverflow.com/questions/5223/length-of-a-javascript-objects
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    if (Object.keys(req.query).length > 0) {
        let cardsResult = await axios.get(util.apiAdd + "/cards", {
            params: req.query
        });

        if (cardsResult.data.status != 200) throw new util.SystemError(`${cardsResult.data.status} ${cardsResult.data.message}`);

        let cards = await util.slicer(cardsResult.data.response);

        res.render("browse", {cards: cards});
    } else {

        let expansions = await axios.get(util.apiAdd + "/expansions");
        expansions = expansions.data.response;

        let types = await axios.get(util.apiAdd + "/types");
        types = types.data.response;

        let illustrators = await axios.get(util.apiAdd + "/illustrators");
        illustrators = illustrators.data.response;

        /* http://localhost:3000/filter?filterby=hp&param=10 */        
        res.render("filter", {
        expansions: expansions,
        types: types,
        illustrators: illustrators
        });
    }
    } catch (err) {
        util.errorHandler(err, res);
    }
});

router.get("/compare", async (req, res) => {
    let cards = await axios.get(`${util.apiAdd}/cards`)
    let cardOneID = req.query.cardoneid;
    let cardTwoID = req.query.cardtwoid;
    
    if (cardOneID && cardTwoID) {
        try {
            let cardOne = await axios.get(`${util.apiAdd}/cards/${cardOneID}`);
            let cardTwo = await axios.get(`${util.apiAdd}/cards/${cardTwoID}`);
    
            if (cardOne.data.status != 200) throw new util.SystemError(`${cardOne.data.status} ${cardOne.data.message}`);
            if (cardTwo.data.status != 200) throw new util.SystemError(`${cardTwo.data.status} ${cardTwo.data.message}`);
    
            cardOne = cardOne.data.response;
            cardTwo = cardTwo.data.response;
    
            res.render("comparison", {
                cardOne: cardOne,
                cardTwo: cardTwo
            });
        } catch (err) {
            util.errorHandler(err, res);
        }

    } else {
        res.render("compare", {
            cards: cards.data.response
        });
    }
});

module.exports = router;

